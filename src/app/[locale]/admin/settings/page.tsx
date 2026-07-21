'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

type FieldType = 'text' | 'textarea' | 'image' | 'multi-image' | 'opacity' | 'faq-editor';
type Field = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  overlayColor?: 'white' | 'black';
};

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const CONFIG_SECTIONS: { key: string; title: string; fields: Field[] }[] = [
  {
    key: 'basic',
    title: '基本信息',
    fields: [
      { key: 'company_name', label: '公司名称', type: 'text', placeholder: '您的公司名称' },
      { key: 'site_title', label: '浏览器标题 (SEO)', type: 'text', placeholder: '公司名 - 标语' },
      { key: 'site_description', label: '网站描述 (SEO)', type: 'textarea', placeholder: '用于搜索引擎的简要描述' },
      { key: 'logo', label: 'Logo 图片', type: 'image', placeholder: '上传或输入Logo图片链接' },
    ]
  },
  {
    key: 'contact',
    title: '联系方式',
    fields: [
      { key: 'whatsapp', label: 'WhatsApp 链接', type: 'text', placeholder: 'https://wa.me/861234567890' },
      { key: 'telegram', label: 'Telegram 链接', type: 'text', placeholder: 'https://t.me/your_username' },
      { key: 'wechat', label: '微信号', type: 'text', placeholder: '您的微信号' },
      { key: 'wechat_qr', label: '微信二维码图片', type: 'image', placeholder: '上传微信二维码图片' },
      { key: 'email', label: '联系邮箱', type: 'text', placeholder: 'info@example.com' },
    ]
  },
  {
    key: 'footer',
    title: '底部文案',
    fields: [
      { key: 'copyright', label: '版权信息', type: 'text', placeholder: '© 2026 zhaoming. 保留所有权利' },
      { key: 'tagline', label: '宣传语', type: 'text', placeholder: '安全制动，从这里开始' },
    ]
  },
  {
    key: 'hero',
    title: '首页横幅区域',
    fields: [
      { key: 'hero_title', label: '主标题', type: 'text', placeholder: '首页大标题文字' },
      { key: 'hero_subtitle', label: '副标题', type: 'textarea', placeholder: '首页副标题描述' },
      { key: 'hero_btn1_text', label: '按钮1 文字', type: 'text', placeholder: '查看产品' },
      { key: 'hero_btn1_link', label: '按钮1 链接', type: 'text', placeholder: '/products' },
      { key: 'hero_btn2_text', label: '按钮2 文字', type: 'text', placeholder: '获取报价' },
      { key: 'hero_btn2_link', label: '按钮2 链接', type: 'text', placeholder: '#contact' },
      { key: 'hero_bg_image', label: '背景图片', type: 'multi-image', placeholder: '留空则使用渐变背景' },
      { key: 'hero_bg_opacity', label: '背景遮罩透明度（黑色遮罩）', type: 'opacity', placeholder: '40', overlayColor: 'black' },
    ]
  },
  {
    key: 'section_bg',
    title: '各区域背景图片',
    fields: [
      { key: 'bg_advantages', label: '核心优势区域背景', type: 'multi-image', placeholder: '留空则使用默认白色背景' },
      { key: 'bg_advantages_opacity', label: '核心优势遮罩透明度', type: 'opacity', placeholder: '80', overlayColor: 'white' },
      { key: 'bg_categories', label: '产品分类区域背景', type: 'multi-image', placeholder: '留空则使用默认灰色背景' },
      { key: 'bg_categories_opacity', label: '产品分类遮罩透明度', type: 'opacity', placeholder: '80', overlayColor: 'white' },
      { key: 'bg_products', label: '热门产品区域背景', type: 'multi-image', placeholder: '留空则使用默认白色背景' },
      { key: 'bg_products_opacity', label: '热门产品遮罩透明度', type: 'opacity', placeholder: '80', overlayColor: 'white' },
      { key: 'bg_factory', label: '工厂实力区域背景', type: 'multi-image', placeholder: '留空则使用默认灰色背景' },
      { key: 'bg_factory_opacity', label: '工厂实力遮罩透明度', type: 'opacity', placeholder: '80', overlayColor: 'white' },
      { key: 'bg_about', label: '关于我们区域背景', type: 'multi-image', placeholder: '留空则使用默认白色背景' },
      { key: 'bg_about_opacity', label: '关于我们遮罩透明度', type: 'opacity', placeholder: '80', overlayColor: 'white' },
    ]
  },
  {
    key: 'faq_page',
    title: 'FAQ 常见问题页面',
    fields: [
      { key: 'faq_title', label: '页面标题', type: 'text', placeholder: '常见问题解答 / FAQ' },
      { key: 'faq_intro', label: '页面简介', type: 'textarea', placeholder: '页面标题下方显示的介绍文字' },
      { key: 'faq_items', label: '问答列表', type: 'faq-editor', placeholder: '点击下方按钮添加问答' },
    ]
  },
  {
    key: 'about_page',
    title: 'About Us 关于我们页面',
    fields: [
      { key: 'about_subtitle', label: '副标题', type: 'text', placeholder: '如：Trusted Brake Pad Manufacturer Since 2004' },
      { key: 'about_title', label: '页面标题', type: 'text', placeholder: '如：关于我们 / About Us' },
      { key: 'about_content', label: '页面内容（段落间用空行分隔）', type: 'textarea', placeholder: '输入公司介绍内容，200-300字含关键词（OEM brake pads, E-Mark certified 等）。段落之间留空行。' },
      { key: 'about_images', label: '工厂/团队照片（最多4张）', type: 'multi-image', placeholder: '上传工厂、生产线、团队等照片' },
    ]
  }
];

