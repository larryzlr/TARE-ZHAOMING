// src/app/[locale]/not-found.tsx

import {routing} from '@/lib/i18n/routing';
import {notFound} from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const t = useTranslations('Common');
  
  // Check if the route matches any of the configured locales
  if (!routing.locales.some((locale) => locale === 'en')) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('error')}</h2>
      <p className="text-gray-600 mb-8">404 - Page Not Found</p>
      <a 
        href={`/${routing.defaultLocale}`} 
        className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-300"
      >
        {t('home')}
      </a>
    </div>
  );
}