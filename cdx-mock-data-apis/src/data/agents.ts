const keywordReplies: Record<string, string> = {
  balance:
    'Your current checking account balance is $4,237.82. Your savings account has $15,891.43. Would you like to see a breakdown by account?',
  transfer:
    "Sure! I can help you transfer funds. You can transfer between your accounts or to an external account. What would you like to do?\n\n1. Transfer between my accounts\n2. Transfer to someone else\n3. Set up a recurring transfer",
  help: "I'm your banking assistant! I can help with:\n\n• Account balances and transactions\n• Fund transfers\n• Loan information\n• Savings goals\n• Credit score insights\n• Bill payments\n\nWhat would you like to know?",
  loan: 'Based on your profile, you may qualify for:\n\n• Personal Loan: up to $25,000 at 7.9% APR\n• Auto Loan: up to $45,000 at 5.2% APR\n• Home Equity: up to $150,000 at 6.1% APR\n\nWould you like to explore any of these options?',
  savings:
    "Great question! Here's your savings summary:\n\n• Emergency Fund: $8,500 / $15,000 (57%)\n• Vacation: $2,200 / $3,000 (73%)\n• New Car: $5,000 / $25,000 (20%)\n\nYou're on track to reach your Vacation goal by August!",
  credit:
    'Your current credit score is 742 (Good). Here\'s what\'s influencing it:\n\n✅ Payment History: Excellent\n✅ Credit Mix: Good\n⚠️ Credit Utilization: 28% (try to keep below 30%)\n⚠️ Average Account Age: 4.2 years\n\nTip: Paying down your credit card by $200 could bump your score by 10-15 points.',
  invest:
    "Your investment portfolio is currently allocated:\n\n• US Stocks: 42%\n• Bonds: 28%\n• Cash: 18%\n• Real Estate: 12%\n\nYour portfolio is up 8.3% YTD. Would you like to rebalance or explore other options?",
  payment:
    "Your upcoming bills:\n\n• Electric: $142.50 — due Apr 25\n• Internet: $79.99 — due Apr 28\n• Credit Card: $350.00 minimum — due May 1\n• Insurance: $185.00 — due May 5\n\nWould you like to schedule any payments?",
}

const fallbackReply =
  "I'm not sure I understand. Could you rephrase that? I can help with account balances, transfers, loans, savings goals, credit score, investments, and bill payments."

const longReply = `Let me give you a comprehensive overview of your financial health.

**Accounts Summary**
Your combined account balance across all accounts is $62,429.25. Your checking account has sufficient runway for the next 3 months of expenses based on your spending patterns.

**Spending Analysis**
This month, your spending is 12% below your 6-month average. Your largest category remains Groceries ($1,240), followed by Dining ($680). You've reduced your Entertainment spending by 35% compared to last month — great job!

**Savings Progress**
You're making steady progress on your savings goals. Your Emergency Fund is at 57% and growing at $500/month. At this rate, you'll reach your target by January 2027.

**Credit Health**
Your credit score of 742 puts you in the "Good" range. The main factor holding you back is credit utilization at 28%. A small reduction in credit card balances could push you into "Excellent" territory.

**Investment Performance**
Your portfolio returned 8.3% YTD, outperforming the benchmark by 1.2%. Your asset allocation is well-balanced for your risk profile.

Is there anything specific you'd like to dig deeper into?`

export function getAgentReply(message: string, scenario?: string): { reply: string } {
  if (scenario === 'echo') return { reply: message }
  if (scenario === 'empty') return { reply: '' }
  if (scenario === 'long') return { reply: longReply }

  const lower = message.toLowerCase()
  for (const [keyword, reply] of Object.entries(keywordReplies)) {
    if (lower.includes(keyword)) return { reply }
  }
  return { reply: fallbackReply }
}
