'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/Toast';

interface BatchProductUploadProps {
  locale: string;
  onClose: () => void;
  onComplete: () => void;
}

interface ProductRow {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  status: string;
}

export default function BatchProductUpload({ locale, onClose, onComplete }: BatchProductUploadProps) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, fail: 0 });
  const [failures, setFailures] = useState<string[]>([]);
  const [showFailures, setShowFailures] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseInput = (input: string): ProductRow[] => {
    const lines = input.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
    return lines.map(line => {
      // 支持 CSV 和制表符分隔
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      return {
        slug: (parts[0] || '').trim(),
        title: (parts[1] || '').trim(),
        description: (parts[2] || '').trim(),
        imageUrl: (parts[3] || '').trim(),
        category: (parts[4] || '').trim() || 'uncategorized',
        status: (parts[5] || 'draft').trim().toLowerCase() === 'published' ? 'published' : 'draft',
      };
    }).filter(r => r.slug && r.title);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setText(ev.target?.result as string);
      toast('success', `已加载文件 ${file.name}`);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `# 产品批量上传模板
# 格式: slug,标题,描述,图片URL,分类,状态
# 状态: draft(草稿) 或 published(已发布)
# 图片URL示例: https://example.com/images/product1.jpg
# 分类留空则默认为 uncategorized
#
# 示例:
ceramic-pads-rs100,陶瓷刹车片RS100,高性能陶瓷配方刹车片,https://example.com/img1.jpg,ceramic-pads,published
semi-metallic-rs200,半金属刹车片RS200,耐用型半金属配方,https://example.com/img2.jpg,semi-metallic,draft`;
    const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '批量上传模板.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    const rows = parseInput(text);
    if (rows.length === 0) {
      toast('error', '没有有效的数据行，请检查格式');
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: rows.length, success: 0, fail: 0 });
    setFailures([]);
    setShowFailures(false);

    let success = 0;
    let fail = 0;
    const failDetails: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setProgress({ current: i + 1, total: rows.length, success, fail });

      try {
        const translations = ['en', 'zh', 'ru', 'fr', 'es'].map(lang => ({
          lang,
          title: row.title,
          description: row.description,
          specs: [],
          detailContent: '',
        }));

        const images = row.imageUrl ? [row.imageUrl] : [];
        const categories = row.category && row.category !== 'uncategorized' ? [row.category] : [];

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: row.slug,
            category: categories[0] || 'uncategorized',
            categories,
            images,
            status: row.status,
            sortOrder: 0,
            translations,
          }),
        });

        if (res.ok) {
          success++;
        } else {
          const err = await res.json().catch(() => ({}));
          fail++;
          failDetails.push(`第${i + 1}行 [${row.slug}]: ${err.error || '创建失败'}`);
        }
      } catch (e) {
        fail++;
        failDetails.push(`第${i + 1}行 [${row.slug}]: 网络错误`);
      }

      setProgress({ current: i + 1, total: rows.length, success, fail });
    }

    setFailures(failDetails);
    setUploading(false);

    if (fail > 0) {
      toast('error', `上传成功 ${success} 条，失败 ${fail} 条`);
    } else {
      toast('success', `上传成功 ${success} 条`);
    }

    if (success > 0) {
      onComplete();
    }
  };

  const previewRows = parseInput(text);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => !uploading && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">批量上传产品</h2>
          <button onClick={() => !uploading && onClose()} className="text-gray-400 hover:text-gray-600 text-xl" disabled={uploading}>×</button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 上传说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 使用说明</h3>
            <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
              <li>每行一个产品，格式：<code className="bg-blue-100 px-1 rounded">slug, 标题, 描述, 图片URL, 分类, 状态</code></li>
              <li>图片URL示例：<code className="bg-blue-100 px-1 rounded">https://example.com/images/product1.jpg</code></li>
              <li>分类可留空（默认 uncategorized），状态为 draft 或 published</li>
              <li>多语言内容会自动用相同标题和描述填充，可后续在编辑页修改各语言版本</li>
              <li>支持上传 .txt/.csv 文件，或直接在下方文本框粘贴数据</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              ↓ 下载模板文件
            </button>
          </div>

          {/* 文件上传 */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              📁 选择文件
            </button>
            <span className="text-xs text-gray-400 self-center">支持 .txt / .csv 格式</span>
          </div>

          {/* 数据输入区 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              数据内容 {previewRows.length > 0 && <span className="text-gray-400 text-xs">（已解析 {previewRows.length} 条有效数据）</span>}
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={uploading}
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
              placeholder={`slug,标题,描述,图片URL,分类,状态\nceramic-pads-rs100,陶瓷刹车片RS100,高性能陶瓷配方,https://example.com/img1.jpg,ceramic-pads,published`}
            />
          </div>

          {/* 图片URL格式说明 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium mb-1">图片URL格式要求：</p>
            <p className="text-xs text-gray-500">必须为完整的HTTP/HTTPS链接，例如：<code className="bg-gray-200 px-1 rounded">https://st9eqniwoed218yl.public.blob.vercel-storage.com/uploads/xxx.jpg</code></p>
          </div>

          {/* 上传进度 */}
          {uploading && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-700">上传中，请等待...</span>
                <span className="text-sm text-primary-600">{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-primary-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-500 h-full transition-all"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-green-600">成功 {progress.success}</span>
                <span className="text-red-600">失败 {progress.fail}</span>
              </div>
            </div>
          )}

          {/* 结果展示 */}
          {!uploading && progress.total > 0 && (
            <div className={`border rounded-lg p-4 ${progress.fail > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-sm font-medium ${progress.fail > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                {progress.fail > 0
                  ? `上传成功 ${progress.success} 条，失败 ${progress.fail} 条`
                  : `上传成功 ${progress.success} 条`
                }
              </p>
              {failures.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowFailures(v => !v)}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    {showFailures ? '隐藏' : '查看'}失败详情 ({failures.length})
                  </button>
                  {showFailures && (
                    <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-orange-200 rounded p-2 space-y-1">
                      {failures.map((f, i) => (
                        <p key={i} className="text-xs text-red-600">{f}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {progress.total > 0 && !uploading ? '关闭' : '取消'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || previewRows.length === 0}
            className="px-6 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
          >
            {uploading ? '上传中...' : `开始上传 (${previewRows.length} 条)`}
          </button>
        </div>
      </div>
    </div>
  );
}
