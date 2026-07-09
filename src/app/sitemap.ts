// src/app/sitemap.ts

import { getAllProducts } from '@/lib/product-service';
import { routing } from '@/lib/i18n/routing';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export default async function sitemap() {
  let productUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = [];

  try {
    const products = await getAllProducts('en', 'published');
    productUrls = products.flatMap(product =>
      routing.locales.map(locale => ({
        url: `${SITE_URL}/${locale}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );
  } catch {
    // 数据库不可用时返回静态页面
  }

  const staticPages = [
    `${SITE_URL}/`,
    ...routing.locales.map(locale => `${SITE_URL}/${locale}`),
    ...routing.locales.map(locale => `${SITE_URL}/${locale}/products`),
    ...routing.locales.map(locale => `${SITE_URL}/${locale}/about`),
    ...routing.locales.map(locale => `${SITE_URL}/${locale}/contact`),
  ].map(url => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    ...staticPages,
    ...productUrls,
  ];
}
