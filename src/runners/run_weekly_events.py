import os
from ..config import settings
from ..utils import html
from ..parsers.events_la import parse
from ..db import conn, upsert_venue

LA_URL = os.getenv("LA_URL", "https://19hz.info/eventlisting_LosAngeles.php")
UA = os.getenv("USER_AGENT", "EDM-Pulse-Scraper/0.1")

def upsert_event(c, ev):
    with c.cursor() as cur:
        venue_id = upsert_venue(c, ev["venue_name"])
        cur.execute("""
          insert into events(external_uid,title,start_ts,end_ts,venue_id,price_min,price_max,age_restriction,tags,source_url)
          values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
          on conflict(external_uid) do update set
            title=excluded.title,
            start_ts=excluded.start_ts,
            end_ts=excluded.end_ts,
            venue_id=excluded.venue_id,
            price_min=excluded.price_min,
            price_max=excluded.price_max,
            age_restriction=excluded.age_restriction,
            tags=excluded.tags,
            scraped_at=now()
          returning event_id
        """, (
            ev["external_uid"], ev["title"], ev["start_ts"], ev["end_ts"], venue_id,
            ev["price_min"], ev["price_max"], ev["age_restriction"], ev["tags"], ev["source_url"]
        ))
        event_id = cur.fetchone()[0]
        for url in ev["links"]:
            cur.execute("""
              insert into event_links(event_id, kind, url)
              values(%s,%s,%s) on conflict do nothing
            """, (event_id, "alt", url))

def main():
    html_text = html.get(LA_URL, headers={"User-Agent": UA})
    items = list(parse(html_text, LA_URL))
    with conn() as c, c.transaction():
        upserts = 0
        for ev in items:
            upsert_event(c, ev)
            upserts += 1
        with c.cursor() as cur:
            cur.execute("""
                insert into scrape_runs(run_type, rows_parsed, rows_upserted)
                values('weekly_events', %s, %s)
            """, (len(items), upserts))
    print(f"Parsed {len(items)} row(s), upserted {upserts}.")

if __name__ == "__main__":
    main()
