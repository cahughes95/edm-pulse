import hashlib, re
from datetime import datetime
from dateutil import parser as dtp

def make_uid(date_str, title, venue):
    base = f"{date_str.strip()}|{title.strip()}|{venue.strip()}".lower()
    return hashlib.sha1(base.encode()).hexdigest()

def parse_price_range(s):
    if not s: return (None, None)
    nums = [float(x.replace("$","")) for x in re.findall(r"\$?\d+(?:\.\d+)?", s)]
    if not nums: return (None, None)
    return (min(nums), max(nums))

def parse_datetime(maybe_text):
    try:
        return dtp.parse(maybe_text, fuzzy=True)
    except Exception:
        return None
