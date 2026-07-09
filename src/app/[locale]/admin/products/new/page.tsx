'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUploader from '@/components/ImageUploader';

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

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('zh');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [form, setForm] = useState({
    slug: '',
    category: 'uncategorized',
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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push(`/${locale}/admin/products`);
      } else {
        const data = await res.json();
        alert(data.error || '创建产品失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">添加产品</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">基本信息</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">标识符 (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="例如 ceramic-pads-rs100"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">分类</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                disabled={categoriesLoading}
              >
                <option value="uncategorized">未分类</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
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
              placeholder="产品标题"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">产品描述</label>
            <textarea
              value={currentTranslation.description}
              onChange={e => updateTranslation('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={4}
              placeholder="产品详细描述"
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
            {saving ? '保存中...' : '创建产品'}
          </button>
        </div>
      </form>
    </div>
  );
}
