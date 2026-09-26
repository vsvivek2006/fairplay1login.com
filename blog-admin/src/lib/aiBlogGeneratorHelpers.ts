/**
 * Shared utility helpers for AI blog generation.
 * Extracted here to avoid circular imports between aiBlogGenerator.ts
 * and the new src/lib/ai/ sub-modules.
 */

/**
 * Curated high-resolution sports, cricket, and casino cover images (Unsplash).
 */
export const CURATED_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80', // Cricket stadium
  'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80', // Cricket batsman action
  'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1200&q=80', // Cricket ball & pitch
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80', // Casino roulette
  'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=80', // Poker chips & cards
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80', // Digital finance & instant UPI
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80', // Sports arena
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80', // Sports exchange
];

export function selectRandomCoverImage(): string {
  const index = Math.floor(Math.random() * CURATED_COVER_IMAGES.length);
  return CURATED_COVER_IMAGES[index];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function optimizeSeoSlug(rawSlug: string, focusKeyword: string): string {
  const clean = slugify(rawSlug);
  if (clean.length > 0 && clean.length <= 50) return clean;
  const kwSlug = slugify(focusKeyword);
  return kwSlug || clean.substring(0, 50).replace(/-+$/, '');
}
