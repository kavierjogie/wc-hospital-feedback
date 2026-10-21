import Link from 'next/link'
import { Building2, ClipboardList, LayoutDashboard, ChevronRight } from 'lucide-react'

const ROLES = [
  {
    href: '/demo/feedback',
    icon: <ClipboardList className="w-6 h-6" />,
    title: 'Patient view',
    body: 'Submit feedback about a hospital visit and track your own submissions.',
  },
  {
    href: '/demo/admin/dashboard',
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: 'Admin view',
    body: 'Explore the analytics dashboard, browse and filter feedback, and download monthly PDF reports.',
  },
]

export default function DemoHomePage() {
  return (
    <div className="flex-1 bg-gov-50 flex flex-col">
      <nav className="bg-gov-900 text-white h-14 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-brand-400" />
          <span className="font-semibold text-sm">WC Health Feedback</span>
        </Link>
      </nav>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gov-900 mb-2">Choose how to explore</h1>
        <p className="text-sm text-gray-600 mb-8 max-w-xl">
          No account needed. The demo is pre-loaded with sample feedback for Western Cape hospitals. Anything you add is
          stored only in this browser and can be reset at any time from the banner above.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="card p-6 group hover:border-brand-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gov-100 text-gov-700 flex items-center justify-center mb-4">
                {r.icon}
              </div>
              <h2 className="font-semibold text-gov-900 mb-1.5 flex items-center gap-1">
                {r.title}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
