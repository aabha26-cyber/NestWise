import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are an educational investing assistant. You provide short, plain-English overviews of companies/stocks for beginners.

RULES:
- Do NOT give buy/sell recommendations or price predictions.
- Do NOT tell the user to invest or not invest.
- Use simple language. Explain what the company does, why it's known, and what kinds of things investors often consider (pros and cons in general terms).
- Keep the overview to 2–4 short paragraphs. Be factual and educational.
- End with a one-line reminder that this is not financial advice.`

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { overview: null, error: 'AI overview not configured.' },
        { status: 200 }
      )
    }

    const body = await request.json()
    const { symbol, name, description } = body as {
      symbol?: string
      name?: string
      description?: string
    }

    if (!symbol && !name) {
      return NextResponse.json(
        { overview: null, error: 'Missing symbol or name.' },
        { status: 400 }
      )
    }

    const userPrompt = `Write a brief, educational overview for beginners about this stock:
- Symbol: ${symbol ?? 'N/A'}
- Name: ${name ?? 'N/A'}
${description ? `- Company description (use for context): ${description.slice(0, 800)}` : ''}

Write 2–4 short paragraphs in plain English. Do not give investment advice or recommendations.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 400,
    })

    const overview =
      completion.choices[0]?.message?.content?.trim() ||
      'Unable to generate overview. This is not financial advice.'

    return NextResponse.json({ overview })
  } catch (error: unknown) {
    console.error('Stock overview API error:', error)
    return NextResponse.json(
      { overview: null, error: 'Failed to generate overview.' },
      { status: 500 }
    )
  }
}
