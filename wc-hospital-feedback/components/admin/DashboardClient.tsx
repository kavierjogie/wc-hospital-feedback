'use client'

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatDateTime, sentimentColor, cn } from '@/lib/utils'
import { Users, ClipboardList, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import HospitalFilter from './HospitalFilter'
import MonthFilter from './MonthFilter'

interface Props {
  hospitals: { id: string; name: string; district: string }[]
  totalFeedback: number
  sentimentCounts: Record<string, number>
  categoryCounts: Record<string, number>
  topIssues: { issue: string; count: number }[]
  recentFeedback: any[]
  hospitalStats: {
    id: string; name: string; district: string; total: number
    positive: number; negative: number; neutral: number
  }[]
  selectedHospitalId?: string
  selectedMonth?: string
  monthOptions: { value: string; label: string }[]
}

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#059669',
  Negative: '#dc2626',
  Neutral: '#d97706',
  pending: '#9ca3af',
  failed: '#6b7280',
}

export default function DashboardClient({
  hospitals,
  totalFeedback,
  sentimentCounts,
  categoryCounts,
  topIssues,
  recentFeedback,
  hospitalStats,
  selectedHospitalId,
  selectedMonth,
  monthOptions,
}: Props) {
  const sentimentPieData = Object.entries(sentimentCounts)
    .filter(([k]) => ['Positive', 'Negative', 'Neutral'].includes(k))
    .map(([name, value]) => ({ name, value }))

  const categoryBarData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const positive = sentimentCounts['Positive'] ?? 0
  const negative = sentimentCounts['Negative'] ?? 0
  const neutral = sentimentCounts['Neutral'] ?? 0
  const analysed = positive + negative + neutral

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gov-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Western Cape public hospital feedback overview</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center">
        <HospitalFilter
          hospitals={hospitals}
          selectedId={selectedHospitalId}
        />

        <MonthFilter
          months={monthOptions}
          selectedMonth={selectedMonth}
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-gov-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
          </div>
          <p className="text-3xl font-bold text-gov-900">{totalFeedback}</p>
          <p className="text-xs text-gray-400 mt-0.5">submissions</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Positive</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">
            {analysed ? Math.round((positive / analysed) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{positive} submissions</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Negative</span>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {analysed ? Math.round((negative / analysed) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{negative} submissions</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Neutral</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">
            {analysed ? Math.round((neutral / analysed) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{neutral} submissions</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Sentiment pie */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gov-800 mb-4">Sentiment Overview</h2>
          {sentimentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} submissions`, '']} />
                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No data yet" />
          )}
        </div>

        {/* Category bar */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gov-800 mb-4">Submissions by Category</h2>
          {categoryBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryBarData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No data yet" />
          )}
        </div>
      </div>

      {/* Top issues + hospital table */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top issues */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gov-800 mb-4">Top Reported Issues</h2>
          {topIssues.length > 0 ? (
            <div className="space-y-2.5">
              {topIssues.map((item, i) => (
                <div key={item.issue} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gov-400 w-5 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-gov-800 truncate">{item.issue}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gov-600 rounded-full"
                        style={{ width: `${(item.count / (topIssues[0]?.count ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No issues identified yet" />
          )}
        </div>

        {/* Hospital overview */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gov-800 mb-4">Hospital Overview</h2>
          {hospitalStats.length > 0 ? (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {hospitalStats.map((h) => (
                <div key={h.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-xs font-semibold text-gov-800 leading-tight">{h.name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{h.total}</span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                    {h.positive > 0 && (
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${h.positive}%` }}
                        title={`Positive ${h.positive}%`}
                      />
                    )}
                    {h.neutral > 0 && (
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${h.neutral}%` }}
                        title={`Neutral ${h.neutral}%`}
                      />
                    )}
                    {h.negative > 0 && (
                      <div
                        className="bg-red-500 h-full"
                        style={{ width: `${h.negative}%` }}
                        title={`Negative ${h.negative}%`}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-emerald-600">{h.positive}% pos</span>
                    <span className="text-[10px] text-red-500">{h.negative}% neg</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No hospital data yet" />
          )}
        </div>
      </div>

      {/* Recent feedback */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gov-800 mb-4">Recent Submissions</h2>
        {recentFeedback.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentFeedback.map((fb) => (
              <div key={fb.id} className="py-3 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-semibold text-gov-800">
                      {(fb.hospitals as any)?.name ?? 'Unknown'}
                    </span>
                    <span className="badge bg-gov-50 text-gov-600 border-gov-100 text-xs">{fb.category}</span>
                    {fb.sentiment && !['pending', 'failed'].includes(fb.sentiment) && (
                      <span className={cn('badge text-xs', sentimentColor(fb.sentiment))}>
                        {fb.sentiment}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{fb.comment}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {formatDateTime(fb.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No submissions yet" />
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-24 text-sm text-gray-400">
      {message}
    </div>
  )
}
