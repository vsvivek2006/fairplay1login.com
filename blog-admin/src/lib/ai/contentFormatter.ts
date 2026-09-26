/**
 * Formats and normalizes AI generated content into rich semantic HTML for Tiptap editor.
 * Ensures H2, H3, paragraphs, lists, bold, italic, images, and blockquotes are preserved or converted.
 * Uses a zero-dependency server-safe HTML sanitizer compatible with Edge/Serverless runtimes.
 */

// Allowed tags set
const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "strong", "b", "em", "i", "u", "s", "del", "strike",
  "code", "pre", "blockquote",
  "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "figure", "figcaption", "span", "div",
]);

// Allowed attributes per tag or globally
const GLOBAL_ATTRS = new Set(["class", "title", "id", "width", "height"]);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "loading", "srcset", "sizes"]),
  th: new Set(["scope", "colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
};

export function cleanHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let clean = html;

  // 1. Remove dangerous blocks and their contents completely
  clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  clean = clean.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "");
  clean = clean.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "");
  clean = clean.replace(/<embed\b[^>]*>[\s\S]*?<\/embed>/gi, "");
  clean = clean.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, "");
  clean = clean.replace(/<!--[\s\S]*?-->/g, ""); // HTML comments

  // 2. Parse tags and sanitize attributes
  clean = clean.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagNameRaw, attrsRaw) => {
    const tagName = tagNameRaw.toLowerCase();
    const isClosing = match.startsWith("</");

    if (!ALLOWED_TAGS.has(tagName)) {
      return "";
    }

    if (isClosing) {
      return `</${tagName}>`;
    }

    const allowedForTag = TAG_ATTRS[tagName] || new Set();
    const sanitizedAttrs: string[] = [];
    let hasTargetBlank = false;
    let existingRel = "";

    const attrRegex = /([a-z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrsRaw)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

      // Strip on* event handlers (onclick, onerror, onload, etc.)
      if (attrName.startsWith("on")) {
        continue;
      }

      // Check allowed attributes
      if (!GLOBAL_ATTRS.has(attrName) && !allowedForTag.has(attrName)) {
        continue;
      }

      // Check URL safety for href and src
      if (attrName === "href" || attrName === "src") {
        const trimmedVal = attrValue.trim().toLowerCase();
        if (
          trimmedVal.startsWith("javascript:") ||
          trimmedVal.startsWith("vbscript:") ||
          (trimmedVal.startsWith("data:") && (!trimmedVal.startsWith("data:image/") || attrName !== "src"))
        ) {
          continue;
        }
      }

      if (tagName === "a" && attrName === "target" && attrValue === "_blank") {
        hasTargetBlank = true;
      }

      if (tagName === "a" && attrName === "rel") {
        existingRel = attrValue;
        continue;
      }

      sanitizedAttrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`);
    }

    if (tagName === "a") {
      if (hasTargetBlank) {
        const relTokens = new Set((existingRel || "").split(/\s+/).filter(Boolean));
        relTokens.add("noopener");
        relTokens.add("noreferrer");
        sanitizedAttrs.push(`rel="${Array.from(relTokens).join(" ")}"`);
      } else if (existingRel) {
        sanitizedAttrs.push(`rel="${existingRel.replace(/"/g, "&quot;")}"`);
      }
    }

    const attrString = sanitizedAttrs.length > 0 ? " " + sanitizedAttrs.join(" ") : "";
    const isVoid = tagName === "br" || tagName === "hr" || tagName === "img";

    return `<${tagName}${attrString}${isVoid ? " />" : ">"}`;
  });

  return clean;
}

