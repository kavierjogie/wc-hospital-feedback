'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerSchema } from '@/lib/validation'
import { UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const result = registerSchema.safeParse({ full_name: fullName, email, password })
    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) errs[err.path[0] as string] = err.message
      })
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { full_name: result.data.full_name },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Create profile
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: result.data.full_name,
        role: 'patient',
      })
    }

    setSuccess(true)
    setLoading(false)

    // If email confirmation is disabled, redirect to feedback
    if (data.session) {
      setTimeout(() => router.push('/feedback'), 1500)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gov-900 mb-2">Account created!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Check your email to confirm your account, then sign in to submit feedback.
          </p>
          <Link href="/login" className="btn-primary w-full justify-center">
            Sign in now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-gov-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-gov-700" />
          </div>
          <h1 className="text-xl font-bold text-gov-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Register to submit hospital feedback
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="full_name" className="label">Full name</label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              className={`input ${fieldErrors.full_name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Thandi Nkosi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {fieldErrors.full_name && (
              <p className="error-msg"><AlertCircle className="w-3 h-3" />{fieldErrors.full_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && (
              <p className="error-msg"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input pr-10 ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="error-msg"><AlertCircle className="w-3 h-3" />{fieldErrors.password}</p>
            )}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Your personal information is protected under POPIA. Feedback reports are fully anonymised.
          </p>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-gov-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
