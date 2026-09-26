/**
 * FairPlay AI Blog Generator — Main Entry Point
 *
 * Prompt engineering, HTML formatting, and Groq provider logic now live in
 * src/lib/ai/ (ported from Growth-Service/src/lib/ai/).
 *
 * This file:
 *  - Wires the new structured Groq provider as the primary path.
 *  - Keeps Gemini as a fallback (raw fetch, same prompt).
 *  - Re-exports helpers (slugify, selectRandomCoverImage, etc.) for
 *    backward compatibility with existing imports in the app.
 */

import { GenerationRequest, GeneratedBlogResponse } from '@/types';
import { SITE_CONFIG } from '@/config/site';
import { generateBlogPostWithGroq } from './ai/providers/groq';
import { normalizeContentToHtml, htmlToMarkdown } from './ai/contentFormatter';
import { buildBlogPostPrompt } from './ai/prompts/blogPost';

import { sanitizeAiErrorMessage, extractKeywordsList } from './ai/safeError';

// Re-export helpers so existing imports like:
//   import { slugify, selectRandomCoverImage } from '@/lib/aiBlogGenerator'
// keep working without changes.
export {
  slugify,
  optimizeSeoSlug,
  selectRandomCoverImage,
  CURATED_COVER_IMAGES,
} from './aiBlogGeneratorHelpers';

// Re-export model registry so UI components can import from the same place
export { AVAILABLE_MODELS, getValidModel, DEFAULT_MODEL_ID } from './ai/models';
export type { AIModelOption } from './ai/models';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Primary generator — executes the selected model directly without fallback loops.
 */
export async function generateBlogPost(req: GenerationRequest): Promise<GeneratedBlogResponse> {
  const groqKey = req.apiKey?.startsWith('gsk_') ? req.apiKey : process.env.GROQ_API_KEY;
  const geminiKey =
    req.apiKey && !req.apiKey.startsWith('gsk_') ? req.apiKey : process.env.GEMINI_API_KEY;

  const isGeminiRequested = req.provider === 'gemini' || req.model?.startsWith('gemini');

  // Explicit Gemini request
  if (isGeminiRequested) {
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }
    return await generateWithGemini(req, geminiKey, req.model);
  }

  // Primary: Groq (uses the requested model directly)
  if (groqKey) {
    return await generateBlogPostWithGroq(req);
  }

  // Secondary: Gemini if only Gemini key is available
  if (geminiKey) {
    return await generateWithGemini(req, geminiKey, req.model);
  }

  throw new Error('AI service configuration missing. Please configure GROQ_API_KEY in server environment.');
}

// ---------------------------------------------------------------------------
// Gemini — single direct execution (no fallback models)
// ---------------------------------------------------------------------------

async function generateWithGemini(
  req: GenerationRequest,
  apiKey: string,
  preferredModel?: string
): Promise<GeneratedBlogResponse> {
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const domain = req.domain || SITE_CONFIG.domain;

  const keywords = extractKeywordsList(req.focusKeyword, req.secondaryKeywords);

  const prompt = buildBlogPostPrompt({
    topic: req.topic,
    keywords,
    wordCount: req.wordCount ?? 1200,
    category: req.category ?? 'Cricket Betting',
  });

  const model = preferredModel || 'gemini-3.7-flash';

  try {
    // Pass API key securely via header so it is never exposed in URL query string
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': cleanKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: 'You are a seasoned human editorial director and iGaming content strategist. Output strictly valid JSON matching the schema in the user prompt. The content field must be clean semantic HTML.',
            },
          ],
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.82,
          top_p: 0.9,
        },
      }),
    });

    if (!res.ok) {
      throw { status: res.status, message: `Gemini service error (${res.status})` };
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response returned from AI provider');
    }

    const cleaned = candidateText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    return buildGeminiResponse(parsed, req, domain, `Gemini (${model})`);
  } catch (err: unknown) {
    console.error('[FairPlay AI] Gemini generation failed:', err instanceof Error ? err.message : err);
    throw new Error(sanitizeAiErrorMessage(err));
  }
}

function buildGeminiResponse(
  parsed: Record<string, unknown>,
  req: GenerationRequest,
  domain: string,
  modelUsed: string
): GeneratedBlogResponse {
  const { slugify, optimizeSeoSlug, selectRandomCoverImage } = require('./aiBlogGeneratorHelpers');

  const focusKeyword = req.focusKeyword;
  const rawSlug = String(parsed.slug || slugify(String(parsed.title || focusKeyword)));
  const cleanSlug = optimizeSeoSlug(rawSlug, focusKeyword);

  const rawHtml =
    typeof parsed.content === 'string'
      ? parsed.content
      : Array.isArray(parsed.content)
        ? (parsed.content as unknown[]).map(String).join('\n\n')
        : '';
  const formattedHtml = normalizeContentToHtml(rawHtml);
  const contentParagraphs = htmlToMarkdown(formattedHtml);

  const title = String(parsed.title || `${focusKeyword}: The Complete Guide`).trim();

  return {
    title,
    slug: cleanSlug,
    seoTitle: String(parsed.seoTitle || title).trim().substring(0, 60),
    seoDescription: String(
      parsed.metaDescription ||
        parsed.seoDescription ||
        `Read the complete guide to ${focusKeyword} on FairPlay Live.`
    ).trim(),
    excerpt: String(
      parsed.excerpt ||
        (contentParagraphs[0]
          ? contentParagraphs[0].replace(/<[^>]+>/g, '').slice(0, 200) + '...'
          : '')
    ).trim(),
    category: String(parsed.category || req.category || 'Cricket Betting').trim(),
    content: contentParagraphs,
    tags: Array.isArray(parsed.suggestedTags)
      ? (parsed.suggestedTags as unknown[]).map((t) => String(t).trim()).filter(Boolean)
      : [focusKeyword, 'FairPlay ID', 'Cricket Betting', 'Instant Withdrawal'],
    coverImage: selectRandomCoverImage(),
    author: 'FairPlay Sports Desk',
    modelUsed,
  };
}
