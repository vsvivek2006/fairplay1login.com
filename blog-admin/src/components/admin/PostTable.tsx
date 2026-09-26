'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  Loader2,
  FileText,
  PlusCircle,
  X,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PostRecord, PostSummary } from '@/lib/validations/post';
import { ConfirmDialog } from './ConfirmDialog';

interface PostTableProps {
  initialPosts: PostSummary[];
}

export function PostTable({ initialPosts }: PostTableProps) {
  const [posts, setPosts] = useState<PostSummary[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });

  // Calculate counts for filter pills
  const counts = useMemo(() => {
    return {
      all: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      draft: posts.filter((p) => p.status === 'draft').length,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        (post.author && post.author.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ? true : post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  const handleDeleteTrigger = (id: string, title: string) => {
    setConfirmDelete({
      isOpen: true,
      id,
      title,
    });
  };

  const handleConfirmDelete = async () => {
    const { id, title } = confirmDelete;
    if (!id) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error('Failed to delete post', { description: data.error });
        return;
      }

      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Post deleted successfully', {
        description: `"${title}" has been permanently removed.`,
      });
      setConfirmDelete({ isOpen: false, id: '', title: '' });
    } catch {
      toast.error('Unexpected error deleting post');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Blog Post?"
        description={`Are you sure you want to permanently delete "${confirmDelete.title}"?`}
        confirmLabel="Delete Post"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: '', title: '' })}
      />

      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0E1424] border border-gray-800 shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'published', 'draft'] as const).map((filter) => {
            const count = counts[filter];
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#d4af37] text-black font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-black/20 text-black font-black'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, slug, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-gray-800/80 border border-gray-700 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#d4af37] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-gray-800 bg-[#0E1424] overflow-hidden shadow-sm">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 text-gray-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-[#d4af37]" />
            </div>
            <h3 className="text-sm font-bold text-white">No articles found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchQuery
                ? `No posts matched your search for "${searchQuery}".`
                : 'No posts in this status category.'}
            </p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#d4af37] text-black hover:bg-[#b89628] transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-[#121829] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4 sm:px-6">Article</th>
                  <th className="py-3 px-4 hidden md:table-cell">Status</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Byline &amp; Tags</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {filteredPosts.map((post) => {
                  const isDeletingThis = deletingId === post.id;
                  const dateStr = post.published_at || post.created_at;
                  const displayDate = dateStr
                    ? new Date(dateStr).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Title & Slug */}
                      <td className="py-4 px-4 sm:px-6 max-w-md">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="font-bold text-sm text-white hover:text-[#f3e5ab] transition-colors line-clamp-2"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                            <span>/blog/{post.slug}/</span>
                            {post.source === 'ai' || post.source === 'ai-edited' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/30 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" />
                                AI
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            post.status === 'published'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {post.status === 'published' ? 'Live' : 'Draft'}
                        </span>
                      </td>

                      {/* Byline & Tags */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-300">
                            {post.author || 'FairPlay Desk'}
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] text-gray-400 bg-gray-800/80 px-1.5 py-0.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-[10px] text-gray-500">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 hidden sm:table-cell text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          <span>{displayDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Preview Button */}
                          <a
                            href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://fairplay1login.com'}/blogs/${post.slug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            title="Preview on live site"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                          </a>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                            title="Edit article"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTrigger(post.id, post.title)}
                            disabled={isDeletingThis}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete article"
                          >
                            {isDeletingThis ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
