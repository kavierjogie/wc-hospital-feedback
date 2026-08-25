import { cn, sentimentColor } from '@/lib/utils'

interface Props {
  sentiment: string | null
  className?: string
}

export default function SentimentBadge({ sentiment, className }: Props) {
  if (!sentiment || sentiment === 'pending' || sentiment === 'failed') {
    return (
      <span className={cn('badge bg-gray-50 text-gray-500 border-gray-200', className)}>
        {sentiment === 'pending' ? 'Analysing…' : 'Analysis failed'}
      </span>
    )
  }

  return (
    <span className={cn('badge', sentimentColor(sentiment), className)}>
      {sentiment}
    </span>
  )
}
