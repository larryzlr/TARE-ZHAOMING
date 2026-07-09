import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { routing } from '@/lib/i18n/routing';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { translations: true }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { slug, icon, sortOrder, translations } = body;

    const existing = await prisma.category.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await prisma.category.update({
      where: { id: params.id },
      data: {
        slug,
        icon,
        sortOrder: Number(sortOrder),
      }
    });

    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        await prisma.categoryTranslation.upsert({
          where: {
            categoryId_lang: {
              categoryId: params.id,
              lang: t.lang
            }
          },
          update: { name: t.name },
          create: {
            categoryId: params.id,
            lang: t.lang,
            name: t.name
          }
        });
      }
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { translations: true }
    });

    revalidateCategories();

    return NextResponse.json({ category });
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({
      where: { id: params.id }
    });

    revalidateCategories();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

function revalidateCategories() {
  routing.locales.forEach(locale => {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/products`);
  });
}
