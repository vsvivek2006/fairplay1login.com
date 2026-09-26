'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import slugify from 'slugify';
import { toast } from 'sonner';
import {
  Save,
  Send,
  Trash2,
  Loader2,
  Lock,
  Unlock,
  Sparkles,
  PenTool,
  Info,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { postSchema, type PostInput, type PostRecord } from '@/lib/validations/post';
import { ImageUpload } from './ImageUpload';
import { TagInput } from './TagInput';
import { AIGeneratorPanel } from './AIGeneratorPanel';
import { ConfirmDialog } from './ConfirmDialog';
import type { GenerateBlogPostOutput } from '@/lib/ai/generateBlogPost';

function getDraftKey(postId?: string) {
  return `fairplay-blog-draft-${postId ?? 'new'}`;
}

const TiptapEditor = dynamic(
  () => import('./TiptapEditor').then((mod) => mod.TiptapEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[350px] w-full rounded-xl border border-gray-800 bg-[#0E1424] p-6 flex flex-col items-center justify-center text-gray-500 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-[#d4af37] mb-2" />
        <span className="text-xs font-medium">Loading rich text editor...</span>
      </div>
    ),
  }
);

interface PostEditorProps {
  initialData?: PostRecord | null;
}

export function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);
  const [editorMode, setEditorMode] = useState<'manual' | 'ai'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialData?.slug));
  const [isAiGenerated, setIsAiGenerated] = useState(
    initialData?.source === 'ai' || initialData?.source === 'ai-edited'
  );
  const [originalAiContent, setOriginalAiContent] = useState<string | null>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const draftKey = getDraftKey(initialData?.id);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      meta_description: initialData?.meta_description || initialData?.excerpt || '',
      cover_image_url: initialData?.cover_image_url || initialData?.cover_image || '/images/blog-cricket-betting-exchange.jpg',
      author: initialData?.author || 'FairPlay Sports Desk',
      category: initialData?.category || 'Cricket Betting',
      tags: initialData?.tags || ['Cricket Betting', 'Fairplay Login'],
      status: initialData?.status || 'draft',
      source: initialData?.source || 'manual',
    },
  });

  const titleValue = watch('title');
  const slugValue = watch('slug');
  const contentValue = watch('content');
  const metaDescriptionValue = watch('meta_description') || '';

  // Warn if leaving page with unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting && !isDeleting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting, isDeleting]);

  // Autosave to localStorage (debounced 1.5s)
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            title: titleValue,
            content: contentValue,
            meta_description: metaDescriptionValue,
            slug: slugValue,
          })
        );
      } catch {
        // storage quota exceeded
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isDirty, draftKey, titleValue, contentValue, metaDescriptionValue, slugValue]);

  // Draft recovery banner
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as { savedAt: string };
      const draftDate = new Date(draft.savedAt);
      const dbDate = initialData?.updated_at ? new Date(initialData.updated_at) : null;
      if (!dbDate || draftDate > dbDate) {
        setShowDraftBanner(true);
      } else {
        localStorage.removeItem(draftKey);
      }
    } catch {
      // ignore
    }
  }, [draftKey, initialData?.updated_at]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue('title', newTitle, { shouldValidate: true, shouldDirty: true });
    if (!isSlugCustomized) {
      const generatedSlug = slugify(newTitle, { lower: true, strict: true });
      setValue('slug', generatedSlug, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleAiGenerated = (output: GenerateBlogPostOutput) => {
    setValue('title', output.title, { shouldValidate: true, shouldDirty: true });
    const generatedSlug = output.slug || slugify(output.title, { lower: true, strict: true });
    setValue('slug', generatedSlug, { shouldValidate: true, shouldDirty: true });
    setValue('meta_description', output.metaDescription, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue('content', output.content, { shouldValidate: true, shouldDirty: true });
    setValue('tags', output.suggestedTags, { shouldValidate: true, shouldDirty: true });
    setValue('source', 'ai', { shouldDirty: true });
    setValue('status', 'draft', { shouldDirty: true });

    setIsAiGenerated(true);
    setOriginalAiContent(output.content);
    setIsSlugCustomized(false);
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (isSubmitting || isDeleting) return;

    // Immediately lock submission to prevent double-click race conditions
    setIsSubmitting(true);
    setValue('status', targetStatus);

    const onValid = async (formData: PostInput) => {
      const actionLabel = targetStatus === 'published' ? 'Publishing' : 'Saving draft';
      const toastId = toast.loading(`${actionLabel}...`, {
        description: 'Saving directly to Supabase fairplay_posts.',
      });

      try {
        let finalSource = formData.source;
        if (isAiGenerated) {
          if (originalAiContent && contentValue !== originalAiContent) {
            finalSource = 'ai-edited';
          } else if (!formData.source || formData.source === 'manual') {
            finalSource = 'ai';
          }
        }

        const seoTitle = formData.title;
        const seoDescription = formData.meta_description || formData.title;

        const payload = {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: seoDescription,
          seo_title: seoTitle,
          seo_description: seoDescription,
          cover_image: formData.cover_image_url || '/images/blog-cricket-betting-exchange.jpg',
          author: formData.author,
          category: formData.category || 'Cricket Betting',
          tags: formData.tags,
          status: targetStatus,
          ai_generated: isAiGenerated,
          target_site: 'fairplay1login.com',
          published_at: targetStatus === 'published' ? new Date().toISOString() : null,
        };

        const idempotencyKey = isEditing && initialData?.id
          ? `update-${initialData.id}-${Date.now().toString(36)}`
          : `create-${formData.slug}-${Date.now().toString(36)}`;

        let response;
        if (isEditing && initialData?.id) {
          response = await fetch(`/api/admin/posts/${initialData.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(payload),
          });
        } else {
          response = await fetch('/api/admin/posts', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(payload),
          });
        }

        const data = await response.json();

        if (!response.ok || data.error) {
          toast.error('Failed to save post', {
            id: toastId,
            description: data.error || 'Server error',
          });
          return;
        }

        toast.success(
          targetStatus === 'published'
            ? 'Post published successfully!'
            : 'Draft saved successfully!',
          {
            id: toastId,
            description:
              targetStatus === 'published'
                ? 'Your article is now live on fairplay1login.com.'
                : 'Your changes have been saved to the database.',
          }
        );

        try {
          localStorage.removeItem(draftKey);
        } catch {
          // ignore
        }

        router.push('/');
        router.refresh();
      } catch (err: unknown) {
        toast.error('Unexpected error saving post', {
          id: toastId,
          description: err instanceof Error ? err.message : 'Please check connection.',
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const onInvalid = () => {
      setIsSubmitting(false);
      toast.error('Validation Error', {
        description: 'Please check that title, slug, and content are filled properly.',
      });
    };

    await handleSubmit(onValid, onInvalid)();
  };

  const handleConfirmDelete = async () => {
    if (!initialData?.id || isDeleting) return;

    setIsDeleting(true);
    const toastId = toast.loading('Deleting post from database...');

    try {
      const response = await fetch(`/api/admin/posts/${initialData.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        toast.error('Failed to delete post', {
          id: toastId,
          description: data.error,
        });
        return;
      }

      toast.success('Post deleted successfully', {
        id: toastId,
        description: 'Article permanently removed from Supabase.',
      });
      setIsConfirmDeleteOpen(false);
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Unexpected error deleting post', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-24 sm:pb-8">
      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Blog Post?"
        description={`Are you sure you want to delete "${
          titleValue || 'this post'
        }"? This action cannot be undone.`}
        confirmLabel="Delete Post"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-700/50 bg-blue-950/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-xs text-blue-200">
              <span className="font-bold text-white">Unsaved draft recovered.</span> You have a locally autosaved version newer than database save.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                try {
                  const raw = localStorage.getItem(draftKey);
                  if (!raw) return;
                  const draft = JSON.parse(raw) as {
                    title?: string;
                    content?: string;
                    meta_description?: string;
                    slug?: string;
                  };
                  if (draft.title) setValue('title', draft.title, { shouldDirty: true });
                  if (draft.slug) setValue('slug', draft.slug, { shouldDirty: true });
                  if (draft.content) setValue('content', draft.content, { shouldDirty: true });
                  if (draft.meta_description)
                    setValue('meta_description', draft.meta_description, { shouldDirty: true });
                  toast.success('Draft restored into editor.');
                } catch {
                  toast.error('Could not restore draft.');
                }
                setShowDraftBanner(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(draftKey);
                setShowDraftBanner(false);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      {!isEditing && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0E1424] border border-gray-800 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorMode('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                editorMode === 'manual'
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Write Manually
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                editorMode === 'ai'
                  ? 'bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Generate with AI
            </button>
          </div>

          <span className="text-[11px] text-gray-400 hidden sm:inline px-3">
            {editorMode === 'ai'
              ? 'AI generates structured editorial copy directly into Tiptap editor.'
              : 'Write or paste formatted content directly.'}
          </span>
        </div>
      )}

      {/* AI Assistant Drawer */}
      {editorMode === 'ai' && !isEditing && (
        <AIGeneratorPanel onGenerated={handleAiGenerated} disabled={isSubmitting} />
      )}

      {/* Desktop Sticky Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-gray-800 bg-[#0E1424]/95 sticky top-4 z-20 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            {isEditing ? 'Editing Article' : 'Draft Article'}
          </span>
          {initialData?.status && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                initialData.status === 'published'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
              }`}
            >
              {initialData.status === 'published' ? 'Live' : 'Draft'}
            </span>
          )}
          {isAiGenerated && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#d4af37]" />
              AI Sourced
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isEditing && slugValue && (
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://fairplay1login.com'}/blogs/${slugValue}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors border border-gray-700"
            >
              <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
              Preview Live
            </a>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              disabled={isDeleting || isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#d4af37]" />
            )}
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-black shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <Send className="w-3.5 h-3.5 text-black" />
            )}
            Publish Post
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Post Title <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-gray-400">
                {(titleValue || '').length} characters
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Fairplay Live Cricket Betting Guide: Exchange Odds & Strategy"
              value={titleValue || ''}
              onChange={handleTitleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0E1424] border border-gray-700 text-white text-base sm:text-lg font-bold placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsSlugCustomized(!isSlugCustomized)}
                className="text-xs text-[#d4af37] hover:text-[#f3e5ab] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isSlugCustomized ? (
                  <>
                    <Lock className="w-3 h-3" />
                    Locked Custom Slug
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3 text-[#d4af37]" />
                    Auto-Generating Slug
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs text-gray-400 font-mono select-none">
                /blog/
              </span>
              <input
                type="text"
                placeholder="fairplay-cricket-betting-guide"
                {...register('slug')}
                onChange={(e) => {
                  setIsSlugCustomized(true);
                  const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                  setValue('slug', clean, { shouldValidate: true, shouldDirty: true });
                }}
                className="w-full pl-16 pr-4 py-2.5 rounded-xl bg-[#0E1424] border border-gray-700 text-xs sm:text-sm text-[#f3e5ab] font-mono placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
              />
            </div>
            {errors.slug && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.slug.message}</p>
            )}
          </div>

          {/* Rich Tiptap Editor */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Post Content <span className="text-rose-400">*</span>
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  content={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
            {errors.content && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Metadata Sidebar */}
        <div className="space-y-5">
          {/* Cover Image */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-800 bg-[#0E1424] space-y-2.5 shadow-sm">
            <label className="block text-xs font-semibold text-gray-300">
              Cover Image Asset
            </label>
            <Controller
              name="cover_image_url"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
              )}
            />
          </div>

          {/* Meta Description */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-800 bg-[#0E1424] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-300">
                SEO Meta Description
              </label>
              <span
                className={`text-[11px] font-mono font-semibold ${
                  metaDescriptionValue.length >= 120 && metaDescriptionValue.length <= 160
                    ? 'text-emerald-400'
                    : metaDescriptionValue.length > 160
                    ? 'text-rose-400'
                    : 'text-gray-400'
                }`}
              >
                {metaDescriptionValue.length}/160
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Brief summary for search engines (120-160 characters recommended)..."
              {...register('meta_description')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800/80 border border-gray-700 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all resize-none"
            />
          </div>

          {/* Tags */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-800 bg-[#0E1424] space-y-2 shadow-sm">
            <label className="block text-xs font-semibold text-gray-300">
              Taxonomy &amp; Tags
            </label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagInput
                  tags={field.value || []}
                  onChange={(tags) => field.onChange(tags)}
                />
              )}
            />
          </div>

          {/* Author */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-800 bg-[#0E1424] space-y-2 shadow-sm">
            <label className="block text-xs font-semibold text-gray-300">
              Public Byline
            </label>
            <input
              type="text"
              placeholder="FairPlay Sports Desk"
              {...register('author')}
              className="w-full px-3.5 py-2 rounded-xl bg-gray-800/80 border border-gray-700 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-all"
            />
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1">
              <Info className="w-3 h-3 text-[#d4af37] shrink-0" />
              Public byline displayed to readers on the article page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
