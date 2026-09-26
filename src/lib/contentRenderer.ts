/**
 * FairPlay — Article Content Renderer & Sanitizer
 * Ported from Growth-Service to provide rich semantic HTML rendering
 * for both HTML and Markdown blog posts on fairplay1login.com.
 */

import { SITE_CONFIG } from '@/config/site';

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike',
  'code', 'pre', 'blockquote',
  'a', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'figure', 'figcaption', 'span', 'div',
]);

const GLOBAL_ATTRS = new Set(['class', 'title', 'id', 'width', 'height', 'style']);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'loading', 'srcset', 'sizes']),
  th: new Set(['scope', 'colspan', 'rowspan']),
  td: new Set(['colspan', 'rowspan']),
};

export function cleanHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let clean = html;

  // 1. Remove dangerous blocks
  clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
  clean = clean.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, '');
  clean = clean.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '');
  clean = clean.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Parse tags and sanitize attributes
  clean = clean.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagNameRaw, attrsRaw) => {
    const tagName = tagNameRaw.toLowerCase();
    const isClosing = match.startsWith('</');

    if (!ALLOWED_TAGS.has(tagName)) {
      return '';
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    const allowedForTag = TAG_ATTRS[tagName] || new Set();
    const sanitizedAttrs: string[] = [];

    const attrRegex = /([a-z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrsRaw)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      if (attrName.startsWith('on')) continue;

      if (attrName === 'style') {
        const lower = attrValue.toLowerCase();
        if (
          lower.includes('javascript:') ||
          lower.includes('expression(') ||
          lower.includes('url(') ||
          lower.includes('@import') ||
          lower.includes('behavior:') ||
          lower.includes('-moz-binding')
        ) {
          continue;
        }
      }

      if (!GLOBAL_ATTRS.has(attrName) && !allowedForTag.has(attrName)) continue;

      if (attrName === 'href' || attrName === 'src') {
        const trimmedVal = attrValue.trim().toLowerCase();
        if (
          trimmedVal.startsWith('javascript:') ||
          trimmedVal.startsWith('vbscript:') ||
          (trimmedVal.startsWith('data:') && (!trimmedVal.startsWith('data:image/') || attrName !== 'src'))
        ) {
          continue;
        }
      }

      if (tagName === 'a' && attrName === 'target' && attrValue === '_blank') {
        sanitizedAttrs.push('target="_blank" rel="noopener noreferrer"');
        continue;
      }

      sanitizedAttrs.push(`${attrName}="${attrValue.replace(/"/g, '&quot;')}"`);
    }

    return sanitizedAttrs.length > 0 ? `<${tagName} ${sanitizedAttrs.join(' ')}>` : `<${tagName}>`;
  });

  return clean;
}

