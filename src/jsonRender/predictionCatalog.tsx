/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties, ReactNode } from 'react'
import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { defineRegistry, useStateStore } from '@json-render/react'
import { z } from 'zod'
import {
  Award,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock,
  Dice5,
  ExternalLink,
  Gift,
  MapPin,
  PackageCheck,
  Palette,
  RefreshCw,
  Send,
  Shirt,
  Sparkles,
  Trophy,
} from 'lucide-react'
import {
  communityEntries,
  getTeam,
  matches,
  providerRecommendations,
  shirtConcepts,
  sponsorRewards,
  type CommunityEntry,
  type Match,
  type TeamKey,
} from '../data/worldCup'
import {
  formatFixtureDate,
  formatTimeET,
  getTournamentTeamCode,
  getTournamentTeamSchedule,
  supporterTeamScheduleNames,
  TOURNAMENT_SOURCE_SNAPSHOT,
  worldCupFixtures,
  worldCupGroups,
  worldCupTeams,
  type TournamentFixture,
} from '../data/worldCupSchedule'

export type WinnerPick = TeamKey | 'draw'

export type Prediction = {
  winner?: WinnerPick
  homeScore: number
  awayScore: number
  locked: boolean
}

export type DrawStatus =
  | 'open'
  | 'locked'
  | 'result_pending'
  | 'eligibility_check'
  | 'draw_ready'
  | 'drawing'
  | 'winners_selected'
  | 'claiming'
  | 'fulfillment'
  | 'review_prompted'
  | 'closed'

export type EntryEligibilityStatus = 'pending' | 'qualified' | 'not_qualified'

export type DrawEntry = CommunityEntry & {
  receiptHash: string
  lockedAt: string
  rulesVersion: string
  isCurrentUser?: boolean
  eligibilityStatus: EntryEligibilityStatus
}

export type DrawWinner = DrawEntry & {
  exactScore: boolean
  prize: string
  fulfillmentStatus: 'Awaiting address' | 'POD queued' | 'Sponsor kit queued'
}

export type ParticipantOutcome = {
  tone: 'pending' | 'qualified' | 'winner' | 'alternate' | 'not_selected' | 'not_qualified'
  title: string
  detail: string
}

export type DrawAudit = {
  publicSeed: string
  secretCommitment: string
  revealSeed: string
  algorithm: string
  auditHash: string
  drawnAt: string
  eligibleEntryIds: string[]
  alternateEntryIds: string[]
}

export type DrawResult = {
  matchId: string
  status: DrawStatus
  resultLabel: string
  entryCount: number
  eligibleCount: number
  winners: DrawWinner[]
  alternates: DrawEntry[]
  participantOutcome: ParticipantOutcome
  currentUserEntry?: DrawEntry
  audit: DrawAudit
  reviewPrompted: boolean
}

export type PredictionState = {
  selectedTeamKey: TeamKey
  predictions: Record<string, Prediction>
  drawResults: Record<string, DrawResult>
  reviewPrompts: Record<string, boolean>
  fulfillmentQueue: string[]
}

const teamKeySchema = z.enum([
  'brazil',
  'argentina',
  'usa',
  'france',
  'england',
  'spain',
  'morocco',
  'japan',
])

const winnerSchema = z.union([teamKeySchema, z.literal('draw')])

export const defaultPrediction: Prediction = {
  homeScore: 2,
  awayScore: 1,
  locked: false,
}

const DEMO_RULES_VERSION = 'rules-v0-demo'
const DRAW_ALGORITHM =
  'Rank eligible receipt hashes by public seed plus reveal seed, then select winner slots and preserve alternates.'
const ALTERNATE_COUNT = 3

export const initialPredictionState: PredictionState = {
  selectedTeamKey: 'brazil',
  predictions: {},
  drawResults: {},
  reviewPrompts: {},
  fulfillmentQueue: [],
}

export function getPickLabel(pick?: WinnerPick) {
  if (!pick) {
    return 'Awaiting pick'
  }

  if (pick === 'draw') {
    return 'Draw'
  }

  return getTeam(pick).name
}

function getPrediction(state: PredictionState, matchId: string): Prediction {
  return {
    ...defaultPrediction,
    ...state.predictions[matchId],
  }
}

function getMatch(matchId: string) {
  return matches.find((match) => match.id === matchId) ?? matches[0]
}

function hashString(input: string) {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase()
}

function createReceiptHash(
  match: Match,
  prediction: Prediction,
  supporter: TeamKey,
) {
  const hash = hashString(
    [
      match.id,
      supporter,
      prediction.winner ?? 'none',
      prediction.homeScore,
      prediction.awayScore,
      DEMO_RULES_VERSION,
    ].join(':'),
  ).slice(0, 6)

  return `${getTeam(supporter).code}-${hash}`
}

function createCommunityReceipt(entry: CommunityEntry): DrawEntry {
  return {
    ...entry,
    receiptHash: hashString(
      [
        entry.id,
        entry.matchId,
        entry.winner,
        entry.homeScore,
        entry.awayScore,
        DEMO_RULES_VERSION,
      ].join(':'),
    ),
    lockedAt: 'Seeded community ticket',
    rulesVersion: DEMO_RULES_VERSION,
    eligibilityStatus: 'pending',
  }
}

