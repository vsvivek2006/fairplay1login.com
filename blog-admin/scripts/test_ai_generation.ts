import { generateBlogPost } from '../src/lib/aiBlogGenerator';
import fs from 'fs';
import path from 'path';

// Load .env.local variables manually for CLI runner
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

async function runAiGenerationTest() {
  console.log('--- Testing FairPlay AI Blog Generation ---');
  console.log(`GROQ_API_KEY present: ${Boolean(process.env.GROQ_API_KEY)}`);
  console.log(`GEMINI_API_KEY present: ${Boolean(process.env.GEMINI_API_KEY)}`);

  const startTime = Date.now();
  const blog = await generateBlogPost({
    topic: 'How to Get a FairPlay Cricket ID on WhatsApp with 300% Bonus',
    focusKeyword: 'FairPlay Cricket ID WhatsApp',
    secondaryKeywords: 'IPL 2026 odds, 2 minute withdrawal, instant online cricket ID',
    category: 'Cricket Betting',
    wordCount: 800,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nGenerated in ${duration}s using ${blog.modelUsed}`);
  console.log(`Title: ${blog.title}`);
  console.log(`Slug: ${blog.slug}`);
  console.log(`SEO Title: ${blog.seoTitle}`);
  console.log(`SEO Description: ${blog.seoDescription}`);
  console.log(`Category: ${blog.category}`);
  console.log(`Paragraphs count: ${blog.content.length}`);
  console.log(`Cover Image: ${blog.coverImage}`);
  console.log(`Tags: ${blog.tags.join(', ')}`);

  // Assertions
  if (!blog.title || blog.title.length < 20) throw new Error('Title too short');
  if (!blog.slug || !blog.slug.includes('fairplay')) throw new Error('Slug keyword mismatch');
  if (blog.content.length < 5) throw new Error('Content too sparse');

  // Verify internal links
  const joinedContent = blog.content.join(' ');
  const hasLinks = joinedContent.includes('](');
  console.log(`Internal markdown links present: ${hasLinks}`);

  console.log('\n--- AI Blog Generation Test PASSED! ---');
}

runAiGenerationTest().catch((err) => {
  console.error('AI Generation Test Failed:', err);
  process.exit(1);
});
