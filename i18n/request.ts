import { getRequestConfig } from 'next-intl/server';
import { unstable_cache } from 'next/cache';
import { routing } from '../src/lib/i18n/routing';
import prisma from '../src/lib/db';

const cachedTranslations: Record<string, ReturnType<typeof unstable_cache>> = {};

function getTranslationFromDB(locale: string) {
  if (!cachedTranslations[locale]) {
    cachedTranslations[locale] = unstable_cache(
      async () => {
        const record = await prisma.translation.findUnique({
          where: { lang: locale }
        });
        if (record?.content) {
          return JSON.parse(record.content);
        }
        return null;
      },
      ['translation-cache', locale],
      { tags: ['translations'] }
    );
  }
  return cachedTranslations[locale]();
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    return {
      locale: routing.defaultLocale,
      messages: await getTranslationFromDB(routing.defaultLocale) || (await import(`../src/messages/${routing.defaultLocale}.json`)).default,
    };
  }

  let messages = null;
  try {
    messages = await getTranslationFromDB(locale);
  } catch (e) {
    console.error('Failed to load translation from DB:', e);
  }

  // Fallback to file system if DB is not available or empty
  if (!messages) {
    messages = (await import(`../src/messages/${locale}.json`)).default;
  }

  return {
    locale,
    messages
  };
});
