import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildMonthlyStats, generatePDFReport } from '@/services/report'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    // Auth + admin check
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const year = Number(body.year)
    const month = Number(body.month)

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 })
    }

    const stats = await buildMonthlyStats(year, month)

    if (stats.length === 0) {
      return NextResponse.json(
        { error: 'No feedback data found for the selected period' },
        { status: 404 }
      )
    }

    const pdfBuffer = await generatePDFReport(year, month, stats)
    const monthLabel = format(new Date(year, month - 1, 1), 'MMMM-yyyy')

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="WC-Hospital-Feedback-${monthLabel}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (err) {
    console.error('[API] report generate error:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
