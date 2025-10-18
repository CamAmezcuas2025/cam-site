import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/app/lib/middlewareSupabaseClient';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(req);

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = req.nextUrl.pathname;

  // 🟢 Public pages: allow access (login, register, home, static/public)
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/public')
  ) {
    return res;
  }

  // 🔒 Protect non-public pages (including /api/*)
  if (!user && !pathname.startsWith('/api')) {
    // Redirect unauthenticated users only for pages, not APIs
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 🔐 For API routes, just let them through — cookies are now synced,
  // so Supabase.auth.getUser() inside /api/* will see the session.
  if (pathname.startsWith('/api')) {
    return res;
  }

  // 🧠 Role-based routing (still applies to pages, not APIs)
  const { data: rpcData } = await supabase.rpc('is_admin');
  const isAdmin = Array.isArray(rpcData)
    ? rpcData[0]?.is_admin ?? false
    : rpcData ?? false;

  // If admin and not on admin route → redirect to dashboard
  if (isAdmin && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // If not admin and trying to access admin route → kick back to profile
  if (!isAdmin && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/profile', req.url));
  }

  return res;
}

export const config = {
  // ✅ Now includes /api/* so session cookies sync for authenticated calls
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
