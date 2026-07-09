'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Product {
  id: string;
  slug: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">产品管理</h1>
        <Link
          href={`/${locale}/admin/products/new`}
          className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition"
        >
          + 添加产品
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-4 h-16"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">暂无产品</p>
          <Link
            href={`/${locale}/admin/products/new`}
            className="text-primary-500 hover:underline"
          >
            创建第一个产品 →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">产品名称</th>
                <th className="px-6 py-3 font-medium text-gray-600">标识符</th>
                <th className="px-6 py-3 font-medium text-gray-600">状态</th>
                <th className="px-6 py-3 font-medium text-gray-600">创建时间</th>
                <th className="px-6 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{product.title}</td>
                  <td className="px-6 py-4 text-gray-500">{product.slug}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs rounded-full ${
                        product.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {product.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(product.createdAt).toLocaleDateString('zh-CN')}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <Link
                      href={`/${locale}/admin/products/${product.id}`}
                      className="text-primary-500 hover:text-primary-700 text-sm"
                    >
                      编辑
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm('确定删除此产品？')) return;
                        await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
                        setProducts(products.filter(p => p.id !== product.id));
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
