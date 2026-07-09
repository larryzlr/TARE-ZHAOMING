import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { translations: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const result = {
      id: product.id,
      slug: product.slug,
      category: product.category,
      images: product.images ? JSON.parse(product.images) : [],
      status: product.status,
      sortOrder: product.sortOrder,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      translations: product.translations.map((t: any) => ({
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
    const { slug, category, images, status, sortOrder, translations } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(slug && { slug }),
        ...(category !== undefined && { category }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
        ...(status && { status }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: { translations: true }
    });

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
      include: { translations: true }
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
