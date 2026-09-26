import { NextRequest, NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/aiBlogGenerator';
import { sanitizeAiErrorMessage } from '@/lib/ai/safeError';
import { SITE_CONFIG } from '@/config/site';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  return NextResponse.json({
    hasGroqKey: Boolean(process.env.GROQ_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    defaultProvider: process.env.GROQ_API_KEY ? 'groq' : (process.env.GEMINI_API_KEY ? 'gemini' : null),
  });
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const body = await req.json();

    if (!body.topic || !body.focusKeyword) {
      return NextResponse.json(
        { error: 'Both "topic" and "focusKeyword" are required.' },
        { status: 400 }
      );
    }

    const targetDomain = body.domain || body.target_site || SITE_CONFIG.domain || 'fairplaylive.io';
    const targetSiteName = body.siteName || SITE_CONFIG.name || 'FairPlay Live';

    const generated = await generateBlogPost({
      siteName: targetSiteName,
      domain: targetDomain,
      target_site: targetDomain,
      topic: body.topic,
      focusKeyword: body.focusKeyword,
      secondaryKeywords: body.secondaryKeywords,
      category: body.category || 'Cricket Betting',
      wordCount: body.wordCount || 1000,
      apiKey: body.apiKey,
      provider: body.provider,
      model: body.model,
    });

    return NextResponse.json({ blog: generated });
  } catch (err: unknown) {
    console.error('[API generate-blog Error]:', err instanceof Error ? err.message : err);
    const msg = sanitizeAiErrorMessage(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
