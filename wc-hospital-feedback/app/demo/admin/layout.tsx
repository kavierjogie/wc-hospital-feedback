import AdminNav from '@/components/admin/AdminNav'

export default function DemoAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      <AdminNav fullName="Demo Administrator" demo />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="text-center py-4 text-xs text-gray-400 border-t bg-white">
        © {new Date().getFullYear()} Western Cape Department of Health · Admin Dashboard
      </footer>
    </div>
  )
}
