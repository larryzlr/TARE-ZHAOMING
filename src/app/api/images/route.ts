import { NextRequest, NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

interface BlobImage {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

// 获取所有被使用的图片URL（用于判断使用状态）
async function getUsedImageUrls(): Promise<Set<string>> {
  const used = new Set<string>();
  try {
    // 产品图片 + 详情图片
    const products = await prisma.product.findMany({ select: { images: true, detailImages: true } });
    products.forEach(p => {
      if (p.images) {
        try { JSON.parse(p.images).forEach((u: string) => used.add(u)); } catch {}
      }
      if (p.detailImages) {
        try { JSON.parse(p.detailImages).forEach((u: string) => used.add(u)); } catch {}
      }
    });

    // 产品翻译中的富文本图片（提取 img src）
    const translations = await prisma.productTranslation.findMany({ select: { detailContent: true } });
    translations.forEach(t => {
      if (t.detailContent) {
        const imgRegex = /<img[^>]+src="([^"]+)"/gi;
        let match;
        while ((match = imgRegex.exec(t.detailContent)) !== null) {
          used.add(match[1]);
        }
      }
    });

    // 分类图标
    const categories = await prisma.category.findMany({ select: { icon: true } });
    categories.forEach(c => { if (c.icon && c.icon.startsWith('http')) used.add(c.icon); });

    // 站点配置中的图片
    const configs = await prisma.siteConfig.findMany({ select: { value: true } });
    configs.forEach(c => {
      if (c.value && c.value.startsWith('http') && /\.(jpg|jpeg|png|webp|gif|svg)/i.test(c.value)) {
        used.add(c.value);
      }
    });
  } catch (e) {
    console.error('Failed to check image usage:', e);
  }
  return used;
}

// GET: 列出所有图片（支持分页、搜索、筛选）
export async function GET(request: NextRequest) {
  try {
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    if (!hasBlobToken) {
      return NextResponse.json({ error: '服务器未配置 BLOB_READ_WRITE_TOKEN' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const usageFilter = searchParams.get('usage') || 'all'; // all | used | unused
    const formatFilter = searchParams.get('format') || 'all'; // all | jpg | png | webp | gif | svg
    const sortBy = searchParams.get('sortBy') || 'date-desc'; // date-desc | date-asc | size-desc | size-asc

    // 从 Vercel Blob 获取所有图片
    const allBlobs: BlobImage[] = [];
    let cursor: string | undefined;
    let hasMore = true;
    // Blob list 每次最多返回 1000 条，分页拉取
    while (hasMore) {
      const result = await list({
        prefix: 'uploads/',
        limit: 1000,
        cursor,
      });
      result.blobs.forEach(b => {
        allBlobs.push({
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
        });
      });
      hasMore = result.hasMore;
      cursor = result.cursor;
      if (!hasMore) break;
    }

    // 获取使用状态
    const usedUrls = await getUsedImageUrls();

    // 格式化并添加使用状态和文件信息
    let images = allBlobs.map(b => {
      const ext = b.pathname.split('.').pop()?.toLowerCase() || '';
      const isUsed = usedUrls.has(b.url);
      return {
        url: b.url,
        pathname: b.pathname,
        filename: b.pathname.split('/').pop() || b.pathname,
        size: b.size,
        sizeFormatted: formatSize(b.size),
        uploadedAt: b.uploadedAt,
        format: ext,
        used: isUsed,
      };
    });

    // 搜索过滤
    if (search) {
      images = images.filter(img =>
        img.filename.toLowerCase().includes(search) ||
        img.pathname.toLowerCase().includes(search)
      );
    }

    // 格式过滤
    if (formatFilter !== 'all') {
      images = images.filter(img => img.format === formatFilter);
    }

    // 使用状态过滤
    if (usageFilter === 'used') {
      images = images.filter(img => img.used);
    } else if (usageFilter === 'unused') {
      images = images.filter(img => !img.used);
    }

    // 排序
    images.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc': return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'size-desc': return b.size - a.size;
        case 'size-asc': return a.size - b.size;
        case 'date-desc':
        default: return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    const total = images.length;
    const usedCount = images.filter(i => i.used).length;

    return NextResponse.json({
      images,
      total,
      usedCount,
      unusedCount: total - usedCount,
    });
  } catch (error: any) {
    console.error('GET /api/images error:', error);
    return NextResponse.json({ error: `获取图片列表失败: ${error?.message || '未知错误'}` }, { status: 500 });
  }
}

// DELETE: 批量删除图片
export async function DELETE(request: NextRequest) {
  try {
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    if (!hasBlobToken) {
      return NextResponse.json({ error: '服务器未配置 BLOB_READ_WRITE_TOKEN' }, { status: 500 });
    }

    const body = await request.json();
    const { urls } = body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: '请提供要删除的图片URL列表' }, { status: 400 });
    }

    // 获取使用状态，防止删除已使用的图片
    const usedUrls = await getUsedImageUrls();
    const usedBeingDeleted = urls.filter((u: string) => usedUrls.has(u));
    if (usedBeingDeleted.length > 0) {
      return NextResponse.json({
        error: `有 ${usedBeingDeleted.length} 张图片正在被使用，无法删除。请先解除引用关系。`,
        usedUrls: usedBeingDeleted,
      }, { status: 400 });
    }

    await del(urls);
    return NextResponse.json({
      success: true,
      deleted: urls.length,
    });
  } catch (error: any) {
    console.error('DELETE /api/images error:', error);
    return NextResponse.json({ error: `删除图片失败: ${error?.message || '未知错误'}` }, { status: 500 });
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
