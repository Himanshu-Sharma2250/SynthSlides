import { createMiddleware } from '@tanstack/react-start'
import { redis } from '#/redis'

const TOKEN_BUCKET_LUA = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refill_rate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requested = tonumber(ARGV[4])

  -- Get current state
  local data = redis.call('HMGET', key, 'tokens', 'last_updated')
  local tokens = tonumber(data[1])
  local last_updated = tonumber(data[2])

  if not tokens then
    -- First request, initialize bucket to full capacity
    tokens = capacity
    last_updated = now
  else
    -- Calculate elapsed time and add refilled tokens
    local elapsed = math.max(0, now - last_updated)
    tokens = math.min(capacity, tokens + (elapsed * refill_rate))
    last_updated = now
  end

  -- Check if bucket has enough tokens
  if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
    redis.call('EXPIRE', key, 86400)
    return {1, 0} -- Allowed
  else
    -- Calculate remaining wait time in seconds
    local missing = requested - tokens
    local wait_time = math.ceil(missing / refill_rate)
    
    -- Save the refilled amount and deny
    redis.call('HMSET', key, 'tokens', tokens, 'last_updated', last_updated)
    redis.call('EXPIRE', key, 86400)
    return {0, wait_time} -- Blocked, returning remaining wait time
  end
`

function formatWaitTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
}

export const rateLimitMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ next, context }) => {
    const userId = (context as any)?.session?.user?.id

    if (!userId) {
      throw new Error('Unauthorized')
    }

    const key = `ratelimit:tokenbucket:${userId}`
    const capacity = 3
    const refillRate = 3 / 86400 // 3 tokens per 24 hours (1 token every 8 hours)
    const now = Math.floor(Date.now() / 1000)
    const requested = 1

    const result = (await redis.eval(
      TOKEN_BUCKET_LUA,
      1,
      key,
      capacity.toString(),
      refillRate.toString(),
      now.toString(),
      requested.toString(),
    )) as [number, number]

    const [allowed, waitTimeSeconds] = result

    if (allowed !== 1) {
      const waitMessage = formatWaitTime(waitTimeSeconds)
      throw new Error(
        `Rate limit exceeded: You have reached your limit of 3 presentations. Please try again in ${waitMessage}.`
      )
    }

    return next()
  },
)
