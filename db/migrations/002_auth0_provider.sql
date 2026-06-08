alter table users
  add column if not exists auth0_user_id text;

alter table users
  alter column workos_user_id drop not null;

create unique index if not exists users_auth0_user_id_unique
  on users (auth0_user_id);
