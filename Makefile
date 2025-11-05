.PHONY: init fmt test scrape
init:
\tpython -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
fmt:
\tpython -m pip install ruff black && ruff check --fix . && black .
test:
\tpytest -q
scrape:
\tpython -m src.runners.run_weekly_events
