-- HWStudio database schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (uses "if not exists" / "on conflict do nothing").

-- ---------- Tables ----------

create table if not exists galleries (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text unique not null,
  event_date date,
  description text default '',
  cover_photo_id text,
  is_listed boolean not null default true,
  display_order int not null default 1,
  passcode text default '',
  requires_approved_email boolean not null default false,
  expiration_date date,
  drive_folder_id text default '',
  full_download_url text default '',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists gallery_photos (
  id text primary key default gen_random_uuid()::text,
  gallery_id text not null references galleries(id) on delete cascade,
  storage_path text,               -- path in the "photos" storage bucket (uploaded)
  drive_file_id text default '',
  preview_url text not null,
  download_url text not null,
  alt text default '',
  display_order int not null default 1,
  is_visible boolean not null default true,
  is_portfolio_eligible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists approved_emails (
  id text primary key default gen_random_uuid()::text,
  gallery_id text not null references galleries(id) on delete cascade,
  email text not null,
  label text default ''
);

create table if not exists portfolio_categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text default '',
  display_order int not null default 1,
  is_visible boolean not null default true,
  drive_folder_id text default ''    -- photos for this category live in this Drive folder
);

create table if not exists portfolio_photos (
  id text primary key default gen_random_uuid()::text,
  source_gallery_photo_id text,
  storage_path text,
  preview_url text not null,
  alt text default '',
  category_ids text[] not null default '{}',
  display_order int not null default 1,
  is_featured boolean not null default false
);

create table if not exists home_photos (
  id text primary key default gen_random_uuid()::text,
  storage_path text,
  preview_url text not null,
  alt text default '',
  display_order int not null default 1
);

-- Single-row settings tables (id is always 'main').
create table if not exists home_settings (
  id text primary key default 'main',
  eyebrow text default 'HWStudio',
  heading text default 'A curated gallery for every milestone.',
  lede text default 'Clean editorial photography for graduations, portraits, groups, events, and headshots.',
  primary_cta_label text default 'Explore Portfolio',
  primary_cta_href text default '/portfolio',
  secondary_cta_label text default 'Access Your Photos',
  secondary_cta_href text default '/client-access',
  drive_folder_id text default ''    -- photos for the homepage mosaic live in this Drive folder
);

create table if not exists portfolio_settings (
  id text primary key default 'main',
  eyebrow text default 'Portfolio',
  heading text default 'Selected work across portraits, events, and graduation stories.'
);

create table if not exists contact_inquiries (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  message text default '',
  photography_type text default '',
  preferred_date text default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- Safety for re-runs / older versions: ensure per-collection Drive folder columns exist.
alter table portfolio_categories add column if not exists drive_folder_id text default '';
alter table home_settings add column if not exists drive_folder_id text default '';

-- ---------- Seed default content ----------

insert into home_settings (id) values ('main') on conflict (id) do nothing;
insert into portfolio_settings (id) values ('main') on conflict (id) do nothing;

insert into portfolio_categories (id, name, slug, description, display_order, is_visible) values
  ('cat-graduation', 'Graduation', 'graduation', 'Milestone sessions and campus stories.', 1, true),
  ('cat-events',     'Events',     'events',     'Gatherings, ceremonies, and celebrations.', 2, true),
  ('cat-headshots',  'Headshots',  'headshots',  'Clean portraits for professional use.', 3, true),
  ('cat-portraits',  'Portraits',  'portraits',  'Personal and editorial portrait work.', 4, true),
  ('cat-groups',     'Groups',     'groups',     'Friends, teams, and family groupings.', 5, true)
on conflict (id) do nothing;

-- ---------- Row Level Security ----------
-- Public visitors (anon key) can READ published content and SUBMIT inquiries.
-- Only signed-in admins can write everything else.

alter table galleries            enable row level security;
alter table gallery_photos       enable row level security;
alter table approved_emails      enable row level security;
alter table portfolio_categories enable row level security;
alter table portfolio_photos     enable row level security;
alter table home_photos          enable row level security;
alter table home_settings        enable row level security;
alter table portfolio_settings   enable row level security;
alter table contact_inquiries    enable row level security;

-- Public read for site content
create policy "public read galleries"   on galleries            for select using (true);
create policy "public read photos"       on gallery_photos       for select using (true);
create policy "public read cats"         on portfolio_categories for select using (true);
create policy "public read pfphotos"     on portfolio_photos     for select using (true);
create policy "public read homephotos"   on home_photos          for select using (true);
create policy "public read home"         on home_settings        for select using (true);
create policy "public read pfsettings"   on portfolio_settings   for select using (true);

-- Anyone may submit an inquiry; only admins may read them
create policy "anyone submit inquiry"    on contact_inquiries    for insert with check (true);
create policy "admin read inquiries"     on contact_inquiries    for select using (auth.role() = 'authenticated');

-- Approved emails: admin-only (access checks move server-side later)
create policy "admin read emails"        on approved_emails      for select using (auth.role() = 'authenticated');

-- Admin (authenticated) full write access on everything
create policy "admin write galleries"    on galleries            for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write photos"       on gallery_photos       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write emails"       on approved_emails      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write cats"         on portfolio_categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write pfphotos"     on portfolio_photos     for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write homephotos"   on home_photos          for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write home"         on home_settings        for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write pfsettings"   on portfolio_settings   for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin manage inquiries"   on contact_inquiries    for update using (auth.role() = 'authenticated');

-- Note: photos are stored in Google Drive (Option A), so no Supabase Storage
-- bucket is needed. The site reads Drive folders server-side via the service
-- account and proxies images through /api/drive-image.

-- ---------- Gallery security ----------
-- The passcode must never reach the browser: hide the galleries table from the
-- public, expose a passcode-free view for listing, and validate access in a DB
-- function that reads the passcode internally.

drop policy if exists "public read galleries" on galleries;
drop policy if exists "admin read galleries" on galleries;
create policy "admin read galleries" on galleries for select using (auth.role() = 'authenticated');

drop view if exists public_galleries;
create view public_galleries as
  select id, title, slug, event_date, description, display_order, requires_approved_email
  from galleries
  where is_listed = true and status = 'active';
grant select on public_galleries to anon, authenticated;

create or replace function verify_gallery_access(p_slug text, p_passcode text, p_email text)
returns table (id text, title text, description text, event_date date, drive_folder_id text, full_download_url text)
language plpgsql security definer set search_path = public as $$
declare g public.galleries%rowtype;
begin
  select * into g from public.galleries where slug = p_slug;
  if not found then return; end if;
  if g.status <> 'active' then return; end if;
  if g.expiration_date is not null and g.expiration_date < current_date then return; end if;
  if btrim(coalesce(g.passcode, '')) <> btrim(coalesce(p_passcode, '')) then return; end if;
  if g.requires_approved_email then
    if not exists (
      select 1 from public.approved_emails a
      where a.gallery_id = g.id and lower(a.email) = lower(btrim(coalesce(p_email, '')))
    ) then
      return;
    end if;
  end if;
  return query select g.id, g.title, g.description, g.event_date, g.drive_folder_id, g.full_download_url;
end $$;
grant execute on function verify_gallery_access(text, text, text) to anon, authenticated;
