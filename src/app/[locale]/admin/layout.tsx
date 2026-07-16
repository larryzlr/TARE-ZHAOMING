'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ToastProvider } from '@/components/Toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'en';
  const [authChecked, setAuthChecked] = useState(false);

  const isAdminLogin = pathname.includes('/admin/login');

  useEffect(() => {
    if (isAdminLogin) {
      setAuthChecked(true);
      return;
    }
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace(`/${locale}/admin/login`);
      return;
    }
    setAuthChecked(true);
  }, [pathname, isAdminLogin, locale, router]);

  if (isAdminLogin) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">正在验证登录状态...</div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push(`/${locale}/admin/login`);
  };

  const navItems = [
    { href: `/${locale}/admin/dashboard`, label: '仪表板' },
    { href: `/${locale}/admin/products`, label: '产品管理' },
    { href: `/${locale}/admin/categories`, label: '分类管理' },
    { href: `/${locale}/admin/oe-numbers`, label: 'OE号管理' },
    { href: `/${locale}/admin/inquiries`, label: '询盘管理' },
    { href: `/${locale}/admin/translations`, label: '文案管理' },
    { href: `/${locale}/admin/settings`, label: '站点设置' },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">管理后台</h1>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-5 py-3 text-sm transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-5 border-t border-gray-200 space-y-3">
          <Link href={`/${locale}`} className="block text-sm text-gray-500 hover:text-gray-700">
            ← 返回网站
          </Link>
          <button
            onClick={handleLogout}
            className="block text-sm text-red-500 hover:text-red-700"
          >
            退出登录
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
