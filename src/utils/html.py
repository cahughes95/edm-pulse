import time, requests
from ..config import settings
H = {"User-Agent": settings.user_agent}

def get(url, retries=2, timeout=30):
    for i in range(retries+1):
        r = requests.get(url, headers=H, timeout=timeout)
        if r.ok: return r.text
        time.sleep(1.5)
    r.raise_for_status()
