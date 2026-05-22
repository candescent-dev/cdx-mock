import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { datasetRegistry } from '../data/charts/index.js'

const app = new Hono<AppEnv>()

function resolve(scenarios: Record<string, unknown>, scenario: string): unknown {
  const data = scenarios[scenario] ?? scenarios['default']
  return typeof data === 'function' ? (data as () => unknown)() : data
}

function generateHuge(): { label: string; value: number; color: string }[] {
  const categories = [
    'Groceries', 'Dining', 'Transport', 'Utilities', 'Entertainment', 'Shopping',
    'Healthcare', 'Education', 'Travel', 'Housing', 'Insurance', 'Subscriptions',
    'Gifts', 'Pets', 'Fitness', 'Clothing', 'Electronics', 'Home Improvement',
    'Auto', 'Charity', 'Kids', 'Beauty', 'Office', 'Telecom',
    'Books', 'Garden', 'Pharmacy', 'Laundry', 'Parking', 'Tolls',
    'Streaming', 'Coffee', 'Fast Food', 'Alcohol', 'Tobacco',
    'Lottery', 'Hobbies', 'Photography', 'Music', 'Art',
    'Legal', 'Tax Prep', 'Storage', 'Moving', 'Cleaning',
    'Printing', 'Postage', 'Bank Fees', 'ATM Fees', 'Misc',
  ]
  const colors = ['#1976D2', '#388E3C', '#FF9800', '#E91E63', '#7B1FA2', '#00BCD4', '#D32F2F', '#795548']
  return categories.map((label, i) => ({
    label,
    value: Math.round(50 + Math.random() * 2000),
    color: colors[i % colors.length],
  }))
}

app.get('/chart-data/:dataset', (c) => {
  const dataset = c.req.param('dataset')
  const scenario = c.get('scenario')

  if (scenario === 'empty') return c.json([])
  if (scenario === 'huge') return c.json(generateHuge())

  const entry = datasetRegistry[dataset]
  if (!entry) {
    return c.json(
      { error: 'not_found', message: `Dataset "${dataset}" not found`, available: Object.keys(datasetRegistry) },
      404,
    )
  }

  return c.json(resolve(entry.scenarios, scenario))
})

app.get('/portfolio', (c) => {
  const scenario = c.get('scenario')
  if (scenario === 'empty') return c.json([])
  if (scenario === 'huge') return c.json(generateHuge())

  const entry = datasetRegistry['investment-portfolio']
  return c.json(resolve(entry.scenarios, scenario))
})

export default app
