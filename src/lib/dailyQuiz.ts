export type QuizQuestion = {
  id: string
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  teach: string
}

/** Pool rotates into a daily set of 5 — same calendar day = same quiz for everyone */
export const QUIZ_POOL: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is a stock?',
    options: [
      'A loan you pay back with interest',
      'A small piece of ownership in a company',
      'A savings account at a bank',
      'A type of government bond',
    ],
    correctIndex: 1,
    teach: 'A stock (or share) means you own a tiny slice of a company. If the company grows over time, your slice can be worth more — but it can also lose value.',
  },
  {
    id: 'q2',
    question: 'What is a dividend?',
    options: [
      'A fee you pay to trade',
      'A payment some companies share with stockholders',
      'The price change in one day',
      'A type of cryptocurrency',
    ],
    correctIndex: 1,
    teach: 'Some profitable companies pay dividends — cash they share with shareholders. Not every company pays them, and past dividends don’t guarantee future ones.',
  },
  {
    id: 'q3',
    question: 'Inflation means…',
    options: [
      'Prices tend to rise over time',
      'The stock market always goes up',
      'Banks never charge fees',
      'You always lose money',
    ],
    correctIndex: 0,
    teach: 'Inflation is when money buys a little less over time. That’s why people talk about earning “real” returns after inflation.',
  },
  {
    id: 'q4',
    question: 'Diversification means…',
    options: [
      'Putting all your money in one stock',
      'Spreading money across different investments',
      'Only buying stocks',
      'Avoiding taxes',
    ],
    correctIndex: 1,
    teach: 'Diversification means not betting everything on one thing — many ETFs help spread risk across lots of companies.',
  },
  {
    id: 'q5',
    question: 'An ETF is…',
    options: [
      'A single company’s stock',
      'A basket of many stocks (or bonds) you can buy like one ticker',
      'A bank savings account',
      'A credit score',
    ],
    correctIndex: 1,
    teach: 'ETFs bundle many investments so you can get broad exposure in one trade — still risky, but often less concentrated than one stock.',
  },
  {
    id: 'q6',
    question: 'A “bear market” usually means…',
    options: [
      'Prices have fallen a lot for a while',
      'Prices only go up',
      'There are no fees',
      'The market is closed',
    ],
    correctIndex: 0,
    teach: 'People say “bear” when markets are broadly down. It’s normal for markets to go up and down — patience and planning matter.',
  },
  {
    id: 'q7',
    question: 'Compound growth means…',
    options: [
      'Earnings on your earnings over time',
      'Never paying taxes',
      'Guaranteed profits',
      'Only rich people can invest',
    ],
    correctIndex: 0,
    teach: 'Compounding is when returns build on past returns over long periods — time is a huge factor (not a guarantee of gains).',
  },
  {
    id: 'q8',
    question: 'Risk tolerance is…',
    options: [
      'How much wiggle you can handle without panicking',
      'Always zero for kids',
      'The same for everyone',
      'Only about credit cards',
    ],
    correctIndex: 0,
    teach: 'Your risk tolerance is how okay you are with ups and downs. Simulators help you learn without real money.',
  },
  {
    id: 'q9',
    question: 'A P/E ratio compares…',
    options: [
      'Price to earnings (a common valuation clue)',
      'Profit to pizza toppings',
      'Dividends to weather',
      'Inflation to video games',
    ],
    correctIndex: 0,
    teach: 'P/E compares stock price to company earnings per share. It’s one clue, not a full story — context matters.',
  },
  {
    id: 'q10',
    question: 'Market cap measures…',
    options: [
      'Roughly: share price × shares (company size)',
      'How many stores a company has',
      'Your allowance',
      'Interest on a loan',
    ],
    correctIndex: 0,
    teach: 'Market capitalization estimates the total value of a company’s stock. Bigger isn’t automatically “better,” just different.',
  },
  {
    id: 'q11',
    question: 'Why do stock prices move?',
    options: [
      'Buyers and sellers agree on trades throughout the day',
      'A fixed government price',
      'Only on Fridays',
      'They never move',
    ],
    correctIndex: 0,
    teach: 'Prices change as people place orders — news, earnings, and moods can all play a role.',
  },
  {
    id: 'q12',
    question: 'A bond is most like…',
    options: [
      'An IOU: you lend money and may get interest back',
      'Owning part of a company',
      'A video game skin',
      'Free money',
    ],
    correctIndex: 0,
    teach: 'Bonds are loans to governments or companies. Stocks are ownership. They behave differently.',
  },
  {
    id: 'q13',
    question: '“Past performance” means…',
    options: [
      'What happened before — not a promise of the future',
      'A guarantee you’ll win',
      'Illegal to mention',
      'Only about sports',
    ],
    correctIndex: 0,
    teach: 'Ads say “past performance doesn’t guarantee future results” because history isn’t a crystal ball.',
  },
  {
    id: 'q14',
    question: 'An index (like the S&P 500) is…',
    options: [
      'A sample basket tracking many big companies',
      'One person’s opinion',
      'A bank account',
      'A tax form',
    ],
    correctIndex: 0,
    teach: 'Indexes track groups of stocks to show how a slice of the market is doing.',
  },
  {
    id: 'q15',
    question: 'Why use a simulator?',
    options: [
      'Practice decisions without real money',
      'Guarantee real profits later',
      'Avoid learning',
      'Replace homework',
    ],
    correctIndex: 0,
    teach: 'Simulators help you learn mechanics and emotions safely — still educational, not a promise of real-world results.',
  },
  {
    id: 'q16',
    question: 'Net worth is best described as…',
    options: [
      'What you own minus what you owe',
      'Your salary before taxes',
      'Only your checking account balance',
      'Your credit score',
    ],
    correctIndex: 0,
    teach: 'Net worth = assets − liabilities. It’s a snapshot of wealth, not income.',
  },
  {
    id: 'q17',
    question: 'An emergency fund is mainly for…',
    options: [
      'Unexpected shocks (job loss, big repairs)',
      'Planned vacations',
      'Stock speculation',
      'Cryptocurrency dips',
    ],
    correctIndex: 0,
    teach: 'Emergency cash is for real surprises — keep it boring and accessible, not in risky bets.',
  },
  {
    id: 'q18',
    question: 'Credit utilization usually means…',
    options: [
      'How much of your credit limit you’re using',
      'How often you check your score',
      'Your annual salary',
      'Your mortgage rate only',
    ],
    correctIndex: 0,
    teach: 'High balances vs. limits can hurt scores even if you pay on time — context matters.',
  },
  {
    id: 'q19',
    question: '“Gross pay” vs “net pay” — net is…',
    options: [
      'Take-home after taxes and deductions',
      'Pay before any deductions',
      'Only your bonus',
      'The same as gross for everyone',
    ],
    correctIndex: 0,
    teach: 'Budget from net pay — that’s what actually hits your bank.',
  },
  {
    id: 'q20',
    question: 'The main purpose of insurance is…',
    options: [
      'Transfer big financial risks you can’t self-cover',
      'Guaranteed investment returns',
      'Avoid paying taxes entirely',
      'Replace an emergency fund',
    ],
    correctIndex: 0,
    teach: 'Insurance pools risk — it’s protection, not a get-rich plan.',
  },
  {
    id: 'q21',
    question: 'A higher deductible on a policy often means…',
    options: [
      'Lower premiums but more out-of-pocket when you claim',
      'Higher premiums and no risk',
      'Illegal in most states',
      'Automatic full coverage',
    ],
    correctIndex: 0,
    teach: 'Premiums vs deductibles are a tradeoff — match them to your savings and stress tolerance.',
  },
  {
    id: 'q22',
    question: '“Pay yourself first” usually means…',
    options: [
      'Save or invest before discretionary spending',
      'Only buy things on sale',
      'Pay friends before bills',
      'Ignore retirement accounts',
    ],
    correctIndex: 0,
    teach: 'Automate savings so your future self gets paid like a bill.',
  },
  {
    id: 'q23',
    question: 'High-interest credit card debt is often…',
    options: [
      'A priority to pay down before chasing risky returns',
      'Fine to ignore if you invest',
      'Always tax-deductible',
      'The same APR as a mortgage for everyone',
    ],
    correctIndex: 0,
    teach: 'Paying off ~20% APR debt is a guaranteed “return” on your money — still situational, but powerful math.',
  },
  {
    id: 'q24',
    question: 'APY on a savings account tells you…',
    options: [
      'How savings may grow over a year (rate matters)',
      'Your stock dividend yield',
      'Your credit score',
      'Your tax bracket',
    ],
    correctIndex: 0,
    teach: 'APY helps compare savings products — fees and inflation still matter.',
  },
  {
    id: 'q25',
    question: 'Purchasing power means…',
    options: [
      'What your money can actually buy',
      'Only your gross salary number',
      'How many stocks you own',
      'Your bank’s logo',
    ],
    correctIndex: 0,
    teach: 'Inflation and taxes affect real life — focus on what you can afford, not just bigger numbers.',
  },
  {
    id: 'q26',
    question: 'An employer 401(k) match is often described as…',
    options: [
      'Part of your compensation — worth understanding vesting rules',
      'A government tax refund',
      'Illegal in the U.S.',
      'The same as a savings APY',
    ],
    correctIndex: 0,
    teach: 'Matches can be powerful — read eligibility, vesting, and fund choices in your plan documents.',
  },
  {
    id: 'q27',
    question: 'Withholding on your paycheck is…',
    options: [
      'Estimated tax sent to authorities before you file',
      'A bonus from your employer',
      'Your 401(k) balance',
      'Always exactly right forever',
    ],
    correctIndex: 0,
    teach: 'Adjust withholding when life changes — big refunds mean you lent money interest-free.',
  },
  {
    id: 'q28',
    question: '“Lifestyle creep” usually refers to…',
    options: [
      'Spending rising as fast as income — so wealth doesn’t grow',
      'Moving to a smaller home',
      'Only using cash',
      'Paying extra on a mortgage',
    ],
    correctIndex: 0,
    teach: 'Higher income helps only if you keep a gap between earning and spending.',
  },
]

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return Math.abs(h)
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed >>> 0
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Shuffle the four choices so the correct answer isn’t always “first option” — updates correctIndex. */
function withShuffledOptions(q: QuizQuestion, seed: number): QuizQuestion {
  const perm = shuffleSeeded([0, 1, 2, 3], seed)
  const newOptions: [string, string, string, string] = [
    q.options[perm[0]],
    q.options[perm[1]],
    q.options[perm[2]],
    q.options[perm[3]],
  ]
  const newCorrect = perm.indexOf(q.correctIndex)
  if (newCorrect < 0 || newCorrect > 3) return q
  return { ...q, options: newOptions, correctIndex: newCorrect as 0 | 1 | 2 | 3 }
}

