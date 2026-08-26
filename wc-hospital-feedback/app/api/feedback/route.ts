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
    const sentiment = analysis?.sentiment ?? 'pending'
    console.debug('[Final sentiment]', { sentiment })
    console.debug('[Final issue]', { issue: analysis?.issue ?? null })
    console.debug('[Final ai_summary]', { ai_summary: analysis?.summary ?? null })
    const insertPayload = {
      user_id: user.id,
      hospital_id,
      category,
      comment,
      sentiment,
      issue: analysis?.issue ?? null,
      ai_summary: analysis?.summary ?? null,
    }
    console.debug('[Supabase insert payload]', insertPayload)

    // Store feedback (store regardless of AI analysis success)
    const { data: feedback, error: insertErr } = await supabase
      .from('feedback')
      .insert(insertPayload)
      .select()
      .single()

    if (insertErr) {
      console.error('[Supabase insert error]', {
        error: insertErr,
        message: insertErr.message,
        code: insertErr.code,
        details: insertErr.details,
        hint: insertErr.hint,
      })
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
