import { getTranslations } from 'next-intl/server';
import { getSiteConfig } from '@/lib/product-service';
import { getSiteUrl } from '@/lib/site-url';
import { routing } from '@/lib/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactFloatingButtons from '@/components/ContactFloatingButtons';
import Link from 'next/link';

// ISR：每小时重新生成
export const revalidate = 3600;

type FaqItem = { q: string; a: string };

const FAQ_TITLE_MAP: Record<string, string> = {
  en: 'FAQ - Frequently Asked Questions | Z-MING Brake',
  zh: '常见问题解答 - Z-MING 刹车片制造商',
  ru: 'FAQ - Часто задаваемые вопросы | Z-MING Brake',
  fr: 'FAQ - Questions fréquentes | Z-MING Brake',
  es: 'FAQ - Preguntas frecuentes | Z-MING Brake',
};

const FAQ_DESC_MAP: Record<string, string> = {
  en: 'Answers to common questions about Z-MING brake pads: MOQ, lead time, payment methods, certifications (E-Mark, IATF 16949), OEM/ODM customization process.',
  zh: 'Z-MING刹车片常见问题解答：起订量、交期、付款方式、认证（E-Mark、IATF 16949）、OEM/ODM定制流程等。',
  ru: 'Ответы на частые вопросы о тормозных колодках Z-MING: MOQ, сроки, оплата, сертификация, OEM/ODM.',
  fr: 'Réponses aux questions fréquentes sur les plaquettes de frein Z-MING : MOQ, délais, paiement, certification.',
  es: 'Respuestas a preguntas frecuentes sobre pastillas de freno Z-MING: MOQ, plazos, pago, certificación.',
};

