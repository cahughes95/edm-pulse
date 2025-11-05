-- indexes placeholder
create index if not exists idx_events_start_ts on events(start_ts);
create index if not exists idx_events_venue on events(venue_id);
create index if not exists idx_events_tags on events using gin(tags);
