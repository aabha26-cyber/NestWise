import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Safety system prompt to ensure educational, non-advice responses
const SYSTEM_PROMPT = `You are an educational investing assistant. Your role is to help people learn about investing concepts, not to provide financial advice.

CRITICAL RULES:
- NEVER provide specific buy/sell recommendations
- NEVER predict stock prices or market movements
- NEVER tell users what to invest in
- Use phrases like "Some people consider...", "One thing to think about...", "It's worth noting that..."
- Always emphasize that investing involves risk
- Explain concepts in simple, beginner-friendly language
- If asked for advice, redirect to educational explanations instead

Your responses should be educational, balanced, and always include risk awareness.`

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Using fallback response.' },
        { status: 503 }
      )
    }

    const { messages } = await request.json()

    // Add system prompt to the beginning of messages
    const messagesWithSystem = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ message: response })
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    )
  }
}
