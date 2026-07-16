/**
 * 同步翻译：将 src/messages/*.json 的内容更新到数据库 Translation 表
 * 用法：node scripts/sync-translations.mjs
 */
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const prisma = new PrismaClient();
const langs = ['en', 'zh', 'ru', 'fr', 'es'];

async function main() {
  for (const lang of langs) {
    const filePath = path.join(projectRoot, 'src', 'messages', `${lang}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    const jsonStr = JSON.stringify(parsed);

    await prisma.translation.upsert({
      where: { lang },
      update: { content: jsonStr },
      create: { lang, content: jsonStr },
    });
    console.log(`✅ 已同步翻译: ${lang}`);
  }
  console.log('\n所有翻译已同步到数据库');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error('同步失败:', e);
    process.exit(1);
  });
