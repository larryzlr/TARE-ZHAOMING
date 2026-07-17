'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';
import { useToast } from '@/components/Toast';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

type CategoryOption = {
  id: string;
  slug: string;
  name: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const locale = params.locale as string;
  const toast = useToast();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState('zh');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [form, setForm] = useState({
    slug: '',
    category: 'uncategorized',
    categories: [] as string[],
    status: 'draft',
    images: [] as string[],
    translations: LANGUAGES.map(l => ({
      lang: l.code,
      title: '',
      description: '',
      specs: [] as { label: string; value: string }[],
    })),
  });

  useEffect(() => {
    fetch('/api/categories?lang=zh')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setCategoriesLoading(false);
      })
      .catch(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('产品未找到');
        return res.json();
      })
      .then(data => {
        const p = data.product;
        setForm({
          slug: p.slug || '',
          category: p.category || 'uncategorized',
          categories: p.categories || (p.category && p.category !== 'uncategorized' ? [p.category] : []),
          status: p.status || 'draft',
          images: p.images || [],
          translations: LANGUAGES.map(l => {
            const existing = (p.translations || []).find((t: any) => t.lang === l.code);
            return {
              lang: l.code,
              title: existing?.title || '',
              description: existing?.description || '',
              specs: existing?.specs || [],
            };
          }),
        });
        setLoading(false);
      })
      .catch(() => {
        toast('error', '加载产品失败');
        router.push(`/${locale}/admin/products`);
      });
  }, [id, locale, router]);

  // 切换分类标签选择
  const toggleCategory = (slug: string) => {
    setForm(prev => {
      const exists = prev.categories.includes(slug);
      const next = exists
        ? prev.categories.filter(c => c !== slug)
        : [...prev.categories, slug];
      return { ...prev, categories: next, category: next[0] || 'uncategorized' };
    });
  };

  const currentTranslation = form.translations.find(t => t.lang === activeLang)!;

  const updateTranslation = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.lang === activeLang ? { ...t, [field]: value } : t
      ),
    }));
  };

  const updateSpec = (index: number, field: 'label' | 'value', value: string) => {
    setForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.lang === activeLang
          ? { ...t, specs: t.specs.map((s, i) => (i === index ? { ...s, [field]: value } : s)) }
          : t
      ),
    }));
  };

  const addSpec = () => {
    setForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.lang === activeLang ? { ...t, specs: [...t.specs, { label: '', value: '' }] } : t
      ),
    }));
  };

  const removeSpec = (index: number) => {
    setForm(prev => ({
      ...prev,
      translations: prev.translations.map(t =>
        t.lang === activeLang ? { ...t, specs: t.specs.filter((_, i) => i !== index) } : t
      ),
    }));
  };

  const addImage = (url: string) => {
    if (url.trim()) {
      setForm(prev => ({ ...prev, images: [...prev.images, url.trim()] }));
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast('success', '产品更新成功！');
        router.push(`/${locale}/admin/products`);
      } else {
        const data = await res.json();
        toast('error', data.error || '更新产品失败');
      }
    } catch {
      toast('error', '网络错误，请重试');
    } finally {
      setSaving(false);
    }
  };

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
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">编辑产品</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">标识符 (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">状态</label>
              <select
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="draft">草稿</option>
                <option value="published">已发布</option>
              </select>
            </div>
          </div>
          {/* 分类标签 - 多选 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              分类标签 <span className="text-gray-400 text-xs">（可多选，第一个为主分类。一个产品可同时属于多个分类，如盘式刹车片+陶瓷刹车片）</span>
            </label>
            {categoriesLoading ? (
              <div className="text-sm text-gray-400">加载分类中...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-gray-400">暂无分类，请先在分类管理中创建</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map(c => {
                  const selected = form.categories.includes(c.slug);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        selected
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-primary-300 hover:text-primary-600'
                      }`}
                    >
                      {selected && <span className="mr-1">✓</span>}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
            {form.categories.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                已选 {form.categories.length} 个 · 主分类: {form.categories[0]}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">产品图片</h2>
          <ImageUploader
            buttonText="上传图片"
            showPreview={false}
            onUpload={(url) => addImage(url)}
          />
          <div className="flex gap-2">
            <input
              id="imageUrlInput"
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="或输入图片URL后点击添加"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('imageUrlInput') as HTMLInputElement;
                addImage(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600"
            >
              添加
            </button>
          </div>
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-24 h-24 object-cover rounded-md border" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">多语言内容</h2>
          <div className="flex gap-1 border-b border-gray-200">
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

          <div>
            <label className="block text-sm text-gray-600 mb-1">产品名称</label>
            <input
              type="text"
              value={currentTranslation.title}
              onChange={e => updateTranslation('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">产品描述</label>
            <textarea
              value={currentTranslation.description}
              onChange={e => updateTranslation('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">规格参数</label>
            <div className="space-y-2">
              {currentTranslation.specs.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={spec.label}
                    onChange={e => updateSpec(i, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="参数名"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={e => updateSpec(i, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="参数值"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="px-3 py-1.5 text-sm text-primary-500 hover:bg-primary-50 rounded-md"
              >
                + 添加参数
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : '更新产品'}
          </button>
        </div>
      </form>
    </div>
  );
}
