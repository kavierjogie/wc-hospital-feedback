'use client'

import FeedbackList from '@/components/patient/FeedbackList'
import { useDemo } from '@/components/demo/DemoProvider'
import { DEMO_USER_ID, withHospitals } from '@/lib/demo/data'

export default function DemoMyFeedbackPage() {
  const { feedback } = useDemo()
  const mine = withHospitals(feedback.filter((f) => f.user_id === DEMO_USER_ID))
  return <FeedbackList feedbacks={mine} basePath="/demo" />
}
