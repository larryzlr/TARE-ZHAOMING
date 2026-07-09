// scripts/pre-build.mjs
// Vercel 部署前自动切换到 PostgreSQL schema 并推送数据库结构

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.includes('neon.tech') || dbUrl.includes('postgresql://')) {
  console.log('🔧 检测到 PostgreSQL 环境，切换 schema...');
  
  // 复制 PostgreSQL schema 覆盖当前 schema
  const pgSchema = readFileSync(resolve(root, 'prisma/schema.postgres.prisma'), 'utf-8');
  writeFileSync(resolve(root, 'prisma/schema.prisma'), pgSchema);
  console.log('✅ 已切换到 PostgreSQL schema (含 driverAdapters)');
  
  // 推送 schema 到数据库
  try {
    console.log('📦 推送数据库结构...');
    execSync('npx prisma db push --accept-data-loss', { 
      cwd: root, 
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('✅ 数据库结构推送完成');
  } catch (e) {
    console.warn('⚠️ 数据库推送失败（可能已存在）：', e.message);
  }
} else {
  console.log('📦 使用默认 SQLite schema');
}
