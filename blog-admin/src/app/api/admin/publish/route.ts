import { NextRequest, NextResponse } from 'next/server';
import { publishPost, getPostById } from '@/lib/postsStore';
import { requireAdminAuth } from '@/lib/auth';
import { withIdempotency } from '@/lib/idempotency';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const idempotencyKey =
      req.headers.get('idempotency-key') ||
      req.headers.get('x-idempotency-key');

    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const key = idempotencyKey || body.idempotency_key || null;

    const result = await withIdempotency(key, async () => {
      const post = await getPostById(id);
      if (!post) {
        const notFoundErr: any = new Error('Post not found');
        notFoundErr.statusCode = 404;
        throw notFoundErr;
      }

      const published = await publishPost(id);

      // Trigger on-demand ISR revalidation
      try {
        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${post.slug}`);
      } catch {}

      return {
        statusCode: 200,
        data: { success: true, post: published },
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
    if (errorObj?.statusCode === 404) {
      return NextResponse.json({ error: errorObj.message }, { status: 404 });
    }
    const msg = err instanceof Error ? err.message : 'Error publishing post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
