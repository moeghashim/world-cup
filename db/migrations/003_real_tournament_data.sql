create table if not exists tournament_groups (
  code text primary key,
  name text not null unique,
  sort_order integer not null unique,
  source text not null default 'openfootball/worldcup.json',
  updated_at timestamptz not null default now()
);

create table if not exists teams (
  code text primary key,
  name text not null unique,
  slug text not null unique,
  group_code text not null references tournament_groups(code) on delete restrict,
  group_name text not null,
  group_seed integer not null check (group_seed >= 1 and group_seed <= 4),
  colors jsonb not null default '{}'::jsonb,
  localized_names jsonb not null default '{}'::jsonb,
  source text not null default 'openfootball/worldcup.json',
  updated_at timestamptz not null default now(),
  unique (group_code, group_seed)
);

create table if not exists matches (
  id text primary key,
  match_number integer not null unique,
  stage text not null,
  round text not null,
  group_code text references tournament_groups(code) on delete restrict,
  group_name text,
  home_team_code text references teams(code) on delete restrict,
  away_team_code text references teams(code) on delete restrict,
  home_team_name text not null,
  away_team_name text not null,
  home_placeholder text,
  away_placeholder text,
  kickoff_at timestamptz not null,
  kickoff_local_date date not null,
  kickoff_local_time text not null,
  kickoff_timezone text not null,
  venue text not null,
  status text not null default 'scheduled',
  source jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (
    (stage = 'group' and group_code is not null and group_name is not null)
    or (stage <> 'group')
  )
);

create index if not exists teams_group_seed_idx
  on teams (group_code, group_seed);

create index if not exists matches_stage_kickoff_idx
  on matches (stage, kickoff_at);

create index if not exists matches_group_kickoff_idx
  on matches (group_code, kickoff_at)
  where group_code is not null;

create index if not exists matches_home_team_idx
  on matches (home_team_code)
  where home_team_code is not null;

create index if not exists matches_away_team_idx
  on matches (away_team_code)
  where away_team_code is not null;
