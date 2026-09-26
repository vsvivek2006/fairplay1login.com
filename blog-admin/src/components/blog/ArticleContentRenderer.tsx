'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { HelpCircle, Quote, Sparkles, ChevronDown, Check } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import { htmlToMarkdown, normalizeContentToHtml, hasHtmlTags, decodeHtmlEntities } from '@/lib/ai/contentFormatter';

interface ArticleContentRendererProps {
  content: string[] | string;
  className?: string;
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // 1. Clean residual HTML block/span tags or wrappers
  let cleaned = text
    .replace(/<\/?(?:p|div|span)\b[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ');

  // 2. Decode HTML entities
  cleaned = decodeHtmlEntities(cleaned);

  // 3. Pre-convert inline HTML tags to markdown tokens if present
  // Links: <a href="url">label</a> -> [label](url)
  cleaned = cleaned.replace(/<a\b[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
    return `[${label.replace(/<[^>]+>/g, '').trim()}](${href.trim()})`;
  });

  // Bold: <strong>...</strong> or <b>...</b> -> **...**
  cleaned = cleaned.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, inner) => {
    return `**${inner.replace(/<[^>]+>/g, '').trim()}**`;
  });

  // Italic: <em>...</em> or <i>...</i> -> *...*
  cleaned = cleaned.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, inner) => {
    return `*${inner.replace(/<[^>]+>/g, '').trim()}*`;
  });

  // Code: <code>...</code> -> `...`
  cleaned = cleaned.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => {
    return `\`${inner.replace(/<[^>]+>/g, '').trim()}\``;
  });

  // Strip any remaining unwanted HTML tags so no raw <tag> is EVER visible
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Match links [text](url), bold **text**, italic *text*, and inline code `code`
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = cleaned.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Markdown Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, rawHref] = linkMatch;
      const href = (rawHref || '').trim();

      // Protocol whitelist to eliminate XSS (reject javascript:, data:, vbscript:)
      const isSafeProtocol = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href);
      if (!isSafeProtocol) {
        return <span key={index}>{label}</span>;
      }

      const isInternal = href.startsWith('/') || href.startsWith('#');
      if (isInternal) {
        return (
          <Link
            key={index}
            href={href}
            className="text-indigo-400 font-semibold underline underline-offset-4 decoration-indigo-400/40 hover:decoration-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 font-semibold underline underline-offset-4 decoration-indigo-400/40 hover:decoration-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {label}
        </a>
      );
    }

    // Bold text: **text**
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={index} className="font-semibold text-white">
          {boldMatch[1]}
        </strong>
      );
    }

    // Italic text: *text*
    const italicMatch = part.match(/^\*([^*]+)\*$/);
    if (italicMatch) {
      return (
        <em key={index} className="italic text-gray-300">
          {italicMatch[1]}
        </em>
      );
    }

    // Inline Code: `code`
    const codeMatch = part.match(/^`([^`]+)`$/);
    if (codeMatch) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-indigo-300 font-mono text-[11px]">
          {codeMatch[1]}
        </code>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Render clean Markdown Tables
 */
function renderMarkdownTable(tableBlock: string, key: number) {
  const lines = tableBlock.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return null;

  const parseRow = (rowStr: string) =>
    rowStr
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  // line 1 is usually separator (|---|---|...)
  const rows = lines.slice(lines[1]?.includes('---') ? 2 : 1).map(parseRow);

  return (
    <div key={key} className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-200">
          <thead className="bg-[#141B2D] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3">
                  {renderInlineMarkdown(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-3 ${
                      cIdx === 0 ? 'font-semibold text-white' : 'text-gray-300'
                    }`}
                  >
                    {renderInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ArticleContentRenderer({
  content,
  className = '',
}: ArticleContentRendererProps) {
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true });

  const rawParagraphs = useMemo(() => {
    let fullText = Array.isArray(content)
      ? content.join('\n\n')
      : String(content || '');

    // Normalize headings attached to next line with only a single newline
    fullText = fullText.replace(/^(#{2,3}\s+[^\n]+)\n([^\n#|>-])/gm, '$1\n\n$2');

    // If input contains any HTML tags, normalize and convert to clean Markdown blocks
    if (hasHtmlTags(fullText)) {
      return htmlToMarkdown(normalizeContentToHtml(fullText));
    }
    return fullText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  }, [content]);

  // Group adjacent question/answer blocks if split across separate array elements
  const parsedBlocks: string[] = [];
  for (let i = 0; i < rawParagraphs.length; i++) {
    const current = rawParagraphs[i].trim();
    const next = rawParagraphs[i + 1]?.trim();

    const isQuestionOnly =
      /^(?:\*\*Q:|\bQ:|\bQ\d+:|###\s*Q:|###\s*FAQ:)\s*[^?\n]+\??\s*\*?\*?$/i.test(current) ||
      (current.startsWith('### ') && current.endsWith('?'));
    const isNextAnswer =
      next && (
        /^(?:\*\*A:|\bA:|\bAns:|\bAnswer:)/i.test(next) ||
        (!next.startsWith('#') && !next.startsWith('|') && !next.startsWith('>'))
      );

    if (isQuestionOnly && isNextAnswer) {
      const qText = current
        .replace(/^###\s*(?:Q:\s*)?/i, '')
        .replace(/^\*\*Q:\s*/i, '')
        .replace(/\*+$/g, '')
        .trim();
      const aText = next
        .replace(/^(?:\*\*A:\s*\*?\*?|\bA:\s*|\bAns:\s*|\bAnswer:\s*)/i, '')
        .replace(/^\*+\s*/, '')
        .trim();
      parsedBlocks.push(`**Q: ${qText}**\n**A:** ${aText}`);
      i++;
      continue;
    }

    parsedBlocks.push(current);
  }

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  let faqCounter = 0;

  return (
    <div className={`space-y-4 text-gray-300 font-sans leading-relaxed ${className}`}>
      {parsedBlocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Markdown Table: starts with | and has divider row
        if (trimmed.startsWith('|') && /\|(?:\s*:?-+:?\s*\|)+/.test(trimmed)) {
          return renderMarkdownTable(trimmed, idx);
        }

        // 2. H2 Headings: ## Heading
        if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
          const firstLine = trimmed.split('\n')[0];
          const remaining = trimmed.substring(firstLine.length).trim();
          const headingText = firstLine.replace(/^##\s+/, '');
          const headingId = slugifyHeading(headingText);
          const isFaqHeading = /frequently asked|faq|q&a|questions/i.test(headingText);

          return (
            <React.Fragment key={idx}>
              <div className="pt-4 pb-1">
                <h2
                  id={headingId}
                  className="group text-base sm:text-lg font-bold font-display text-white tracking-tight flex items-center gap-2.5 border-b border-white/10 pb-2 scroll-mt-24"
                >
                  <span className="w-1 h-4 rounded bg-indigo-500 inline-block" />
                  <span>{headingText}</span>
                  {isFaqHeading && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-indigo-500/15 text-indigo-300 rounded-full border border-indigo-500/25 ml-auto">
                      FAQs
                    </span>
                  )}
                </h2>
              </div>
              {remaining && (
                <p className="text-[12px] sm:text-[13px] text-gray-300 leading-relaxed">
                  {renderInlineMarkdown(remaining)}
                </p>
              )}
            </React.Fragment>
          );
        }

        // 3. H3 Headings: ### Heading (unless it's an FAQ item)
        if (trimmed.startsWith('### ') && !/###\s*(?:q|faq):/i.test(trimmed) && !trimmed.includes('\n')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          const headingId = slugifyHeading(headingText);
          return (
            <h3
              key={idx}
              id={headingId}
              className="text-[13px] sm:text-sm font-bold text-indigo-300 pt-2 pb-0.5 scroll-mt-24"
            >
              {headingText}
            </h3>
          );
        }

        // 4. Pro Tip / Quote Callout: > **FairPlay Pro Tip:** ...
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <div
              key={idx}
              className="relative my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#141B2D] to-[#101726] border border-indigo-500/25 shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-gray-200 text-xs sm:text-sm font-medium leading-relaxed">
                  {renderInlineMarkdown(quoteText)}
                </div>
              </div>
            </div>
          );
        }

        // 5. FAQ Item: Detects all variations of Q&A blocks
        const faqRegex = /^(?:\*\*Q:\s*|\bQ:\s*|\bQ\d+:\s*|###\s*Q:\s*|###\s*FAQ:\s*|###\s*)([^\n?*]+(?:\?|\b))\*?\*?\s*(?:\n+)?(?:\*\*A:\s*\*?\*?|\bA:\s*|\bAns:\s*|\bAnswer:\s*)([\s\S]+)/i;
        const faqMatch = trimmed.match(faqRegex);

        if (faqMatch) {
          const questionText = faqMatch[1].replace(/^[*#\s]+|[*#\s]+$/g, '').trim();
          const answerText = faqMatch[2].replace(/^(?:\*\*|:\*\*|:\s*\*+|\*+:|:)\s*/, '').replace(/^\*+\s*/, '').trim();
          const isOpen = Boolean(openFaqs[idx]);
          faqCounter += 1;
          const num = faqCounter;

          return (
            <div
              key={idx}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen
                  ? 'border border-indigo-500/40 bg-[#0E1424] shadow-lg shadow-indigo-900/20'
                  : 'border border-white/8 bg-[#111827] hover:border-indigo-500/25'
              }`}
            >
              {/* Question header */}
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full text-left flex items-start gap-0 focus:outline-none group"
              >
                {/* Numbered left strip */}
                <span
                  className={`shrink-0 flex flex-col items-center justify-center w-10 self-stretch text-center transition-colors ${
                    isOpen
                      ? 'bg-gradient-to-b from-indigo-600 to-violet-700'
                      : 'bg-indigo-500/10 group-hover:bg-indigo-500/20'
                  }`}
                >
                  <span className="text-[11px] font-black text-white/90">{num}</span>
                </span>
                {/* Question text */}
                <span className="flex-1 flex items-center justify-between gap-2 px-3.5 py-3">
                  <span
                    className={`text-[13px] font-semibold leading-snug transition-colors ${
                      isOpen ? 'text-indigo-200' : 'text-gray-100 group-hover:text-white'
                    }`}
                  >
                    {questionText}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${
                      isOpen ? 'rotate-180 text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  />
                </span>
              </button>

              {/* Answer panel */}
              {isOpen && (
                <div className="ml-10 px-3.5 pt-2 pb-3.5 border-t border-indigo-500/15 bg-black/20">
                  <p className="text-[12px] sm:text-[13px] text-gray-300 leading-relaxed">
                    {renderInlineMarkdown(answerText)}
                  </p>
                </div>
              )}
            </div>
          );
        }

        // 6. Bullet List Item or Ordered List
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
          const listItems = trimmed.split(/\\n|\n/).filter(Boolean);
          const isOrdered = /^\d+\.\s/.test(trimmed);

          if (isOrdered) {
            return (
              <ol key={idx} className="my-4 space-y-2 pl-1">
                {listItems.map((item, itemIdx) => {
                  const cleaned = item.replace(/^\d+\.\s+/, '');
                  return (
                    <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-300 text-[11px] font-bold flex items-center justify-center border border-indigo-500/30 mt-0.5">
                        {itemIdx + 1}
                      </span>
                      <span>{renderInlineMarkdown(cleaned)}</span>
                    </li>
                  );
                })}
              </ol>
            );
          }

          return (
            <ul key={idx} className="my-4 space-y-2 pl-1">
              {listItems.map((item, itemIdx) => {
                const cleaned = item.replace(/^[-*]\s+/, '');
                return (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2" />
                    <span>{renderInlineMarkdown(cleaned)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 7. Standard Paragraph
        return (
          <p key={idx} className="text-[12px] sm:text-[13px] text-gray-300 leading-relaxed">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
