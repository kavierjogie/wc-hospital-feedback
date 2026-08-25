import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'd MMM yyyy')
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'd MMM yyyy, HH:mm')
}

export function getMonthRange(year: number, month: number) {
  const date = new Date(year, month - 1, 1)
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function getPreviousMonth() {
  const prev = subMonths(new Date(), 1)
  return {
    year: prev.getFullYear(),
    month: prev.getMonth() + 1,
    label: format(prev, 'MMMM yyyy'),
  }
}

export function sentimentColor(sentiment: string | null) {
  switch (sentiment) {
    case 'Positive': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'Negative': return 'text-red-700 bg-red-50 border-red-200'
    case 'Neutral':  return 'text-amber-700 bg-amber-50 border-amber-200'
    default:         return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}
