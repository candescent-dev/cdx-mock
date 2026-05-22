import type { ChartItem, GoalDetail, ScenarioData } from '../types.js'

interface SavingsGoalsData {
  items: ChartItem[]
  goals: GoalDetail[]
}

function fromGoals(goals: GoalDetail[]): SavingsGoalsData {
  const colorScale = ['#1976D2', '#388E3C', '#FF9800', '#E91E63', '#7B1FA2', '#00BCD4']
  const items: ChartItem[] = goals.map((g, i) => ({
    label: g.name,
    value: g.current,
    color: colorScale[i % colorScale.length],
  }))
  return { items, goals }
}

const defaultGoals = fromGoals([
  { name: 'Emergency Fund', current: 8500, target: 15000, percentComplete: 57, targetDate: '2027-06-01', monthlyContribution: 500 },
  { name: 'Vacation', current: 2200, target: 3000, percentComplete: 73, targetDate: '2026-08-01', monthlyContribution: 300 },
  { name: 'New Car', current: 5000, target: 25000, percentComplete: 20, targetDate: '2028-01-01', monthlyContribution: 600 },
])

const almostDone = fromGoals([
  { name: 'Emergency Fund', current: 14200, target: 15000, percentComplete: 95, monthlyContribution: 500 },
  { name: 'Kitchen Remodel', current: 17500, target: 20000, percentComplete: 88, monthlyContribution: 800 },
  { name: 'Vacation', current: 2700, target: 3000, percentComplete: 90, monthlyContribution: 300 },
])

const justStarted = fromGoals([
  { name: 'Emergency Fund', current: 800, target: 15000, percentComplete: 5, monthlyContribution: 300 },
  { name: 'House Down Payment', current: 2000, target: 80000, percentComplete: 3, monthlyContribution: 1000 },
  { name: 'Vacation', current: 150, target: 3000, percentComplete: 5, monthlyContribution: 200 },
])

const singleGoal = fromGoals([
  { name: 'House Down Payment', current: 35000, target: 80000, percentComplete: 44, targetDate: '2028-06-01', monthlyContribution: 1500 },
])

const completed = fromGoals([
  { name: 'Emergency Fund', current: 15000, target: 15000, percentComplete: 100 },
  { name: 'Vacation', current: 3000, target: 3000, percentComplete: 100 },
  { name: 'New Laptop', current: 800, target: 1500, percentComplete: 53, monthlyContribution: 150 },
  { name: 'Car Repair Fund', current: 2000, target: 2000, percentComplete: 100 },
])

export const savingsGoalsScenarios: ScenarioData<SavingsGoalsData> = {
  default: defaultGoals,
  'almost-done': almostDone,
  'just-started': justStarted,
  'single-goal': singleGoal,
  completed,
}
