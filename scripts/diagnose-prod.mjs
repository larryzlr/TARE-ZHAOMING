// 诊断生产数据库：用户记录和siteConfig配置
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('DATABASE_URL 未设置'); process.exit(1); }
const sql = neon(connectionString);

async function main() {
  // 1. 用户表
  console.log('=== 用户表 ===');
  const users = await sql`SELECT id, email, name, role, LEFT(password, 30) as pwd_prefix, "updatedAt" FROM users`;
  for (const u of users) {
    console.log(`  ${u.email} | ${u.role} | pwd前缀: ${u.pwd_prefix}... | 更新: ${u.updatedAt}`);
  }
  if (users.length === 0) console.log('  ❌ 无用户记录!');

  // 2. 测试密码验证
  console.log('\n=== 密码验证测试 ===');
  const admin = users.find(u => u.email === 'admin@example.com');
  if (admin) {
    const fullUser = await sql`SELECT password FROM users WHERE email = 'admin@example.com'`;
    const hash = fullUser[0].password;
    const match = await bcrypt.compare('Admin123', hash);
    console.log(`  密码 'Admin123' 匹配: ${match ? '✅' : '❌'}`);
    console.log(`  hash 长度: ${hash.length}, 以 $2 开头: ${hash.startsWith('$2')}`);
  }

  // 3. siteConfig 所有键
  console.log('\n=== siteConfig 所有键 ===');
  const configs = await sql`SELECT key, lang, LEFT(value, 100) as val FROM site_configs ORDER BY key, lang`;
  for (const c of configs) {
    console.log(`  ${c.key} (${c.lang}): ${c.val}`);
  }
  console.log(`共 ${configs.length} 条`);

  // 4. 检查图片相关配置
  console.log('\n=== 图片相关配置 ===');
  const imageConfigs = await sql`
    SELECT key, lang, LEFT(value, 150) as val FROM site_configs 
    WHERE key LIKE '%bg%' OR key LIKE '%image%' OR key LIKE '%logo%' OR key LIKE '%qr%'
    ORDER BY key, lang
  `;
  for (const c of imageConfigs) {
    console.log(`  ${c.key} (${c.lang}): ${c.val}`);
  }
}

main().catch(e => { console.error('执行出错:', e); process.exit(1); });
