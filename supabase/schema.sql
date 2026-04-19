create table if not exists public.site_config (
  key text primary key,
  value text not null,
  category text not null
);

create table if not exists public.visitor_logs (
  id bigint generated always as identity primary key,
  country text,
  city text,
  region text,
  ip_hashed text not null,
  tool_used text,
  files_branded_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.public_reports (
  id text primary key,
  report_type text not null,
  inputs jsonb not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  city text,
  file_type text,
  tool_slug text,
  created_at timestamptz not null default now()
);

create index if not exists visitor_logs_created_at_idx on public.visitor_logs (created_at desc);
create index if not exists visitor_logs_country_idx on public.visitor_logs (country);
create index if not exists public_reports_created_at_idx on public.public_reports (created_at desc);
create index if not exists activity_log_created_at_idx on public.activity_log (created_at desc);

insert into public.site_config (key, value, category)
values
  ('trustpilot_url', 'https://www.trustpilot.com/', 'GROWTH'),
  ('maintenance_mode', 'false', 'SEO'),
  ('global_meta_title', 'Logic Vault | Every Financial & PDF Tool, 100% Free & Secure', 'SEO'),
  ('global_meta_description', 'Process Account Statements, Merge PDFs, and convert financial data locally. No data leaves your computer. Built for the Global Citizen.', 'SEO'),
  ('ad_slot_leaderboard_enabled', 'true', 'ADS'),
  ('ad_slot_engagement_enabled', 'true', 'ADS'),
  ('ad_slot_action_enabled', 'true', 'ADS'),
  ('ad_slot_grid_feed_enabled', 'true', 'ADS'),
  ('ad_slot_sticky_footer_enabled', 'true', 'ADS')
on conflict (key) do nothing;
