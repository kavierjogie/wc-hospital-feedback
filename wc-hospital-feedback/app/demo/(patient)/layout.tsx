import PatientNav from '@/components/patient/PatientNav'
import { DEMO_USER_NAME } from '@/lib/demo/data'

export default function DemoPatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      <PatientNav fullName={DEMO_USER_NAME} demo />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-4 text-xs text-gray-400 border-t bg-white">
        © {new Date().getFullYear()} Western Cape Department of Health · Patient Feedback System
      </footer>
    </div>
  )
}
