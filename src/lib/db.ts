// src/lib/db.ts

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

const client = globalThis.prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client

export default client
