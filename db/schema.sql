-- Homepage prediction entry persistence schema.
-- Intended for the Projects.dev Neon resource `primary-db`.
-- Runtime connection string env var: PRIMARY_DB_CONNECTION_STRING.

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  rules_accepted_at timestamptz NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsor_campaigns (
  id text PRIMARY KEY,
  name text NOT NULL,
  display_name text NOT NULL,
  tier text NOT NULL,
  match_number integer NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prize_bundles (
  id text PRIMARY KEY,
  match_number integer NOT NULL,
  title text NOT NULL,
  winner_slots integer NOT NULL,
  joined_count_seed integer NOT NULL,
  bonus_prize_label text NOT NULL,
  sponsor_campaign_id text REFERENCES sponsor_campaigns(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prize_items (
  id uuid PRIMARY KEY,
  prize_bundle_id text NOT NULL REFERENCES prize_bundles(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text NOT NULL,
  country text NOT NULL,
  type text NOT NULL,
  display_order integer NOT NULL
);

CREATE TABLE IF NOT EXISTS prediction_entries (
  id uuid PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES participants(id),
  match_number integer NOT NULL,
  match_id text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_score integer NOT NULL,
  away_score integer NOT NULL,
  predicted_outcome text NOT NULL,
  supporter_team_key text NOT NULL,
  prize_bundle_id text REFERENCES prize_bundles(id),
  sponsor_campaign_id text REFERENCES sponsor_campaigns(id),
  receipt_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'locked',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prediction_entries_match_number_idx
  ON prediction_entries (match_number);

CREATE INDEX IF NOT EXISTS prediction_entries_participant_id_idx
  ON prediction_entries (participant_id);
