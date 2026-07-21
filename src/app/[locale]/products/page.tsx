import { getTranslations } from 'next-intl/server';
import { getAllProducts, getSiteConfig } from '@/lib/product-service';
import { getAllCategories } from '@/lib/category-service';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ContactFloatingButtons from '@/components/ContactFloatingButtons';
import { routing } from '@/lib/i18n/routing';

// ISR：每小时重新生成
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

const PRODUCTS_TITLE_MAP: Record<string, string> = {
  en: 'Brake Pad Products - OEM & E-Mark Certified | RUISHA Brake',
  zh: '刹车片产品中心 - OEM刹车片工厂 | 瑞刹 RUISHA',
  ru: 'Тормозные колодки - OEM & E-Mark | RUISHA Brake',
  fr: 'Produits plaquettes de frein - OEM & E-Mark | RUISHA Brake',
  es: 'Productos pastillas de freno - OEM & E-Mark | RUISHA Brake',
};

const PRODUCTS_DESC_MAP: Record<string, string> = {
  en: 'Browse RUISHA Brake\'s full range of OEM brake pads: disc, drum, ceramic brake pads with E-Mark certification. 20+ years manufacturer exporting to 50+ countries.',
  zh: '浏览瑞刹刹车片全系列产品：OEM盘式、鼓式、陶瓷刹车片，E-Mark认证，20+年制造经验，出口50+国家。',
  ru: 'Просмотрите полный ассортимент тормозных колодок RUISHA: дисковые, барабанные, керамические с сертификатом E-Mark.',
  fr: 'Parcourez la gamme complète de plaquettes de frein RUISHA : disque, tambour, céramique avec certification E-Mark.',
  es: 'Explore la gama completa de pastillas de freno RUISHA: disco, tambor, cerámicas con certificación E-Mark.',
};

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  let title = PRODUCTS_TITLE_MAP[locale] || PRODUCTS_TITLE_MAP['en'];
  let description = PRODUCTS_DESC_MAP[locale] || PRODUCTS_DESC_MAP['en'];

  try {
    const config = await getSiteConfig(locale);
    if (Object.keys(config).length === 0) {
      Object.assign(config, await getSiteConfig('en'));
    }
    if (config.site_title) {
      const baseTitle = config.site_title.split(' - ')[0] || config.site_title;
      const productsSuffix = locale === 'zh' ? '产品中心' : 'Products';
      title = `${productsSuffix} - ${baseTitle}`;
    } else if (config.company_name) {
      const productsSuffix = locale === 'zh' ? '产品中心' : 'Products';
      title = `${productsSuffix} - ${config.company_name}`;
    }
  } catch (e) {}

  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}/products`;
  });
  languages['x-default'] = `${SITE_URL}/en/products`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/products`,
      languages,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/${locale}/products`,
      siteName: 'RUISHA Brake',
    },
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string };
}) {
  const t = await getTranslations('ProductPage');
  const ct = await getTranslations('Common');
  const { locale } = params;
  const selectedCategory = searchParams.category || '';

  let products: any[] = [];
  let siteConfig: Record<string, string> = {};
  let categories: any[] = [];
  try {
    products = await getAllProducts(locale);
    siteConfig = await getSiteConfig(locale);
    categories = await getAllCategories(locale);
    if (Object.keys(siteConfig).length === 0) {
      siteConfig = await getSiteConfig('en');
    }
  } catch (e) {
    console.error('Failed to load products:', e);
  }

  const filteredProducts = selectedCategory
    ? products.filter((p: any) => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
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
            <span className="text-gray-800 font-medium">{t('allProducts')}</span>
          </nav>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto py-3 scrollbar-hide">
            <a
              href={`/${locale}/products`}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('filterAll')}
            </a>
            {categories.map(cat => (
              <a
                key={cat.slug}
                href={`/${locale}/products?category=${cat.slug}`}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || selectedCategory : t('allProducts')}
          </h1>
          <span className="text-sm text-gray-400">{filteredProducts.length} {t('productCount')}</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <p className="text-gray-400 text-lg">{t('noProductsInCategory')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
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
