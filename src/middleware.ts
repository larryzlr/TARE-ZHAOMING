import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(zh|en|ru|fr|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
