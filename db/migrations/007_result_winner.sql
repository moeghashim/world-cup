alter table results
  add column if not exists winner text
  check (winner is null or winner in ('home', 'away'));
