import { BlogPost } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

// Projected fields for high-speed list views (excludes heavy content payload)
export const POST_LIST_FIELDS =
  'id,slug,title,excerpt,cover_image,author,category,status,published_at,created_at,tags,reading_time_minutes,seo_title,seo_description';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}
const listCache: Record<string, CacheEntry<BlogPost[]>> = {};
const CACHE_TTL_MS = 5 * 1000; // 5s short cache to prevent redundant concurrent queries while staying fresh

export function invalidatePostsCache(): void {
  for (const k in listCache) {
    delete listCache[k];
  }
}

/**
 * Resolves the target site for a post (e.g. 'fairplaylive.io')
 */
export function resolveTargetSite(post: Partial<BlogPost>): string {
  if (post.target_site) return post.target_site;
  const tags = post.tags || [];
  const siteTag = tags.find((t) => typeof t === 'string' && t.startsWith('site:'));
  if (siteTag) return siteTag.replace('site:', '');
  const contentStr = Array.isArray(post.content) ? post.content.join(' ') : String(post.content || '');
  if (contentStr.includes('fairplaylive.io') && !contentStr.includes('fairplay1login.com')) return 'fairplaylive.io';
  return 'fairplay1login.com';
}

const FAIRPLAY_POST_COLUMNS = [
  'id',
  'slug',
  'title',
  'excerpt',
  'content',
  'cover_image',
  'author',
  'category',
  'status',
  'ai_generated',
  'seo_title',
  'seo_description',
  'tags',
  'reading_time_minutes',
  'published_at',
  'created_at',
  'updated_at',
] as const;

function sanitizeForDatabase(post: any): Record<string, any> {
  const payload: Record<string, any> = {};
  for (const col of FAIRPLAY_POST_COLUMNS) {
    if (post[col] !== undefined) {
      payload[col] = post[col];
    }
  }
  // Auto-fill seo fields if aliases were passed
  if (!payload.seo_title && post.meta_title) payload.seo_title = post.meta_title;
  if (!payload.seo_description && post.meta_description) payload.seo_description = post.meta_description;
  return payload;
}

function normalizePost(post: BlogPost): BlogPost {
  return {
    ...post,
    target_site: resolveTargetSite(post),
  };
}

/**
 * Fetch all posts - Direct from Supabase with column projection (NO fallback)
 */
export async function getAllPosts(
  filter: 'all' | 'published' | 'draft' = 'all',
  includeFullContent = false,
  siteFilter: string = 'fairplay1login.com'
): Promise<BlogPost[]> {
  const cacheKey = `${filter}:${includeFullContent ? 'full' : 'projected'}:${siteFilter || 'fairplay1login.com'}`;
  const now = Date.now();
  const cached = listCache[cacheKey];

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  if (!isSupabaseConfigured || !supabase) {
    console.error('[postsStore] Supabase is not configured. Direct database connection required.');
    return [];
  }

  const selectFields = includeFullContent ? '*' : POST_LIST_FIELDS;
  let query = supabase
    .from('fairplay_posts')
    .select(selectFields)
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[postsStore] Supabase fetch error:', error.message);
    throw new Error(`Failed to load posts from database: ${error.message}`);
  }

  const posts = ((data || []) as unknown as BlogPost[]).map(normalizePost);

  const sorted = [...posts].sort((a, b) => {
    const dateA = new Date(b.published_at || b.created_at).getTime();
    const dateB = new Date(a.published_at || a.created_at).getTime();
    return dateA - dateB;
  });

  let filtered = filter === 'all' ? sorted : sorted.filter((p) => p.status === filter);

  if (siteFilter && siteFilter !== 'all') {
    const siteMatches = filtered.filter((p) => p.target_site === siteFilter);
    if (siteMatches.length > 0) {
      filtered = siteMatches;
    }
  }

  listCache[cacheKey] = { data: filtered, cachedAt: now };
  return filtered;
}

