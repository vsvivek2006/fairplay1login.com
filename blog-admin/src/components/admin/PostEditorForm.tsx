'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BlogPost, GeneratedBlogResponse } from '@/types';
import { SITE_CONFIG, TARGET_SITES } from '@/config/site';
import AssetPickerModal from '@/components/admin/AssetPickerModal';
import { selectRandomCoverImage, slugify } from '@/lib/aiBlogGenerator';
import ArticleContentRenderer from '@/components/blog/ArticleContentRenderer';
import { htmlToMarkdown, normalizeContentToHtml, hasHtmlTags } from '@/lib/ai/contentFormatter';
import {
  Sparkles,
  Save,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Loader2,
  ExternalLink,
  List,
  Quote,
  Wand2,
  Table,
  HelpCircle,
  Check,
  Clock,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AVAILABLE_MODELS } from '@/lib/ai/models';

const AI_MODEL_OPTIONS = AVAILABLE_MODELS.map((m) => ({
  id: m.id,
  name: m.name,
  provider: m.provider === 'Google' ? ('gemini' as const) : ('groq' as const),
  badge: m.badge,
  desc: m.description,
  contextWindow: m.contextWindow,
  speed: m.speed,
}));

const GENERATION_STAGES = [
  'Analyzing topic and search intent...',
  'Structuring headings and beginner-friendly guide...',
  'Writing in-depth match odds & strategy breakdown...',
  'Creating instant deposit and cashout comparison table...',
  'Formatting WhatsApp FAQ accordion for players...',
  'Polishing Google search preview and tags...',
];

interface PostEditorFormProps {
  initialPost?: BlogPost | null;
  isNew?: boolean;
}

