import { NextRequest, NextResponse } from 'next/server';
import { canonicalRedirectLocation, shouldSkipCanonicalRedirect } from '@/lib/canonical-host';

export function middleware(request: NextRequest) {
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (shouldSkipCanonicalRedirect(path)) return NextResponse.next();
  const location = canonicalRedirectLocation(request.headers.get('host') || '', path);
  if (!location) return NextResponse.next();
  return NextResponse.redirect(location, 301);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.png).*)'],
};
