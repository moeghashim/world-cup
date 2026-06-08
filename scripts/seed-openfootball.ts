import { neon } from '@neondatabase/serverless'
import {
  normalizeOpenfootballData,
  type NormalizedTournament,
} from './tournament-normalize.js'

const args = new Set(process.argv.slice(2))
const verifyOnly = args.has('--verify')
const dryRun = args.has('--dry-run') || verifyOnly

function printSummary(tournament: NormalizedTournament): void {
  const firstMatch = tournament.matches[0]
  console.log(
    JSON.stringify(
      {
        name: tournament.name,
        source: tournament.source,
        counts: tournament.counts,
        firstMatch: {
          id: firstMatch.id,
          kickoffAt: firstMatch.kickoffAt,
          fixture: `${firstMatch.homeTeamName} vs ${firstMatch.awayTeamName}`,
          venue: firstMatch.venue,
        },
      },
      null,
      2,
    ),
  )
}

async function upsertTournament(tournament: NormalizedTournament): Promise<void> {
  const connectionString = process.env.PRIMARY_DB_CONNECTION_STRING
  if (!connectionString) {
    throw new Error(
      'PRIMARY_DB_CONNECTION_STRING is required unless --verify or --dry-run is used.',
    )
  }

  const sql = neon(connectionString)

  for (const group of tournament.groups) {
    await sql.query(
      `
        insert into tournament_groups (code, name, sort_order, source, updated_at)
        values ($1, $2, $3, $4, now())
        on conflict (code) do update
          set name = excluded.name,
              sort_order = excluded.sort_order,
              source = excluded.source,
              updated_at = now()
      `,
      [group.code, group.name, group.sortOrder, tournament.source.name],
    )
  }

  for (const team of tournament.teams) {
    await sql.query(
      `
        insert into teams (
          code,
          name,
          slug,
          group_code,
          group_name,
          group_seed,
          colors,
          localized_names,
          source,
          updated_at
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, now())
        on conflict (code) do update
          set name = excluded.name,
              slug = excluded.slug,
              group_code = excluded.group_code,
              group_name = excluded.group_name,
              group_seed = excluded.group_seed,
              colors = excluded.colors,
              localized_names = excluded.localized_names,
              source = excluded.source,
              updated_at = now()
      `,
      [
        team.code,
        team.name,
        team.slug,
        team.groupCode,
        team.groupName,
        team.groupSeed,
        JSON.stringify(team.colors),
        JSON.stringify(team.localizedNames),
        tournament.source.name,
      ],
    )
  }

  for (const match of tournament.matches) {
    await sql.query(
      `
        insert into matches (
          id,
          match_number,
          stage,
          round,
          group_code,
          group_name,
          home_team_code,
          away_team_code,
          home_team_name,
          away_team_name,
          home_placeholder,
          away_placeholder,
          kickoff_at,
          kickoff_local_date,
          kickoff_local_time,
          kickoff_timezone,
          venue,
          status,
          source,
          updated_at
        )
        values (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13::timestamptz,
          $14::date,
          $15,
          $16,
          $17,
          $18,
          $19::jsonb,
          now()
        )
        on conflict (id) do update
          set match_number = excluded.match_number,
              stage = excluded.stage,
              round = excluded.round,
              group_code = excluded.group_code,
              group_name = excluded.group_name,
              home_team_code = excluded.home_team_code,
              away_team_code = excluded.away_team_code,
              home_team_name = excluded.home_team_name,
              away_team_name = excluded.away_team_name,
              home_placeholder = excluded.home_placeholder,
              away_placeholder = excluded.away_placeholder,
              kickoff_at = excluded.kickoff_at,
              kickoff_local_date = excluded.kickoff_local_date,
              kickoff_local_time = excluded.kickoff_local_time,
              kickoff_timezone = excluded.kickoff_timezone,
              venue = excluded.venue,
              status = excluded.status,
              source = excluded.source,
              updated_at = now()
      `,
      [
        match.id,
        match.matchNumber,
        match.stage,
        match.round,
        match.groupCode,
        match.groupName,
        match.homeTeamCode,
        match.awayTeamCode,
        match.homeTeamName,
        match.awayTeamName,
        match.homePlaceholder,
        match.awayPlaceholder,
        match.kickoffAt,
        match.kickoffLocalDate,
        match.kickoffLocalTime,
        match.kickoffTimezone,
        match.venue,
        match.status,
        JSON.stringify(match.source),
      ],
    )
  }
}

const tournament = await normalizeOpenfootballData()
printSummary(tournament)

if (dryRun) {
  console.log(verifyOnly ? 'Verified openfootball snapshot.' : 'Dry run complete.')
} else {
  await upsertTournament(tournament)
  console.log('Seeded tournament groups, teams, and matches into Neon.')
}
