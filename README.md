# EDM Pulse – LA Electronic Events

Next.js (App Router) + Tailwind, Supabase-backed events, hourly scraper, ISR, sitemap/robots, JSON-LD Event schema.

## Quick start
```bash
npm i
npm run dev
```

## Environment
Copy `.env.example` → `.env.local` and fill values (already included in this package for your project).

## Deploy to Vercel
- Push to GitHub → Import on Vercel
- Add env vars in Vercel (match `.env.local`)
- Set Cron Job: GET `/api/sync` hourly

## Database
Run `supabase.sql` in Supabase SQL editor to create tables + indexes.

## Sync Flow
`/api/sync` → fetch 19hz LA → parse → upsert to `events` by fingerprint → mark stale → revalidate `/`.