export default function AdminSettingsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const toast = useToast();

  const [activeLang, setActiveLang] = useState('zh');
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [uploadingKey, setUploadingKey] = useState<string>('');

  useEffect(() => {
    Promise.all(
      LANGUAGES.map(l =>
        fetch(`/api/settings?lang=${l.code}`)
          .then(res => res.json())
          .then(data => ({ lang: l.code, config: data.config || {} }))
      )
    ).then(results => {
      const map: Record<string, Record<string, string>> = {};
      results.forEach(r => { map[r.lang] = r.config; });
      setConfigs(map);
    });
  }, []);

  const currentConfig = configs[activeLang] || {};

  const updateField = (key: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [activeLang]: { ...(prev[activeLang] || {}), [key]: value },
    }));
    setSaveStatus('');
  };

  // 多图字段：逗号分隔的URL转数组
  const getMultiImages = (key: string): string[] => {
    const val = currentConfig[key] || '';
    return val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
  };

  const updateMultiImage = (key: string, images: string[]) => {
    updateField(key, images.join(','));
  };

  const addMultiImage = (key: string, url: string) => {
    const images = getMultiImages(key);
    if (url && !images.includes(url)) {
      images.push(url);
      updateMultiImage(key, images);
    }
  };

  const removeMultiImage = (key: string, idx: number) => {
    const images = getMultiImages(key);
    images.splice(idx, 1);
    updateMultiImage(key, images);
  };

  // 根据透明度字段key获取关联的背景图片URL（取第一张）
  const getAssociatedImage = (opacityKey: string): string => {
    const imageKey = opacityKey === 'hero_bg_opacity' ? 'hero_bg_image' : opacityKey.replace('_opacity', '');
    const images = getMultiImages(imageKey);
    return images[0] || '';
  };

  // 字段 key → 语义化文件名映射（用于图片上传时自动生成 SEO 友好的文件名）
  const FIELD_NAME_MAP: Record<string, string> = {
    logo: 'company-logo',
    wechat_qr: 'wechat-qr-code',
    hero_bg_image: 'hero-banner',
    bg_advantages: 'advantages-section-bg',
    bg_categories: 'categories-section-bg',
    bg_products: 'products-section-bg',
    bg_factory: 'factory-section-bg',
    bg_about: 'about-section-bg',
    about_images: 'factory-photo',
  };
  const getSemanticName = (key: string): string => FIELD_NAME_MAP[key] || key.replace(/_/g, '-');

  const handleUpload = async (key: string, file: File, isMulti: boolean = false) => {
    setUploadingKey(key);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // 传入语义化名称，后端会生成如 company-logo-a1b2c3.jpg 的文件名
      formData.append('customName', getSemanticName(key));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        if (isMulti) {
          addMultiImage(key, data.url);
        } else {
          updateField(key, data.url);
        }
        toast('success', '图片上传成功');
      } else {
        toast('error', `上传失败：${data.error || '未知错误'}`);
      }
    } catch (e: any) {
      toast('error', `上传失败：${e.message || '网络错误'}`);
    } finally {
      setUploadingKey('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: activeLang, configs: currentConfig }),
      });
      if (res.ok) {
        setSaveStatus('success');
        toast('success', '设置保存成功！');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
        toast('error', '设置保存失败，请重试');
      }
    } catch {
      setSaveStatus('error');
      toast('error', '设置保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      for (const lang of LANGUAGES) {
        const config = configs[lang.code];
        if (config && Object.keys(config).length > 0) {
          await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lang: lang.code, configs: config }),
          });
        }
      }
      setSaveStatus('success');
      toast('success', '设置保存成功！');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
      toast('error', '设置保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">站点设置</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 border border-primary-500 text-primary-600 rounded-md text-sm hover:bg-primary-50 disabled:opacity-50"
          >
            保存所有语言
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">语言版本</h2>
            <div className="flex gap-1">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => setActiveLang(l.code)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center space-x-1.5 ${
                    activeLang === l.code
                      ? 'bg-primary-500 text-white shadow-sm font-medium'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            每个语言版本拥有独立配置，修改仅影响当前选中的语言。
          </p>
        </div>

        {CONFIG_SECTIONS.map(section => (
          <div key={section.key} className="border-b border-gray-100 last:border-b-0">
            <div className="px-6 py-4 bg-gray-50/50">
              <h3 className="font-semibold text-gray-700">{section.title}</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {section.fields.map(field => {
                const isMulti = field.type === 'multi-image';
                const multiImages = isMulti ? getMultiImages(field.key) : [];

                return (
                <div key={field.key}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {field.label}
                    <span className="text-xs text-gray-400 ml-1">({activeLang})</span>
                    {isMulti && <span className="text-xs text-blue-500 ml-1">（最多3张，可轮播切换）</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={currentConfig[field.key] || ''}
                      onChange={e => updateField(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      placeholder={field.placeholder}
                    />
                  ) : isMulti ? (
                    <div className="space-y-3">
                      {/* 已上传图片列表 */}
                      {multiImages.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                          {multiImages.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img}
                                alt={`${field.label} ${idx + 1}`}
                                className="h-24 w-32 object-cover rounded-md border border-gray-200"
                              />
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 rounded">
                                {idx + 1}
                              </span>
                              <button
                                onClick={() => removeMultiImage(field.key, idx)}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* 上传按钮（还有空位时显示） */}
                      {multiImages.length < 3 && (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="输入图片URL或上传"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val) { addMultiImage(field.key, val); (e.target as HTMLInputElement).value = ''; }
                              }
                            }}
                          />
                          <label
                            className={`px-3 py-2 bg-primary-500 text-white rounded-md text-sm cursor-pointer hover:bg-primary-600 whitespace-nowrap transition-colors ${uploadingKey === field.key ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            {uploadingKey === field.key ? '上传中...' : `上传第${multiImages.length + 1}张`}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(field.key, file, true);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : field.type === 'image' ? (
                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={currentConfig[field.key] || ''}
                        onChange={e => updateField(field.key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder={field.placeholder}
                      />
                      <label
                        className={`px-3 py-2 bg-primary-500 text-white rounded-md text-sm cursor-pointer hover:bg-primary-600 whitespace-nowrap transition-colors ${uploadingKey === field.key ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {uploadingKey === field.key ? '上传中...' : '上传图片'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(field.key, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  ) : field.type === 'opacity' ? (
                    <OpacityControl
                      field={field}
                      value={currentConfig[field.key] || ''}
                      onChange={v => updateField(field.key, v)}
                      associatedImage={getAssociatedImage(field.key)}
                    />
                  ) : field.type === 'faq-editor' ? (
                    <FaqEditor
                      value={currentConfig[field.key] || ''}
                      onChange={v => updateField(field.key, v)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentConfig[field.key] || ''}
                      onChange={e => updateField(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder={field.placeholder}
                    />
                  )}
                  {/* 单图预览 */}
                  {field.type === 'image' && currentConfig[field.key] && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={currentConfig[field.key]}
                        alt={field.label}
                        className="h-24 rounded-md border border-gray-200 object-cover"
                      />
                      <button
                        onClick={() => updateField(field.key, '')}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-400">
            正在编辑：{LANGUAGES.find(l => l.code === activeLang)?.flag} {LANGUAGES.find(l => l.code === activeLang)?.label}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
          >
            {saving ? '保存中...' : `保存 (${activeLang.toUpperCase()})`}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">📌 访问路径</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>前台入口：</strong>点击页面右上角"登录"按钮 → 输入账号密码 → 进入管理后台</p>
          <p><strong>直接访问：</strong>/{locale}/admin/login（用户名: admin，密码: admin123）</p>
          <p><strong>操作流程：</strong>登录 → 仪表板 → 站点设置（共3次点击）</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 透明度调节控件：滑块 + 实时预览
 */
function OpacityControl({
  field,
  value,
  onChange,
  associatedImage,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  associatedImage: string;
}) {
  // 解析当前透明度值，空值时使用placeholder作为默认值
  const defaultVal = parseInt(field.placeholder || '80', 10);
  const currentVal = value ? parseInt(value, 10) : defaultVal;
  const opacity = Number.isFinite(currentVal) && currentVal >= 0 && currentVal <= 100 ? currentVal : defaultVal;
  const overlayColor = field.overlayColor || 'white';
  const overlayRgba = overlayColor === 'black'
    ? `rgba(0, 0, 0, ${(opacity / 100).toFixed(2)})`
    : `rgba(255, 255, 255, ${(opacity / 100).toFixed(2)})`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={opacity}
          onChange={e => onChange(e.target.value)}
          className="flex-1 accent-primary-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-700 w-12 text-right">{opacity}%</span>
        <button
          onClick={() => onChange(String(defaultVal))}
          className="text-xs text-gray-400 hover:text-primary-600 px-2 py-1 border border-gray-200 rounded"
        >
          重置
        </button>
      </div>
      <p className="text-xs text-gray-400">
        数值越大，遮罩越浓（{overlayColor === 'black' ? '黑色' : '白色'}遮罩）。当前默认值：{defaultVal}%
      </p>

      {/* 实时预览 */}
      <div className="relative h-28 rounded-lg overflow-hidden border border-gray-200">
        {associatedImage ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${associatedImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-200 via-gray-200 to-secondary-200 flex items-center justify-center">
            <span className="text-xs text-gray-400">暂无背景图，使用渐变预览</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: overlayRgba }}
        >
          <span className={`text-sm font-medium ${overlayColor === 'black' ? 'text-white' : 'text-gray-800'}`}>
            遮罩预览 {opacity}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * FAQ 编辑器：动态添加/删除问答对，数据以 JSON 存储
 */
function FaqEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  let items: { q: string; a: string }[] = [];
  try {
    if (value) {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) items = parsed;
    }
  } catch {
    // 解析失败，使用空数组
  }

  const update = (newItems: { q: string; a: string }[]) => {
    onChange(newItems.length > 0 ? JSON.stringify(newItems) : '');
  };

  const addItem = () => {
    update([...items, { q: '', a: '' }]);
  };

  const removeItem = (idx: number) => {
    update(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: 'q' | 'a', val: string) => {
    update(items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const moveItem = (idx: number, dir: 'up' | 'down') => {
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const newItems = [...items];
    [newItems[idx], newItems[newIdx]] = [newItems[newIdx], newItems[idx]];
    update(newItems);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
          暂无问答，点击下方按钮添加。留空则使用系统默认 FAQ 内容。
        </div>
      )}
      {items.map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">问答 #{idx + 1}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveItem(idx, 'up')}
                disabled={idx === 0}
                className="w-6 h-6 text-gray-400 hover:text-primary-600 disabled:opacity-30 text-xs border border-gray-200 rounded"
                title="上移"
              >↑</button>
              <button
                type="button"
                onClick={() => moveItem(idx, 'down')}
                disabled={idx === items.length - 1}
                className="w-6 h-6 text-gray-400 hover:text-primary-600 disabled:opacity-30 text-xs border border-gray-200 rounded"
                title="下移"
              >↓</button>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="w-6 h-6 text-red-400 hover:text-red-600 text-xs border border-red-200 rounded"
                title="删除"
              >✕</button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">问题 (Q)</label>
            <input
              type="text"
              value={item.q}
              onChange={e => updateItem(idx, 'q', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="输入问题"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">答案 (A)</label>
            <textarea
              value={item.a}
              onChange={e => updateItem(idx, 'a', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="输入答案"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 border-2 border-dashed border-primary-300 text-primary-600 rounded-lg text-sm hover:bg-primary-50 transition-colors"
      >
        + 添加问答
      </button>
      {items.length > 0 && (
        <p className="text-xs text-gray-400">
          共 {items.length} 条问答。保存后前台 FAQ 页面将显示这些内容（替代默认内容）。
        </p>
      )}
    </div>
  );
}

