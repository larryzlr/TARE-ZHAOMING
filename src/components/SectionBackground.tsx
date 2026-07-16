'use client';

import { useState, useEffect } from 'react';

type Props = {
  images: string[];
  children: React.ReactNode;
  /** 遮罩颜色：white 或 black，默认 white */
  overlayColor?: 'white' | 'black';
  /** 遮罩透明度 0-100，默认 80（即 80% 遮罩覆盖） */
  overlayOpacity?: number;
  /** 是否禁用遮罩层 */
  overlay?: boolean;
  className?: string;
  id?: string;
};

export default function SectionBackground({
  images,
  children,
  overlayColor = 'white',
  overlayOpacity = 80,
  overlay = true,
  className = '',
  id
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const hasImages = images.length > 0;

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!hasImages) {
    return <section id={id} className={className}>{children}</section>;
  }

  // 将 0-100 的透明度值转换为 rgba 字符串
  const overlayRgba = overlayColor === 'black'
    ? `rgba(0, 0, 0, ${(overlayOpacity / 100).toFixed(2)})`
    : `rgba(255, 255, 255, ${(overlayOpacity / 100).toFixed(2)})`;

  return (
    <section id={id} className={`relative overflow-hidden ${className}`}>
      {images.map((img, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: idx === currentIdx ? 1 : 0,
          }}
        />
      ))}
      {overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayRgba }}
        ></div>
      )}

      {/* 轮播指示器 */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIdx ? 'w-6 bg-primary-500' : 'w-2 bg-white/60 hover:bg-white/90'
              }`}
              aria-label={`切换到第 ${idx + 1} 张`}
            />
          ))}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </section>
  );
}
