-- RacePace schema
-- Run this in the Supabase SQL editor

-- Charities
create table if not exists charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  stripe_account_id text,
  created_at timestamptz default now()
);

-- Runners
create table if not exists runners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  race_name text not null,
  race_date date not null,
  goal_time text not null,        -- HH:MM:SS
  goal_seconds int not null,
  funding_goal int not null,      -- euros
  charity_id uuid references charities(id),
  stripe_account_id text,
  strava_link text,
  slug text not null unique,
  status text not null default 'onboarding'
    check (status in ('onboarding', 'active', 'complete')),
  is_founding boolean not null default true,
  created_at timestamptz default now()
);

-- Pledges
create table if not exists pledges (
  id uuid primary key default gen_random_uuid(),
  runner_id uuid not null references runners(id) on delete cascade,
  donor_name text not null,
  donor_email text not null,
  amount int not null,            -- euros
  message text,
  stripe_payment_intent_id text not null unique,
  status text not null default 'held'
    check (status in ('held', 'released_to_runner', 'donated_to_charity', 'refunded')),
  created_at timestamptz default now()
);

-- Results
create table if not exists results (
  runner_id uuid primary key references runners(id) on delete cascade,
  finish_time text,               -- HH:MM:SS, null = DNF/DNS
  status text not null
    check (status in ('finished', 'dnf', 'dns')),
  verified_by text not null,
  verified_at timestamptz default now()
);

-- Row Level Security
alter table charities enable row level security;
alter table runners enable row level security;
alter table pledges enable row level security;
alter table results enable row level security;

-- Public read access for runner campaign pages
create policy "runners: public read active"
  on runners for select using (status = 'active' or status = 'complete');

create policy "charities: public read"
  on charities for select using (true);

create policy "pledges: public read by runner"
  on pledges for select using (true);

create policy "results: public read"
  on results for select using (true);

-- Service role has full access (bypasses RLS via service key)

-- Seed a default charity
insert into charities (name, description) values
  ('Nederlandse Hartstichting', 'The Dutch Heart Foundation funds research and education about cardiovascular disease.')
on conflict do nothing;
