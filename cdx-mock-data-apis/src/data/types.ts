export interface ChartItem {
  label: string
  value: number
  color: string
}

export interface ChartResponse {
  items: ChartItem[]
  period?: { from: string; to: string }
  total?: number
  previousPeriod?: { items: ChartItem[]; total: number }
}

export interface GoalDetail {
  name: string
  current: number
  target: number
  percentComplete: number
  targetDate?: string
  monthlyContribution?: number
}

export interface NetWorthSource {
  institution: string
  accounts: { name: string; balance: number; type: string }[]
}

export interface NetWorthResponse {
  items: ChartItem[]
  sources: NetWorthSource[]
  totals: { assets: number; liabilities: number; net: number }
  asOf: string
}

export type ScenarioData<T = ChartItem[]> = Record<string, T | (() => T)>
