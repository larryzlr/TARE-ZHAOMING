import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPG、PNG、WebP、GIF、SVG 格式的图片' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件大小不能超过 8MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

    // 优先尝试 Vercel Blob（生产环境）
    if (hasBlobToken) {
      try {
        const blob = await put(`uploads/${fileName}`, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false,
        });
        return NextResponse.json({ url: blob.url, fileName: blob.pathname });
      } catch (blobError: any) {
        console.error('Vercel Blob upload failed:', blobError?.message || blobError);
        // Vercel 环境下无法写入本地文件系统，必须返回错误
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          return NextResponse.json({
            error: `图片上传失败: ${blobError?.message || 'Blob存储错误'}`,
          }, { status: 500 });
        }
        // 开发环境继续使用本地存储
      }
    } else if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // 生产环境无 Blob Token，直接报错
      return NextResponse.json({
        error: '服务器未配置 BLOB_READ_WRITE_TOKEN 环境变量',
      }, { status: 500 });
    }

    // 本地文件存储（开发环境 fallback）
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url, fileName });
  } catch (error: any) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({
      error: '上传失败',
      detail: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    }, { status: 500 });
  }
}
