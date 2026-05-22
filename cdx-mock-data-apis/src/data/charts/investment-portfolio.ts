import type { ChartItem, ScenarioData } from '../types.js'

const balanced: ChartItem[] = [
  { label: 'US Stocks', value: 42, color: '#1976D2' },
  { label: 'Bonds', value: 28, color: '#388E3C' },
  { label: 'Cash & Equivalents', value: 18, color: '#FBC02D' },
  { label: 'Real Estate (REITs)', value: 12, color: '#E64A19' },
]

const aggressive: ChartItem[] = [
  { label: 'US Stocks', value: 55, color: '#1976D2' },
  { label: 'Crypto', value: 15, color: '#FF6F00' },
  { label: 'Emerging Markets', value: 12, color: '#00897B' },
  { label: 'Tech ETFs', value: 10, color: '#7B1FA2' },
  { label: 'Cash', value: 8, color: '#FBC02D' },
]

const conservative: ChartItem[] = [
  { label: 'Bonds', value: 40, color: '#388E3C' },
  { label: 'CDs', value: 20, color: '#5D4037' },
  { label: 'Money Market', value: 15, color: '#00ACC1' },
  { label: 'Cash', value: 15, color: '#FBC02D' },
  { label: 'Dividend Stocks', value: 10, color: '#1976D2' },
]

const retirement: ChartItem[] = [
  { label: 'US Equity', value: 35, color: '#1976D2' },
  { label: 'International Equity', value: 25, color: '#00897B' },
  { label: 'Bonds', value: 30, color: '#388E3C' },
  { label: 'TIPS', value: 10, color: '#FF8F00' },
]

const single: ChartItem[] = [
  { label: 'S&P 500 Index', value: 100, color: '#1976D2' },
]

const large: ChartItem[] = [
  { label: 'US Large Cap', value: 18, color: '#1976D2' },
  { label: 'US Small Cap', value: 8, color: '#42A5F5' },
  { label: 'International Dev.', value: 12, color: '#00897B' },
  { label: 'Emerging Markets', value: 6, color: '#26A69A' },
  { label: 'US Govt Bonds', value: 10, color: '#388E3C' },
  { label: 'Corporate Bonds', value: 8, color: '#66BB6A' },
  { label: 'High Yield', value: 4, color: '#AED581' },
  { label: 'Real Estate', value: 7, color: '#E64A19' },
  { label: 'Commodities', value: 5, color: '#FF8F00' },
  { label: 'Crypto', value: 3, color: '#FF6F00' },
  { label: 'Cash', value: 9, color: '#FBC02D' },
  { label: 'Private Equity', value: 6, color: '#7B1FA2' },
  { label: 'Infrastructure', value: 4, color: '#607D8B' },
]

export const investmentPortfolioScenarios: ScenarioData = {
  default: balanced,
  aggressive,
  conservative,
  retirement,
  single,
  large,
  empty: [],
}
