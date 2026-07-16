import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LANGS = ['en', 'zh', 'ru', 'fr', 'es'];

const categories = [
  {
    slug: 'by-type',
    icon: '',
    sortOrder: 0,
    parentId: null,
    translations: {
      en: 'By Brake Type',
      zh: '按刹车片类型',
      ru: 'По типу тормозов',
      fr: 'Par type de frein',
      es: 'Por tipo de freno',
    }
  },
  {
    slug: 'disc-pads',
    icon: '',
    sortOrder: 0,
    parentId: 'by-type',
    translations: {
      en: 'Disc Brake Pads',
      zh: '盘式刹车片',
      ru: 'Дисковые тормозные колодки',
      fr: 'Plaquettes de frein à disque',
      es: 'Pastillas de freno de disco',
    }
  },
  {
    slug: 'drum-pads',
    icon: '',
    sortOrder: 1,
    parentId: 'by-type',
    translations: {
      en: 'Drum Brake Pads',
      zh: '鼓式刹车片',
      ru: 'Барабанные тормозные колодки',
      fr: 'Plaquettes de frein à tambour',
      es: 'Pastillas de freno de tambor',
    }
  },
  {
    slug: 'by-material',
    icon: '',
    sortOrder: 1,
    parentId: null,
    translations: {
      en: 'By Material',
      zh: '按材质',
      ru: 'По материалу',
      fr: 'Par matériau',
      es: 'Por material',
    }
  },
  {
    slug: 'semi-metallic',
    icon: '',
    sortOrder: 0,
    parentId: 'by-material',
    translations: {
      en: 'Semi-Metallic Brake Pads',
      zh: '半金属刹车片',
      ru: 'Полуметаллические колодки',
      fr: 'Plaquettes semi-métalliques',
      es: 'Pastillas semimetálicas',
    }
  },
  {
    slug: 'ceramic-pads',
    icon: '',
    sortOrder: 1,
    parentId: 'by-material',
    translations: {
      en: 'Ceramic Brake Pads',
      zh: '陶瓷刹车片',
      ru: 'Керамические тормозные колодки',
      fr: 'Plaquettes céramiques',
      es: 'Pastillas cerámicas',
    }
  },
];

async function main() {
  console.log('Seeding categories...');

  // 先创建一级分类，获取ID
  const slugToId = {};

  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      slugToId[cat.slug] = existing.id;
      console.log(`  ${cat.slug} already exists, id=${existing.id}`);
      continue;
    }

    const created = await prisma.category.create({
      data: {
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        parentId: cat.parentId ? (slugToId[cat.parentId] || null) : null,
        translations: {
          create: LANGS.map(lang => ({
            lang,
            name: cat.translations[lang] || cat.translations.en
          }))
        }
      }
    });
    slugToId[cat.slug] = created.id;
    console.log(`  Created ${cat.slug}, id=${created.id}`);
  }

  // 如果二级分类的parentId没设上（因为父分类已存在），更新一下
  for (const cat of categories) {
    if (cat.parentId) {
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
      if (existing && !existing.parentId) {
        await prisma.category.update({
          where: { slug: cat.slug },
          data: { parentId: slugToId[cat.parentId] }
        });
        console.log(`  Updated ${cat.slug} parentId -> ${slugToId[cat.parentId]}`);
      }
    }
  }

  console.log('Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