function renderInlineMarkdown(text: string): string {
  if (!text) return '';

  let out = text;

  // Links: [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const isSafe = /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url.trim());
    if (!isSafe) return label;
    const isInternal = url.startsWith('/') || url.startsWith('#');
    if (isInternal) {
      return `<a href="${url.trim()}">${label}</a>`;
    }
    return `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // Bold: **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text*
  out = out.replace(/(?:^|[^*])\*([^*]+)\*(?:[^*]|$)/g, ' <em>$1</em> ');

  // Inline code: `code`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

  return out;
}


/**
 * Converts blog content (string, array of strings, markdown, or HTML) into
 * clean, semantic, fully-styled HTML.
 */
export function renderContentToHtml(content: string[] | string): string {
  if (!content) return '';

  let rawText = Array.isArray(content) ? content.join('\n\n') : String(content);
  rawText = rawText.replace(/https?:\/\/fairplaylive\.io/g, SITE_CONFIG.siteUrl);

  // If already full semantic HTML, sanitize and return
  const hasHtml = /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|table|div)\b/i.test(rawText);
  if (hasHtml && !rawText.includes('## ') && !rawText.includes('|---|') && !rawText.includes('|:---|')) {
    return cleanHtml(rawText);
  }

  // Normalize headings with single newlines
  rawText = rawText.replace(/^(#{2,3}\s+[^\n]+)\n([^\n#|>-])/gm, '$1\n\n$2');

  const blocks = rawText.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const htmlResult: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // 1. Markdown Table: | col | col |
    if (block.startsWith('|') && /\|(?:\s*:?-+:?\s*\|)+/.test(block)) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => renderInlineMarkdown(c.trim()));

        const headers = parseRow(lines[0]);
        const dataLines = lines.slice(lines[1].includes('---') ? 2 : 1);
        const rows = dataLines.map(parseRow);

        let tableHtml = '<div class="overflow-x-auto my-6"><table class="w-full"><thead><tr>';
        headers.forEach((h) => {
          tableHtml += `<th>${h}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        rows.forEach((r) => {
          tableHtml += '<tr>';
          r.forEach((cell, cellIdx) => {
            if (cellIdx === 0) {
              tableHtml += `<td class="font-semibold text-white">${cell}</td>`;
            } else {
              tableHtml += `<td>${cell}</td>`;
            }
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table></div>';
        htmlResult.push(tableHtml);
        continue;
      }
    }

    // 0. Top-level # H1: skip redundant post title in body content
    if (block.startsWith('# ') && !block.startsWith('## ')) {
      const firstLine = block.split('\n')[0];
      const remaining = block.substring(firstLine.length).trim();
      if (remaining) {
        htmlResult.push(`<p>${renderInlineMarkdown(remaining)}</p>`);
      }
      continue;
    }

    // 2. Headings: ## H2
    if (block.startsWith('## ') && !block.startsWith('### ')) {
      const firstLine = block.split('\n')[0];
      const remaining = block.substring(firstLine.length).trim();
      const heading = firstLine.replace(/^##\s+/, '');
      htmlResult.push(`<h2>${renderInlineMarkdown(heading)}</h2>`);
      if (remaining) {
        htmlResult.push(`<p>${renderInlineMarkdown(remaining)}</p>`);
      }
      continue;
    }

    // 3. Subheadings: ### H3
    if (block.startsWith('### ') && !block.startsWith('#### ')) {
      const firstLine = block.split('\n')[0];
      const remaining = block.substring(firstLine.length).trim();
      const heading = firstLine.replace(/^###\s+/, '');
      htmlResult.push(`<h3>${renderInlineMarkdown(heading)}</h3>`);
      if (remaining) {
        htmlResult.push(`<p>${renderInlineMarkdown(remaining)}</p>`);
      }
      continue;
    }

    // 4. Blockquote / Pro Tip: > ...
    if (block.startsWith('>')) {
      const quote = block.replace(/^>\s*/, '');
      htmlResult.push(`<blockquote>${renderInlineMarkdown(quote)}</blockquote>`);
      continue;
    }

    // 5. FAQ Question & Answer block
    const faqRegex = /^(?:\*\*Q:\s*|\bQ:\s*|###\s*Q:\s*|###\s*FAQ:\s*|###\s*)([^\n?*]+(?:\?|\b))\*?\*?\s*(?:\n+)?(?:\*\*A:\s*\*?\*?|\bA:\s*|\bAns:\s*|\bAnswer:\s*)([\s\S]+)/i;
    const faqMatch = block.match(faqRegex);
    if (faqMatch) {
      const q = faqMatch[1].replace(/^[*#\s]+|[*#\s]+$/g, '').trim();
      const a = faqMatch[2].replace(/^(?:\*\*|:\*\*|:\s*\*+|\*+:|:)\s*/, '').replace(/^\*+\s*/, '').trim();
      htmlResult.push(
        `<div class="faq-item"><div class="faq-q">❓ ${renderInlineMarkdown(q)}</div><div class="faq-a">${renderInlineMarkdown(a)}</div></div>`
      );
      continue;
    }

    // 6. Numbered or Bullet List
    if (block.startsWith('- ') || block.startsWith('* ') || /^\d+\.\s/.test(block)) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const isOrdered = /^\d+\.\s/.test(block);

      if (isOrdered) {
        let olHtml = '<ol>';
        lines.forEach((l) => {
          const item = l.replace(/^\d+\.\s+/, '');
          olHtml += `<li>${renderInlineMarkdown(item)}</li>`;
        });
        olHtml += '</ol>';
        htmlResult.push(olHtml);
      } else {
        let ulHtml = '<ul>';
        lines.forEach((l) => {
          const item = l.replace(/^[-*]\s+/, '');
          ulHtml += `<li>${renderInlineMarkdown(item)}</li>`;
        });
        ulHtml += '</ul>';
        htmlResult.push(ulHtml);
      }
      continue;
    }

    // 7. Standard Paragraph
    htmlResult.push(`<p>${renderInlineMarkdown(block)}</p>`);
  }

  return cleanHtml(htmlResult.join('\n'));
}
