import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());

import { getAllPosts, getPostBySlug, createPost, updatePost, deletePost } from '../src/lib/postsStore';

async function runStoreTests() {
  console.log('--- Testing postsStore CRUD ---');

  // 1. Initial count
  const initialPosts = await getAllPosts('all');
  console.log(`Initial posts count: ${initialPosts.length}`);
  if (initialPosts.length === 0) throw new Error('Expected seed posts');

  // 2. Create post
  const testSlug = `test-article-${Date.now()}`;
  const created = await createPost({
    title: 'Test FairPlay Cricket Article',
    slug: testSlug,
    category: 'Cricket Betting',
    excerpt: 'Test excerpt for verification',
    content: ['First test paragraph.', '## Key Strategy\n\nSecond test paragraph.'],
    cover_image: null,
    author: 'Test Author',
    status: 'draft',
    ai_generated: true,
    seo_title: 'Test SEO Title',
    seo_description: 'Test SEO Description',
    tags: ['Cricket', 'Test'],
    published_at: null,
  });

  console.log(`Created test post with id: ${created.id}`);
  if (created.slug !== testSlug) throw new Error('Slug mismatch');
  if (created.reading_time_minutes !== 1) throw new Error('Reading time calculation failed');

  // 3. Retrieve post by slug
  const retrieved = await getPostBySlug(testSlug);
  if (!retrieved || retrieved.title !== 'Test FairPlay Cricket Article') {
    throw new Error('Could not retrieve post by slug');
  }
  console.log('Successfully retrieved post by slug');

  // 4. Update post
  const updated = await updatePost(created.id, {
    title: 'Updated Test FairPlay Article',
    status: 'published',
  });
  if (updated.title !== 'Updated Test FairPlay Article' || updated.status !== 'published') {
    throw new Error('Update failed');
  }
  console.log('Successfully updated post title and status');

  // 5. Delete post
  const deleted = await deletePost(created.id);
  if (!deleted) throw new Error('Delete failed');
  console.log('Successfully deleted test post');

  // Verify deletion
  const verifyDelete = await getPostBySlug(testSlug);
  if (verifyDelete !== null) throw new Error('Post still exists after delete');

  console.log('--- All postsStore tests PASSED! ---');
}

runStoreTests().catch((err) => {
  console.error('Store Test Failed:', err);
  process.exit(1);
});
