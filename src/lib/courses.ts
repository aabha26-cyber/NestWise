/**
 * NestWise curriculum — rich structured lessons.
 * Each lesson has typed sections (hook, concept, example, tip, warning, action, takeaways)
 * plus an optional quick-check interaction at the bottom.
 */

export type SectionType = 'hook' | 'concept' | 'example' | 'tip' | 'warning' | 'takeaways' | 'action'

export interface LessonSection {
  type: SectionType
  /** Optional label override for the callout heading */
  heading?: string
  /** For takeaways: newline-separated lines starting with • */
  body: string
}

export interface Lesson {
  id: string
  title: string
  icon: string
  /** Estimated read time in minutes */
  readTime: number
  sections: LessonSection[]
  check?: {
    question: string
    reveal: string
  }
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

/** Used for the "Basics Complete" achievement */
export const BASICS_LESSON_IDS = ['inv-what-is-stock', 'inv-market-basics'] as const

// ─────────────────────────────────────────────────────────────────────────────

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
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'You probably know your salary. But right now — without opening your bank app — do you know what you spent last Tuesday? Or last month total? Most people can\'t answer. That\'s the gap this lesson closes.',
              },
              {
                type: 'concept',
                body: 'Cash flow is simply money in vs. money out. Income (your job, side work, support) is the "in." Rent, food, subscriptions, and everything else are the "out." The difference — what remains — determines whether you\'re building toward something or quietly burning through it. You don\'t need a perfect spreadsheet. You just need an honest picture.',
              },
              {
                type: 'example',
                body: 'At $3,400/month take-home, if small daily spending averages $15/day — two coffees, a snack, an impulse Amazon click — that\'s $450/month. $5,400/year. That\'s a roundtrip to Europe, six months of emergency savings, or half a year of car payments. Not "big purchases" — just the drip.',
              },
              {
                type: 'tip',
                heading: 'The 3-bucket check',
                body: 'Sort everything into: Fixed costs (rent, bills, loan minimums), Flex spending (food, fun, clothes), and Saving. A rough 50/30/20 split is a useful starting framework. If your fixed costs alone eat 70%+ of income, that\'s the signal — not your latte habit.',
              },
              {
                type: 'takeaways',
                body: '• Track income and spending at least monthly — even rough numbers reveal real patterns\n• Small repeated spending adds up faster than most people realize\n• Financial clarity doesn\'t require perfection — just consistent honesty',
              },
            ],
            check: {
              question: 'You earn $3,200/month. Rent is $1,100, subscriptions and utilities are $280, and your loan minimum is $200. Before groceries, transport, or anything fun — what percent of income is already committed?',
              reveal: 'About 49% ($1,580 of $3,200) is already spoken for. Half your income is gone before you make a single discretionary choice. That leaves $1,620 for food, transport, savings, and fun — less runway than most people assume.',
            },
          },
          {
            id: 'mm-income-vs-wealth',
            title: 'Income vs. wealth',
            icon: 'trending-up',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'A surgeon earning $450,000/year. A teacher earning $58,000. After 30 years, who has more wealth? Often, the teacher. Income is how fast water flows into a bucket. Wealth is how full the bucket is. They\'re not the same thing.',
              },
              {
                type: 'concept',
                body: 'Income is earned regularly and, for most people, spent regularly. Wealth is accumulated and kept — savings, investments, assets. High income helps, but only if the gap between earning and spending stays consistently positive and gets put to work. That gap, compounded over time, is the actual engine of wealth.',
              },
              {
                type: 'example',
                body: 'Two people both earn $80k/year. Person A spends $75k. Person B spends $62k and invests $18k. After 20 years at a hypothetical 7% average return, Person B has roughly $736,000 in investments. Person A has what they bought. Same income, completely different outcomes — just from a $13k spending gap.',
              },
              {
                type: 'warning',
                heading: 'Watch out: lifestyle creep',
                body: 'You get a $5k raise. Somehow, $5k more flows out the door — nicer restaurant, upgraded phone plan, bigger apartment. The raise felt real but the savings rate didn\'t change. This happens automatically unless you consciously redirect the increase before spending adjusts.',
              },
              {
                type: 'takeaways',
                body: '• High income doesn\'t equal wealth — the gap between earning and spending does\n• Lifestyle creep is silent and nearly universal — watch for it after every income increase\n• Consistent investing over time is more powerful than optimizing any single year',
              },
            ],
            check: {
              question: 'You just got a $12k raise. A friend says "you can finally afford that nicer car payment." A different friend says "that\'s $1k/month toward your future." Who\'s thinking about wealth, not income?',
              reveal: 'The second friend. A raise is an opportunity to widen the earning-spending gap. Using it to increase fixed costs (like a car payment) keeps you financially in the same position, just with a nicer car. Directing even half of a raise toward investing is how the wealth gap compounds over years.',
            },
          },
          {
            id: 'mm-net-worth-intro',
            title: 'What is net worth?',
            icon: 'pie-chart',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Everything you own minus everything you owe. That\'s it. Your net worth could be negative, zero, or positive. All three are just positions on a map — not verdicts on your character or your future.',
              },
              {
                type: 'concept',
                body: 'Assets are things with financial value: savings, investment accounts, the resale value of a car, real estate. Liabilities are what you owe: student loans, credit card balances, a car loan, a mortgage. Net worth = assets − liabilities. Tracking it a few times a year shows whether you\'re moving in the right direction — which matters more than the number itself.',
              },
              {
                type: 'example',
                body: '$3,200 in savings + $12,000 investment account + $7,000 car = $22,200 in assets. $24,500 student loan + $1,800 credit card = $26,300 in liabilities. Net worth: −$4,100. That\'s a starting point, not a failure — especially common early in a career.',
              },
              {
                type: 'action',
                heading: 'Try this right now',
                body: 'Rough it out. Estimate your three biggest assets. Estimate your three biggest debts. Subtract. Whatever the number is — positive, negative, or surprising — write it down somewhere you\'ll find in six months. The trend over time is what matters.',
              },
              {
                type: 'takeaways',
                body: '• Net worth is assets minus liabilities — a snapshot in time, not a life grade\n• Negative is common early in life; the direction of change matters more than the number\n• Track it a few times per year to see financial momentum building',
              },
            ],
            check: {
              question: 'Your car is worth $9,000. Your car loan balance is $11,500. What does this mean for your net worth?',
              reveal: 'You\'re "underwater" on the car — you owe $2,500 more than it\'s worth, so it contributes −$2,500 to your net worth right now. Cars depreciate fast, especially new ones. This is one reason many financial advisors suggest buying slightly used — you avoid the sharpest depreciation curve while the loan balance is highest.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'budget-save',
    title: 'Budgeting & saving',
    description: 'Give every dollar a job, build habits that stick, and fund an emergency cushion.',
    icon: 'piggy-bank',
    modules: [
      {
        title: 'Plans that actually work',
        lessons: [
          {
            id: 'bs-why-budget',
            title: 'Why budget at all?',
            icon: 'sliders-horizontal',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Most people hate the word "budget." It sounds like a financial diet — something restrictive that you inevitably fail. But a budget isn\'t a restriction. It\'s a plan you write before you spend, so your money goes where you actually want it instead of disappearing into the void.',
              },
              {
                type: 'concept',
                body: 'A budget gives every dollar a job before it arrives. Fixed costs go here, food money goes there, fun money goes here, savings go here — decided in advance. When something unexpected comes up, you can see exactly what to shift. Without a plan, surprises feel like crises. With one, they\'re just rerouting.',
              },
              {
                type: 'tip',
                heading: 'The 50/30/20 starting point',
                body: '50% needs (rent, bills, groceries, loan minimums), 30% wants (dining, entertainment, shopping), 20% savings and debt payoff. It\'s not perfect for everyone — especially in high cost-of-living areas — but it\'s a useful frame to reality-check against. If your "needs" are 75%, something structural needs addressing.',
              },
              {
                type: 'warning',
                heading: 'Don\'t try to track every cent',
                body: 'Zero-sum budgeting sounds good in theory and burns out most people by week two. Aim for category awareness and rough numbers, not perfect accounting. Knowing "I spent about $600 on food vs. my $450 target" is useful. Cataloguing every $3.40 purchase is not sustainable.',
              },
              {
                type: 'takeaways',
                body: '• A budget is a spending plan — you decide where money goes before it\'s gone\n• Imperfect category tracking beats perfect-tracking-that-never-happens\n• Automate savings so they compete with nothing',
              },
            ],
            check: {
              question: 'You budgeted $400 for groceries but spent $520 this month. Is this a budget failure?',
              reveal: 'Not necessarily — it\'s data. Maybe groceries genuinely cost $520 where you live. Maybe you ate out less and compensated here. The question is: where did the extra $120 come from? If it came from fun money, that was a real tradeoff you chose. If it came from savings, that\'s worth noticing. Budgets fail when you ignore the data — not when you go over once.',
            },
          },
          {
            id: 'bs-emergency-fund',
            title: 'The emergency fund',
            icon: 'shield',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Your car breaks down. The repair estimate is $1,600. You have three days to pay or you lose the car. Right now — do you have $1,600 sitting somewhere safe? If not, it goes on a credit card at 22% interest, and a $1,600 problem slowly becomes a $2,200 problem.',
              },
              {
                type: 'concept',
                body: 'An emergency fund is cash set aside specifically for unplanned, urgent expenses — job loss, medical bills, car or home repairs. Not for vacations or sales. Just genuine emergencies. The conventional target is 3–6 months of essential expenses, but even $1,000 in a dedicated account changes your options dramatically when life hits.',
              },
              {
                type: 'example',
                body: 'If your essential monthly expenses (rent, bills, food, transport) total $2,400, your first milestone is $2,400 — one month covered. That single month of breathing room means a surprise bill doesn\'t instantly become high-interest debt. After that: three months, then six.',
              },
              {
                type: 'tip',
                heading: 'Keep this money boring',
                body: 'High-yield savings account — not the stock market, not a brokerage account. If your emergency fund drops 25% the week your car breaks down, you have two problems. This money exists for accessibility and stability, not growth. Boring is the feature, not a bug.',
              },
              {
                type: 'takeaways',
                body: '• Emergency funds prevent financial shocks from becoming debt spirals\n• Start small — $500 or one month of expenses is a real, meaningful target\n• Keep it liquid and stable — a separate savings account, not investments',
              },
            ],
            check: {
              question: 'You have $4,000 saved, but it\'s all in your investment (brokerage) account. Is this a solid emergency fund?',
              reveal: 'Not really. If the market drops 30% the week your water heater fails, you\'d have to sell investments at a loss to cover the repair. Emergency funds need to be liquid (accessible immediately) and stable (not volatile). The $4,000 is great — it just belongs in a high-yield savings account, not exposed to market swings.',
            },
          },
          {
            id: 'bs-pay-yourself-first',
            title: 'Pay yourself first',
            icon: 'banknote',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Most people save what\'s left after spending. Which means they often save nothing. "Pay yourself first" flips this: money moves to savings the moment income arrives — before you can spend it. You live on what remains.',
              },
              {
                type: 'concept',
                body: 'Set up an automatic transfer so that, the day after payday, a fixed amount moves to savings or an investment account. You never touch it, so you can\'t spend it on impulse. Over a few months, you stop "missing" that money and adjust your spending to what\'s left. It\'s one of the most consistently effective savings behaviors across all income levels.',
              },
              {
                type: 'example',
                body: 'Saving $300/month starting at 25 vs. starting at 35: at a hypothetical 7% average annual return (not guaranteed), by 65 you\'d have roughly $800k vs. $303k. Same $300/month, 10 years\' difference. The early starter didn\'t save more per month — they just started earlier because the habit was automatic.',
              },
              {
                type: 'action',
                heading: 'Do this in 3 minutes',
                body: 'Log into your bank right now. Find "automatic transfer" or "recurring transfer." Set it to move even $25 or $50 to a savings account the day after your next payday. Schedule it, confirm it, and close the tab. You\'ve just automated the most important financial habit.',
              },
              {
                type: 'takeaways',
                body: '• Automate savings before spending, not after — the order changes everything psychologically\n• Small amounts started early beat large amounts started late\n• Increase the automated amount every time your income rises, before lifestyle adjusts',
              },
            ],
            check: {
              question: 'You save $200/month manually — transferring it yourself when you have leftover money. Your friend automates $150/month every paycheck. After one year, who likely saved more?',
              reveal: 'Your friend. Consistent $150/month automated = $1,800/year, reliably, every year. Your manual $200/month is $2,400 if you actually do it every month — but "when I remember / when I have leftover" fails in practice. Behavioral consistency beats a higher amount with inconsistent execution.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'banking-credit',
    title: 'Banking & credit',
    description: 'How banks, credit scores, and debt actually work in your everyday financial life.',
    icon: 'landmark',
    modules: [
      {
        title: 'Accounts & borrowing',
        lessons: [
          {
            id: 'bc-how-banks-work',
            title: 'Checking, savings, and interest',
            icon: 'landmark',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Your $2,000 in a standard big-bank checking account earned roughly $0.40 last year. The same $2,000 in a high-yield savings account at an online bank might have earned $80–$100. Same FDIC protection. Same balance. $99.60 more — for doing nothing except moving it.',
              },
              {
                type: 'concept',
                body: 'Banks make money by lending out your deposits at higher rates than they pay you. Checking accounts are for daily flow — money in, bills out. Savings accounts are for parking money you don\'t need this week. Online banks, with lower overhead than physical branches, often pass more interest to you. APY (Annual Percentage Yield) is the number that tells you what your savings will actually earn over a year.',
              },
              {
                type: 'example',
                body: '$10,000 at 0.01% APY (typical big-bank checking): earns $1/year. $10,000 at 4.5% APY (competitive high-yield savings): earns $450/year. Both are FDIC-insured up to $250,000. The difference isn\'t risk — it\'s just paying attention.',
              },
              {
                type: 'tip',
                heading: 'Check your APY right now',
                body: 'Open your bank app and find the APY on your savings account. If it\'s below 0.5%, you\'re almost certainly leaving money on the table. Moving savings to a high-yield account at an online bank is one of the easiest, lowest-effort financial improvements you can make — and takes about 20 minutes.',
              },
              {
                type: 'takeaways',
                body: '• Checking is for flow; savings is for goals and your emergency cushion\n• APY differences compound significantly over time — compare before you park money\n• FDIC insurance (up to $250k per account type per bank) covers both at legitimate institutions',
              },
            ],
            check: {
              question: 'Your bank offers 0.02% APY on savings. An online bank offers 4.6% APY — fully FDIC-insured. What\'s the annual difference on an $8,000 balance?',
              reveal: '$8,000 × 0.02% = $1.60/year. $8,000 × 4.6% = $368/year. That\'s $366.40 more per year, just from moving savings to a better account. No investing skill required. Just 20 minutes of setup.',
            },
          },
          {
            id: 'bc-credit-score',
            title: 'Credit scores in plain English',
            icon: 'credit-card',
            readTime: 3,
            sections: [
              {
                type: 'hook',
                body: 'You apply for an apartment. They run your credit. Two days later: "Sorry, we\'ve chosen another applicant." Your score was 614. The landlord wanted 680+. Credit scores show up in more places than most people realize — and you rarely know when they\'re being checked.',
              },
              {
                type: 'concept',
                body: 'A credit score (FICO ranges 300–850) estimates how likely you are to repay borrowed money. Five factors: payment history (biggest), credit utilization (balance-to-limit ratio), length of history, new credit inquiries, and credit mix. The two you control most directly: pay on time and keep balances well below your limits.',
              },
              {
                type: 'example',
                body: 'Two people, both with zero late payments: Person A has $500 balance on a $5,000 limit (10% utilization) — score around 780. Person B has $4,200 on a $5,000 limit (84% utilization) — score around 620. Same bank, same payment record. Just the balance-to-limit ratio creates a ~160 point difference.',
              },
              {
                type: 'warning',
                heading: 'Closing cards can backfire',
                body: 'Closing an old credit card shortens your credit history AND increases your utilization (same debt, less total limit). Both hurt your score. If a card has no annual fee, leaving it open and rarely using it is usually better for your score than closing it.',
              },
              {
                type: 'takeaways',
                body: '• Pay on time, every time — it\'s the single biggest scoring factor\n• Keep card balances under ~30% of your limit (ideally under 10%)\n• Checking your own score is a "soft pull" — it never affects your score',
              },
            ],
            check: {
              question: 'You pay your $800 credit card balance in full every month. Your limit is $1,000. You\'re doing "everything right" — but what might be happening to your score?',
              reveal: 'If the statement closes before you pay, the reported balance ($800 on a $1,000 limit) shows 80% utilization. Bureaus see the balance at statement closing — not after you pay it. Paying mid-cycle, before the statement closes, keeps reported utilization low. Many "responsible" credit users don\'t realize this until their score seems puzzlingly low.',
            },
          },
          {
            id: 'bc-good-debt-bad-debt',
            title: 'Debt: useful vs. costly',
            icon: 'scale',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Not all debt is the same. A 4.5% student loan for a degree that meaningfully raises your income is different from a 29% APR store card balance. One might pay for itself over time. The other is bleeding you quietly every day you carry it.',
              },
              {
                type: 'concept',
                body: 'Compare the interest rate on any debt to what you\'d realistically earn elsewhere. Low-rate debt (some mortgages, some student loans) buys things with long-term value and may be worth keeping while investing. High-rate debt (most credit cards, payday loans) charges more than almost any realistic investment return — paying it off is often the highest-return "investment" available.',
              },
              {
                type: 'example',
                body: 'A $5,000 credit card balance at 24% APR, paying ~$150/month minimum: takes 4 years and costs $2,900 in interest. Total paid: $7,900 for $5,000 of stuff. Every month you carry that balance, you\'re paying a hidden tax on decisions you made in the past.',
              },
              {
                type: 'tip',
                heading: 'The debt avalanche',
                body: 'List debts by interest rate. Pay minimums on everything, then throw every extra dollar at the highest-rate debt first. Once it\'s gone, redirect that money to the next. This minimizes total interest paid. The "snowball" (smallest balance first) is less optimal mathematically but can feel more motivating if psychological wins matter more to you.',
              },
              {
                type: 'takeaways',
                body: '• Compare your debt\'s interest rate to what you\'d earn investing — high-rate debt usually wins\n• Carrying credit card balances is one of the most expensive financial habits\n• Not all debt is bad — rate, purpose, and ability to repay determine it',
              },
            ],
            check: {
              question: 'You have $3,000 in savings earning 4.5% APY and a credit card with $3,000 balance at 22% APR. A friend says "never touch savings." What does the math say?',
              reveal: 'Mathematically, paying off the 22% debt is like earning a guaranteed 22% return — minus the 4.5% you give up on savings — a net benefit of ~17.5%. Very few investments reliably beat that. The emotional case for always having a cash cushion has merit. But the math is clear: high-rate debt usually costs more than any savings account earns.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'economy-you',
    title: 'Inflation & the economy',
    description: 'Why prices change, what rates do to you, and how to think in "real" returns.',
    icon: 'banknote',
    modules: [
      {
        title: 'Big forces, small you',
        lessons: [
          {
            id: 'ie-inflation',
            title: 'What inflation is',
            icon: 'banknote',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: '1970: a gallon of gas costs $0.36. A McDonald\'s burger, $0.65. A new car, $3,500. Same physical stuff. Way fewer dollars. That gap — money buying less over time — is inflation, working quietly across every decade.',
              },
              {
                type: 'concept',
                body: 'Inflation is the general rise in prices over time, measured by tracking a basket of everyday goods and services. A small, steady rate (2–3%) is considered normal. Higher inflation erodes purchasing power faster and hits people on fixed incomes especially hard. When people say investments must "beat inflation," they mean your money should grow faster than prices — otherwise you\'re losing ground even with a positive return.',
              },
              {
                type: 'example',
                body: '$10,000 left in cash for 20 years at 3% average inflation doesn\'t disappear — it\'s still $10,000 in your hand. But it buys roughly what $5,537 bought when you put it away. The dollars are real. The purchasing power was nearly cut in half. "Safe" idle cash is itself a slow financial risk.',
              },
              {
                type: 'warning',
                heading: 'Inflation affects wages too',
                body: 'If your salary grew 2% last year but inflation ran 4%, you effectively took a 2% pay cut — even though your paycheck is nominally larger. Always compare raises to the current inflation rate to know whether you\'re actually getting ahead.',
              },
              {
                type: 'takeaways',
                body: '• Inflation erodes purchasing power — the same dollar buys less over time\n• Idle cash is an inflation risk; long-term investing is one way people try to outpace it\n• "Real" return = your nominal return minus inflation — what actually matters for wealth',
              },
            ],
            check: {
              question: 'You earned 5% on investments last year. Inflation was 3.5%. Did you actually get ahead — and by how much in real terms?',
              reveal: 'Yes, your real return was approximately 1.5% (5% − 3.5%). You outpaced inflation. But if inflation had been 5.5% and your return was 5%, you\'d have lost ground in real terms — even with positive nominal returns. Always think in real returns, not just the percentage on your screen.',
            },
          },
          {
            id: 'ie-interest-rates-you',
            title: 'Interest rates and your life',
            icon: 'percent',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'The Federal Reserve changes a number. Suddenly your savings account pays more — and your friend\'s variable-rate mortgage payment jumps $300/month. You didn\'t do anything. One policy decision rippled through both your lives in opposite directions.',
              },
              {
                type: 'concept',
                body: 'Central banks set short-term rates to manage inflation and economic growth. When rates rise, borrowing costs more (mortgages, car loans, credit cards) but savings accounts may pay more. When rates fall, borrowing gets cheaper while savings yields shrink. You can\'t control policy — but understanding which side of the rate equation your debts and savings fall on is valuable.',
              },
              {
                type: 'example',
                body: '$400,000 mortgage at 3.5%: ~$1,796/month. Same mortgage at 7%: ~$2,661/month. That\'s $865/month more — $10,380/year — for the exact same house. Timing rate moves is nearly impossible, but rate levels dramatically affect what you can afford on a monthly basis.',
              },
              {
                type: 'tip',
                heading: 'Know your rate exposure',
                body: 'Do you have variable-rate debt? Rate hikes directly raise your payment. Fixed-rate mortgage? You\'re locked in — changes don\'t affect you. High-yield savings? Rate hikes can actually be your friend. Know what you have before the next rate cycle starts.',
              },
              {
                type: 'takeaways',
                body: '• Rising rates help savers but hurt borrowers — especially on variable-rate loans\n• Fixed-rate debt locks in your payment; variable-rate moves with the market\n• You can\'t time rates — plan for a range of scenarios',
              },
            ],
            check: {
              question: 'You have a 30-year fixed-rate mortgage at 6.5%. Rates rise to 8.5% this year. What happens to your monthly payment?',
              reveal: 'Nothing — you\'re locked in at 6.5%. Fixed-rate means your payment doesn\'t change regardless of what current market rates do. This is exactly the point of fixed-rate debt: predictability. Variable (adjustable) rates rise and fall with the market, which is why they\'re riskier when rates climb.',
            },
          },
          {
            id: 'ie-purchasing-power',
            title: 'Purchasing power',
            icon: 'wallet',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Your salary went up $4,000 this year. You feel richer. Then you notice groceries, rent, and gas all cost more. Did you actually get ahead? Purchasing power is the real question — not what number is on the paycheck, but what that number can buy.',
              },
              {
                type: 'concept',
                body: 'Purchasing power measures what your money can actually acquire. If prices rise 5% and your salary rises 3%, your purchasing power dropped 2% even though your paycheck grew. This is why comparing "real wages" — adjusted for inflation — matters more than comparing nominal dollar amounts. Long-term wealth building requires growing purchasing power, not just growing numbers.',
              },
              {
                type: 'example',
                body: 'In 2000, $100,000 felt wealthy in many mid-sized U.S. cities. In 2025, that same $100,000 purchases roughly what $60,000–65,000 did in 2000, depending on location and spending mix. The number didn\'t shrink. The purchasing power did.',
              },
              {
                type: 'action',
                heading: 'Try this calculation',
                body: 'Next time you get a raise, subtract your local inflation rate from the percentage increase. If you got 3% and inflation is 2.8%, your real raise is 0.2%. If you got 6% and inflation is 2.8%, you genuinely got ahead by ~3.2%. That\'s how to know if your financial situation is actually improving.',
              },
              {
                type: 'takeaways',
                body: '• A bigger paycheck doesn\'t always mean more purchasing power — inflation adjusts what it buys\n• Real wages and real returns = nominal amount minus inflation\n• Long-term wealth requires growing assets faster than inflation erodes them',
              },
            ],
            check: {
              question: 'Your grandparents paid $650/month for a similar home in 1990. You pay $2,100/month in 2025 for a comparable home. Does this mean housing got more expensive in real terms?',
              reveal: '$650 in 1990 is roughly $1,550 in 2025 dollars after adjusting for general inflation. So $2,100 today is higher than $1,550 inflation-adjusted — meaning housing did get more expensive in real terms in many markets, beyond just inflation. But the $650 wasn\'t "cheap" in your grandparents\' experience — they felt it relative to their 1990 wages.',
            },
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
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'You got the job. Salary: $62,000/year. You do the math: $5,167/month. Your first paycheck deposits $3,710. What happened to $1,457? Welcome to the gap between what you earn and what you actually take home.',
              },
              {
                type: 'concept',
                body: 'Gross pay is the number on your offer letter — before anything is deducted. Net pay (take-home) is what actually lands in your bank after federal tax, state tax, Social Security and Medicare (FICA), health insurance premiums, and any elected deductions like a 401k contribution. This is the number that matters for your actual budget. Planning from gross is a guaranteed shortfall.',
              },
              {
                type: 'example',
                body: '$62,000 salary, paid biweekly = $2,384/paycheck before deductions. Common deductions: Federal tax ~$260, State tax ~$110, FICA ~$180, Health insurance ~$95, 401k at 6% ~$143. Total deductions: ~$788. Net paycheck: ~$1,596. Budget from $1,596 — not $2,384.',
              },
              {
                type: 'tip',
                heading: 'Read your pay stub once',
                body: 'Pull up your actual pay stub and name every line. Health insurance deduction? That\'s your coverage premium. 401k line? That\'s your own money going to your future self. Federal withholding? Your estimated tax prepayment. Understanding each line demystifies one of the most confusing documents in your financial life.',
              },
              {
                type: 'takeaways',
                body: '• Always budget from net (take-home) pay — gross is the starting point, not the spendable amount\n• Each deduction has a purpose — know what you\'re paying for vs. saving\n• Pre-tax retirement contributions reduce your taxable income now (rules vary by account type)',
              },
            ],
            check: {
              question: 'Your annual salary is $78,000. Should you divide $78,000 by 12 to plan your monthly budget?',
              reveal: 'No — that gives you $6,500/month, but your actual take-home is significantly less. After federal/state taxes, FICA, and benefit deductions, a $78k salary might net $4,400–$5,000/month depending on your situation, deductions, and location. Always start from an actual paycheck amount, not gross divided by 12.',
            },
          },
          {
            id: 'tp-withholding-estimates',
            title: 'Withholding and surprises',
            icon: 'file-text',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'April 15th. You file taxes expecting a refund — and owe $2,300 instead. Or: you get a $3,400 refund and feel like you won something. Both are signs of miscalibrated withholding. Neither is ideal.',
              },
              {
                type: 'concept',
                body: 'Withholding is the estimated income tax your employer takes from each paycheck and sends to the government throughout the year. Too much withheld means you get a refund at filing — you lent the government money interest-free. Too little means you owe at filing, possibly with an underpayment penalty. Life changes — new job, marriage, side income, having kids — shift what you should be withholding.',
              },
              {
                type: 'warning',
                heading: 'A big refund isn\'t a bonus',
                body: 'A $3,000 refund is $3,000 of your money that sat with the IRS from January through April, earning nothing. A more accurate withholding means that $250/month stays in your account throughout the year — where it can sit in a high-yield savings account or go toward debt.',
              },
              {
                type: 'tip',
                heading: 'Update after life changes',
                body: 'The IRS offers a free Tax Withholding Estimator at IRS.gov. After major life events — new job, marriage, divorce, a side business, buying a home — spend 20 minutes with it and update your W-4 with your employer. Self-employed? You likely need to pay quarterly estimated taxes instead.',
              },
              {
                type: 'takeaways',
                body: '• Withholding is estimated tax paid throughout the year — a refund means overpaid, a bill means underpaid\n• A large refund is your money returned without interest — not a surprise gift\n• Update your W-4 after major life changes: new job, marriage, side income, dependents',
              },
            ],
            check: {
              question: 'You start a side business earning an extra $15,000 this year. Your day-job withholding stays the same. What\'s likely to happen at tax time?',
              reveal: 'You\'ll likely owe taxes — possibly more than expected. Side income isn\'t automatically withheld. You may owe both income tax and self-employment tax (~15.3%) on that $15k. Without quarterly estimated payments, the IRS may also charge an underpayment penalty. First move: set aside 25–30% of side income into a separate savings account as you earn it.',
            },
          },
          {
            id: 'tp-tax-advantaged-accounts',
            title: '401(k), IRA, and labels that matter',
            icon: 'briefcase',
            readTime: 3,
            sections: [
              {
                type: 'hook',
                body: 'Two people invest $500/month. One does it in a regular brokerage. One does it in a 401k. Same $500, same fund. After 20 years, the 401k investor likely has meaningfully more — not from skill, just from tax math working in their favor.',
              },
              {
                type: 'concept',
                body: 'Tax-advantaged accounts are investment accounts with special government rules. The main types: 401(k)/403(b) through employers; Traditional and Roth IRAs individually. "Traditional" usually means pre-tax contributions (lowers taxable income now, you pay taxes when you withdraw in retirement). "Roth" usually means after-tax contributions (you pay taxes now, withdrawals in retirement may be tax-free). Rules, limits, and eligibility change — look up current-year limits.',
              },
              {
                type: 'example',
                body: 'Employer 401k match: your company matches 50% of your contributions up to 6% of salary. On a $60,000 salary, if you contribute 6% ($3,600/year), they add $1,800. That\'s a guaranteed 50% return on your $3,600 before any market movement. Leaving this on the table because you "can\'t afford to contribute" is one of the most common expensive financial decisions.',
              },
              {
                type: 'warning',
                heading: 'Vesting schedules are real',
                body: 'Employer match money often doesn\'t fully belong to you immediately. If you leave before 3 years (or whatever your plan\'s schedule is), you may forfeit some or all of the matched funds. Know your vesting schedule before job-hopping early in your tenure.',
              },
              {
                type: 'takeaways',
                body: '• Contribute at least enough to capture the full employer match — it\'s literally part of your pay\n• Traditional = tax break now; Roth = potential tax-free growth later (simplified view)\n• Early withdrawals typically trigger taxes plus a 10% penalty — these are long-term accounts',
              },
            ],
            check: {
              question: 'You\'re 28, your emergency fund is covered, and you have no high-rate debt. Should you contribute to a Roth IRA vs. just putting extra money in regular savings?',
              reveal: 'For most 28-year-olds, the Roth IRA is likely better for long-term wealth. Money grows for 30+ years without annual taxes on gains, and qualified withdrawals in retirement may be tax-free per current rules. Regular savings accounts are taxed on interest every year. The Roth compounds largely undisturbed. Rules, limits, and income phase-outs apply — this is educational context, not advice for your specific situation.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'insurance-protection',
    title: 'Insurance & protection',
    description: 'Transfer the big risks you can\'t afford — without buying more than you need.',
    icon: 'shield',
    modules: [
      {
        title: 'Risk transfer',
        lessons: [
          {
            id: 'ip-why-insurance',
            title: 'Why insurance exists',
            icon: 'shield',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'In any given year, you probably won\'t need a $150,000 hospital bill covered. Or $60,000 because you totaled someone\'s car. Or your apartment burning down. "Probably" isn\'t "definitely." Insurance is what you buy when you can\'t afford to be wrong.',
              },
              {
                type: 'concept',
                body: 'Insurance pools risk: thousands of people pay small regular amounts (premiums) so that the few who face large losses can be covered. You\'re not paying to be unlucky. You\'re transferring a catastrophic risk you can\'t absorb yourself. The test: if this event happened, could you recover financially without serious debt or crisis? If no — you probably need insurance for it.',
              },
              {
                type: 'example',
                body: 'A healthy 30-year-old pays $350/month for health insurance for years without a serious illness. Then: emergency appendix surgery — $50,000+ hospital bill. The decade of premiums (~$42,000) covered one event that could have taken years to repay. The "waste" of premiums in healthy years is the feature, not the bug.',
              },
              {
                type: 'tip',
                heading: 'Shop coverage, not just price',
                body: 'Two policies with similar premiums can have dramatically different coverage. Read what\'s excluded. Ask: what\'s the deductible? What\'s the out-of-pocket maximum? What situations aren\'t covered? Cheap insurance that doesn\'t cover the actual risk is worse than being uninsured — it gives false confidence.',
              },
              {
                type: 'takeaways',
                body: '• Insurance transfers catastrophic risk you can\'t absorb yourself — it\'s protection, not investment\n• The "waste" of premiums in claim-free years is the point — you bought certainty\n• Coverage details matter more than price — read exclusions and limits carefully',
              },
            ],
            check: {
              question: 'A basic health insurance plan with an $8,000 deductible costs $180/month. A comprehensive plan costs $390/month. Which is automatically better?',
              reveal: 'Neither — it depends on your savings and health situation. The basic plan costs $2,160/year in premiums. If you have $8,000 in emergency savings and stay healthy, you\'d come out ahead. If a health issue happens and you don\'t have $8,000 available, the "cheap" plan becomes very expensive. Match your deductible to what you can actually pay without going into debt.',
            },
          },
          {
            id: 'ip-common-types',
            title: 'Health, auto, renters, homeowners',
            icon: 'building-2',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Renters insurance. Most renters don\'t have it. A theft, a fire in the next unit, your laptop stolen from a coffee shop — you\'re out thousands. Renters insurance typically costs $15–$25/month. Less than a streaming subscription for coverage most renters never think about until it\'s too late.',
              },
              {
                type: 'concept',
                body: 'Different types of insurance cover different risks. Health insurance covers medical costs. Auto insurance covers vehicle-related liability and damage (legally required in most states). Renters insurance covers your belongings and personal liability in a rental. Homeowners insurance covers the structure and contents of a home you own. Life insurance replaces income for people who depend on you financially — most important when someone relies on your paycheck.',
              },
              {
                type: 'example',
                body: 'Laptop, two monitors, furniture, clothes, bike, and kitchen gear in a studio apartment: replacement value roughly $12,000–$18,000. Renters insurance for that apartment: $180–$300/year. If water damage or theft happens, insurance covers the loss. Without it, you start from zero.',
              },
              {
                type: 'warning',
                heading: 'Auto minimums may not be enough',
                body: 'Most states require minimum liability coverage — often $25k/$50k bodily injury. If you cause a serious accident and someone has $200k in medical bills, you\'re personally on the hook for the difference. "Minimum required" doesn\'t mean "adequate." Consider higher limits if you have assets to protect.',
              },
              {
                type: 'takeaways',
                body: '• Renters insurance is inexpensive and widely overlooked — consider getting it if you rent\n• Legal minimums for auto aren\'t always adequate to protect your personal assets\n• Life insurance matters most when someone depends on your income to live',
              },
            ],
            check: {
              question: 'There\'s a fire in the neighboring apartment unit and smoke and water damage destroys your furniture, clothes, and electronics. Does your landlord\'s insurance cover your belongings?',
              reveal: 'No — your landlord\'s insurance covers the building structure, not your personal property inside it. This is the most common misconception about renting. Your stuff is only covered if you have your own renters insurance policy. The landlord\'s policy doesn\'t extend to tenants\' belongings — that\'s exactly what renters insurance is for.',
            },
          },
          {
            id: 'ip-deductibles-premiums',
            title: 'Deductibles and premiums',
            icon: 'scale',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Lower monthly bill or less to pay when something goes wrong? That\'s the deductible vs. premium tradeoff. It\'s not a trick question. The right answer depends entirely on how much cash you have available when an emergency hits.',
              },
              {
                type: 'concept',
                body: 'Premium is what you pay regularly to maintain coverage. Deductible is what you pay out-of-pocket on a claim before insurance covers the rest. High deductible = lower premium, more exposure on a claim. Low deductible = higher premium, less you pay when something happens. Neither is objectively better — the question is what you can actually absorb.',
              },
              {
                type: 'example',
                body: 'Car insurance Option A: $95/month, $500 deductible. Option B: $62/month, $2,500 deductible. Annual difference: $396. Over 5 claim-free years, Option B saves ~$1,980. But in the first year with an at-fault accident, Option B costs $2,000 more out-of-pocket. The math depends on how likely claims are and what you have saved.',
              },
              {
                type: 'action',
                heading: 'Check your deductibles now',
                body: 'Look up your current deductibles for health, auto, and renters/homeowners insurance. Then ask honestly: if I needed to pay this amount tomorrow, could I do it without going into debt? If not, your deductible and your emergency fund are mismatched — one needs to change.',
              },
              {
                type: 'takeaways',
                body: '• Premium is your regular cost; deductible is your cost when you actually file a claim\n• Higher deductibles require enough emergency savings to cover them — otherwise it\'s a trap\n• Match your deductibles to what you can actually pay when life goes sideways',
              },
            ],
            check: {
              question: 'You have $400 in savings and a $1,500 health insurance deductible. You have a clinic visit for a minor injury. The bill is $900. What happens?',
              reveal: 'You owe $900 out-of-pocket (since you haven\'t met your $1,500 deductible). But you only have $400 — meaning $500 goes on a credit card or causes a crunch. This is a classic deductible-savings mismatch. Solution: either build savings to cover your full deductible, or choose a lower-deductible plan while savings are still building.',
            },
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
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'In 2004, Google went public. Someone invested $10,000. By 2024, that investment was worth roughly $1.3 million — not because they did anything clever, but because they owned a small piece of a business that grew enormously. That\'s what a stock is: ownership.',
              },
              {
                type: 'concept',
                body: 'A stock (or share) is a fractional ownership stake in a company. Buy Apple stock, and you own a tiny piece of Apple — the brand, the products, future profits, and the risk. If the company\'s value grows, your stake is worth more. If it struggles, your stake may be worth less. Shareholders can vote on certain company decisions and may receive dividends if the company pays them.',
              },
              {
                type: 'example',
                body: '10,000 shares outstanding. You buy 100 shares at $5 each — you own 1% of the company for $500. The company triples in value: your shares are worth $1,500. The company fails: your $500 is $0. The potential gain and the risk come from the same ownership — you can\'t have one without the other.',
              },
              {
                type: 'warning',
                heading: 'Stocks are not savings accounts',
                body: 'The S&P 500 index dropped ~50% from 2007 to 2009. Someone who bought at the 2008 peak watched their portfolio halve before recovering. The long-term trend has historically been upward — but the short-term is genuinely volatile, and there are no guarantees. Never invest money in stocks that you need within 1–3 years.',
              },
              {
                type: 'takeaways',
                body: '• Stocks are ownership stakes — you share in gains and losses alike\n• Price is driven by expectations, news, and sentiment — noisy short-term, more meaningful long-term\n• Stocks carry real risk; only invest money you genuinely won\'t need for years',
              },
            ],
            check: {
              question: 'You own 50 shares of a company at $20/share ($1,000 total). The company doubles its profits for 3 consecutive years. Does your stock definitely double?',
              reveal: 'Not necessarily. Stock price reflects future expectations, not just current profits. If the market already expected this growth when you bought at $20, the price may barely move — that expectation was already "priced in." This is why "great company ≠ great stock." The current price already incorporates much of what\'s known.',
            },
          },
          {
            id: 'inv-market-basics',
            title: 'How markets move',
            icon: 'landmark',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'A single stock price changes thousands of times per day. Wars, earnings reports, inflation data, social media posts. But over 30 years, the S&P 500 has gone from ~330 to ~5,000. Daily noise. Long-term signal. Learning to tell them apart is half the game.',
              },
              {
                type: 'concept',
                body: 'A stock market is where buyers and sellers agree on prices in real time — prices emerge from orders, not from an authority. Indices like the S&P 500 track groups of stocks to summarize how a slice of the market is doing. They\'re measuring tools, not things you directly buy. You access them through index funds or ETFs (covered in the next course).',
              },
              {
                type: 'example',
                body: 'A company reports earnings 20% above expectations — stock jumps 8% in an hour. The Fed hints at higher rates — the whole market drops 1.5% the same day. News moves price. But the effect often reverses, exaggerates, or fully reverses within days. Most individual news events are short-term noise.',
              },
              {
                type: 'tip',
                heading: 'Time in market vs. timing the market',
                body: 'Research consistently shows that investors who try to time the market — selling before drops, buying before rises — consistently underperform those who stay invested. Missing just the 10 best trading days in a decade can cut your returns nearly in half. Long-term patience tends to beat short-term cleverness.',
              },
              {
                type: 'takeaways',
                body: '• Prices emerge from buyer/seller agreement — news and sentiment drive short-term moves\n• Indices like the S&P 500 are measuring sticks, not investments themselves\n• Short-term market moves are mostly unpredictable — long-term trends are more meaningful',
              },
            ],
            check: {
              question: 'The market drops 8% in one week due to inflation fears. You have investments you don\'t need for 15 years. What does historical evidence suggest you should do?',
              reveal: 'Stay invested — and possibly stop checking. Market drops of 10%+ are normal: the S&P 500 has historically had a significant intra-year decline in most years while still ending positive. Selling during a drop locks in a loss permanently. For a 15-year horizon, what matters is the price in 15 years — not this week\'s price.',
            },
          },
          {
            id: 'inv-risk-return-basics',
            title: 'Risk and expected return',
            icon: 'scale',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'A savings account paying 4.5% and a single tech stock that also happened to return 4.5% last year. Same return. Completely different risk — one could go to zero, one never will. Understanding risk is more important than chasing returns.',
              },
              {
                type: 'concept',
                body: 'Expected return and risk are tied together by design — this isn\'t accidental. Low risk = lower expected return (cash, government bonds). Higher risk = higher potential return, with more potential for serious loss. If a "guaranteed" high-return investment existed, everyone would buy it until the price rose and the yield fell, reflecting the true risk. Markets are efficient enough that free lunches are rare.',
              },
              {
                type: 'example',
                body: 'U.S. Treasury bonds: government-backed, very low default risk, historically ~2–4% returns. A diversified stock market fund: company + market risk, historical long-term average ~8–10% (no guarantees, past ≠ future). The extra ~5–6% comes with years where it drops 30–40%. The question isn\'t "which is better" — it\'s "which fits my timeline and stress tolerance."',
              },
              {
                type: 'action',
                heading: 'Know your real risk tolerance',
                body: 'Imagine your investments drop 35% overnight — $10,000 becomes $6,500. Do you: (A) sell immediately to stop further loss, (B) feel sick but hold, or (C) consider buying more? Your honest answer reveals more about your real risk tolerance than any questionnaire. Most people overestimate their tolerance until it\'s real.',
              },
              {
                type: 'takeaways',
                body: '• Higher expected return requires accepting higher potential loss — there\'s no escaping this tradeoff\n• Risk tolerance is both emotional (can you sleep?) and financial (can you wait for recovery?)\n• Only put money in volatile assets that you genuinely won\'t need for years',
              },
            ],
            check: {
              question: 'An investment "guarantees" 15% annual returns with no risk, backed by a well-known name. Should this excite you or concern you?',
              reveal: 'Concern you — significantly. Guaranteed high returns with no risk is the signature of fraud or deep misrepresentation. Legitimate high returns come with real risk. When a recognizable name backs an unrealistic promise, that name is being used to borrow credibility. This is how Ponzi schemes including Bernie Madoff\'s operated for decades.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'funds-risk',
    title: 'Funds, bonds & diversification',
    description: 'ETFs, bonds, and why spreading risk across many assets changes outcomes.',
    icon: 'layers',
    modules: [
      {
        title: 'Building blocks',
        lessons: [
          {
            id: 'fb-etfs',
            title: 'ETFs and mutual funds',
            icon: 'layers',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Instead of picking one company to bet on, what if you owned a tiny piece of all 500 largest American companies at once? That\'s essentially what an S&P 500 index ETF does. One purchase, instant spread across Apple, Microsoft, JPMorgan, Berkshire — all in.',
              },
              {
                type: 'concept',
                body: 'ETFs (Exchange-Traded Funds) and mutual funds both pool money from investors to hold a collection of securities. ETFs trade on exchanges throughout the day like stocks. Most mutual funds price once daily. Index funds passively track a benchmark (like the S&P 500), holding the same stocks in the same proportions. Active funds have managers picking stocks, trying to beat the index.',
              },
              {
                type: 'example',
                body: 'An S&P 500 index ETF with a 0.03% expense ratio: on $10,000, that\'s $3/year. An actively managed fund at 1%/year: $100/year. The fee difference, compounded over 30 years on $10,000 — even if both funds perform identically — amounts to thousands of dollars. And most active funds don\'t consistently beat the index after fees.',
              },
              {
                type: 'warning',
                heading: 'Funds still carry market risk',
                body: 'Index funds hold the market — so when the market drops 30%, your broad index fund also drops ~30%. Diversification across hundreds of companies eliminates company-specific risk (one company failing) but doesn\'t protect you from a broad market decline. It reduces certain risks; it doesn\'t eliminate risk.',
              },
              {
                type: 'takeaways',
                body: '• Index ETFs offer broad diversification in one purchase at very low cost\n• Expense ratio is the annual fee — even small differences compound enormously over decades\n• Funds reduce company-specific risk but not overall market risk',
              },
            ],
            check: {
              question: 'You invest $500 in an S&P 500 ETF. The next month, a major tech company in the index crashes 60%. What happens to your $500?',
              reveal: 'Much less than 60% loss — because the ETF holds ~500 companies. If that tech company represents 4% of the index, a 60% drop in that one company reduces your ETF by about 2.4%. This is diversification working: one company exploding doesn\'t take your whole investment with it — unlike owning that single stock outright.',
            },
          },
          {
            id: 'fb-bonds',
            title: 'Bonds in plain terms',
            icon: 'file-text',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'The U.S. government needs money. Instead of printing it, they borrow it — from you. You lend them $1,000. They pay you interest every 6 months for 10 years. Then they give you your $1,000 back. That\'s a Treasury bond. Simple as that.',
              },
              {
                type: 'concept',
                body: 'A bond is a loan from investor to borrower — usually a government or corporation. The borrower promises to pay interest (the "coupon rate") and return the principal at maturity. Bonds are generally less volatile than stocks. But they\'re not risk-free: companies can default, and bond prices move inversely to interest rates — a relationship worth understanding.',
              },
              {
                type: 'example',
                body: 'You buy a $1,000 corporate bond at 5% annual interest, 5-year maturity. You receive $50/year for 5 years ($250 total), then your $1,000 back. Total received: $1,250. If you need to sell before maturity and rates have since risen to 7%, your bond is less attractive — buyers will pay less than $1,000 for a 5% bond when new bonds pay 7%.',
              },
              {
                type: 'tip',
                heading: 'Stocks + bonds in a portfolio',
                body: 'During major stock market crashes, high-quality government bonds have historically sometimes cushioned portfolios (2008: stocks −38%, long-term Treasuries +26%). This behavior makes them useful for balance — though as 2022 showed when both fell together, the relationship isn\'t guaranteed. Bonds add a different kind of exposure, not a magic hedge.',
              },
              {
                type: 'takeaways',
                body: '• Bonds are loans to governments or companies — interest income, principal returned at maturity\n• Bond prices fall when interest rates rise — selling before maturity can mean a loss\n• They can provide portfolio stability but "low risk" doesn\'t mean zero risk',
              },
            ],
            check: {
              question: 'You buy a 10-year government bond paying 3% interest. Two years later, rates rise to 6%. You need to sell your bond early. What happens?',
              reveal: 'Your bond pays 3%, but new bonds now pay 6%. Nobody will pay full price for a lower-yield bond when they can get higher yield elsewhere. You\'ll likely sell at a discount — meaning a loss relative to face value. If you hold to maturity (8 more years), you still receive your $1,000 back plus 3% interest throughout. The loss is only realized if you sell early.',
            },
          },
          {
            id: 'fb-diversification',
            title: 'Diversification and concentration',
            icon: 'pie-chart',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'Enron employees had 60%+ of their 401k in Enron stock. When Enron collapsed due to fraud, they lost their jobs and their retirement in the same week. Diversification isn\'t a theory — it\'s what prevents one bad outcome from ending your financial story.',
              },
              {
                type: 'concept',
                body: 'Diversification spreads investments across different companies, sectors, and geographies so that one failure doesn\'t sink everything. Company-specific risk (one company failing) can be nearly eliminated by owning many. Market risk (the whole economy declining) cannot be diversified away — it affects everything broadly. Those are two distinct types of risk.',
              },
              {
                type: 'example',
                body: 'Portfolio A: 100% in a single airline. COVID hits — stock drops 80%. Portfolio B: S&P 500 index fund. COVID hits — drops 34%, then fully recovers within 6 months. Same macro event. Dramatically different outcome — not from skill, but from not being concentrated in one company or sector.',
              },
              {
                type: 'warning',
                heading: 'Home-country bias',
                body: 'Most investors overweight their home country. A U.S. investor with 90% U.S. stocks has concentrated exposure to one country\'s economic cycle. International diversification isn\'t always better performance — but it\'s insurance against the U.S. specifically underperforming over your investing horizon.',
              },
              {
                type: 'takeaways',
                body: '• Diversification eliminates company-specific risk; it cannot eliminate market-wide risk\n• A broad index fund provides instant diversification across hundreds of companies\n• Geographic diversification (international stocks) is a layer many investors overlook',
              },
            ],
            check: {
              question: 'You own 10 stocks across 3 companies, all in U.S. tech. Are you well-diversified?',
              reveal: 'Partially — you\'re protected if one company fails (10 stocks). But you\'re heavily concentrated in one sector (tech) and one country (U.S.). If the tech sector broadly falls — as it did in 2022, down ~33% — all 10 of your holdings could fall significantly together. True diversification includes multiple sectors, geographies, and ideally asset classes.',
            },
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
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'You wouldn\'t drive a car on a highway for the first time during rush hour. You\'d practice in an empty lot first. Investing real money before you understand the mechanics is highway-first learning.',
              },
              {
                type: 'concept',
                body: 'Simulators let you practice the mechanics — placing orders, watching positions, feeling a portfolio drop and wondering whether to sell — without the financial consequence. The purpose isn\'t to generate guaranteed future results. It\'s to build familiarity, reduce emotionally-driven decisions, and expose what you don\'t know before real money is at stake.',
              },
              {
                type: 'example',
                body: 'In the 2020 COVID crash, the S&P 500 dropped 34% in 33 days — then recovered to all-time highs within 6 months. Investors who panicked and sold locked in real losses. Those who held or bought more came out significantly ahead. Running through scenarios like this in a simulator builds the mental model before real money tests it.',
              },
              {
                type: 'tip',
                heading: 'Use the simulator like a scientist',
                body: 'Don\'t just try to "win." Try experiments: all-in on one stock vs. diversified across 10. What does a 15% portfolio drop feel like on screen? Write down your decision rules before you trade. Reviewing those rules after teaches you things about your own behavior that no textbook can.',
              },
              {
                type: 'takeaways',
                body: '• Practice reduces emotional decision-making when real money is on the line\n• Use the simulator to test strategy and process — not just to see a green number\n• Write down your rules before you trade; review them after to learn about yourself',
              },
            ],
            check: {
              question: 'Your simulated portfolio drops 22% in three weeks. You feel a strong urge to sell everything. What should you do — and what does this feeling tell you?',
              reveal: 'In the simulator, this is perfect data about yourself. If the urge to sell at −22% is overwhelming, your real risk tolerance may be lower than you assumed. In a real portfolio, this might mean you\'re overexposed to volatile assets, or your emergency fund isn\'t large enough to let you wait out a downturn. Treat this feeling as information, not just discomfort.',
            },
          },
          {
            id: 'gs-brokerage-accounts',
            title: 'Accounts and order basics',
            icon: 'briefcase',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'You log into a brokerage. Type in a ticker. Hit Buy. A number changes. What just happened — where did the money go, did you get a fair price, when does it settle? Understanding mechanics before you use them saves expensive surprises.',
              },
              {
                type: 'concept',
                body: 'A brokerage account holds your investments — cash, stocks, ETFs, bonds. Taxable accounts are taxed on dividends and realized gains each year. Retirement accounts (IRA, 401k) have special tax rules and withdrawal restrictions. Order types: market orders fill quickly at the current price (fast, less precise); limit orders only fill at your specified price or better (controlled, may not fill if price moves away).',
              },
              {
                type: 'example',
                body: 'Market order on a volatile stock at market open: you click buy when the quote shows $45.00 but the order fills at $45.80 — "slippage." A limit order at $45.00 would fill only at $45.00 or below, protecting you from the bad fill, but might not fill at all if price moves up. Fast-moving stocks: limit orders protect you. Stable blue chips: market orders usually fine.',
              },
              {
                type: 'tip',
                heading: 'Settlement timing matters',
                body: 'When you buy or sell, the trade doesn\'t fully settle immediately — stock trades typically settle T+1 (next business day). This means cash from a sale isn\'t always available for instant withdrawal. Understand your brokerage\'s settlement rules before making rapid back-to-back trades or relying on proceeds for time-sensitive payments.',
              },
              {
                type: 'takeaways',
                body: '• Know whether your account is taxable or tax-advantaged — they have very different rules\n• Market orders are fast and imprecise; limit orders are controlled but may not fill\n• Settlement timing affects when cash is actually available after a sale',
              },
            ],
            check: {
              question: 'You sell $5,000 of stock Monday morning and want to withdraw that cash to a bank account by Tuesday. Can you?',
              reveal: 'Possibly not. Most stock trades settle T+1 (next business day), so the cash may not be fully settled until Tuesday. Some brokerages allow use of unsettled funds for purchases but restrict withdrawals until full settlement. Never count on stock sale proceeds for a time-sensitive bill without checking your specific brokerage\'s settlement timeline first.',
            },
          },
          {
            id: 'gs-simulator-mindset',
            title: 'Using the simulator wisely',
            icon: 'rocket',
            readTime: 2,
            sections: [
              {
                type: 'hook',
                body: 'You made $2,000 in the simulator in a week. Your instinct: "I\'m good at this." The better reaction: "That was one week in one market condition. I have no idea how I\'d behave in a real crash."',
              },
              {
                type: 'concept',
                body: 'Simulators are valuable tools — but the psychological gap between virtual money and real money is larger than most people expect. Watching $40,000 drop to $24,000 in real dollars triggers physical stress responses that fake money simply doesn\'t. Simulators teach mechanics and expose knowledge gaps. They don\'t fully replicate what a real bear market feels like.',
              },
              {
                type: 'action',
                heading: '3 specific exercises for the NestWise simulator',
                body: '(1) Run a diversified portfolio and a concentrated one simultaneously for 60 days — then compare both the returns and how each felt. (2) Look at the market history section and imagine you held through a major crash. What would the psychology have been? (3) Write three trading rules before your first trade — then check yourself on whether you followed them.',
              },
              {
                type: 'warning',
                heading: 'Simulator success ≠ investing skill',
                body: '2021 was a bull market that made almost every strategy look genius. 2022 showed the other side. Strong simulator returns in a rising market prove familiarity with the interface, not skill at investing through a full market cycle. Humility about what the simulator does — and doesn\'t — teach is part of the real lesson.',
              },
              {
                type: 'takeaways',
                body: '• Simulators teach process and expose gaps — not whether you\'re talented at market timing\n• The emotional reality of real losses is fundamentally different from virtual ones\n• Financial literacy is a system: budgeting, credit, saving, and investing all connect',
              },
            ],
            check: {
              question: 'After 3 months in the simulator you\'re up 18% with a concentrated tech strategy. A friend says "just do this with real money." What\'s the most important question to ask first?',
              reveal: 'Would you have held through a 35% drop? In 2022, concentrated tech portfolios regularly fell 40–60%. Simulator success in a growth period doesn\'t tell you how you\'d behave in a real bear market — or whether the 18% was skill or a rising tide lifting all boats. Ask: do I understand why this worked, and could I stay the course when it doesn\'t?',
            },
          },
        ],
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export function getAllLessonIds(): string[] {
  const ids: string[] = []
  for (const course of courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) ids.push(lesson.id)
    }
  }
  return ids
}

export function getTotalReadTime(course: Course): number {
  return course.modules.flatMap((m) => m.lessons).reduce((s, l) => s + l.readTime, 0)
}
