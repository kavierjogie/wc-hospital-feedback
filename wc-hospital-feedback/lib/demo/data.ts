// Demo Mode data: seed records, local "AI" analysis and dashboard aggregation.
// Pure functions only — no Supabase, no network, safe to import anywhere.
import type { AIAnalysis, Feedback, FeedbackCategory, Hospital } from '@/types/database'

export const DEMO_USER_ID = '00000000-0000-4000-8000-00000000d3e0'
export const DEMO_USER_NAME = 'Demo Patient'

const HOSPITAL_SEED: [string, string][] = [
  ['Groote Schuur Hospital', 'City of Cape Town Metro'],
  ['Tygerberg Hospital', 'City of Cape Town Metro'],
  ["Red Cross War Memorial Children's Hospital", 'City of Cape Town Metro'],
  ['Mitchells Plain Hospital', 'City of Cape Town Metro'],
  ['Khayelitsha District Hospital', 'City of Cape Town Metro'],
  ['Victoria Hospital', 'City of Cape Town Metro'],
  ['GF Jooste Hospital', 'City of Cape Town Metro'],
  ['Karl Bremer Hospital', 'City of Cape Town Metro'],
  ['Eerste River Hospital', 'City of Cape Town Metro'],
  ['Heideveld Community Health Centre', 'City of Cape Town Metro'],
  ['Somerset Hospital', 'City of Cape Town Metro'],
  ['Wesfleur Hospital', 'City of Cape Town Metro'],
  ['Paarl Hospital', 'City of Cape Town Metro'],
  ['Stellenbosch Hospital', 'Cape Winelands District'],
  ['Worcester Hospital', 'Cape Winelands District'],
  ['Franschhoek Hospital', 'Cape Winelands District'],
  ['Robertson Hospital', 'Cape Winelands District'],
  ['Villiersdorp Hospital', 'Cape Winelands District'],
  ['Hermanus Hospital', 'Cape Winelands District'],
  ['Swellendam Hospital', 'Overberg District'],
  ['Caledon Hospital', 'Overberg District'],
  ['Bredasdorp Hospital', 'Overberg District'],
  ['George Hospital', 'Garden Route District'],
  ['Knysna Hospital', 'Garden Route District'],
  ['Mossel Bay Hospital', 'Garden Route District'],
  ['Oudtshoorn Hospital', 'Garden Route District'],
  ['Riversdale Hospital', 'Garden Route District'],
  ['Beaufort West Hospital', 'Central Karoo District'],
  ['Prince Albert Hospital', 'Central Karoo District'],
  ['Paarl Hospital - West Coast', 'West Coast District'],
  ['Vredenburg Hospital', 'West Coast District'],
  ['Clanwilliam Hospital', 'West Coast District'],
  ['Citrusdal Hospital', 'West Coast District'],
]

const seedId = (prefix: string, n: number) =>
  `00000000-0000-4000-8000-${prefix}${String(n).padStart(12 - prefix.length, '0')}`

export const DEMO_HOSPITALS: Hospital[] = HOSPITAL_SEED
  .map(([name, district], i) => ({ id: seedId('a', i + 1), name, district, created_at: '2024-01-01T00:00:00.000Z' }))
  .sort((a, b) => a.name.localeCompare(b.name))

const hid = (name: string) => DEMO_HOSPITALS.find((h) => h.name === name)!.id

type Seed = [hospital: string, category: FeedbackCategory, comment: string, sentiment: AIAnalysis['sentiment'] | 'pending', issue: string | null, summary: string | null, daysAgo: number, mine?: true]

