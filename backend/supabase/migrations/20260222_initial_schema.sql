-- 20260222_initial_schema.sql
create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug <> ''),
  title text not null,
  color text not null default '#30405f',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  legacy_numeric_id integer,
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null,
  author text not null,
  year text,
  technique text,
  description text,
  theme_id text,
  section_id text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artwork_media (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  kind text not null check (kind in ('original', 'web', 'thumb')),
  storage_path text not null,
  width integer,
  height integer,
  bytes integer,
  mime_type text,
  created_at timestamptz not null default now(),
  unique (artwork_id, kind)
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  source text,
  device_class text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.event_log (
  id bigserial primary key,
  session_id uuid references public.visitor_sessions(id) on delete set null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  event_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_rooms_published_order on public.rooms (is_published, sort_order);
create index if not exists idx_artworks_room_order on public.artworks (room_id, sort_order);
create index if not exists idx_artworks_published on public.artworks (is_published);
create unique index if not exists uq_artworks_legacy_numeric_id on public.artworks (legacy_numeric_id);
create index if not exists idx_event_log_event_at on public.event_log (event_at);
create index if not exists idx_event_log_name on public.event_log (event_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_rooms_updated_at on public.rooms;
create trigger trg_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_artworks_updated_at on public.artworks;
create trigger trg_artworks_updated_at
before update on public.artworks
for each row execute function public.set_updated_at();

alter table public.rooms enable row level security;
alter table public.artworks enable row level security;
alter table public.artwork_media enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.visitor_sessions enable row level security;
alter table public.event_log enable row level security;

-- Public read: published catalog only
drop policy if exists rooms_public_read on public.rooms;
create policy rooms_public_read
on public.rooms
for select
using (is_published = true);

drop policy if exists artworks_public_read on public.artworks;
create policy artworks_public_read
on public.artworks
for select
using (is_published = true);

drop policy if exists artwork_media_public_read on public.artwork_media;
create policy artwork_media_public_read
on public.artwork_media
for select
using (
  kind in ('web', 'thumb') and exists (
    select 1 from public.artworks a
    where a.id = artwork_media.artwork_id and a.is_published = true
  )
);

-- admin_profiles: cada usuario puede leer su propio perfil
drop policy if exists admin_profiles_self_read on public.admin_profiles;
create policy admin_profiles_self_read
on public.admin_profiles
for select
using (auth.uid() = user_id);

-- Events/sessions: allow anonymous inserts for frontend tracking
drop policy if exists visitor_sessions_insert_public on public.visitor_sessions;
create policy visitor_sessions_insert_public
on public.visitor_sessions
for insert
with check (true);

drop policy if exists event_log_insert_public on public.event_log;
create policy event_log_insert_public
on public.event_log
for insert
with check (true);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('artworks-original', 'artworks-original', false, 20971520, array['image/jpeg', 'image/png', 'image/webp']),
  ('artworks-web', 'artworks-web', false, 10485760, array['image/webp', 'image/jpeg']),
  ('artworks-thumb', 'artworks-thumb', false, 5242880, array['image/webp', 'image/jpeg'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists storage_admin_write on storage.objects;
create policy storage_admin_write
on storage.objects
for all to authenticated
using (
  bucket_id in ('artworks-original', 'artworks-web', 'artworks-thumb') and
  exists (
    select 1
    from public.admin_profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  bucket_id in ('artworks-original', 'artworks-web', 'artworks-thumb') and
  exists (
    select 1
    from public.admin_profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists storage_published_derivatives_read on storage.objects;
create policy storage_published_derivatives_read
on storage.objects
for select to anon, authenticated
using (
  bucket_id in ('artworks-web', 'artworks-thumb') and
  exists (
    select 1
    from public.artwork_media am
    join public.artworks a on a.id = am.artwork_id
    where am.storage_path = storage.objects.name
      and am.kind in ('web', 'thumb')
      and a.is_published = true
      and (
        (storage.objects.bucket_id = 'artworks-web' and am.kind = 'web') or
        (storage.objects.bucket_id = 'artworks-thumb' and am.kind = 'thumb')
      )
  )
);
-- Advanced analytics materialized views
create materialized view if not exists public.daily_metrics_mv as
select
  date_trunc('day', e.event_at)::date as day,
  e.event_name,
  count(*) as events,
  count(distinct e.session_id) as unique_sessions
from public.event_log e
group by 1, 2;

create unique index if not exists idx_daily_metrics_mv_unique
on public.daily_metrics_mv (day, event_name);

create materialized view if not exists public.room_funnel_mv as
select
  date_trunc('day', e.event_at)::date as day,
  coalesce(e.payload->>'roomId', 'unknown') as room_id,
  count(*) filter (where e.event_name = 'room_jump') as room_jumps,
  count(distinct e.session_id) filter (where e.event_name = 'room_jump') as unique_room_jump_sessions
from public.event_log e
group by 1, 2;

create unique index if not exists idx_room_funnel_mv_unique
on public.room_funnel_mv (day, room_id);

create materialized view if not exists public.artwork_retention_mv as
with session_days as (
  select
    id as session_id,
    date_trunc('day', started_at)::date as cohort_day
  from public.visitor_sessions
),
focus_events as (
  select
    e.session_id,
    coalesce(e.payload->>'artworkId', 'unknown') as artwork_id,
    date_trunc('day', e.event_at)::date as activity_day
  from public.event_log e
  where e.event_name = 'artwork_focus'
)
select
  s.cohort_day,
  f.activity_day,
  f.artwork_id,
  count(distinct f.session_id) as active_sessions
from session_days s
join focus_events f on f.session_id = s.session_id
group by 1, 2, 3;

create unique index if not exists idx_artwork_retention_mv_unique
on public.artwork_retention_mv (cohort_day, activity_day, artwork_id);

create or replace function public.refresh_materialized_view(view_name text)
returns void
language plpgsql
security definer
as $$
begin
  if view_name = 'daily_metrics_mv' then
    refresh materialized view public.daily_metrics_mv;
  elsif view_name = 'room_funnel_mv' then
    refresh materialized view public.room_funnel_mv;
  elsif view_name = 'artwork_retention_mv' then
    refresh materialized view public.artwork_retention_mv;
  else
    raise exception 'Unsupported materialized view: %', view_name;
  end if;
end;
$$;

grant execute on function public.refresh_materialized_view(text) to authenticated;

