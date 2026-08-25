# Western Cape Public Hospital Feedback System

A production-ready web application for collecting and analysing patient feedback from Western Cape public hospitals. Built with Next.js 14, TypeScript, Supabase, and Groq AI.

---

## Features

- **Patient portal** — register, submit feedback, view own submissions
- **AI analysis** — Groq analyses each submission for sentiment, issue, and summary (server-side only)
- **Admin dashboard** — sentiment charts, category breakdown, top issues, hospital overview
- **Monthly PDF reports** — professional PDF generation for government submission
- **Automated reporting** — Vercel Cron Job triggers report generation monthly
- **Email delivery** — optional Resend/SendGrid integration for automated report delivery
- **POPIA compliant** — patient identities are never included in reports
- **Row Level Security** — enforced at database level via Supabase RLS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Groq (`llama-3.1-8b-instant`) |
| Charts | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Deployment | Vercel |
| Email (optional) | Resend |

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd wc-hospital-feedback
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to **SQL Editor** and run the migrations in order:
   - `supabase/migrations/001_schema.sql` — creates tables, RLS policies, trigger
   - `supabase/migrations/002_seed_hospitals.sql` — seeds 30+ Western Cape hospitals
   - `supabase/migrations/003_seed_demo_feedback.sql` *(optional)* — adds demo data for dashboard testing

3. Copy your project credentials from **Settings → API**:
   - `Project URL`
   - `anon` / `public` key
   - `service_role` key *(keep secret!)*

### 3. Set up Groq

1. Create an account at [console.groq.com](https://console.groq.com)
2. Generate an API key
3. Free tier is sufficient for development

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GROQ_API_KEY=your-groq-api-key

# Optional — for automated email delivery
REPORT_RECIPIENT_EMAIL=reports@westerncape.gov.za
EMAIL_API_KEY=your-resend-api-key

# Random secret for cron security
CRON_SECRET=your-random-secret-here
```

### 5. Create admin account

1. Start the app: `npm run dev`
2. Register a new account at `http://localhost:3000/register`
3. In Supabase SQL Editor, promote the user to admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'your-user-uuid-here';
```

*Find the UUID in Supabase → Authentication → Users.*

### 6. Run the app

```bash
npm run dev
```

Visit:
- `http://localhost:3000` — landing page
- `http://localhost:3000/feedback` — patient feedback form
- `http://localhost:3000/admin/dashboard` — admin dashboard (requires admin role)
- `http://localhost:3000/admin/reports` — report generation

---

## Supabase Row Level Security

RLS is enabled on all tables. Policies:

| Table | Patient | Admin |
|-------|---------|-------|
| `profiles` | Read/update own | Read all |
| `hospitals` | Read only | Read only (service role can write) |
| `feedback` | Insert own, read own | Read all |

---

## AI Analysis

Groq is called **server-side only** via `/api/feedback` route. The `GROQ_API_KEY` is never exposed to the browser.

If AI analysis fails (e.g. rate limit, network error), the feedback is still saved with `sentiment = 'pending'`. The system degrades gracefully.

---

## Monthly Reports

### Manual generation
1. Log in as admin
2. Go to **Reports** page
3. Select a month and click **Generate & Download PDF**

### Automated via Vercel Cron

The cron job runs on the **1st of every month at 06:00 UTC** and generates a report for the previous month.

**Setup:**
1. Deploy to Vercel (the `vercel.json` cron config is included)
2. Set `CRON_SECRET` in Vercel environment variables
3. Optionally set `REPORT_RECIPIENT_EMAIL` and `EMAIL_API_KEY` for email delivery

**Email provider:** The cron job uses [Resend](https://resend.com) by default. To use a different provider, edit the `sendEmailWithAttachment` function in `app/api/cron/monthly-report/route.ts`.

**Manual cron trigger (for testing):**
```bash
curl -X GET http://localhost:3000/api/cron/monthly-report \
  -H "x-cron-secret: your-cron-secret"
```

---

## Deployment to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel deploy
```

### Option B: GitHub integration

1. Push repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example` in Vercel dashboard
4. Deploy

### Post-deployment

- Vercel automatically detects `vercel.json` and registers the cron job
- The cron job requires Vercel Pro plan for cron support
- Free plan: trigger the report endpoint manually or via an external cron service

---

## Project Structure

```
wc-hospital-feedback/
├── app/
│   ├── (auth)/               # Login, Register pages
│   ├── (patient)/            # Patient routes (layout with auth guard)
│   │   ├── feedback/         # Submit feedback + success page
│   │   └── my-feedback/      # View own submissions
│   ├── admin/                # Admin routes (admin role guard)
│   │   ├── dashboard/        # Overview with charts
│   │   └── reports/          # Monthly report generation
│   ├── api/
│   │   ├── feedback/         # POST — submit feedback + AI analysis
│   │   ├── reports/generate/ # POST — generate PDF (admin only)
│   │   └── cron/monthly-report/ # GET — automated monthly report
│   ├── layout.tsx
│   ├── page.tsx              # Public landing page
│   └── globals.css
├── components/
│   ├── admin/                # Dashboard charts, report UI
│   ├── patient/              # FeedbackForm, PatientNav
│   └── shared/
├── lib/
│   ├── supabase/             # client.ts, server.ts, admin.ts
│   ├── utils.ts
│   └── validation.ts         # Zod schemas
├── services/
│   ├── ai.ts                 # Groq AI analysis (server only)
│   └── report.ts             # Monthly stats + PDF generation
├── supabase/
│   └── migrations/           # SQL schema, hospitals seed, demo data
├── types/
│   └── database.ts
├── middleware.ts              # Route protection
├── vercel.json               # Cron job config
└── .env.example
```

---

## Security Notes

- Groq API key is **server-side only** — never in client bundles
- RLS enforced at database level — patients cannot access other users' data
- Admin routes check both session AND database role
- Cron endpoint protected by `CRON_SECRET` header
- All user input validated and sanitised with Zod
- Patient identities are **never included** in PDF reports (POPIA compliant)
- Service role key only used in server API routes

---

## Customisation

### Adding hospitals
Run in Supabase SQL Editor:
```sql
INSERT INTO public.hospitals (name, district) VALUES ('New Hospital', 'District Name');
```

### Changing the AI model
Edit `services/ai.ts` — change `model: 'llama-3.1-8b-instant'` to any Groq-supported model.

### Email provider
Replace the Resend implementation in `app/api/cron/monthly-report/route.ts` with SendGrid, Mailgun, or any other provider.

---

## Troubleshooting

**"Groq API key not configured"** — Set `GROQ_API_KEY` in `.env.local`. Feedback is saved even if AI fails.

**"Failed to load hospitals"** — Run `002_seed_hospitals.sql` migration in Supabase.

**Admin redirect loop** — Ensure your profile has `role = 'admin'` in the `profiles` table.

**PDF download fails** — The PDF is generated server-side. Check server logs for jsPDF errors.

---

## Demo Credentials

After running the demo seed (`003_seed_demo_feedback.sql`), the dashboard will have sample data for 5 hospitals. To enable it, create a demo admin user and run the migration.

---

## Licence

For Western Cape Department of Health internal use. Not for redistribution.
