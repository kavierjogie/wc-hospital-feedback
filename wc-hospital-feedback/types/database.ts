export type UserRole = 'patient' | 'admin'
export type SentimentType = 'Positive' | 'Negative' | 'Neutral' | 'pending' | 'failed'
export type FeedbackCategory =
  | 'Cleanliness'
  | 'Staff Behaviour'
  | 'Waiting Time'
  | 'Service'
  | 'Facilities'
  | 'Other'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Hospital {
  id: string
  name: string
  district: string
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string
  hospital_id: string
  category: FeedbackCategory
  comment: string
  sentiment: SentimentType | null
  issue: string | null
  ai_summary: string | null
  created_at: string
  hospitals?: Hospital
  profiles?: Profile
}

export interface AIAnalysis {
  sentiment: 'Positive' | 'Negative' | 'Neutral'
  issue: string
  summary: string
}

export interface MonthlyStats {
  hospital_id: string
  hospital_name: string
  district: string
  total: number
  positive: number
  negative: number
  neutral: number
  positive_pct: number
  negative_pct: number
  neutral_pct: number
  top_issues: { issue: string; count: number }[]
  top_categories: { category: string; count: number }[]
  sample_feedback: { comment: string; sentiment: string; category: string }[]
  ai_summary?: string
}
