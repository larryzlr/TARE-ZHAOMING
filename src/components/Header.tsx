'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

type HeaderProps = {
  companyName?: string;
  logo?: string;
  whatsapp?: string;
  telegram?: string;
  categories?: { slug: string; name: string }[];
};

export default function Header({ companyName = 'ZHAOMING', logo, whatsapp, telegram, categories = [] }: HeaderProps) {
  const t = useTranslations('Common');
  const pt = useTranslations('ProductPage');
  const pathname = usePathname();
  const currentLocale = pathname.split('/')[1] || 'en';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = pathname.includes('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  const isHome = pathname === `/${currentLocale}` || pathname === '/';

  const navLink = (href: string, label: string) => {
    const active = isHome && href.includes('#')
      ? false
      : pathname === href;
    return (
      <Link
        href={href}
        className={`${active ? 'text-primary-600 font-semibold' : 'text-gray-700'} hover:text-primary-600 transition-colors text-sm font-medium`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={`/${currentLocale}`} className="flex items-center space-x-2 shrink-0">
            {logo ? (
              <>
                <Image
                  src={logo}
                  alt={`${companyName} - Brake Pad Manufacturer Logo`}
                  width={120}
                  height={36}
                  className="h-9 w-auto max-w-[120px] object-contain"
                />
                {companyName && <span className="text-lg font-bold text-gray-800 hidden sm:inline">{companyName}</span>}
              </>
            ) : (
              <>
                <div className="bg-primary-500 w-9 h-9 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-800">{companyName}</span>
              </>
            )}
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {navLink(`/${currentLocale}`, t('home'))}

            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <Link
                href={`/${currentLocale}/products`}
                className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors text-sm font-medium"
              >
                <span>{t('products')}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </Link>
              {productsOpen && (
                <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                  <Link
                    href={`/${currentLocale}/products`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  >
                    {pt('allProducts')}
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  {categories.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/${currentLocale}/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLink(`/${currentLocale}#about`, t('about'))}
            {navLink(`/${currentLocale}#contact`, t('contact'))}
          </nav>

          <div className="flex items-center space-x-2">
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-[#0088cc] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#0077b5] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.02.322-.046.476.09.16.136.181.37.181.552 0 .18-.014 2.12-.014 2.12l.002.425s.02.374-.126.525a.497.497 0 0 1-.369.14c-.148-.003-.318-.008-.508-.014l-.025.013c-.188-.007-.391-.014-.601-.018-.357-.008-.736-.012-1.067-.012-.31 0-.59.003-.807.012l-.096.003c-.158.006-.326.015-.49.026-.084.013-.18.042-.255.102-.052.04-.098.1-.125.183l-.008.025c-.02.064-.033.135-.033.212 0 .075.01.146.03.21l.01.024c.055.14.153.25.28.32.012.003.025.01.04.015.13.054.354.098.73.098.17 0 .38-.006.608-.017l.044-.002c.252-.012.513-.028.755-.048l.05-.004c.12-.01.235-.02.34-.033.058-.007.112-.014.162-.02.083-.013.186-.03.293-.05.028-.006.056-.012.083-.018.1-.023.2-.048.293-.075l.025-.007c.1-.03.195-.062.28-.095l.012-.005c.073-.028.14-.056.2-.084.018-.008.035-.016.052-.025.042-.02.1-.053.167-.1.023-.017.046-.034.067-.052.024-.02.046-.04.067-.062l.015-.014c.028-.028.054-.057.078-.089.01-.013.02-.027.03-.04.034-.05.05-.093.05-.13a.134.134 0 0 0-.018-.068l-.005-.008a.26.26 0 0 0-.047-.054l-.012-.01a.7.7 0 0 0-.078-.052l-.008-.005c-.024-.013-.05-.026-.076-.038a.934.934 0 0 0-.197-.062l-.02-.004a.742.742 0 0 0-.094-.01c-.04-.003-.083-.005-.126-.005h-.037l-.098.003-.015.001-.037.002-.064.003-.1.003-.018.001-.08.002h-.027l-.12.001c-.16 0-.317.0-.47-.002a.14.14 0 0 1-.022 0l-.14-.003-.097-.003-.19-.006-.178-.007-.252-.01-.143-.008-.24-.014-.065-.005-.168-.013-.017-.002-.103-.01-.073-.01-.036-.005-.064-.01-.01-.002-.066-.013-.05-.012-.022-.007c-.03-.01-.058-.02-.085-.033l-.014-.007a.363.363 0 0 1-.08-.053l-.006-.005a.236.236 0 0 1-.062-.078l-.002-.005a.194.194 0 0 1-.016-.08l.001-.022.002-.012a.228.228 0 0 1 .026-.078l.006-.01a.306.306 0 0 1 .034-.046l.006-.007c.016-.016.035-.033.055-.05l.01-.007c.012-.01.025-.018.04-.027l.016-.01c.025-.014.053-.028.085-.041l.012-.005c.043-.018.092-.035.146-.05l.03-.008c.043-.012.09-.022.14-.032l.016-.003.105-.018.07-.01.05-.006.12-.013.086-.007.082-.005.142-.006.054-.001.177-.002h.152l.104.003.086.003.1.005.066.004.11.008.04.004.156.015.017.002.128.016.072.01.094.015.085.016.02.004.092.022.088.023.068.02.1.034.045.018.077.035.06.03.018.011.067.04.03.02.036.028.016.015.023.02.033.035.01.014.018.026a.166.166 0 0 1 .021.06l-.001.025-.004.023-.009.028-.008.018-.017.03-.013.017-.027.028-.02.016-.025.017-.04.022-.02.01-.04.017-.028.01-.047.014-.022.006-.06.013-.022.004-.06.01-.013.002-.055.006-.01.001-.05.003h-.027l-.022.001-.035.001-.012-.001-.03-.002-.008-.001-.017-.003-.015-.003-.008-.003-.009-.004-.003-.003-.002-.003v-.005l.005-.007.015-.01.024-.01.017-.006.058-.016.01-.002.056-.01.008-.001.05-.006h.027l.04.002h.018l.028.003.007.001.018.003.012.003.005.003h.002l.002.002v.002l-.004.002-.013.003-.024.004-.009.001-.034.003h-.057l-.013-.001-.02-.003-.006-.002-.006-.002-.003-.003.001-.002.005-.001.013-.001.012-.001h.014l.009.001.005.002.002.002v.002h-.006l-.014-.001-.006-.001-.002-.001h-.001v-.001h.003l.007.001.003.001h-.001l-.001-.001h.002l.002.001h-.003l-.004-.002-.003-.002-.002-.002v-.002l.002-.001h.003l.003.001.002.002.001.002.001.001v.001h-.004l-.001-.001-.001-.002h.003l.001.001.001.002v.001h-.001l-.001-.001-.001-.002v-.001l.001.001.002.001v.001l-.001-.001-.001-.001v-.001h.002v.002l-.001-.001v-.002h.001v.002l-.001-.001v-.001h.001v.002l-.001-.001h.001l-.001-.001h.001l.001.001v.001l-.001-.001v-.001h.001v.001z"/></svg>
                <span>Telegram</span>
              </a>
            )}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>WhatsApp</span>
              </a>
            )}
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-gray-600 hover:text-primary-600"
              aria-label="菜单"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link href={`/${currentLocale}`} className="block py-2 text-gray-700 hover:text-primary-600 font-medium">{t('home')}</Link>
            <Link href={`/${currentLocale}/products`} className="block py-2 text-gray-700 hover:text-primary-600 font-medium">{t('products')}</Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/${currentLocale}/products?category=${cat.slug}`}
                className="block py-1 pl-4 text-sm text-gray-500 hover:text-primary-600"
              >
                {cat.name}
              </Link>
            ))}
            <Link href={`/${currentLocale}#about`} className="block py-2 text-gray-700 hover:text-primary-600 font-medium">{t('about')}</Link>
            <Link href={`/${currentLocale}#contact`} className="block py-2 text-gray-700 hover:text-primary-600 font-medium">{t('contact')}</Link>
            <div className="border-t border-gray-200 my-2"></div>
            <Link
              href={`/${currentLocale}/admin/login`}
              className="block py-1 text-xs text-gray-400 hover:text-gray-600"
            >
              {t('login')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
