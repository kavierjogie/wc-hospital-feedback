import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  subtext?: string
  icon?: ReactNode
  iconClassName?: string
  className?: string
}

export default function StatCard({ label, value, subtext, icon, iconClassName, className }: Props) {
  return (
    <div className={cn('card p-5', className)}>
      {icon && (
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', iconClassName ?? 'bg-gov-100 text-gov-600')}>
          {icon}
        </div>
      )}
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-gov-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  )
}
