import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { feedbackSchema } from '@/lib/validation'
import { analyzeFeedback } from '@/services/ai'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // Auth check
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Parse and validate body
    const body = await req.json()
    const result = feedbackSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { hospital_id, category, comment } = result.data

    // Verify hospital exists
    const { data: hospital, error: hErr } = await supabase
      .from('hospitals')
      .select('id')
      .eq('id', hospital_id)
      .single()

    if (hErr || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 })
    }

    // AI analysis (server-side only — Groq key never leaves the server)
    const analysis = await analyzeFeedback(comment, category)

    // Store feedback (store regardless of AI analysis success)
    const { data: feedback, error: insertErr } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        hospital_id,
        category,
        comment,
        sentiment: analysis?.sentiment ?? 'pending',
        issue: analysis?.issue ?? null,
        ai_summary: analysis?.summary ?? null,
      })
      .select()
      .single()

    if (insertErr) {
      console.error('[API] feedback insert error:', insertErr)
      return NextResponse.json(
        {
          error: `Failed to save feedback: ${insertErr.message} (code: ${insertErr.code}, details: ${insertErr.details || 'none'}, hint: ${insertErr.hint || 'none'})`
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: feedback.id }, { status: 201 })
  } catch (err) {
    console.error('[API] feedback unexpected error:', err)
    const errMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Internal server error: ${errMsg}` }, { status: 500 })
  }
}
