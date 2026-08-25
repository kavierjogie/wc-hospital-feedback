import Link from 'next/link'
import { CheckCircle, ArrowRight, ClipboardList } from 'lucide-react'

export default function FeedbackSuccessPage() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="card p-10">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gov-900 mb-2">
          Thank you for your feedback
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          Your submission has been received and analysed. It will contribute to the Western Cape Department of Health&apos;s monthly review.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Your identity is protected and will not appear in any reports.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/feedback" className="btn-primary">
            Submit more feedback
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/my-feedback" className="btn-secondary">
            <ClipboardList className="w-4 h-4" />
            View my submissions
          </Link>
        </div>
      </div>
    </div>
  )
}
