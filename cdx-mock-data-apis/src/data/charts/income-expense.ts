import type { ChartItem, ScenarioData } from '../types.js'

const defaultIncome: ChartItem[] = [
  { label: 'Salary', value: 5500, color: '#388E3C' },
  { label: 'Freelance', value: 1200, color: '#66BB6A' },
]

const defaultExpenses: ChartItem[] = [
  { label: 'Rent', value: 1800, color: '#D32F2F' },
  { label: 'Groceries', value: 600, color: '#E53935' },
  { label: 'Transport', value: 300, color: '#EF5350' },
  { label: 'Utilities', value: 250, color: '#F44336' },
  { label: 'Other', value: 800, color: '#FF5252' },
]

interface IncomeExpenseData {
  income: ChartItem[]
  expenses: ChartItem[]
  netSavings: number
  savingsRate: number
}

function build(income: ChartItem[], expenses: ChartItem[]): IncomeExpenseData {
  const totalIncome = income.reduce((s, i) => s + i.value, 0)
  const totalExpenses = expenses.reduce((s, i) => s + i.value, 0)
  const netSavings = totalIncome - totalExpenses
  return { income, expenses, netSavings, savingsRate: Math.round((netSavings / totalIncome) * 100) }
}

const tight = build(
  [{ label: 'Salary', value: 3800, color: '#388E3C' }],
  [
    { label: 'Rent', value: 1400, color: '#D32F2F' },
    { label: 'Groceries', value: 550, color: '#E53935' },
    { label: 'Transport', value: 350, color: '#EF5350' },
    { label: 'Utilities', value: 280, color: '#F44336' },
    { label: 'Insurance', value: 450, color: '#FF5252' },
    { label: 'Debt Payment', value: 600, color: '#C62828' },
  ],
)

const surplus = build(
  [
    { label: 'Salary', value: 9500, color: '#388E3C' },
    { label: 'Bonus', value: 2000, color: '#66BB6A' },
    { label: 'Dividends', value: 800, color: '#81C784' },
  ],
  [
    { label: 'Mortgage', value: 2200, color: '#D32F2F' },
    { label: 'Groceries', value: 800, color: '#E53935' },
    { label: 'Utilities', value: 350, color: '#EF5350' },
    { label: 'Dining', value: 600, color: '#F44336' },
    { label: 'Other', value: 1200, color: '#FF5252' },
  ],
)

const deficit = build(
  [{ label: 'Salary', value: 3200, color: '#388E3C' }],
  [
    { label: 'Rent', value: 1600, color: '#D32F2F' },
    { label: 'Groceries', value: 500, color: '#E53935' },
    { label: 'Medical', value: 850, color: '#EF5350' },
    { label: 'Debt Payment', value: 400, color: '#C62828' },
    { label: 'Utilities', value: 280, color: '#F44336' },
  ],
)

const variableIncome = build(
  [
    { label: 'Gig Work (avg)', value: 4500, color: '#388E3C' },
    { label: 'Side Project', value: 1200, color: '#66BB6A' },
  ],
  [
    { label: 'Rent', value: 1500, color: '#D32F2F' },
    { label: 'Groceries', value: 450, color: '#E53935' },
    { label: 'Transport', value: 200, color: '#EF5350' },
    { label: 'Insurance', value: 380, color: '#F44336' },
    { label: 'Other', value: 500, color: '#FF5252' },
  ],
)

const multiIncome = build(
  [
    { label: 'Salary (Primary)', value: 6200, color: '#388E3C' },
    { label: 'Salary (Partner)', value: 5800, color: '#66BB6A' },
    { label: 'Rental Income', value: 1500, color: '#81C784' },
  ],
  [
    { label: 'Mortgage', value: 2800, color: '#D32F2F' },
    { label: 'Childcare', value: 2200, color: '#E53935' },
    { label: 'Groceries', value: 1100, color: '#EF5350' },
    { label: 'Transport', value: 600, color: '#F44336' },
    { label: 'Utilities', value: 400, color: '#FF5252' },
    { label: 'Other', value: 1500, color: '#FF8A80' },
  ],
)

export const incomeExpenseScenarios: ScenarioData<IncomeExpenseData> = {
  default: build(defaultIncome, defaultExpenses),
  tight,
  surplus,
  deficit,
  'variable-income': variableIncome,
  'multi-income': multiIncome,
}
