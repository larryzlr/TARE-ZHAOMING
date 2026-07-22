// src/app/sitemap/[...slug]/route.ts
// 各语言独立 sitemap（<urlset>）。
// URL 形如 /sitemap/en.xml、/sitemap/zh.xml、/sitemap/ru.xml、/sitemap/fr.xml、/sitemap/es.xml。
//
// 实现要点：
// - 解析 catch-all slug（如 ['en.xml']）→ 提取语言代码 'en'
// - 非法语言或缺失 slug 时返回 404
// - 静态页面：首页、产品列表、FAQ、关于我们
// - 产品详情页（slug URL），通过 getAllProducts 获取
// - 数据库不可用时仅返回静态页面（优雅降级，不影响构建）
// - revalidate=3600（ISR）：每小时后台再生成，纳入运行时新增产品
//
// URL 前缀策略（as-needed）：默认语言 en 不带前缀（如 /products），
// 其他语言带 /<locale> 前缀（如 /zh/products）。

import { getAllProducts } from '@/lib/product-service';
import { routing } from '@/lib/i18n/routing';
import { getSiteUrl } from '@/lib/site-url';

// ISR：每小时后台再生成一次
export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

// 根据 as-needed 前缀策略构建路径：默认语言 en 不带前缀，其他语言带 /<locale> 前缀
function buildPath(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path === '/' ? '' : path}`;
}

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
};

export async function GET(
  _request: Request,
  { params }: { params: { slug?: string[] } }
) {
  const slug = params.slug?.[0];
  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  // 解析形如 en.xml 的 slug，提取语言代码
  const locale = slug.replace(/\.xml$/i, '').toLowerCase();
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return new Response('Not Found', { status: 404 });
  }

  const SITE_URL = (await getSiteUrl()).replace(/\/$/, '');
  const lastModified = new Date().toISOString();

  const entries: SitemapEntry[] = [];

  // 静态页面：首页、产品列表、FAQ、关于我们
  const staticPaths = ['/', '/products', '/faq', '/about'];
  for (const p of staticPaths) {
    entries.push({
      loc: `${SITE_URL}${buildPath(locale, p)}`,
      lastmod: lastModified,
      changefreq: 'weekly',
      priority: 0.9,
    });
  }

  // 产品详情页（slug URL）
  try {
    const products = await getAllProducts('en', 'published');
    for (const product of products) {
      if (!product.slug) continue;
      entries.push({
        loc: `${SITE_URL}${buildPath(locale, `/products/${product.slug}`)}`,
        lastmod: lastModified,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
  } catch {
    // 数据库不可用时仅返回静态页面（优雅降级）
  }

  const body = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n` +
    `</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
