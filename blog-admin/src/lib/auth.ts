import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'fairplay_crm_session';
const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

// In-memory rate limiting for brute-force protection
interface RateLimitEntry {
  attempts: number;
  lockoutUntil: number;
  lastAttemptAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS =
  process.env.NODE_ENV === 'production' ? 3 * 60 * 1000 : 15 * 1000;
const MAX_RATE_LIMIT_ENTRIES = 1000;

function pruneRateLimitMap(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (entry.lockoutUntil <= now && now - entry.lastAttemptAt > 15 * 60 * 1000) {
      rateLimitMap.delete(ip);
    }
  }
  if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    const keys = Array.from(rateLimitMap.keys()).slice(0, 200);
    for (const k of keys) {
      rateLimitMap.delete(k);
    }
  }
}

function getSecretKey(): string {
  // Use SUPABASE_SERVICE_ROLE_KEY or ADMIN_SECRET_PIN as HMAC root key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SESSION_SECRET ||
    process.env.ADMIN_SECRET_PIN;

  if (!key) {
    throw new Error('[Security Failure] Missing server secret key for authentication signing.');
  }

  return `fp-auth-seal-${key}`;
}

// Constant-time string comparison to prevent timing attacks
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let dummy = 0;
    for (let i = 0; i < a.length; i++) {
      dummy |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Generate HMAC SHA-256 signature using Web Crypto API (Edge & Node compatible)
async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Base64url encoding and decoding (universal)
function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64url');
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64url').toString('utf-8');
  }
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return atob(b64);
}

export interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
  email?: string;
}

// Create cryptographically signed session token
export async function createSessionToken(email?: string): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    role: 'admin',
    iat: now,
    exp: now + SESSION_EXPIRY_SECONDS * 1000,
    email: email || process.env.ADMIN_EMAIL || 'admin@fairplay1login.com',
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = await hmacSha256(encodedPayload, getSecretKey());

  return `${encodedPayload}.${signature}`;
}

// Verify session token integrity and expiration
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, receivedSignature] = parts;
  if (!encodedPayload || !receivedSignature) return false;

  try {
    const expectedSignature = await hmacSha256(encodedPayload, getSecretKey());
    if (!constantTimeEqual(expectedSignature, receivedSignature)) {
      return false;
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Verify role and expiration
    if (payload.role !== 'admin') return false;
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

// In-route defense-in-depth authorization guard
export async function requireAdminAuth(req: NextRequest): Promise<NextResponse | null> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuth = await verifySessionToken(cookie);

  if (!isAuth) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      if (await verifySessionToken(token)) {
        isAuth = true;
      } else if (
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        constantTimeEqual(token, process.env.SUPABASE_SERVICE_ROLE_KEY)
      ) {
        isAuth = true;
      }
    }
  }

  if (!isAuth) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin session required.', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  return null; // Auth passed
}

// Rate limiting by client IP
export function checkRateLimit(clientIp: string): { allowed: boolean; remainingLockoutSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.lockoutUntil > now) {
    const remaining = Math.ceil((entry.lockoutUntil - now) / 1000);
    return { allowed: false, remainingLockoutSeconds: remaining };
  }

  if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) {
    rateLimitMap.delete(clientIp);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(clientIp: string): { lockedOut: boolean; lockoutSeconds?: number } {
  pruneRateLimitMap();
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp) || { attempts: 0, lockoutUntil: 0, lastAttemptAt: now };
  entry.attempts += 1;
  entry.lastAttemptAt = now;

  if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockoutUntil = now + LOCKOUT_DURATION_MS;
    rateLimitMap.set(clientIp, entry);
    return { lockedOut: true, lockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  rateLimitMap.set(clientIp, entry);
  return { lockedOut: false };
}

export function resetFailedAttempts(clientIp: string): void {
  rateLimitMap.delete(clientIp);
}

export { SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS };
