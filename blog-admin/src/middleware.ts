import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, constantTimeEqual, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1. Bypass static assets and Next.js internal files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff2?|ico|txt)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Bypass public authentication endpoints & public assets
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/robots.txt')) {
    return NextResponse.next();
  }

  // 3. Strict authentication via HttpOnly session cookie
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = await verifySessionToken(sessionCookie);

  // 4. Strictly verified Bearer token check for server-to-server calls
  if (!isAuthenticated) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      // Allow valid signed session token
      if (await verifySessionToken(token)) {
        isAuthenticated = true;
      } else if (
        process.env.SUPABASE_SERVICE_ROLE_KEY &&
        constantTimeEqual(token, process.env.SUPABASE_SERVICE_ROLE_KEY)
      ) {
        // Allow service role key for programmatic admin calls
        isAuthenticated = true;
      }
    }
  }

  // 5. Handle /login route
  if (pathname === '/login') {
    if (isAuthenticated) {
      const rawRedirect = req.nextUrl.searchParams.get('redirect');
      const safeRedirect =
        rawRedirect &&
        rawRedirect.startsWith('/') &&
        !rawRedirect.startsWith('//') &&
        !rawRedirect.includes('\\')
          ? rawRedirect
          : '/';
      return NextResponse.redirect(new URL(safeRedirect, req.url));
    }
    return NextResponse.next();
  }

  // 6. Enforce strict protection on all CRM and Admin routes
  const isProtectedPath =
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin');

  if (isProtectedPath && !isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Valid admin session token required.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', req.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname + search);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
