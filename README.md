# 🎧 EDM Pulse — LA EDM Event Pipeline

**EDM Pulse** is an automated data pipeline that scrapes electronic music events in Los Angeles from **19hz.info** on a weekly basis, stores them in a **Postgres (Supabase)** database, and will power a public website showcasing upcoming events in a clean, modern UI.

This repo contains the backend pipeline + infrastructure to collect, process, and store the data.

> Frontend website (Next.js) coming soon.

---

## 🚀 Features

| Feature | Description |
|---|---|
✅ Weekly scraping of LA EDM events  
✅ Normalized event storage in Postgres  
✅ Venue & promoter reference tables  
✅ Deduplication via deterministic event hash  
✅ GitHub Actions automation  
✅ Local dev support + `.env` config  
🔜 Future: Full frontend site (`edmpulse.io`)  
🔜 Future: Webhook for event changes  
🔜 Future: Multi-city support  

---

## 🏗 Architecture

```
┌────────────┐        ┌──────────────┐        ┌──────────────┐
│ 19hz.info  │ ───▶   │ Scraper      │ ───▶   │ Supabase DB  │
└────────────┘        │ (Python)     │        │ (Postgres)   │
                      └─────▲────────┘        └─────┬────────┘
                            │                       │
                            │ GitHub Actions Cron   │
                            │ (weekly scrape)       │
                            ▼                       ▼
                      Local dev + manual runs   Future: Next.js UI
```

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
Language | Python  
Database | Postgres (Supabase)  
Infrastructure | GitHub Actions cron jobs  
Parsing | BeautifulSoup  
Scheduling | GitHub Actions `cron:`  
Future Web UI | Next.js + Supabase Auth  

---

## 📁 Project Structure

```
edm-la-pipeline/
├─ sql/                         # Database schema + indexes
├─ src/
│  ├─ parsers/                  # HTML scrapers for events, venues, promoters
│  ├─ utils/                    # Helpers for HTML requests & parsing
│  ├─ runners/                  # Cron job entrypoints
│  └─ db.py                     # Postgres upsert logic
└─ .github/workflows/           # Scheduled GitHub Actions scraper
```

---

## ⚙️ Setup

### 1️⃣ Clone the repo
```bash
git clone https://github.com/yourname/edm-pulse-pipeline.git
cd edm-pulse-pipeline
```

### 2️⃣ Install dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3️⃣ Configure environment
Copy `.env.example` → `.env` and fill in your Supabase DB URL:

```
DATABASE_URL="postgresql://..."
```

### 4️⃣ Apply database schema
Run in Supabase SQL editor:

```sql
-- Run sql/001_init_schema.sql + sql/002_indexes.sql
```

---

## ▶️ Run Locally

```bash
make scrape
```

or

```bash
python -m src.runners.run_weekly_events
```

---

## 🤖 Automation

Scrape runs weekly using GitHub Actions:

`.github/workflows/weekly-scrape.yml`

You can also run it manually in GitHub with **Run Workflow**.

---

## 🧪 Future Work / Roadmap

- [ ] Add multi-city support (SF, NYC, Miami)
- [ ] Include ticket & alt link scraping
- [ ] Notify when major events get added (webhook)
- [ ] Deploy public UI at **edmpulse.io**
- [ ] Add search + filtering + maps
- [ ] Add historical event analytics (genres, venues, promoters)
- [ ] Integrate artist metadata (Spotify / Songkick)

---

## 📜 License

MIT License — feel free to fork & build.

Give credit if you expand on this 🙏

---

## 👤 Author

**Christopher Hughes**  
Creator of EDM Pulse  
Data Engineer • Music & Tech Enthusiast  
Los Angeles, CA

---

## ⭐️ Support the Project

Star this repo to follow development ⭐️  
Share EDM Pulse with friends in the scene 🎶  
PRs welcome once repo goes public 👯‍♂️
