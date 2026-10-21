'use client'

import ReportClient from '@/components/admin/ReportClient'
import { useDemo } from '@/components/demo/DemoProvider'
import { DEMO_HOSPITALS, filterFeedback, monthOptions } from '@/lib/demo/data'
import { aggregateMonthlyStats, createReportPDF } from '@/services/report-core'

export default function DemoReportsPage() {
  const { feedback } = useDemo()

  // Same PDF as the live /api/reports/generate route, built in the browser.
  async function generate(year: number, month: number) {
    const stats = aggregateMonthlyStats(DEMO_HOSPITALS, filterFeedback(feedback, undefined, `${year}-${month}`))
    if (stats.length === 0) throw new Error('No feedback data found for the selected period')

    for (const h of stats) {
      const top = h.top_issues[0]
      h.ai_summary =
        `${h.total} submission${h.total !== 1 ? 's' : ''} this period: ${h.positive_pct}% positive, ` +
        `${h.negative_pct}% negative, ${h.neutral_pct}% neutral.` +
        (top ? ` Most reported issue: ${top.issue}.` : '') +
        ' (Demo summary generated locally; live mode uses Groq AI.)'
    }

    return new Blob([await createReportPDF(year, month, stats)], { type: 'application/pdf' })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gov-900">Monthly Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate and download PDF reports for government submission.
        </p>
      </div>
      <ReportClient months={monthOptions(24)} generate={generate} />
    </div>
  )
}