export default function PostEditorForm({ initialPost, isNew = false }: PostEditorFormProps) {
  const router = useRouter();

  // Target platform (strictly fairplay1login.com)
  const selectedSiteKey = 'fairplay1login.com';
  const targetSite = TARGET_SITES['fairplay1login.com'] || {
    id: 'fairplay1login.com',
    name: 'FairPlay',
    domain: 'fairplay1login.com',
    url: 'https://fairplay1login.com',
    badge: 'fairplay1login.com',
    badgeColor: 'amber',
    description: 'Live Cricket Exchange & Casino Gaming',
    liveBlogsUrl: 'https://fairplay1login.com/blogs/',
  };

  // Form states
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [category, setCategory] = useState(initialPost?.category || 'Cricket Betting');
  const [coverImage, setCoverImage] = useState<string | null>(
    initialPost?.cover_image || selectRandomCoverImage()
  );
  const [author, setAuthor] = useState(initialPost?.author || 'FairPlay Desk');
  const [tagsInput, setTagsInput] = useState((initialPost?.tags || []).join(', '));
  const [seoTitle, setSeoTitle] = useState(initialPost?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialPost?.seo_description || '');

  // Content state
  const initialContentString = useMemo(() => {
    if (!initialPost?.content) return '';
    const raw = Array.isArray(initialPost.content) ? initialPost.content.join('\n\n') : String(initialPost.content);
    if (hasHtmlTags(raw)) {
      return htmlToMarkdown(normalizeContentToHtml(raw)).join('\n\n');
    }
    return raw;
  }, [initialPost]);

  const [content, setContent] = useState(initialContentString);
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialPost?.status === 'published' ? 'published' : 'draft'
  );

  // UI states
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    url?: string;
  } | null>(null);

  // Inline AI Generator states
  const [aiTopic, setAiTopic] = useState('');
  const [aiFocusKeyword, setAiFocusKeyword] = useState('');
  const [aiSecondaryKeywords, setAiSecondaryKeywords] = useState('');
  const [aiSelectedModel, setAiSelectedModel] = useState('openai/gpt-oss-120b');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Interactive Live Generation Progress states
  const [generationStageIndex, setGenerationStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (aiGenerating) {
      setElapsedSeconds(0);
      setGenerationStageIndex(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setGenerationStageIndex((prev) => (prev + 1) % GENERATION_STAGES.length);
      }, 1800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [aiGenerating]);

  // Auto-generate slug from title if new
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isNew && (!slug || slug === slugify(title))) {
      setSlug(slugify(newTitle));
    }
  };

  // Word count & read time (stripping HTML tags if present for accurate count)
  const wordCount = useMemo(() => {
    const clean = content.replace(/<[^>]+>/g, ' ');
    return clean.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const readTime = useMemo(() => {
    return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  }, [wordCount]);

  // Toolbar action helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('blog-content-area') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || 'text';
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const insertFaqBlock = () => {
    const faqTemplate = `\n\n## Frequently Asked Questions (FAQ)\n\n### How fast can I get my FairPlay ID on WhatsApp?\nYou can receive your verified WhatsApp login credentials within 2 minutes by contacting our 24/7 official desk.\n\n### What is the minimum deposit on FairPlay?\nThe minimum deposit starts at ₹100 with instant PhonePe, Google Pay, Paytm, and UPI support.\n\n### Are withdrawals instant?\nYes, FairPlay provides guaranteed 2-minute cashouts directly to your bank account or UPI.\n`;
    setContent((prev) => prev.trim() + faqTemplate);
    toast.success('Added FAQ Accordion');
  };

  const insertTableBlock = () => {
    const tableTemplate = `\n\n| Feature | FairPlay VIP | Standard Bookmakers |\n| :--- | :--- | :--- |\n| Withdrawal Speed | 2 Minutes Instant | 24 - 48 Hours |\n| Minimum Deposit | ₹100 | ₹500 - ₹1000 |\n| Welcome Bonus | 300% Bonus | 50% - 100% |\n| Support Channel | 24/7 WhatsApp VIP Desk | Email Tickets |\n`;
    setContent((prev) => prev.trim() + tableTemplate);
    toast.success('Added Comparison Table');
  };

  const handleFormatToMarkdown = () => {
    if (!content.trim()) return;
    if (hasHtmlTags(content)) {
      const formatted = htmlToMarkdown(normalizeContentToHtml(content)).join('\n\n');
      setContent(formatted);
      toast.success('Converted HTML tags to clean Markdown!');
    } else {
      toast.info('Content is already in clean Markdown format.');
    }
  };

  // Handle AI generation inline
  const handleGenerateAI = async () => {
    setAiError(null);

    if (!aiTopic.trim()) {
      const err = 'Please enter what you want to write about.';
      setAiError(err);
      toast.error(err);
      return;
    }
    if (!aiFocusKeyword.trim()) {
      const err = 'Please enter a Main Topic / Keyword.';
      setAiError(err);
      toast.error(err);
      return;
    }

    const chosenModelConfig =
      AI_MODEL_OPTIONS.find((m) => m.id === aiSelectedModel) || AI_MODEL_OPTIONS[0];

    setAiGenerating(true);

    try {
      const res = await fetch('/api/admin/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: targetSite.name,
          domain: targetSite.domain,
          topic: aiTopic.trim(),
          focusKeyword: aiFocusKeyword.trim(),
          secondaryKeywords: aiSecondaryKeywords.trim(),
          targetWordCount: 1200,
          category,
          provider: chosenModelConfig.provider,
          model: chosenModelConfig.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      const b: GeneratedBlogResponse = data.blog;
      setTitle(b.title);
      setSlug(b.slug);
      setExcerpt(b.excerpt);
      setSeoTitle(b.seoTitle);
      const rawContent = Array.isArray(b.content) ? b.content.join('\n\n') : String(b.content || '');
      const cleanContent = hasHtmlTags(rawContent)
        ? htmlToMarkdown(normalizeContentToHtml(rawContent)).join('\n\n')
        : rawContent;
      setContent(cleanContent);
      if (b.coverImage) setCoverImage(b.coverImage);
      if (b.tags && b.tags.length > 0) setTagsInput(b.tags.join(', '));
      if (b.author) setAuthor(b.author);
      if (b.category) setCategory(b.category);

      setFeedback({
        type: 'success',
        message: 'Your article has been written! You can review and edit below.',
      });
      toast.success('Article drafted successfully!');

      // Smooth scroll down to the canvas
      setTimeout(() => {
        const editorElement = document.getElementById('blog-content-area');
        if (editorElement) {
          editorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI generation failed';
      setAiError(msg);
      toast.error(`Could not generate article: ${msg}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save post
  const handleSave = async (publishImmediate = false) => {
    if (!title.trim() || !slug.trim()) {
      const msg = 'Please enter an Article Title and Page Link.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
      return;
    }

    const nextStatus = publishImmediate ? 'published' : status;
    if (publishImmediate) setPublishing(true);
    else setSaving(true);
    setFeedback(null);

    const paragraphs = content
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      slug: slugify(slug),
      title: title.trim(),
      excerpt: excerpt.trim(),
      category,
      content: paragraphs,
      cover_image: coverImage,
      author: author.trim(),
      status: nextStatus,
      ai_generated: true,
      target_site: targetSite.domain,
      seo_title: (seoTitle || title).trim(),
      seo_description: (seoDescription || excerpt).trim(),
      tags,
      published_at: publishImmediate ? new Date().toISOString() : initialPost?.published_at,
    };

    try {
      let savedId = initialPost?.id;

      if (isNew) {
        const res = await fetch('/api/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create post');
        savedId = data.post?.id || data.id;
      } else {
        const res = await fetch(`/api/admin/posts/${initialPost?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update post');
        savedId = initialPost?.id;
      }

      if (publishImmediate && savedId) {
        const liveUrl = `${targetSite.url}/blog/${payload.slug}/`;
        setStatus('published');
        setFeedback({
          type: 'success',
          message: `Published live to ${targetSite.name} (${targetSite.domain})!`,
          url: liveUrl,
        });

        toast.success('Article is now Live!', {
          description: `Live on ${targetSite.domain}/blog/${payload.slug}/`,
          action: {
            label: 'View Live Post',
            onClick: () => window.open(liveUrl, '_blank'),
          },
          duration: 10000,
        });
        router.push('/');
        router.refresh();
      } else {
        setFeedback({
          type: 'success',
          message: 'Draft saved successfully.',
        });
        toast.success('Draft saved.');
        if (isNew && savedId) {
          router.push(`/admin/blog/${savedId}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      setFeedback({ type: 'error', message: msg });
      toast.error(`Save error: ${msg}`);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  // SEO Quality Checklist
  const seoAudit = useMemo(() => {
    const kw = (aiFocusKeyword || tagsInput.split(',')[0] || '').trim().toLowerCase();
    const cleanTitle = (seoTitle || title).toLowerCase();
    const cleanSlug = slug.toLowerCase();
    const cleanDesc = (seoDescription || excerpt).toLowerCase();

    const hasKwInTitle = kw ? cleanTitle.includes(kw) : false;
    const hasKwInSlug = kw ? cleanSlug.includes(slugify(kw)) : false;
    const hasKwInDesc = kw ? cleanDesc.includes(kw) : false;
    const hasAdequateLength = wordCount >= 600;
    const mdH2Matches = (content.match(/^##\s+.+$/gm) || []).length;
    const htmlH2Matches = (content.match(/<h2\b/gi) || []).length;
    const h2Count = Math.max(mdH2Matches, htmlH2Matches);
    const hasHeadings = h2Count >= 2;

    let score = 0;
    if (hasKwInTitle) score += 25;
    if (hasKwInSlug) score += 20;
    if (hasKwInDesc) score += 20;
    if (hasAdequateLength) score += 20;
    if (hasHeadings) score += 15;

    return {
      score,
      hasKwInTitle,
      hasKwInSlug,
      hasKwInDesc,
      hasAdequateLength,
      hasHeadings,
      h2Count,
    };
  }, [aiFocusKeyword, tagsInput, title, slug, seoTitle, seoDescription, excerpt, wordCount, content]);

  return (
    <div className="space-y-6 pb-24 font-sans max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d121f] p-4 sm:p-5 rounded-3xl border border-white/[0.08] shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white border border-white/10 transition-colors"
            title="Back to All Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isNew ? 'New Article' : 'Edit Article'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Publishing to: <span className="text-indigo-400 font-semibold">{targetSite.name}</span> ({targetSite.domain})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <Save className="w-4 h-4 text-zinc-400" />}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Publish to Website</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          {feedback.url && (
            <a
              href={feedback.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 underline font-semibold text-indigo-400 hover:text-indigo-300 shrink-0"
            >
              <span>View on Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* Main Workspace: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: AI Writer + Article Canvas */}
        <div className="lg:col-span-2 space-y-6">
          {/* INLINE AI GENERATOR WITH LIVE INTERACTIVE STATE */}
          <div className="rounded-2xl bg-[#0E1322] border border-indigo-500/30 shadow-xl p-5 sm:p-6 space-y-4 relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0 font-bold">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Write Article with AI</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-wider">
                      Instant 1-Click
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Enter your topic, and AI will write the entire article with headings, odds guides, and FAQs.
                  </p>
                </div>
              </div>

              {aiGenerating && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Writing... {elapsedSeconds}s</span>
                </div>
              )}
            </div>

            {/* Choose Writing Style / AI Model */}
            <div className="pt-1 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">⚙️</span>
                  <label className="text-xs font-bold text-zinc-200 tracking-tight">
                    AI Model Engine <span className="text-zinc-500 font-normal">(Free Groq LPUs &amp; Google Gemini)</span>
                  </label>
                </div>
                <span className="text-[11px] font-medium text-zinc-400">
                  Speed: <strong className="text-amber-400">{AI_MODEL_OPTIONS.find((m) => m.id === aiSelectedModel)?.speed}</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AI_MODEL_OPTIONS.map((m) => {
                  const isSelected = aiSelectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={aiGenerating}
                      onClick={() => setAiSelectedModel(m.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/30 text-white border-purple-500 shadow-md ring-2 ring-purple-500/40'
                          : 'bg-[#0B0F19]/90 text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span className="text-xs font-bold text-white truncate">{m.name}</span>
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${
                              isSelected
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                                : m.badge.includes('Ultra')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-white/10 text-zinc-300 border border-white/10'
                            }`}
                          >
                            {m.badge}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] leading-relaxed line-clamp-2 ${
                            isSelected ? 'text-zinc-300' : 'text-zinc-400'
                          }`}
                        >
                          {m.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-3 pt-2.5 border-t border-white/[0.06]">
                        <span>Context: <strong className="text-zinc-400 font-semibold">{m.contextWindow}</strong></span>
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">⚡ {m.speed}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Prompt Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 relative z-10">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  What is this article about? <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  disabled={aiGenerating}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. How to Get a Verified FairPlay ID on WhatsApp in 2 Minutes"
                  className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Main Keyword <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  disabled={aiGenerating}
                  value={aiFocusKeyword}
                  onChange={(e) => setAiFocusKeyword(e.target.value)}
                  placeholder="e.g. FairPlay Cricket ID"
                  className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                />
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer h-[42px]"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Writing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Write Article</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Extra Keywords */}
            <div className="pt-0.5 relative z-10">
              <input
                type="text"
                disabled={aiGenerating}
                value={aiSecondaryKeywords}
                onChange={(e) => setAiSecondaryKeywords(e.target.value)}
                placeholder="Extra keywords (optional, e.g. IPL live odds, 2-minute UPI withdrawal, 300% bonus)"
                className="w-full px-3.5 py-1.5 bg-[#0B0F19]/80 border border-white/10 rounded-lg text-xs font-medium text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
              />
            </div>

            {/* LIVE ACTIVE GENERATION PROGRESS PANEL (INTERACTIVE UI) */}
            {aiGenerating && (
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-indigo-500/30 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                    <span>AI Writing in Progress</span>
                  </div>
                  <span className="text-zinc-400 font-mono text-[11px]">{elapsedSeconds}s elapsed</span>
                </div>

                {/* Animated Gradient Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-300 animate-pulse"
                    style={{ width: `${Math.min(95, (elapsedSeconds + 1) * 15)}%` }}
                  />
                </div>

                {/* Live Step Tracker */}
                <div className="flex items-center gap-2 text-xs text-zinc-200 font-medium pt-1">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                  <span className="italic">{GENERATION_STAGES[generationStageIndex]}</span>
                </div>
              </div>
            )}

            {aiError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          {/* Article Title & Overview Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Article Title (Headline)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. FairPlay Login: Your Ultimate Online Cricket Betting ID Provider in India"
                className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-base font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Page Link
                </label>
                <div className="flex items-center bg-[#0B0F19] border border-white/10 rounded-xl px-3 py-2 text-xs">
                  <span className="text-zinc-500 font-mono">{targetSite.domain}/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="article-url-slug"
                    className="flex-1 bg-transparent text-indigo-400 font-bold focus:outline-none ml-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. FairPlay Desk"
                  className="w-full px-3.5 py-2 bg-[#0B0F19] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Short Description (Shows in previews and Google)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A compelling 1-2 sentence preview to engage readers..."
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Content Canvas with Writer & Preview */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg space-y-4">
            {/* View Switcher & Word Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readTime}</span>
              </div>
            </div>

            {/* Formatting Toolbar */}
            {activeTab === 'edit' && (
              <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0B0F19] border border-white/[0.08] rounded-xl text-xs text-zinc-300">
                <button
                  type="button"
                  onClick={() => insertFormatting('## ')}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/[0.06] font-semibold text-zinc-200"
                  title="Main Heading"
                >
                  Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('### ')}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/[0.06] font-semibold text-zinc-200"
                  title="Subheading"
                >
                  Subheading
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/[0.06] font-semibold text-zinc-200"
                  title="Bold text"
                >
                  Bold
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/[0.06] italic text-zinc-200"
                  title="Italic text"
                >
                  Italic
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('- ')}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06]"
                  title="Bullet list"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('> ')}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06]"
                  title="Quote callout"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={insertTableBlock}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06]"
                  title="Comparison table"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={insertFaqBlock}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-indigo-400"
                  title="Player FAQs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleFormatToMarkdown}
                  className="ml-auto px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  title="Clean and format any HTML tags to clean Markdown"
                >
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Format Markdown</span>
                </button>
              </div>
            )}

            {/* Writer vs Preview Area */}
            {activeTab === 'edit' ? (
              <div className="relative">
                {aiGenerating && (
                  <div className="absolute inset-0 bg-[#0B0F19]/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <div className="text-sm font-bold text-white">AI is writing your article...</div>
                    <div className="text-xs text-zinc-400 max-w-sm">
                      {GENERATION_STAGES[generationStageIndex]}
                    </div>
                  </div>
                )}
                <textarea
                  id="blog-content-area"
                  rows={24}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing or use the AI generator above to auto-write a complete article..."
                  className="w-full p-4 bg-[#0B0F19] border border-white/10 rounded-xl text-sm font-sans text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 leading-relaxed resize-y min-h-[500px]"
                />
              </div>
            ) : (
              <div className="p-6 bg-[#0B0F19] border border-white/10 rounded-xl min-h-[500px]">
                <ArticleContentRenderer content={content.split(/\n\n+/).filter(Boolean)} />
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Picture, Category & Quality Checks */}
        <div className="space-y-6">
          {/* Target Website Selector Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Target Website</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === 'published'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className="capitalize">{status}</span>
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Dedicated publishing platform:
            </p>

            {/* Dedicated Platform: fairplaylive.io */}
            <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-white shadow-sm shadow-indigo-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{targetSite.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {targetSite.domain}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">Primary Domain</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1.5">{targetSite.description}</div>
            </div>

            {/* Live post link if published */}
            {slug && status === 'published' && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">View on {targetSite.domain}:</span>
                <a
                  href={`https://fairplay1login.com/blogs/${slugify(slug)}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  title="View live post"
                >
                  <span>Open Live Post</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Cover Picture */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Cover Picture
              </label>
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Pick Picture
              </button>
            </div>

            {coverImage ? (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                <img
                  src={coverImage}
                  alt={title || 'Cover picture'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = '/images/blog-online-cricket-betting.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssetModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs shadow-md hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Change Picture
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImage(selectRandomCoverImage())}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Random
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAssetModalOpen(true)}
                className="w-full p-8 border-2 border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl text-center space-y-2 transition-colors bg-[#0B0F19] cursor-pointer"
              >
                <ImageIcon className="w-6 h-6 text-indigo-400 mx-auto" />
                <div className="text-xs font-semibold text-white">Pick a Cover Picture</div>
                <div className="text-[11px] text-zinc-500">Cricket &amp; casino imagery</div>
              </button>
            )}

            <input
              type="text"
              value={coverImage || ''}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Or paste direct image web link..."
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          {/* Category & Tags Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {SITE_CONFIG.categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Keywords &amp; Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Cricket ID, IPL 2026, Instant UPI, Bonus"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Google Search Preview Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Search Preview</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] text-left space-y-1 text-xs">
              <div className="text-[11px] text-zinc-400 font-sans truncate">
                https://{targetSite.domain} › blog › {slugify(slug) || 'article-slug'}
              </div>
              <div className="text-indigo-300 font-medium text-sm line-clamp-1 hover:underline cursor-pointer">
                {seoTitle || title || 'FairPlay Cricket Betting Guide'}
              </div>
              <div className="text-zinc-300 text-[11px] line-clamp-2 leading-relaxed">
                {seoDescription || excerpt || 'Read our complete guide and instructions on FairPlay.'}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Custom Google Title (Optional)</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to article headline"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Custom Search Description (Optional)</label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to short description"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Article Checklist */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1322] border border-white/[0.08] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Article Quality Score</span>
              <span
                className={`text-xs font-bold font-mono ${
                  seoAudit.score >= 80
                    ? 'text-emerald-400'
                    : seoAudit.score >= 50
                    ? 'text-indigo-400'
                    : 'text-amber-400'
                }`}
              >
                {seoAudit.score}%
              </span>
            </div>

            {/* Score Bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  seoAudit.score >= 80
                    ? 'bg-emerald-400'
                    : seoAudit.score >= 50
                    ? 'bg-indigo-500'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${seoAudit.score}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 pt-2 text-[11px]">
              <div className="flex items-center gap-2">
                {seoAudit.hasKwInTitle ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <span className={seoAudit.hasKwInTitle ? 'text-gray-200' : 'text-gray-400'}>
                  Keyword in Title
                </span>
              </div>

              <div className="flex items-center gap-2">
                {seoAudit.hasKwInSlug ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <span className={seoAudit.hasKwInSlug ? 'text-gray-200' : 'text-gray-400'}>
                  Keyword in Web Link
                </span>
              </div>

              <div className="flex items-center gap-2">
                {seoAudit.hasKwInDesc ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <span className={seoAudit.hasKwInDesc ? 'text-gray-200' : 'text-gray-400'}>
                  Keyword in Short Description
                </span>
              </div>

              <div className="flex items-center gap-2">
                {seoAudit.hasAdequateLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <span className={seoAudit.hasAdequateLength ? 'text-gray-200' : 'text-gray-400'}>
                  Good length: 600+ words ({wordCount} words)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {seoAudit.hasHeadings ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                )}
                <span className={seoAudit.hasHeadings ? 'text-gray-200' : 'text-gray-400'}>
                  Has headings ({seoAudit.h2Count} headings)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelectImage={(url) => {
          setCoverImage(url);
          setIsAssetModalOpen(false);
          toast.success('Cover picture updated');
        }}
        currentSelectedUrl={coverImage}
      />
    </div>
  );
}
