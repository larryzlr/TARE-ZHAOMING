import { getTranslations } from 'next-intl/server';
import { getProductById, getAllProducts, getSiteConfig } from '@/lib/product-service';
import { getAllCategories } from '@/lib/category-service';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ContactFloatingButtons from '@/components/ContactFloatingButtons';
import ProductDetailImages from '@/components/ProductDetailImages';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { getSiteUrl } from '@/lib/site-url';

// ISR：每 60 分钟重新生成一次
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
  const { locale, id } = params;
  const SITE_URL = await getSiteUrl();
  let title = 'Product - RUISHA Brake';
  let description = 'Professional brake pad manufacturer providing high-quality OEM brake pads with E-Mark certification.';

  try {
    const product = await getProductById(id, locale);
    const config = await getSiteConfig(locale);
    if (Object.keys(config).length === 0) {
      Object.assign(config, await getSiteConfig('en'));
    }

    const companyName = config.company_name || 'RUISHA Brake';
    if (product?.title) {
      title = `${product.title} - ${companyName} | Brake Pad Manufacturer`;
      description = product.description || `${product.title} - OEM brake pads with E-Mark certification from RUISHA Brake, professional brake pad manufacturer.`;
    } else {
      title = companyName;
    }

    // 产品页 hreflang
    const languages: Record<string, string> = {};
    routing.locales.forEach((loc) => {
      languages[loc] = `${SITE_URL}/${loc}/products/${id}`;
    });
    languages['x-default'] = `${SITE_URL}/en/products/${id}`;

    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_URL}/${locale}/products/${id}`,
        languages,
      },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${SITE_URL}/${locale}/products/${id}`,
        siteName: 'RUISHA Brake',
        images: product?.images?.length ? product.images.slice(0, 3).map((url: string) => ({ url, width: 800, height: 800, alt: `${product.title} - Brake Pads` })) : [],
      },
    };
  } catch (e) {}

  return { title, description };
}

export default async function ProductDetailPage({ params }: { params: { locale: string; id: string } }) {
  const t = await getTranslations('ProductPage');
  const ct = await getTranslations('Common');
  const { locale, id } = params;
  const SITE_URL = await getSiteUrl();

  let product: any = null;
  let siteConfig: Record<string, string> = {};
  let relatedProducts: any[] = [];
  let categories: any[] = [];
  try {
    product = await getProductById(id, locale);
    siteConfig = await getSiteConfig(locale);
    categories = await getAllCategories(locale);
    if (Object.keys(siteConfig).length === 0) {
      siteConfig = await getSiteConfig('en');
    }
    if (product) {
      const allProducts = await getAllProducts(locale);
      relatedProducts = allProducts
        .filter((p: any) => p.id !== product.id && (product.category ? p.category === product.category : true))
        .slice(0, 4);
    }
  } catch (e) {
    console.error('Failed to load product:', e);
  }

  if (!product) {
    notFound();
  }

  // JSON-LD 结构化数据：Product + BreadcrumbList
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} - OEM Brake Pads`,
    image: product.images || [],
    brand: {
      '@type': 'Brand',
      name: siteConfig.company_name || 'RUISHA Brake',
    },
    manufacturer: {
      '@type': 'Organization',
      name: siteConfig.company_name || 'RUISHA Brake',
    },
    category: product.category || 'Brake Pads',
    sku: product.slug || product.id,
    url: `${SITE_URL}/${locale}/products/${id}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: ct('home'),
        item: `${SITE_URL}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('allProducts'),
        item: `${SITE_URL}/${locale}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${SITE_URL}/${locale}/products/${id}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header
        companyName={siteConfig.company_name || 'ZHAOMING'}
        logo={siteConfig.logo}
        whatsapp={siteConfig.whatsapp}
        telegram={siteConfig.telegram}
        categories={categories}
      />

      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-2 py-3 text-sm text-gray-500">
            <a href={`/${locale}`} className="hover:text-primary-600 transition-colors">{ct('home')}</a>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <a href={`/${locale}/products`} className="hover:text-primary-600 transition-colors">{t('allProducts')}</a>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-800 font-medium line-clamp-1">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 relative">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={`${product.title} - OEM Brake Pads | E-Mark Certified | RUISHA`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm mt-2">No image available</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="shrink-0 w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-primary-400 transition-colors relative"
                  >
                    <Image
                      src={img}
                      alt={`${product.title} - Brake Pad Image ${idx + 1} - RUISHA`}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

            {product.specs && product.specs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('specifications')}</h2>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full">
                    <tbody>
                      {product.specs.map((spec: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-5 py-3.5 text-sm text-gray-500 font-medium w-2/5 border-r border-gray-100">
                            {spec.label}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-800">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div id="inquiry" className="flex flex-col sm:flex-row gap-4 mt-8">
              {siteConfig.whatsapp && (
                <a
                  href={siteConfig.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-8 py-3.5 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors text-center flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span>{t('whatsappInquiry')}</span>
                </a>
              )}
              <a
                href={`/${locale}#contact`}
                className="flex-1 px-8 py-3.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors text-center"
              >
                {t('getQuote')}
              </a>
            </div>
          </div>
        </div>

        {/* 详情页图片 - 上下排列布局，参考淘宝/拼多多详情页 */}
        {product.detailImages && product.detailImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('detailImages')}</h2>
            <ProductDetailImages images={product.detailImages} title={product.title} />
          </div>
        )}

        {/* 详情页富文本内容 */}
        {product.detailContent && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('detailContent')}</h2>
            <div
              className="product-detail-content"
              dangerouslySetInnerHTML={{ __html: product.detailContent }}
            />
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">{t('relatedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer
        companyName={siteConfig.company_name || 'ZHAOMING'}
        whatsapp={siteConfig.whatsapp}
        telegram={siteConfig.telegram}
        wechat={siteConfig.wechat}
        email={siteConfig.email}
        copyright={siteConfig.copyright}
        tagline={siteConfig.tagline}
        locale={locale}
        categories={categories}
      />

      <ContactFloatingButtons config={{
        whatsapp: siteConfig.whatsapp,
        telegram: siteConfig.telegram,
        wechat: siteConfig.wechat,
        wechatQr: siteConfig.wechat_qr
      }} />
    </div>
  );
}
