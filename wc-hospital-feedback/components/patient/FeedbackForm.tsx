'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Send, Info } from 'lucide-react'
import type { Hospital, FeedbackCategory } from '@/types/database'
import { cn } from '@/lib/utils'

const CATEGORIES: FeedbackCategory[] = [
  'Cleanliness',
  'Staff Behaviour',
  'Waiting Time',
  'Service',
  'Facilities',
  'Other',
]

interface Props {
  hospitals: Pick<Hospital, 'id' | 'name' | 'district'>[]
}

export default function FeedbackForm({ hospitals }: Props) {
  const router = useRouter()
  const [hospitalId, setHospitalId] = useState('')
  const [category, setCategory] = useState<FeedbackCategory | ''>('')
  const [comment, setComment] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const MAX_CHARS = 2000
  const remaining = MAX_CHARS - comment.length

  function validate() {
    const errs: Record<string, string> = {}
    if (!hospitalId) errs.hospital_id = 'Please select a hospital'
    if (!category) errs.category = 'Please select a category'
    if (comment.trim().length < 20) errs.comment = 'Please provide at least 20 characters'
    if (comment.trim().length > MAX_CHARS) errs.comment = `Feedback must be under ${MAX_CHARS} characters`
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospital_id: hospitalId, category, comment: comment.trim() }),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      router.push('/feedback/success')
    } catch (err) {
      console.error('[Client] feedback submit unexpected error:', err)
      setServerError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  // Group hospitals by district
  const byDistrict = hospitals.reduce<Record<string, typeof hospitals>>((acc, h) => {
    if (!acc[h.district]) acc[h.district] = []
    acc[h.district].push(h)
    return acc
  }, {})

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="card divide-y divide-gray-100">

        {/* Hospital */}
        <div className="p-6">
          <label htmlFor="hospital" className="label">
            Hospital <span className="text-red-500">*</span>
          </label>
          <select
            id="hospital"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            className={cn('input', fieldErrors.hospital_id && 'border-red-400 focus:ring-red-400')}
          >
            <option value="">Select a hospital…</option>
            {Object.entries(byDistrict)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([district, list]) => (
                <optgroup key={district} label={district}>
                  {list.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </optgroup>
              ))}
          </select>
          {fieldErrors.hospital_id && (
            <p className="error-msg"><AlertCircle className="w-3 h-3" />{fieldErrors.hospital_id}</p>
          )}
        </div>

        {/* Category */}
        <div className="p-6">
          <p className="label">
            Category <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all',
                  category === cat
                    ? 'border-gov-600 bg-gov-50 text-gov-800 ring-2 ring-gov-300'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gov-300 hover:bg-gov-50'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          {fieldErrors.category && (
            <p className="error-msg mt-2"><AlertCircle className="w-3 h-3" />{fieldErrors.category}</p>
          )}
        </div>

        {/* Comment */}
        <div className="p-6">
          <label htmlFor="comment" className="label">
            Describe your experience <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Please describe your experience in as much detail as possible. What happened? When was it? What could be improved?"
            className={cn(
              'input resize-none',
              fieldErrors.comment && 'border-red-400 focus:ring-red-400'
            )}
          />
          <div className="flex items-start justify-between mt-1.5">
            {fieldErrors.comment ? (
              <p className="error-msg"><AlertCircle className="w-3 h-3" />{fieldErrors.comment}</p>
            ) : (
              <span />
            )}
            <span className={cn('text-xs ml-auto', remaining < 100 ? 'text-amber-600' : 'text-gray-400')}>
              {remaining} remaining
            </span>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="px-6 py-4 bg-blue-50">
          <div className="flex items-start gap-2.5 text-xs text-blue-700">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Your feedback is analysed by AI to identify key issues. Your name and personal details will not appear in any reports. This complies with POPIA.
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {serverError}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting feedback…
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit feedback
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
