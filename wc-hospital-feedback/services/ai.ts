import Groq from 'groq-sdk'
import type { AIAnalysis, FeedbackCategory } from '@/types/database'

// This file must ONLY be imported in server-side code (API routes, Server Components)
// Lazy-init so the build doesn't fail when GROQ_API_KEY isn't set
let _groq: Groq | null = null
const GROQ_MODELS = (process.env.GROQ_MODELS || 'openai/gpt-oss-20b,openai/gpt-oss-120b')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean)

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

function parseAnalysisResponse(raw: string): Partial<AIAnalysis> & { ai_summary?: unknown } {
  const withoutFence = raw.replace(/^\s*```(?:json)?\s*|\s*```\s*$/gi, '').trim()
  try {
    return JSON.parse(withoutFence) as Partial<AIAnalysis>
  } catch {
    const start = withoutFence.indexOf('{')
    const end = withoutFence.lastIndexOf('}')
    if (start < 0 || end <= start) throw new Error('Groq response did not contain a JSON object.')
    return JSON.parse(withoutFence.slice(start, end + 1)) as Partial<AIAnalysis>
  }
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

  for (const model of GROQ_MODELS) {
    for (let attempt = 1; attempt <= MAX_ANALYSIS_ATTEMPTS; attempt += 1) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS)
        console.debug('[Groq request]', {
          model,
          category,
          comment,
          attempt,
        })
        const completion = await getGroq().chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 200,
          response_format: { type: 'json_object' },
        }, { signal: controller.signal })
        clearTimeout(timeout)
        console.debug('[Groq HTTP status]', { status: 200, model, attempt })

        const raw = completion.choices[0]?.message?.content?.trim()
        if (!raw) throw new Error('Groq returned an empty response.')

        console.debug('[Groq raw content]', { content: raw })
        const parsed = parseAnalysisResponse(raw)
        console.debug('[Parsed analysis]', { analysis: parsed })
        const sentiment = typeof parsed.sentiment === 'string'
          ? parsed.sentiment.trim().toLowerCase()
          : ''
        const normalized: AIAnalysis = {
          sentiment: sentiment === 'positive'
            ? 'Positive'
            : sentiment === 'negative'
              ? 'Negative'
              : 'Neutral',
          issue: typeof parsed.issue === 'string' ? parsed.issue.trim() : '',
          summary: typeof parsed.summary === 'string'
            ? parsed.summary.trim()
            : typeof parsed.ai_summary === 'string'
              ? parsed.ai_summary.trim()
              : '',
        }

        if (
          !['positive', 'negative', 'neutral'].includes(sentiment) ||
          !normalized.issue ||
          !normalized.summary
        ) {
          throw new Error('Groq returned an invalid analysis payload.')
        }

        console.debug('[Final sentiment]', { sentiment: normalized.sentiment })
        console.debug('[Final issue]', { issue: normalized.issue })
        console.debug('[Final ai_summary]', { ai_summary: normalized.summary })
        return normalized
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        const status = typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined
        console.error(`[AI] Groq model ${model} attempt ${attempt}/${MAX_ANALYSIS_ATTEMPTS} failed`, { message, status })
        if (!isRetryableError(error)) return null
        if (attempt < MAX_ANALYSIS_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
        }
      }
    }
  }

  console.error('[AI] Groq analysis failed after all attempts; returning null to the API route.')
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

    for (const model of GROQ_MODELS) {
      for (let attempt = 1; attempt <= MAX_ANALYSIS_ATTEMPTS; attempt += 1) {
        try {
          const completion = await getGroq().chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 150,
          })

          return completion.choices[0]?.message?.content?.trim() ?? ''
        } catch (error) {
          if (!isRetryableError(error)) return ''
          if (attempt < MAX_ANALYSIS_ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
          }
        }
      }
    }

    return ''
  } catch {
    return ''
  }
}
