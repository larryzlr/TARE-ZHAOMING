'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const CONFIG_SECTIONS = [
  {
    key: 'basic',
    title: '基本信息',
    fields: [
      { key: 'company_name', label: '公司名称', type: 'text', placeholder: '您的公司名称' },
      { key: 'site_title', label: '浏览器标题 (SEO)', type: 'text', placeholder: '公司名 - 标语' },
      { key: 'site_description', label: '网站描述 (SEO)', type: 'textarea', placeholder: '用于搜索引擎的简要描述' },
      { key: 'whatsapp', label: 'WhatsApp 链接', type: 'text', placeholder: 'https://wa.me/861234567890' },
      { key: 'wechat', label: '微信号', type: 'text', placeholder: '您的微信号' },
      { key: 'logo', label: 'Logo 图片链接', type: 'text', placeholder: '/images/logo.png' },
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
      { key: 'hero_bg_image', label: '背景图片链接', type: 'text', placeholder: '留空则使用渐变背景' },
    ]
  }
];

export default function AdminSettingsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [activeLang, setActiveLang] = useState('zh');
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [saveStatus, setSaveStatus] = useState<string>('');

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
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
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
      setTimeout(() => setSaveStatus(''), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">站点设置</h1>
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <span className="text-green-600 text-sm font-medium">✓ 保存成功！</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 text-sm font-medium">✗ 保存失败</span>
          )}
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
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {field.label}
                    <span className="text-xs text-gray-400 ml-1">({activeLang})</span>
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={currentConfig[field.key] || ''}
                      onChange={e => updateField(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      placeholder={field.placeholder}
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
                  {field.key === 'hero_bg_image' && currentConfig[field.key] && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={currentConfig[field.key]}
                        alt="背景图预览"
                        className="h-24 rounded-md border border-gray-200 object-cover"
                      />
                      <button
                        onClick={() => updateField('hero_bg_image', '')}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
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
