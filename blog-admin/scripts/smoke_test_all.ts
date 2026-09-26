import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());

import { getAllPosts, getPostBySlug } from '../src/lib/postsStore';
import { SITE_CONFIG } from '../src/config/site';

async function verifyAll() {
  console.log('=== FAIRPLAY BLOG INTEGRITY AUDIT ===');
  
  // 1. Check Site Config
  if (!SITE_CONFIG.name || !SITE_CONFIG.whatsappRegisterUrl) {
    throw new Error('SITE_CONFIG is missing required fields');
  }
  console.log(`[PASS] Site Config: ${SITE_CONFIG.name} (${SITE_CONFIG.domain})`);

  // 2. Check Posts Data
  const posts = await getAllPosts('all');
  console.log(`[PASS] Total Posts Loaded: ${posts.length}`);
  if (posts.length < 3) {
    throw new Error(`Expected at least 3 posts, got ${posts.length}`);
  }

  for (const p of posts) {
    if (!p.id || !p.title || !p.slug || !p.content || p.content.length === 0) {
      throw new Error(`Invalid post structure: ${p.id}`);
    }
    const retrieved = await getPostBySlug(p.slug);
    if (!retrieved || retrieved.id !== p.id) {
      throw new Error(`Slug retrieval failed for ${p.slug}`);
    }
    console.log(`  ✓ Verified Post: "${p.title.slice(0, 45)}..." -> /blog/${p.slug}`);
  }

  // 3. Check Categories
  const categories = SITE_CONFIG.categories;
  console.log(`[PASS] Categories Defined: ${categories.length}`);
  for (const c of categories) {
    console.log(`  ✓ Category: ${c.name} (${c.slug})`);
  }

  console.log('=== ALL INTEGRITY CHECKS PASSED ===');
}

verifyAll().catch((err) => {
  console.error('Audit Failed:', err);
  process.exit(1);
});
