/**
 * NestWise curriculum — original lesson copy only (no third-party articles or embeds).
 * Add new lessons here; progress keys on stable `lesson.id` values.
 */

export interface Lesson {
  id: string
  title: string
  icon: string
  content: string
}

export interface CourseModule {
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  icon: string
  modules: CourseModule[]
}

/** Used for the “Basics Complete” achievement — first two investing lessons */
export const BASICS_LESSON_IDS = ['inv-what-is-stock', 'inv-market-basics'] as const

export const courses: Course[] = [
  {
    id: 'money-map',
    title: 'Your Money Map',
    description: 'See how income, spending, and net worth fit together — before you invest a dollar.',
    icon: 'circle-dollar-sign',
    modules: [
      {
        title: 'Foundations',
        lessons: [
          {
            id: 'mm-map-your-money',
            title: 'Mapping cash flow',
            icon: 'wallet',
            content: `Money coming in and money going out is the heartbeat of your financial life. “Income” is what you earn from work, side gigs, or support. “Expenses” are everything else: rent, food, subscriptions, transport, and debt payments.

You don’t need a perfect spreadsheet on day one. A simple picture — even estimates — helps you see whether you’re living below, at, or above your means. That awareness is the base layer for saving, investing, and avoiding expensive surprises.

Key takeaways:
• Track inflows and outflows at a level you can sustain weekly or monthly.
• Small leaks (unused subscriptions, impulse buys) add up — notice them without shame.
• Financial health starts with clarity, not with picking the “best” stock.`,
          },
          {
            id: 'mm-income-vs-wealth',
            title: 'Income vs. wealth',
            icon: 'trending-up',
            content: `A high income can still feel tight if spending rises just as fast — that’s sometimes called “lifestyle creep.” Wealth, on the other hand, is what you keep and grow: cash, investments, equity in things you own, minus what you owe.

You can build wealth on a modest income by spending less than you earn and directing the difference toward savings and investments. Big earners who spend everything may have little wealth on paper. The goal isn’t to win a salary contest; it’s to align your money with what you value.

Key takeaways:
• Income is a flow; wealth is a stock (what you’ve accumulated).
• Building wealth usually requires spending less than you earn over a long horizon.
• Your peer group’s spending isn’t a benchmark — your goals are.`,
          },
          {
            id: 'mm-net-worth-intro',
            title: 'What is net worth?',
            icon: 'pie-chart',
            content: `Net worth is a single snapshot: add up what you own (cash, investments, car if you count it) and subtract what you owe (credit cards, student loans, other debt). It can be negative early in life — that’s common when you’re investing in education or starting a career.

The number isn’t a grade on your character. It’s a tool to see progress over time. As you pay down debt and add to savings, net worth typically trends up. Checking it a few times a year is enough for most people.

Key takeaways:
• Net worth = assets − liabilities.
• Negative net worth can be temporary; the direction matters more than one data point.
• Use net worth to celebrate progress, not to compare yourself to strangers online.`,
          },
        ],
      },
    ],
  },
  {
    id: 'budget-save',
    title: 'Budgeting & saving',
    description: 'Give every dollar a job, build habits, and fund an emergency cushion.',
    icon: 'piggy-bank',
    modules: [
      {
        title: 'Plans that stick',
        lessons: [
          {
            id: 'bs-why-budget',
            title: 'Why budget at all?',
            icon: 'sliders-horizontal',
            content: `A budget isn’t punishment — it’s a plan so your money matches your priorities. Some people use apps; others use envelopes or a simple “needs / wants / savings” split. The best system is the one you’ll actually use.

Start with fixed costs (housing, utilities, minimum debt payments), then flexible spending, then savings goals. When you decide in advance how much goes to fun money, you reduce guilt and impulse decisions.

Key takeaways:
• Budgets turn vague anxiety into specific tradeoffs.
• Automate savings when possible so you don’t rely on willpower alone.
• Adjust monthly — life changes, and your plan can too.`,
          },
          {
            id: 'bs-emergency-fund',
            title: 'The emergency fund',
            icon: 'shield',
            content: `An emergency fund is cash set aside for job loss, medical bills, car repairs, or other shocks — not for vacations or planned upgrades. A common guideline is three to six months of essential expenses, but even one month of rent in a savings account puts you ahead of many households.

Keep this money boring: high-yield savings or similar, not meme stocks. The return is peace of mind and optionality when life hits. Once the fund is in place, you can invest other savings with a longer time horizon.

Key takeaways:
• Emergency cash is insurance, not growth — prioritize accessibility.
• Build the fund in small, repeated transfers if you can’t do it all at once.
• Replenish after you use it, before increasing optional spending.`,
          },
          {
            id: 'bs-pay-yourself-first',
            title: 'Pay yourself first',
            icon: 'banknote',
            content: `“Pay yourself first” means moving money to savings or investments as soon as income arrives — before discretionary spending competes for it. That might be a percentage of your paycheck or a fixed amount into a separate account.

This habit turns saving from a leftover into a priority. Even modest amounts, repeated, compound into real progress. Pair it with a realistic budget so you don’t overdraft; the goal is sustainable automation.

Key takeaways:
• Treat savings like a bill you owe your future self.
• Start small if needed; consistency beats occasional large deposits.
• Increase the amount when income rises, before lifestyle expands.`,
          },
        ],
      },
    ],
  },
  {
    id: 'banking-credit',
    title: 'Banking & credit',
    description: 'How banks, credit scores, and debt actually work in everyday life.',
    icon: 'landmark',
    modules: [
      {
        title: 'Accounts & borrowing',
        lessons: [
          {
            id: 'bc-how-banks-work',
            title: 'Checking, savings, and interest',
            icon: 'landmark',
            content: `Banks hold your deposits and pay interest on some accounts (often more on savings than checking). They lend money to others and earn interest on those loans — that’s a simplified picture of how they stay in business. You’re not “storing” cash in a vault; your balance is a promise the bank will return your money per its rules.

Compare fees, ATM access, and annual percentage yield (APY) on savings. Online banks sometimes offer better rates because they have lower overhead. Read terms: minimum balances, overdraft fees, and how quickly transfers settle matter in real life.

Key takeaways:
• Checking is for flow; savings is for goals and emergency cash.
• APY tells you how savings grow; fees can erase that benefit.
• FDIC insurance (in the U.S.) protects deposits up to limits — verify your institution.`,
          },
          {
            id: 'bc-credit-score',
            title: 'Credit scores in plain English',
            icon: 'credit-card',
            content: `A credit score estimates how likely you are to repay borrowed money. Lenders use it for credit cards, auto loans, mortgages, and sometimes rentals or jobs (where allowed). Scores reflect payment history, amounts owed, length of history, mix of accounts, and new credit — not your income directly.

Paying on time and keeping balances low relative to limits (“credit utilization”) helps. Closing old cards can shorten your history or raise utilization — think twice. Checking your own score is a “soft” inquiry and doesn’t hurt it.

Key takeaways:
• On-time payment history is the biggest factor for most models.
• High utilization can hurt even if you pay in full later — spread usage or raise limits carefully.
• Review your credit report periodically for errors (you have rights to dispute them).`,
          },
          {
            id: 'bc-good-debt-bad-debt',
            title: 'Debt: useful vs. costly',
            icon: 'scale',
            content: `Not all debt is the same. Low-rate, fixed debt for education or a home can build long-term value; high-interest revolving debt (like carried credit card balances) often works against you because interest compounds against you.

A simple rule: compare the interest rate to realistic returns you might earn elsewhere. Credit cards at 20%+ APR are almost always worth paying down before extra investing. Student loans and mortgages may be slower paydowns depending on rate and forgiveness options — still personal finance, not one-size-fits-all.

Key takeaways:
• High-interest debt is usually enemy number one for wealth-building.
• Minimum payments keep you in debt for years — see the real cost of APR.
• Avoid new debt for depreciating “wants” when you’re already stretched.`,
          },
        ],
      },
    ],
  },
  {
    id: 'economy-you',
    title: 'Inflation & the economy',
    description: 'Why prices change, what interest rates do to you, and how to think in “real” terms.',
    icon: 'banknote',
    modules: [
      {
        title: 'Big forces, small you',
        lessons: [
          {
            id: 'ie-inflation',
            title: 'What inflation is',
            icon: 'banknote',
            content: `Inflation means the general level of prices rises over time — a dollar buys a bit less each year. It’s measured with baskets of goods (like CPI). A little inflation is normal in modern economies; very high inflation hurts everyone who holds cash and fixed incomes.

When people say investments must “beat inflation,” they mean your money should grow faster than prices, so your purchasing power increases or holds steady. Cash under a mattress loses to inflation; diversified long-term investing is one way people try to preserve real wealth — with risk.

Key takeaways:
• Inflation erodes the purchasing power of idle cash.
• Nominal returns ignore inflation; “real” returns subtract it.
• Different people feel inflation differently (renters vs. owners, wage growth vs. prices).`,
          },
          {
            id: 'ie-interest-rates-you',
            title: 'Interest rates and your life',
            icon: 'percent',
            content: `Central banks influence short-term rates to cool or stimulate the economy. When rates rise, new loans (mortgages, cars) often get more expensive, but savings accounts may pay more. When rates fall, borrowing can get cheaper while savings yields shrink.

You don’t control macro policy — you control your mix of cash, debt, and investments. If you have variable-rate debt, rate hikes hit your budget directly. If you’re saving, higher rates can help conservative cash holdings.

Key takeaways:
• Rising rates: headwind for borrowers, possible tailwind for savers.
• Fixed-rate loans lock in payment; variable loans move with benchmarks.
• News headlines are loud; your plan should match your timeline and risk tolerance.`,
          },
          {
            id: 'ie-purchasing-power',
            title: 'Purchasing power',
            icon: 'wallet',
            content: `Purchasing power is what your money can actually buy — today and years from now. Salary increases that match inflation maintain power; raises below inflation mean you can afford less in real terms even if the number on your paycheck grew.

Long-term investors care about real returns after inflation and taxes (simplified: “how much more stuff can I afford later?”). Short-term, focus on cash flow and emergency savings before chasing returns.

Key takeaways:
• Compare wage growth to inflation, not just last year’s number.
• Real wealth is about what you can do with money, not the digits alone.
• Patience and diversification address uncertainty — they don’t remove it.`,
          },
        ],
      },
    ],
  },
  {
    id: 'taxes-paychecks',
    title: 'Taxes & paychecks',
    description: 'Read a pay stub, understand withholding, and spot tax-advantaged accounts.',
    icon: 'receipt',
    modules: [
      {
        title: 'What you earn vs. what hits your account',
        lessons: [
          {
            id: 'tp-paycheck-parts',
            title: 'Gross vs. net pay',
            icon: 'receipt',
            content: `Gross pay is what you earn before deductions. Net pay (“take-home”) is what lands in your bank after taxes, benefits, retirement contributions, and other withholdings. If you only budget from gross, you’ll always feel short.

Typical deductions include federal and state income tax, Social Security and Medicare (FICA), health insurance premiums, and optional 401(k) or similar contributions. Each line has a purpose — get familiar with your pay stub once; it pays off forever.

Key takeaways:
• Net pay is the real number for monthly budgeting.
• Pre-tax retirement contributions lower taxable income now (rules vary by account type).
• Benefits aren’t free — they show up as deductions but may save you money overall.`,
          },
          {
            id: 'tp-withholding-estimates',
            title: 'Withholding and surprises',
            icon: 'file-text',
            content: `Employers withhold estimated taxes each pay period. If too much is withheld, you get a refund (you lent the government money interest-free). If too little, you might owe at tax time — possibly with penalties. Life events (new job, marriage, side income) change the right withholding.

The IRS and many states offer withholding calculators. Self-employed people usually pay quarterly estimated taxes — a different rhythm. This lesson isn’t tax advice; when in doubt, talk to a qualified preparer.

Key takeaways:
• A big refund isn’t a bonus — it’s your money returned without interest.
• Update W-4 or equivalent when your situation changes.
• Side gigs often have extra tax complexity; plan ahead.`,
          },
          {
            id: 'tp-tax-advantaged-accounts',
            title: '401(k), IRA, and labels that matter',
            icon: 'briefcase',
            content: `Tax-advantaged accounts — like 401(k)s, 403(b)s, IRAs — offer rules about when money goes in, how it grows, and when you take it out. “Traditional” often means pre-tax contributions and taxed withdrawals in retirement. “Roth” often means after-tax contributions and potentially tax-free qualified withdrawals later (rules and limits apply).

Employer matches on 401(k)s are part of your compensation. Getting the full match is often the highest-return “deal” available — still subject to vesting and plan rules. This is educational overview only; choices depend on your situation.

Key takeaways:
• Read whether your employer matches and the vesting schedule.
• IRAs and workplace plans have annual contribution limits — look them up each year.
• Early withdrawals can trigger taxes and penalties — know the rules before you tap.`,
          },
        ],
      },
    ],
  },
  {
    id: 'insurance-protection',
    title: 'Insurance & protection',
    description: 'Transfer big risks you can’t afford to self-insure — without buying what you don’t need.',
    icon: 'shield',
    modules: [
      {
        title: 'Risk transfer',
        lessons: [
          {
            id: 'ip-why-insurance',
            title: 'Why insurance exists',
            icon: 'shield',
            content: `Insurance pools many people’s premiums to pay for rare but large losses. You’re trading a small certain cost (the premium) for protection against a ruinous event. It’s not an investment product — it’s risk management.

The right amount depends on what you could absorb out of pocket: a high deductible might be fine if your emergency fund is solid; a low deductible might reduce stress if cash is tight. Shop coverage, not just price — compare what’s actually covered.

Key takeaways:
• Insurance protects against financial catastrophe, not every inconvenience.
• Read exclusions and limits; cheapest isn’t always adequate.
• Re-shop periodically — life changes, and so do rates.`,
          },
          {
            id: 'ip-common-types',
            title: 'Health, auto, renters or homeowners',
            icon: 'building-2',
            content: `Health insurance reduces exposure to medical bills (with deductibles, copays, and networks). Auto insurance may be legally required and covers liability and sometimes your car. Renters insurance is often cheap and covers theft or liability in a rental; homeowners covers the structure and more.

Life insurance matters most when someone depends on your income. Term life is straightforward protection for a period; permanent policies mix insurance with savings features and get complex fast — ask questions before you buy.

Key takeaways:
• Minimum legal auto coverage may not protect your assets in a bad lawsuit — understand liability limits.
• Renters insurance is often overlooked — consider it if you own anything worth replacing.
• Match life insurance to actual dependency, not sales pressure.`,
          },
          {
            id: 'ip-deductibles-premiums',
            title: 'Deductibles and premiums',
            icon: 'scale',
            content: `A premium is what you pay regularly for coverage. A deductible is what you pay out of pocket before insurance pays on a claim (in many policies). Higher deductible → lower premium, and vice versa.

There’s no universal “best” — it’s a tradeoff between monthly cost and worst-case out-of-pocket. Emergency savings make higher deductibles more viable. Always check how deductibles apply per incident vs. per year.

Key takeaways:
• Lower premiums often mean you retain more risk — be honest about what you can pay in a bad month.
• Bundling policies sometimes saves money; compare bundled vs. separate.
• Document valuables for renters or homeowners claims while you’re calm, not after a fire.`,
          },
        ],
      },
    ],
  },
  {
    id: 'investing-core',
    title: 'Investing fundamentals',
    description: 'Stocks, markets, and the relationship between risk and reward.',
    icon: 'trending-up',
    modules: [
      {
        title: 'Markets & ownership',
        lessons: [
          {
            id: 'inv-what-is-stock',
            title: 'What is a stock?',
            icon: 'trending-up',
            content: `A stock (also called a share) is a piece of ownership in a public company. If the business grows profits over time, the value of your stake may rise — and some firms pay dividends, sharing cash with owners. If the business struggles, your stake may fall. Stocks are volatile; there are no guarantees.

Stocks trade on exchanges where buyers and sellers agree on prices throughout the day. Owning stock doesn’t mean you run the company; you vote on some matters if you hold voting shares, but day-to-day control belongs to management and the board.

Key takeaways:
• Stocks represent ownership, not a loan to the company.
• Price moves reflect expectations, news, and sentiment — often noisy short-term.
• Long-term investors often care more about business quality and diversification than daily headlines.`,
          },
          {
            id: 'inv-market-basics',
            title: 'How markets move',
            icon: 'landmark',
            content: `A stock market is where shares change hands. Prices aren’t set by a single authority — they emerge from orders. Indices like the S&P 500 track baskets of large U.S. companies to summarize “how the market” is doing; they’re benchmarks, not things you buy directly (unless via a fund).

Volatility is normal. Downturns happen; so do recoveries. Your horizon — when you need the money — should guide how much volatility you accept. Money you need within a few years often belongs in safer, liquid places.

Key takeaways:
• Indices simplify “market” talk; they’re samples, not the whole economy.
• Short-term prices are noisy; long-term results depend on earnings, reinvestment, and luck.
• Past performance doesn’t guarantee future results — it’s not just a disclaimer, it’s math and uncertainty.`,
          },
          {
            id: 'inv-risk-return-basics',
            title: 'Risk and expected return',
            icon: 'scale',
            content: `Higher potential return usually comes with higher risk — the chance of large swings or permanent loss. Cash is stable but may lose to inflation. Stocks historically offered higher long-term returns than cash, with deeper drawdowns along the way. Bonds sit in between in many environments.

Your risk tolerance is emotional and financial: can you stay invested when your balance drops 20%? If not, a more conservative mix may help you avoid selling low. Simulators and small real amounts can build experience without betting the farm.

Key takeaways:
• There’s no return without some form of risk.
• Selling in panic turns temporary declines into permanent losses.
• Match risk level to your timeline and sleep-at-night comfort.`,
          },
        ],
      },
    ],
  },
  {
    id: 'funds-risk',
    title: 'Funds, bonds & diversification',
    description: 'ETFs, bonds, and why “not all eggs in one basket” matters.',
    icon: 'layers',
    modules: [
      {
        title: 'Building blocks',
        lessons: [
          {
            id: 'fb-etfs',
            title: 'ETFs and mutual funds',
            icon: 'layers',
            content: `Mutual funds and ETFs pool money from many investors to buy a basket of stocks, bonds, or other assets. ETFs trade on exchanges like stocks; many mutual funds price once daily. Both can offer instant diversification across hundreds of names.

Expense ratios matter: that’s the annual fee as a percent of assets. Lower isn’t always better, but high fees drag returns over decades. Read what the fund actually holds — “balanced” or “target date” means different things in different products.

Key takeaways:
• Funds spread company-specific risk; they don’t eliminate market risk.
• Compare expense ratios and tax efficiency (ETFs can be tax-efficient in taxable accounts — general pattern, not universal).
• An index fund or ETF often tracks a benchmark cheaply; active funds try to beat it — often don’t, net of fees.`,
          },
          {
            id: 'fb-bonds',
            title: 'Bonds in plain terms',
            icon: 'file-text',
            content: `A bond is a loan: you lend money to a government or company; they pay interest and return principal at maturity (if all goes well). Bonds often move differently than stocks — when stocks fall, high-quality bonds sometimes cushion a portfolio, but not always.

Bond prices fall when interest rates rise (existing bonds look less attractive). “Risk-free” usually means government default risk is considered tiny — not that the bond’s price can’t move. Junk bonds pay more yield because default risk is real.

Key takeaways:
• Bonds are loans, not ownership stakes.
• Duration measures sensitivity to rate moves — longer bonds swing more.
• Diversification across stocks and bonds is a common strategy — not a guarantee.`,
          },
          {
            id: 'fb-diversification',
            title: 'Diversification and concentration',
            icon: 'pie-chart',
            content: `Diversification means spreading money across assets, sectors, and geographies so one bad outcome doesn’t sink you. Owning one stock is concentrated; owning a broad fund is diversified — though you still face overall market risk.

Concentration can create lottery-like upside and wipeout risk. Many long-term investors prefer broad funds plus a small “play” allocation if they want to experiment. Rebalancing periodically sells winners and buys laggards at a high level — discipline, not timing the market.

Key takeaways:
• Diversification reduces idiosyncratic risk, not all risk.
• Home bias (only local stocks) is common; global diversification is worth understanding.
• Know what you own — vague “tech” exposure can overlap more than you think.`,
          },
        ],
      },
    ],
  },
  {
    id: 'hands-on',
    title: 'Getting started & practice',
    description: 'Brokerage basics and how to use the simulator without confusing play with promises.',
    icon: 'rocket',
    modules: [
      {
        title: 'From learning to doing',
        lessons: [
          {
            id: 'gs-practice-first',
            title: 'Learn, then practice',
            icon: 'graduation-cap',
            content: `Before committing real money, understand order types, fees, and how emotions feel when a position drops. NestWise’s simulator uses fake cash and real-ish prices for education — not a prediction of your future results.

Write down a simple rule: how much you’ll invest, how often, and what you’ll buy (e.g., broad fund vs. stock picking). Rules reduce impulsive trades. When you go live, start small relative to your net worth.

Key takeaways:
• Mechanics (buy, sell, settle) are learnable in a safe environment.
• A written plan beats vibes when markets get scary.
• No simulator can replicate the psychology of real losses or gains.`,
          },
          {
            id: 'gs-brokerage-accounts',
            title: 'Accounts and order basics',
            icon: 'briefcase',
            content: `A brokerage account holds investments; you’ll see cash, buying power, and positions. Retirement accounts (IRA, 401(k)) have tax rules; taxable brokerage accounts don’t have early withdrawal penalties for retirement but you owe taxes on dividends and realized gains (simplified).

Market orders fill quickly near current prices; limit orders set your max buy or min sell. Fees and commissions vary — many brokers offer commission-free stock trades but make money other ways. Read the fine print.

Key takeaways:
• Know whether your account is taxable or tax-advantaged before trading.
• Limit orders add control; market orders add speed — pick based on the situation.
• Settlement times affect when cash is available — don’t assume instant reuse everywhere.`,
          },
          {
            id: 'gs-simulator-mindset',
            title: 'Using the simulator wisely',
            icon: 'rocket',
            content: `Treat the simulator as a gym: reps build familiarity, not guaranteed profits. Try scenarios — heavy in one stock vs. diversified — and notice how drawdowns feel. Reset and experiment; that’s the point.

When you transition to real money, scale slowly. The goal of NestWise is literacy and habits: saving, learning, asking good questions — not hype or get-rich-quick thinking.

Key takeaways:
• Virtual wins don’t prove skill; they prove you clicked buttons in one market phase.
• Use the simulator to test discipline, not to chase leaderboard fantasies.
• Keep learning across budgeting, credit, and investing — money is one connected system.`,
          },
        ],
      },
    ],
  },
]

export function getAllLessonIds(): string[] {
  const ids: string[] = []
  for (const course of courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) ids.push(lesson.id)
    }
  }
  return ids
}
