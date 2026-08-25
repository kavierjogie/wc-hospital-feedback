import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PatientNav from '@/components/patient/PatientNav'

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PatientNav fullName={profile?.full_name ?? user.email ?? ''} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-4 text-xs text-gray-400 border-t bg-white">
        © {new Date().getFullYear()} Western Cape Department of Health · Patient Feedback System
      </footer>
    </div>
  )
}
