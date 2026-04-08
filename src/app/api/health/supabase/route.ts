import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * GET /api/health/supabase
 * Verifies env vars and that core tables exist (NestWise schema was applied).
 */
export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()

  if (!url || !key) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          'Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env, then restart the dev server.',
      },
      { status: 200 }
    )
  }

  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return NextResponse.json(
        {
          ok: false,
          configured: false,
          message: 'NEXT_PUBLIC_SUPABASE_URL must start with https:// (see Supabase → Settings → API → Project URL).',
        },
        { status: 200 }
      )
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: 'NEXT_PUBLIC_SUPABASE_URL is not a valid URL.',
      },
      { status: 200 }
    )
  }

  try {
    const supabase = createClient(url, key)
    const { error } = await supabase.from('portfolios').select('id').limit(1)

    if (error) {
      const msg = error.message || String(error)
      const missingTable =
        /does not exist|schema cache/i.test(msg) || (error as { code?: string }).code === '42P01'
      return NextResponse.json({
        ok: false,
        configured: true,
        message: msg,
        hint: missingTable
          ? 'Tables are missing. Open Supabase Dashboard → SQL → New query, paste the full contents of supabase-schema.sql from this repo, and click Run.'
          : 'Check Supabase project status, API keys, and that Row Level Security allows the anon role (this project disables RLS on NestWise tables).',
      })
    }

    const { error: progressError } = await supabase.from('user_learn_progress').select('id').limit(1)
    if (progressError && /does not exist|schema cache/i.test(progressError.message)) {
      return NextResponse.json({
        ok: false,
        configured: true,
        message: 'Core table `portfolios` exists but newer tables (e.g. user_learn_progress) are missing.',
        hint: 'Re-run the full supabase-schema.sql in Supabase SQL Editor so all tables are created.',
      })
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      message: 'Connected to Supabase; NestWise tables are present.',
    })
  } catch (e) {
    return NextResponse.json({
      ok: false,
      configured: true,
      message: e instanceof Error ? e.message : String(e),
      hint: 'Network error or invalid Supabase URL/key.',
    })
  }
}
