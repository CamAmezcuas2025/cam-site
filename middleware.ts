import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/app/lib/middlewareSupabaseClient';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = req.nextUrl.pathname;

  console.log('Middleware hit:', { pathname, hasUser: !!user?.id });

  // 🟢 Public pages: allow access (login, register, home, static/public)
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/set-password') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/classes') ||
    pathname.startsWith('/location') ||
    pathname.startsWith('/memberships') ||
    pathname.startsWith('/sponsors') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/videos') || // ✅ Add if videos page is public
    pathname.startsWith('/gallery') || // ✅ Public gallery page
    pathname.startsWith('/_next') || // ✅ CRITICAL: Allow Next.js internal routes
    pathname.startsWith('/api/auth') || // ✅ Auth API routes
    pathname.startsWith('/images') || // ✅ Public images
    pathname.startsWith('/fonts') || // ✅ Public fonts
    pathname === '/sitemap.xml' || // ✅ SEO sitemap
    pathname === '/robots.txt' // ✅ SEO robots
  ) {
    return res;
  }

  // 🔒 Protect non-public pages
  if (!user && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 🔐 For API routes, let them through
  if (pathname.startsWith('/api')) {
    return res;
  }

  // 🧠 Role-based routing
  const { data: rpcData } = await supabase.rpc('is_admin');
  const isAdmin = Array.isArray(rpcData)
    ? rpcData[0]?.is_admin ?? false
    : rpcData ?? false;

  const adminSafePaths = ['/waiver', '/profile'];
  const isSafePath = adminSafePaths.some(path => pathname.startsWith(path));

  console.log('Role check:', { isAdmin, pathname, startsWithAdmin: pathname.startsWith('/admin'), isSafePath });

  if (isAdmin && !pathname.startsWith('/admin') && !isSafePath) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  if (!isAdmin && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/profile', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};