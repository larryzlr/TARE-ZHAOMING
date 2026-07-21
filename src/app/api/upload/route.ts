import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

/**
 * 将任意字符串转换为 SEO 友好的 slug（小写、连字符、仅保留拉丁字母数字）
 * 非拉丁字符（如中文）会被移除，结果为空时返回 null
 */
function slugify(input: string): string | null {
  const slug = input
    .toLowerCase()
    .trim()
    // 去除文件扩展名
    .replace(/\.[a-z0-9]+$/i, '')
    // 连续非字母数字字符（含中文、空格、下划线）替换为连字符
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || null;
}

/**
 * 生成语义化文件名
 * 优先级：
 * 1. 显式传入的 customName（slugify）
 * 2. 原始文件名含拉丁字母（slugify，如 oem-brake-pads-factory.jpg → oem-brake-pads-factory）
 * 3. 回退到 image
 * 末尾追加 6 位短随机串保证唯一，避免覆盖
 */
function buildSemanticFileName(rawName: string | null, originalFileName: string, ext: string): string {
  const base =
    (rawName ? slugify(rawName) : null) ||
    slugify(originalFileName) ||
    'image';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    // 可选：前端传入的语义化名称（如 "oem-brake-pads-factory"）
    const customName = (formData.get('customName') as string | null) || '';

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
    // 生成语义化文件名（取代旧的 Date.now()-random 格式）
    const fileName = buildSemanticFileName(customName || null, file.name, ext);

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
