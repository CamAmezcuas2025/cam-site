import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/app/lib/middlewareSupabaseClient';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(req);

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Public pages: allow access (login, home, etc.)
  if (pathname.startsWith('/login') || pathname === '/' || pathname.startsWith('/public')) {
    return res;
  }

  // If no user, redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check admin role via RPC
  const { data: rpcData } = await supabase.rpc('is_admin');
  const isAdmin = Array.isArray(rpcData) ? rpcData[0]?.is_admin ?? false : rpcData ?? false;

  // If admin and not on admin route, redirect to admin dashboard
  if (isAdmin && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // If not admin and on admin route, redirect to profile
  if (!isAdmin && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/profile', req.url));
  }

  // Otherwise, allow
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};