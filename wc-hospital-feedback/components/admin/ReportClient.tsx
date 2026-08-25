'use client'

import { useState } from 'react'
import { FileDown, Loader2, AlertCircle, CheckCircle, FileBarChart } from 'lucide-react'

interface Props {
  months: { value: string; label: string }[]
}

export default function ReportClient({ months }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(months[1]?.value ?? months[0]?.value ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleGenerate() {
    if (!selectedMonth) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    const [year, month] = selectedMonth.split('-').map(Number)

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to generate report')
        setLoading(false)
        return
      }

      // Download the PDF
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const monthLabel = months.find((m) => m.value === selectedMonth)?.label ?? selectedMonth
      a.download = `WC-Hospital-Feedback-${monthLabel.replace(/\s/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gov-100 rounded-lg flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-gov-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gov-900">Generate Monthly Report</h2>
            <p className="text-xs text-gray-500">
              Produces a PDF with sentiment analysis, top issues, and hospital breakdowns.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="month" className="label">Select reporting period</label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setSuccess(false)
                setError(null)
              }}
              className="input max-w-xs"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Report generated and downloaded successfully.
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !selectedMonth}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating report…
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Generate &amp; Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card p-5 bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">What&apos;s included in the report</h3>
        <ul className="text-xs text-blue-800 space-y-1.5">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            Executive summary with overall submission statistics
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            Per-hospital sentiment breakdown (positive / negative / neutral)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            Top reported issues by frequency
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            AI-generated hospital summary
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            Anonymised representative feedback samples (POPIA compliant)
          </li>
        </ul>
      </div>

      <div className="card p-5 border-amber-200 bg-amber-50">
        <h3 className="text-sm font-semibold text-amber-900 mb-1">Automated Cron Delivery</h3>
        <p className="text-xs text-amber-800">
          Set <code className="bg-amber-100 px-1 py-0.5 rounded">REPORT_RECIPIENT_EMAIL</code> and{' '}
          <code className="bg-amber-100 px-1 py-0.5 rounded">EMAIL_API_KEY</code> in your environment
          variables to enable automatic monthly email delivery via Vercel Cron Job. See README for setup.
        </p>
      </div>
    </div>
  )
}
