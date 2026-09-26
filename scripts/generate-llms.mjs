import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SITE_URL = 'https://fairplay1login.com';

// 1. Read environment variables from .env.local or process.env for dynamic blog posts
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

async function fetchSupabasePosts() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('fairplay_posts')
      .select('title, slug, excerpt, content, published_at, updated_at, status, tags')
      .eq('status', 'published');

    if (error || !data) {
      return [];
    }

    // Filter strictly for fairplay1login.com
    return data.filter((post) => {
      const tags = post.tags || [];
      const siteTag = tags.find((t) => typeof t === 'string' && t.startsWith('site:'));
      if (siteTag) {
        return siteTag.toLowerCase() === 'site:fairplay1login.com';
      }
      const contentStr = Array.isArray(post.content) ? post.content.join(' ') : String(post.content || '');
      return contentStr.includes('fairplay1login.com') && !contentStr.includes('fairplaylive.io');
    });
  } catch {
    return [];
  }
}

async function generateLLMFiles() {
  console.log('[llms-generator] Starting LLM file generation...');

  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const dataFiles = [
    { file: '/src/data/corePages.ts', section: 'Core Pages & Platform Hub' },
    { file: '/src/data/fairplayPages.ts', section: 'Fairplay In-Depth Guides & Ecosystem' },
    { file: '/src/data/appPages.ts', section: 'Mobile App & APK Installation Guides' },
    { file: '/src/data/loginPages.ts', section: 'Account Registration, Login & Security' },
    { file: '/src/data/sportsPages.ts', section: 'Cricket, IPL & Sports Coverage' },
    { file: '/src/data/guidePages.ts', section: 'Player Guides, Platform Mechanics & Safety' },
    { file: '/src/data/legalPages.ts', section: 'Legal, Security & Responsible Gaming Policies' },
  ];

  const categorizedPages = [];

  for (const { file, section } of dataFiles) {
    try {
      const mod = await vite.ssrLoadModule(file);
      const pages = [];
      for (const key of Object.keys(mod)) {
        const item = mod[key];
        if (item && item.slug) {
          pages.push(item);
        }
      }
      categorizedPages.push({ section, pages });
    } catch (err) {
      console.error(`[llms-generator] Failed to load ${file}:`, err);
    }
  }

  const dynamicPosts = await fetchSupabasePosts();
  await vite.close();

  // -------------------------------------------------------------
  // 1. BUILD llms.txt (Curated Index adhering to llmstxt.org spec)
  // -------------------------------------------------------------
  const llmsIndex = [
    '# Fairplay',
    '',
    '> Fairplay (fairplay1login.com) is a premier digital sports engagement and gaming exchange platform in India. It offers comprehensive match analytics, live sports updates, IPL 2026 coverage, mobile application downloads (Android APK & iOS), instant 24/7 account access, and strict user security protocols.',
    '',
    'This directory provides a structured index of official platform documentation, user guides, mobile installation instructions, account management procedures, sports rules, and policy documents for AI models, search crawlers, and automated assistants.',
    '',
    '## Quick Facts',
    '- **Domain:** https://fairplay1login.com',
    '- **Primary Focus:** Online cricket & sports betting guides, Fairplay login ID, mobile APK download, match updates, and 24/7 customer support.',
    '- **Supported Platforms:** Web (Desktop & Mobile), Android APK, Progressive Web App (PWA).',
    '- **Primary Sports Coverage:** Cricket (IPL, ICC Tournaments, T20 Leagues), Football, Tennis, Live Casino, and Virtual Sports.',
    '- **Security & Compliance:** Responsible Gaming, Privacy Policy, Terms & Conditions, 24/7 Account Security.',
    '',
  ];

  for (const group of categorizedPages) {
    llmsIndex.push(`## ${group.section}`);
    llmsIndex.push('');
    for (const page of group.pages) {
      const cleanSlug = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
      const canonicalUrl = `${SITE_URL}${cleanSlug.endsWith('/') ? cleanSlug : cleanSlug + '/'}`;
      const cleanDesc = (page.metaDescription || page.intro || '').replace(/\s+/g, ' ').trim();
      llmsIndex.push(`- [${page.title}](${canonicalUrl}): ${cleanDesc}`);
    }
    llmsIndex.push('');
  }

  if (dynamicPosts.length > 0) {
    llmsIndex.push('## Official Blog & Latest Articles');
    llmsIndex.push('');
    for (const post of dynamicPosts) {
      const cleanSlug = post.slug.replace(/^\/+|\/+$/g, '');
      const canonicalUrl = `${SITE_URL}/blog/${cleanSlug}/`;
      const excerpt = (post.excerpt || '').replace(/\s+/g, ' ').trim();
      llmsIndex.push(`- [${post.title}](${canonicalUrl}): ${excerpt || 'Official blog post and guide on Fairplay.'}`);
    }
    llmsIndex.push('');
  }

  // Optional Section as specified by llmstxt.org standard
  llmsIndex.push('## Optional');
  llmsIndex.push('');
  llmsIndex.push(`- [Full Documentation & Consolidated Knowledge Base](${SITE_URL}/llms-full.txt): Complete, consolidated full-text markdown documentation containing all guides, sections, rules, and FAQs.`);
  llmsIndex.push(`- [XML Sitemap](${SITE_URL}/sitemap.xml): Full XML sitemap containing all canonical URLs and update timestamps for search engines.`);
  llmsIndex.push(`- [Robots Directives](${SITE_URL}/robots.txt): Official crawler and AI agent robot exclusion directives.`);
  llmsIndex.push('');

  const llmsTxtContent = llmsIndex.join('\n');
  const publicLlmsPath = path.join(rootDir, 'public', 'llms.txt');
  fs.writeFileSync(publicLlmsPath, llmsTxtContent, 'utf8');
  console.log(`[llms-generator] Successfully wrote llms.txt to ${publicLlmsPath}`);

  // -------------------------------------------------------------
  // 2. BUILD llms-full.txt (Comprehensive Knowledge Base)
  // -------------------------------------------------------------
  const fullContent = [
    '# Fairplay — Comprehensive Knowledge Base & Full Platform Documentation',
    '',
    '> Complete, authoritative reference guide for Fairplay (fairplay1login.com). Contains unedited platform information, step-by-step account tutorials, APK installation manuals, sports and IPL 2026 coverage, security practices, frequently asked questions, and compliance policies.',
    '',
    `Canonical Domain: ${SITE_URL}`,
    `Generated On: ${new Date().toISOString().split('T')[0]}`,
    '',
    '---',
    '',
  ];

  for (const group of categorizedPages) {
    fullContent.push(`## Topic Cluster: ${group.section}`);
    fullContent.push('');

    for (const page of group.pages) {
      const cleanSlug = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
      const canonicalUrl = `${SITE_URL}${cleanSlug.endsWith('/') ? cleanSlug : cleanSlug + '/'}`;

      fullContent.push(`### ${page.title}`);
      fullContent.push(`- **URL:** ${canonicalUrl}`);
      fullContent.push(`- **Category:** ${page.category}`);
      if (page.keywords) {
        fullContent.push(`- **Keywords:** ${page.keywords}`);
      }
      fullContent.push('');

      if (page.h1 && page.h1 !== page.title) {
        fullContent.push(`#### ${page.h1}`);
        fullContent.push('');
      }

      if (page.intro) {
        fullContent.push(page.intro);
        fullContent.push('');
      }

      if (Array.isArray(page.sections) && page.sections.length > 0) {
        for (const sec of page.sections) {
          fullContent.push(`#### ${sec.heading}`);
          fullContent.push('');
          if (Array.isArray(sec.paragraphs)) {
            for (const p of sec.paragraphs) {
              fullContent.push(p);
              fullContent.push('');
            }
          }
          if (Array.isArray(sec.subsections)) {
            for (const sub of sec.subsections) {
              fullContent.push(`##### ${sub.heading}`);
              fullContent.push('');
              if (Array.isArray(sub.paragraphs)) {
                for (const p of sub.paragraphs) {
                  fullContent.push(p);
                  fullContent.push('');
                }
              }
            }
          }
        }
      }

      if (Array.isArray(page.faqs) && page.faqs.length > 0) {
        fullContent.push('#### Frequently Asked Questions');
        fullContent.push('');
        for (const faq of page.faqs) {
          fullContent.push(`**Q: ${faq.question}**`);
          fullContent.push('');
          fullContent.push(`A: ${faq.answer}`);
          fullContent.push('');
        }
      }

      fullContent.push('---');
      fullContent.push('');
    }
  }

  if (dynamicPosts.length > 0) {
    fullContent.push('## Topic Cluster: Published Articles & Blog Posts');
    fullContent.push('');
    for (const post of dynamicPosts) {
      const cleanSlug = post.slug.replace(/^\/+|\/+$/g, '');
      const canonicalUrl = `${SITE_URL}/blog/${cleanSlug}/`;
      fullContent.push(`### ${post.title}`);
      fullContent.push(`- **URL:** ${canonicalUrl}`);
      fullContent.push(`- **Date:** ${post.published_at || post.updated_at || 'Recent'}`);
      fullContent.push('');
      if (post.excerpt) {
        fullContent.push(post.excerpt.replace(/https?:\/\/fairplaylive\.io/g, SITE_URL));
        fullContent.push('');
      }
      if (post.content) {
        fullContent.push(post.content.replace(/https?:\/\/fairplaylive\.io/g, SITE_URL));
        fullContent.push('');
      }
      fullContent.push('---');
      fullContent.push('');
    }
  }

  const llmsFullTxtContent = fullContent.join('\n');
  const publicLlmsFullPath = path.join(rootDir, 'public', 'llms-full.txt');
  fs.writeFileSync(publicLlmsFullPath, llmsFullTxtContent, 'utf8');
  console.log(`[llms-generator] Successfully wrote llms-full.txt to ${publicLlmsFullPath}`);

  // Write to dist if dist exists
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxtContent, 'utf8');
    fs.writeFileSync(path.join(distDir, 'llms-full.txt'), llmsFullTxtContent, 'utf8');
    console.log('[llms-generator] Also updated dist/llms.txt and dist/llms-full.txt');
  }

  console.log('[llms-generator] Completed successfully.');
}

generateLLMFiles().catch((err) => {
  console.error('[llms-generator] Error generating LLM files:', err);
  process.exit(1);
});
