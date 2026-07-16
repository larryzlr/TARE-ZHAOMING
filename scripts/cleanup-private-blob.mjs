// 清理私有 Blob Store 中的所有残留图片
import { list, del } from '@vercel/blob';

const PRIVATE_TOKEN = process.env.PRIVATE_BLOB_TOKEN;
if (!PRIVATE_TOKEN) {
  console.error('错误: PRIVATE_BLOB_TOKEN 未设置');
  process.exit(1);
}

async function main() {
  console.log('列出私有 Blob Store 中的文件...');
  const result = await list({ token: PRIVATE_TOKEN, prefix: 'uploads/' });
  
  console.log(`找到 ${result.blobs.length} 个文件\n`);
  
  if (result.blobs.length === 0) {
    console.log('无需清理');
    return;
  }

  for (const blob of result.blobs) {
    try {
      await del(blob.url, { token: PRIVATE_TOKEN });
      console.log(`✓ 删除: ${blob.pathname}`);
    } catch (e) {
      console.error(`✗ 删除失败: ${blob.pathname}: ${e.message}`);
    }
  }

  // 验证
  const remaining = await list({ token: PRIVATE_TOKEN, prefix: 'uploads/' });
  console.log(`\n清理完成，剩余 ${remaining.blobs.length} 个文件`);
}

main().catch(e => { console.error('执行出错:', e); process.exit(1); });
