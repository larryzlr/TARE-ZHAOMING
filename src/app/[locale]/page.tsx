import { getTranslations } from 'next-intl/server';
import { getAllProducts, getSiteConfig } from '@/lib/product-service';
import { getAllCategories } from '@/lib/category-service';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ContactFloatingButtons from '@/components/ContactFloatingButtons';
import InquiryForm from '@/components/InquiryForm';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('IndexPage');
  const pt = await getTranslations('ProductPage');
  const { locale } = params;

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
    console.error('Failed to load data:', e);
  }

  const hotProducts = products.slice(0, 8);

  const heroTitle = siteConfig.hero_title || t('title');
  const heroSubtitle = siteConfig.hero_subtitle || t('subtitle');
  const heroBtn1Text = siteConfig.hero_btn1_text || t('viewProducts');
  const heroBtn1Link = siteConfig.hero_btn1_link || `/${locale}/products`;
  const heroBtn2Text = siteConfig.hero_btn2_text || t('getQuote');
  const heroBtn2Link = siteConfig.hero_btn2_link || '#contact';
  const heroBgImage = siteConfig.hero_bg_image || '';

  const heroStyle = heroBgImage
    ? { backgroundImage: `url(${heroBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div className="min-h-screen bg-white">
      <Header
        companyName={siteConfig.company_name || 'ZHAOMING'}
        whatsapp={siteConfig.whatsapp}
        categories={categories}
      />

      <section className={`relative py-24 md:py-36 overflow-hidden ${heroBgImage ? 'text-white' : 'bg-gradient-to-br from-primary-50 via-white to-secondary-50'}`} style={heroStyle}>
        {heroBgImage && <div className="absolute inset-0 bg-black/40"></div>}
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${heroBgImage ? 'text-white' : 'text-gray-800'}`}>
            {heroTitle}
          </h1>
          <p className={`text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed ${heroBgImage ? 'text-gray-200' : 'text-gray-600'}`}>
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={heroBtn1Link}
              className="px-8 py-3.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
            >
              {heroBtn1Text}
            </a>
            <a
              href={heroBtn2Link}
              className={`px-8 py-3.5 font-medium rounded-lg border-2 transition-colors ${heroBgImage ? 'bg-white/20 text-white border-white/50 hover:bg-white/30' : 'bg-white text-primary-600 border-primary-500 hover:bg-primary-50'}`}
            >
              {heroBtn2Text}
            </a>
          </div>
        </div>
        {!heroBgImage && (
          <>
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary-100 rounded-full opacity-20 blur-3xl"></div>
          </>
        )}
      </section>

      <section id="advantages" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{t('ourAdvantages')}</h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: t('advantage1Title'), desc: t('advantage1Desc'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
              { title: t('advantage2Title'), desc: t('advantage2Desc'), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { title: t('advantage3Title'), desc: t('advantage3Desc'), icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { title: t('advantage4Title'), desc: t('advantage4Desc'), icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: t('advantage5Title'), desc: t('advantage5Desc'), icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: t('advantage6Title'), desc: t('advantage6Desc'), icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-7 hover:shadow-md transition-shadow border border-gray-100">
                <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{t('productCategories')}</h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/${locale}/products?category=${cat.slug}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-all border border-gray-100 hover:border-primary-200 group"
              >
                <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                  {cat.icon ? (
                    <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                    </svg>
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{t('hotProducts')}</h2>
              <div className="w-20 h-1 bg-primary-500 rounded-full"></div>
            </div>
            <a
              href={`/${locale}/products`}
              className="hidden sm:inline-flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              {t('viewAll')}
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>

          {hotProducts.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <p className="text-gray-400">{t('noProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <a
              href={`/${locale}/products`}
              className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
            >
              {t('viewAll')} →
            </a>
          </div>
        </div>
      </section>

      <section id="factory" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{t('factoryStrength')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('factoryDesc')}</p>
            <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full mt-3"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '12', label: t('factoryLine'), icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
              { num: '80+', label: t('factoryTest'), icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
              { num: '15+', label: t('factoryCert'), icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { num: '50+', label: t('factoryCountry'), icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-8 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-primary-600 mb-1">{item.num}</div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{t('aboutUs')}</h2>
            <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full mb-8"></div>
            <p className="text-gray-600 leading-relaxed text-lg mb-8">
              {t('subtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {[
                { title: t('advantage2Title'), desc: t('advantage2Desc') },
                { title: t('advantage1Title'), desc: t('advantage1Desc') },
                { title: t('advantage4Title'), desc: t('advantage4Desc') },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('inquiryTitle')}</h2>
            <p className="text-primary-100 mb-10">{t('inquirySubtitle')}</p>
            <InquiryForm locale={locale} whatsappLink={siteConfig.whatsapp} />
          </div>
        </div>
      </section>

      <Footer
        companyName={siteConfig.company_name || 'ZHAOMING'}
        whatsapp={siteConfig.whatsapp}
        wechat={siteConfig.wechat}
        locale={locale}
        categories={categories}
      />

      <ContactFloatingButtons config={{
        whatsapp: siteConfig.whatsapp,
        wechat: siteConfig.wechat
      }} />
    </div>
  );
}
