'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MonthOption {
  value: string
  label: string
}

interface Props {
  months: MonthOption[]
  selectedMonth?: string
}

export default function MonthFilter({ months, selectedMonth }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('month', value)
    } else {
      params.delete('month')
    }
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="month-filter" className="text-xs text-gray-500">
        Month:
      </label>
      <select
        id="month-filter"
        value={selectedMonth ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          'input text-sm py-1.5 w-auto',
          isPending && 'opacity-60 cursor-wait'
        )}
        disabled={isPending}
      >
        <option value="">All months</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  )
}
