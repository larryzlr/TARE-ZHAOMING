'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// 多语言文案（与成功页面共用）
const MESSAGES: Record<string, {
  title: string;
  desc: string;
  continue: string;
  viewProducts: string;
  tip: string;
}> = {
  zh: {
    title: '提交成功',
    desc: '感谢您的询盘！我们将在24小时内与您联系。',
    continue: '继续浏览',
    viewProducts: '查看产品',
    tip: '我们会严格保护您的隐私信息',
  },
  en: {
    title: 'Submission Successful',
    desc: 'Thank you for your inquiry! We will contact you within 24 hours.',
    continue: 'Continue Browsing',
    viewProducts: 'View Products',
    tip: 'Your privacy is strictly protected',
  },
  ru: {
    title: 'Успешно отправлено',
    desc: 'Спасибо за ваш запрос! Мы свяжемся с вами в течение 24 часов.',
    continue: 'Продолжить просмотр',
    viewProducts: 'Посмотреть продукты',
    tip: 'Ваша конфиденциальность строго защищена',
  },
  fr: {
    title: 'Soumission réussie',
    desc: 'Merci pour votre demande ! Nous vous contacterons dans les 24 heures.',
    continue: 'Continuer la navigation',
    viewProducts: 'Voir les produits',
    tip: 'Votre confidentialité est strictement protégée',
  },
  es: {
    title: 'Envío exitoso',
    desc: '¡Gracias por su consulta! Nos pondremos en contacto en 24 horas.',
    continue: 'Continuar navegando',
    viewProducts: 'Ver productos',
    tip: 'Su privacidad está estrictamente protegida',
  },
};

const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['zh', 'en', 'ru', 'fr', 'es'];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
};

export default function InquirySuccessModal({ isOpen, onClose, locale }: Props) {
  const pathname = usePathname();

  // 获取用户语言环境
  const getUserLocale = useCallback((): string => {
    // 优先使用传入的 locale（来自当前页面）
    if (locale && SUPPORTED_LANGS.includes(locale)) {
      return locale;
    }

    // 检查 cookie
    if (typeof document !== 'undefined') {
      const cookieLang = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];
      if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) {
        return cookieLang;
      }

      // 检查 localStorage
      try {
        const storedLang = localStorage.getItem('locale');
        if (storedLang && SUPPORTED_LANGS.includes(storedLang)) {
          return storedLang;
        }
      } catch {}

      // 检查浏览器语言
      const browserLang = navigator.language.split('-')[0];
      if (SUPPORTED_LANGS.includes(browserLang)) {
        return browserLang;
      }
    }

    return DEFAULT_LANG;
  }, [locale]);

  const userLocale = getUserLocale();
  const t = MESSAGES[userLocale] || MESSAGES[DEFAULT_LANG];

  // 当弹窗打开时，改变 URL 用于广告追踪
  useEffect(() => {
    if (isOpen) {
      // 使用统一的 URL（不带语言前缀）
      const successUrl = '/inquiry/success';
      window.history.pushState({ inquirySuccess: true }, '', successUrl);
    }
  }, [isOpen]);

  // 关闭弹窗时恢复原 URL
  const handleClose = useCallback(() => {
    // 恢复原来的 URL
    window.history.pushState({}, '', pathname);
    onClose();
  }, [pathname, onClose]);

  // 监听浏览器后退按钮
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all animate-[modalShow_0.3s_ease-out]">
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 成功图标 */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {t.title}
        </h2>

        {/* 描述 */}
        <p className="text-gray-600 mb-6">
          {t.desc}
        </p>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleClose}
            className="block w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t.continue}
          </button>
          <Link
            href={`/${userLocale}/products`}
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

      {/* CSS 动画 */}
      <style jsx global>{`
        @keyframes modalShow {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}