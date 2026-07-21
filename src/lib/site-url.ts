// src/lib/site-url.ts
// 动态获取站点 URL

import { headers } from 'next/headers';

// 生产环境固定域名（避免 VERCEL_URL 每次部署变化的问题）
const PRODUCTION_URL = 'https://www.z-ming.com';

/**
 * 获取站点根 URL
 * 优先级：
 * 1. NEXT_PUBLIC_SITE_URL 环境变量（需在 Vercel 控制台配置为真实域名）
 * 2. 从请求 headers 动态获取 host（仅用于 metadata 等请求上下文）
 * 3. fallback 到固定生产域名
 */
export async function getSiteUrl(): Promise<string> {
  // 1. 环境变量优先（如果配置了且是真实生产域名）
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('yourdomain') && !envUrl.includes('.vercel.app')) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. 从请求 headers 动态获取（适用于 metadata 等请求上下文）
  try {
    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    if (host && !host.includes('localhost') && !host.includes('.vercel.app')) {
      const proto = headersList.get('x-forwarded-proto') || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    // headers() 不可用（如 sitemap/robots 构建时生成）
  }

  // 3. fallback：使用固定生产域名
  return PRODUCTION_URL;
}
