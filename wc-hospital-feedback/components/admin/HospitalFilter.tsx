'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Hospital {
  id: string
  name: string
  district: string
}

interface Props {
  hospitals: Hospital[]
  selectedId?: string
}

export default function HospitalFilter({ hospitals, selectedId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleChange(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('hospital', id)
    } else {
      params.delete('hospital')
    }
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  const byDistrict = hospitals.reduce<Record<string, Hospital[]>>((acc, h) => {
    if (!acc[h.district]) acc[h.district] = []
    acc[h.district].push(h)
    return acc
  }, {})

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Filter className="w-3.5 h-3.5" />
        <span>Filter:</span>
      </div>
      <select
        value={selectedId ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          'input text-sm py-1.5 w-auto max-w-xs',
          isPending && 'opacity-60 cursor-wait'
        )}
        disabled={isPending}
      >
        <option value="">All hospitals</option>
        {Object.entries(byDistrict)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([district, list]) => (
            <optgroup key={district} label={district}>
              {list.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </optgroup>
          ))}
      </select>
      {selectedId && (
        <button
          onClick={() => handleChange('')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  )
}
