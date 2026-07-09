// src/app/sitemap.ts

import { getAllProducts } from '@/lib/product-service';
import { routing } from '@/lib/i18n/routing';

export default async function sitemap() {
  // Get all products for sitemap
  const products = await getAllProducts('en', 'published');
  
  // Create product URLs for all locales
  const productUrls = products.flatMap(product => 
    routing.locales.map(locale => ({
      url: `https://yourdomain.com/${locale}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  );
  
  // Create static page URLs for all locales
  const staticPages = [
    'https://yourdomain.com/',
    ...routing.locales.map(locale => `https://yourdomain.com/${locale}`),
    ...routing.locales.map(locale => `https://yourdomain.com/${locale}/products`),
    ...routing.locales.map(locale => `https://yourdomain.com/${locale}/about`),
    ...routing.locales.map(locale => `https://yourdomain.com/${locale}/contact`),
  ].map(url => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    ...staticPages,
    ...productUrls,
  ];
}