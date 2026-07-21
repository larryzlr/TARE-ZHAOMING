// src/lib/site-url.ts
// 动态获取站点 URL

import { headers } from 'next/headers';

/**
 * 获取站点根 URL
 * 优先级：
 * 1. NEXT_PUBLIC_SITE_URL 环境变量（生产环境应为真实域名）
 * 2. VERCEL_URL 环境变量（Vercel 自动设置）
 * 3. 从请求 headers 动态获取 host
 * 4. fallback 到默认域名
 */
export async function getSiteUrl(): Promise<string> {
  // 1. 环境变量优先（如果配置了且不是 localhost/yourdomain）
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('yourdomain')) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Vercel 自动设置的 URL
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl && !vercelUrl.includes('localhost')) {
    return `https://${vercelUrl.replace(/\/$/, '')}`;
  }

  // 3. 从请求 headers 动态获取
  try {
    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    if (host && !host.includes('localhost')) {
      const proto = headersList.get('x-forwarded-proto') || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    // headers() 不可用
  }

  // 4. fallback：使用已知的生产域名
  return 'https://www.z-ming.com';
}
