# 瑞刹 RUISHA - 刹车片制造商多语言官网

基于 Next.js 14 + Prisma + next-intl 的多语言品牌官网，支持中/英/俄/法/西5种语言，含管理后台、产品管理、询盘管理、文案管理。

## 技术栈

- **框架**: Next.js 14 (App Router) + TypeScript
- **数据库**: Prisma ORM（本地 SQLite / 生产 PostgreSQL）
- **国际化**: next-intl v3
- **样式**: Tailwind CSS
- **认证**: NextAuth.js

## 本地开发

```bash
# 安装依赖
npm install

# 同步数据库 schema
npx prisma db push

# 初始化种子数据（管理员、分类、文案）
npm run db:seed

# 同步文案到数据库
npm run sync-translations

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 默认管理员账号
- 邮箱: admin@example.com
- 密码: admin123

## Vercel 部署步骤

### 1. 准备 PostgreSQL 数据库

推荐使用 [Neon](https://neon.tech) 或 [Supabase](https://supabase.com)（免费额度），创建后获取连接字符串：
```
postgresql://user:password@ep-xxx.neon.tech/dbname?schema=public
```

### 2. 切换 Prisma Schema 为 PostgreSQL

将 `prisma/schema.postgres.prisma` 内容覆盖到 `prisma/schema.prisma`：
```bash
cp prisma/schema.postgres.prisma prisma/schema.prisma
```

### 3. 在 Vercel 配置环境变量

在 Vercel 项目设置 → Environment Variables 中添加：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `NEXTAUTH_SECRET`: 强随机密钥（可用 `openssl rand -base64 32` 生成）
- `NEXT_PUBLIC_SITE_URL`: 你的域名（如 https://your-domain.com）

### 4. 初始化数据库

Vercel 首次部署后，通过 Prisma 初始化数据库表结构。可用 `npx prisma db push` 连接生产数据库执行，或使用 `npx prisma migrate deploy`。

### 5. 导入种子数据

连接生产数据库执行 seed：
```bash
DATABASE_URL="你的生产数据库URL" npm run db:seed
DATABASE_URL="你的生产数据库URL" npm run sync-translations
```

## 功能模块

| 模块 | 说明 |
|------|------|
| 多语言官网 | 5语言切换（中/英/俄/法/西），SEO优化 |
| 产品管理 | CRUD、多语言、分类、图片上传 |
| 询盘管理 | 前台表单提交、后台查看/状态管理 |
| 文案管理 | JSON格式统一管理，实时生效，JSON校验 |
| 站点设置 | 公司信息、WhatsApp、微信、Logo |

## 项目结构

```
src/
├── app/
│   ├── [locale]/          # 多语言路由
│   │   ├── page.tsx       # 首页
│   │   ├── products/      # 产品页
│   │   └── admin/         # 管理后台
│   │       ├── inquiries/ # 询盘管理
│   │       ├── translations/ # 文案管理
│   │       ├── products/  # 产品管理
│   │       ├── categories/# 分类管理
│   │       └── settings/  # 站点设置
│   └── api/               # API 路由
├── components/            # 组件
├── lib/                   # 工具库
└── messages/              # 多语言文案源文件
```

## Git 维护

```bash
# 克隆仓库
git clone <repo-url>

# 创建分支开发
git checkout -b feature/xxx

# 提交
git add .
git commit -m "feat: xxx"

# 推送
git push origin feature/xxx
```
