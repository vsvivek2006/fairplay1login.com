'use client';

import { useState } from 'react';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Cpu,
  Zap,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/lib/ai/models';
import type { GenerateBlogPostOutput } from '@/lib/ai/generateBlogPost';

interface AIGeneratorPanelProps {
  onGenerated: (output: GenerateBlogPostOutput) => void;
  disabled?: boolean;
}

const SUGGESTED_TOPICS = [
  'IPL 2026 Live Cricket Betting Strategy & Exchange Odds in India',
  'How Back and Lay Exchange Betting Works on FairPlay',
  'Fairplay Login ID Guide: Fast Registration & Payouts in 2 Minutes',
  'Top Live Casino Games in India: Teen Patti & Roulette Tips',
  'Cricket In-Play Betting: How to Read Live Match Momentum & Odds',
];

export function AIGeneratorPanel({ onGenerated, disabled }: AIGeneratorPanelProps) {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Authoritative & Conversational');
  const [wordCount, setWordCount] = useState<number>(1200);
  const [keywords, setKeywords] = useState('');
  const [audience, setAudience] = useState(
    'Indian cricket fans, sports bettors, and online casino players'
  );
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const selectedModelInfo =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Topic is required', {
        description: 'Please enter a target topic or headline to generate an article.',
      });
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Generating blog post with AI...', {
      description: `Using ${selectedModelInfo.name}. Drafting SEO copy, headings, and tables.`,
    });

    try {
      const keywordList = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const idempotencyKey = `ai-gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const response = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          wordCount,
          keywords: keywordList,
          audience: audience.trim(),
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate blog draft.');
      }

      onGenerated(data as GenerateBlogPostOutput);
      setHasGenerated(true);

      toast.success('Article generated successfully!', {
        id: toastId,
        description: 'Draft populated into the editor. You can now edit and publish.',
      });
    } catch (err: unknown) {
      console.error('AI Generator error:', err);
      const message =
        err instanceof Error ? err.message : 'Generation failed. Please try again.';
      toast.error('AI Generation Failed', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#d4af37]/30 bg-[#0E1424] p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f3e5ab]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>FairPlay AI Editorial Director</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
                PRO
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Generates high-converting cricket betting guides, match analysis, and SEO copy with 0 AI cliches.
            </p>
          </div>
        </div>

        {hasGenerated && (
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Draft Ready in Editor</span>
          </div>
        )}
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-300">
          Select AI Reasoning Engine
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelectedModel(model.id)}
                disabled={disabled || isGenerating}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-gray-800/40 border-gray-700/80 hover:border-gray-600 hover:bg-gray-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate">
                    {model.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      isSelected
                        ? 'bg-[#d4af37] text-black font-black'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {model.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                  {model.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1.5 border-t border-gray-800">
                  <span>Context: {model.contextWindow}</span>
                  <span className={isSelected ? 'text-[#f3e5ab] font-bold' : 'text-gray-400'}>
                    ⚡ {model.speed}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic & Quick Inspirations */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-300">
          Target Topic or Headline <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. IPL 2026 Live Cricket Betting Strategy: Back vs Lay Explained"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={disabled || isGenerating}
          className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all disabled:opacity-50"
        />

        {/* Quick Inspiration Pills */}
        <div className="pt-1">
          <span className="text-[11px] text-gray-400 mr-2">Try inspiration:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1">
            {SUGGESTED_TOPICS.map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => setTopic(suggested)}
                disabled={disabled || isGenerating}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[#f3e5ab] hover:text-white border border-gray-700 transition-colors truncate max-w-[280px] sm:max-w-none cursor-pointer disabled:opacity-50"
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tone */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Editorial Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={disabled || isGenerating}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-xs sm:text-sm focus:outline-none focus:border-[#d4af37] transition-all disabled:opacity-50 cursor-pointer"
          >
            <option value="Authoritative & Conversational">
              Authoritative &amp; Conversational (Default)
            </option>
            <option value="High Stakes & Tactical Strategy">
              High Stakes &amp; Tactical Strategy
            </option>
            <option value="Deeply Analytical Odds Breakdown">
              Deeply Analytical Odds Breakdown
            </option>
            <option value="Fast Beginners Guide">
              Fast Beginners Guide
            </option>
          </select>
        </div>

        {/* Word Count */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Target Article Length
          </label>
          <div className="flex items-center gap-2">
            {[600, 900, 1200].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setWordCount(count)}
                disabled={disabled || isGenerating}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  wordCount === count
                    ? 'bg-[#d4af37] text-black font-bold shadow-md'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-700'
                }`}
              >
                ~{count} words
              </button>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Target SEO Keywords (Comma Separated)
          </label>
          <input
            type="text"
            placeholder="e.g. cricket betting, IPL 2026, exchange odds, fairplay login"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={disabled || isGenerating}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#d4af37] transition-all disabled:opacity-50"
          />
        </div>

        {/* Audience */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Target Audience Persona
          </label>
          <input
            type="text"
            placeholder="e.g. Indian cricket bettors, IPL fans, casino players"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            disabled={disabled || isGenerating}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#d4af37] transition-all disabled:opacity-50"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-800">
        <p className="text-[11px] text-gray-400 text-center sm:text-left">
          Using <span className="text-[#f3e5ab] font-bold">{selectedModelInfo.name}</span>. Generates title, slug, meta description, structured HTML &amp; tags.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasGenerated ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={disabled || isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700 transition-all text-xs cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
              )}
              Regenerate Article
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={disabled || isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#d4af37] text-black transition-all text-xs cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Drafting Full Article...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Generate Draft with AI</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
