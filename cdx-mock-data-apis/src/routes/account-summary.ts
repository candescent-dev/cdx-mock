import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { getAccountSummary } from '../data/accounts.js'

const app = new Hono<AppEnv>()

app.get('/demo/account-summary', (c) => {
  const scenario = c.get('scenario')
  return c.json(getAccountSummary(scenario))
})

export default app
