import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/postsStore';
import { PostEditor } from '@/components/admin/PostEditor';
import type { PostRecord } from '@/lib/validations/post';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const postRecord: PostRecord = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: Array.isArray(post.content) ? post.content.join('\n\n') : String(post.content || ''),
    meta_description: post.seo_description || post.excerpt || '',
    cover_image_url: post.cover_image || '',
    author: post.author || 'FairPlay Sports Desk',
    category: post.category || 'Cricket Betting',
    tags: post.tags || [],
    status: post.status === 'published' ? 'published' : 'draft',
    source: (post.source as 'manual' | 'ai' | 'ai-edited') || 'manual',
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at || post.created_at,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
        <Link
          href="/"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800 transition-colors cursor-pointer"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Edit Blog Post</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
              FairPlay Live
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Modify article content, cover image, and SEO metadata. Changes persist directly to Supabase.
          </p>
        </div>
      </div>

      <PostEditor initialData={postRecord} />
    </div>
  );
}
