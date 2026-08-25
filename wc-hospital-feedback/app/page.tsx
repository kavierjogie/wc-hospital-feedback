import Link from 'next/link'
import { Heart, ClipboardList, BarChart3, ShieldCheck, ChevronRight, Building2, Sparkles, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <section className="bg-gov-900 text-white py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Abstract background decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gov-800/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (CTA) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 bg-gov-800 border border-gov-700 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <Heart className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              Western Cape Department of Health
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-tight">
              Help us improve<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
                public healthcare
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-gov-200 mb-8 leading-relaxed max-w-xl">
              Your feedback about Western Cape public hospitals helps the Department
              of Health identify problems and make meaningful improvements for all patients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
              <Link href="/register" className="btn-primary text-sm py-3 px-6 shadow-lg shadow-brand-500/15 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Submit Feedback
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="btn-secondary text-sm py-3 px-6 border-gov-700 bg-transparent text-gov-200 hover:bg-gov-800 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-transform">
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Column (Floating Mockup) */}
          <div className="lg:col-span-6 relative w-full flex justify-center">
            {/* Decorative glows */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-500/15 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gov-500/15 rounded-full blur-2xl" />

            {/* Glassmorphic dashboard preview */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl p-5 overflow-hidden animate-float relative">
              {/* Top bar controls */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  <span className="text-[10px] font-medium text-white/40 ml-2 select-none">analytics-preview.gov.za</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-500/25 text-brand-300 border border-brand-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  Live Insights
                </span>
              </div>

              {/* Stats overview cards grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-[9px] text-white/50 block font-medium uppercase tracking-wider">Sentiment Score</span>
                  <span className="text-xl font-bold text-white block mt-0.5">78.4%</span>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-brand-400 h-full rounded-full w-[78.4%]" />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-[9px] text-white/50 block font-medium uppercase tracking-wider">Submissions</span>
                  <span className="text-xl font-bold text-white block mt-0.5">1,248</span>
                  <span className="text-[9px] text-brand-300 font-semibold block mt-1">
                    ↑ 12% vs last month
                  </span>
                </div>
              </div>

              {/* Wait Time Trend Graph Mock */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-white/50 font-medium uppercase tracking-wider">Wait Time Trend</span>
                  <span className="text-[9px] text-teal-300 bg-teal-500/10 px-1.5 py-0.2 rounded font-medium">Cleanliness 92%</span>
                </div>
                <div className="h-16 flex items-end gap-1.5 pt-2">
                  {[30, 42, 55, 48, 38, 52, 65, 78, 58, 72, 85].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                      <div 
                        className={cn(
                          "w-full rounded-t transition-all duration-500",
                          idx === 10 ? "bg-brand-400" : "bg-white/20"
                        )} 
                        style={{ height: `${val}%` }} 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[8px] text-white/40 mt-1 select-none">
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                </div>
              </div>

              {/* Feedback items preview list */}
              <div className="space-y-2">
                <div className="bg-white/10 border border-white/10 rounded-lg p-2.5 flex items-start gap-2.5 hover:bg-white/15 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-brand-500/25 text-brand-300 flex items-center justify-center text-[10px] font-bold">W</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white truncate">Tygerberg Hospital</span>
                      <span className="text-[8px] text-brand-300 font-semibold uppercase tracking-wider">Waiting Time</span>
                    </div>
                    <p className="text-[9px] text-white/70 truncate mt-0.5">"Pharmacy waiting queues were long but staff behaved professionally."</p>
                  </div>
                </div>
                
                <div className="bg-white/10 border border-white/10 rounded-lg p-2.5 flex items-start gap-2.5 hover:bg-white/15 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 flex items-center justify-center text-[10px] font-bold">C</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-white truncate">Groote Schuur</span>
                      <span className="text-[8px] text-emerald-300 font-semibold uppercase tracking-wider">Cleanliness</span>
                    </div>
                    <p className="text-[9px] text-white/70 truncate mt-0.5">"Pediatric ward was clean and disinfected regularly."</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-teal-500 to-brand-500 text-white font-medium text-[9px] px-2.5 py-1 rounded-full shadow-lg border border-white/15 transform -rotate-2 hover:rotate-0 transition-transform cursor-pointer select-none">
                AI Auto-Sentiment Analysis
              </div>
            </div>
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
