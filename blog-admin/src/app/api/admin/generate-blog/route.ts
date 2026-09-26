import { NextRequest, NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/aiBlogGenerator';
import { sanitizeAiErrorMessage } from '@/lib/ai/safeError';
import { SITE_CONFIG } from '@/config/site';
import { requireAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

    const defaultDomain = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : (SITE_CONFIG.domain || 'fairplay1login.com');
    const targetDomain = body.domain || body.target_site || defaultDomain;
    const targetSiteName = body.siteName || process.env.NEXT_PUBLIC_SITE_NAME || SITE_CONFIG.name || 'FairPlay';

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
