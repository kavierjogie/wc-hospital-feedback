'use client'

import { useSearchParams } from 'next/navigation'
import DashboardClient from '@/components/admin/DashboardClient'
import { useDemo } from '@/components/demo/DemoProvider'
import { DEMO_HOSPITALS, dashboardStats, filterFeedback, monthOptions, withHospitals } from '@/lib/demo/data'

export default function DemoDashboardPage() {
  const { feedback } = useDemo()
  const params = useSearchParams()
  const searchParams = { hospital: params.get('hospital') ?? undefined, month: params.get('month') ?? undefined }
  const rows = filterFeedback(withHospitals(feedback), searchParams.hospital, searchParams.month)

  return (
    <DashboardClient
      hospitals={DEMO_HOSPITALS}
      {...dashboardStats(rows)}
      selectedHospitalId={searchParams.hospital}
      selectedMonth={searchParams.month}
      monthOptions={monthOptions()}
    />
  )
}
