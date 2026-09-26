import Link from 'next/link';
import { PlusCircle, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { getAllPosts } from '@/lib/postsStore';
import { PostTable } from '@/components/admin/PostTable';
import type { PostSummary } from '@/lib/validations/post';

export const revalidate = 0; // Always fresh list directly from Supabase

export default async function AdminDashboardPage() {
  const posts = await getAllPosts('all', false, 'fairplay1login.com');

  const postList: PostSummary[] = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    meta_description: p.seo_description || p.excerpt || '',
    cover_image_url: p.cover_image || '',
    author: p.author || 'FairPlay Desk',
    category: p.category || 'Cricket Betting',
    tags: p.tags || [],
    status: p.status === 'published' ? 'published' : 'draft',
    source: (p.source as 'manual' | 'ai' | 'ai-edited') || 'manual',
    published_at: p.published_at,
    created_at: p.created_at,
    updated_at: p.updated_at || p.created_at,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              FairPlay Articles
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
              Live CMS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage, draft, edit, AI-generate, and publish blog articles live on fairplay1login.com.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://fairplay1login.com'}/blogs/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-gray-800/80 border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Visit Live Blog</span>
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>

          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-black shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-black" />
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* Main Post Table with Search, Filter Tabs, Delete Modal */}
      <PostTable initialPosts={postList} />
    </div>
  );
}
