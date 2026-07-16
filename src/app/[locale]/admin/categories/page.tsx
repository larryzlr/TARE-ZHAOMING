'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { useToast } from '@/components/Toast';

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
  parentId: string | null;
  sortOrder: number;
  translations: { lang: string; name: string }[];
  children?: Category[];
}

const EMPTY_CATEGORY: Omit<Category, 'id'> = {
  slug: '',
  icon: '',
  parentId: null,
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
  if (icon.startsWith('/') || icon.startsWith('http')) {
    return <img src={icon} alt="icon" className="w-10 h-10 rounded-full object-cover" />;
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
  const toast = useToast();

  const [tree, setTree] = useState<Category[]>([]);
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
        setTree(data.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSave = async () => {
    const target = editing || { ...EMPTY_CATEGORY, id: '' };
    if (!target.slug.trim()) {
      toast('error', '请输入分类标识符');
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
          parentId: target.parentId || null,
          sortOrder: Number(target.sortOrder),
          translations: target.translations
        }),
      });

      if (res.ok) {
        setEditing(null);
        setIsCreating(false);
        loadCategories();
        toast('success', isEdit ? '分类更新成功' : '分类创建成功');
      } else {
        const data = await res.json();
        toast('error', data.error || '保存失败');
      }
    } catch {
      toast('error', '网络错误，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此分类？如果有子分类，子分类也会被保留但变为一级分类。')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCategories();
        toast('success', '分类已删除');
      } else {
        toast('error', '删除失败');
      }
    } catch {
      toast('error', '网络错误，请重试');
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
          <p className="text-sm text-gray-500 mt-1">管理产品分类，支持二级分类（一级分类 → 二级分类）</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsCreating(true); setEditing({ ...EMPTY_CATEGORY, id: '', parentId: null }); }}
            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition"
          >
            + 添加一级分类
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {tree.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center text-gray-400">
            暂无分类，点击"添加一级分类"创建
          </div>
        )}
        {tree.map(parent => (
          <div key={parent.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 一级分类 */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <CategoryIcon icon={parent.icon} />
                <div>
                  <span className="font-semibold text-gray-800">{parent.translations.find(t => t.lang === 'zh')?.name || parent.translations.find(t => t.lang === 'en')?.name || parent.slug}</span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">{parent.slug}</span>
                  <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">一级分类</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setIsCreating(true); setEditing({ ...EMPTY_CATEGORY, id: '', parentId: parent.id }); }}
                  className="text-green-500 hover:text-green-700 text-sm"
                >
                  + 添加子分类
                </button>
                <button
                  onClick={() => { setEditing(parent); setIsCreating(false); }}
                  className="text-primary-500 hover:text-primary-700 text-sm"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(parent.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
            {/* 二级分类 */}
            {parent.children && parent.children.length > 0 && (
              <div className="divide-y divide-gray-50">
                {parent.children.map(child => (
                  <div key={child.id} className="flex items-center justify-between px-6 py-3 pl-12 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CategoryIcon icon={child.icon} />
                      <div>
                        <span className="text-gray-700">{child.translations.find(t => t.lang === 'zh')?.name || child.translations.find(t => t.lang === 'en')?.name || child.slug}</span>
                        <span className="ml-2 text-xs text-gray-400 font-mono">{child.slug}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">二级分类</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setEditing(child); setIsCreating(false); }}
                        className="text-primary-500 hover:text-primary-700 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {(editing || isCreating) && currentTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {isCreating ? (currentTarget.parentId ? '添加二级分类' : '添加一级分类') : '编辑分类'}
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

              {/* 父分类选择 */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">父分类</label>
                <select
                  value={currentTarget.parentId || ''}
                  onChange={e => setEditing({ ...currentTarget, parentId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">无（作为一级分类）</option>
                  {tree.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.translations.find(t => t.lang === 'zh')?.name || p.slug}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">分类图标</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={currentTarget.icon}
                      onChange={e => setEditing({ ...currentTarget, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                      rows={3}
                      placeholder="可上传图片，或粘贴 SVG path 的 d 属性值，留空则使用默认占位图标"
                    />
                    <ImageUploader
                      buttonText="上传图标图片"
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
