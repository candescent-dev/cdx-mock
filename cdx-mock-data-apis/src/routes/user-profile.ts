import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { bearerMiddleware } from '../middleware/bearer.js'
import { getUserProfile } from '../data/users.js'

const app = new Hono<AppEnv>()

app.get('/protected/user-profile', bearerMiddleware, (c) => {
  const scenario = c.get('scenario')
  const profile = getUserProfile(scenario)

  if (!profile) {
    return c.json({ error: 'unauthorized', message: 'Invalid or expired token' }, 401)
  }

  return c.json(profile)
})

export default app
