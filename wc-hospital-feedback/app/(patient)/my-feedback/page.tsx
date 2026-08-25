import { createClient } from '@/lib/supabase/server'
import { formatDateTime, sentimentColor } from '@/lib/utils'
import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export const revalidate = 0

export default async function MyFeedbackPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: feedbacks } = await supabase
    .from('feedback')
    .select('*, hospitals(name, district)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gov-900">My Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {feedbacks?.length ?? 0} feedback submission{feedbacks?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/feedback" className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          New feedback
        </Link>
      </div>

      {feedbacks && feedbacks.length > 0 ? (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-gov-900 text-sm">
                    {(fb.hospitals as any)?.name ?? 'Unknown hospital'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(fb.hospitals as any)?.district} · {formatDateTime(fb.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="badge bg-gov-50 text-gov-700 border-gov-200 text-xs">
                    {fb.category}
                  </span>
                  {fb.sentiment && fb.sentiment !== 'pending' && fb.sentiment !== 'failed' && (
                    <span className={cn('badge text-xs', sentimentColor(fb.sentiment))}>
                      {fb.sentiment}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{fb.comment}</p>
              {fb.ai_summary && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">AI Summary</p>
                  <p className="text-xs text-gray-600">{fb.ai_summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-gov-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-gov-400" />
          </div>
          <h3 className="font-semibold text-gov-800 mb-1">No submissions yet</h3>
          <p className="text-sm text-gray-500 mb-5">
            Share your experience at a Western Cape public hospital.
          </p>
          <Link href="/feedback" className="btn-primary">
            <Plus className="w-4 h-4" />
            Submit feedback
          </Link>
        </div>
      )}
    </div>
  )
}
