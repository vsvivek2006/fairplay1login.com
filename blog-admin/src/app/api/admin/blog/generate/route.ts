import { NextRequest, NextResponse } from 'next/server';
import { generateBlogPost } from '@/lib/ai/generateBlogPost';
import { requireAdminAuth } from '@/lib/auth';
import { withIdempotency } from '@/lib/idempotency';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Enforce admin authentication guard
  const unauth = await requireAdminAuth(request);
  if (unauth) return unauth;

  try {
    const idempotencyKey =
      request.headers.get('idempotency-key') ||
      request.headers.get('x-idempotency-key');

    const body = await request.json();
    const { topic, tone, keywords, wordCount, audience, category, model } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const safeTopic = String(topic).slice(0, 500);
    const safeTone = tone ? String(tone).slice(0, 100) : undefined;
    const safeAudience = audience ? String(audience).slice(0, 200) : undefined;
    const safeCategory = category ? String(category).slice(0, 100) : undefined;
    const safeModel = model ? String(model).slice(0, 100) : undefined;
    const safeWordCount =
      typeof wordCount === 'number'
        ? Math.min(Math.max(Math.round(wordCount), 200), 3000)
        : undefined;
    const safeKeywords = Array.isArray(keywords)
      ? keywords.slice(0, 10).map((k: unknown) => String(k).slice(0, 60))
      : undefined;

    // Use client key or derive a topic-based idempotency key
    const key =
      idempotencyKey ||
      body.idempotency_key ||
      `ai-${safeTopic.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}`;

    const result = await withIdempotency(key, async () => {
      const generated = await generateBlogPost({
        topic: safeTopic,
        tone: safeTone,
        keywords: safeKeywords,
        wordCount: safeWordCount,
        audience: safeAudience,
        category: safeCategory,
        model: safeModel,
      });

      return {
        statusCode: 200,
        data: generated,
      };
    });

    const headers: Record<string, string> = {};
    if (result.isReplay) {
      headers['X-Idempotent-Replay'] = 'true';
    }

    return NextResponse.json(result.data, { status: result.statusCode, headers });
  } catch (err: unknown) {
    const errorObj = err as any;
    if (errorObj?.isConcurrentConflict) {
      return NextResponse.json({ error: errorObj.message }, { status: 409 });
    }
    console.error('[admin/blog/generate] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate blog post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
