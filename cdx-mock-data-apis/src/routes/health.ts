import { Hono } from 'hono'
import { datasetRegistry } from '../data/charts/index.js'

const app = new Hono()
const startTime = Date.now()

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    uptime: Math.round((Date.now() - startTime) / 1000),
    version: '0.1.0',
  })
})

app.get('/api/scenarios', (c) => {
  const chartData: Record<string, string[]> = {}
  for (const [name, entry] of Object.entries(datasetRegistry)) {
    chartData[name] = Object.keys(entry.scenarios)
  }

  return c.json({
    chartData,
    agentChat: ['default', 'echo', 'slow', 'error', 'long', 'empty'],
    userProfile: ['default', 'wealthy', 'minimal', 'no-auth', 'expired'],
    accountSummary: ['default', 'business', 'empty', 'many'],
    globalEdgeCases: ['empty', 'error', 'slow', 'malformed', 'huge'],
  })
})

export default app
