import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Define all locales that are supported
  locales: ['en', 'zh', 'ru', 'fr', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // We'll use the `pathname` strategy for this example,
  // but you can also use the `domain` strategy
  localePrefix: 'as-needed'
});

// lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);