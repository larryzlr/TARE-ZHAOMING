'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

type JsonError = { message: string; line?: number } | null;

function validateJson(text: string): JsonError {
  if (!text.trim()) return { message: '内容为空' };
  try {
    JSON.parse(text);
    return null;
  } catch (e: any) {
    const msg = e.message || 'JSON 解析错误';
    const lineMatch = msg.match(/position (\d+)/);
    let line: number | undefined;
    if (lineMatch) {
      const pos = parseInt(lineMatch[1], 10);
      line = text.substring(0, pos).split('\n').length;
    }
    return { message: msg, line };
  }
}

export default function TranslationsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const [activeLang, setActiveLang] = useState('zh');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [showTemplate, setShowTemplate] = useState(false);
  const [loading, setLoading] = useState(true);

  const jsonError = useMemo(() => (isEditing ? validateJson(content) : null), [content, isEditing]);
  const hasChanges = content !== originalContent;
  const canSave = hasChanges && !jsonError && isEditing;

  const loadTranslations = useCallback((lang: string) => {
    setLoading(true);
    fetch(`/api/translations?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        const jsonText = data.content ? JSON.stringify(JSON.parse(data.content), null, 2) : '';
        setContent(jsonText);
        setOriginalContent(jsonText);
      })
      .catch(() => {
        setContent('');
        setOriginalContent('');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTranslations(activeLang);
    setIsEditing(false);
    setSaveStatus('');
  }, [activeLang, loadTranslations]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveStatus('');
  };

  const handleCancel = () => {
    setContent(originalContent);
    setIsEditing(false);
    setSaveStatus('');
  };

  const handleFormat = () => {
    if (jsonError) return;
    setContent(JSON.stringify(JSON.parse(content), null, 2));
  };

  const handleSave = async () => {
    if (jsonError || !hasChanges) return;
    let compactContent = '';
    try {
      compactContent = JSON.stringify(JSON.parse(content));
    } catch {
      return;
    }

    setSaving(true);
    setSaveStatus('');
    try {
      const res = await fetch('/api/translations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: activeLang, content: compactContent }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const formatted = JSON.stringify(JSON.parse(content), null, 2);
        setContent(formatted);
        setOriginalContent(formatted);
        setIsEditing(false);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
        alert(`保存失败：${data.error || '未知错误'}。文案未保存。`);
      }
    } catch (e: any) {
      setSaveStatus('error');
      alert(`网络错误：${e.message || '请求失败'}。文案未保存。`);
    } finally {
      setSaving(false);
    }
  };

  const currentLangInfo = LANGUAGES.find(l => l.code === activeLang);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">文案管理</h1>
          <p className="text-sm text-gray-500 mt-1">以 JSON 格式管理各语言版本的全部页面文案</p>
        </div>
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <span className="text-green-600 text-sm font-medium">✓ 保存成功！前台已刷新生效</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 text-sm font-medium">✗ 保存失败</span>
          )}
          <button
            onClick={() => setShowTemplate(v => !v)}
            className="px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md text-sm hover:bg-blue-100"
          >
            {showTemplate ? '收起模板' : '查看模板参考'}
          </button>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              disabled={loading || !content}
              className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '编辑文案'}
            </button>
          ) : (
            <>
              <button
                onClick={handleFormat}
                disabled={!!jsonError}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40"
              >
                格式化 JSON
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !canSave}
                className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存文案'}
              </button>
            </>
          )}
        </div>
      </div>

      {showTemplate && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">📋 文案模板格式规范与填写说明</h3>
          <div className="text-xs text-blue-700 space-y-3 leading-relaxed">
            <div>
              <p className="font-medium mb-1">【整体结构】</p>
              <p>JSON 顶层包含 5 个命名空间对象，<strong>key（英文）不可修改</strong>，只修改 value（对应语言的文案）：</p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li><code>IndexPage</code> — 首页所有文案（标题、优势、询盘表单等）</li>
                <li><code>ProductPage</code> — 产品列表页和详情页文案</li>
                <li><code>ContactPage</code> — 联系信息相关文案</li>
                <li><code>Common</code> — 通用文案（导航、页脚、按钮等）</li>
                <li><code>Admin</code> — 后台管理界面文案</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">【格式规范】</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>必须为合法 JSON：双引号包裹 key 和 value，最后一项无尾逗号</li>
                <li>value 必须为字符串类型，不可用数字或布尔值</li>
                <li>value 中如需引号，使用转义 <code>\"</code>；换行使用 <code>\n</code></li>
                <li>保存前自动校验 JSON，<strong>格式错误时保存按钮禁用，不会生效</strong></li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">【询盘表单相关 key】（IndexPage 命名空间下）</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li><code>inquiryName</code> / <code>inquiryEmail</code> — 姓名、邮箱标签（<strong>必填字段</strong>）</li>
                <li><code>inquiryPhone</code> / <code>inquiryWhatsapp</code> — 电话、WhatsApp 标签（选填字段）</li>
                <li><code>inquiryProduct</code> / <code>inquiryMessage</code> — 产品、留言标签（选填字段）</li>
                <li><code>inquiryNamePlaceholder</code> 等 <code>*Placeholder</code> — 输入框占位提示</li>
                <li><code>inquiryNameRequired</code> / <code>inquiryEmailRequired</code> / <code>inquiryEmailInvalid</code> — 校验提示</li>
                <li><code>inquirySuccess</code> / <code>inquiryFailed</code> — 提交成功/失败提示</li>
                <li><code>inquiryRequiredTip</code> — 必填项说明（表单底部）</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">【操作流程】</p>
              <ol className="list-decimal pl-5 space-y-0.5">
                <li>选择目标语言标签</li>
                <li>点击「编辑文案」进入可编辑状态</li>
                <li>修改对应 key 的 value 值</li>
                <li>点击「格式化 JSON」检查格式是否正确（错误时按钮变灰）</li>
                <li>点击「保存文案」，JSON 校验通过后即时生效，前台自动刷新</li>
                <li>如需放弃修改，点击「取消」恢复原始内容</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">选择语言</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isEditing
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {isEditing ? '✏️ 编辑模式' : '🔒 只读模式'}
            </span>
          </div>
          <div className="flex gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setActiveLang(l.code)}
                disabled={isEditing && hasChanges}
                className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center space-x-1.5 ${
                  activeLang === l.code
                    ? 'bg-primary-500 text-white shadow-sm font-medium'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                } ${isEditing && hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isEditing && hasChanges ? '请先保存或取消当前编辑' : ''}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            当前{isEditing ? '编辑' : '查看'}：{currentLangInfo?.flag} {currentLangInfo?.label}
            {isEditing
              ? '。修改保存后所有页面将即时生效。'
              : '。点击「编辑文案」进入修改模式。'}
            {isEditing && hasChanges && <span className="text-amber-600 ml-1">（有未保存的修改，请先保存或取消再切换语言）</span>}
          </p>
        </div>

        <div className="p-6">
          {isEditing && jsonError ? (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <strong>JSON 格式错误，保存不会生效：</strong> {jsonError.message}
              {jsonError.line && <span className="ml-2">（约第 {jsonError.line} 行附近）</span>}
            </div>
          ) : isEditing ? (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              ✓ JSON 格式正确{hasChanges ? '，可以保存' : '（内容未修改）'}
            </div>
          ) : (
            <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
              ℹ️ 当前为只读模式，显示数据库中正在使用的文案。点击右上角「编辑文案」进入修改。
            </div>
          )}
          <label className="block text-sm text-gray-600 mb-2">
            JSON 文案
            <span className="text-xs text-gray-400 ml-1">({activeLang})</span>
            {loading && <span className="text-xs text-gray-400 ml-2">加载中...</span>}
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            readOnly={!isEditing}
            disabled={!isEditing || saving}
            className={`w-full h-[600px] px-4 py-3 border rounded-md text-sm font-mono leading-relaxed transition-colors ${
              isEditing
                ? jsonError
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-blue-300 bg-white'
                : 'border-gray-200 bg-gray-50 text-gray-700 cursor-default'
            }`}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">📌 使用说明</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
          <li>默认进入只读模式，显示数据库中正在使用的最新文案</li>
          <li>点击「编辑文案」进入编辑模式，修改后点击「保存文案」即时生效</li>
          <li>保存后自动切回只读模式，前台页面刷新后即可看到新文案</li>
          <li>点击「取消」可放弃修改，恢复到最近一次保存的内容</li>
          <li>文案包含5个命名空间：IndexPage、ProductPage、ContactPage、Common、Admin</li>
          <li>保存前系统自动校验 JSON 格式，<strong>格式错误时保存不生效</strong></li>
          <li>询盘表单中姓名、邮箱为必填，电话/WhatsApp/产品/留言为选填</li>
          <li>提交的询盘可在「询盘管理」页面查看</li>
        </ul>
      </div>
    </div>
  );
}
