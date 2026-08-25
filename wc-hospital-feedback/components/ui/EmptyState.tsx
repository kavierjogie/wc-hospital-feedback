import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-14 px-4 text-center', className)}>
      {icon && (
        <div className="w-14 h-14 bg-gov-100 rounded-full flex items-center justify-center mb-4 text-gov-400">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-gov-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
