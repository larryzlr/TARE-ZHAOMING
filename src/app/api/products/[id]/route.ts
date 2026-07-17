import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { translations: true, categoryTags: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 合并主分类和标签分类，去重
    const allCategorySlugs = Array.from(new Set([
      (product as any).category,
      ...((product as any).categoryTags || []).map((t: any) => t.categorySlug),
    ].filter((s: string) => s && s !== 'uncategorized')));

    const result = {
      id: (product as any).id,
      slug: (product as any).slug,
      category: (product as any).category,
      categories: allCategorySlugs,
      images: (product as any).images ? JSON.parse((product as any).images) : [],
      status: (product as any).status,
      sortOrder: (product as any).sortOrder,
      createdAt: (product as any).createdAt,
      updatedAt: (product as any).updatedAt,
      translations: (product as any).translations.map((t: any) => ({
        lang: t.lang,
        title: t.title,
        description: t.description,
        specs: t.specs ? JSON.parse(t.specs) : []
      }))
    };

    return NextResponse.json({ product: result });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { slug, category, categories, images, status, sortOrder, translations } = body;

    // 主分类取 categories 的第一个，或 category 字段
    const primaryCategory = categories?.[0] || category;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(slug && { slug }),
        ...(primaryCategory !== undefined && { category: primaryCategory }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(status && { status }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: { translations: true, categoryTags: true }
    });

    // 更新标签关联：先删除旧的，再创建新的
    if (categories !== undefined && Array.isArray(categories)) {
      await (prisma as any).productCategoryTag.deleteMany({
        where: { productId: params.id },
      });
      const tagsToCreate = categories
        .filter((c: string) => c && c !== 'uncategorized')
        .map((categorySlug: string) => ({
          productId: params.id,
          categorySlug,
        }));
      if (tagsToCreate.length > 0) {
        await (prisma as any).productCategoryTag.createMany({
          data: tagsToCreate,
        });
      }
    }

    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        const existing = product.translations.find((pt: any) => pt.lang === t.lang);
        if (existing) {
          await prisma.productTranslation.update({
            where: { id: existing.id },
            data: {
              title: t.title || existing.title,
              description: t.description !== undefined ? t.description : existing.description,
              specs: t.specs !== undefined ? JSON.stringify(t.specs) : existing.specs,
            }
          });
        } else {
          await prisma.productTranslation.create({
            data: {
              productId: params.id,
              lang: t.lang,
              title: t.title || '',
              description: t.description || null,
              specs: t.specs ? JSON.stringify(t.specs) : null
            }
          });
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id: params.id },
      include: { translations: true, categoryTags: true }
    });

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    console.error('PUT /api/products/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
