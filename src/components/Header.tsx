'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

type HeaderProps = {
  companyName?: string;
  whatsapp?: string;
  categories?: { slug: string; name: string }[];
};

export default function Header({ companyName = 'ZHAOMING', whatsapp, categories = [] }: HeaderProps) {
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
            <div className="bg-primary-500 w-9 h-9 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-800">{companyName}</span>
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

          <div className="flex items-center space-x-3">
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>WhatsApp</span>
              </a>
            )}
            <LanguageSwitcher />
            {!isAdmin && (
              <Link
                href={`/${currentLocale}/admin/login`}
                className="hidden sm:inline-flex items-center space-x-1.5 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
                title="Admin Login"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{t('login')}</span>
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
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
            <Link
              href={`/${currentLocale}/admin/login`}
              className="block py-2 text-gray-800 hover:text-primary-600 font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{t('login')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
