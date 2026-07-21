import { getTranslations } from 'next-intl/server';
import { getSiteConfig } from '@/lib/product-service';
import { getSiteUrl } from '@/lib/site-url';
import { routing } from '@/lib/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactFloatingButtons from '@/components/ContactFloatingButtons';
import Link from 'next/link';
import Image from 'next/image';

// ISR：每小时重新生成
export const revalidate = 3600;

const ABOUT_TITLE_MAP: Record<string, string> = {
  en: 'About Us - Z-MING Brake Pad Manufacturer',
  zh: '关于我们 - Z-MING 刹车片制造商',
  ru: 'О компании - Z-MING производитель тормозных колодок',
  fr: 'À propos - Z-MING fabricant de plaquettes de frein',
  es: 'Sobre nosotros - Z-MING fabricante de pastillas de freno',
};

const ABOUT_DESC_MAP: Record<string, string> = {
  en: 'Z-MING Brake Parts Co., Ltd. — 20+ years professional brake pad manufacturer. IATF 16949 certified factory producing OEM brake pads with E-Mark certification, exporting to 50+ countries.',
  zh: 'Z-MING制动配件有限公司 — 20余年专业刹车片制造商。IATF 16949认证工厂，生产E-Mark认证OEM刹车片，出口全球50+国家。',
  ru: 'Z-MING Brake Parts Co., Ltd. — производитель тормозных колодок с опытом 20+ лет. Завод сертифицирован IATF 16949, экспорт в 50+ стран.',
  fr: "Z-MING Brake Parts Co., Ltd. — fabricant de plaquettes de frein avec 20+ ans d'expérience. Usine certifiée IATF 16949, export dans 50+ pays.",
  es: 'Z-MING Brake Parts Co., Ltd. — fabricante de pastillas de freno con 20+ años de experiencia. Fábrica certificada IATF 16949, exportación a 50+ países.',
};

