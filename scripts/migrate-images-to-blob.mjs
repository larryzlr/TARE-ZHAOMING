/**
 * 图片迁移脚本：将本地 public/uploads/ 下的图片上传至 Vercel Blob，
 * 并更新数据库中所有引用 /uploads/ 的记录为新 Blob URL。
 *
 * 用法：
 *   node scripts/migrate-images-to-blob.mjs          # 迁移本地 SQLite 数据库
 *   node scripts/migrate-images-to-blob.mjs --prod    # 迁移生产 Neon 数据库
 */
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const isProd = process.argv.includes('--prod');
const uploadsDir = path.join(projectRoot, 'public', 'uploads');

// 根据模式选择数据库连接
function createPrismaClient() {
  if (isProd) {
    const prodDbUrl = process.env.DATABASE_URL_PROD || process.env.DATABASE_URL;
    if (!prodDbUrl || !prodDbUrl.startsWith('postgresql')) {
      throw new Error('生产数据库 URL 未配置或不是 PostgreSQL 连接串');
    }
    const sql = neon(prodDbUrl);
    const adapter = new PrismaNeon(sql);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

async function main() {
  console.log(`\n🚀 图片迁移脚本启动 (${isProd ? '生产环境-Neon' : '本地环境-SQLite'})\n`);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN 未配置，请在 .env 中设置');
    process.exit(1);
  }

  // 1. 读取本地图片文件
  if (!fs.existsSync(uploadsDir)) {
    console.log('ℹ️  public/uploads/ 目录不存在，无需迁移');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
  });

  if (files.length === 0) {
    console.log('ℹ️  public/uploads/ 目录下没有图片文件');
    return;
  }

  console.log(`📁 发现 ${files.length} 个本地图片文件\n`);

  // 2. 上传到 Vercel Blob
  const urlMapping = {}; // { '/uploads/xxx.jpg': 'https://blob-url/xxx.jpg' }
  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const localPath = path.join(uploadsDir, file);
    const oldUrl = `/uploads/${file}`;
    const buffer = fs.readFileSync(localPath);
    const ext = path.extname(file);

    try {
      const blob = await put(`uploads/${file}`, buffer, {
        access: 'public',
        contentType: getContentType(ext),
        addRandomSuffix: false,
      });

      urlMapping[oldUrl] = blob.url;
      uploaded++;
      console.log(`  ✅ [${uploaded}/${files.length}] ${file} → ${blob.url}`);
    } catch (err) {
      failed++;
      console.error(`  ❌ 上传失败: ${file} - ${err.message}`);
    }
  }

  console.log(`\n📊 上传完成: 成功 ${uploaded}, 失败 ${failed}\n`);

  if (uploaded === 0) {
    console.log('⚠️  没有图片上传成功，跳过数据库更新');
    return;
  }

  // 3. 更新数据库
  const prisma = createPrismaClient();

  try {
    let updatedRecords = 0;

    // 3.1 更新 SiteConfig 表
    const siteConfigs = await prisma.siteConfig.findMany();
    for (const config of siteConfigs) {
      const newVal = replaceUrls(config.value, urlMapping);
      if (newVal !== config.value) {
        await prisma.siteConfig.update({
          where: { id: config.id },
          data: { value: newVal },
        });
        updatedRecords++;
        console.log(`  🔄 SiteConfig [${config.key}/${config.lang}] 已更新`);
      }
    }

    // 3.2 更新 Category 表 (icon 字段)
    const categories = await prisma.category.findMany();
    for (const cat of categories) {
      const newIcon = replaceUrls(cat.icon || '', urlMapping);
      if (newIcon !== (cat.icon || '')) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { icon: newIcon },
        });
        updatedRecords++;
        console.log(`  🔄 Category [${cat.slug}] icon 已更新`);
      }
    }

    // 3.3 更新 Product 表 (images 字段，逗号分隔的多图)
    const products = await prisma.product.findMany();
    for (const prod of products) {
      const newImages = replaceUrls(prod.images || '', urlMapping);
      if (newImages !== (prod.images || '')) {
        await prisma.product.update({
          where: { id: prod.id },
          data: { images: newImages },
        });
        updatedRecords++;
        console.log(`  🔄 Product [${prod.slug}] images 已更新`);
      }
    }

    console.log(`\n📊 数据库更新完成: ${updatedRecords} 条记录已更新\n`);

    // 4. 输出映射文件备份
    const mappingPath = path.join(projectRoot, 'scripts', 'image-url-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(urlMapping, null, 2));
    console.log(`💾 URL映射已保存至: ${mappingPath}\n`);
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ 迁移完成！\n');
}

function replaceUrls(value, mapping) {
  if (!value) return value;
  let result = value;
  for (const [oldUrl, newUrl] of Object.entries(mapping)) {
    // 替换所有出现的 /uploads/xxx 为 blob URL
    result = result.split(oldUrl).join(newUrl);
  }
  return result;
}

function getContentType(ext) {
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

main().catch(err => {
  console.error('❌ 迁移脚本执行失败:', err);
  process.exit(1);
});
