// ============================================================
// MIDDLEWARE — Livende
// Protege las rutas /admin/* y verifica el JWT desde la cookie.
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger SOLO las rutas /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('hm_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      const response = NextResponse.redirect(new URL('/login?redirect=/admin', request.url));
      response.cookies.delete('hm_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