// Comments mirror supabase/migrations/003_seed_demo_feedback.sql, spread over ~3 months
// so the month filters and monthly reports have something to show.
const FEEDBACK_SEED: Seed[] = [
  ['Khayelitsha District Hospital', 'Cleanliness', 'The waiting room toilets were not cleaned the entire time I was there. There was no toilet paper and the floors were very dirty. This is unacceptable in a healthcare setting.', 'Negative', 'Unclean bathrooms', 'Patient reported dirty toilets and no toilet paper in the waiting area.', 5],
  ['Khayelitsha District Hospital', 'Waiting Time', 'I waited more than 6 hours in casualty before being seen by a doctor. There were not enough staff on duty and patients were suffering while waiting.', 'Negative', 'Long waiting times', 'Patient waited over 6 hours in casualty due to insufficient staff.', 8],
  ['Khayelitsha District Hospital', 'Staff Behaviour', 'The nursing staff were very rude and dismissive. When I asked a question they told me to sit down and wait. I felt disrespected.', 'Negative', 'Rude nursing staff', 'Patient experienced dismissive and disrespectful treatment from nursing staff.', 34],
  ['Khayelitsha District Hospital', 'Service', 'The doctors were thorough and professional. They explained everything clearly and I felt well cared for.', 'Positive', 'Professional doctors', 'Patient praised the thoroughness and professionalism of the medical team.', 45],
  ['Khayelitsha District Hospital', 'Facilities', 'The hospital is very old and needs renovation. The equipment looks outdated and some wards do not have air conditioning.', 'Negative', 'Outdated facilities', 'Patient noted that the hospital building and equipment are in poor condition.', 62],
  ['Groote Schuur Hospital', 'Service', 'Exceptional care from the entire team. The specialists were knowledgeable and I felt confident in my treatment plan.', 'Positive', 'Excellent specialist care', 'Patient reported exceptional care and knowledgeable specialists.', 3, true],
  ['Groote Schuur Hospital', 'Waiting Time', 'The waiting time for outpatients is very long. I arrived at 7am and only saw the doctor at 2pm. This needs to be addressed.', 'Negative', 'Long waiting times', 'Patient waited 7 hours for an outpatient appointment.', 7],
  ['Groote Schuur Hospital', 'Cleanliness', 'The hospital wards were clean and well maintained. The cleaning staff were always busy keeping things tidy.', 'Positive', 'Clean wards', 'Patient praised the cleanliness of the hospital wards.', 38],
  ['Groote Schuur Hospital', 'Staff Behaviour', 'The nurses in ward C were compassionate and attentive. They checked on me regularly and always answered my questions.', 'Positive', 'Compassionate nursing care', 'Patient praised the attentive and compassionate nursing staff in ward C.', 48],
  ['Groote Schuur Hospital', 'Waiting Time', 'Pharmacy queue took almost three hours just to collect my chronic medication. There should be a separate line for repeat scripts.', 'Negative', 'Long waiting times', 'Patient waited nearly three hours at the pharmacy for repeat medication.', 70],
  ['Tygerberg Hospital', 'Facilities', 'The parking is terrible and there is never any space. This is a big problem for patients who cannot walk far.', 'Negative', 'Inadequate parking', 'Patient reported severe parking shortages affecting access to the hospital.', 4],
  ['Tygerberg Hospital', 'Service', 'I had my operation done at Tygerberg and the surgical team was brilliant. I have no complaints about the medical care.', 'Positive', 'Excellent surgical care', 'Patient was highly satisfied with the surgical team and medical care received.', 36],
  ['Tygerberg Hospital', 'Waiting Time', 'The waiting times in the emergency department are very long but I understand they are always very busy. The staff do their best.', 'Neutral', 'Emergency department delays', 'Patient experienced long emergency department waits but acknowledged staff were working hard.', 41, true],
  ['Tygerberg Hospital', 'Cleanliness', 'Maternity ward bathrooms were cleaned twice a day and always had soap. Much better than my previous visit.', 'Positive', 'Clean wards', 'Patient noted improved cleanliness in maternity ward bathrooms.', 75],
  ['George Hospital', 'Cleanliness', 'The hospital is clean and the staff seem to take pride in keeping it that way. Good experience overall.', 'Positive', 'Clean wards', 'Patient noted the hospital is clean and well-maintained by staff.', 6],
  ['George Hospital', 'Staff Behaviour', 'The receptionist was helpful and directed me correctly. Good first impression when I arrived.', 'Positive', 'Helpful reception staff', 'Patient praised the helpfulness and direction provided by reception staff.', 40],
  ['George Hospital', 'Other', 'The signage in the hospital is confusing. I got lost several times trying to find the right department. Better signage is needed.', 'Negative', 'Poor signage', 'Patient found the hospital signage confusing and was unable to navigate independently.', 52],
  ['Worcester Hospital', 'Waiting Time', 'I waited 4 hours to be seen. The hospital was full and the staff were stretched. I think more resources are needed here.', 'Neutral', 'Staff stretched thin', 'Patient waited 4 hours and noted staff appeared understaffed relative to patient load.', 2],
  ['Worcester Hospital', 'Service', 'The dietitian was very helpful and gave me a proper diet plan. Excellent service from the nutrition department.', 'Positive', 'Excellent nutrition service', 'Patient received thorough dietitian consultation and personalised diet plan.', 37],
  ["Red Cross War Memorial Children's Hospital", 'Staff Behaviour', 'The paediatric nurses were incredibly patient with my daughter and explained every procedure to her in a way she understood.', 'Positive', 'Compassionate nursing care', 'Parent praised paediatric nurses for patient, child-friendly communication.', 9],
  ["Red Cross War Memorial Children's Hospital", 'Facilities', 'The play area in the waiting room is lovely but several chairs are broken and parents have to stand for hours.', 'Neutral', 'Broken waiting room seating', 'Parent appreciated the play area but reported broken seating in the waiting room.', 44],
  ['Mitchells Plain Hospital', 'Waiting Time', 'Casualty was overcrowded on a Friday night and we waited five hours. Security staff were helpful though.', 'Negative', 'Long waiting times', 'Patient waited five hours in an overcrowded casualty unit.', 11],
  ['Mitchells Plain Hospital', 'Service', 'Follow-up appointment was well organised and the doctor had my file ready. In and out within an hour.', 'Positive', 'Efficient outpatient service', 'Patient reported a well-organised and efficient follow-up appointment.', 66],
  ['Stellenbosch Hospital', 'Cleanliness', 'Bins in the corridor were overflowing and the ward smelled bad in the morning.', 'Negative', 'Poor waste management', 'Patient reported overflowing bins and unpleasant odours in the ward.', 13],
  ['Knysna Hospital', 'Staff Behaviour', 'Night shift staff ignored the call button for over 30 minutes while my father needed help.', 'Negative', 'Unresponsive night staff', 'Patient reported delayed responses from night shift staff to call buttons.', 39],
  ['Paarl Hospital', 'Facilities', 'New X-ray machine means results came back the same day. Very impressed with the upgrade.', 'Positive', 'Upgraded equipment', 'Patient praised new X-ray equipment enabling same-day results.', 15],
  ['Vredenburg Hospital', 'Other', 'There is no clear information about visiting hours on the website or at the entrance.', 'Neutral', 'Unclear visiting information', 'Patient requested clearer communication of visiting hours.', 72],
  ['Hermanus Hospital', 'Service', 'The physiotherapist gave clear exercises and followed up by phone a week later. Really caring service.', 'Positive', 'Excellent follow-up care', 'Patient appreciated clear physiotherapy guidance and follow-up call.', 1],
  ['Beaufort West Hospital', 'Waiting Time', 'Had to wait two days for a specialist because they only visit once a week from George.', 'Negative', 'Limited specialist access', 'Patient waited two days due to infrequent visiting specialist schedules.', 47],
]

