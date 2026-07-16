// src/lib/db.ts
// PrismaClient 懒加载：模块加载时不创建实例，首次访问属性时才创建
// 兼容本地 SQLite 和生产 Neon PostgreSQL

import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Prisma 5.x 直接支持 PostgreSQL 连接字符串
  // Neon pooler (pgbouncer) 支持 prepared statement，可直接用标准 Prisma 客户端
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
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
