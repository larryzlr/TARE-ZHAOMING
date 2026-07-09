import prisma from '@/lib/db';

export async function getAllProducts(locale: string = 'en', status: string = 'published') {
  try {
    const products = await prisma.product.findMany({
      where: { status },
      include: {
        translations: {
          where: { lang: locale }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return products.map(product => {
      const translation = product.translations.find((t: any) => t.lang === locale) ||
                         product.translations.find((t: any) => t.lang === 'en');

      return {
        ...product,
        title: translation?.title || '',
        description: translation?.description || '',
        images: product.images ? JSON.parse(product.images) : [],
        specs: translation?.specs ? JSON.parse(translation.specs) : []
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
}

export async function getProductById(id: string, locale: string = 'en') {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: {
          where: { lang: locale }
        }
      }
    });

    if (!product) {
      return null;
    }

    const translation = product.translations.find((t: any) => t.lang === locale) ||
                       product.translations.find((t: any) => t.lang === 'en');

    return {
      ...product,
      title: translation?.title || '',
      description: translation?.description || '',
      images: product.images ? JSON.parse(product.images) : [],
      specs: translation?.specs ? JSON.parse(translation.specs) : []
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function getProductBySlug(slug: string, locale: string = 'en') {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { lang: locale }
        }
      }
    });

    if (!product) {
      return null;
    }

    const translation = product.translations.find((t: any) => t.lang === locale) ||
                       product.translations.find((t: any) => t.lang === 'en');

    return {
      ...product,
      title: translation?.title || '',
      description: translation?.description || '',
      images: product.images ? JSON.parse(product.images) : [],
      specs: translation?.specs ? JSON.parse(translation.specs) : []
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
}

export async function getSiteConfig(lang: string) {
  try {
    const configs = await prisma.siteConfig.findMany({
      where: { lang }
    });

    const configMap: Record<string, string> = {};
    configs.forEach(config => {
      configMap[config.key] = config.value;
    });

    return configMap;
  } catch (error) {
    console.error('Error fetching site config:', error);
    throw new Error('Failed to fetch site config');
  }
}
