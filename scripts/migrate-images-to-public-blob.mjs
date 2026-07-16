// 批量上传本地图片到公开 Vercel Blob Store，输出 URL 映射
import { put, list, del } from '@vercel/blob';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const PUBLIC_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
if (!PUBLIC_TOKEN) {
  console.error('错误: BLOB_READ_WRITE_TOKEN 未设置');
  process.exit(1);
}

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

async function main() {
  // 1. 列出公开 Blob Store 中已有文件（去重）
  console.log('检查公开 Blob Store 中已有文件...');
  const existingBlobs = await list({ token: PUBLIC_TOKEN, prefix: 'uploads/' });
  const existingNames = new Set(existingBlobs.blobs.map(b => b.pathname));
  console.log(`  已有 ${existingNames.size} 个文件\n`);

  // 2. 读取本地文件列表
  let files;
  try {
    files = readdirSync(UPLOADS_DIR).filter(f => {
      const ext = f.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    });
  } catch {
    console.error('错误: public/uploads 目录不存在');
    process.exit(1);
  }
  console.log(`本地有 ${files.length} 个图片文件\n`);

  const urlMap = {};
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const blobPath = `uploads/${file}`;

    // 如果已存在，直接获取 URL
    if (existingNames.has(blobPath)) {
      const existingBlob = existingBlobs.blobs.find(b => b.pathname === blobPath);
      urlMap[`/uploads/${file}`] = existingBlob.url;
      skipped++;
      console.log(`⊘ ${file} (已存在，跳过)`);
      continue;
    }

    // 上传新文件
    const filePath = join(UPLOADS_DIR, file);
    const buffer = readFileSync(filePath);
    const ext = file.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml'
    }[ext] || 'image/jpeg';

    try {
      const blob = await put(blobPath, buffer, {
        access: 'public',
        token: PUBLIC_TOKEN,
        addRandomSuffix: false,
        contentType: mimeType,
      });
      urlMap[`/uploads/${file}`] = blob.url;
      uploaded++;
      console.log(`✓ ${file} -> ${blob.url}`);
    } catch (e) {
      failed++;
      console.error(`✗ ${file}: ${e.message}`);
    }
  }

  console.log(`\n=== 上传完成 ===`);
  console.log(`新上传: ${uploaded}, 跳过(已存在): ${skipped}, 失败: ${failed}`);

  // 保存 URL 映射
  const mapPath = join(process.cwd(), 'scripts', 'image-url-map.json');
  writeFileSync(mapPath, JSON.stringify(urlMap, null, 2), 'utf-8');
  console.log(`\nURL 映射已保存到: ${mapPath}`);

  // 验证：列出公开 Store 所有文件
  const finalList = await list({ token: PUBLIC_TOKEN, prefix: 'uploads/' });
  console.log(`\n公开 Blob Store 中共 ${finalList.blobs.length} 个文件`);
}

main().catch(e => {
  console.error('执行出错:', e);
  process.exit(1);
});
