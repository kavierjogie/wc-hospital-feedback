import Groq from 'groq-sdk'
import type { AIAnalysis, FeedbackCategory } from '@/types/database'

// This file must ONLY be imported in server-side code (API routes, Server Components)
// Lazy-init so the build doesn't fail when GROQ_API_KEY isn't set
let _groq: Groq | null = null
function getGroq() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _groq
}

export async function analyzeFeedback(
  comment: string,
  category: FeedbackCategory
): Promise<AIAnalysis | null> {
  try {
    const prompt = `You are analyzing patient feedback submitted to a Western Cape public hospital in South Africa.

Category: ${category}
Patient comment: "${comment}"

Analyze this feedback and respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "issue": "Short label of the main issue (max 5 words)",
  "summary": "One sentence summary of the concern (max 25 words)"
}

Rules:
- sentiment must be exactly "Positive", "Negative", or "Neutral"
- issue must be specific and actionable (e.g. "Long waiting times", "Unclean bathrooms", "Friendly staff")
- summary must be neutral and factual, not reproducing personal details`

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) return null

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as AIAnalysis

    // Validate structure
    if (
      !['Positive', 'Negative', 'Neutral'].includes(parsed.sentiment) ||
      !parsed.issue ||
      !parsed.summary
    ) {
      return null
    }

    return parsed
  } catch (err) {
    console.error('[AI] analyzeFeedback error:', err)
    return null
  }
}

export async function generateHospitalSummary(
  hospitalName: string,
  stats: {
    total: number
    positive_pct: number
    negative_pct: number
    neutral_pct: number
    top_issues: { issue: string; count: number }[]
    sample_concerns: string[]
  }
): Promise<string> {
  try {
    const issueList = stats.top_issues
      .slice(0, 5)
      .map((i) => `${i.issue} (${i.count} reports)`)
      .join(', ')

    const prompt = `Write a concise 2-sentence summary for a government health report about ${hospitalName}.
Data: ${stats.total} submissions. Positive: ${stats.positive_pct}%, Negative: ${stats.negative_pct}%, Neutral: ${stats.neutral_pct}%.
Main issues reported: ${issueList}.
Tone: professional, factual, South African health context. No markdown.`

    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    })

    return completion.choices[0]?.message?.content?.trim() ?? ''
  } catch {
    return ''
  }
}
