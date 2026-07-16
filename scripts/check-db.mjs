// 临时脚本：检查生产数据库表结构
import { neon } from '@neondatabase/serverless';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('错误: DATABASE_URL 未设置');
    process.exit(1);
  }

  const sql = neon(connectionString);

  // 查询所有表
  const tables = await sql`
    SELECT table_name, table_schema 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    ORDER BY table_schema, table_name
  `;

  console.log('=== 数据库中的表 ===');
  if (tables.length === 0) {
    console.log('（无表 - 数据库为空）');
  } else {
    for (const t of tables) {
      console.log(`  ${t.table_schema}.${t.table_name}`);
    }
  }

  // 查询 _prisma_migrations 表（如果存在）
  try {
    const migrations = await sql`SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5`;
    console.log('\n=== Prisma 迁移记录 ===');
    for (const m of migrations) {
      console.log(`  ${m.migration_name} - ${m.finished_at}`);
    }
  } catch {
    console.log('\n（无 _prisma_migrations 表）');
  }
}

main().catch(e => {
  console.error('执行出错:', e);
  process.exit(1);
});
