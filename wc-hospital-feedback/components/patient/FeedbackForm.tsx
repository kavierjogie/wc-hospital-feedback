'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Send, Info, Sparkles, HeartHandshake, Clock, Activity, Building2, HelpCircle, Check } from 'lucide-react'
import type { Hospital, FeedbackCategory } from '@/types/database'
import { cn } from '@/lib/utils'
import HospitalCombobox from './HospitalCombobox'

const CATEGORIES: FeedbackCategory[] = [
  'Cleanliness',
  'Staff Behaviour',
  'Waiting Time',
  'Service',
  'Facilities',
  'Other',
]

const CATEGORY_DETAILS: Record<FeedbackCategory, { icon: React.ComponentType<any>; desc: string }> = {
  'Cleanliness': {
    icon: Sparkles,
    desc: 'Hygiene of rooms, wards, and bathrooms.'
  },
  'Staff Behaviour': {
    icon: HeartHandshake,
    desc: 'Friendliness, care, and behavior of the staff.'
  },
  'Waiting Time': {
    icon: Clock,
    desc: 'Queue delays, waiting times, and appointments.'
  },
  'Service': {
    icon: Activity,
    desc: 'Quality of medical care and clinical attention.'
  },
  'Facilities': {
    icon: Building2,
    desc: 'State of equipment, beds, and building condition.'
  },
  'Other': {
    icon: HelpCircle,
    desc: 'General inquiries or other issues not listed.'
  }
}

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

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="card divide-y divide-gray-100">

        {/* Hospital */}
        <div className="p-6">
          <label className="label">
            Hospital <span className="text-red-500">*</span>
          </label>
          <HospitalCombobox
            hospitals={hospitals}
            value={hospitalId}
            onChange={(id) => {
              setHospitalId(id)
              if (fieldErrors.hospital_id) {
                setFieldErrors((prev) => {
                  const next = { ...prev }
                  delete next.hospital_id
                  return next
                })
              }
            }}
            error={fieldErrors.hospital_id}
          />
          {fieldErrors.hospital_id && (
            <p className="error-msg mt-1.5"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.hospital_id}</p>
          )}
        </div>

        {/* Category */}
        <div className="p-6">
          <p className="label mb-3">
            Category <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {CATEGORIES.map((cat) => {
              const details = CATEGORY_DETAILS[cat]
              const Icon = details.icon
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-300/40 text-gov-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50/10'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors',
                    isSelected ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25' : 'bg-gov-50 text-gov-700'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm block mb-1 text-gov-900">{cat}</span>
                  <span className="text-xs text-gray-500 leading-normal">{details.desc}</span>
                </button>
              )
            })}
          </div>
          {fieldErrors.category && (
            <p className="error-msg mt-3"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.category}</p>
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
            onChange={(e) => {
              setComment(e.target.value)
              if (fieldErrors.comment) {
                setFieldErrors((prev) => {
                  const next = { ...prev }
                  delete next.comment
                  return next
                })
              }
            }}
            placeholder="Please describe your experience in as much detail as possible. What happened? When was it? What could be improved?"
            className={cn(
              'input resize-none',
              fieldErrors.comment && 'border-red-400 focus:ring-red-400'
            )}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1.5">
            <div className="flex-1">
              {fieldErrors.comment ? (
                <p className="error-msg"><AlertCircle className="w-3.5 h-3.5" />{fieldErrors.comment}</p>
              ) : (
                <div>
                  {comment.trim().length < 20 ? (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" />
                      Enter at least {20 - comment.trim().length} more character{20 - comment.trim().length !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      Minimum length met ({comment.trim().length} characters)
                    </p>
                  )}
                </div>
              )}
            </div>
            <span className={cn('text-xs font-mono sm:ml-auto', remaining < 100 ? 'text-amber-600' : 'text-gray-400')}>
              {remaining} left
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
