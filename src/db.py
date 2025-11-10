import psycopg
from contextlib import contextmanager
from .config import settings

@contextmanager
def conn():
    with psycopg.connect(settings.database_url) as c:
        yield c

def upsert_venue(c, name, city=None, address=None, website=None):
    with c.cursor() as cur:
        cur.execute("""
          insert into venues(name, city, address, website)
          values (%s,%s,%s,%s)
          on conflict(name) do update
            set city=coalesce(excluded.city, venues.city),
                address=coalesce(excluded.address, venues.address),
                website=coalesce(excluded.website, venues.website),
                updated_at=now()
          returning venue_id
        """, (name, city, address, website))
        return cur.fetchone()[0]