export function getTodaysQuiz(date = new Date()): QuizQuestion[] {
  const key = dayKey(date)
  const h = hash(`nestwise-quiz-${key}`)
  const picked = shuffleSeeded(QUIZ_POOL, h).slice(0, 5)
  return picked.map((q, i) => withShuffledOptions(q, hash(`${key}-${q.id}-${i}`)))
}

const STREAK_KEY = 'nestwise_quiz_streak_v1'
const LAST_DONE_KEY = 'nestwise_quiz_last_done_day_v1'

export function getQuizStreak(): { streak: number; lastDoneDay: string | null } {
  if (typeof window === 'undefined') return { streak: 0, lastDoneDay: null }
  try {
    const streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10) || 0
    const lastDoneDay = localStorage.getItem(LAST_DONE_KEY)
    return { streak, lastDoneDay }
  } catch {
    return { streak: 0, lastDoneDay: null }
  }
}

/** Call once when user finishes the daily quiz (any score). Streak = consecutive calendar days completed. */
export function recordQuizFinished(today = new Date()): { streak: number } {
  if (typeof window === 'undefined') return { streak: 0 }
  const todayStr = dayKey(today)
  const lastDone = localStorage.getItem(LAST_DONE_KEY)
  const prev = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10) || 0

  if (lastDone === todayStr) {
    return { streak: prev }
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = dayKey(yesterday)

  const next = lastDone === yStr ? prev + 1 : 1

  localStorage.setItem(STREAK_KEY, String(next))
  localStorage.setItem(LAST_DONE_KEY, todayStr)
  return { streak: next }
}