// 默认 About 内容（后台未配置时使用）
const DEFAULT_ABOUT: Record<string, { title: string; content: string; subtitle: string }> = {
  en: {
    subtitle: 'Trusted Brake Pad Manufacturer Since 2004',
    title: 'About Z-MING Brake',
    content: 'Z-MING Brake Parts Co., Ltd. is a professional brake pad manufacturer with over 20 years of industry experience. Located in China, our 50,000+ sqm factory is IATF 16949 certified and equipped with advanced production lines capable of producing 5 million sets of brake pads annually.\n\nWe specialize in OEM and ODM brake pad manufacturing, offering semi-metallic, ceramic, and low-metallic formulations. All our products carry E-Mark (ECE R90), AMECA, EAC, and CCC certifications, meeting stringent global quality standards.\n\nWith a dedicated R&D team of 30+ engineers and strict quality control at every production stage, we have successfully exported to over 50 countries across Europe, Russia, Southeast Asia, the Middle East, and South America. Our commitment to quality, innovation, and customer satisfaction has made us a trusted partner for brake pad distributors and vehicle manufacturers worldwide.',
  },
  zh: {
    subtitle: '值得信赖的刹车片制造商 始于2004',
    title: '关于 Z-MING',
    content: 'Z-MING制动配件有限公司是一家拥有20余年行业经验的专业刹车片制造商。工厂位于中国，占地面积50,000+平方米，通过IATF 16949认证，配备先进生产线，年产能达500万套刹车片。\n\n我们专注于OEM和ODM刹车片制造，提供半金属、陶瓷、低金属等多种配方。所有产品均通过E-Mark（ECE R90）、AMECA、EAC、CCC认证，符合全球严格的质量标准。\n\n公司拥有30余人的专业研发团队和严格的全流程质量控制体系，产品已出口至欧洲、俄罗斯、东南亚、中东、南美等50多个国家和地区。我们对质量、创新和客户满意的承诺，使Z-MING成为全球刹车片经销商和汽车制造商的信赖合作伙伴。',
  },
  ru: {
    subtitle: 'Надёжный производитель тормозных колодок с 2004 года',
    title: 'О компании Z-MING',
    content: 'Z-MING Brake Parts Co., Ltd. — профессиональный производитель тормозных колодок с опытом более 20 лет. Завод в Китае площадью 50 000+ м², сертифицирован IATF 16949, годовая мощность — 5 млн комплектов.\n\nМы специализируемся на OEM/ODM производстве: полуметаллические, керамические, низкометаллические составы. Вся продукция имеет сертификаты E-Mark, AMECA, EAC, CCC.\n\nКоманда R&D из 30+ инженеров и строгий контроль качества. Экспорт в 50+ стран Европы, России, Юго-Восточной Азии, Ближнего Востока и Южной Америки.',
  },
  fr: {
    subtitle: "Fabricant de confiance depuis 2004",
    title: 'À propos de Z-MING',
    content: "Z-MING Brake Parts Co., Ltd. est un fabricant professionnel de plaquettes de frein avec plus de 20 ans d'expérience. Usine en Chine de 50 000+ m², certifiée IATF 16949, capacité annuelle de 5 millions de jeux.\n\nSpécialiste OEM/ODM : formulations semi-métalliques, céramiques, low-metallic. Certifications E-Mark, AMECA, EAC, CCC.\n\nÉquipe R&D de 30+ ingénieurs, contrôle qualité strict. Export vers 50+ pays en Europe, Russie, Asie du Sud-Est, Moyen-Orient, Amérique du Sud.",
  },
  es: {
    subtitle: 'Fabricante de confianza desde 2004',
    title: 'Sobre Z-MING',
    content: 'Z-MING Brake Parts Co., Ltd. es un fabricante profesional de pastillas de freno con más de 20 años de experiencia. Fábrica en China de 50.000+ m², certificada IATF 16949, capacidad anual de 5 millones de juegos.\n\nEspecialista OEM/ODM: formulaciones semi-metálicas, cerámicas, low-metallic. Certificaciones E-Mark, AMECA, EAC, CCC.\n\nEquipo de I+D de 30+ ingenieros, control de calidad estricto. Exportación a 50+ países en Europa, Rusia, Sudeste Asiático, Oriente Medio, Sudamérica.',
  },
};

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const SITE_URL = await getSiteUrl();
  const title = ABOUT_TITLE_MAP[locale] || ABOUT_TITLE_MAP['en'];
  const description = ABOUT_DESC_MAP[locale] || ABOUT_DESC_MAP['en'];

  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}/about`;
  });
  languages['x-default'] = `${SITE_URL}/en/about`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/about`,
      languages,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/${locale}/about`,
      siteName: 'Z-MING Brake',
    },
  };
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('Common');
  const SITE_URL = await getSiteUrl();

  const defaults = DEFAULT_ABOUT[locale] || DEFAULT_ABOUT['en'];
  let subtitle = defaults.subtitle;
  let title = defaults.title;
  let content = defaults.content;
  let aboutImages: string[] = [];

  try {
    const config = await getSiteConfig(locale);
    if (config.about_subtitle) subtitle = config.about_subtitle;
    if (config.about_title) title = config.about_title;
    if (config.about_content) content = config.about_content;
    if (config.about_images) {
      aboutImages = config.about_images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } catch {}

  // Organization JSON-LD
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Z-MING Brake Parts Co., Ltd.',
    url: SITE_URL,
    description: content.replace(/\n/g, ' ').substring(0, 300),
    foundingDate: '2004',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: '500+' },
    address: { '@type': 'PostalAddress', addressCountry: 'CN' },
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('home'), item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: title, item: `${SITE_URL}/${locale}/about` },
    ],
  };

  // 将内容按段落分割
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* 面包屑 */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-primary-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{title}</span>
        </nav>

        {/* 标题区 */}
        <div className="text-center mb-12">
          <p className="text-primary-600 font-medium mb-3">{subtitle}</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">{title}</h1>
        </div>

        {/* 工厂图片 */}
        {aboutImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {aboutImages.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-gray-50">
                <Image
                  src={img}
                  alt={`Z-MING Brake Pad Factory - ${idx + 1} | OEM Brake Pads Manufacturer`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* 内容段落 */}
        <div className="prose prose-lg max-w-none mb-12">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">{p}</p>
          ))}
        </div>

        {/* 核心数据 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { num: '20+', label: locale === 'zh' ? '年行业经验' : locale === 'ru' ? 'лет опыта' : locale === 'fr' ? "ans d'expérience" : locale === 'es' ? 'años de experiencia' : 'Years Experience' },
            { num: '50+', label: locale === 'zh' ? '出口国家' : locale === 'ru' ? 'стран экспорта' : locale === 'fr' ? 'pays d\'export' : locale === 'es' ? 'países de exportación' : 'Export Countries' },
            { num: '5M+', label: locale === 'zh' ? '年产能（套）' : locale === 'ru' ? 'компл./год' : locale === 'fr' ? 'kits/an' : locale === 'es' ? 'juegos/año' : 'Sets/Year' },
            { num: '30+', label: locale === 'zh' ? '研发工程师' : locale === 'ru' ? 'инженеров R&D' : locale === 'fr' ? 'ingénieurs R&D' : locale === 'es' ? 'ingenieros I+D' : 'R&D Engineers' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-100">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.num}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {locale === 'zh' ? '与我们合作' : locale === 'ru' ? 'Сотрудничать с нами' : locale === 'fr' ? 'Travailler avec nous' : locale === 'es' ? 'Trabaje con nosotros' : 'Work With Us'}
          </h2>
          <p className="text-gray-600 mb-5">
            {locale === 'zh' ? '获取定制刹车片解决方案和报价' : 'Get custom brake pad solutions and quotes'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              {locale === 'zh' ? '查看产品' : 'View Products'} →
            </Link>
            <Link
              href={`/${locale}#inquiry`}
              className="inline-flex items-center px-6 py-3 border border-primary-500 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              {locale === 'zh' ? '获取报价' : 'Get a Quote'}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <ContactFloatingButtons />
    </div>
  );
}
