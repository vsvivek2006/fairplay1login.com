import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read environment variables from .env.local or process.env
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const envLocalPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.replace('VITE_SUPABASE_URL=', '').trim();
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = trimmed.replace('VITE_SUPABASE_ANON_KEY=', '').trim();
    }
  });
}

const SITE_URL = 'https://fairplay1login.com';

// 2. Scan all static pages in src/data/*.ts
const dataDir = path.join(rootDir, 'src', 'data');
const dataFiles = [
  'appPages.ts',
  'corePages.ts',
  'fairplayPages.ts',
  'guidePages.ts',
  'legalPages.ts',
  'loginPages.ts',
  'sportsPages.ts',
];

const staticUrls = [];

dataFiles.forEach((file) => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const fileStat = fs.statSync(filePath);
  const fileModDate = new Date(fileStat.mtime).toISOString().split('T')[0];

  const parts = content.split('export const ');
  parts.slice(1).forEach((part) => {
    const slugMatch = part.match(/slug:\s*['"]([^'"]+)['"]/);
    const categoryMatch = part.match(/category:\s*['"]([^'"]+)['"]/);
    if (slugMatch) {
      let slug = slugMatch[1];
      if (!slug.startsWith('/')) slug = `/${slug}`;
      if (!slug.endsWith('/') && slug !== '/') slug = `${slug}/`;

      let priority = '0.8';
      let changefreq = 'weekly';

      if (slug === '/') {
        priority = '1.0';
        changefreq = 'daily';
      } else if (categoryMatch && categoryMatch[1].toLowerCase().includes('legal')) {
        priority = '0.5';
        changefreq = 'monthly';
      } else if (slug.includes('ipl') || slug.includes('sports')) {
        priority = '0.9';
        changefreq = 'daily';
      } else if (slug.includes('app') || slug.includes('login') || slug.includes('download')) {
        priority = '0.9';
        changefreq = 'weekly';
      }

      staticUrls.push({
        loc: `${SITE_URL}${slug === '/' ? '/' : slug}`,
        lastmod: fileModDate,
        changefreq,
        priority,
      });
    }
  });
});

// Canonical Blog Index Page
staticUrls.push({
  loc: `${SITE_URL}/blogs/`,
  lastmod: new Date().toISOString().split('T')[0],
  changefreq: 'daily',
  priority: '0.9',
});

// Deduplicate static URLs
const urlMap = new Map();
staticUrls.forEach((item) => {
  urlMap.set(item.loc, item);
});

// 3. Query Supabase for dynamic blog posts
async function fetchSupabaseBlogPosts() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[sitemap-generator] Supabase credentials not found. Skipping dynamic posts.');
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('fairplay_posts')
      .select('slug, published_at, updated_at, created_at, status, tags, content')
      .eq('status', 'published');

    if (error) {
      console.error('[sitemap-generator] Supabase error:', error.message);
      return [];
    }

    // Filter strictly for fairplay1login.com (ignore fairplaylive.io posts)
    const domainPosts = (data || []).filter((post) => {
      const tags = post.tags || [];
      const siteTag = tags.find((t) => typeof t === 'string' && t.startsWith('site:'));
      if (siteTag) {
        return siteTag.toLowerCase() === 'site:fairplay1login.com';
      }
      const contentStr = Array.isArray(post.content) ? post.content.join(' ') : String(post.content || '');
      return contentStr.includes('fairplay1login.com') && !contentStr.includes('fairplaylive.io');
    });

    if (domainPosts.length === 0) {
      console.log('[sitemap-generator] No published posts for fairplay1login.com found in Supabase.');
      return [];
    }

    console.log(`[sitemap-generator] Found ${domainPosts.length} published blog posts for fairplay1login.com in Supabase.`);
    return domainPosts.map((post) => {
      const cleanSlug = post.slug.replace(/^\/+|\/+$/g, '');
      const rawDate = post.updated_at || post.published_at || post.created_at || new Date().toISOString();
      const lastmod = new Date(rawDate).toISOString().split('T')[0];

      return {
        loc: `${SITE_URL}/blog/${cleanSlug}/`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.8',
      };
    });
  } catch (err) {
    console.error('[sitemap-generator] Failed to fetch dynamic posts:', err);
    return [];
  }
}

async function generate() {
  console.log('[sitemap-generator] Generating sitemap.xml...');
  const dynamicPosts = await fetchSupabaseBlogPosts();

  dynamicPosts.forEach((post) => {
    urlMap.set(post.loc, post);
  });

  const allUrls = Array.from(urlMap.values());

  // Sort URLs: homepage first, then alphabetically
  allUrls.sort((a, b) => {
    if (a.loc === `${SITE_URL}/`) return -1;
    if (b.loc === `${SITE_URL}/`) return 1;
    return a.loc.localeCompare(b.loc);
  });

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  allUrls.forEach(({ loc, lastmod, changefreq, priority }) => {
    xmlLines.push(
      `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
    );
  });

  xmlLines.push('</urlset>');
  xmlLines.push('');

  const xmlContent = xmlLines.join('\n');

  // Write to public/sitemap.xml
  const publicPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, xmlContent, 'utf8');
  console.log(`[sitemap-generator] Successfully wrote ${allUrls.length} URLs to ${publicPath}`);

  // Write to dist/sitemap.xml if dist exists
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, xmlContent, 'utf8');
    console.log(`[sitemap-generator] Also updated ${distPath}`);
  }
}

generate().catch((err) => {
  console.error('[sitemap-generator] Fatal error:', err);
  process.exit(1);
});
