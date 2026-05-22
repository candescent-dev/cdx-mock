import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { getAgentReply } from '../data/agents.js'

const app = new Hono<AppEnv>()

app.post('/agent/chat', async (c) => {
  const scenario = c.get('scenario')
  const body = await c.req.json<{ message?: string }>().catch(() => ({}))
  const message = body.message ?? ''

  if (!message && scenario === 'default') {
    return c.json({ error: 'bad_request', message: 'Missing "message" field in request body' }, 400)
  }

  return c.json(getAgentReply(message, scenario))
})

export default app
