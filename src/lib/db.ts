// src/lib/db.ts
// 懒加载 PrismaClient，避免构建时初始化导致 Vercel 构建失败

import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  // 如果是 PostgreSQL（Vercel/Neon），使用 Neon 适配器
  if (connectionString?.includes('neon.tech') || connectionString?.includes('postgresql://')) {
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');

    // 仅在 Node.js 环境中设置 WebSocket（Vercel serverless 需要）
    if (typeof window === 'undefined') {
      try {
        neonConfig.webSocketConstructor = require('ws');
      } catch {
        // Vercel Edge Runtime 不需要 ws
      }
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new (PrismaClient as any)({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }) as PrismaClient
  }

  // SQLite（本地开发）
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: connectionString,
      },
    },
  })
}

function getClient(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = createPrismaClient()
  }
  return globalThis.prisma
}

// 使用 Proxy 实现懒加载：模块加载时不创建 PrismaClient，首次访问属性时才创建
const lazyPrisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string) {
    const client = getClient()
    const value = Reflect.get(client, prop)
    return typeof value === 'function' ? value.bind(client) : value
  }
})

export default lazyPrisma
