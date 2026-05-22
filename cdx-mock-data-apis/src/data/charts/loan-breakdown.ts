import type { ChartItem, ScenarioData } from '../types.js'

interface LoanDetail {
  name: string
  balance: number
  interestRate: number
  monthlyPayment: number
  payoffDate?: string
}

interface LoanBreakdownData {
  items: ChartItem[]
  loans: LoanDetail[]
  totalDebt: number
  totalMonthly: number
}

function fromLoans(loans: LoanDetail[]): LoanBreakdownData {
  const colors = ['#D32F2F', '#E53935', '#EF5350', '#F44336', '#FF5252', '#FF8A80']
  const items: ChartItem[] = loans.map((l, i) => ({
    label: l.name,
    value: l.balance,
    color: colors[i % colors.length],
  }))
  return {
    items,
    loans,
    totalDebt: loans.reduce((s, l) => s + l.balance, 0),
    totalMonthly: loans.reduce((s, l) => s + l.monthlyPayment, 0),
  }
}

const defaultLoans = fromLoans([
  { name: 'Mortgage', balance: 245000, interestRate: 6.25, monthlyPayment: 1850, payoffDate: '2053-04-01' },
  { name: 'Student Loan', balance: 28000, interestRate: 4.5, monthlyPayment: 310, payoffDate: '2034-08-01' },
  { name: 'Auto Loan', balance: 12500, interestRate: 5.9, monthlyPayment: 375, payoffDate: '2029-01-01' },
  { name: 'Credit Card', balance: 3200, interestRate: 21.99, monthlyPayment: 150 },
])

const studentHeavy = fromLoans([
  { name: 'Federal Subsidized', balance: 45000, interestRate: 3.73, monthlyPayment: 460, payoffDate: '2036-06-01' },
  { name: 'Federal Unsubsidized', balance: 22000, interestRate: 5.28, monthlyPayment: 235, payoffDate: '2036-06-01' },
  { name: 'Graduate PLUS', balance: 18000, interestRate: 6.28, monthlyPayment: 200, payoffDate: '2036-06-01' },
  { name: 'Private (SoFi)', balance: 15000, interestRate: 7.5, monthlyPayment: 180, payoffDate: '2034-01-01' },
])

const mortgageOnly = fromLoans([
  { name: 'Primary Mortgage', balance: 385000, interestRate: 5.75, monthlyPayment: 2650, payoffDate: '2054-09-01' },
])

const payoffPlan = fromLoans([
  { name: 'Credit Card #1', balance: 4200, interestRate: 22.99, monthlyPayment: 250, payoffDate: '2027-10-01' },
  { name: 'Credit Card #2', balance: 2800, interestRate: 19.99, monthlyPayment: 180, payoffDate: '2027-06-01' },
  { name: 'Personal Loan', balance: 8500, interestRate: 8.5, monthlyPayment: 320, payoffDate: '2028-09-01' },
  { name: 'Auto Loan', balance: 15000, interestRate: 5.9, monthlyPayment: 400, payoffDate: '2029-06-01' },
])

export const loanBreakdownScenarios: ScenarioData<LoanBreakdownData> = {
  default: defaultLoans,
  'student-heavy': studentHeavy,
  'mortgage-only': mortgageOnly,
  'debt-free': fromLoans([]),
  'payoff-plan': payoffPlan,
}
