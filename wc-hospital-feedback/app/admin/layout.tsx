import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/feedback')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav fullName={profile?.full_name ?? user.email ?? ''} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="text-center py-4 text-xs text-gray-400 border-t bg-white">
        © {new Date().getFullYear()} Western Cape Department of Health · Admin Dashboard
      </footer>
    </div>
  )
}
