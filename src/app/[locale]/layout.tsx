import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { getSiteConfig } from '@/lib/product-service';
import { getSiteUrl } from '@/lib/site-url';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

// Google Ads 转化追踪代码 ID（保持不变，用于广告效果追踪）
const GA_AD_ID = 'AW-18337651107';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const TITLE_MAP: Record<string, string> = {
  en: 'RUISHA Brake - Professional Brake Pad Manufacturer | OEM & E-Mark',
  zh: '瑞刹 RUISHA - 专业刹车片制造商 | OEM刹车片工厂',
  ru: 'RUISHA Brake - Производитель тормозных колодок | OEM E-Mark',
  fr: 'RUISHA Brake - Fabricant de plaquettes de frein | OEM E-Mark',
  es: 'RUISHA Brake - Fabricante de pastillas de freno | OEM E-Mark',
};

const DESC_MAP: Record<string, string> = {
  en: 'Leading OEM brake pads factory with 20+ years experience. E-Mark certified disc, drum & ceramic brake pads exported to 50+ countries. Get a free quote today!',
  zh: '20年专业刹车片制造商，提供OEM刹车片、E-Mark认证盘式/鼓式/陶瓷刹车片，出口全球50+国家。立即获取报价！',
  ru: 'Производитель тормозных колодок OEM с опытом 20+ лет. Сертифицированные E-Mark дисковые, барабанные и керамические колодки в 50+ стран.',
  fr: 'Fabricant OEM de plaquettes de frein avec 20+ ans d\'expérience. Plaquettes certifiées E-Mark exportées dans 50+ pays. Devis gratuit !',
  es: 'Fabricante OEM de pastillas de freno con 20+ años de experiencia. Pastillas certificadas E-Mark exportadas a 50+ países. ¡Cotización gratis!',
};

const KEYWORDS_MAP: Record<string, string> = {
  en: 'brake pads manufacturer, OEM brake pads, E-Mark certified brake pads, disc brake pads, ceramic brake pads, brake pad factory, RUISHA Brake',
  zh: '刹车片制造商,OEM刹车片,E-Mark认证刹车片,盘式刹车片,陶瓷刹车片,刹车片工厂,瑞刹',
  ru: 'производитель тормозных колодок, OEM тормозные колодки, E-Mark certified, дисковые колодки, керамические колодки',
  fr: 'fabricant plaquettes de frein, plaquettes OEM, E-Mark, plaquettes céramiques, plaquettes disque',
  es: 'fabricante pastillas de freno, pastillas OEM, E-Mark, pastillas cerámicas, pastillas disco',
};

// OG 语言代码映射
const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ru: 'ru_RU',
  fr: 'fr_FR',
  es: 'es_ES',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.z-ming.com';

export async function generateMetadata({ params }: Props) {
  const { locale } = params;
  const siteUrl = await getSiteUrl();
  let title = TITLE_MAP[locale] || TITLE_MAP['en'];
  let description = DESC_MAP[locale] || DESC_MAP['en'];
  const keywords = KEYWORDS_MAP[locale] || KEYWORDS_MAP['en'];

  try {
    const config = await getSiteConfig(locale);
    if (Object.keys(config).length === 0) {
      const enConfig = await getSiteConfig('en');
      Object.assign(config, enConfig);
    }
    if (config.site_title) {
      title = config.site_title;
    } else if (config.company_name) {
      const suffix = locale === 'zh' ? ' - 专业刹车片制造商 | OEM刹车片工厂' : ' - Professional Brake Pad Manufacturer | OEM & E-Mark';
      title = config.company_name + suffix;
    }
    if (config.site_description) {
      description = config.site_description;
    } else if (config.hero_subtitle) {
      description = config.hero_subtitle;
    }
  } catch (e) {
    // fallback to defaults
  }

  // 构建 hreflang 多语言 alternate 链接
  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${siteUrl}/${loc}`;
  });
  // 添加 x-default 指向英文版本
  languages['x-default'] = `${siteUrl}/en`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages,
    },
    openGraph: {
      title,
      description,
      locale: OG_LOCALE_MAP[locale] || 'en_US',
      url: `${siteUrl}/${locale}`,
      siteName: 'Z-MING Brake',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Google Ads gtag.js - 紧跟 head 之后加载（保持不变，用于广告效果追踪） */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_AD_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_AD_ID}');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
