import type { ChartItem, ScenarioData } from '../types.js'

interface CreditScoreData {
  score: number
  rating: string
  factors: ChartItem[]
  history: { month: string; score: number }[]
}

function build(
  score: number,
  rating: string,
  factors: ChartItem[],
  historyBase: number,
  trend: number,
): CreditScoreData {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const history = months.map((m, i) => ({
    month: m,
    score: Math.round(historyBase + trend * i + (Math.random() * 6 - 3)),
  }))
  return { score, rating, factors, history }
}

const defaultData = build(742, 'Good', [
  { label: 'Payment History', value: 35, color: '#388E3C' },
  { label: 'Credit Utilization', value: 30, color: '#1976D2' },
  { label: 'Length of History', value: 15, color: '#FF9800' },
  { label: 'New Credit', value: 10, color: '#7B1FA2' },
  { label: 'Credit Mix', value: 10, color: '#00BCD4' },
], 730, 2)

const excellent = build(812, 'Excellent', [
  { label: 'Payment History', value: 35, color: '#388E3C' },
  { label: 'Credit Utilization', value: 30, color: '#388E3C' },
  { label: 'Length of History', value: 15, color: '#388E3C' },
  { label: 'New Credit', value: 10, color: '#388E3C' },
  { label: 'Credit Mix', value: 10, color: '#388E3C' },
], 800, 2)

const poor = build(580, 'Poor', [
  { label: 'Payment History', value: 35, color: '#D32F2F' },
  { label: 'Credit Utilization', value: 30, color: '#D32F2F' },
  { label: 'Length of History', value: 15, color: '#FF9800' },
  { label: 'New Credit', value: 10, color: '#D32F2F' },
  { label: 'Credit Mix', value: 10, color: '#FF9800' },
], 590, -2)

const building = build(650, 'Fair', [
  { label: 'Payment History', value: 35, color: '#388E3C' },
  { label: 'Credit Utilization', value: 30, color: '#FF9800' },
  { label: 'Length of History', value: 15, color: '#D32F2F' },
  { label: 'New Credit', value: 10, color: '#FF9800' },
  { label: 'Credit Mix', value: 10, color: '#D32F2F' },
], 620, 5)

export const creditScoreScenarios: ScenarioData<CreditScoreData> = {
  default: defaultData,
  excellent,
  poor,
  building,
}
