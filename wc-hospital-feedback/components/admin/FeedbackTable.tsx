'use client'

import { cn, formatDateTime, sentimentColor } from '@/lib/utils'
import type { Feedback } from '@/types/database'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react'

interface Props {
  feedback: (Feedback & { hospitals?: { name: string } })[]
}

const CATEGORIES = [
  'Cleanliness',
  'Staff Behaviour',
  'Waiting Time',
  'Service',
  'Facilities',
  'Other',
]

export default function FeedbackTable({ feedback }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const filteredFeedback = feedback.filter((fb) => {
    // 1. Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const commentMatch = fb.comment?.toLowerCase().includes(q) ?? false
      const issueMatch = fb.issue?.toLowerCase().includes(q) ?? false
      const summaryMatch = fb.ai_summary?.toLowerCase().includes(q) ?? false
      const hospitalMatch = (fb.hospitals as any)?.name?.toLowerCase().includes(q) ?? false
      const categoryMatch = fb.category?.toLowerCase().includes(q) ?? false

      if (!commentMatch && !issueMatch && !summaryMatch && !hospitalMatch && !categoryMatch) {
        return false
      }
    }

    // 2. Sentiment filter
    if (sentimentFilter) {
      if (fb.sentiment !== sentimentFilter) {
        return false
      }
    }

    // 3. Category filter
    if (categoryFilter) {
      if (fb.category !== categoryFilter) {
        return false
      }
    }

    return true
  })

  const hasActiveFilters = searchQuery !== '' || sentimentFilter !== '' || categoryFilter !== ''

  const handleClearFilters = () => {
    setSearchQuery('')
    setSentimentFilter('')
    setCategoryFilter('')
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center pb-4 border-b border-gray-100">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback comment, issue, AI summary, or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 pr-8 text-sm py-1.5 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sentiment Filter */}
        <div className="w-full md:w-auto">
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="input text-sm py-1.5 w-full md:w-44"
          >
            <option value="">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
            <option value="pending">Pending Analysis</option>
            <option value="failed">Analysis Failed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input text-sm py-1.5 w-full md:w-44"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 rounded-md transition-colors w-full md:w-auto"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Results Count Summary */}
      {hasActiveFilters && (
        <p className="text-xs text-gray-400">
          Showing {filteredFeedback.length} of {feedback.length} submissions matching your filters.
        </p>
      )}

      {/* Table Content */}
      {filteredFeedback.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <p className="text-sm font-medium text-gov-700">No matching feedback found</p>
          <p className="text-xs text-gray-400 mt-1">
            Try adjusting your search query, sentiment filter, or category selection.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gov-700 bg-gov-50 hover:bg-gov-100 border border-gov-200 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredFeedback.map((fb) => {
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
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 border-l-2 border-gov-200 ml-1 pl-4 space-y-2 text-xs">
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
      )}
    </div>
  )
}
