'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 多语言文案
const MESSAGES: Record<string, {
  title: string;
  desc: string;
  continue: string;
  viewProducts: string;
  backToHome: string;
  tip: string;
}> = {
  zh: {
    title: '提交成功',
    desc: '感谢您的询盘！我们将在24小时内与您联系。',
    continue: '继续浏览',
    viewProducts: '查看产品',
    backToHome: '返回首页',
    tip: '我们会严格保护您的隐私信息',
  },
  en: {
    title: 'Submission Successful',
    desc: 'Thank you for your inquiry! We will contact you within 24 hours.',
    continue: 'Continue Browsing',
    viewProducts: 'View Products',
    backToHome: 'Back to Home',
    tip: 'Your privacy is strictly protected',
  },
  ru: {
    title: 'Успешно отправлено',
    desc: 'Спасибо за ваш запрос! Мы свяжемся с вами в течение 24 часов.',
    continue: 'Продолжить просмотр',
    viewProducts: 'Посмотреть продукты',
    backToHome: 'На главную',
    tip: 'Ваша конфиденциальность строго защищена',
  },
  fr: {
    title: 'Soumission réussie',
    desc: 'Merci pour votre demande ! Nous vous contacterons dans les 24 heures.',
    continue: 'Continuer la navigation',
    viewProducts: 'Voir les produits',
    backToHome: "Retour à l'accueil",
    tip: 'Votre confidentialité est strictement protégée',
  },
  es: {
    title: 'Envío exitoso',
    desc: '¡Gracias por su consulta! Nos pondremos en contacto en 24 horas.',
    continue: 'Continuar navegando',
    viewProducts: 'Ver productos',
    backToHome: 'Volver al inicio',
    tip: 'Su privacidad está estrictamente protegida',
  },
};

const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['zh', 'en', 'ru', 'fr', 'es'];

export default function InquirySuccessPage() {
  const [locale, setLocale] = useState<string>(DEFAULT_LANG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 检测用户语言环境
    const detectLanguage = (): string => {
      // 1. 检查 cookie 中的语言设置
      const cookieLang = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];

      if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) {
        return cookieLang;
      }

      // 2. 检查 localStorage
      try {
        const storedLang = localStorage.getItem('locale');
        if (storedLang && SUPPORTED_LANGS.includes(storedLang)) {
          return storedLang;
        }
      } catch {}

      // 3. 检查浏览器语言
      const browserLang = navigator.language.split('-')[0];
      if (SUPPORTED_LANGS.includes(browserLang)) {
        return browserLang;
      }

      return DEFAULT_LANG;
    };

    setLocale(detectLanguage());
    setMounted(true);
  }, []);

  const t = MESSAGES[locale] || MESSAGES[DEFAULT_LANG];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 成功图标 */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {t.title}
          </h1>

          {/* 描述 */}
          <p className="text-gray-600 mb-6">
            {t.desc}
          </p>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Link
              href={`/${locale}`}
              className="block w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              {t.backToHome}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="block w-full px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.viewProducts}
            </Link>
          </div>

          {/* 底部提示 */}
          <p className="text-xs text-gray-400 mt-6">
            {t.tip}
          </p>
        </div>

        {/* 追踪像素/脚本位置 - 用于广告转化追踪 */}
        {/* 可以在这里添加 Google Ads, Facebook Pixel 等转化追踪代码 */}
      </div>
    </div>
  );
}