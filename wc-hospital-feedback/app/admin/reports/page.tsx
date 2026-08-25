import ReportClient from '@/components/admin/ReportClient'

export default function ReportsPage() {
  const currentYear = new Date().getFullYear()
  const months = []

  for (let y = currentYear; y >= currentYear - 1; y--) {
    for (let m = 12; m >= 1; m--) {
      const d = new Date(y, m - 1, 1)
      if (d <= new Date()) {
        months.push({
          value: `${y}-${m}`,
          label: d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }),
        })
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gov-900">Monthly Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate and download PDF reports for government submission.
        </p>
      </div>
      <ReportClient months={months} />
    </div>
  )
}
