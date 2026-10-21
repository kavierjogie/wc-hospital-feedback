'use client'

import FeedbackForm from '@/components/patient/FeedbackForm'
import { useDemo } from '@/components/demo/DemoProvider'
import { DEMO_HOSPITALS } from '@/lib/demo/data'

export default function DemoFeedbackPage() {
  const { addFeedback } = useDemo()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gov-900">Submit Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share your experience at a Western Cape public hospital. In the demo, feedback is saved in your browser and
          analysed with a local keyword model instead of Groq AI.
        </p>
      </div>
      <FeedbackForm hospitals={DEMO_HOSPITALS} onSubmit={addFeedback} successHref="/demo/feedback/success" />
    </div>
  )
}
