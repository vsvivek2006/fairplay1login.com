import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      process.env[k.trim()] = v.join('=').trim();
    }
  }
}

import { getAllPosts } from './src/lib/postsStore.js';
import { supabase } from './src/lib/supabase.js';

async function main() {
  try {
    console.log('Testing Supabase direct query...');
    const { data, error } = await supabase.from('fairplay_posts').select('*');
    if (error) {
      console.error('Supabase query error:', error);
    } else {
      console.log('Supabase query success! Rows count:', data.length);
      console.log('Columns of first row:', Object.keys(data[0] || {}));
    }

    console.log('\nTesting getAllPosts()...');
    const posts = await getAllPosts();
    console.log('getAllPosts success! Count:', posts.length);
  } catch (err) {
    console.error('Crash in main:', err);
  }
}

main();
