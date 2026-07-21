'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface DashboardImageUploaderProps {
  /** 语义化文件名前缀，用于生成 SEO 友好的文件名（如 "brake-pad-product"） */
  customName?: string;
}

export default function DashboardImageUploader({ customName = 'brake-pad-image' }: DashboardImageUploaderProps = {}) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [urlInputs, setUrlInputs] = useState<string[]>(['', '', '']);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 8 * 1024 * 1024; // 8MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 校验文件
    const validFiles: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast('error', `${file.name} 格式不支持，仅支持 JPG/PNG/WebP/GIF/SVG`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast('error', `${file.name} 超过 8MB 限制`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: validFiles.length });
    const newUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      setProgress({ current: i, total: validFiles.length });
      try {
        const formData = new FormData();
        formData.append('file', validFiles[i]);
        // 语义化文件名，生成如 brake-pad-image-a1b2c3.jpg
        formData.append('customName', customName);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
        } else {
          toast('error', `${validFiles[i].name}: ${data.error || '上传失败'}`);
        }
      } catch {
        toast('error', `${validFiles[i].name}: 网络错误`);
      }
    }

    setProgress({ current: validFiles.length, total: validFiles.length });
    if (newUrls.length > 0) {
      setUploadedUrls(prev => [...newUrls, ...prev]);
      toast('success', `上传成功 ${newUrls.length} 张${validFiles.length > newUrls.length ? `，失败 ${validFiles.length - newUrls.length} 张` : ''}`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [toast, customName]);

  const handleCopy = useCallback(async (url: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      toast('error', '复制失败');
    }
  }, [toast]);

  const addUrlInput = () => {
    setUrlInputs(prev => [...prev, '']);
  };

  const updateUrlInput = (idx: number, value: string) => {
    setUrlInputs(prev => prev.map((u, i) => (i === idx ? value : u)));
  };

  const removeUrlInput = (idx: number) => {
    setUrlInputs(prev => prev.filter((_, i) => i !== idx));
  };

  const addUrlToUploaded = (idx: number) => {
    const url = urlInputs[idx].trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast('error', 'URL 必须以 http:// 或 https:// 开头');
      return;
    }
    setUploadedUrls(prev => [url, ...prev]);
    updateUrlInput(idx, '');
    toast('success', 'URL 已添加到列表');
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0 && fileInputRef.current) {
            const dt = new DataTransfer();
            files.forEach(f => dt.items.add(f));
            fileInputRef.current.files = dt.files;
            fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary-600">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="font-medium">上传中... {progress.current}/{progress.total}</span>
            </div>
            <div className="w-full max-w-xs mx-auto bg-primary-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-500 h-full transition-all"
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="font-medium text-primary-600">点击或拖拽图片到此处上传</p>
            <p className="text-xs text-gray-400 mt-1">支持多选 · JPG/PNG/WebP/GIF/SVG · 单张最大 8MB</p>
          </>
        )}
      </div>

      {/* 多URL输入区 */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">通过URL添加</p>
          <button
            onClick={addUrlInput}
            className="text-xs text-primary-500 hover:text-primary-700"
          >
            + 添加更多
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">直接输入图片URL，例如：https://example.com/images/product1.jpg</p>
        <div className="space-y-2">
          {urlInputs.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={e => updateUrlInput(idx, e.target.value)}
                placeholder="https://example.com/images/product.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => addUrlToUploaded(idx)}
                disabled={!url.trim()}
                className="px-3 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50"
              >
                添加
              </button>
              {urlInputs.length > 1 && (
                <button
                  onClick={() => removeUrlInput(idx)}
                  className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 已上传图片列表 */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">已上传图片 ({uploadedUrls.length})</p>
          {uploadedUrls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3">
              <img
                src={url}
                alt=""
                className="w-14 h-14 object-contain rounded border border-gray-100 bg-gray-50 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <code className="block text-xs text-gray-600 truncate" title={url}>{url}</code>
              </div>
              <button
                onClick={() => handleCopy(url, idx)}
                className={`px-3 py-1.5 text-xs rounded-md transition shrink-0 ${
                  copiedIdx === idx
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copiedIdx === idx ? '已复制 ✓' : '复制URL'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
