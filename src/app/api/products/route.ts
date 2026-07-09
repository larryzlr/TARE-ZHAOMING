import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const locale = searchParams.get('locale') || 'en';
    const category = searchParams.get('category') || undefined;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const products = await prisma.product.findMany({
      where,
      include: {
        translations: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    const result = products.map(product => {
      const translation = product.translations.find((t: any) => t.lang === locale) ||
                         product.translations.find((t: any) => t.lang === 'en') ||
                         product.translations[0];

      return {
        id: product.id,
        slug: product.slug,
        category: product.category,
        images: product.images ? JSON.parse(product.images) : [],
        status: product.status,
        sortOrder: product.sortOrder,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        title: translation?.title || '',
        description: translation?.description || '',
        specs: translation?.specs ? JSON.parse(translation.specs) : [],
        translations: product.translations.map((t: any) => ({
          lang: t.lang,
          title: t.title,
          description: t.description,
          specs: t.specs ? JSON.parse(t.specs) : []
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
    const { slug, category, images, status, sortOrder, translations } = body;

    if (!slug || !translations || translations.length === 0) {
      return NextResponse.json({ error: 'slug and translations are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        slug,
        category: category || 'uncategorized',
        images: images ? JSON.stringify(images) : null,
        status: status || 'draft',
        sortOrder: sortOrder || 0,
        translations: {
          create: translations.map((t: any) => ({
            lang: t.lang,
            title: t.title || '',
            description: t.description || null,
            specs: t.specs ? JSON.stringify(t.specs) : null
          }))
        }
      },
      include: { translations: true }
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
