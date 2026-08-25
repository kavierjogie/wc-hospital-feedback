import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WC Hospital Feedback | Western Cape Department of Health',
  description:
    'Submit and manage patient feedback for Western Cape public hospitals.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