function createCurrentUserEntry(
  match: Match,
  prediction: Prediction,
  supporter: TeamKey,
): DrawEntry | undefined {
  if (!prediction.locked || !prediction.winner) {
    return undefined
  }

  return {
    id: `you-${match.id}`,
    matchId: match.id,
    name: 'Your ticket',
    supporter,
    winner: prediction.winner,
    homeScore: prediction.homeScore,
    awayScore: prediction.awayScore,
    receiptHash: createReceiptHash(match, prediction, supporter),
    lockedAt: 'Locked before result close',
    rulesVersion: DEMO_RULES_VERSION,
    isCurrentUser: true,
    eligibilityStatus: 'pending',
  }
}

function entryQualifies(entry: DrawEntry, match: Match) {
  return entry.winner === match.demoResult.winner
}

function resolveEligibility(entry: DrawEntry, match: Match): DrawEntry {
  return {
    ...entry,
    eligibilityStatus: entryQualifies(entry, match) ? 'qualified' : 'not_qualified',
  }
}

function getDrawEntries(match: Match, state: PredictionState): DrawEntry[] {
  const userEntry = createCurrentUserEntry(
    match,
    getPrediction(state, match.id),
    state.selectedTeamKey,
  )
  const seededEntries = communityEntries
    .filter((entry) => entry.matchId === match.id)
    .map(createCommunityReceipt)

  return [...seededEntries, ...(userEntry ? [userEntry] : [])].map((entry) =>
    resolveEligibility(entry, match),
  )
}

function scoreMatchesEntry(entry: DrawEntry, match: Match) {
  return (
    entry.winner === match.demoResult.winner &&
    entry.homeScore === match.demoResult.homeScore &&
    entry.awayScore === match.demoResult.awayScore
  )
}

function rankEligibleEntries(entries: DrawEntry[], rankingSeed: string) {
  return [...entries]
    .map((entry) => ({
      entry,
      weight: hashString(`${rankingSeed}:${entry.receiptHash}:${entry.id}`),
    }))
    .sort((a, b) => a.weight.localeCompare(b.weight))
    .map(({ entry }) => entry)
}

function createParticipantOutcome(
  participantEntry: DrawEntry | undefined,
  winners: DrawWinner[],
  alternates: DrawEntry[],
): ParticipantOutcome {
  if (!participantEntry) {
    return {
      tone: 'pending',
      title: 'Lock a pick to apply',
      detail:
        'A locked winner prediction creates a receipt and adds your ticket to the match draw after results close.',
    }
  }

  if (participantEntry.eligibilityStatus !== 'qualified') {
    return {
      tone: 'not_qualified',
      title: 'Ticket checked: not eligible',
      detail: `Your ${getPickLabel(participantEntry.winner)} pick did not match the final result, so this ticket stayed out of the winner pool.`,
    }
  }

  if (winners.some((winner) => winner.id === participantEntry.id)) {
    return {
      tone: 'winner',
      title: 'Your ticket is in the winner group',
      detail:
        'The claim window opens next so the shirt order and sponsor package can be queued with address details.',
    }
  }

  if (alternates.some((alternate) => alternate.id === participantEntry.id)) {
    return {
      tone: 'alternate',
      title: 'Your ticket is an alternate',
      detail:
        'You qualified and will move into the winner group if a selected winner misses the claim window.',
    }
  }

  return {
    tone: 'not_selected',
    title: 'Qualified, not selected',
    detail:
      'Your ticket passed eligibility and remains in the audit record, but it was not inside the winner slots for this match.',
  }
}

function createDrawAudit(
  eligible: DrawEntry[],
  winners: DrawWinner[],
  alternates: DrawEntry[],
  publicSeed: string,
  secretCommitment: string,
  revealSeed: string,
): DrawAudit {
  return {
    publicSeed,
    secretCommitment,
    revealSeed,
    algorithm: DRAW_ALGORITHM,
    auditHash: hashString(
      [
        publicSeed,
        secretCommitment,
        ...eligible.map((entry) => entry.receiptHash),
        ...winners.map((winner) => winner.receiptHash),
        ...alternates.map((alternate) => alternate.receiptHash),
      ].join(':'),
    ),
    drawnAt: 'After final result close',
    eligibleEntryIds: eligible.map((entry) => entry.id),
    alternateEntryIds: alternates.map((entry) => entry.id),
  }
}

function createDrawResult(match: Match, state: PredictionState): DrawResult {
  const entries = getDrawEntries(match, state)
  const eligible = entries.filter((entry) => entry.eligibilityStatus === 'qualified')
  const publicSeed = `${match.id}:${match.demoResult.homeScore}-${match.demoResult.awayScore}:${match.winnerSlots}`
  const revealSeed = `${DEMO_RULES_VERSION}:${match.id}:sponsor-rewards-demo`
  const secretCommitment = hashString(revealSeed)
  const rankedEntries = rankEligibleEntries(
    eligible,
    `${publicSeed}:${revealSeed}`,
  )
  const winners = rankedEntries
    .slice(0, match.winnerSlots)
    .map((entry, index) => ({
      ...entry,
      exactScore: scoreMatchesEntry(entry, match),
      prize: index % 2 === 0 ? 'Sponsor kit + free shirt' : 'Free shirt + bonus entry',
      fulfillmentStatus:
        index % 3 === 0
          ? 'Awaiting address'
          : index % 3 === 1
            ? 'POD queued'
            : 'Sponsor kit queued',
    })) satisfies DrawWinner[]
  const alternates = rankedEntries.slice(
    match.winnerSlots,
    match.winnerSlots + ALTERNATE_COUNT,
  )
  const currentUserEntry = entries.find((entry) => entry.isCurrentUser)
  const audit = createDrawAudit(
    eligible,
    winners,
    alternates,
    publicSeed,
    secretCommitment,
    revealSeed,
  )

  return {
    matchId: match.id,
    status: 'winners_selected',
    resultLabel: `${getTeam(match.home).code} ${match.demoResult.homeScore} - ${match.demoResult.awayScore} ${getTeam(match.away).code}`,
    entryCount: entries.length,
    eligibleCount: eligible.length,
    winners,
    alternates,
    participantOutcome: createParticipantOutcome(
      currentUserEntry,
      winners,
      alternates,
    ),
    currentUserEntry,
    audit,
    reviewPrompted: false,
  }
}

