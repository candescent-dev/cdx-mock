import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import type { AppEnv } from './env.js'
import { corsMiddleware } from './middleware/cors.js'
import { loggerMiddleware } from './middleware/logger.js'
import { scenarioMiddleware } from './middleware/scenarios.js'
import chartDataRoutes from './routes/chart-data.js'
import agentChatRoutes from './routes/agent-chat.js'
import userProfileRoutes from './routes/user-profile.js'
import accountSummaryRoutes from './routes/account-summary.js'
import healthRoutes from './routes/health.js'
import { datasetRegistry } from './data/charts/index.js'

const app = new Hono<AppEnv>()

app.use('*', corsMiddleware)
app.use('*', loggerMiddleware)
app.use('*', scenarioMiddleware)

app.route('/api', chartDataRoutes)
app.route('/api', agentChatRoutes)
app.route('/api', userProfileRoutes)
app.route('/api', accountSummaryRoutes)
app.route('/', healthRoutes)

app.get('/investment-portfolio', (c) => {
  const scenario = c.get('scenario')
  const entry = datasetRegistry['investment-portfolio']
  const data = entry.scenarios[scenario] ?? entry.scenarios['default']
  return c.json(typeof data === 'function' ? (data as () => unknown)() : data)
})

const PORT = Number(process.env.PORT) || 4010

function printBanner() {
  const reset = '\x1b[0m'
  const bold = '\x1b[1m'
  const cyan = '\x1b[36m'
  const dim = '\x1b[2m'
  const green = '\x1b[32m'
  const yellow = '\x1b[33m'

  const lines: string[] = []
  lines.push('')
  lines.push(`  ${bold}${cyan}cdx-mock-data-apis${reset}  ${dim}v0.1.0${reset}`)
  lines.push(`  ${green}http://localhost:${PORT}${reset}`)
  lines.push('')
  lines.push(`  ${bold}Chart Data${reset} ${dim}(GET /api/chart-data/:dataset)${reset}`)

  for (const [name, entry] of Object.entries(datasetRegistry)) {
    const count = Object.keys(entry.scenarios).length
    lines.push(`    ${yellow}${name.padEnd(24)}${reset}${dim}${count} scenarios${reset}`)
  }

  lines.push('')
  lines.push(`  ${bold}Other Routes${reset}`)
  lines.push(`    ${dim}GET ${reset} /api/portfolio                ${dim}(alias → investment-portfolio)${reset}`)
  lines.push(`    ${dim}GET ${reset} /investment-portfolio          ${dim}(alias → investment-portfolio)${reset}`)
  lines.push(`    ${dim}POST${reset} /api/agent/chat                ${dim}6 scenarios${reset}`)
  lines.push(`    ${dim}GET ${reset} /api/protected/user-profile    ${dim}5 scenarios (Bearer required)${reset}`)
  lines.push(`    ${dim}GET ${reset} /api/demo/account-summary      ${dim}4 scenarios${reset}`)
  lines.push(`    ${dim}GET ${reset} /api/scenarios                 ${dim}(discovery)${reset}`)
  lines.push(`    ${dim}GET ${reset} /health`)
  lines.push('')
  lines.push(`  ${dim}Use ?scenario=<name> or X-Mock-Scenario header${reset}`)
  lines.push(`  ${dim}Global edge-case scenarios: empty, error, slow, malformed, huge${reset}`)
  lines.push('')

  console.log(lines.join('\n'))
}

serve({ fetch: app.fetch, port: PORT, hostname: '127.0.0.1' }, () => {
  printBanner()
})
