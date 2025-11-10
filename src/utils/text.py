# src/utils/text.py
"""
Text / datetime / parsing helpers for EDM Pulse scrapers.

Contains:
- clean_cell: normalize whitespace / weird chars from HTML cells
- make_uid: deterministic external UID for de-duplication
- parse_price_range: extract numeric min/max from price strings
- parse_dt_fuzzy: small wrapper around dateutil.parse for general use
- parse_start_end_pacific: robust parser for site date/time cell strings that
  returns timezone-aware UTC datetimes (start, end) or (None, None)
"""

import hashlib
import re
from datetime import datetime, date, time, timedelta, timezone
from dateutil import parser as dtp

# zoneinfo (stdlib on py3.9+)
try:
    from zoneinfo import ZoneInfo
except Exception:
    # If you support older Python, consider adding backports.zoneinfo to requirements
    raise

PACIFIC = ZoneInfo("America/Los_Angeles")

# regex helpers
_TIME_RANGE_RE = re.compile(r"\(([^)]*)\)")        # text inside parentheses e.g. (11pm-2am)
_SEP_RE = re.compile(r"\s*[-–—]\s*")               # dash variants between times
_MONTH_DAY_RE = re.compile(r"([A-Za-z]{3,9}\s*\d{1,2})")  # e.g., "Nov 7" or "November 7"
_PRICE_RE = re.compile(r"\$?\d+(?:\.\d+)?")        # numbers like 20, $20.00, 87.21

def clean_cell(s: str) -> str:
    """Normalize text from an HTML cell: strip, replace NBSP, collapse whitespace."""
    if s is None:
        return ""
    out = s.replace("\xa0", " ").strip()
    # collapse multiple spaces/newlines
    out = re.sub(r"\s+", " ", out)
    return out

def make_uid(date_str: str, title: str, venue: str) -> str:
    """Deterministic external UID for an event based on date/title/venue."""
    base = f"{(date_str or '').strip()}|{(title or '').strip()}|{(venue or '').strip()}".lower()
    return hashlib.sha1(base.encode("utf-8")).hexdigest()

def parse_price_range(s: str):
    """
    Extract numeric price min/max from freeform price string.
    Returns (min, max) as floats or (None, None) if none found.
    """
    if not s:
        return None, None
    nums = [float(x.replace("$", "")) for x in _PRICE_RE.findall(s)]
    if not nums:
        return None, None
    return float(min(nums)), float(max(nums))

def parse_dt_fuzzy(s: str):
    """
    Try a fuzzy parse of an ambiguous datetime string. Returns a naive datetime
    (no timezone) or None on failure.
    """
    if not s:
        return None
    try:
        return dtp.parse(s, fuzzy=True)
    except Exception:
        return None

def _infer_year_from_month_day(month: int, day: int) -> int:
    """
    Choose a year for a month/day. If that date in the current year is > ~6 months
    in the past, pick next year (useful for "upcoming" event lists around year boundary).
    """
    today = date.today()
    candidate = date(today.year, month, day)
    if (candidate - today).days < -183:
        return today.year + 1
    return today.year

def parse_start_end_pacific(date_cell: str):
    """
    Robustly parse site date/time strings into (start_utc, end_utc).
    Examples of inputs handled:
      "Tue: Nov 4 (11pm-2am)"
      "Nov 7-Sun: Nov 9 (10pm-1am)"
      "Nov 7-9 (10pm)"
      "Sat: Nov 8 (10pm)"
      "Nov 4 (11pm)"
    Returns:
      (start_utc: datetime with tzinfo=UTC or None, end_utc: same or None)
    On parse failure returns (None, None) — the caller should handle missing values.
    """
    txt = clean_cell(date_cell or "")
    if not txt:
        return None, None

    # Remove a leading weekday like "Tue:" or "Sat:" if present
    if ":" in txt:
        maybe_prefix, rest = txt.split(":", 1)
        # if prefix is short alphabetic token (likely weekday), drop it
        if maybe_prefix.strip().isalpha() and len(maybe_prefix.strip()) <= 4:
            txt = rest.strip()

    # Find parenthetical time range if present
    timestr = None
    m = _TIME_RANGE_RE.search(txt)
    if m:
        timestr = m.group(1).strip()
        date_part = txt[:m.start()].strip()
    else:
        date_part = txt

    # Try to extract a sensible "Month Day" token (prefer first occurrence)
    md_match = _MONTH_DAY_RE.search(date_part)
    if md_match:
        date_token = md_match.group(1)
    else:
        # Fallback: split on dash/range and take the first token
        if "-" in date_part:
            date_token = date_part.split("-")[0].strip()
        else:
            date_token = date_part.strip()

    # Try to parse the extracted token into a month/day
    try:
        parsed = dtp.parse(date_token, fuzzy=True, default=datetime(2000, 1, 1))
        md = parsed.date()
    except Exception:
        # give up gracefully
        return None, None

    year = _infer_year_from_month_day(md.month, md.day)
    try:
        local_day = date(year, md.month, md.day)
    except Exception:
        return None, None

    # If no explicit times found, default start to 21:00 (9pm) local
    if not timestr:
        start_local = datetime.combine(local_day, time(21, 0), tzinfo=PACIFIC)
        end_local = None
    else:
        # Split times on dash-like separators (11pm-2am)
        parts = _SEP_RE.split(timestr)
        try:
            start_time_obj = dtp.parse(parts[0], fuzzy=True).time()
        except Exception:
            start_time_obj = time(21, 0)  # fallback default

        end_time_obj = None
        if len(parts) > 1 and parts[1].strip():
            try:
                end_time_obj = dtp.parse(parts[1], fuzzy=True).time()
            except Exception:
                end_time_obj = None

        start_local = datetime.combine(local_day, start_time_obj, tzinfo=PACIFIC)
        if end_time_obj:
            end_candidate = datetime.combine(local_day, end_time_obj, tzinfo=PACIFIC)
            # If end is same or before start, assume it wrapped to next day (11pm-2am)
            if end_candidate <= start_local:
                end_candidate = end_candidate + timedelta(days=1)
            end_local = end_candidate
        else:
            end_local = None

    # Convert to UTC for timestamptz storage (psycopg / Postgres expects tz-aware)
    try:
        start_utc = start_local.astimezone(timezone.utc) if start_local else None
        end_utc = end_local.astimezone(timezone.utc) if end_local else None
    except Exception:
        return None, None

    return start_utc, end_utc
