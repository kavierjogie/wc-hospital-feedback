import { createClient } from '@/lib/supabase/server'
import FeedbackForm from '@/components/patient/FeedbackForm'

export default async function FeedbackPage() {
  const supabase = createClient()

  const { data: hospitals } = await supabase
    .from('hospitals')
    .select('id, name, district')
    .order('name')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gov-900">Submit Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share your experience at a Western Cape public hospital. Your identity will not appear in any reports.
        </p>
      </div>
      <FeedbackForm hospitals={hospitals ?? []} />
    </div>
  )
}
