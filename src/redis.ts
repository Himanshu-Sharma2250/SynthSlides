import { Redis } from 'ioredis'

declare global {
  var __redis: Redis | undefined
}

export const redis =
  globalThis.__redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

if (process.env.NODE_ENV !== 'production') {
  globalThis.__redis = redis
}