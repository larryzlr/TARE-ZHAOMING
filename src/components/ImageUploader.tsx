'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploaderProps {
  onUpload?: (url: string) => void;
  buttonText?: string;
  showPreview?: boolean;
}

export default function ImageUploader({ onUpload, buttonText = '上传图片', showPreview = true }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setUploadedUrl('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadedUrl(data.url);
        onUpload?.(data.url);
      } else {
        setError(data.error || '上传失败');
      }
    } catch {
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }, [onUpload]);

  const handleCopy = useCallback(async () => {
    if (!uploadedUrl) return;
    try {
      await navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('复制失败');
    }
  }, [uploadedUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && inputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputRef.current.files = dataTransfer.files;
      inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, []);

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-gray-500">
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              上传中...
            </span>
          ) : (
            <>
              <p className="font-medium text-primary-600">{buttonText}</p>
              <p className="text-xs mt-1">点击选择或拖拽图片到此处</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP、GIF、SVG，最大 8MB</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</div>
      )}

      {uploadedUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">上传成功</span>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              {copied ? '已复制 ✓' : '复制 URL'}
            </button>
          </div>
          <code className="block text-xs text-green-700 bg-white p-2 rounded border border-green-200 break-all">
            {uploadedUrl}
          </code>
          {showPreview && (
            <img
              src={uploadedUrl}
              alt="Preview"
              className="h-20 object-contain rounded border border-green-200 bg-white"
            />
          )}
        </div>
      )}
    </div>
  );
}
