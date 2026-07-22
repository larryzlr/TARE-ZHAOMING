// src/app/[locale]/not-found.tsx
// 客户端组件，避免构建时访问数据库

'use client';

import { useParams } from 'next/navigation';
import { getLocalizedPath } from '@/lib/i18n/path';

export default function NotFoundPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const text: Record<string, { title: string; desc: string; btn: string }> = {
    en: { title: 'Page Not Found', desc: '404 - The page you are looking for does not exist.', btn: 'Back to Home' },
    zh: { title: '页面未找到', desc: '404 - 您访问的页面不存在。', btn: '返回首页' },
    ru: { title: 'Страница не найдена', desc: '404 - Запрошенная страница не существует.', btn: 'На главную' },
    fr: { title: 'Page non trouvée', desc: '404 - La page que vous recherchez n\'existe pas.', btn: 'Retour à l\'accueil' },
    es: { title: 'Página no encontrada', desc: '404 - La página que busca no existe.', btn: 'Volver al inicio' },
  };

  const t = text[locale] || text.en;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.title}</h2>
      <p className="text-gray-600 mb-8">{t.desc}</p>
      <a
        href={getLocalizedPath(locale, '/')}
        className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-300"
      >
        {t.btn}
      </a>
    </div>
  );
}
