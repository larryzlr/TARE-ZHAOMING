'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  slug: string;
  category?: string;
  images?: string[];
  title: string;
  description: string;
  specs?: { label: string; value: string }[];
}

type ProductCardProps = {
  product: Product;
  locale: string;
};

export default function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('ProductPage');
  const firstImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : null;

  // 关键词丰富的 alt 文本：产品名 + 类目 + 关键词
  const altText = `${product.title} - ${product.category || 'Brake Pads'} | RUISHA Brake Pad Manufacturer`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
      <Link href={`/${locale}/products/${product.id}`} className="block">
        <div className="w-full h-56 bg-gray-50 flex items-center justify-center overflow-hidden relative">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={altText}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-300">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className="text-xs mt-1">{t('noImage')}</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/${locale}/products/${product.id}`}>
          <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}/products/${product.id}`}
            className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
          >
            {t('viewDetail')} →
          </Link>
          <Link
            href={`/${locale}/products/${product.id}#inquiry`}
            className="text-xs bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors font-medium"
          >
            {t('inquiryNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}
