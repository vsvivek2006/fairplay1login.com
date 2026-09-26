import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Dynamically ensure server-side environment variables are populated from .env.local
// without hardcoding any sensitive credentials in source code.
function ensureServerEnvLoaded(): void {
  if (typeof window !== 'undefined') return;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line: string) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = (match[2] || '').trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key] && value) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch {
    // Graceful no-op in environments without local fs
  }
}

// Retrieve credentials strictly from environment variables without hardcoding
function getSupabaseUrl(): string {
  ensureServerEnvLoaded();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url) {
    throw new Error('[Supabase Config Error] NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  }
  return url.trim();
}

function getServiceRoleKey(): string {
  ensureServerEnvLoaded();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    throw new Error(
      '[Supabase Config Error] SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. A valid service role key is required for admin database operations to bypass RLS.'
    );
  }
  return key.trim();
}

function getAnonKey(): string {
  ensureServerEnvLoaded();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('[Supabase Config Error] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
  }
  return key.trim();
}

export const isSupabaseConfigured = true;

let _adminClient: SupabaseClient | null = null;
let _anonClient: SupabaseClient | null = null;

/**
 * Returns privileged Supabase client initialized with SUPABASE_SERVICE_ROLE_KEY.
 * Always bypasses PostgreSQL Row-Level Security (RLS) for server-side store operations.
 * Will throw an explicit error if SUPABASE_SERVICE_ROLE_KEY is missing rather than
 * silently falling back to anon key.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    const url = getSupabaseUrl();
    const key = getServiceRoleKey();

    _adminClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _adminClient;
}

/**
 * Returns public Supabase client initialized with NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Used only for public unprivileged queries.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_anonClient) {
    const url = getSupabaseUrl();
    const key = getAnonKey();

    _anonClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _anonClient;
}

// Proxies ensure any server-side database operation uses the privileged service role client
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export const supabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

// Default export for postsStore operations (strictly uses service_role key to bypass RLS)
export const supabase = supabaseAdmin;

