// src/app/sitemap.ts
// 站点地图（合并所有语言版本）
//
// 说明：Next.js 14.1.0 的 sitemap() 仅支持生成单一 <urlset>，不支持 <sitemapindex>，
// 也不支持 sitemap-[id] 路由分割（该功能在 Next.js 14.2+ 才完整支持）。
// 因此这里采用合并 sitemap 方案：包含所有语言的静态页面与产品页面。
// 多语言 hreflang 标注通过各页面 HTML <head> 中的 <link rel="alternate" hreflang> 实现
// （见 src/app/[locale]/layout.tsx 的 metadata.alternates），这是 Google 识别多语言的主要途径。
//
// 如需按语言分割为独立 sitemap 文件以便在 GSC 中分别监控各语言索引情况，
// 升级到 Next.js 14.2+ 后可改用官方 sitemap-[locale]/route.ts + generateSitemaps 方案。

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
    // 数据库不可用时仅返回静态页面（优雅降级）
  }

  // 静态页面（包含所有语言版本）：首页、产品列表、FAQ、关于我们
  const staticPages = [
    `${SITE_URL}/`,
    ...routing.locales.flatMap(locale => [
      `${SITE_URL}/${locale}`,
      `${SITE_URL}/${locale}/products`,
      `${SITE_URL}/${locale}/faq`,
      `${SITE_URL}/${locale}/about`,
    ]),
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
