import { logger } from 'hono/logger'

export const loggerMiddleware = logger((message) => {
  console.log(`  ${message}`)
})
