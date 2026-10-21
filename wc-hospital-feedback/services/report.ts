import { createAdminClient } from '@/lib/supabase/admin'
import { generateHospitalSummary } from './ai'
import type { MonthlyStats } from '@/types/database'
import { aggregateMonthlyStats, createReportPDF } from './report-core'

export async function buildMonthlyStats(
  year: number,
  month: number
): Promise<MonthlyStats[]> {
  const supabase = createAdminClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0) // last day of month
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`

  const { data: hospitals, error: hErr } = await supabase
    .from('hospitals')
    .select('id, name, district')
    .order('name')

  if (hErr || !hospitals) throw new Error('Failed to load hospitals')

  const { data: feedbackRows, error: fErr } = await supabase
    .from('feedback')
    .select('hospital_id, category, comment, sentiment, issue, ai_summary')
    .gte('created_at', startDate)
    .lte('created_at', endDateStr + 'T23:59:59')

  if (fErr) throw new Error('Failed to load feedback')

  const rows = feedbackRows ?? []
  const stats = aggregateMonthlyStats(hospitals, rows)

  // AI summary
  for (const h of stats) {
    h.ai_summary = await generateHospitalSummary(h.hospital_name, {
      total: h.total,
      positive_pct: h.positive_pct,
      negative_pct: h.negative_pct,
      neutral_pct: h.neutral_pct,
      top_issues: h.top_issues,
      sample_concerns: rows
        .filter((r) => r.hospital_id === h.hospital_id && r.ai_summary)
        .slice(0, 5)
        .map((r) => r.ai_summary as string),
    })
  }

  return stats
}

export async function generatePDFReport(
  year: number,
  month: number,
  stats: MonthlyStats[]
): Promise<Buffer> {
  return Buffer.from(await createReportPDF(year, month, stats))
}
