'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

interface Category {
  id: string;
  slug: string;
  icon: string;
  sortOrder: number;
  translations: { lang: string; name: string }[];
}

const EMPTY_CATEGORY: Omit<Category, 'id'> = {
  slug: '',
  icon: '',
  sortOrder: 0,
  translations: LANGUAGES.map(l => ({ lang: l.code, name: '' })),
};

function CategoryIcon({ icon }: { icon: string }) {
  if (!icon) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-lg">📦</span>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
      <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
        <path d={icon} />
      </svg>
    </div>
  );
}

export default function CategoriesPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('zh');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    fetch('/api/categories?lang=zh')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSave = async () => {
    const target = editing || { ...EMPTY_CATEGORY, id: '' };
    if (!target.slug.trim()) {
      alert('请输入分类标识符');
      return;
    }

    setSaving(true);
    try {
      const isEdit = !!editing?.id;
      const url = isEdit ? `/api/categories/${editing.id}` : '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: target.slug,
          icon: target.icon,
          sortOrder: Number(target.sortOrder),
          translations: target.translations
        }),
      });

      if (res.ok) {
        setEditing(null);
        setIsCreating(false);
        loadCategories();
      } else {
        const data = await res.json();
        alert(data.error || '保存失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此分类？该分类下的产品不会受到影响，但产品筛选将不再显示此分类。')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCategories();
      } else {
        alert('删除失败');
      }
    } catch {
      alert('网络错误');
    }
  };

  const updateTranslation = (lang: string, name: string) => {
    const target = editing || { ...EMPTY_CATEGORY, id: '' };
    setEditing({
      ...target,
      translations: target.translations.map(t => t.lang === lang ? { ...t, name } : t)
    });
  };

  const currentTarget = editing || (isCreating ? { ...EMPTY_CATEGORY, id: '' } : null);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">分类管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理首页和产品页展示的产品分类，支持图标配置和多语言名称</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setEditing({ ...EMPTY_CATEGORY, id: '' }); }}
          className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition"
        >
          + 添加分类
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-600">图标</th>
              <th className="px-6 py-3 font-medium text-gray-600">标识符</th>
              <th className="px-6 py-3 font-medium text-gray-600">中文名称</th>
              <th className="px-6 py-3 font-medium text-gray-600">英文名称</th>
              <th className="px-6 py-3 font-medium text-gray-600">排序</th>
              <th className="px-6 py-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <CategoryIcon icon={category.icon} />
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{category.slug}</td>
                <td className="px-6 py-4 text-gray-800">
                  {category.translations.find(t => t.lang === 'zh')?.name || '-'}
                </td>
                <td className="px-6 py-4 text-gray-800">
                  {category.translations.find(t => t.lang === 'en')?.name || '-'}
                </td>
                <td className="px-6 py-4 text-gray-500">{category.sortOrder}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => { setEditing(category); setIsCreating(false); }}
                    className="text-primary-500 hover:text-primary-700 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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

      {(editing || isCreating) && currentTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {isCreating ? '添加分类' : '编辑分类'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">标识符 (slug)</label>
                  <input
                    type="text"
                    value={currentTarget.slug}
                    onChange={e => setEditing({ ...currentTarget, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="例如 brake-pads"
                  />
                  <p className="text-xs text-gray-400 mt-1">URL 中使用，保存后不可修改</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">排序</label>
                  <input
                    type="number"
                    value={currentTarget.sortOrder}
                    onChange={e => setEditing({ ...currentTarget, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">图标 SVG Path</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={currentTarget.icon}
                      onChange={e => setEditing({ ...currentTarget, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                      rows={3}
                      placeholder="粘贴 SVG path 的 d 属性值，留空则使用默认占位图标"
                    />
                    <ImageUploader
                      buttonText="上传 SVG"
                      showPreview={false}
                      onUpload={(url) => setEditing({ ...currentTarget, icon: url })}
                    />
                  </div>
                  <div className="w-16 flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-500">预览</span>
                    <CategoryIcon icon={currentTarget.icon} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">多语言名称</label>
                <div className="flex gap-1 border-b border-gray-200 mb-3">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setActiveLang(l.code)}
                      className={`px-4 py-2 text-sm transition ${
                        activeLang === l.code
                          ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={currentTarget.translations.find(t => t.lang === activeLang)?.name || ''}
                  onChange={e => updateTranslation(activeLang, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder={`${LANGUAGES.find(l => l.code === activeLang)?.label} 名称`}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setEditing(null); setIsCreating(false); }}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
