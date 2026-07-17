import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const locale = searchParams.get('locale') || 'en';
    const category = searchParams.get('category') || undefined;

    // 构建查询条件：支持通过主分类或标签表查询
    const where: any = {};
    if (status) where.status = status;
    if (category) {
      where.OR = [
        { category },
        { categoryTags: { some: { categorySlug: category } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        translations: true,
        categoryTags: true,
      },
      orderBy: { sortOrder: 'asc' }
    });

    const result = products.map((product: any) => {
      const translation = product.translations.find((t: any) => t.lang === locale) ||
                         product.translations.find((t: any) => t.lang === 'en') ||
                         product.translations[0];

      // 合并主分类和标签分类，去重
      const allCategorySlugs = Array.from(new Set([
        product.category,
        ...product.categoryTags.map((t: any) => t.categorySlug),
      ].filter((s: string) => s && s !== 'uncategorized')));

      return {
        id: product.id,
        slug: product.slug,
        category: product.category,
        categories: allCategorySlugs,
        images: product.images ? JSON.parse(product.images) : [],
        detailImages: product.detailImages ? JSON.parse(product.detailImages) : [],
        status: product.status,
        sortOrder: product.sortOrder,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        title: translation?.title || '',
        description: translation?.description || '',
        specs: translation?.specs ? JSON.parse(translation.specs) : [],
        detailContent: translation?.detailContent || '',
        translations: product.translations.map((t: any) => ({
          lang: t.lang,
          title: t.title,
          description: t.description,
          specs: t.specs ? JSON.parse(t.specs) : [],
          detailContent: t.detailContent || '',
        }))
      };
    });

    return NextResponse.json({ products: result });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, category, categories, images, detailImages, status, sortOrder, translations } = body;

    if (!slug || !translations || translations.length === 0) {
      return NextResponse.json({ error: 'slug and translations are required' }, { status: 400 });
    }

    // 详情页图片最多3张
    const safeDetailImages = Array.isArray(detailImages)
      ? detailImages.filter((u: string) => typeof u === 'string' && u.trim()).slice(0, 3)
      : [];

    // 主分类取 categories 的第一个，或 category 字段，或 uncategorized
    const primaryCategory = categories?.[0] || category || 'uncategorized';

    const product = await prisma.product.create({
      data: {
        slug,
        category: primaryCategory,
        images: images ? JSON.stringify(images) : null,
        detailImages: safeDetailImages.length > 0 ? JSON.stringify(safeDetailImages) : null,
        status: status || 'draft',
        sortOrder: sortOrder || 0,
        translations: {
          create: translations.map((t: any) => ({
            lang: t.lang,
            title: t.title || '',
            description: t.description || null,
            specs: t.specs ? JSON.stringify(t.specs) : null,
            detailContent: typeof t.detailContent === 'string' ? t.detailContent : null,
          }))
        },
        // 创建标签关联（排除主分类重复）
        categoryTags: categories && Array.isArray(categories) && categories.length > 0 ? {
          create: categories
            .filter((c: string) => c && c !== 'uncategorized')
            .map((categorySlug: string) => ({ categorySlug })),
        } : undefined,
      },
      include: { translations: true, categoryTags: true }
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Product slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
