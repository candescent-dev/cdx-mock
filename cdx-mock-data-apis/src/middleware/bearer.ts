import type { Context, Next } from 'hono'
import type { AppEnv } from '../env.js'

export async function bearerMiddleware(c: Context<AppEnv>, next: Next) {
  const scenario = c.get('scenario')

  if (scenario === 'no-auth') {
    return c.json({ error: 'unauthorized', message: 'Bearer token required' }, 401)
  }

  if (scenario === 'expired') {
    return c.json({ error: 'token_expired', message: 'Access token has expired' }, 401)
  }

  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'unauthorized', message: 'Bearer token required' }, 401)
  }

  await next()
}
