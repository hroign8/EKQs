import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set')
    throw new Error('DATABASE_URL environment variable is not set. Please add it to your Vercel environment variables.')
  }

  // Append MongoDB driver-level timeouts so the Prisma client never hangs
  // indefinitely when Atlas is cold-starting or on a slow connection.
  // Only added if the caller hasn't already set them in the connection string.
  let url = process.env.DATABASE_URL
  const hasTimeout = url.includes('connectTimeoutMS') || url.includes('serverSelectionTimeoutMS')
  if (!hasTimeout) {
    const sep = url.includes('?') ? '&' : '?'
    url += `${sep}connectTimeoutMS=10000&serverSelectionTimeoutMS=10000&socketTimeoutMS=30000`
  }

  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
