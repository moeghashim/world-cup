create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  workos_user_id text not null unique,
  email text not null,
  handle text,
  country_at_signup text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_unique
  on users (lower(email));

create unique index if not exists users_handle_lower_unique
  on users (lower(handle))
  where handle is not null;

create table if not exists brackets (
  user_id uuid primary key references users(id) on delete cascade,
  data jsonb not null,
  locked boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists group_picks (
  user_id uuid not null references users(id) on delete cascade,
  match_id text not null,
  pick text not null,
  locked_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create table if not exists predictions (
  user_id uuid not null references users(id) on delete cascade,
  match_id text not null,
  home_score integer not null check (home_score >= 0 and home_score <= 99),
  away_score integer not null check (away_score >= 0 and away_score <= 99),
  locked_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create index if not exists group_picks_user_updated_idx
  on group_picks (user_id, updated_at desc);

create index if not exists predictions_user_updated_idx
  on predictions (user_id, updated_at desc);
