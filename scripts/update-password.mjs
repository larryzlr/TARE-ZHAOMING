// 临时脚本：更新管理员密码为 Admin123
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin'
    }
  });
  console.log('密码已更新为: Admin123');
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
