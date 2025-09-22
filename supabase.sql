create table if not exists public.events (
  uid text primary key,
  title text not null,
  start timestamptz not null,
  end_time timestamptz,
  venue text not null,
  address text,
  city text default 'Los Angeles',
  genres text[],
  price text,
  age text,
  image text,
  source text,
  tickets text,
  url text,
  status text default 'active',
  updated_at timestamptz default now()
);
create index if not exists events_city_start_idx on public.events (city, start);
create index if not exists events_status_idx on public.events (status);
