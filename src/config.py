import os
from dataclasses import dataclass

@dataclass
class Settings:
    database_url: str = os.environ["DATABASE_URL"]
    la_url: str = os.getenv("LA_URL", "https://19hz.info/eventlisting_LosAngeles.php")
    user_agent: str = os.getenv("USER_AGENT", "LA-EDM-Scraper/0.1")
    tz: str = os.getenv("TZ", "America/Los_Angeles")

settings = Settings()