function updatePredictionInState(
  state: PredictionState,
  matchId: string,
  patch: Partial<Prediction>,
): PredictionState {
  return {
    ...state,
    predictions: {
      ...state.predictions,
      [matchId]: {
        ...defaultPrediction,
        ...state.predictions[matchId],
        ...patch,
      },
    },
  }
}

function updateDrawResultStatus(
  state: PredictionState,
  matchId: string,
  status: DrawStatus,
  patch: Partial<DrawResult> = {},
): PredictionState {
  const result = state.drawResults[matchId]

  if (!result) {
    return state
  }

  return {
    ...state,
    drawResults: {
      ...state.drawResults,
      [matchId]: {
        ...result,
        ...patch,
        participantOutcome: advanceParticipantOutcome(
          patch.participantOutcome ?? result.participantOutcome,
          status,
        ),
        status,
      },
    },
  }
}

const drawTimeline = [
  { label: 'Apply', progress: 1 },
  { label: 'Check', progress: 2 },
  { label: 'Seed', progress: 3 },
  { label: 'Reveal', progress: 4 },
  { label: 'Claim', progress: 5 },
] as const

const drawStatusProgress: Record<DrawStatus, number> = {
  open: 0,
  locked: 1,
  result_pending: 1,
  eligibility_check: 2,
  draw_ready: 3,
  drawing: 3,
  winners_selected: 4,
  claiming: 5,
  fulfillment: 5,
  review_prompted: 5,
  closed: 5,
}

function getPendingDrawStatus(prediction: Prediction): DrawStatus {
  if (prediction.locked) {
    return 'result_pending'
  }

  if (prediction.winner) {
    return 'locked'
  }

  return 'open'
}

function getDrawStatusLabel(status: DrawStatus) {
  if (status === 'open') return 'Open for predictions'
  if (status === 'locked') return 'Pick selected'
  if (status === 'result_pending') return 'Ticket waiting for result'
  if (status === 'eligibility_check') return 'Checking eligibility'
  if (status === 'draw_ready') return 'Draw seed ready'
  if (status === 'drawing') return 'Drawing winners'
  if (status === 'winners_selected') return 'Winners selected'
  if (status === 'claiming') return 'Claim window'
  if (status === 'fulfillment') return 'Fulfillment queued'
  if (status === 'review_prompted') return 'Reviews prompted'

  return 'Closed'
}

function getPreDrawOutcome(
  currentUserEntry: DrawEntry | undefined,
): ParticipantOutcome {
  if (!currentUserEntry) {
    return {
      tone: 'pending',
      title: 'Lock a pick to apply',
      detail:
        'Choose a winner, set the score, and lock the prediction to create your draw receipt.',
    }
  }

  return {
    tone: 'qualified',
    title: 'Draw application received',
    detail: `${currentUserEntry.receiptHash} is waiting for the final score and eligibility check.`,
  }
}

function advanceParticipantOutcome(
  outcome: ParticipantOutcome,
  status: DrawStatus,
): ParticipantOutcome {
  if (outcome.tone !== 'winner') {
    return outcome
  }

  if (status === 'fulfillment') {
    return {
      ...outcome,
      title: 'Your reward is queued',
      detail:
        'The localized shirt order and sponsor package are ready for fulfillment once address details are confirmed.',
    }
  }

  if (status === 'review_prompted') {
    return {
      ...outcome,
      title: 'Review prompt ready after delivery',
      detail:
        'The reward flow has moved through fulfillment and will ask for sponsor product feedback after delivery.',
    }
  }

  return outcome
}

const sectionProps = z.object({
  id: z.string().optional(),
  kicker: z.string(),
  title: z.string(),
  icon: z
    .enum(['target', 'calendar', 'gift', 'shirt', 'package', 'trophy', 'sparkles'])
    .default('target'),
})

