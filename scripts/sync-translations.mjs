// scripts/sync-translations.mjs
// 将 src/messages/*.json 同步到数据库 Translation 表
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const LOCALES = ['en', 'zh', 'ru', 'fr', 'es'];
const messagesDir = join(__dirname, '..', 'src', 'messages');

async function main() {
  for (const lang of LOCALES) {
    const filePath = join(messagesDir, `${lang}.json`);
    const content = readFileSync(filePath, 'utf-8');
    // 验证 JSON
    JSON.parse(content);
    await prisma.translation.upsert({
      where: { lang },
      update: { content },
      create: { lang, content },
    });
    console.log(`Synced ${lang}: ${content.length} bytes`);
  }
  console.log('All translations synced.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
