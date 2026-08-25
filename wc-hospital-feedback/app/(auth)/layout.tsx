import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gov-50 flex flex-col">
      <nav className="bg-gov-900 text-white h-14 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-brand-400" />
          <span className="font-semibold text-sm">WC Health Feedback</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </div>
      <footer className="text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Western Cape Department of Health
      </footer>
    </div>
  )
}
