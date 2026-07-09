import prisma from './db';

export interface CategoryWithName {
  id: string;
  slug: string;
  icon: string;
  sortOrder: number;
  name: string;
}

export async function getAllCategories(lang: string): Promise<CategoryWithName[]> {
  const categories = await prisma.category.findMany({
    include: { translations: true },
    orderBy: { sortOrder: 'asc' }
  });

  return categories.map(cat => {
    const translation = cat.translations.find(t => t.lang === lang)
      || cat.translations.find(t => t.lang === 'en')
      || cat.translations[0];

    return {
      id: cat.id,
      slug: cat.slug,
      icon: cat.icon,
      sortOrder: cat.sortOrder,
      name: translation?.name || cat.slug
    };
  });
}

export async function getCategoryById(id: string, lang: string): Promise<CategoryWithName | null> {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { translations: true }
  });

  if (!category) return null;

  const translation = category.translations.find(t => t.lang === lang)
    || category.translations.find(t => t.lang === 'en')
    || category.translations[0];

  return {
    id: category.id,
    slug: category.slug,
    icon: category.icon,
    sortOrder: category.sortOrder,
    name: translation?.name || category.slug
  };
}

export interface CategoryFormData {
  slug: string;
  icon: string;
  sortOrder: number;
  translations: { lang: string; name: string }[];
}
