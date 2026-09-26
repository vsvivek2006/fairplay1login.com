/**
 * Groq Provider for FairPlay AI Blog Generation
 *
 * Architecture ported from Growth-Service/src/lib/ai/providers/groq.ts.
 * Same retry logic, same safeParseJson, same structured-output schema usage.
 * Output shape adapted to FairPlay's GeneratedBlogResponse (adds slug,
 * excerpt, category, tags, coverImage, author fields).
 */

import Groq from 'groq-sdk';
import { buildBlogPostPrompt, blogPostResponseSchema } from '../prompts/blogPost';
import { normalizeContentToHtml, htmlToMarkdown } from '../contentFormatter';
import { getValidModel } from '../models';
import { slugify, optimizeSeoSlug, selectRandomCoverImage } from '../../aiBlogGeneratorHelpers';
import type { GenerationRequest, GeneratedBlogResponse } from '@/types';
import { SITE_CONFIG } from '@/config/site';
import { sanitizeAiErrorMessage, extractKeywordsList } from '../safeError';

let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
    groqInstance = new Groq({ apiKey: apiKey.trim().replace(/^["']|["']$/g, '') });
  }
  return groqInstance;
}

/** Retry on transient Groq errors (429 rate-limit, 502/503 server errors). */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  const RETRIABLE = [429, 502, 503];
  const BACKOFF_MS = [1000, 3000];
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number }).status;
      if (!status || !RETRIABLE.includes(status) || attempt === maxRetries) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, BACKOFF_MS[attempt] ?? 3000));
    }
  }
  throw lastError;
}

export async function generateBlogPostWithGroq(
  req: GenerationRequest
): Promise<GeneratedBlogResponse> {
  const groq = getGroqClient();

  const keywords = extractKeywordsList(req.focusKeyword, req.secondaryKeywords);

  const prompt = buildBlogPostPrompt({
    topic: req.topic,
    keywords,
    wordCount: req.wordCount ?? 1200,
    category: req.category ?? 'Cricket Betting',
    tone: 'Authoritative & Conversational',
    audience:
      'Indian cricket fans, sports bettors, and online casino players looking for a trusted exchange platform',
  });

  const model = getValidModel(req.model);

  try {
    const completion = await withRetry(() =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (groq.chat.completions.create as any)({
        messages: [
          {
            role: 'system',
            content:
              'You are a seasoned human editorial director and iGaming content strategist with 15+ years of live cricket betting experience. You write with deep analytical substance, natural burstiness, and zero detectable AI clichés or synthetic filler. Output strictly valid JSON matching the requested schema. The content field MUST be clean, valid semantic HTML with rich visual hierarchy (h2, h3, p, ul, ol, li, strong, em, blockquote). Never output markdown code blocks or commentary around the JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model,
        // Raised well past what a 1200-word HTML post needs.
        max_completion_tokens: 8000,
        // Schema-guaranteed JSON via constrained decoding
        response_format: { type: 'json_schema', json_schema: blogPostResponseSchema },
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;

    const choice = completion.choices[0];
    const raw = choice?.message?.content;

    if (choice?.finish_reason === 'length') {
      console.error(
        '[FairPlay AI] Groq response truncated (finish_reason: length) — consider raising max_completion_tokens.',
        { model }
      );
    }

    if (!raw) {
      throw new Error('No content returned from AI provider');
    }

    const parsed = safeParseJson(raw);
    return buildGeneratedResponse(parsed, req, `Groq (${model})`);
  } catch (err: unknown) {
    console.error('[FairPlay AI] Generation failed:', err instanceof Error ? err.message : err);
    throw new Error(sanitizeAiErrorMessage(err));
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ParsedBlogResponse {
  title?: string;
  metaDescription?: string;
  excerpt?: string;
  slug?: string;
  category?: string;
  content?: string;
  suggestedTags?: string[];
}

function safeParseJson(raw: string): ParsedBlogResponse {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    // Repair attempt for truncated JSON — kept as a safety net.
    let repaired = cleaned;
    if (!repaired.endsWith('}')) {
      const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        repaired += '"';
      }
      repaired += '}';
    }
    try {
      return JSON.parse(repaired);
    } catch {
      // Robust regex extraction fallback
      const title = repaired.match(/"title"\s*:\s*"([^"]+)"/)?.[1] || '';
      const metaDescription = repaired.match(/"metaDescription"\s*:\s*"([^"]+)"/)?.[1] || '';
      const contentMatch = repaired.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"suggestedTags"|"$)/);
      const content = contentMatch
        ? contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
        : '';
      return { title, metaDescription, content, suggestedTags: [] };
    }
  }
}

function buildGeneratedResponse(
  parsed: ParsedBlogResponse,
  req: GenerationRequest,
  modelUsed: string
): GeneratedBlogResponse {
  const domain = req.domain || SITE_CONFIG.domain;
  const focusKeyword = req.focusKeyword;

  const rawSlug = parsed.slug || slugify(parsed.title || focusKeyword);
  const cleanSlug = optimizeSeoSlug(rawSlug, focusKeyword);

  // Normalize, clean and convert content to human-readable Markdown paragraphs for the editor
  const formattedHtml = normalizeContentToHtml(parsed.content || '');
  const contentParagraphs = htmlToMarkdown(formattedHtml);

  const title = parsed.title?.trim() || `${focusKeyword}: The Complete Guide`;
  const seoTitle = title.length <= 60 ? title : title.substring(0, 57) + '...';
  const seoDescription =
    parsed.metaDescription?.trim() ||
    `Read the complete guide to ${focusKeyword} on FairPlay Live. Register via WhatsApp and claim your 300% welcome bonus.`;
  const excerpt =
    parsed.excerpt?.trim() ||
    (contentParagraphs[0]
      ? contentParagraphs[0].replace(/<[^>]+>/g, '').slice(0, 200) + '...'
      : '');

  return {
    title,
    slug: cleanSlug,
    seoTitle,
    seoDescription,
    excerpt,
    category: parsed.category?.trim() || req.category || 'Cricket Betting',
    content: contentParagraphs,
    htmlContent: formattedHtml,
    tags:
      Array.isArray(parsed.suggestedTags) && parsed.suggestedTags.length > 0
        ? parsed.suggestedTags.map((t: unknown) => String(t).trim()).filter(Boolean)
        : [focusKeyword, 'FairPlay ID', 'Cricket Betting', 'Instant Withdrawal'],
    coverImage: selectRandomCoverImage(),
    author: 'FairPlay Sports Desk',
    modelUsed,
  };
}
