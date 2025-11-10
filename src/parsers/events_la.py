# src/parsers/events_la.py
from bs4 import BeautifulSoup
from ..utils.text import (
    make_uid,
    parse_price_range,
    parse_start_end_pacific,
    clean_cell,
)

HEADER_CUES = {
    "date/time", "event title @ venue", "tags", "price | age", "organizers", "links"
}

def is_header_row(tr) -> bool:
    # any THs = header
    if tr.find("th"):
        return True
    # or the first row of TDs that looks like the header text
    tds = [clean_cell(td.get_text(" ", strip=True)) for td in tr.find_all("td")]
    if not tds:
        return True
    sample = " ".join(tds[:3]).lower()
    return any(h in sample for h in HEADER_CUES)

def parse(html, source_url):
    soup = BeautifulSoup(html, "html.parser")

    # pick the largest table on the page (their listing)
    tables = soup.select("table")
    table = max(tables, key=lambda t: len(t.select("tr"))) if tables else None
    rows = table.select("tr") if table else soup.select("tr")

    for tr in rows:
        if is_header_row(tr):
            continue

        tds = tr.find_all("td")
        if len(tds) < 3:
            continue

        # Column mapping seen on 19hz (same as past events page):
        # 0: Date/Time   1: Event Title @ Venue   2: Tags
        # 3: Price | Age 4: Organizers            5: Links
        col = [clean_cell(td.get_text(" ", strip=True)) for td in tds] + [""] * 6
        date_txt, title_venue, tags_txt, price_age, organizers = col[0], col[1], col[2], col[3], col[4]

        # Title + Venue split: "Some Party @ Club Name (City)"
        title = title_venue
        venue_name = ""
        if "@" in title_venue:
            parts = title_venue.split("@", 1)
            title = parts[0].strip()
            venue_name = parts[1].strip()

        # Tags (comma/pipe/slash separated)
        tags = [t.strip() for t in tags_txt.replace("|", ",").replace("/", ",").split(",") if t.strip()]

        # Price / Age: e.g. "free rsvp b4 11:15 / $20-40 | 21+"
        price_side = price_age.split("|")[0].strip() if "|" in price_age else price_age
        price_min, price_max = parse_price_range(price_side)
        age_restriction = price_age.split("|", 1)[1].strip() if "|" in price_age else None

        # Links on the row
        links = [a["href"] for a in tr.select("a[href]")]

        # Robust local time parsing (e.g., "Tue: Nov 4 (11pm-2am)")
        start_ts, end_ts = parse_start_end_pacific(date_txt)

        # Skip junk rows we didn't parse well
        if not title or title.lower().startswith("event title"):
            continue

        yield {
            "external_uid": make_uid(date_txt, title, venue_name),
            "title": title,
            "start_ts": start_ts,
            "end_ts": end_ts,
            "venue_name": venue_name,
            "price_min": price_min,
            "price_max": price_max,
            "age_restriction": age_restriction,
            "tags": tags,
            "links": links,
            "source_url": source_url,
            "organizers": organizers or None,
        }
