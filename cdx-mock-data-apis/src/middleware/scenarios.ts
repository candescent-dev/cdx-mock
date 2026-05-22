import type { Context, Next } from 'hono'
import type { AppEnv } from '../env.js'

export async function scenarioMiddleware(c: Context<AppEnv>, next: Next) {
  const scenario =
    c.req.query('scenario') ??
    c.req.header('X-Mock-Scenario') ??
    'default'

  c.set('scenario', scenario)

  if (scenario === 'slow') {
    await new Promise((r) => setTimeout(r, 2500))
  }

  if (scenario === 'error') {
    return c.json({ error: 'internal_server_error', message: 'Simulated server error' }, 500)
  }

  if (scenario === 'malformed') {
    return c.json({ data: 'not an array' })
  }

  await next()
}
