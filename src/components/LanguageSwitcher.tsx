// src/components/LanguageSwitcher.tsx

'use client';

import { usePathname, useRouter } from '@/lib/i18n/routing';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  function onSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      // Update the route with the new locale
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <select
      value={locale}
      onChange={onSelectChange}
      disabled={isPending}
      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
    >
      <option value="en">EN</option>
      <option value="zh">中文</option>
      <option value="ru">RU</option>
      <option value="fr">FR</option>
      <option value="es">ES</option>
    </select>
  );
}