/**
 * Fetch single post by slug - Direct from Supabase (NO fallback)
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[postsStore] Supabase is not configured.');
    return null;
  }

  const { data, error } = await supabase
    .from('fairplay_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[postsStore] Supabase getPostBySlug error:', error.message);
    return null;
  }

  return data ? normalizePost(data as BlogPost) : null;
}

/**
 * Fetch single post by id - Direct from Supabase (NO fallback)
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('[postsStore] Supabase is not configured.');
    return null;
  }

  const { data, error } = await supabase
    .from('fairplay_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[postsStore] Supabase getPostById error:', error.message);
    return null;
  }

  return data ? normalizePost(data as BlogPost) : null;
}

/**
 * Create a new post - writes directly to Supabase (NO fallback)
 */
export async function createPost(
  data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
): Promise<BlogPost> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Database is not configured. Cannot save article.');
  }

  const now = new Date().toISOString();
  const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Calculate reading time (~200 words per minute)
  const fullText = Array.isArray(data.content) ? data.content.join(' ') : String(data.content || '');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const targetSite = data.target_site || 'fairplay1login.com';
  const cleanTags = (data.tags || []).filter((t) => typeof t === 'string' && !t.startsWith('site:'));
  const tagsWithSite = [...cleanTags, `site:${targetSite}`];

  const newPost: BlogPost = {
    ...data,
    id,
    target_site: targetSite,
    tags: tagsWithSite,
    reading_time_minutes: readingTime,
    created_at: now,
    updated_at: now,
    published_at: data.status === 'published' ? data.published_at || now : null,
  };

  invalidatePostsCache();

  const dbPayload = sanitizeForDatabase(newPost);
  const { error } = await supabase.from('fairplay_posts').insert([dbPayload]);
  if (error) {
    console.error('[postsStore] Supabase insert error:', error.message);
    throw new Error(`Failed to create post in database: ${error.message}`);
  }

  return newPost;
}

/**
 * Update existing post - updates directly in Supabase (NO fallback)
 */
export async function updatePost(
  id: string,
  updates: Partial<BlogPost>
): Promise<BlogPost> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Database is not configured. Cannot update article.');
  }

  const existing = await getPostById(id);
  if (!existing) throw new Error(`Post with id ${id} not found in database`);

  const now = new Date().toISOString();
  let publishedAt = updates.published_at ?? existing.published_at;
  if (updates.status === 'published' && !publishedAt) {
    publishedAt = now;
  }

  let readingTime = existing.reading_time_minutes;
  if (updates.content) {
    const fullText = Array.isArray(updates.content) ? updates.content.join(' ') : String(updates.content);
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;
    readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  const targetSite = updates.target_site || existing.target_site || 'fairplay1login.com';
  let tagsWithSite = existing.tags;
  if (updates.tags || updates.target_site) {
    const baseTags = updates.tags !== undefined ? updates.tags : existing.tags;
    const cleanTags = (baseTags || []).filter((t) => typeof t === 'string' && !t.startsWith('site:'));
    tagsWithSite = [...cleanTags, `site:${targetSite}`];
  }

  const { id: _ignoredId, created_at: _ignoredCreatedAt, target_site: _ignoredSite, ...safeUpdates } = updates;

  const updated: BlogPost = {
    ...existing,
    ...safeUpdates,
    id: existing.id,
    target_site: targetSite,
    tags: tagsWithSite,
    created_at: existing.created_at,
    reading_time_minutes: readingTime,
    published_at: publishedAt,
    updated_at: now,
  };

  invalidatePostsCache();

  const dbPayload = sanitizeForDatabase(updated);
  delete dbPayload.id;
  delete dbPayload.created_at;

  const { error } = await supabase
    .from('fairplay_posts')
    .update(dbPayload)
    .eq('id', id);

  if (error) {
    console.error('[postsStore] Supabase update error:', error.message);
    throw new Error(`Failed to update post in database: ${error.message}`);
  }

  return updated;
}

/**
 * Delete post - deletes directly from Supabase (NO fallback)
 */
export async function deletePost(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Database is not configured. Cannot delete article.');
  }

  invalidatePostsCache();

  const { error } = await supabase.from('fairplay_posts').delete().eq('id', id);
  if (error) {
    console.error('[postsStore] Supabase delete error:', error.message);
    throw new Error(`Failed to delete post from database: ${error.message}`);
  }

  return true;
}

export async function publishPost(id: string): Promise<BlogPost> {
  return updatePost(id, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
}
