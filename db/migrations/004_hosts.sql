create table if not exists hosts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  join_code text not null unique,
  name text not null,
  owner_user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists host_members (
  host_id uuid not null references hosts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (host_id, user_id)
);

create index if not exists hosts_owner_created_idx
  on hosts (owner_user_id, created_at desc);

create index if not exists host_members_user_joined_idx
  on host_members (user_id, joined_at desc);
