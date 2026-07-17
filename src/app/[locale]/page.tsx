import { getTranslations } from 'next-intl/server';
import { getAllProducts, getSiteConfig } from '@/lib/product-service';
import { getAllCategories, CategoryWithChildren } from '@/lib/category-service';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ContactFloatingButtons from '@/components/ContactFloatingButtons';
import InquiryForm from '@/components/InquiryForm';
import OeNumberQuery from '@/components/OeNumberQuery';
import SectionBackground from '@/components/SectionBackground';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('IndexPage');
  const pt = await getTranslations('ProductPage');
  const { locale } = params;

  let products: any[] = [];
  let siteConfig: Record<string, string> = {};
  let categories: CategoryWithChildren[] = [];
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

  // 解析多图背景（逗号分隔）
  const parseImages = (val: string): string[] => val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
  const heroImages = parseImages(siteConfig.hero_bg_image || '');
  const bgAdvantages = parseImages(siteConfig.bg_advantages || '');
  const bgCategories = parseImages(siteConfig.bg_categories || '');
  const bgProducts = parseImages(siteConfig.bg_products || '');
  const bgFactory = parseImages(siteConfig.bg_factory || '');
  const bgAbout = parseImages(siteConfig.bg_about || '');

  // 解析遮罩透明度（0-100，默认值与原配置一致：hero=40，其余=80）
  const parseOpacity = (val: string | undefined, def: number): number => {
    const n = parseInt(val || '', 10);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? n : def;
  };
  const heroBgOpacity = parseOpacity(siteConfig.hero_bg_opacity, 40);
  const bgAdvantagesOpacity = parseOpacity(siteConfig.bg_advantages_opacity, 80);
  const bgCategoriesOpacity = parseOpacity(siteConfig.bg_categories_opacity, 80);
  const bgProductsOpacity = parseOpacity(siteConfig.bg_products_opacity, 80);
  const bgFactoryOpacity = parseOpacity(siteConfig.bg_factory_opacity, 80);
  const bgAboutOpacity = parseOpacity(siteConfig.bg_about_opacity, 80);

  const hasHeroBg = heroImages.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header
        companyName={siteConfig.company_name || 'ZHAOMING'}
        logo={siteConfig.logo}
        whatsapp={siteConfig.whatsapp}
        telegram={siteConfig.telegram}
        categories={categories}
      />

      {/* Hero 区域 */}
      {hasHeroBg ? (
        <SectionBackground images={heroImages} overlayColor="black" overlayOpacity={heroBgOpacity} className={`py-24 md:py-36 text-white`}>
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-200">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href={heroBtn1Link} className="px-8 py-3.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
                {heroBtn1Text}
              </a>
              <a href={heroBtn2Link} className="px-8 py-3.5 font-medium rounded-lg border-2 bg-white/20 text-white border-white/50 hover:bg-white/30 transition-colors">
                {heroBtn2Text}
              </a>
            </div>
          </div>
        </SectionBackground>
      ) : (
        <section className="relative py-24 md:py-36 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-800">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-gray-600">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href={heroBtn1Link} className="px-8 py-3.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
                {heroBtn1Text}
              </a>
              <a href={heroBtn2Link} className="px-8 py-3.5 font-medium rounded-lg border-2 bg-white text-primary-600 border-primary-500 hover:bg-primary-50 transition-colors">
                {heroBtn2Text}
              </a>
            </div>
          </div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary-100 rounded-full opacity-20 blur-3xl"></div>
        </section>
      )}

      {/* 核心优势区域 */}
      <SectionBackground images={bgAdvantages} overlayColor="white" overlayOpacity={bgAdvantagesOpacity} className="py-20 bg-white" id="advantages">
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
      </SectionBackground>

      <section id="oe-query" className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <OeNumberQuery />
        </div>
      </section>

      {/* 产品分类区域 */}
      <SectionBackground images={bgCategories} overlayColor="white" overlayOpacity={bgCategoriesOpacity} className="py-12 md:py-16 bg-gray-50" id="categories">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{t('productCategories')}</h2>
            <div className="w-16 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </div>

          {/* 二级分类布局 */}
          <div className="max-w-5xl mx-auto space-y-4">
            {categories.map((parent) => (
              <div key={parent.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* 一级分类标题 */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-50 to-transparent border-b border-gray-100">
                  <div className="bg-primary-100 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {parent.icon ? (
                      parent.icon.startsWith('/') || parent.icon.startsWith('http') ? (
                        <img src={parent.icon} alt={parent.name} className="w-12 h-12 md:w-14 md:h-14 object-cover" />
                      ) : (
                        <svg className="w-6 h-6 md:w-7 md:h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={parent.icon} />
                        </svg>
                      )
                    ) : (
                      <span className="text-xl md:text-2xl">📂</span>
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-gray-800">{parent.name}</h3>
                </div>
                {/* 二级分类卡片 */}
                {parent.children && parent.children.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 p-3">
                    {parent.children.map((child) => (
                      <a
                        key={child.id}
                        href={`/${locale}/products?category=${child.slug}`}
                        className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-primary-50 transition-all border border-transparent hover:border-primary-200 group"
                      >
                        <div className="bg-primary-50 w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-100 transition-colors overflow-hidden">
                          {child.icon ? (
                            child.icon.startsWith('/') || child.icon.startsWith('http') ? (
                              <img src={child.icon} alt={child.name} className="w-16 h-16 md:w-20 md:h-20 object-cover" />
                            ) : (
                              <svg className="w-8 h-8 md:w-10 md:h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d={child.icon} />
                              </svg>
                            )
                          ) : (
                            <span className="text-3xl md:text-4xl">📦</span>
                          )}
                        </div>
                        <span className="text-sm md:text-base font-bold text-gray-700 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {child.name}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2">
                    <a
                      href={`/${locale}/products?category=${parent.slug}`}
                      className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 text-sm"
                    >
                      查看该分类下的产品 →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SectionBackground>

      {/* 热门产品区域 */}
      <SectionBackground images={bgProducts} overlayColor="white" overlayOpacity={bgProductsOpacity} className="py-20 bg-white" id="products">
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
            <a href={`/${locale}/products`} className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700">
              {t('viewAll')} →
            </a>
          </div>
        </div>
      </SectionBackground>

      {/* 工厂实力区域 */}
      <SectionBackground images={bgFactory} overlayColor="white" overlayOpacity={bgFactoryOpacity} className="py-20 bg-gray-50" id="factory">
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
      </SectionBackground>

      {/* 关于我们区域 */}
      <SectionBackground images={bgAbout} overlayColor="white" overlayOpacity={bgAboutOpacity} className="py-20 bg-white" id="about">
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
      </SectionBackground>

      <section id="contact" className="py-20 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('inquiryTitle')}</h2>
            <p className="text-primary-100 mb-10">{t('inquirySubtitle')}</p>
            <InquiryForm locale={locale} whatsappLink={siteConfig.whatsapp} telegramLink={siteConfig.telegram} />
          </div>
        </div>
      </section>

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
