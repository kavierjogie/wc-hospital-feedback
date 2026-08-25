import { createAdminClient } from '@/lib/supabase/admin'
import HospitalFilter from '@/components/admin/HospitalFilter'
import MonthFilter from '@/components/admin/MonthFilter'
import FeedbackTable from '@/components/admin/FeedbackTable'
import { MessageSquare, AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0

interface SearchParams {
  hospital?: string
  month?: string
}

export default async function AdminFeedbackPage({
  searchParams = {},
}: {
  searchParams?: SearchParams
}) {
  try {
    const supabase = createAdminClient()

    const { data: hospitals, error: hospitalsError } = await supabase
      .from('hospitals')
      .select('id, name, district')
      .order('name')

    if (hospitalsError) {
      console.error('[Admin Feedback Page] Error fetching hospitals:', hospitalsError)
      throw new Error(`Failed to load hospitals: ${hospitalsError.message}`)
    }

    // Build query
    let query = supabase
      .from('feedback')
      .select('*, hospitals(name)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (searchParams?.hospital) {
      query = query.eq('hospital_id', searchParams.hospital)
    }

    if (searchParams?.month) {
      const [year, month] = searchParams.month.split('-').map(Number)
      if (isNaN(year) || isNaN(month)) {
        throw new Error('Invalid month filter format specified.')
      }
      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}T23:59:59`
      query = query.gte('created_at', start).lte('created_at', end)
    }

    const { data: feedback, error: feedbackError } = await query

    if (feedbackError) {
      console.error('[Admin Feedback Page] Error fetching feedback:', feedbackError)
      throw new Error(`Failed to load feedback records: ${feedbackError.message}`)
    }

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

    const selectedHospital = hospitals?.find((h) => h.id === searchParams?.hospital)

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
            selectedId={searchParams?.hospital}
          />

          {/* Month filter */}
          <MonthFilter
            months={monthOptions}
            selectedMonth={searchParams?.month}
          />
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
  } catch (error: any) {
    console.error('[Admin Feedback Page] Server-side crash caught:', error)

    return (
      <div className="max-w-2xl mx-auto my-10 space-y-6">
        <div className="card p-6 border-l-4 border-red-500 bg-white shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900">Application Error</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                The feedback page was unable to load because of a server-side database configuration issue.
              </p>
              <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-md">
                <code className="text-xs text-red-600 block break-all font-mono font-semibold">
                  {error.message || 'An unexpected server exception occurred.'}
                </code>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1.5 pt-2">
                <p className="font-semibold text-gray-700">Troubleshooting checklist for Administrators:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Verify that <code className="bg-gray-100 px-1 py-0.5 rounded text-gov-800">SUPABASE_SERVICE_ROLE_KEY</code> is correctly set in your Vercel environment variables.</li>
                  <li>Ensure the database schema has been initialized and that the <code className="bg-gray-100 px-1 py-0.5 rounded text-gov-800">profiles</code> and <code className="bg-gray-100 px-1 py-0.5 rounded text-gov-800">feedback</code> tables exist.</li>
                  <li>Confirm that the <code className="bg-gray-100 px-1 py-0.5 rounded text-gov-800">004_fix_rls_recursion.sql</code> migration was run to avoid RLS recursion issues.</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <Link
                  href="/admin/feedback"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gov-600 hover:bg-gov-700 rounded-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
