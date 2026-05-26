# O Estudo — protótipo

Personalised facial architecture report for prospective aesthetic medicine patients. Editorial, restrained, Portuguese.

This is a **prototype**. No authentication, no database, no payments, no email. Reports live in-memory inside the Next.js dev server process — restarting the server clears every report.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and set GOOGLE_API_KEY
npm run dev
```

Open <http://localhost:3000>.

### Required environment variables

| Name | Description |
| --- | --- |
| `GOOGLE_API_KEY` | Google AI Studio key (free tier). Used by `/api/generate-report` to call Gemini 2.5 Flash with vision. Get one at <https://aistudio.google.com/apikey>. `GEMINI_API_KEY` is accepted as an alias. |

## Flow

1. `/` — landing page with a single CTA.
2. `/intake` — three photo uploads + questionnaire.
3. `/processing/[id]` — deliberately slow processing screen (~90s minimum).
4. `/estudo/[id]` — the report itself, rendered as a single-column editorial document.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for the design system (linho / pedra / rose / travertino / carvao)
- `@google/genai` calling Gemini 2.5 Flash with vision (free tier)
- `react-dropzone` for uploads
- In-memory `Map` keyed by UUID for sessions

## Deployment

This prototype is deployable to Vercel as-is.

- `app/api/generate-report/route.ts` declares `runtime = "nodejs"` and `maxDuration = 60` so the Gemini call does not hit Vercel's default 10s function ceiling.
- The intake page stashes the photographs and answers in `sessionStorage` and the processing page POSTs them to `/api/generate-report` — keeping the heavy work in a single request that the serverless instance can complete before returning.
- The single required environment variable is `GOOGLE_API_KEY`. Set it on the Vercel project (Production) via the dashboard. `.env.local` is gitignored and must never be committed.
- Persistence caveat for production: reports live only in the memory of the serverless instance that generated them. A report opened in a different region, after a cold start, or from a different lambda will not be retrievable. A database is the first thing to add in the next iteration.

## Notes & out of scope

- PDF export is a stub button.
- Calendar booking is a stub.
- Payments are disabled (the €39 is shown only to set the frame).
- Refreshing the dev server clears all reports.
