import type { ChartItem, ChartResponse, ScenarioData } from '../types.js'

const COLORS = {
  groceries: '#4CAF50',
  dining: '#FF9800',
  transport: '#2196F3',
  utilities: '#9C27B0',
  entertainment: '#E91E63',
  shopping: '#00BCD4',
  healthcare: '#795548',
  housing: '#607D8B',
  travel: '#F44336',
  luxury: '#FFD700',
  subscriptions: '#3F51B5',
  education: '#009688',
}

const monthly: ChartItem[] = [
  { label: 'Groceries', value: 1240, color: COLORS.groceries },
  { label: 'Dining', value: 680, color: COLORS.dining },
  { label: 'Transport', value: 420, color: COLORS.transport },
  { label: 'Utilities', value: 310, color: COLORS.utilities },
  { label: 'Entertainment', value: 275, color: COLORS.entertainment },
  { label: 'Shopping', value: 520, color: COLORS.shopping },
  { label: 'Healthcare', value: 180, color: COLORS.healthcare },
]

const quarterly: ChartItem[] = monthly.map((i) => ({ ...i, value: i.value * 3.1 }))

const frugal: ChartItem[] = [
  { label: 'Groceries', value: 420, color: COLORS.groceries },
  { label: 'Dining', value: 85, color: COLORS.dining },
  { label: 'Transport', value: 120, color: COLORS.transport },
  { label: 'Utilities', value: 280, color: COLORS.utilities },
  { label: 'Subscriptions', value: 45, color: COLORS.subscriptions },
  { label: 'Healthcare', value: 60, color: COLORS.healthcare },
]

const highRoller: ChartItem[] = [
  { label: 'Travel', value: 3200, color: COLORS.travel },
  { label: 'Dining', value: 2100, color: COLORS.dining },
  { label: 'Luxury', value: 1800, color: COLORS.luxury },
  { label: 'Shopping', value: 1500, color: COLORS.shopping },
  { label: 'Entertainment', value: 1200, color: COLORS.entertainment },
  { label: 'Groceries', value: 900, color: COLORS.groceries },
  { label: 'Transport', value: 650, color: COLORS.transport },
  { label: 'Healthcare', value: 400, color: COLORS.healthcare },
]

const singleCategory: ChartItem[] = [
  { label: 'Housing/Rent', value: 2800, color: COLORS.housing },
  { label: 'Utilities', value: 85, color: COLORS.utilities },
  { label: 'Groceries', value: 60, color: COLORS.groceries },
  { label: 'Other', value: 55, color: COLORS.transport },
]

const trendingUp: ChartResponse = {
  items: monthly,
  period: { from: '2026-03-01', to: '2026-03-31' },
  total: monthly.reduce((s, i) => s + i.value, 0),
  previousPeriod: {
    items: monthly.map((i) => ({ ...i, value: Math.round(i.value * 0.88) })),
    total: Math.round(monthly.reduce((s, i) => s + i.value, 0) * 0.88),
  },
}

const trendingDown: ChartResponse = {
  items: monthly.map((i) => ({ ...i, value: Math.round(i.value * 0.85) })),
  period: { from: '2026-03-01', to: '2026-03-31' },
  total: Math.round(monthly.reduce((s, i) => s + i.value, 0) * 0.85),
  previousPeriod: {
    items: monthly,
    total: monthly.reduce((s, i) => s + i.value, 0),
  },
}

export const spendingScenarios: ScenarioData<ChartItem[] | ChartResponse> = {
  default: monthly,
  quarterly,
  frugal,
  'high-roller': highRoller,
  'single-category': singleCategory,
  'trending-up': trendingUp,
  'trending-down': trendingDown,
}
