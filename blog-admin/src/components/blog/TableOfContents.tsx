'use client';

import React from 'react';
import { ListOrdered } from 'lucide-react';

interface TableOfContentsProps {
  content: string[] | string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const paragraphs = Array.isArray(content)
    ? content
    : content.split(/\n\n+/).filter(Boolean);

  const items: TocItem[] = [];

  paragraphs.forEach((block) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^##\s+/, '');
      items.push({ id: slugifyHeading(text), text, level: 2 });
    } else if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^###\s+/, '');
      items.push({ id: slugifyHeading(text), text, level: 3 });
    }
  });

  if (items.length < 2) return null;

  return (
    <nav className="p-5 rounded-2xl bg-fairplay-card/80 border border-fairplay-border backdrop-blur-sm">
      <div className="flex items-center gap-2.5 text-fairplay-gold font-bold text-sm uppercase tracking-wider mb-3">
        <ListOrdered className="w-4 h-4" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item, idx) => (
          <li key={idx} className={item.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${item.id}`}
              className="text-gray-300 hover:text-fairplay-gold transition-colors block py-0.5 line-clamp-1"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
