import { createAdminClient } from '@/lib/supabase/admin'
import HospitalFilter from '@/components/admin/HospitalFilter'
import FeedbackTable from '@/components/admin/FeedbackTable'
import { MessageSquare } from 'lucide-react'

export const revalidate = 0

interface SearchParams {
  hospital?: string
  month?: string
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createAdminClient()

  const { data: hospitals } = await supabase
    .from('hospitals')
    .select('id, name, district')
    .order('name')

  // Build query
  let query = supabase
    .from('feedback')
    .select('*, hospitals(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchParams.hospital) {
    query = query.eq('hospital_id', searchParams.hospital)
  }

  if (searchParams.month) {
    const [year, month] = searchParams.month.split('-').map(Number)
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}T23:59:59`
    query = query.gte('created_at', start).lte('created_at', end)
  }

  const { data: feedback, count } = await query

  // Build month options (last 12 months)
  const monthOptions: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthOptions.push({
      value: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }),
    })
  }

  const selectedHospital = hospitals?.find((h) => h.id === searchParams.hospital)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gov-900">Feedback Browser</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedHospital
              ? `${selectedHospital.name} — `
              : 'All hospitals — '}
            {feedback?.length ?? 0} submission{feedback?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <HospitalFilter
          hospitals={hospitals ?? []}
          selectedId={searchParams.hospital}
        />

        {/* Month filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="month-filter" className="text-xs text-gray-500">Month:</label>
          <form method="GET">
            {searchParams.hospital && (
              <input type="hidden" name="hospital" value={searchParams.hospital} />
            )}
            <select
              id="month-filter"
              name="month"
              defaultValue={searchParams.month ?? ''}
              className="input text-sm py-1.5 w-auto"
              onChange={(e) => (e.target.form as HTMLFormElement).submit()}
            >
              <option value="">All months</option>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="card p-5">
        {feedback && feedback.length > 0 ? (
          <FeedbackTable feedback={feedback as any} />
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gov-100 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-gov-400" />
            </div>
            <p className="text-sm font-medium text-gov-700">No submissions found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting the hospital or month filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
