'use client'

import { useSearchParams } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import HospitalFilter from '@/components/admin/HospitalFilter'
import MonthFilter from '@/components/admin/MonthFilter'
import FeedbackTable from '@/components/admin/FeedbackTable'
import { useDemo } from '@/components/demo/DemoProvider'
import { DEMO_HOSPITALS, filterFeedback, monthOptions, withHospitals } from '@/lib/demo/data'

export default function DemoAdminFeedbackPage() {
  const { feedback } = useDemo()
  const params = useSearchParams()
  const searchParams = { hospital: params.get('hospital') ?? undefined, month: params.get('month') ?? undefined }
  const rows = filterFeedback(withHospitals(feedback), searchParams.hospital, searchParams.month).slice(0, 100)
  const selectedHospital = DEMO_HOSPITALS.find((h) => h.id === searchParams.hospital)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gov-900">Feedback Browser</h1>
        <p className="text-sm text-gray-500 mt-1">
          {selectedHospital ? `${selectedHospital.name} — ` : 'All hospitals — '}
          {rows.length} submission{rows.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <HospitalFilter hospitals={DEMO_HOSPITALS} selectedId={searchParams.hospital} />
        <MonthFilter months={monthOptions()} selectedMonth={searchParams.month} />
      </div>

      <div className="card p-5">
        {rows.length > 0 ? (
          <FeedbackTable feedback={rows} />
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gov-100 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-gov-400" />
            </div>
            <p className="text-sm font-medium text-gov-700">No submissions found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting the hospital or month filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
