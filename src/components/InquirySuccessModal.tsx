'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
};

export default function InquirySuccessModal({ isOpen, onClose, locale }: Props) {
  const t = useTranslations('IndexPage');
  const router = useRouter();
  const pathname = usePathname();

  // 当弹窗打开时，改变 URL 用于广告追踪
  useEffect(() => {
    if (isOpen) {
      // 使用 history.pushState 改变 URL 而不实际跳转页面
      const successUrl = `/${locale}/inquiry/success`;
      window.history.pushState({ inquirySuccess: true }, '', successUrl);
    }
  }, [isOpen, locale]);

  // 关闭弹窗时恢复原 URL
  const handleClose = useCallback(() => {
    // 恢复原来的 URL
    window.history.pushState({}, '', pathname);
    onClose();
  }, [pathname, onClose]);

  // 监听浏览器后退按钮
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
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
          {t('inquirySuccessTitle')}
        </h2>

        {/* 描述 */}
        <p className="text-gray-600 mb-6">
          {t('inquirySuccessDesc')}
        </p>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleClose}
            className="block w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            {t('inquirySuccessContinue')}
          </button>
          <a
            href={`/${locale}/products`}
            className="block w-full px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('viewProducts')}
          </a>
        </div>

        {/* 底部提示 */}
        <p className="text-xs text-gray-400 mt-6">
          {t('inquirySuccessTip')}
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