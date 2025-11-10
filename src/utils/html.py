import time, requests, random

DEFAULT_UA = "EDM-Pulse-Scraper/0.1 (+contact: your@email)"
HEADERS = {"User-Agent": DEFAULT_UA}

def get(url, headers=None, retries=2, timeout=30, backoff=1.5):
    h = dict(HEADERS)
    if headers: h.update(headers)
    last_exc = None
    for i in range(retries + 1):
        try:
            r = requests.get(url, headers=h, timeout=timeout)
            if r.ok:
                return r.text
        except Exception as e:
            last_exc = e
        time.sleep(backoff ** (i + 1) + random.random()/3)
    if last_exc:
        raise last_exc
    raise RuntimeError(f"Failed to GET {url}")
