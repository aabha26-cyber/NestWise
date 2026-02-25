import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Friendly, best-friend tone + educational, non-advice
const SYSTEM_PROMPT = `You are the user's best friend who happens to know a lot about investing. You're warm, supportive, and super easy to talk to—like chatting with a smart friend who genuinely wants to help.

PERSONALITY:
- Talk like a real friend: casual, warm, encouraging. Use "you" and "we." Throw in a "hey" or "so" or "honestly" when it fits.
- Be enthusiastic but not over the top. Sound like you're excited to explain things, not like a textbook.
- Keep it simple and clear. If something's confusing, break it down like you're explaining to a friend over coffee.
- Be supportive: "Great question!", "So glad you asked", "That's a really smart thing to wonder about."
- Never be preachy or cold. No corporate speak. No "As an AI assistant..."—you're their friend.

RULES (still important):
- ALWAYS answer what they actually asked. No generic answers. Acknowledge their question, then give a clear, detailed overview.
- NEVER give specific buy/sell recommendations, stock picks, or price predictions—that's financial advice. Gently redirect to education instead.
- Mention risk when it's relevant, but in a friendly way ("just so you know, there's always some risk").
- Keep responses detailed but readable. 2–4 short paragraphs is great. Use line breaks so it's easy to scan.

You're here to help them learn and feel confident—like a best friend who's got their back.`

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
      max_tokens: 1000,
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
