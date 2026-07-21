// src/app/opengraph-image.tsx
// 动态生成 OG 图片（1200x630px）用于社交媒体分享
// Next.js 会自动将此图片添加到所有页面的 og:image meta 标签

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Z-MING Brake - Professional Brake Pad Manufacturer | OEM & E-Mark Certified';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #dc2626 50%, #1a1a1a 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo 区域 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 24,
              fontSize: 48,
              fontWeight: 'bold',
              color: '#dc2626',
            }}
          >
            ZM
          </div>
          <div style={{ fontSize: 56, fontWeight: 'bold', letterSpacing: 2 }}>Z-MING</div>
        </div>

        {/* 主标题 */}
        <div style={{ fontSize: 42, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
          Professional Brake Pad Manufacturer
        </div>

        {/* 副标题 */}
        <div style={{ fontSize: 28, color: '#fca5a5', marginBottom: 32 }}>
          OEM · ODM · E-Mark Certified
        </div>

        {/* 认证标签 */}
        <div style={{ display: 'flex', gap: 20, fontSize: 20 }}>
          <div style={{ padding: '8px 24px', borderRadius: 30, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            IATF 16949
          </div>
          <div style={{ padding: '8px 24px', borderRadius: 30, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            E-Mark ECE R90
          </div>
          <div style={{ padding: '8px 24px', borderRadius: 30, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            20+ Years
          </div>
          <div style={{ padding: '8px 24px', borderRadius: 30, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            50+ Countries
          </div>
        </div>

        {/* 底部信息 */}
        <div style={{ position: 'absolute', bottom: 40, fontSize: 22, color: 'rgba(255,255,255,0.7)' }}>
          www.z-ming.com
        </div>
      </div>
    ),
    { ...size }
  );
}
