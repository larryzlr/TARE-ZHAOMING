// src/lib/i18n/path.ts
// 根据 as-needed 前缀策略生成本地化路径：
// - 默认语言（en）不带前缀，保持 URL 最简
// - 其他语言带 /<locale> 前缀

import { routing } from './routing';

/**
 * 生成本地化路径
 * @param locale 当前语言代码
 * @param path 以 '/' 开头的路径（如 '/products' 或 '/'）
 * @returns 符合 as-needed 策略的路径字符串
 */
export function getLocalizedPath(locale: string, path: string): string {
  if (locale === routing.defaultLocale) {
    return path;
  }
  return `/${locale}${path === '/' ? '' : path}`;
}

/**
 * 生成本地化完整 URL
 * @param siteUrl 站点根 URL（不含尾部斜杠）
 * @param locale 当前语言代码
 * @param path 以 '/' 开头的路径
 */
export function getLocalizedUrl(siteUrl: string, locale: string, path: string): string {
  return `${siteUrl.replace(/\/$/, '')}${getLocalizedPath(locale, path)}`;
}
