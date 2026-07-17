'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';

// 动态加载 react-quill，避免 SSR 报错
const Quill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded" />,
});

// 引入 quill 的样式
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // 自定义图片上传处理
  const imageHandler = useMemo(() => {
    return function imageHandler(this: any) {
      const quill = this.quill;
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/jpeg,image/png,image/webp,image/gif');
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        // 大小限制 8MB
        if (file.size > 8 * 1024 * 1024) {
          alert('图片大小不能超过 8MB');
          return;
        }

        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.error || '图片上传失败');
            return;
          }

          const data = await res.json();
          const imageUrl = data.url;
          setUploadedImages(prev => [...prev, imageUrl]);

          // 插入到编辑器光标位置
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', imageUrl, 'user');
          quill.setSelection(range.index + 1, 0);
        } catch (e) {
          alert('上传失败，请重试');
        }
      };
    };
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }, { list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align', 'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image',
  ];

  return (
    <div className="rich-text-editor">
      <Quill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || '在此输入产品详情内容...'}
        style={{ minHeight: '300px' }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #d1d5db;
          background: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #d1d5db;
          min-height: 300px;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor {
          min-height: 300px;
          max-height: 600px;
          overflow-y: auto;
        }
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3 {
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .rich-text-editor .ql-editor p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
