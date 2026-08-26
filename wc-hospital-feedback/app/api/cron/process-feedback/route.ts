import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyzeFeedback } from '@/services/ai'
import type { FeedbackCategory } from '@/types/database'

export const dynamic = 'force-dynamic'

function isAuthorised(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

export async function GET(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { data: pending, error: selectError } = await supabase
      .from('feedback')
      .select('id, category, comment')
      .eq('sentiment', 'pending')
      .order('created_at', { ascending: true })
      .limit(25)

    if (selectError) throw new Error(`Could not load pending feedback: ${selectError.message}`)

    let processed = 0
    let failed = 0
    for (const feedback of pending ?? []) {
      const analysis = await analyzeFeedback(feedback.comment, feedback.category as FeedbackCategory)
      const { error: updateError } = await supabase
        .from('feedback')
        .update({
          sentiment: analysis?.sentiment ?? 'failed',
          issue: analysis?.issue ?? null,
          ai_summary: analysis?.summary ?? null,
        })
        .eq('id', feedback.id)

      if (updateError) {
        failed += 1
        console.error(`[CRON] Could not update feedback ${feedback.id}: ${updateError.message}`)
      } else {
        processed += 1
      }
    }

    return NextResponse.json({ found: pending?.length ?? 0, processed, failed })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[CRON] Pending feedback processing failed: ${message}`)
    return NextResponse.json({ error: 'Pending feedback processing failed.' }, { status: 500 })
  }
}