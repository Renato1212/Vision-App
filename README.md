# O Estudo — protótipo

Personalised facial architecture report for prospective aesthetic medicine patients. Editorial, restrained, Portuguese.

This is a **prototype**. No authentication, no database, no payments, no email. Reports live in-memory inside the Next.js dev server process — restarting the server clears every report.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY
npm run dev
```

Open <http://localhost:3000>.

### Required environment variables

| Name | Description |
| --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic API key, used by `/api/generate-report`. |

## Flow

1. `/` — landing page with a single CTA.
2. `/intake` — three photo uploads + questionnaire.
3. `/processing/[id]` — deliberately slow processing screen (~90s minimum).
4. `/estudo/[id]` — the report itself, rendered as a single-column editorial document.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS for the design system (linho / pedra / rose / travertino / carvao)
- `@anthropic-ai/sdk` calling the latest Claude Sonnet model with vision
- `react-dropzone` for uploads
- In-memory `Map` keyed by UUID for sessions

## Notes & out of scope

- PDF export is a stub button.
- Calendar booking is a stub.
- Payments are disabled (the €39 is shown only to set the frame).
- Refreshing the dev server clears all reports.
