// 从本地 SQLite 重新同步所有数据到生产 Neon，图片 URL 直接用公开 Blob URL
import Database from 'better-sqlite3';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

// 加载公开 Blob URL 映射
const mapPath = join(process.cwd(), 'scripts', 'image-url-map.json');
const urlMap = JSON.parse(readFileSync(mapPath, 'utf-8'));
console.log(`加载了 ${Object.keys(urlMap).length} 个公开 Blob URL 映射\n`);

// 只替换 /uploads/xxx 为公开 Blob URL
function replaceUploadUrls(value) {
  if (!value || typeof value !== 'string') return value;
  let result = value;
  for (const [localUrl, blobUrl] of Object.entries(urlMap)) {
    result = result.replaceAll(localUrl, blobUrl);
  }
  return result;
}

// 连接本地 SQLite
const dbPath = join(process.cwd(), 'prisma', 'dev.db');
const db = new Database(dbPath, { readonly: true });

// 连接 Neon
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('错误: DATABASE_URL 未设置');
  process.exit(1);
}
const sql = neon(connectionString);

async function main() {
  // ========== 1. 清除并重建 site_configs ==========
  console.log('=== 同步 site_configs ===');
  
  // 先删除旧的
  await sql`DELETE FROM site_configs`;
  
  const configs = db.prepare(`SELECT key, lang, value FROM site_configs ORDER BY key, lang`).all();
  let configSynced = 0;
  
  for (const config of configs) {
    const newValue = replaceUploadUrls(config.value);
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO site_configs (id, key, value, lang)
      VALUES (${id}, ${config.key}, ${newValue}, ${config.lang})
    `;
    const isBlob = newValue.includes('blob.vercel-storage.com');
    if (isBlob) {
      console.log(`  ✓ ${config.key} (${config.lang}) -> Blob URL`);
    }
    configSynced++;
  }
  console.log(`同步 ${configSynced} 条 site_configs`);

  // ========== 2. 同步 products ==========
  console.log('\n=== 同步 products ===');
  
  // 先删除旧的翻译和产品
  await sql`DELETE FROM product_translations`;
  await sql`DELETE FROM products`;
  
  const products = db.prepare(`SELECT slug, category, images, status, "sortOrder" FROM products`).all();
  let productSynced = 0;
  
  // 本地 id 到 Neon id 的映射
  const localToNeonId = {};
  const localProducts = db.prepare(`SELECT id, slug FROM products`).all();
  
  for (const product of products) {
    const newImages = product.images ? replaceUploadUrls(product.images) : null;
    const productId = crypto.randomUUID();
    
    await sql`
      INSERT INTO products (id, slug, category, images, status, "sortOrder", "createdAt", "updatedAt")
      VALUES (${productId}, ${product.slug}, ${product.category || 'uncategorized'}, ${newImages}, ${product.status || 'draft'}, ${product.sortOrder || 0}, NOW(), NOW())
    `;
    
    // 保存 id 映射
    const localProduct = localProducts.find(p => p.slug === product.slug);
    if (localProduct) {
      localToNeonId[localProduct.id] = productId;
    }
    
    const isBlob = newImages && newImages.includes('blob.vercel-storage.com');
    if (isBlob) {
      console.log(`  ✓ ${product.slug} -> images含Blob URL`);
    }
    productSynced++;
  }
  console.log(`同步 ${productSynced} 条 products`);

  // ========== 3. 同步 product_translations ==========
  console.log('\n=== 同步 product_translations ===');
  const translations = db.prepare(`SELECT "productId", lang, title, description, specs FROM product_translations`).all();
  let transSynced = 0;
  
  for (const t of translations) {
    const neonProductId = localToNeonId[t.productId];
    if (!neonProductId) continue;
    
    const transId = crypto.randomUUID();
    await sql`
      INSERT INTO product_translations (id, "productId", lang, title, description, specs)
      VALUES (${transId}, ${neonProductId}, ${t.lang}, ${t.title}, ${t.description}, ${t.specs})
    `;
    transSynced++;
  }
  console.log(`同步 ${transSynced} 条 product_translations`);

  // ========== 4. 同步 categories ==========
  console.log('\n=== 同步 categories ===');
  const cats = db.prepare(`SELECT slug, icon, "sortOrder" FROM categories`).all();
  let catSynced = 0;
  
  for (const cat of cats) {
    const newIcon = replaceUploadUrls(cat.icon);
    await sql`UPDATE categories SET icon = ${newIcon}, "updatedAt" = NOW() WHERE slug = ${cat.slug}`;
    const isBlob = newIcon.includes('blob.vercel-storage.com');
    if (isBlob) {
      console.log(`  ✓ ${cat.slug} -> icon含Blob URL`);
    }
    catSynced++;
  }
  console.log(`同步 ${catSynced} 条 categories`);

  // ========== 5. 验证 ==========
  console.log('\n=== 验证 ===');
  
  // 检查是否有重复 URL 前缀
  const badUrls = await sql`
    SELECT key, lang, LEFT(value, 150) as preview FROM site_configs 
    WHERE value LIKE '%public.blob.vercel-storage.com/public.blob%'
  `;
  if (badUrls.length > 0) {
    console.error('❌ 发现重复URL前缀!');
    for (const b of badUrls) {
      console.error(`  ${b.key} (${b.lang}): ${b.preview}`);
    }
  } else {
    console.log('✅ 无重复URL前缀');
  }
  
  const privateCount = await sql`SELECT COUNT(*)::int as count FROM site_configs WHERE value LIKE '%private.blob%'`;
  const publicCount = await sql`SELECT COUNT(*)::int as count FROM site_configs WHERE value LIKE '%public.blob%'`;
  const prodCount = await sql`SELECT COUNT(*)::int as count FROM products`;
  
  console.log(`私有Blob残留: ${privateCount[0].count}`);
  console.log(`公开Blob配置: ${publicCount[0].count}`);
  console.log(`总产品: ${prodCount[0].count}`);

  // 显示含 blob URL 的 siteConfig
  const blobConfigs = await sql`
    SELECT key, lang, LEFT(value, 130) as preview FROM site_configs 
    WHERE value LIKE '%blob.vercel-storage.com%'
    ORDER BY key, lang
  `;
  console.log('\nBlob URL 配置详情:');
  for (const c of blobConfigs) {
    console.log(`  ${c.key} (${c.lang}): ${c.preview}`);
  }

  db.close();
}

main().catch(e => { console.error('执行出错:', e); db.close(); process.exit(1); });
