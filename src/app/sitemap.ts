// src/app/sitemap.ts

import { getAllProducts } from '@/lib/product-service';
import { routing } from '@/lib/i18n/routing';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const SITE_URL = await getSiteUrl();
  const lastModified = new Date();

  let productUrls: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'weekly';
    priority: number;
  }> = [];

  try {
    const products = await getAllProducts('en', 'published');
    productUrls = products.flatMap(product =>
      routing.locales.map(locale => ({
        url: `${SITE_URL}/${locale}/products/${product.slug}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );
  } catch {
    // 数据库不可用时返回静态页面
  }

  // 静态页面（包含所有语言版本）
  const staticPages = [
    `${SITE_URL}/`,
    ...routing.locales.map(locale => `${SITE_URL}/${locale}`),
    ...routing.locales.map(locale => `${SITE_URL}/${locale}/products`),
  ].map(url => ({
    url,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [
    ...staticPages,
    ...productUrls,
  ];
}
