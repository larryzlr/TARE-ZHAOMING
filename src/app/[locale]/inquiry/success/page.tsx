import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SuccessPageProps = {
  params: { locale: string };
};

export default async function InquirySuccessPage({ params: { locale } }: SuccessPageProps) {
  const t = await getTranslations('IndexPage');

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
            {t('inquirySuccessTitle')}
          </h1>

          {/* 描述 */}
          <p className="text-gray-600 mb-6">
            {t('inquirySuccessDesc')}
          </p>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Link
              href={`/${locale}`}
              className="block w-full px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              {t('backToHome')}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="block w-full px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('viewProducts')}
            </Link>
          </div>
        </div>

        {/* 追踪像素/脚本位置 - 用于广告转化追踪 */}
        {/* 可以在这里添加 Google Ads, Facebook Pixel 等转化追踪代码 */}
      </div>
    </div>
  );
}