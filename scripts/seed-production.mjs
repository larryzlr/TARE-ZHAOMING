// 生产数据库 seed 脚本 - 使用 Neon HTTP 直接执行 SQL
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('错误: DATABASE_URL 未设置');
    process.exit(1);
  }

  const sql = neon(connectionString);
  console.log('开始 seed 生产数据库...\n');

  // ========== 1. 创建默认分类 ==========
  const categories = [
    {
      slug: 'disc-pads',
      sortOrder: 0,
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
      translations: { en: 'Disc Brake Pads', zh: '盘式刹车片', ru: 'Дисковые колодки', fr: 'Plaquettes de frein à disque', es: 'Pastillas de freno de disco' },
    },
    {
      slug: 'drum-pads',
      sortOrder: 1,
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z',
      translations: { en: 'Drum Brake Pads', zh: '鼓式刹车片', ru: 'Барабанные колодки', fr: 'Plaquettes de frein à tambour', es: 'Pastillas de freno de tambour' },
    },
    {
      slug: 'ceramic-pads',
      sortOrder: 2,
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z',
      translations: { en: 'Ceramic Brake Pads', zh: '陶瓷刹车片', ru: 'Керамические колодки', fr: 'Plaquettes céramiques', es: 'Pastillas cerámicas' },
    },
    {
      slug: 'semi-metallic',
      sortOrder: 3,
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      translations: { en: 'Semi-Metallic Pads', zh: '半金属刹车片', ru: 'Полуметаллические колодки', fr: 'Plaquettes semi-métalliques', es: 'Pastillas semimetálicas' },
    },
    {
      slug: 'brake-shoes',
      sortOrder: 4,
      icon: 'M17.5 3C15.57 3 14 4.57 14 6.5c0 1.58 1.03 2.91 2.45 3.39L9.55 15.89C9.07 14.47 7.74 13.44 6.16 13.44 4.23 13.44 2.66 15.01 2.66 16.94S4.23 20.44 6.16 20.44c1.58 0 2.91-1.03 3.39-2.45l7.39-5.99c.48 1.42 1.81 2.45 3.39 2.45 1.93 0 3.5-1.57 3.5-3.5S19.43 3 17.5 3z',
      translations: { en: 'Brake Shoes', zh: '刹车蹄片', ru: 'Тормозные башмаки', fr: 'Sabots de frein', es: 'Zapatas de freno' },
    },
    {
      slug: 'brake-rotors',
      sortOrder: 5,
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
      translations: { en: 'Brake Rotors', zh: '刹车盘', ru: 'Тормозные диски', fr: 'Disques de frein', es: 'Discos de freno' },
    },
  ];

  console.log('创建分类...');
  for (const cat of categories) {
    const catId = crypto.randomUUID();
    // Insert or update category
    await sql`
      INSERT INTO categories (id, slug, icon, "sortOrder", "parentId", "createdAt", "updatedAt")
      VALUES (${catId}, ${cat.slug}, ${cat.icon}, ${cat.sortOrder}, NULL, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET icon = ${cat.icon}, "sortOrder" = ${cat.sortOrder}, "updatedAt" = NOW()
    `;

    // Get the category id (in case of conflict, it already existed)
    const rows = await sql`SELECT id FROM categories WHERE slug = ${cat.slug}`;
    const actualCatId = rows[0].id;

    for (const [lang, name] of Object.entries(cat.translations)) {
      await sql`
        INSERT INTO category_translations (id, "categoryId", lang, name)
        VALUES (${crypto.randomUUID()}, ${actualCatId}, ${lang}, ${name})
        ON CONFLICT ("categoryId", lang) DO UPDATE SET name = ${name}
      `;
    }
    console.log(`  ✓ ${cat.slug}`);
  }

  // ========== 2. 创建站点配置 ==========
  console.log('\n创建站点配置...');
  const siteConfigs = [
    { key: 'company_name', value: 'Zhaoming Brake Pads', lang: 'en' },
    { key: 'company_name', value: '赵明刹车片', lang: 'zh' },
    { key: 'company_name', value: 'Тормозные колодки Zhaoming', lang: 'ru' },
    { key: 'company_name', value: 'Plaquettes de frein Zhaoming', lang: 'fr' },
    { key: 'company_name', value: 'Pastillas de freno Zhaoming', lang: 'es' },
    { key: 'whatsapp', value: '+8613800138000', lang: 'en' },
    { key: 'wechat', value: 'zhaoming_brake', lang: 'en' },
    { key: 'logo', value: '/images/logo.png', lang: 'en' },
  ];

  for (const cfg of siteConfigs) {
    await sql`
      INSERT INTO site_configs (id, key, value, lang)
      VALUES (${crypto.randomUUID()}, ${cfg.key}, ${cfg.value}, ${cfg.lang})
      ON CONFLICT (key, lang) DO UPDATE SET value = ${cfg.value}
    `;
    console.log(`  ✓ ${cfg.key} (${cfg.lang})`);
  }

  // ========== 3. 导入翻译文案 ==========
  console.log('\n导入翻译文案...');
  const locales = ['en', 'zh', 'ru', 'fr', 'es'];
  for (const locale of locales) {
    try {
      const filePath = join(__dirname, '..', 'src', 'messages', `${locale}.json`);
      const content = readFileSync(filePath, 'utf-8');
      // Validate JSON
      JSON.parse(content);
      await sql`
        INSERT INTO translations (id, lang, content)
        VALUES (${crypto.randomUUID()}, ${locale}, ${content})
        ON CONFLICT (lang) DO UPDATE SET content = ${content}
      `;
      console.log(`  ✓ ${locale}.json (${content.length} bytes)`);
    } catch (e) {
      console.error(`  ✗ ${locale}: ${e.message}`);
    }
  }

  // ========== 4. 验证 ==========
  console.log('\n=== 验证数据 ===');
  const userCount = await sql`SELECT COUNT(*)::int as count FROM users`;
  const catCount = await sql`SELECT COUNT(*)::int as count FROM categories`;
  const configCount = await sql`SELECT COUNT(*)::int as count FROM site_configs`;
  const transCount = await sql`SELECT COUNT(*)::int as count FROM translations`;

  console.log(`  用户: ${userCount[0].count}`);
  console.log(`  分类: ${catCount[0].count}`);
  console.log(`  站点配置: ${configCount[0].count}`);
  console.log(`  翻译: ${transCount[0].count}`);
  console.log('\n✅ Seed 完成！管理员账户: admin@example.com / Admin123');
}

main().catch(e => {
  console.error('执行出错:', e);
  process.exit(1);
});
