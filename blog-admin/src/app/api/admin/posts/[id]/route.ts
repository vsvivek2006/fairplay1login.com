import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/postsStore';
import { requireAdminAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (err: unknown) {
    console.error('[GET /api/admin/posts/[id]] Error:', err);
    const msg = err instanceof Error ? err.message : 'Error fetching post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const body = await req.json();

    // Normalize field aliases before passing to updatePost
    const normalized = {
      ...body,
      // Handle cover_image alias
      cover_image: body.cover_image || body.cover_image_url || undefined,
      // Ensure seo fields are populated
      seo_title: body.seo_title || body.meta_title || body.title || undefined,
      seo_description: body.seo_description || body.meta_description || body.excerpt || undefined,
      // Map excerpt from seo_description if missing
      excerpt: body.excerpt || body.seo_description || body.meta_description || undefined,
    };

    const updated = await updatePost(id, normalized);
    return NextResponse.json({ post: updated });
  } catch (err: unknown) {
    console.error('[PUT /api/admin/posts/[id]] Error:', err);
    const msg = err instanceof Error ? err.message : 'Error updating post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAdminAuth(req);
  if (unauth) return unauth;

  try {
    const { id } = await params;
    const success = await deletePost(id);
    if (!success) {
      return NextResponse.json({ error: 'Post not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[DELETE /api/admin/posts/[id]] Error:', err);
    const msg = err instanceof Error ? err.message : 'Error deleting post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
