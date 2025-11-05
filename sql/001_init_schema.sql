-- schema placeholder
create table if not exists venues(
  venue_id bigserial primary key,
  name text not null unique,
  city text, address text, website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promoters(
  promoter_id bigserial primary key,
  name text not null unique,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists events(
  event_id bigserial primary key,
  external_uid text not null unique,
  title text not null,
  start_ts timestamptz, end_ts timestamptz,
  venue_id bigint references venues(venue_id),
  price_min numeric, price_max numeric,
  age_restriction text,
  tags text[],
  source_url text not null,
  scraped_at timestamptz default now()
);

create table if not exists event_promoters(
  event_id bigint references events(event_id) on delete cascade,
  promoter_id bigint references promoters(promoter_id),
  primary key(event_id, promoter_id)
);

create table if not exists event_links(
  event_id bigint references events(event_id) on delete cascade,
  kind text, url text,
  primary key(event_id, url)
);

-- optional: lightweight run log
create table if not exists scrape_runs(
  run_id bigserial primary key,
  run_type text not null,          -- 'weekly_events' | 'seed_venues' | 'seed_promoters'
  started_at timestamptz default now(),
  ended_at timestamptz,
  rows_parsed int,
  rows_upserted int,
  warnings jsonb
);
