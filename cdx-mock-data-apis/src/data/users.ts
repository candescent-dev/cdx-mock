interface UserProfile {
  message: string
  user: { name: string; email: string; sub: string }
  accounts: { type: string; balance: number; currency: string }[]
  lastLogin: string
}

const profiles: Record<string, UserProfile> = {
  default: {
    message: 'Protected resource accessed successfully',
    user: { name: 'Jane Doe', email: 'jane.doe@example.com', sub: 'user-001' },
    accounts: [
      { type: 'checking', balance: 4237.82, currency: 'USD' },
      { type: 'savings', balance: 15891.43, currency: 'USD' },
    ],
    lastLogin: '2026-04-17T14:30:00Z',
  },
  wealthy: {
    message: 'Protected resource accessed successfully',
    user: { name: 'Alexander Sterling', email: 'a.sterling@example.com', sub: 'user-002' },
    accounts: [
      { type: 'checking', balance: 45200.0, currency: 'USD' },
      { type: 'savings', balance: 182500.0, currency: 'USD' },
      { type: 'brokerage', balance: 523000.0, currency: 'USD' },
      { type: 'cd', balance: 100000.0, currency: 'USD' },
      { type: 'money-market', balance: 75000.0, currency: 'USD' },
    ],
    lastLogin: '2026-04-18T09:15:00Z',
  },
  minimal: {
    message: 'Protected resource accessed successfully',
    user: { name: 'Sam', email: 'sam@example.com', sub: 'user-003' },
    accounts: [{ type: 'checking', balance: 1250.0, currency: 'USD' }],
    lastLogin: '2026-04-10T08:00:00Z',
  },
}

export function getUserProfile(scenario?: string): UserProfile | null {
  if (scenario === 'expired' || scenario === 'no-auth') return null
  return profiles[scenario ?? 'default'] ?? profiles.default
}
