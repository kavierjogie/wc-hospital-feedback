import Link from 'next/link'
import { Heart, ClipboardList, BarChart3, ShieldCheck, ChevronRight, Building2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="bg-gov-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-sm tracking-wide">
              WC Health Feedback
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-xs py-1.5 px-3.5">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gov-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gov-800 border border-gov-700 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Heart className="w-3.5 h-3.5" />
            Western Cape Department of Health
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
            Help us improve<br />
            <span className="text-brand-400">public healthcare</span>
          </h1>
          <p className="text-lg text-gov-200 max-w-xl mx-auto mb-8">
            Your feedback about Western Cape public hospitals helps the Department
            of Health identify problems and make meaningful improvements for all patients.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-primary text-sm py-3 px-6">
              Submit Feedback
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-sm py-3 px-6 border-gov-600 text-gov-200 hover:bg-gov-800 hover:text-white">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gov-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gov-900 text-center mb-10">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <ClipboardList className="w-6 h-6" />,
                step: '1',
                title: 'Share your experience',
                body: 'Select your hospital and describe your visit — good or bad. Your identity is protected.',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                step: '2',
                title: 'AI analysis',
                body: 'Our system analyses your feedback to identify key issues and overall sentiment.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                step: '3',
                title: 'Drives improvement',
                body: 'Monthly reports go to the Department of Health so problems are actioned.',
              },
            ].map((item) => (
              <div key={item.step} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-gov-100 text-gov-700 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gov-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gov-900 text-center mb-10">
            What you can report
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Cleanliness',
              'Staff Behaviour',
              'Waiting Times',
              'Service Quality',
              'Facilities',
              'Other concerns',
            ].map((cat) => (
              <div key={cat} className="flex items-center gap-2.5 p-4 rounded-lg border border-gray-200 bg-white">
                <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gov-800">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-gov-900 text-white mt-auto">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Your voice matters</h2>
          <p className="text-gov-300 mb-6 text-sm">
            Register today to share your experience and contribute to better healthcare for all Western Cape residents.
          </p>
          <Link href="/register" className="btn-primary">
            Get started
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-gov-900 border-t border-gov-800 py-5 px-4 text-center text-xs text-gov-500">
        © {new Date().getFullYear()} Western Cape Department of Health · Patient Feedback System
      </footer>
    </div>
  )
}
