import { createAdminClient } from '@/lib/supabase/admin'
import { generateHospitalSummary } from './ai'
import type { MonthlyStats } from '@/types/database'
import { format } from 'date-fns'

export async function buildMonthlyStats(
  year: number,
  month: number
): Promise<MonthlyStats[]> {
  const supabase = createAdminClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0) // last day of month
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`

  const { data: hospitals, error: hErr } = await supabase
    .from('hospitals')
    .select('id, name, district')
    .order('name')

  if (hErr || !hospitals) throw new Error('Failed to load hospitals')

  const { data: feedbackRows, error: fErr } = await supabase
    .from('feedback')
    .select('hospital_id, category, comment, sentiment, issue, ai_summary')
    .gte('created_at', startDate)
    .lte('created_at', endDateStr + 'T23:59:59')

  if (fErr) throw new Error('Failed to load feedback')

  const stats: MonthlyStats[] = []

  for (const hospital of hospitals) {
    const rows = (feedbackRows ?? []).filter(
      (f) => f.hospital_id === hospital.id
    )

    if (rows.length === 0) continue

    const total = rows.length
    const positive = rows.filter((r) => r.sentiment === 'Positive').length
    const negative = rows.filter((r) => r.sentiment === 'Negative').length
    const neutral = rows.filter((r) => r.sentiment === 'Neutral').length

    // Aggregate issues
    const issueCounts: Record<string, number> = {}
    rows.forEach((r) => {
      if (r.issue) {
        issueCounts[r.issue] = (issueCounts[r.issue] ?? 0) + 1
      }
    })
    const top_issues = Object.entries(issueCounts)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Category breakdown
    const catCounts: Record<string, number> = {}
    rows.forEach((r) => {
      catCounts[r.category] = (catCounts[r.category] ?? 0) + 1
    })
    const top_categories = Object.entries(catCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // Sample feedback (anonymised — no user identifiers, truncated)
    const sample_feedback = rows
      .filter((r) => r.comment && r.comment.length > 10)
      .slice(0, 3)
      .map((r) => ({
        comment: r.comment.slice(0, 120) + (r.comment.length > 120 ? '…' : ''),
        sentiment: r.sentiment ?? 'Neutral',
        category: r.category,
      }))

    // AI summary
    const ai_summary = await generateHospitalSummary(hospital.name, {
      total,
      positive_pct: Math.round((positive / total) * 100),
      negative_pct: Math.round((negative / total) * 100),
      neutral_pct: Math.round((neutral / total) * 100),
      top_issues,
      sample_concerns: rows
        .filter((r) => r.ai_summary)
        .slice(0, 5)
        .map((r) => r.ai_summary as string),
    })

    stats.push({
      hospital_id: hospital.id,
      hospital_name: hospital.name,
      district: hospital.district,
      total,
      positive,
      negative,
      neutral,
      positive_pct: Math.round((positive / total) * 100),
      negative_pct: Math.round((negative / total) * 100),
      neutral_pct: Math.round((neutral / total) * 100),
      top_issues,
      top_categories,
      sample_feedback,
      ai_summary,
    })
  }

  return stats.sort((a, b) => b.total - a.total)
}

export async function generatePDFReport(
  year: number,
  month: number,
  stats: MonthlyStats[]
): Promise<Buffer> {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42) // gov-900 (deep indigo)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Western Cape Department of Health', margin, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Public Hospital Patient Feedback Report', margin, 20)

  doc.setTextColor(200, 200, 200)
  doc.setFontSize(9)
  doc.text(`Report Period: ${monthLabel}`, pageWidth - margin, 12, { align: 'right' })
  doc.text(`Generated: ${format(new Date(), 'd MMM yyyy')}`, pageWidth - margin, 20, { align: 'right' })

  let y = 38

  // ── Executive Summary ──────────────────────────────────────────────────
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Summary', margin, y)
  y += 6

  const totalAll = stats.reduce((s, h) => s + h.total, 0)
  const totalPos = stats.reduce((s, h) => s + h.positive, 0)
  const totalNeg = stats.reduce((s, h) => s + h.negative, 0)
  const totalNeu = stats.reduce((s, h) => s + h.neutral, 0)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)

  const summaryText = [
    `This report covers ${totalAll} patient feedback submissions received across ${stats.length} Western Cape public hospitals during ${monthLabel}.`,
    `Overall sentiment: Positive ${totalAll ? Math.round((totalPos / totalAll) * 100) : 0}%,  Negative ${totalAll ? Math.round((totalNeg / totalAll) * 100) : 0}%,  Neutral ${totalAll ? Math.round((totalNeu / totalAll) * 100) : 0}%.`,
    'Patient identities are anonymised in this report in accordance with POPIA.',
  ]

  summaryText.forEach((line) => {
    const split = doc.splitTextToSize(line, pageWidth - margin * 2)
    doc.text(split, margin, y)
    y += split.length * 5 + 2
  })

  y += 4

  // ── Per-hospital sections ───────────────────────────────────────────────
  for (const h of stats) {
    // Page break check
    if (y > 240) {
      doc.addPage()
      y = 20
    }

    // Hospital header bar
    doc.setFillColor(13, 148, 136) // brand-600 (surgical teal)
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${h.hospital_name}  ·  ${h.district}`, margin + 3, y + 5.5)
    doc.setFontSize(8)
    doc.text(`${h.total} submissions`, pageWidth - margin - 3, y + 5.5, { align: 'right' })
    y += 12

    // Sentiment row
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(50, 50, 50)
    doc.text(
      `Sentiment:  ✓ Positive ${h.positive_pct}%   ✗ Negative ${h.negative_pct}%   – Neutral ${h.neutral_pct}%`,
      margin,
      y
    )
    y += 6

    // AI summary
    if (h.ai_summary) {
      const split = doc.splitTextToSize(h.ai_summary, pageWidth - margin * 2)
      doc.setTextColor(80, 80, 80)
      doc.text(split, margin, y)
      y += split.length * 5 + 2
    }

    // Top issues table
    if (h.top_issues.length > 0) {
      doc.setTextColor(15, 23, 42)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('Top Issues', margin, y)
      y += 3

      autoTable(doc, {
        startY: y,
        head: [['Issue', 'Reports']],
        body: h.top_issues.map((i) => [i.issue, i.count]),
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [15, 23, 42], textColor: 255 },
        columnStyles: { 1: { halign: 'center', cellWidth: 20 } },
        margin: { left: margin, right: margin },
      })

      y = (doc as any).lastAutoTable.finalY + 4
    }

    // Sample feedback
    if (h.sample_feedback.length > 0) {
      if (y > 240) { doc.addPage(); y = 20 }

      doc.setTextColor(15, 23, 42)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('Representative Feedback (anonymised)', margin, y)
      y += 3

      autoTable(doc, {
        startY: y,
        head: [['Category', 'Sentiment', 'Comment (truncated)']],
        body: h.sample_feedback.map((f) => [f.category, f.sentiment, f.comment]),
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [204, 251, 241], textColor: 30, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 20 },
          2: { cellWidth: pageWidth - margin * 2 - 48 },
        },
        margin: { left: margin, right: margin },
      })

      y = (doc as any).lastAutoTable.finalY + 8
    } else {
      y += 6
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text(
      `CONFIDENTIAL — Western Cape Department of Health — ${monthLabel} — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
