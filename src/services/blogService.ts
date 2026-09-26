import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/types/BlogPost';

// Projected fields for fast card feeds (avoids downloading huge paragraphs)
const LIST_PROJECTION =
  'id, slug, title, excerpt, cover_image, author, category, status, reading_time_minutes, tags, published_at, created_at';

// SWR In-Memory Cache
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}
let postsListCache: CacheEntry<BlogPost[]> | null = null;
const postDetailCache = new Map<string, CacheEntry<BlogPost>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Strict domain isolation filter:
 * Ensures articles for fairplaylive.io NEVER appear on fairplay1login.com,
 * and vice-versa.
 */
export function isPostForCurrentDomain(post: { tags?: string[] | null; content?: any }): boolean {
  const tags = post.tags || [];
  const siteTag = tags.find((t) => typeof t === 'string' && t.startsWith('site:'));
  if (siteTag) {
    return siteTag.toLowerCase() === 'site:fairplay1login.com';
  }
  // Fallback: check content for domain keywords if untagged
  const contentStr = Array.isArray(post.content) ? post.content.join(' ') : String(post.content || '');
  return contentStr.includes('fairplay1login.com') && !contentStr.includes('fairplaylive.io');
}

export async function fetchPublishedPosts(force = false): Promise<BlogPost[]> {
  const now = Date.now();

  // Instant SWR Cache Hit (0ms)
  if (!force && postsListCache && now - postsListCache.cachedAt < CACHE_TTL_MS) {
    return postsListCache.data;
  }

  try {
    const { data, error } = await supabase
      .from('fairplay_posts')
      .select(LIST_PROJECTION)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const allPosts = data as BlogPost[];
      const domainPosts = allPosts.filter(isPostForCurrentDomain);
      postsListCache = { data: domainPosts, cachedAt: now };
      return domainPosts;
    }
    if (error) {
      console.error('[blogService] Supabase fetch error:', error.message);
    }
  } catch (err) {
    console.error('[blogService] Network error fetching posts:', err);
  }

  if (postsListCache) return postsListCache.data;
  return [];
}

export async function fetchPostBySlug(slug: string, force = false): Promise<BlogPost | null> {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const now = Date.now();

  // Instant Cache Hit for single post reader (0ms)
  const cached = postDetailCache.get(cleanSlug);
  if (!force && cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const { data, error } = await supabase
      .from('fairplay_posts')
      .select('*')
      .eq('slug', cleanSlug)
      .eq('status', 'published')
      .maybeSingle();

    if (!error && data) {
      const post = data as BlogPost;
      if (isPostForCurrentDomain(post)) {
        postDetailCache.set(cleanSlug, { data: post, cachedAt: now });
        return post;
      }
      // If post exists in DB but belongs to fairplaylive.io, do not expose it on fairplay1login.com
      return null;
    }
    if (error) {
      console.error('[blogService] Error fetching post by slug from Supabase:', error.message);
    }
  } catch (err) {
    console.error('[blogService] Error fetching post by slug:', err);
  }

  return null;
}
