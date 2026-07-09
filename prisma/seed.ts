// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import bcrypt from 'bcryptjs';

const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const prisma = new PrismaClient();

const LOCALES = ['en', 'zh', 'ru', 'fr', 'es'];

const DEFAULT_CATEGORIES = [
  {
    slug: 'disc-pads',
    sortOrder: 0,
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    translations: {
      en: 'Disc Brake Pads',
      zh: '盘式刹车片',
      ru: 'Дисковые колодки',
      fr: 'Plaquettes de frein à disque',
      es: 'Pastillas de freno de disco',
    },
  },
  {
    slug: 'drum-pads',
    sortOrder: 1,
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z',
    translations: {
      en: 'Drum Brake Pads',
      zh: '鼓式刹车片',
      ru: 'Барабанные колодки',
      fr: 'Plaquettes de frein à tambour',
      es: 'Pastillas de freno de tambor',
    },
  },
  {
    slug: 'ceramic-pads',
    sortOrder: 2,
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z',
    translations: {
      en: 'Ceramic Brake Pads',
      zh: '陶瓷刹车片',
      ru: 'Керамические колодки',
      fr: 'Plaquettes céramiques',
      es: 'Pastillas cerámicas',
    },
  },
  {
    slug: 'semi-metallic',
    sortOrder: 3,
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    translations: {
      en: 'Semi-Metallic Pads',
      zh: '半金属刹车片',
      ru: 'Полуметаллические колодки',
      fr: 'Plaquettes semi-métalliques',
      es: 'Pastillas semimetálicas',
    },
  },
  {
    slug: 'brake-shoes',
    sortOrder: 4,
    icon: 'M17.5 3C15.57 3 14 4.57 14 6.5c0 1.58 1.03 2.91 2.45 3.39L9.55 15.89C9.07 14.47 7.74 13.44 6.16 13.44 4.23 13.44 2.66 15.01 2.66 16.94S4.23 20.44 6.16 20.44c1.58 0 2.91-1.03 3.39-2.45l7.39-5.99c.48 1.42 1.81 2.45 3.39 2.45 1.93 0 3.5-1.57 3.5-3.5S19.43 3 17.5 3z',
    translations: {
      en: 'Brake Shoes',
      zh: '刹车蹄片',
      ru: 'Тормозные башмаки',
      fr: 'Sabots de frein',
      es: 'Zapatas de freno',
    },
  },
  {
    slug: 'brake-rotors',
    sortOrder: 5,
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    translations: {
      en: 'Brake Rotors',
      zh: '刹车盘',
      ru: 'Тормозные диски',
      fr: 'Disques de frein',
      es: 'Discos de freno',
    },
  },
];

async function main() {
  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log(`Admin user created: ${adminUser.email}`);

  // 创建默认站点配置
  const defaultConfigs = [
    { key: 'company_name', value: 'My Company', lang: 'en' },
    { key: 'company_name', value: '我的公司', lang: 'zh' },
    { key: 'whatsapp', value: 'https://wa.me/861234567890', lang: 'en' },
    { key: 'wechat', value: 'my_wechat_id', lang: 'en' },
    { key: 'logo', value: '/images/logo.png', lang: 'en' },
  ];

  for (const config of defaultConfigs) {
    await prisma.siteConfig.upsert({
      where: {
        key_lang: {
          key: config.key,
          lang: config.lang,
        },
      },
      update: {},
      create: config,
    });
  }
  console.log('Default configurations created');

  // 导入翻译文件到 Translation 表
  for (const locale of LOCALES) {
    const filePath = path.join(__dirname, '..', 'src', 'messages', `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Translation file not found: ${filePath}`);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    await prisma.translation.upsert({
      where: { lang: locale },
      update: { content },
      create: { lang: locale, content },
    });
    console.log(`Translation imported: ${locale}`);
  }

  // 创建默认分类
  for (const cat of DEFAULT_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { icon: cat.icon, sortOrder: cat.sortOrder },
      create: { slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder },
    });

    for (const locale of LOCALES) {
      const name = cat.translations[locale as keyof typeof cat.translations];
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_lang: {
            categoryId: category.id,
            lang: locale,
          },
        },
        update: { name },
        create: { categoryId: category.id, lang: locale, name },
      });
    }
    console.log(`Category created: ${cat.slug}`);
  }

  // 清理德语数据
  await prisma.siteConfig.deleteMany({ where: { lang: 'de' } });
  await prisma.productTranslation.deleteMany({ where: { lang: 'de' } });
  await prisma.translation.deleteMany({ where: { lang: 'de' } });
  console.log('Cleaned up German (de) data');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
