'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Hospital {
  id: string
  name: string
  district: string
}

interface Props {
  hospitals: Hospital[]
  value: string
  onChange: (id: string) => void
  error?: string
}

export default function HospitalCombobox({ hospitals, value, onChange, error }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedHospital = hospitals.find((h) => h.id === value)

  // Sync search input with selection when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearch(selectedHospital ? selectedHospital.name : '')
    }
  }, [isOpen, selectedHospital])

  // Filter hospitals based on search input
  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.district.toLowerCase().includes(search.toLowerCase())
  )

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset active index when search or dropdown visibility changes
  useEffect(() => {
    setActiveIndex(-1)
  }, [search, isOpen])

  const handleSelect = (hospital: Hospital) => {
    onChange(hospital.id)
    setSearch(hospital.name)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setActiveIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0))
        e.preventDefault()
        break
      case 'ArrowUp':
        setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1))
        e.preventDefault()
        break
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          handleSelect(filtered[activeIndex])
        } else if (filtered.length > 0) {
          handleSelect(filtered[0])
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsOpen(false)
        e.preventDefault()
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
    setIsOpen(true)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type to search hospital..."
          className={cn(
            'input pr-16 pl-3 py-2 w-full text-sm',
            error && 'border-red-400 focus:ring-red-400'
          )}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-0.5"
              title="Clear selected hospital"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
            title="Toggle list"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No hospitals found matching "{search}"
            </div>
          ) : (
            filtered.map((h, index) => {
              const isSelected = h.id === value
              const isActive = index === activeIndex
              return (
                <div
                  key={h.id}
                  onClick={() => handleSelect(h)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors',
                    isActive ? 'bg-gov-50 text-gov-900' : 'text-gray-700',
                    isSelected && 'bg-brand-50 text-brand-900 font-semibold'
                  )}
                >
                  <div className="flex flex-col">
                    <span>{h.name}</span>
                    <span className={cn('text-xs text-gray-400', isActive ? 'text-gray-500' : '')}>
                      {h.district}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-600 flex-shrink-0 ml-2" />}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
