import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/lib/i18n/routing';
import { getSiteConfig } from '@/lib/product-service';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

// Google Ads 转化追踪代码 ID
const GA_AD_ID = 'AW-18337651107';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const TITLE_MAP: Record<string, string> = {
  en: 'RUISHA Brake - Professional Brake Pad Manufacturer',
  zh: '瑞刹 RUISHA - 专业刹车片制造商',
  ru: 'RUISHA Brake - Профессиональный производитель тормозных колодок',
  fr: 'RUISHA Brake - Fabricant professionnel de plaquettes de frein',
  es: 'RUISHA Brake - Fabricante profesional de pastillas de freno',
};

const DESC_MAP: Record<string, string> = {
  en: '20+ years of brake pad manufacturing experience, providing high-quality disc, drum and ceramic brake pad solutions to 50+ countries worldwide',
  zh: '20年刹车片研发制造经验，为全球50+国家提供高品质盘式、鼓式、陶瓷刹车片解决方案',
  ru: 'Более 20 лет опыта производства тормозных колодок, поставки в 50+ стран мира',
  fr: 'Plus de 20 ans d\'expérience en fabrication de plaquettes de frein, exportation dans 50+ pays',
  es: 'Más de 20 años de experiencia en fabricación de pastillas de freno, exportación a más de 50 países',
};

export async function generateMetadata({ params }: Props) {
  const { locale } = params;
  let title = TITLE_MAP[locale] || TITLE_MAP['en'];
  let description = DESC_MAP[locale] || DESC_MAP['en'];

  try {
    const config = await getSiteConfig(locale);
    if (Object.keys(config).length === 0) {
      const enConfig = await getSiteConfig('en');
      Object.assign(config, enConfig);
    }
    if (config.site_title) {
      title = config.site_title;
    } else if (config.company_name) {
      const suffix = locale === 'zh' ? ' - 专业刹车片制造商' : ' - Professional Brake Pad Manufacturer';
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

  return {
    title,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    openGraph: {
      title,
      description,
      locale,
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
        {/* Google Ads gtag.js - 紧跟 head 之后加载 */}
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
