import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost } from '@/lib/postsStore';
import { requireAdminAuth } from '@/lib/auth';
import { withIdempotency } from '@/lib/idempotency';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Defense-in-depth in-route authorization guard
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = (searchParams.get('status') || 'all') as 'all' | 'published' | 'draft';
    const siteParam = searchParams.get('site') || 'fairplay1login.com';
    const posts = await getAllPosts(statusParam, false, siteParam);
    return NextResponse.json(
      { posts },
      {
        headers: {
          'Cache-Control': 'private, no-cache, stale-while-revalidate=30',
        },
      }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch posts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Defense-in-depth in-route authorization guard
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const idempotencyKey =
      req.headers.get('idempotency-key') ||
      req.headers.get('x-idempotency-key');

    const body = await req.json();

    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 });
    }

    const key = idempotencyKey || body.idempotency_key || null;

    const result = await withIdempotency(key, async () => {
      const seoTitle = body.seo_title || body.meta_title || body.title;
      const seoDescription =
        body.seo_description || body.meta_description || body.excerpt || body.title;
      const excerpt = body.excerpt || seoDescription;

      const post = await createPost({
        slug: body.slug,
        title: body.title,
        excerpt,
        content: body.content || '',
        cover_image: body.cover_image || body.cover_image_url || null,
        author: body.author || 'FairPlay Desk',
        category: body.category || 'Cricket Betting',
        status: body.status || 'draft',
        ai_generated: Boolean(body.ai_generated),
        target_site: body.target_site || 'fairplay1login.com',
        seo_title: seoTitle,
        seo_description: seoDescription,
        tags: body.tags || [],
        published_at:
          body.status === 'published' ? body.published_at || new Date().toISOString() : null,
      });

      return {
        statusCode: 201,
        data: { post },
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
    const msg = err instanceof Error ? err.message : 'Failed to create post';
    const isDuplicateSlug =
      msg.includes('duplicate key') ||
      msg.includes('already exists') ||
      msg.includes('fairplay_posts_slug_key');
    if (isDuplicateSlug) {
      return NextResponse.json(
        { error: 'An article with this slug already exists. Please modify the slug.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
