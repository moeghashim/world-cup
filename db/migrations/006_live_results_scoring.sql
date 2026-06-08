create table if not exists results (
  match_id text primary key references matches(id) on delete cascade,
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  status text not null default 'scheduled',
  finished_at timestamptz,
  source text not null,
  updated_at timestamptz not null default now()
);

create index if not exists results_status_updated_idx
  on results (status, updated_at desc);

create table if not exists standings (
  user_id uuid primary key references users(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  breakdown jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists standings_points_idx
  on standings (points desc, updated_at asc);
