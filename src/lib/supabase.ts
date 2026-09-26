import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const SUPABASE_URL = metaEnv?.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = metaEnv?.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
