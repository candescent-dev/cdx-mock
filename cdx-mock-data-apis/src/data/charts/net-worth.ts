import type { ChartItem, NetWorthResponse, ScenarioData } from '../types.js'

const defaultItems: ChartItem[] = [
  { label: 'Local Checking', value: 4200, color: '#1976D2' },
  { label: 'Local Savings', value: 15800, color: '#42A5F5' },
  { label: 'External Savings (BofA)', value: 8500, color: '#00897B' },
  { label: '401(k)', value: 125000, color: '#388E3C' },
  { label: 'Roth IRA', value: 42000, color: '#66BB6A' },
  { label: 'Home Equity', value: 180000, color: '#E64A19' },
  { label: 'Auto Loan', value: -12500, color: '#D32F2F' },
  { label: 'Student Loan', value: -28000, color: '#C62828' },
]

const defaultResponse: NetWorthResponse = {
  items: defaultItems,
  sources: [
    {
      institution: 'Local Credit Union',
      accounts: [
        { name: 'Checking', balance: 4200, type: 'checking' },
        { name: 'Savings', balance: 15800, type: 'savings' },
      ],
    },
    {
      institution: 'Bank of America',
      accounts: [{ name: 'Savings', balance: 8500, type: 'savings' }],
    },
    {
      institution: 'Fidelity',
      accounts: [
        { name: '401(k)', balance: 125000, type: 'retirement' },
        { name: 'Roth IRA', balance: 42000, type: 'retirement' },
      ],
    },
  ],
  totals: { assets: 375500, liabilities: 40500, net: 335000 },
  asOf: new Date().toISOString().slice(0, 10),
}

const positiveOnly: NetWorthResponse = {
  items: defaultItems.filter((i) => i.value > 0),
  sources: defaultResponse.sources,
  totals: { assets: 375500, liabilities: 0, net: 375500 },
  asOf: defaultResponse.asOf,
}

const debtHeavy: NetWorthResponse = {
  items: [
    { label: 'Checking', value: 3200, color: '#1976D2' },
    { label: 'Savings', value: 12000, color: '#42A5F5' },
    { label: 'Brokerage', value: 30000, color: '#388E3C' },
    { label: 'Mortgage', value: -320000, color: '#D32F2F' },
    { label: 'Student Loans', value: -85000, color: '#C62828' },
    { label: 'Auto Loan', value: -22000, color: '#E53935' },
    { label: 'Credit Cards', value: -8000, color: '#FF5252' },
  ],
  sources: [
    {
      institution: 'Local Bank',
      accounts: [
        { name: 'Checking', balance: 3200, type: 'checking' },
        { name: 'Savings', balance: 12000, type: 'savings' },
      ],
    },
    {
      institution: 'Schwab',
      accounts: [{ name: 'Brokerage', balance: 30000, type: 'investment' }],
    },
  ],
  totals: { assets: 45200, liabilities: 435000, net: -389800 },
  asOf: defaultResponse.asOf,
}

const multiBank: NetWorthResponse = {
  items: [
    { label: 'Chase Checking', value: 8400, color: '#1976D2' },
    { label: 'Chase Savings', value: 25000, color: '#42A5F5' },
    { label: 'BofA Checking', value: 3200, color: '#0D47A1' },
    { label: 'Schwab Brokerage', value: 145000, color: '#388E3C' },
    { label: 'Fidelity 401(k)', value: 210000, color: '#66BB6A' },
    { label: 'Fidelity IRA', value: 55000, color: '#81C784' },
  ],
  sources: [
    {
      institution: 'Chase',
      accounts: [
        { name: 'Total Checking', balance: 8400, type: 'checking' },
        { name: 'Savings', balance: 25000, type: 'savings' },
      ],
    },
    {
      institution: 'Bank of America',
      accounts: [{ name: 'Advantage Checking', balance: 3200, type: 'checking' }],
    },
    {
      institution: 'Schwab',
      accounts: [{ name: 'Brokerage', balance: 145000, type: 'investment' }],
    },
    {
      institution: 'Fidelity',
      accounts: [
        { name: '401(k)', balance: 210000, type: 'retirement' },
        { name: 'Traditional IRA', balance: 55000, type: 'retirement' },
      ],
    },
  ],
  totals: { assets: 446600, liabilities: 0, net: 446600 },
  asOf: defaultResponse.asOf,
}

const withCrypto: NetWorthResponse = {
  items: [
    ...defaultItems.filter((i) => i.value > 0),
    { label: 'Bitcoin (Coinbase)', value: 18500, color: '#FF9800' },
    { label: 'Ethereum (Coinbase)', value: 6200, color: '#7B1FA2' },
  ],
  sources: [
    ...defaultResponse.sources,
    {
      institution: 'Coinbase',
      accounts: [
        { name: 'Bitcoin', balance: 18500, type: 'crypto' },
        { name: 'Ethereum', balance: 6200, type: 'crypto' },
      ],
    },
  ],
  totals: { assets: 400200, liabilities: 40500, net: 359700 },
  asOf: defaultResponse.asOf,
}

export const netWorthScenarios: ScenarioData<NetWorthResponse> = {
  default: defaultResponse,
  'positive-only': positiveOnly,
  'debt-heavy': debtHeavy,
  'multi-bank': multiBank,
  'with-crypto': withCrypto,
}