const DAY = 86_400_000

/** Fresh copy of the sample dataset, with dates relative to now. */
export function createSeedFeedback(now = Date.now()): Feedback[] {
  return FEEDBACK_SEED.map(([hospital, category, comment, sentiment, issue, summary, daysAgo, mine], i) => ({
    id: seedId('b', i + 1),
    user_id: mine ? DEMO_USER_ID : seedId('c', (i % 7) + 1),
    hospital_id: hid(hospital),
    category,
    comment,
    sentiment,
    issue,
    ai_summary: summary,
    // spread across the working day so ordering looks natural
    created_at: new Date(now - daysAgo * DAY - (i % 9) * 3_600_000).toISOString(),
  }))
}

// ── Local analysis (stands in for Groq in Demo Mode) ────────────────────────
// ponytail: keyword scoring, nowhere near an LLM; live mode uses services/ai.ts.
const POSITIVE_WORDS = /\b(clean|friendly|helpful|kind|professional|excellent|great|good|thank\w*|caring|compassionate|quick|efficient|respectful|brilliant|impressed|organised|tidy|attentive|lovely)\b/gi
const NEGATIVE_WORDS = /\b(dirty|rude|slow|unacceptable|bad|poor|terrible|broken|never|ignored|disrespect\w*|smell\w*|overcrowded|lost|worst|hours|delay\w*|filthy|unhelpful|confusing|outdated)\b/gi

