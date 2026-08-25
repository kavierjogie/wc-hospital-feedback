'use client'

import { cn, formatDateTime, sentimentColor, truncate } from '@/lib/utils'
import type { Feedback } from '@/types/database'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  feedback: (Feedback & { hospitals?: { name: string } })[]
}

export default function FeedbackTable({ feedback }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (feedback.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-10">
        No feedback submissions for this selection.
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {feedback.map((fb) => {
        const isOpen = expanded === fb.id
        return (
          <div key={fb.id} className="py-3">
            <button
              className="w-full text-left"
              onClick={() => setExpanded(isOpen ? null : fb.id)}
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-semibold text-gov-800">
                      {(fb.hospitals as any)?.name ?? 'Unknown'}
                    </span>
                    <span className="badge bg-gov-50 text-gov-600 border-gov-100 text-xs">
                      {fb.category}
                    </span>
                    {fb.sentiment && !['pending', 'failed'].includes(fb.sentiment) && (
                      <span className={cn('badge text-xs', sentimentColor(fb.sentiment))}>
                        {fb.sentiment}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{fb.comment}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-gray-400 whitespace-nowrap hidden sm:block">
                    {formatDateTime(fb.created_at)}
                  </span>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="mt-3 pl-1 space-y-2 text-xs border-l-2 border-gov-200 ml-1 pl-4">
                <div>
                  <p className="font-medium text-gray-500 mb-0.5">Full comment</p>
                  <p className="text-gray-700 leading-relaxed">{fb.comment}</p>
                </div>
                {fb.issue && (
                  <div>
                    <p className="font-medium text-gray-500 mb-0.5">Identified issue</p>
                    <p className="text-gray-700">{fb.issue}</p>
                  </div>
                )}
                {fb.ai_summary && (
                  <div>
                    <p className="font-medium text-gray-500 mb-0.5">AI summary</p>
                    <p className="text-gray-700">{fb.ai_summary}</p>
                  </div>
                )}
                <p className="text-gray-400">{formatDateTime(fb.created_at)}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