export const predictionCatalog = defineCatalog(schema, {
  components: {
    ExperienceShell: {
      props: z.object({}),
      description: 'Main page shell for the prediction experience.',
    },
    Section: {
      props: sectionProps,
      description: 'Full-width section with title, kicker, icon, and children.',
    },
    MatchBoard: {
      props: z.object({}),
      description: 'Interactive board of match cards and prediction controls.',
    },
    TournamentSchedule: {
      props: z.object({}),
      description: 'All tournament teams and group-stage fixture schedule.',
    },
    RewardSummary: {
      props: z.object({}),
      description: 'Sponsor reward summary cards.',
    },
    DrawControl: {
      props: z.object({}),
      description: 'Runs fair demo draws for each match and displays winners.',
    },
    FulfillmentPipeline: {
      props: z.object({}),
      description: 'Shows the post-draw fulfillment and review workflow.',
    },
    ShirtStudio: {
      props: z.object({}),
      description: 'Localized team T-shirt preview based on supporter team.',
    },
    ProviderPlan: {
      props: z.object({}),
      description: 'POD, 3PL, and Stripe Projects provider architecture.',
    },
  },
  actions: {
    selectWinner: {
      params: z.object({
        matchId: z.string(),
        winner: winnerSchema,
      }),
      description: 'Select a predicted winner for a match.',
    },
    setScore: {
      params: z.object({
        matchId: z.string(),
        side: z.enum(['home', 'away']),
        score: z.number(),
      }),
      description: 'Set the predicted score for one side of a match.',
    },
    lockPrediction: {
      params: z.object({
        matchId: z.string(),
      }),
      description: 'Lock the current prediction for a match.',
    },
    runDraw: {
      params: z.object({
        matchId: z.string(),
      }),
      description: 'Run the match draw from eligible correct predictions.',
    },
    promptReviews: {
      params: z.object({
        matchId: z.string(),
      }),
      description: 'Mark winner review prompts as sent for a match.',
    },
    queueFulfillment: {
      params: z.object({
        matchId: z.string(),
      }),
      description: 'Queue POD shirts and sponsor kits for a match draw.',
    },
  },
})

export const predictionSpec = {
  root: 'experience',
  elements: {
    experience: {
      type: 'ExperienceShell',
      props: {},
      children: [
        'section-matches',
        'section-schedule',
        'section-draw',
        'section-shirts',
        'section-fulfillment',
        'section-providers',
      ],
    },
    'section-matches': {
      type: 'Section',
      props: {
        id: 'predictions',
        kicker: 'Prediction System',
        title: 'Pick, Score, Lock',
        icon: 'target',
      },
      children: ['match-board'],
    },
    'match-board': {
      type: 'MatchBoard',
      props: {},
      children: [],
    },
    'section-schedule': {
      type: 'Section',
      props: {
        id: 'teams',
        kicker: 'Tournament Snapshot',
        title: 'Teams And Group-Stage Schedule',
        icon: 'calendar',
      },
      children: ['tournament-schedule'],
    },
    'tournament-schedule': {
      type: 'TournamentSchedule',
      props: {},
      children: [],
    },
    'section-draw': {
      type: 'Section',
      props: {
        id: 'draws',
        kicker: 'Winner Draw',
        title: 'Run Match-Level Draws',
        icon: 'trophy',
      },
      children: ['draw-control'],
    },
    'draw-control': {
      type: 'DrawControl',
      props: {},
      children: [],
    },
    'section-shirts': {
      type: 'Section',
      props: {
        id: 'shirts',
        kicker: 'Localized Reward',
        title: 'Supporter T-Shirt Studio',
        icon: 'shirt',
      },
      children: ['shirt-studio'],
    },
    'shirt-studio': {
      type: 'ShirtStudio',
      props: {},
      children: [],
    },
    'section-fulfillment': {
      type: 'Section',
      props: {
        id: 'rewards',
        kicker: 'After The Draw',
        title: 'Ship, Track, Review',
        icon: 'package',
      },
      children: ['fulfillment-pipeline', 'reward-summary'],
    },
    'fulfillment-pipeline': {
      type: 'FulfillmentPipeline',
      props: {},
      children: [],
    },
    'reward-summary': {
      type: 'RewardSummary',
      props: {},
      children: [],
    },
    'section-providers': {
      type: 'Section',
      props: {
        id: 'operations',
        kicker: 'Operations',
        title: 'POD, 3PL, And Stripe Projects',
        icon: 'sparkles',
      },
      children: ['provider-plan'],
    },
    'provider-plan': {
      type: 'ProviderPlan',
      props: {},
      children: [],
    },
  },
}

function sectionIcon(icon: z.infer<typeof sectionProps>['icon']) {
  if (icon === 'calendar') return <CalendarDays size={19} />
  if (icon === 'gift') return <Gift size={19} />
  if (icon === 'shirt') return <Shirt size={19} />
  if (icon === 'package') return <PackageCheck size={19} />
  if (icon === 'trophy') return <Trophy size={19} />
  if (icon === 'sparkles') return <Sparkles size={19} />

  return <Award size={19} />
}

function DrawStatusRail({ status }: { status: DrawStatus }) {
  const progress = drawStatusProgress[status]

  return (
    <div className="draw-status-rail" aria-label={getDrawStatusLabel(status)}>
      {drawTimeline.map((step) => {
        const state =
          progress > step.progress
            ? 'complete'
            : progress === step.progress
              ? 'current'
              : 'pending'

        return (
          <span className={`draw-status-step ${state}`} key={step.label}>
            <em>{step.label}</em>
          </span>
        )
      })}
    </div>
  )
}