const ISSUE_LABELS: Record<FeedbackCategory, Record<AIAnalysis['sentiment'], string>> = {
  'Cleanliness': { Positive: 'Clean wards', Negative: 'Poor hygiene', Neutral: 'Cleanliness feedback' },
  'Staff Behaviour': { Positive: 'Caring staff', Negative: 'Unprofessional staff', Neutral: 'Staff interaction' },
  'Waiting Time': { Positive: 'Efficient service times', Negative: 'Long waiting times', Neutral: 'Waiting time feedback' },
  'Service': { Positive: 'Good quality of care', Negative: 'Poor quality of care', Neutral: 'Service feedback' },
  'Facilities': { Positive: 'Well-maintained facilities', Negative: 'Facility maintenance issues', Neutral: 'Facilities feedback' },
  'Other': { Positive: 'General praise', Negative: 'General complaint', Neutral: 'General feedback' },
}

export function analyzeDemoFeedback(comment: string, category: FeedbackCategory): AIAnalysis {
  const score = (comment.match(POSITIVE_WORDS)?.length ?? 0) - (comment.match(NEGATIVE_WORDS)?.length ?? 0)
  const sentiment: AIAnalysis['sentiment'] = score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral'
  const issue = ISSUE_LABELS[category][sentiment]
  return {
    sentiment,
    issue,
    summary: `Demo keyword analysis: ${sentiment.toLowerCase()} feedback about ${category.toLowerCase()} (${issue.toLowerCase()}).`,
  }
}

// ── Aggregation (mirrors app/admin/dashboard/page.tsx) ──────────────────────
/** Newest first, with the hospital joined like Supabase's `select('*, hospitals(...)')`. */
export function withHospitals(feedback: Feedback[]): Feedback[] {
  const byId = new Map(DEMO_HOSPITALS.map((h) => [h.id, h]))
  return feedback
    .map((f) => ({ ...f, hospitals: byId.get(f.hospital_id) }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

/** Filter by hospital id and/or "YYYY-M" month, same params the live pages use. */
export function filterFeedback<T extends Feedback>(rows: T[], hospitalId?: string, month?: string): T[] {
  const [year, m] = (month ?? '').split('-').map(Number)
  return rows.filter((f) => {
    if (hospitalId && f.hospital_id !== hospitalId) return false
    if (year && m) {
      const d = new Date(f.created_at)
      if (d.getFullYear() !== year || d.getMonth() + 1 !== m) return false
    }
    return true
  })
}

export function monthOptions(count = 12) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return {
      value: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }),
    }
  })
}

const countBy = <T,>(rows: T[], key: (r: T) => string | null) =>
  rows.reduce<Record<string, number>>((acc, r) => {
    const k = key(r)
    if (k) acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})

export function dashboardStats(rows: Feedback[]) {
  const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0)
  const hospitalStats = DEMO_HOSPITALS.map((h) => {
    const hr = rows.filter((f) => f.hospital_id === h.id)
    const by = countBy(hr, (r) => r.sentiment)
    return {
      id: h.id,
      name: h.name,
      district: h.district,
      total: hr.length,
      positive: pct(by.Positive ?? 0, hr.length),
      negative: pct(by.Negative ?? 0, hr.length),
      neutral: pct(by.Neutral ?? 0, hr.length),
    }
  }).filter((h) => h.total > 0).sort((a, b) => b.total - a.total)

  return {
    totalFeedback: rows.length,
    sentimentCounts: countBy(rows, (r) => r.sentiment ?? 'pending'),
    categoryCounts: countBy(rows, (r) => r.category),
    topIssues: Object.entries(countBy(rows, (r) => r.issue))
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    recentFeedback: rows.slice(0, 10),
    hospitalStats,
  }
}