// 默认 FAQ 内容（后台未配置时使用）
const DEFAULT_FAQ: Record<string, FaqItem[]> = {
  en: [
    { q: 'What is your Minimum Order Quantity (MOQ)?', a: 'Our standard MOQ is 500 sets per model. For new customers, we can accept a trial order of 200 sets to start the cooperation.' },
    { q: 'What is the lead time for production?', a: 'Generally 25-35 days for OEM orders after receiving the deposit. For stock items, we can ship within 7 days.' },
    { q: 'What payment methods do you accept?', a: 'We accept T/T (bank transfer), L/C at sight, Western Union, and PayPal for sample orders. 30% deposit + 70% balance before shipment is standard.' },
    { q: 'What certifications do your brake pads have?', a: 'Our brake pads are certified with E-Mark (ECE R90), AMECA, EAC, and CCC. Our factory is IATF 16949 certified.' },
    { q: 'Do you offer OEM/ODM customization?', a: 'Yes, we provide full OEM/ODM services including custom packaging, branding, formulations, and specifications based on your requirements.' },
    { q: 'Can you produce brake pads according to our samples?', a: 'Yes, we can reverse-engineer brake pads from your samples. Send us 2-3 sets of samples and we will produce matching products.' },
    { q: 'What materials are available for brake pads?', a: 'We offer semi-metallic, ceramic, low-metallic, and asbestos-free formulations to suit different driving conditions and preferences.' },
    { q: 'How do you ensure product quality?', a: 'We implement strict QC at every stage: raw material inspection, in-process testing, and 100% final inspection. Each batch comes with a test report.' },
  ],
  zh: [
    { q: '你们的起订量（MOQ）是多少？', a: '标准起订量为每型号500套。对于新客户，我们可以接受200套的试订单以开始合作。' },
    { q: '生产交期是多长时间？', a: 'OEM订单一般在收到定金后25-35天交货。库存产品可在7天内发货。' },
    { q: '你们接受哪些付款方式？', a: '我们接受电汇（T/T）、即期信用证（L/C）、西联汇款，样品订单支持PayPal。标准条款为30%定金+70%发货前付清。' },
    { q: '你们的刹车片有哪些认证？', a: '我们的刹车片通过E-Mark（ECE R90）、AMECA、EAC、CCC认证。工厂通过IATF 16949认证。' },
    { q: '你们提供OEM/ODM定制服务吗？', a: '是的，我们提供完整的OEM/ODM服务，包括定制包装、品牌、配方和规格，根据您的需求定制。' },
    { q: '可以根据我们的样品生产刹车片吗？', a: '可以，我们可以根据您的样品进行逆向开发。请寄送2-3套样品，我们将生产匹配的产品。' },
    { q: '刹车片有哪些材质可选？', a: '我们提供半金属、陶瓷、低金属、无石棉配方，以适应不同的驾驶条件和需求。' },
    { q: '你们如何保证产品质量？', a: '我们在每个环节实施严格质量控制：原材料检验、生产过程检测、100%成品检验。每批次附带测试报告。' },
  ],
  ru: [
    { q: 'Каков минимальный заказ (MOQ)?', a: 'Стандартный MOQ — 500 комплектов на модель. Для новых клиентов возможен пробный заказ от 200 комплектов.' },
    { q: 'Какие сроки производства?', a: 'Обычно 25-35 дней для OEM-заказов после получения депозита. Складские товары — 7 дней.' },
    { q: 'Какие способы оплаты вы принимаете?', a: 'T/T (банковский перевод), L/C, Western Union, PayPal для образцов. Стандарт: 30% депозит + 70% перед отгрузкой.' },
    { q: 'Какие сертификаты имеют ваши колодки?', a: 'E-Mark (ECE R90), AMECA, EAC, CCC. Завод сертифицирован по IATF 16949.' },
    { q: 'Предоставляете ли вы OEM/ODM услуги?', a: 'Да, полный спектр OEM/ODM услуг: упаковка, брендинг, состав и спецификации по вашему требованию.' },
  ],
  fr: [
    { q: 'Quelle est la quantité minimum (MOQ) ?', a: 'Le MOQ standard est de 500 kits par modèle. Pour les nouveaux clients, un essai à partir de 200 kits est possible.' },
    { q: 'Quel est le délai de production ?', a: 'Généralement 25-35 jours pour les commandes OEM après dépôt. Stock : 7 jours.' },
    { q: 'Quels modes de paiement acceptez-vous ?', a: 'T/T, L/C, Western Union, PayPal pour les échantillons. Standard : 30% dépôt + 70% avant expédition.' },
    { q: 'Quelles certifications ont vos plaquettes ?', a: 'E-Mark (ECE R90), AMECA, EAC, CCC. Usine certifiée IATF 16949.' },
    { q: 'Proposez-vous des services OEM/ODM ?', a: 'Oui, services OEM/ODM complets : emballage, marque, formulation selon vos besoins.' },
  ],
  es: [
    { q: '¿Cuál es el pedido mínimo (MOQ)?', a: 'El MOQ estándar es de 500 juegos por modelo. Para nuevos clientes, aceptamos pedidos de prueba desde 200 juegos.' },
    { q: '¿Cuál es el tiempo de producción?', a: 'Generalmente 25-35 días para pedidos OEM tras el depósito. Productos en stock: 7 días.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'T/T, L/C, Western Union, PayPal para muestras. Estándar: 30% depósito + 70% antes del envío.' },
    { q: '¿Qué certificaciones tienen sus pastillas?', a: 'E-Mark (ECE R90), AMECA, EAC, CCC. Fábrica certificada IATF 16949.' },
    { q: '¿Ofrecen servicios OEM/ODM?', a: 'Sí, servicios OEM/ODM completos: embalaje, marca, formulación según sus requisitos.' },
  ],
};

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const SITE_URL = await getSiteUrl();
  const title = FAQ_TITLE_MAP[locale] || FAQ_TITLE_MAP['en'];
  const description = FAQ_DESC_MAP[locale] || FAQ_DESC_MAP['en'];

  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}/faq`;
  });
  languages['x-default'] = `${SITE_URL}/en/faq`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/faq`,
      languages,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/${locale}/faq`,
      siteName: 'Z-MING Brake',
    },
  };
}

export default async function FaqPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('Common');
  const SITE_URL = await getSiteUrl();

  // 从后台获取 FAQ 配置，如果没有则使用默认内容
  let faqItems: FaqItem[] = DEFAULT_FAQ[locale] || DEFAULT_FAQ['en'];
  let pageTitle = locale === 'zh' ? '常见问题解答' : 'Frequently Asked Questions';
  let pageIntro = locale === 'zh'
    ? '以下是客户常问的问题，如果您有其他疑问，请随时联系我们。'
    : 'Here are answers to questions we frequently receive. If you have other questions, please feel free to contact us.';

  try {
    const config = await getSiteConfig(locale);
    if (config.faq_items) {
      const parsed = JSON.parse(config.faq_items);
      if (Array.isArray(parsed) && parsed.length > 0) {
        faqItems = parsed;
      }
    }
    if (config.faq_title) pageTitle = config.faq_title;
    if (config.faq_intro) pageIntro = config.faq_intro;
  } catch {}

  // FAQPage JSON-LD 结构化数据
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('home'), item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: pageTitle, item: `${SITE_URL}/${locale}/faq` },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 面包屑 */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-primary-600">{t('home')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{pageTitle}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{pageTitle}</h1>
        <p className="text-gray-600 mb-10">{pageIntro}</p>

        {/* FAQ 列表 */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition-colors"
            >
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                <span className="flex items-start gap-3">
                  <span className="text-primary-500 font-bold shrink-0">Q{idx + 1}.</span>
                  <span>{item.q}</span>
                </span>
                <svg
                  className="w-5 h-5 text-gray-400 transform transition-transform group-open:rotate-180 shrink-0 ml-2"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 pl-14 text-gray-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {locale === 'zh' ? '还有其他问题？' : locale === 'ru' ? 'Остались вопросы?' : locale === 'fr' ? "D'autres questions ?" : locale === 'es' ? '¿Más preguntas?' : 'Still have questions?'}
          </h2>
          <p className="text-gray-600 mb-5">
            {locale === 'zh' ? '我们的销售团队随时为您解答' : 'Our sales team is ready to help you'}
          </p>
          <Link
            href={`/${locale}#inquiry`}
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            {locale === 'zh' ? '联系我们' : 'Contact Us'} →
          </Link>
        </div>
      </main>
      <Footer />
      <ContactFloatingButtons />
    </div>
  );
}
