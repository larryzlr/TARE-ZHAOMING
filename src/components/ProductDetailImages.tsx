'use client';

import { useState, useEffect, useCallback } from 'react';

interface ProductDetailImagesProps {
  images: string[];
  title?: string;
}

export default function ProductDetailImages({ images, title }: ProductDetailImagesProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => {
    setActiveIndex(prev => (prev === null ? null : (prev - 1 + images.length) % images.length));
  }, [images.length]);
  const next = useCallback(() => {
    setActiveIndex(prev => (prev === null ? null : (prev + 1) % images.length));
  }, [images.length]);

  // 键盘控制：ESC 关闭，← → 切换
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    // 锁定滚动
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeIndex, close, prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="space-y-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="block w-full group relative cursor-zoom-in"
            aria-label={`查看原图 ${i + 1}`}
          >
            <img
              src={img}
              alt={`${title || '产品详情'} - 图片 ${i + 1}`}
              className="w-full h-auto object-contain rounded-lg border border-gray-100 bg-white transition group-hover:border-primary-300 group-hover:shadow-md"
            />
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              点击放大
            </span>
          </button>
        ))}
      </div>

      {/* 放大查看弹窗 */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          {/* 顶部关闭按钮 */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl transition"
            aria-label="关闭"
          >
            ✕
          </button>

          {/* 上一张 */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl transition"
              aria-label="上一张"
            >
              ‹
            </button>
          )}

          {/* 图片 */}
          <img
            src={images[activeIndex]}
            alt={`${title || '产品详情'} - 原图 ${activeIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg"
          />

          {/* 下一张 */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl transition"
              aria-label="下一张"
            >
              ›
            </button>
          )}

          {/* 计数器 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
