import Groq from 'groq-sdk'
import type { AIAnalysis, FeedbackCategory } from '@/types/database'

// This file must ONLY be imported in server-side code (API routes, Server Components)
// Lazy-init so the build doesn't fail when GROQ_API_KEY isn't set
let _groq: Groq | null = null
function getGroq() {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.')
  }

  if (!_groq) {
    _groq = new Groq({ apiKey })
  }
  return _groq
}

const MAX_ANALYSIS_ATTEMPTS = 3
const ANALYSIS_TIMEOUT_MS = 15_000

function isRetryableError(error: unknown) {
  if (!(error instanceof Error)) return true
  return !/invalid api key|authentication|permission|unauthorized/i.test(error.message)
}

export async function analyzeFeedback(
  comment: string,
  category: FeedbackCategory
): Promise<AIAnalysis | null> {
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

  for (let attempt = 1; attempt <= MAX_ANALYSIS_ATTEMPTS; attempt += 1) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS)
      const completion = await getGroq().chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
      }, { signal: controller.signal })
      clearTimeout(timeout)
      console.debug('[AI] Groq request succeeded', { status: 200, attempt })

      const raw = completion.choices[0]?.message?.content?.trim()
      if (!raw) throw new Error('Groq returned an empty response.')

      console.debug('[AI] Groq raw response', { response: raw })
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned) as Partial<AIAnalysis>
      console.debug('[AI] Parsed Groq response', { response: parsed })
      const sentiment = typeof parsed.sentiment === 'string'
        ? parsed.sentiment.trim().toLowerCase()
        : ''
      const normalized: AIAnalysis = {
        sentiment: sentiment === 'positive'
          ? 'Positive'
          : sentiment === 'negative'
            ? 'Negative'
            : 'Neutral',
        issue: parsed.issue ?? '',
        summary: parsed.summary ?? '',
      }

      if (
        !['positive', 'negative', 'neutral'].includes(sentiment) ||
        !normalized.issue ||
        !normalized.summary
      ) {
        throw new Error('Groq returned an invalid analysis payload.')
      }

      console.debug('[AI] Final sentiment returned from analysis', { sentiment: normalized.sentiment })
      return normalized
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? (error as { status?: number }).status
        : undefined
      console.error(`[AI] Groq analysis attempt ${attempt}/${MAX_ANALYSIS_ATTEMPTS} failed`, { message, status })
      if (attempt === MAX_ANALYSIS_ATTEMPTS || !isRetryableError(error)) break
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }

  console.error('[AI] Groq analysis failed after all attempts; using fallback status.')
  console.debug('[AI] Final sentiment returned from analysis', { sentiment: null })
  return null
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
