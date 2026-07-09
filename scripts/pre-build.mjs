// scripts/pre-build.mjs
// Vercel 部署前自动切换到 PostgreSQL schema

import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.includes('neon.tech') || dbUrl.includes('postgresql://')) {
  console.log('🔧 检测到 PostgreSQL 环境，切换 schema...');
  
  // 复制 PostgreSQL schema 覆盖当前 schema
  const pgSchema = readFileSync(resolve(root, 'prisma/schema.postgres.prisma'), 'utf-8');
  writeFileSync(resolve(root, 'prisma/schema.prisma'), pgSchema);
  console.log('✅ 已切换到 PostgreSQL schema (含 driverAdapters)');
} else {
  console.log('📦 使用默认 SQLite schema');
}
