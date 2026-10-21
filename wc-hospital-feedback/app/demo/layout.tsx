import type { Metadata } from 'next'
import DemoProvider from '@/components/demo/DemoProvider'

export const metadata: Metadata = {
  title: 'Demo | WC Hospital Feedback',
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoProvider>{children}</DemoProvider>
}