function DrawTheater({
  currentUserEntry,
  match,
  result,
  status,
}: {
  currentUserEntry?: DrawEntry
  match: Match
  result?: DrawResult
  status: DrawStatus
}) {
  const outcome = result?.participantOutcome ?? getPreDrawOutcome(currentUserEntry)
  const ticketCodes = [
    getTeam(match.home).code,
    getTeam(match.away).code,
    getTeam(match.home).code,
    getTeam(match.away).code,
    'FAN',
    'KIT',
  ]

  return (
    <div className={`draw-theater status-${status}`}>
      <div className="ticket-pool" aria-hidden="true">
        <span className="draw-light" />
        {ticketCodes.map((code, index) => (
          <span
            className="animated-ticket"
            key={`${code}-${index}`}
            style={
              {
                '--ticket-delay': `${index * 120}ms`,
              } as CSSProperties
            }
          >
            {code}
          </span>
        ))}
      </div>

      <div className={`participant-outcome ${outcome.tone}`} aria-live="polite">
        <span>{getDrawStatusLabel(status)}</span>
        <strong>{outcome.title}</strong>
        <p>{outcome.detail}</p>
        {currentUserEntry ? (
          <dl className="receipt-details">
            <div>
              <dt>Receipt</dt>
              <dd>{currentUserEntry.receiptHash}</dd>
            </div>
            <div>
              <dt>Pick</dt>
              <dd>{getPickLabel(currentUserEntry.winner)}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </div>
  )
}

function DrawAuditPanel({ result }: { result: DrawResult }) {
  return (
    <div className="draw-audit-panel">
      <div>
        <span>Public seed</span>
        <strong>{result.audit.publicSeed}</strong>
      </div>
      <div>
        <span>Commitment</span>
        <strong>{result.audit.secretCommitment}</strong>
      </div>
      <div>
        <span>Audit hash</span>
        <strong>{result.audit.auditHash}</strong>
      </div>
      <p>{result.audit.algorithm}</p>
    </div>
  )
}

function TournamentFixtureRow({
  fixture,
  focusTeam,
}: {
  fixture: TournamentFixture
  focusTeam?: string
}) {
  const highlightsFocus = fixture.home === focusTeam || fixture.away === focusTeam

  return (
    <article className={`fixture-item ${highlightsFocus ? 'focus-fixture' : ''}`}>
      <header>
        <span>Match {fixture.matchNumber}</span>
        <strong>Group {fixture.group}</strong>
      </header>

      <div className="fixture-matchup">
        <span className={fixture.home === focusTeam ? 'focus-team' : undefined}>
          <strong>{getTournamentTeamCode(fixture.home)}</strong>
          {fixture.home}
        </span>
        <em>vs</em>
        <span className={fixture.away === focusTeam ? 'focus-team' : undefined}>
          <strong>{getTournamentTeamCode(fixture.away)}</strong>
          {fixture.away}
        </span>
      </div>

      <footer>
        <span>
          <Clock size={14} />
          {formatFixtureDate(fixture.date)} · {formatTimeET(fixture.timeET)}
        </span>
        <span>
          <MapPin size={14} />
          {fixture.venue.city}
        </span>
      </footer>
      {fixture.note ? <p>{fixture.note}</p> : null}
    </article>
  )
}

function TournamentSchedulePanel() {
  const { state } = useStateStore()
  const selectedTeamKey = (state as PredictionState).selectedTeamKey
  const selectedTeam = getTeam(selectedTeamKey)
  const focusTeamName = supporterTeamScheduleNames[selectedTeamKey]
  const focusFixtures = focusTeamName
    ? getTournamentTeamSchedule(focusTeamName)
    : []

  return (
    <div className="tournament-schedule">
      <div className="schedule-summary">
        <div>
          <p className="section-kicker">Source Snapshot</p>
          <h3>{TOURNAMENT_SOURCE_SNAPSHOT.asOf}</h3>
          <span>{TOURNAMENT_SOURCE_SNAPSHOT.note}</span>
        </div>
        <div className="schedule-stat-grid" aria-label="Tournament counts">
          <span>
            <strong>{worldCupTeams.length}</strong>
            teams
          </span>
          <span>
            <strong>{worldCupGroups.length}</strong>
            groups
          </span>
          <span>
            <strong>{worldCupFixtures.length}</strong>
            group fixtures
          </span>
        </div>
        <a
          className="source-link"
          href={TOURNAMENT_SOURCE_SNAPSHOT.officialScheduleUrl}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink size={16} />
          <span>Check FIFA Schedule</span>
        </a>
      </div>

      <section className="supporter-fixtures" aria-labelledby="supporter-fixtures-title">
        <div>
          <p className="section-kicker">{selectedTeam.code} Schedule</p>
          <h3 id="supporter-fixtures-title">{selectedTeam.name} Group Fixtures</h3>
        </div>
        <div className="supporter-fixture-list">
          {focusFixtures.map((fixture) => (
            <TournamentFixtureRow
              fixture={fixture}
              focusTeam={focusTeamName}
              key={fixture.matchNumber}
            />
          ))}
        </div>
      </section>

      <div className="schedule-layout">
        <section className="groups-panel" aria-labelledby="groups-title">
          <div className="schedule-panel-heading">
            <div>
              <p className="section-kicker">All Teams</p>
              <h3 id="groups-title">Groups A-L</h3>
            </div>
            <span>48-team field</span>
          </div>
          <div className="group-grid">
            {worldCupGroups.map((group) => (
              <article className="group-card" key={group.id}>
                <header>
                  <strong>Group {group.id}</strong>
                  <span>{group.teams.length} teams</span>
                </header>
                <div className="group-team-list">
                  {group.teams.map((team) => (
                    <span
                      className={team.name === focusTeamName ? 'selected' : undefined}
                      key={team.name}
                    >
                      <strong>{team.code}</strong>
                      <em>{team.name}</em>
                      <small>Pot {team.seedPot}</small>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="fixtures-panel" aria-labelledby="fixtures-title">
          <div className="schedule-panel-heading">
            <div>
              <p className="section-kicker">Full Schedule</p>
              <h3 id="fixtures-title">Group Stage Fixtures</h3>
            </div>
            <span>{TOURNAMENT_SOURCE_SNAPSHOT.timeZone} kickoff times</span>
          </div>
          <div className="fixture-list" role="list">
            {worldCupFixtures.map((fixture) => (
              <TournamentFixtureRow
                fixture={fixture}
                focusTeam={focusTeamName}
                key={fixture.matchNumber}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export const { registry, handlers } = defineRegistry(predictionCatalog, {
  components: {
    ExperienceShell: ({ children }) => (
      <div className="json-experience">{children}</div>
    ),
    Section: ({ props, children }) => (
      <section className="content-band json-section" id={props.id}>
        <div className="section-heading">
          <span className="icon-box">{sectionIcon(props.icon)}</span>
          <div>
            <p className="section-kicker">{props.kicker}</p>
            <h2>{props.title}</h2>
          </div>
        </div>
        {children}
      </section>
    ),
    TournamentSchedule: () => <TournamentSchedulePanel />,
    MatchBoard: () => {
      const { state } = useStateStore()
      const predictionState = state as PredictionState
      const selectedTeamKey = predictionState.selectedTeamKey
      const sortedMatches = [...matches].sort((a, b) => {
        const aFeatured = a.home === selectedTeamKey || a.away === selectedTeamKey
        const bFeatured = b.home === selectedTeamKey || b.away === selectedTeamKey

        return Number(bFeatured) - Number(aFeatured)
      })

      return (
        <div className="prediction-grid">
          {sortedMatches.map((match) => (
            <RenderedMatchCard
              key={match.id}
              match={match}
              prediction={getPrediction(predictionState, match.id)}
              selectedTeamKey={selectedTeamKey}
            />
          ))}
        </div>
      )
    },
    RewardSummary: () => (
      <div className="reward-grid">
        {sponsorRewards.map((reward) => (
          <article className="reward-card" key={reward.title}>
            <span className="reward-icon">
              {reward.value === '$500' ? (
                <CircleDollarSign size={22} />
              ) : (
                <Sparkles size={22} />
              )}
            </span>
            <div>
              <p>{reward.title}</p>
              <strong>{reward.value}</strong>
              <span>{reward.detail}</span>
            </div>
          </article>
        ))}
      </div>
    ),
    DrawControl: () => {
      const { state } = useStateStore()
      const predictionState = state as PredictionState

      return (
        <div className="draw-grid">
          {matches.map((match) => {
            const result = predictionState.drawResults[match.id]
            const prediction = getPrediction(predictionState, match.id)
            const currentUserEntry =
              result?.currentUserEntry ??
              createCurrentUserEntry(
                match,
                prediction,
                predictionState.selectedTeamKey,
              )
            const status = result?.status ?? getPendingDrawStatus(prediction)

            return (
              <article className="draw-card" key={match.id}>
                <div className="draw-card-header">
                  <div>
                    <span>{match.stage}</span>
                    <h3>
                      {getTeam(match.home).code} vs {getTeam(match.away).code}
                    </h3>
                    <p>{match.winnerSlots} winners from correct predictions</p>
                  </div>
                  <ActionButton
                    action="runDraw"
                    params={{ matchId: match.id }}
                    tone="primary"
                  >
                    <Dice5 size={17} />
                    <span>{result ? 'Replay Draw' : 'Start Draw'}</span>
                  </ActionButton>
                </div>

                <DrawStatusRail status={status} />
                <DrawTheater
                  currentUserEntry={currentUserEntry}
                  match={match}
                  result={result}
                  status={status}
                />

                {result ? (
                  <div className="winner-list">
                    <div className="result-ribbon">
                      <span>Final result</span>
                      <strong>{result.resultLabel}</strong>
                      <em>
                        {result.eligibleCount} of {result.entryCount} entries eligible
                      </em>
                    </div>
                    {result.winners.map((winner, index) => (
                      <div
                        className={`winner-row ${winner.isCurrentUser ? 'current-user' : ''}`}
                        key={winner.id}
                        style={
                          {
                            '--winner-delay': `${index * 70}ms`,
                          } as CSSProperties
                        }
                      >
                        <span>{winner.name}</span>
                        <strong>{getTeam(winner.supporter).code}</strong>
                        <em>{winner.exactScore ? 'Exact score' : 'Winner pick'}</em>
                      </div>
                    ))}
                    {result.alternates.length > 0 ? (
                      <div className="alternate-list">
                        <span>Alternates</span>
                        {result.alternates.map((alternate) => (
                          <em key={alternate.id}>
                            {alternate.name} - {alternate.receiptHash}
                          </em>
                        ))}
                      </div>
                    ) : null}
                    <DrawAuditPanel result={result} />
                  </div>
                ) : (
                  <p className="empty-draw">
                    Results pending. The draw will reveal eligible receipts,
                    winner slots, alternates, and the audit seed.
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )
    },
    FulfillmentPipeline: () => {
      const { state } = useStateStore()
      const predictionState = state as PredictionState
      const results = Object.values(predictionState.drawResults)
      const queuedCount = predictionState.fulfillmentQueue.length
      const reviewCount = Object.values(predictionState.reviewPrompts).filter(Boolean).length

      return (
        <div className="pipeline-layout">
          <div className="pipeline-steps">
            {[
              ['1', 'Verify winners', 'Confirm eligible entries and address requirements.'],
              ['2', 'Create orders', 'Send shirt jobs to POD and sponsor kits to 3PL.'],
              ['3', 'Track delivery', 'Listen for shipment events and delivery confirmation.'],
              ['4', 'Prompt reviews', 'Ask winners to review sponsor products after delivery.'],
            ].map(([step, title, detail]) => (
              <div className="pipeline-step" key={step}>
                <span>{step}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <aside className="operations-panel">
            <h3>Operations Queue</h3>
            <div className="queue-stats">
              <span>
                <strong>{queuedCount}</strong>
                queued orders
              </span>
              <span>
                <strong>{reviewCount}</strong>
                review batches
              </span>
            </div>
            {results.length > 0 ? (
              results.map((result) => (
                <div className="queue-match" key={result.matchId}>
                  <span>{getMatch(result.matchId).pool}</span>
                  <strong>{result.winners.length} winners</strong>
                  <div className="queue-actions">
                    <ActionButton
                      action="queueFulfillment"
                      params={{ matchId: result.matchId }}
                      tone="secondary"
                    >
                      <PackageCheck size={16} />
                      <span>Queue Shipments</span>
                    </ActionButton>
                    <ActionButton
                      action="promptReviews"
                      params={{ matchId: result.matchId }}
                      tone="secondary"
                    >
                      <Send size={16} />
                      <span>Send Reviews</span>
                    </ActionButton>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-draw">
                Draw winners appear here when a match is ready for fulfillment.
              </p>
            )}
          </aside>
        </div>
      )
    },
    ShirtStudio: () => {
      const { state } = useStateStore()
      const selectedTeamKey = (state as PredictionState).selectedTeamKey
      const selectedTeam = getTeam(selectedTeamKey)
      const shirt = shirtConcepts[selectedTeamKey]

      return (
        <div className="shirt-studio">
          <div
            className="shirt-mockup"
            style={
              {
                '--shirt-base': shirt.base,
                '--shirt-graphic': shirt.graphic,
                '--shirt-accent': shirt.accent,
              } as CSSProperties
            }
          >
            <div className="shirt-body">
              <span className="shirt-collar" />
              <span className="shirt-sleeve left" />
              <span className="shirt-sleeve right" />
              <div className="shirt-print">
                <span>{selectedTeam.code}</span>
                <strong>{shirt.primaryCopy}</strong>
              </div>
            </div>
          </div>

          <div className="shirt-copy">
            <p className="section-kicker">Independent fan design</p>
            <h3>{shirt.conceptName}</h3>
            <p>{shirt.note}</p>
            <div className="shirt-details">
              <span>
                <Palette size={16} />
                {shirt.motif}
              </span>
              <span>
                <Shirt size={16} />
                Alternate copy: {shirt.alternateCopy}
              </span>
              <span>
                <Check size={16} />
                No official team, tournament, sponsor, or player branding.
              </span>
            </div>
          </div>
        </div>
      )
    },
    ProviderPlan: () => (
      <div className="provider-grid">
        {providerRecommendations.map((item) => (
          <article className="provider-card" key={item.provider}>
            <div>
              <span>{item.role}</span>
              <h3>{item.provider}</h3>
            </div>
            <p>{item.reason}</p>
            <em>{item.risk}</em>
          </article>
        ))}
        <a
          className="provider-link"
          href="https://projects.dev/"
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink size={17} />
          <span>Review Stripe Projects</span>
        </a>
      </div>
    ),
  },
  actions: {
    selectWinner: async (params, setState) => {
      if (!params) return

      setState((previous) =>
        updatePredictionInState(previous as PredictionState, params.matchId, {
          winner: params.winner,
          locked: false,
        }),
      )
    },
    setScore: async (params, setState) => {
      if (!params) return

      setState((previous) =>
        updatePredictionInState(previous as PredictionState, params.matchId, {
          [params.side === 'home' ? 'homeScore' : 'awayScore']: params.score,
          locked: false,
        }),
      )
    },
    lockPrediction: async (params, setState) => {
      if (!params) return

      setState((previous) => {
        const typedPrevious = previous as PredictionState
        const prediction = getPrediction(typedPrevious, params.matchId)

        if (!prediction.winner) {
          return typedPrevious
        }

        return updatePredictionInState(typedPrevious, params.matchId, {
          locked: true,
        })
      })
    },
    runDraw: async (params, setState) => {
      if (!params) return

      const match = getMatch(params.matchId)

      setState((previous) => {
        const typedPrevious = previous as PredictionState
        const result = createDrawResult(match, typedPrevious)

        return {
          ...typedPrevious,
          drawResults: {
            ...typedPrevious.drawResults,
            [match.id]: result,
          },
        }
      })
    },
    promptReviews: async (params, setState) => {
      if (!params) return

      setState((previous) => {
        const typedPrevious = previous as PredictionState

        return updateDrawResultStatus(
          {
            ...typedPrevious,
            reviewPrompts: {
              ...typedPrevious.reviewPrompts,
              [params.matchId]: true,
            },
          },
          params.matchId,
          'review_prompted',
          { reviewPrompted: true },
        )
      })
    },
    queueFulfillment: async (params, setState) => {
      if (!params) return

      setState((previous) => {
        const typedPrevious = previous as PredictionState
        const nextQueue = new Set(typedPrevious.fulfillmentQueue)
        nextQueue.add(params.matchId)

        return updateDrawResultStatus(
          {
            ...typedPrevious,
            fulfillmentQueue: [...nextQueue],
          },
          params.matchId,
          'fulfillment',
        )
      })
    },
  },
})

function RenderedMatchCard({
  match,
  prediction,
  selectedTeamKey,
}: {
  match: Match
  prediction: Prediction
  selectedTeamKey: TeamKey
}) {
  const homeTeam = getTeam(match.home)
  const awayTeam = getTeam(match.away)
  const isSupporterMatch =
    match.home === selectedTeamKey || match.away === selectedTeamKey

  return (
    <article
      className={`match-card ${isSupporterMatch ? 'supporter-match' : ''}`}
    >
      <div className="match-meta">
        <span>{match.stage}</span>
        <span>{match.kickoff}</span>
      </div>

      <div className="matchup">
        <TeamBadge teamKey={match.home} align="left" />
        <span className="versus">VS</span>
        <TeamBadge teamKey={match.away} align="right" />
      </div>

      <div className="score-picker" aria-label={`${homeTeam.name} score prediction`}>
        <ScoreControl
          label={homeTeam.code}
          matchId={match.id}
          side="home"
          value={prediction.homeScore}
        />
        <span className="score-divider">-</span>
        <ScoreControl
          label={awayTeam.code}
          matchId={match.id}
          side="away"
          value={prediction.awayScore}
        />
      </div>

      <div className="pick-options" aria-label="Winner prediction">
        <ActionButton
          action="selectWinner"
          active={prediction.winner === match.home}
          params={{ matchId: match.id, winner: match.home }}
          tone="pick"
        >
          {homeTeam.code}
        </ActionButton>
        <ActionButton
          action="selectWinner"
          active={prediction.winner === 'draw'}
          params={{ matchId: match.id, winner: 'draw' }}
          tone="pick"
        >
          Draw
        </ActionButton>
        <ActionButton
          action="selectWinner"
          active={prediction.winner === match.away}
          params={{ matchId: match.id, winner: match.away }}
          tone="pick"
        >
          {awayTeam.code}
        </ActionButton>
      </div>

      <div className="match-footer">
        <div>
          <span>{match.pool}</span>
          <strong>{match.oddsLabel}</strong>
        </div>
        <ActionButton
          action="lockPrediction"
          disabled={!prediction.winner}
          params={{ matchId: match.id }}
          tone="lock"
        >
          {prediction.locked ? <Check size={17} /> : <RefreshCw size={17} />}
          <span>{prediction.locked ? 'Locked' : 'Lock Pick'}</span>
        </ActionButton>
      </div>

      {prediction.locked && prediction.winner ? (
        <div className="entry-receipt">
          <span>
            <Check size={15} />
            Draw application received
          </span>
          <strong>{createReceiptHash(match, prediction, selectedTeamKey)}</strong>
        </div>
      ) : null}

      <div className="drop-row">
        {match.sponsorDrops.map((drop) => (
          <span key={drop}>{drop}</span>
        ))}
      </div>
    </article>
  )
}

function TeamBadge({
  teamKey,
  align,
}: {
  teamKey: TeamKey
  align: 'left' | 'right'
}) {
  const team = getTeam(teamKey)

  return (
    <div className={`team-badge ${align}`}>
      <span
        className="badge-mark"
        style={
          {
            '--badge-primary': team.colors.primary,
            '--badge-secondary': team.colors.secondary,
            '--badge-accent': team.colors.accent,
          } as CSSProperties
        }
      >
        {team.code}
      </span>
      <strong>{team.name}</strong>
    </div>
  )
}

function ScoreControl({
  label,
  matchId,
  side,
  value,
}: {
  label: string
  matchId: string
  side: 'home' | 'away'
  value: number
}) {
  const { set } = useStateStore()

  return (
    <label className="score-field">
      <span>{label}</span>
      <input
        inputMode="numeric"
        max={9}
        min={0}
        onChange={(event) => {
          const nextValue = Math.max(0, Math.min(9, Number(event.target.value)))

          set('/', (previous: unknown) =>
            updatePredictionInState(previous as PredictionState, matchId, {
              [side === 'home' ? 'homeScore' : 'awayScore']: nextValue,
              locked: false,
            }),
          )
        }}
        type="number"
        value={value}
      />
    </label>
  )
}

function ActionButton({
  action,
  active = false,
  children,
  disabled = false,
  params,
  tone,
}: {
  action: string
  active?: boolean
  children: ReactNode
  disabled?: boolean
  params: Record<string, unknown>
  tone: 'primary' | 'secondary' | 'pick' | 'lock'
}) {
  const { set, state } = useStateStore()
  const actionHandlers = handlers(() => (updater) => set('/', updater), () => state)
  const className =
    tone === 'pick'
      ? 'pick-button'
      : tone === 'lock'
        ? 'lock-button'
        : tone === 'primary'
          ? 'draw-button primary'
          : 'draw-button secondary'

  return (
    <button
      aria-pressed={active}
      className={className}
      disabled={disabled}
      onClick={() => {
        void actionHandlers[action]?.(params)
      }}
      type="button"
    >
      {children}
    </button>
  )
}
