import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { Hono } from 'hono'
import { scenarioMiddleware } from './middleware/scenarios.js'
import chartDataRoutes from './routes/chart-data.js'
import agentChatRoutes from './routes/agent-chat.js'
import userProfileRoutes from './routes/user-profile.js'
import accountSummaryRoutes from './routes/account-summary.js'
import healthRoutes from './routes/health.js'
import { datasetRegistry } from './data/charts/index.js'

const app = new Hono()
app.use('*', scenarioMiddleware)
app.route('/api', chartDataRoutes)
app.route('/api', agentChatRoutes)
app.route('/api', userProfileRoutes)
app.route('/api', accountSummaryRoutes)
app.route('/', healthRoutes)

async function req(path: string, opts?: RequestInit) {
  return app.request(`http://localhost${path}`, opts)
}

describe('Health', () => {
  it('returns ok', async () => {
    const res = await req('/health')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.status, 'ok')
  })

  it('returns scenario discovery', async () => {
    const res = await req('/api/scenarios')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.chartData)
    assert.ok(Array.isArray(body.chartData.spending))
    assert.ok(body.agentChat)
    assert.ok(body.userProfile)
    assert.ok(body.accountSummary)
  })
})

describe('Chart Data', () => {
  const datasets = Object.keys(datasetRegistry)

  for (const dataset of datasets) {
    it(`GET /api/chart-data/${dataset} returns JSON`, async () => {
      const res = await req(`/api/chart-data/${dataset}`)
      assert.equal(res.status, 200)
      const body = await res.json()
      assert.ok(body !== null && body !== undefined)
    })

    const scenarios = Object.keys(datasetRegistry[dataset].scenarios)
    for (const scenario of scenarios) {
      it(`GET /api/chart-data/${dataset}?scenario=${scenario} returns JSON`, async () => {
        const res = await req(`/api/chart-data/${dataset}?scenario=${scenario}`)
        assert.equal(res.status, 200)
        const body = await res.json()
        assert.ok(body !== null && body !== undefined)
      })
    }
  }

  it('returns 404 for unknown dataset', async () => {
    const res = await req('/api/chart-data/nonexistent')
    assert.equal(res.status, 404)
  })

  it('handles empty scenario', async () => {
    const res = await req('/api/chart-data/spending?scenario=empty')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body))
    assert.equal(body.length, 0)
  })

  it('handles huge scenario', async () => {
    const res = await req('/api/chart-data/spending?scenario=huge')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body))
    assert.ok(body.length >= 50)
  })

  it('portfolio alias works', async () => {
    const res = await req('/api/portfolio')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body))
    assert.ok(body.length > 0)
  })
})

describe('Agent Chat', () => {
  it('responds to keyword message', async () => {
    const res = await req('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'what is my balance' }),
    })
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.reply.length > 0)
    assert.ok(body.reply.includes('4,237.82'))
  })

  it('returns fallback for unknown message', async () => {
    const res = await req('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'tell me a joke' }),
    })
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.reply.includes('rephrase'))
  })

  it('echo scenario returns message back', async () => {
    const res = await req('/api/agent/chat?scenario=echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello world' }),
    })
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.reply, 'hello world')
  })
})

describe('User Profile', () => {
  it('returns profile with Bearer token', async () => {
    const res = await req('/api/protected/user-profile', {
      headers: { Authorization: 'Bearer test-token-123' },
    })
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.user.name, 'Jane Doe')
  })

  it('returns 401 without token', async () => {
    const res = await req('/api/protected/user-profile')
    assert.equal(res.status, 401)
  })

  it('wealthy scenario returns multiple accounts', async () => {
    const res = await req('/api/protected/user-profile?scenario=wealthy', {
      headers: { Authorization: 'Bearer test-token' },
    })
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.accounts.length >= 4)
  })
})

describe('Account Summary', () => {
  it('returns default summary', async () => {
    const res = await req('/api/demo/account-summary')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.customerId)
    assert.ok(Array.isArray(body.accounts))
    assert.ok(body.accounts.length > 0)
  })

  it('empty scenario returns no accounts', async () => {
    const res = await req('/api/demo/account-summary?scenario=empty')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.accounts.length, 0)
  })

  it('many scenario returns 8+ accounts', async () => {
    const res = await req('/api/demo/account-summary?scenario=many')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(body.accounts.length >= 8)
  })
})

describe('Global Edge Cases', () => {
  it('error scenario returns 500', async () => {
    const res = await req('/api/chart-data/spending?scenario=error')
    assert.equal(res.status, 500)
  })

  it('malformed scenario returns non-array', async () => {
    const res = await req('/api/chart-data/spending?scenario=malformed')
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.data, 'not an array')
  })
})
