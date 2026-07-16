// 临时脚本：更新管理员密码为 Admin123（支持 Neon PostgreSQL 生产库）
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('错误: DATABASE_URL 未设置');
    process.exit(1);
  }

  console.log('连接数据库...');
  const sql = neon(connectionString);

  const hashedPassword = await bcrypt.hash('Admin123', 10);
  const newId = crypto.randomUUID();

  // 使用 INSERT ... ON CONFLICT 实现 upsert
  await sql`
    INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
    VALUES (${newId}, 'admin@example.com', 'Admin User', ${hashedPassword}, 'admin', NOW(), NOW())
    ON CONFLICT (email)
    DO UPDATE SET password = ${hashedPassword}, "updatedAt" = NOW()
  `;

  // 验证结果
  const users = await sql`SELECT email, role, "updatedAt" FROM users WHERE email = 'admin@example.com'`;
  if (users.length > 0) {
    console.log('✅ 密码已成功更新为: Admin123');
    console.log('   邮箱:', users[0].email);
    console.log('   角色:', users[0].role);
    console.log('   更新时间:', users[0].updatedAt);
  } else {
    console.error('❌ 更新失败: 未找到用户记录');
    process.exit(1);
  }
}

main().catch(e => {
  console.error('执行出错:', e);
  process.exit(1);
});
