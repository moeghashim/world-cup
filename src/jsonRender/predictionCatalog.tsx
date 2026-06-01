/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties, ReactNode } from 'react'
import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { defineRegistry, useStateStore } from '@json-render/react'
import { z } from 'zod'
import {
  Award,
  Check,
  CircleDollarSign,
  Dice5,
  ExternalLink,
  Gift,
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

export type WinnerPick = TeamKey | 'draw'

export type Prediction = {
  winner?: WinnerPick
  homeScore: number
  awayScore: number
  locked: boolean
}

export type DrawWinner = CommunityEntry & {
  exactScore: boolean
  prize: string
  fulfillmentStatus: 'Awaiting address' | 'POD queued' | 'Sponsor kit queued'
}

export type DrawResult = {
  matchId: string
  resultLabel: string
  eligibleCount: number
  winners: DrawWinner[]
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

function deterministicShuffle<T>(items: T[], seed: string) {
  return [...items]
    .map((item, index) => {
      let hash = 0
      const input = `${seed}:${index}`

      for (let charIndex = 0; charIndex < input.length; charIndex += 1) {
        hash = (hash * 31 + input.charCodeAt(charIndex)) % 9973
      }

      return { item, weight: hash }
    })
    .sort((a, b) => a.weight - b.weight)
    .map(({ item }) => item)
}

function scoreMatchesEntry(entry: CommunityEntry, match: Match) {
  return (
    entry.winner === match.demoResult.winner &&
    entry.homeScore === match.demoResult.homeScore &&
    entry.awayScore === match.demoResult.awayScore
  )
}

function createDrawResult(match: Match): DrawResult {
  const eligible = communityEntries.filter(
    (entry) =>
      entry.matchId === match.id && entry.winner === match.demoResult.winner,
  )
  const winners = deterministicShuffle(eligible, match.id)
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

  return {
    matchId: match.id,
    resultLabel: `${getTeam(match.home).code} ${match.demoResult.homeScore} - ${match.demoResult.awayScore} ${getTeam(match.away).code}`,
    eligibleCount: eligible.length,
    winners,
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

const sectionProps = z.object({
  id: z.string().optional(),
  kicker: z.string(),
  title: z.string(),
  icon: z
    .enum(['target', 'gift', 'shirt', 'package', 'trophy', 'sparkles'])
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
        'section-draw',
        'section-shirts',
        'section-fulfillment',
        'section-providers',
      ],
    },
    'section-matches': {
      type: 'Section',
      props: {
        id: 'rewards',
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
        id: 'fulfillment',
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
  if (icon === 'gift') return <Gift size={19} />
  if (icon === 'shirt') return <Shirt size={19} />
  if (icon === 'package') return <PackageCheck size={19} />
  if (icon === 'trophy') return <Trophy size={19} />
  if (icon === 'sparkles') return <Sparkles size={19} />

  return <Award size={19} />
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
                    <span>{result ? 'Redraw Demo' : 'Run Draw'}</span>
                  </ActionButton>
                </div>

                {result ? (
                  <div className="winner-list">
                    <div className="result-ribbon">
                      <span>Final result</span>
                      <strong>{result.resultLabel}</strong>
                      <em>{result.eligibleCount} eligible entries</em>
                    </div>
                    {result.winners.map((winner) => (
                      <div className="winner-row" key={winner.id}>
                        <span>{winner.name}</span>
                        <strong>{getTeam(winner.supporter).code}</strong>
                        <em>{winner.exactScore ? 'Exact score' : 'Winner pick'}</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-draw">
                    Draw opens after the final result is confirmed. This demo
                    uses seeded entries so the flow is repeatable.
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
                Run a match draw to populate shipment and review actions.
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
        <a className="provider-link" href="https://projects.dev/" target="_blank">
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

      setState((previous) =>
        updatePredictionInState(previous as PredictionState, params.matchId, {
          locked: true,
        }),
      )
    },
    runDraw: async (params, setState) => {
      if (!params) return

      const match = getMatch(params.matchId)
      const result = createDrawResult(match)

      setState((previous) => {
        const typedPrevious = previous as PredictionState

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

        return {
          ...typedPrevious,
          reviewPrompts: {
            ...typedPrevious.reviewPrompts,
            [params.matchId]: true,
          },
        }
      })
    },
    queueFulfillment: async (params, setState) => {
      if (!params) return

      setState((previous) => {
        const typedPrevious = previous as PredictionState
        const nextQueue = new Set(typedPrevious.fulfillmentQueue)
        nextQueue.add(params.matchId)

        return {
          ...typedPrevious,
          fulfillmentQueue: [...nextQueue],
        }
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
