import { NextResponse } from 'next/server';

export function middleware(request) {

  const token = request.cookies.get('token')?.value;
  const user = request.cookies.get('user')?.value;

  if (!token && !request.nextUrl.pathname.includes('/login') && !request.nextUrl.pathname.includes('/register') && request.nextUrl.pathname.includes('/dashboard')) {
    const locale = request.nextUrl.pathname.split('/')[1] || 'ar';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  } else if (token && (request.nextUrl.pathname.includes('/login') || request.nextUrl.pathname.includes('/register'))) {
    const locale = request.nextUrl.pathname.split('/')[1] || 'ar';
    return NextResponse.redirect(new URL(`/${locale}/dashboard/profile`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
