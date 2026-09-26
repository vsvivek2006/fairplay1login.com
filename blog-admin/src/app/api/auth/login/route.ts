import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
  constantTimeEqual,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRY_SECONDS,
} from '@/lib/auth';
import { supabaseClient, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 1. Enforce IP brute-force rate limit
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Security lockout active for ${rateCheck.remainingLockoutSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = body?.email?.trim();
    const password = body?.password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Both email and password are required.' },
        { status: 400 }
      );
    }

    let authenticatedEmail: string | null = null;

    // 2. Primary: Authenticate through Supabase Auth
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data?.user?.email) {
        authenticatedEmail = data.user.email;
      }
    }

    // 3. Fallback: If Supabase connection fails, verify against configured environment admin credentials
    if (!authenticatedEmail) {
      const envEmail = (process.env.ADMIN_EMAIL || 'admin@fairplay1login.com').toLowerCase();
      const envPassword = process.env.ADMIN_SECRET_PIN;

      if (
        envPassword &&
        email.toLowerCase() === envEmail &&
        constantTimeEqual(password, envPassword)
      ) {
        authenticatedEmail = email;
      }
    }

    // 4. Reject if authentication failed
    if (!authenticatedEmail) {
      const failStatus = recordFailedAttempt(clientIp);
      if (failStatus.lockedOut) {
        return NextResponse.json(
          {
            error: `Maximum attempts exceeded. Security lockout active for ${failStatus.lockoutSeconds} seconds.`,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid email or password. Access denied.' },
        { status: 401 }
      );
    }

    // 5. Authentication passed: reset rate limiter
    resetFailedAttempts(clientIp);

    // 6. Generate cryptographically signed session token
    const token = await createSessionToken(authenticatedEmail);

    // 7. Secure HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      message: 'Authentication verified. Session established.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    console.error('[API Auth Login Security Error]:', err);
    return NextResponse.json(
      { error: 'Authentication service encountered a server error.' },
      { status: 500 }
    );
  }
}
