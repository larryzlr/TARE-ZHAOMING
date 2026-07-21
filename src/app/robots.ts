// src/app/robots.ts
// 搜索引擎爬虫指令配置

import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function robots() {
  const SITE_URL = await getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/inquiry/success',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
