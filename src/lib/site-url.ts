// src/lib/site-url.ts
// 动态获取站点 URL（优先使用环境变量，fallback 到请求 host）

import { headers } from 'next/headers';

/**
 * 获取站点根 URL
 * 优先级：
 * 1. NEXT_PUBLIC_SITE_URL 环境变量（生产环境应为 https://www.z-ming.com）
 * 2. 从请求 headers 动态获取（适用于 Vercel 部署）
 * 3. fallback 到 localhost（开发环境）
 */
export async function getSiteUrl(): Promise<string> {
  // 1. 环境变量优先（如果配置了且不是 localhost）
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('yourdomain')) {
    return envUrl.replace(/\/$/, ''); // 去除末尾斜杠
  }

  // 2. 从请求 headers 动态获取
  try {
    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'https';
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // headers() 可能在某些上下文不可用
  }

  // 3. fallback
  return envUrl || 'http://localhost:3000';
}

/**
 * 同步版本（用于不能使用 await 的场景，如 metadata 函数内部部分逻辑）
 * 注意：此版本不会动态获取 host，仅使用环境变量
 */
export function getSiteUrlSync(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('yourdomain')) {
    return envUrl.replace(/\/$/, '');
  }
  return 'https://www.z-ming.com'; // 默认生产域名
}
