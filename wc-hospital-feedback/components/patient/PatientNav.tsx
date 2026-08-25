'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2, ClipboardList, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  fullName: string
}

export default function PatientNav({ fullName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/feedback', label: 'Submit Feedback', icon: <ClipboardList className="w-4 h-4" /> },
    { href: '/my-feedback', label: 'My Submissions', icon: <ClipboardList className="w-4 h-4" /> },
  ]

  return (
    <nav className="bg-gov-900 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feedback" className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-brand-400" />
          <span className="font-semibold text-sm hidden sm:block">WC Health Feedback</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                pathname.startsWith(l.href) && l.href !== '/feedback'
                  ? 'bg-gov-700 text-white'
                  : pathname === l.href && l.href === '/feedback'
                  ? 'bg-gov-700 text-white'
                  : 'text-gov-300 hover:text-white hover:bg-gov-800'
              )}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs text-gov-400 max-w-[140px] truncate">{fullName}</span>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-gov-300 hover:text-white transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden text-gov-300 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-gov-800 px-4 pb-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 py-2.5 text-sm text-gov-200 hover:text-white"
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          <div className="border-t border-gov-700 pt-3 mt-2">
            <p className="text-xs text-gov-400 mb-2">{fullName}</p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-gov-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
