from bs4 import BeautifulSoup
from ..utils.text import make_uid, parse_price_range, parse_datetime

def parse(html, source_url):
    soup = BeautifulSoup(html, "html.parser")
    # example structure; adjust selectors to real page:
    rows = soup.select("table tr")[1:]
    for tr in rows:
        tds = tr.find_all("td")
        if not tds: continue
        date_txt = tds[0].get_text(strip=True)
        title = tds[1].get_text(" ", strip=True)
        venue_name = tds[2].get_text(" ", strip=True)
        price_txt = tds[3].get_text(" ", strip=True) if len(tds) > 3 else ""
        age_txt = tds[4].get_text(" ", strip=True) if len(tds) > 4 else ""
        tags = [x.strip() for x in tds[-1].get_text(",").split(",") if x.strip()]

        links = [a["href"] for a in tr.select("a[href]")]
        start_ts = parse_datetime(date_txt)
        price_min, price_max = parse_price_range(price_txt)

        yield {
            "external_uid": make_uid(date_txt, title, venue_name),
            "title": title,
            "start_ts": start_ts,
            "end_ts": None,
            "venue_name": venue_name,
            "price_min": price_min,
            "price_max": price_max,
            "age_restriction": age_txt,
            "tags": tags,
            "links": links,
            "source_url": source_url
        }
