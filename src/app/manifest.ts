// src/app/manifest.ts
// PWA Web App Manifest 配置

import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function manifest() {
  const SITE_URL = await getSiteUrl();

  return {
    name: 'Z-MING Brake Parts Co., Ltd. - Professional Brake Pad Manufacturer',
    short_name: 'Z-MING Brake',
    description: 'Professional OEM brake pad manufacturer with E-Mark certification. 20+ years experience, exporting to 50+ countries.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#dc2626',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    categories: ['business', 'industrial', 'automotive'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Products',
        short_name: 'Products',
        description: 'Browse all brake pad products',
        url: '/en/products',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'FAQ',
        short_name: 'FAQ',
        description: 'Frequently asked questions',
        url: '/en/faq',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
