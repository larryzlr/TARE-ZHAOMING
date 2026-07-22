// src/app/sitemap.xml/route.ts
// 站点地图索引（sitemapindex），列出 5 个语言子 sitemap。
//
// 背景说明：
// Next.js 14.2 的 generateSitemaps 仅会生成 /sitemap/<id>.xml 子文件，
// **不会**自动在 /sitemap.xml 输出 <sitemapindex> 索引（请求 /sitemap.xml 会 404）。
// 因此这里用自定义路由处理器手动输出 sitemapindex，确保 /sitemap.xml 可用，
// 便于在 Google Search Console 中提交索引、分别监控各语言子 sitemap 的抓取情况。
//
// 缓存策略：revalidate=3600（ISR），每小时后台再生成一次，
// 纳入运行时新增的产品。getAllProducts 包裹 try-catch，
// 数据库不可用时仅返回静态页面，不会导致构建失败。
//
// 多语言 hreflang 标注通过各页面 HTML <head> 中的 <link rel="alternate" hreflang>
// 实现（见 src/app/[locale]/layout.tsx 的 metadata.alternates），
// 这是 Google 识别多语言的主要途径，因此 sitemap 条目中不再重复声明 alternates。
//
// 注意：localePrefix 为 'as-needed'，defaultLocale 为 'en'。
// 各语言子 sitemap 的 URL 固定为 /sitemap/<locale>.xml（如 /sitemap/en.xml）。

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

export async function GET() {
  const SITE_URL = (await getSiteUrl()).replace(/\/$/, '');
  const lastModified = new Date().toISOString();

  const entries = routing.locales
    .map((locale) => {
      const loc = `${SITE_URL}/sitemap/${locale}.xml`;
      return `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastModified}</lastmod>\n  </sitemap>`;
    })
    .join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${entries}\n` +
    `</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
