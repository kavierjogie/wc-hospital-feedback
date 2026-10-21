'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FlaskConical, RotateCcw, LogOut, Shield, User } from 'lucide-react'
import type { Feedback } from '@/types/database'
import { feedbackSchema, type FeedbackInput } from '@/lib/validation'
import { DEMO_HOSPITALS, DEMO_USER_ID, analyzeDemoFeedback, createSeedFeedback } from '@/lib/demo/data'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Demo data lives only in this browser. Nothing here talks to Supabase.
const STORAGE_KEY = 'wc-hospital-feedback:demo:v1'

interface DemoContext {
  feedback: Feedback[]
  addFeedback: (input: FeedbackInput) => Promise<void>
  reset: () => void
}

const Ctx = createContext<DemoContext | null>(null)

export function useDemo() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>')
  return ctx
}

function load(): Feedback[] | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function save(feedback: Feedback[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedback))
  } catch {
    // Private mode / storage full: the demo keeps working in memory for this tab.
  }
}

export default function DemoProvider({ children }: { children: React.ReactNode }) {
  // null until mounted, so server and first client render match (no hydration mismatch).
  const [feedback, setFeedback] = useState<Feedback[] | null>(null)

  useEffect(() => {
    const stored = load()
    if (stored) return setFeedback(stored)
    const seed = createSeedFeedback()
    save(seed)
    setFeedback(seed)
  }, [])

  const update = useCallback((next: Feedback[]) => {
    save(next)
    setFeedback(next)
  }, [])

  const addFeedback = useCallback(async (input: FeedbackInput) => {
    const result = feedbackSchema.safeParse(input)
    if (!result.success) throw new Error(result.error.errors[0].message)
    const { hospital_id, category, comment } = result.data
    if (!DEMO_HOSPITALS.some((h) => h.id === hospital_id)) throw new Error('Hospital not found')

    const analysis = analyzeDemoFeedback(comment, category)
    const record: Feedback = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      user_id: DEMO_USER_ID,
      hospital_id,
      category,
      comment,
      sentiment: analysis.sentiment,
      issue: analysis.issue,
      ai_summary: analysis.summary,
      created_at: new Date().toISOString(),
    }
    // Read latest from storage so a second tab's submissions aren't clobbered.
    update([record, ...(load() ?? feedback ?? [])])
  }, [feedback, update])

  const reset = useCallback(() => update(createSeedFeedback()), [update])

  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner onReset={reset} />
      {feedback ? (
        <Ctx.Provider value={{ feedback, addFeedback, reset }}>{children}</Ctx.Provider>
      ) : (
        <div className="flex-1 flex items-center justify-center py-24">
          <LoadingSpinner label="Loading demo data…" />
        </div>
      )}
    </div>
  )
}

function DemoBanner({ onReset }: { onReset: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const inAdmin = pathname.startsWith('/demo/admin')

  function handleReset() {
    if (!window.confirm('Reset the demo? Feedback you added will be removed and the sample data restored.')) return
    onReset()
    router.refresh()
  }

  const btn = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium hover:bg-amber-100 transition-colors'

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900" role="status">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="text-xs flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            <strong className="font-semibold tracking-wide">DEMO MODE</strong>
            <span className="hidden sm:inline"> — You&apos;re exploring sample data. Your changes won&apos;t affect real records.</span>
          </span>
        </p>
        <div className="flex items-center gap-1 -mx-2.5 sm:mx-0">
          <Link href={inAdmin ? '/demo/feedback' : '/demo/admin/dashboard'} className={btn}>
            {inAdmin ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            {inAdmin ? 'Patient view' : 'Admin view'}
          </Link>
          <button onClick={handleReset} className={btn}>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset demo
          </button>
          <Link href="/" className={btn}>
            <LogOut className="w-3.5 h-3.5" />
            Exit demo
          </Link>
        </div>
      </div>
    </div>
  )
}
