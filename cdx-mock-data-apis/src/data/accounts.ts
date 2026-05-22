interface AccountSummary {
  customerId: string
  accounts: { id: string; type: string; name: string; balance: number; currency: string }[]
  totalBalance: number
  lastUpdated: string
}

const summaries: Record<string, AccountSummary> = {
  default: {
    customerId: 'cust-10042',
    accounts: [
      { id: 'acct-001', type: 'checking', name: 'Primary Checking', balance: 4237.82, currency: 'USD' },
      { id: 'acct-002', type: 'savings', name: 'High-Yield Savings', balance: 15891.43, currency: 'USD' },
      { id: 'acct-003', type: 'credit', name: 'Platinum Rewards Card', balance: -1823.5, currency: 'USD' },
    ],
    totalBalance: 18305.75,
    lastUpdated: new Date().toISOString(),
  },
  business: {
    customerId: 'biz-20018',
    accounts: [
      { id: 'acct-101', type: 'business-checking', name: 'Operating Account', balance: 52340.0, currency: 'USD' },
      { id: 'acct-102', type: 'business-savings', name: 'Tax Reserve', balance: 28000.0, currency: 'USD' },
      { id: 'acct-103', type: 'business-credit', name: 'Business Line of Credit', balance: -12500.0, currency: 'USD' },
      { id: 'acct-104', type: 'merchant', name: 'Merchant Services', balance: 3420.15, currency: 'USD' },
    ],
    totalBalance: 71260.15,
    lastUpdated: new Date().toISOString(),
  },
  empty: {
    customerId: 'cust-99001',
    accounts: [],
    totalBalance: 0,
    lastUpdated: new Date().toISOString(),
  },
  many: {
    customerId: 'cust-10099',
    accounts: [
      { id: 'acct-201', type: 'checking', name: 'Primary Checking', balance: 3850.0, currency: 'USD' },
      { id: 'acct-202', type: 'checking', name: 'Joint Checking', balance: 7200.0, currency: 'USD' },
      { id: 'acct-203', type: 'savings', name: 'Emergency Fund', balance: 15000.0, currency: 'USD' },
      { id: 'acct-204', type: 'savings', name: 'Vacation Fund', balance: 2800.0, currency: 'USD' },
      { id: 'acct-205', type: 'cd', name: '12-Month CD', balance: 10000.0, currency: 'USD' },
      { id: 'acct-206', type: 'cd', name: '24-Month CD', balance: 25000.0, currency: 'USD' },
      { id: 'acct-207', type: 'credit', name: 'Rewards Visa', balance: -2150.0, currency: 'USD' },
      { id: 'acct-208', type: 'credit', name: 'Travel Mastercard', balance: -890.0, currency: 'USD' },
      { id: 'acct-209', type: 'money-market', name: 'Money Market', balance: 42000.0, currency: 'USD' },
      { id: 'acct-210', type: 'ira', name: 'Traditional IRA', balance: 85000.0, currency: 'USD' },
    ],
    totalBalance: 187810.0,
    lastUpdated: new Date().toISOString(),
  },
}

export function getAccountSummary(scenario?: string): AccountSummary {
  return summaries[scenario ?? 'default'] ?? summaries.default
}