export function normalizeContentToHtml(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  // 1. Strip code block fences
  let text = raw
    .trim()
    .replace(/^```(?:html|markdown)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // 2. Normalize existing HTML heading tags (h1 -> h2, h4/h5/h6 -> h3)
  text = text
    .replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>")
    .replace(/<h[4-6]\b([^>]*)>([\s\S]*?)<\/h[4-6]>/gi, "<h3$1>$2</h3>");

  // 3. Normalize markdown headings
  text = text.replace(/(?:^|\n)#{1,2}\s+([^\n]+)/g, "\n<h2>$1</h2>\n");
  text = text.replace(/(?:^|\n)#{3,6}\s+([^\n]+)/g, "\n<h3>$1</h3>\n");

  // 4. Normalize inline markdown (images, bold, italic, code, links)
  // Images FIRST: ![alt](url) -> <img src="$2" alt="$1" loading="lazy" />
  text = text.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|\/|data:image\/)[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
  // Links: [text](url) -> <a href="$2">$1</a> (avoiding ! before bracket)
  text = text.replace(/(?<!!)\[([^\]]+)\]\(((?:https?:\/\/|\/|#)[^\s)]+)\)/g, '<a href="$2">$1</a>');
  // Bold: **text** -> <strong>$1</strong>
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic: *text* -> <em>$1</em> (avoiding ** which is already replaced)
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  // Italic: _text_ -> <em>$1</em>
  text = text.replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, "<em>$1</em>");
  // Code: `code` -> <code>$1</code>
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 5. Line-by-line block processing for lists, blockquotes, and unwrapped text
  const lines = text.split(/\r?\n/);
  const result: string[] = [];

  let currentListType: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];

  const flushList = () => {
    if (currentListType) {
      result.push(`</${currentListType}>`);
      currentListType = null;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      const quoteContent = blockquoteBuffer.join(" ").trim();
      if (quoteContent) {
        const inner = quoteContent.startsWith("<p>") ? quoteContent : `<p>${quoteContent}</p>`;
        result.push(`<blockquote>${inner}</blockquote>`);
      }
      inBlockquote = false;
      blockquoteBuffer = [];
    }
  };

  const flushAll = () => {
    flushList();
    flushBlockquote();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    // Markdown blockquote line: > quote
    const bqMatch = trimmed.match(/^>\s*(.*)$/);
    if (bqMatch) {
      flushList();
      inBlockquote = true;
      if (bqMatch[1]) {
        blockquoteBuffer.push(bqMatch[1]);
      }
      continue;
    } else {
      flushBlockquote();
    }

    // Markdown bullet list line: - item, * item, • item, + item
    const ulMatch = trimmed.match(/^[-*•+]\s+(.*)$/);
    if (ulMatch) {
      if (currentListType === "ol") flushList();
      if (!currentListType) {
        result.push("<ul>");
        currentListType = "ul";
      }
      result.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Markdown ordered list line: 1. item
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (currentListType === "ul") flushList();
      if (!currentListType) {
        result.push("<ol>");
        currentListType = "ol";
      }
      result.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    // If it was a list and now it's something else, flush list
    flushList();

    // Check if line is already an HTML block element
    const isHtmlBlock =
      /^<\/?(?:h[1-6]|p|ul|ol|li|blockquote|div|hr|pre|table|thead|tbody|tr|th|td|section|article|figure|figcaption)\b/i.test(
        trimmed
      ) ||
      /<\/(?:h[1-6]|p|ul|ol|li|blockquote|div|pre|table|section|article|figure|figcaption)>$/i.test(
        trimmed
      ) ||
      /^<img\b[^>]*\/?>$/i.test(trimmed);

    if (isHtmlBlock) {
      result.push(trimmed);
    } else {
      // Naked text line -> wrap in paragraph
      result.push(`<p>${trimmed}</p>`);
    }
  }

  flushAll();

  let finalHtml = result.join("\n");

  // 6. Cleanup empty or duplicate paragraphs
  finalHtml = finalHtml
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<p>&nbsp;<\/p>/gi, "")
    .replace(/<p><br\s*\/?><\/p>/gi, "");

  return cleanHtml(finalHtml);
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
}

export function hasHtmlTags(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|strong|b|em|i|code|a|div|span|br|hr)\b/i.test(str);
}

/**
 * Converts rich semantic HTML into clean human-readable Markdown paragraphs
 * tailored for FairPlay's Markdown canvas editor and ArticleContentRenderer.
 */
export function htmlToMarkdown(html: string): string[] {
  if (!html || typeof html !== "string") return [];

  // 1. Convert links: <a href="url">text</a> -> [text](url)
  let text = html.replace(/<a\b[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
    return `[${label.replace(/<[^>]+>/g, "").trim()}](${href.trim()})`;
  });

  // 2. Convert strong / b: <strong>text</strong> -> **text**
  text = text.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, inner) => {
    return `**${inner.replace(/<[^>]+>/g, "").trim()}**`;
  });

  // 3. Convert em / i: <em>text</em> -> *text*
  text = text.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, inner) => {
    return `*${inner.replace(/<[^>]+>/g, "").trim()}*`;
  });

  // 4. Convert inline code: <code>text</code> -> `text`
  text = text.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, inner) => {
    return `\`${inner.replace(/<[^>]+>/g, "").trim()}\``;
  });

  // 5. Convert tables: <table>...</table> -> Markdown table
  text = text.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    const trMatches = tableContent.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
    for (const tr of trMatches) {
      const cells: string[] = [];
      const cellMatches = tr.match(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi) || [];
      for (const cell of cellMatches) {
        const cleanCell = cell
          .replace(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/i, "$1")
          .replace(/<[^>]+>/g, "")
          .trim();
        cells.push(cleanCell);
      }
      if (cells.length > 0) rows.push(cells);
    }

    if (rows.length === 0) return "";
    const colCount = Math.max(...rows.map((r) => r.length));
    const headerRow = rows[0].concat(Array(colCount - rows[0].length).fill(""));
    const dividerRow = Array(colCount).fill("---");
    const dataRows = rows.slice(1).map((r) => r.concat(Array(colCount - r.length).fill("")));

    const mdTable = [
      `| ${headerRow.join(" | ")} |`,
      `| ${dividerRow.join(" | ")} |`,
      ...dataRows.map((r) => `| ${r.join(" | ")} |`),
    ].join("\n");

    return `\n\n${mdTable}\n\n`;
  });

  // 6. Convert Q&A pairs (h3 question ending in ? followed by p answer)
  text = text.replace(/<h3\b[^>]*>([\s\S]*?\?)<\/h3>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, q, a) => {
    const cleanQ = q.replace(/<[^>]+>/g, "").replace(/^Q:\s*/i, "").trim();
    const cleanA = a.replace(/<[^>]+>/g, "").replace(/^A:\s*/i, "").trim();
    return `\n\n**Q: ${cleanQ}**\n**A:** ${cleanA}\n\n`;
  });

  // 7. Convert headings:
  text = text.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_, inner) => {
    return `\n\n## ${inner.replace(/<[^>]+>/g, "").trim()}\n\n`;
  });

  text = text.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_, inner) => {
    return `\n\n### ${inner.replace(/<[^>]+>/g, "").trim()}\n\n`;
  });

  // 8. Convert blockquotes:
  text = text.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    let cleanQuote = inner
      .replace(/<p\b[^>]*>/gi, "")
      .replace(/<\/p>/gi, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    cleanQuote = cleanQuote.replace(/^(?:\*\*FairPlay Pro Tip:\*\*|FairPlay Pro Tip:)\s*/i, "");
    return `\n\n> **FairPlay Pro Tip:** ${cleanQuote}\n\n`;
  });

  // 9. Convert lists:
  text = text.replace(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    const liMatches = inner.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const items = liMatches.map((li: string) => {
      const cleanLi = li.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/i, "$1").replace(/<[^>]+>/g, "").trim();
      return `- ${cleanLi}`;
    });
    return `\n\n${items.join("\n")}\n\n`;
  });

  text = text.replace(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    const liMatches = inner.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const items = liMatches.map((li: string, idx: number) => {
      const cleanLi = li.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/i, "$1").replace(/<[^>]+>/g, "").trim();
      return `${idx + 1}. ${cleanLi}`;
    });
    return `\n\n${items.join("\n")}\n\n`;
  });

  // 10. Convert paragraph tags:
  text = text.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => {
    const trimmed = inner.replace(/<[^>]+>/g, "").trim();
    return trimmed ? `\n\n${trimmed}\n\n` : "";
  });

  // 11. Strip any remaining HTML tags:
  text = text.replace(/<[^>]+>/g, "");

  // 12. Decode common HTML entities:
  text = decodeHtmlEntities(text);

  // 13. Split into clean paragraphs:
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
