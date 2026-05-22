export { spendingScenarios } from './spending.js'
export { investmentPortfolioScenarios } from './investment-portfolio.js'
export { netWorthScenarios } from './net-worth.js'
export { incomeExpenseScenarios } from './income-expense.js'
export { savingsGoalsScenarios } from './savings-goals.js'
export { loanBreakdownScenarios } from './loan-breakdown.js'
export { creditScoreScenarios } from './credit-score.js'

export const datasetRegistry: Record<string, { scenarios: Record<string, unknown>; description: string }> = {
  spending: {
    scenarios: {} as Record<string, unknown>,
    description: 'Transaction spend by merchant category',
  },
  'investment-portfolio': {
    scenarios: {} as Record<string, unknown>,
    description: 'Investment allocation by asset class',
  },
  'net-worth': {
    scenarios: {} as Record<string, unknown>,
    description: 'Aggregated net worth across institutions',
  },
  'income-expense': {
    scenarios: {} as Record<string, unknown>,
    description: 'Monthly income vs expenses comparison',
  },
  'savings-goals': {
    scenarios: {} as Record<string, unknown>,
    description: 'Progress toward savings goals',
  },
  'loan-breakdown': {
    scenarios: {} as Record<string, unknown>,
    description: 'Debt distribution and payoff data',
  },
  'credit-score': {
    scenarios: {} as Record<string, unknown>,
    description: 'Credit score factors and history',
  },
}

import { spendingScenarios } from './spending.js'
import { investmentPortfolioScenarios } from './investment-portfolio.js'
import { netWorthScenarios } from './net-worth.js'
import { incomeExpenseScenarios } from './income-expense.js'
import { savingsGoalsScenarios } from './savings-goals.js'
import { loanBreakdownScenarios } from './loan-breakdown.js'
import { creditScoreScenarios } from './credit-score.js'

datasetRegistry['spending'].scenarios = spendingScenarios
datasetRegistry['investment-portfolio'].scenarios = investmentPortfolioScenarios
datasetRegistry['net-worth'].scenarios = netWorthScenarios
datasetRegistry['income-expense'].scenarios = incomeExpenseScenarios
datasetRegistry['savings-goals'].scenarios = savingsGoalsScenarios
datasetRegistry['loan-breakdown'].scenarios = loanBreakdownScenarios
datasetRegistry['credit-score'].scenarios = creditScoreScenarios
