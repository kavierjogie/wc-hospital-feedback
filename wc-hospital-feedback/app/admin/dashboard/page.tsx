import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DashboardClient from '@/components/admin/DashboardClient'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  // Load hospitals for filter
  const { data: hospitals } = await supabase
    .from('hospitals')
    .select('id, name, district')
    .order('name')

  // Summary stats
  const { count: totalFeedback } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true })

  const { data: sentimentData } = await supabase
    .from('feedback')
    .select('sentiment')

  const sentimentCounts = (sentimentData ?? []).reduce<Record<string, number>>(
    (acc, f) => {
      const s = f.sentiment ?? 'pending'
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    },
    {}
  )

  // Category breakdown
  const { data: categoryData } = await supabase
    .from('feedback')
    .select('category')

  const categoryCounts = (categoryData ?? []).reduce<Record<string, number>>(
    (acc, f) => {
      acc[f.category] = (acc[f.category] ?? 0) + 1
      return acc
    },
    {}
  )

  // Top issues
  const { data: issueData } = await supabase
    .from('feedback')
    .select('issue')
    .not('issue', 'is', null)

  const issueCounts = (issueData ?? []).reduce<Record<string, number>>(
    (acc, f) => {
      if (f.issue) acc[f.issue] = (acc[f.issue] ?? 0) + 1
      return acc
    },
    {}
  )

  const topIssues = Object.entries(issueCounts)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Recent feedback
  const { data: recentFeedback } = await supabase
    .from('feedback')
    .select('*, hospitals(name)')
    .order('created_at', { ascending: false })
    .limit(10)

  // Per-hospital breakdown
  const { data: allFeedback } = await supabase
    .from('feedback')
    .select('hospital_id, sentiment, hospitals(name)')

  const hospitalStats = (hospitals ?? []).map((h) => {
    const rows = (allFeedback ?? []).filter((f) => f.hospital_id === h.id)
    const total = rows.length
    const pos = rows.filter((r) => r.sentiment === 'Positive').length
    const neg = rows.filter((r) => r.sentiment === 'Negative').length
    const neu = rows.filter((r) => r.sentiment === 'Neutral').length
    return {
      id: h.id,
      name: h.name,
      district: h.district,
      total,
      positive: total ? Math.round((pos / total) * 100) : 0,
      negative: total ? Math.round((neg / total) * 100) : 0,
      neutral: total ? Math.round((neu / total) * 100) : 0,
    }
  }).filter((h) => h.total > 0).sort((a, b) => b.total - a.total)

  return (
    <DashboardClient
      hospitals={hospitals ?? []}
      totalFeedback={totalFeedback ?? 0}
      sentimentCounts={sentimentCounts}
      categoryCounts={categoryCounts}
      topIssues={topIssues}
      recentFeedback={recentFeedback ?? []}
      hospitalStats={hospitalStats}
    />
  )
}
