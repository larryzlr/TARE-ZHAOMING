import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { routing } from '@/lib/i18n/routing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    const categories = await prisma.category.findMany({
      include: { translations: true },
      orderBy: { sortOrder: 'asc' }
    });

    const mapped = categories.map(cat => {
      const translation = cat.translations.find(t => t.lang === lang)
        || cat.translations.find(t => t.lang === 'en')
        || cat.translations[0];

      return {
        id: cat.id,
        slug: cat.slug,
        icon: cat.icon,
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        name: translation?.name || cat.slug,
        translations: cat.translations
      };
    });

    // 构建树形结构
    const roots = mapped.filter(c => !c.parentId);
    const tree = roots.map(root => ({
      ...root,
      children: mapped.filter(c => c.parentId === root.id)
    }));

    return NextResponse.json({ categories: tree, flat: mapped });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, icon = '', parentId = null, sortOrder = 0, translations } = body;

    if (!slug || !translations || !Array.isArray(translations)) {
      return NextResponse.json({ error: 'slug and translations are required' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        slug,
        icon,
        parentId: parentId || null,
        sortOrder: Number(sortOrder),
        translations: {
          create: translations.map((t: { lang: string; name: string }) => ({
            lang: t.lang,
            name: t.name
          }))
        }
      },
      include: { translations: true }
    });

    revalidateCategories();

    return NextResponse.json({ category });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

function revalidateCategories() {
  routing.locales.forEach(locale => {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/products`);
  });
}
