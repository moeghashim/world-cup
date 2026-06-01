import { type CSSProperties, useMemo, useRef, useState } from 'react'
import { Renderer, JSONUIProvider, type StateStore } from '@json-render/react'
import {
  ChevronRight,
  Dice5,
  Gift,
  PackageCheck,
  ShieldCheck,
  Shirt,
  Target,
  Ticket,
  Trophy,
  UsersRound,
} from 'lucide-react'
import heroImage from './assets/world-cup-hero.png'
import './App.css'
import { getTeam, matches, teamThemes, type TeamKey } from './data/worldCup'
import {
  initialPredictionState,
  predictionSpec,
  registry,
  type PredictionState,
} from './jsonRender/predictionCatalog'

function parsePointer(path: string) {
  if (!path || path === '/') {
    return []
  }

  return path
    .replace(/^\//, '')
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
}

function getByPointer(source: unknown, path: string) {
  const segments = parsePointer(path)

  return segments.reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) return current[Number(segment)]
    if (typeof current === 'object') {
      return (current as Record<string, unknown>)[segment]
    }

    return undefined
  }, source)
}

function setByPointer<T extends Record<string, unknown>>(
  source: T,
  path: string,
  value: unknown,
): T {
  const segments = parsePointer(path)

  if (segments.length === 0) {
    return value as T
  }

  const [head, ...tail] = segments

  return {
    ...source,
    [head]: tail.length
      ? setByPointer(
          ((source[head] as Record<string, unknown>) ?? {}) as Record<
            string,
            unknown
          >,
          `/${tail.join('/')}`,
          value,
        )
      : value,
  } as T
}

function usePredictionStore(
  state: PredictionState,
  setState: React.Dispatch<React.SetStateAction<PredictionState>>,
) {
  const stateRef = useRef(state)
  const listenersRef = useRef(new Set<() => void>())

  return useMemo<StateStore>(
    () => ({
      get(path) {
        return getByPointer(stateRef.current, path)
      },
      set(path, value) {
        const nextState =
          typeof value === 'function'
            ? (value as (previous: PredictionState) => PredictionState)(
                stateRef.current,
              )
            : setByPointer(stateRef.current, path, value)

        stateRef.current = nextState
        setState(nextState)
        listenersRef.current.forEach((listener) => listener())
      },
      update(updates) {
        const nextState = Object.entries(updates).reduce(
          (current, [path, value]) => setByPointer(current, path, value),
          stateRef.current,
        )

        stateRef.current = nextState
        setState(nextState)
        listenersRef.current.forEach((listener) => listener())
      },
      getSnapshot() {
        return stateRef.current
      },
      getServerSnapshot() {
        return stateRef.current
      },
      subscribe(listener) {
        listenersRef.current.add(listener)

        return () => {
          listenersRef.current.delete(listener)
        }
      },
    }),
    [setState],
  )
}

function App() {
  const [predictionState, setPredictionState] = useState<PredictionState>(
    initialPredictionState,
  )
  const store = usePredictionStore(predictionState, setPredictionState)
  const selectedTeamKey = predictionState.selectedTeamKey
  const selectedTeam = getTeam(selectedTeamKey)

  const featuredMatch = useMemo(
    () =>
      matches.find(
        (match) =>
          match.home === selectedTeamKey || match.away === selectedTeamKey,
      ) ?? matches[0],
    [selectedTeamKey],
  )

  const lockedCount = Object.values(predictionState.predictions).filter(
    (prediction) => prediction.locked,
  ).length
  const drawCount = Object.keys(predictionState.drawResults).length
  const reviewCount = Object.values(predictionState.reviewPrompts).filter(
    Boolean,
  ).length
  const flowItems = [
    {
      href: '#predictions',
      icon: <Target size={17} />,
      label: 'Predict',
      meta: `${lockedCount} locked`,
    },
    {
      href: '#draws',
      icon: <Dice5 size={17} />,
      label: 'Draw',
      meta: `${drawCount} complete`,
    },
    {
      href: '#shirts',
      icon: <Shirt size={17} />,
      label: 'Personalize',
      meta: selectedTeam.code,
    },
    {
      href: '#rewards',
      icon: <PackageCheck size={17} />,
      label: 'Fulfill',
      meta: `${predictionState.fulfillmentQueue.length} queued`,
    },
    {
      href: '#operations',
      icon: <ShieldCheck size={17} />,
      label: 'Review',
      meta: `${reviewCount} sent`,
    },
  ]

  const themeVars = {
    '--team-primary': selectedTeam.colors.primary,
    '--team-secondary': selectedTeam.colors.secondary,
    '--team-accent': selectedTeam.colors.accent,
    '--team-ink': selectedTeam.colors.ink,
    '--team-soft': selectedTeam.colors.soft,
    '--hero-image': `url(${heroImage})`,
  } as CSSProperties

  return (
    <main className="app-shell" style={themeVars}>
      <header className="topbar">
        <a className="brand" href="#predict">
          <span className="brand-mark">
            <Trophy size={18} strokeWidth={2.3} />
          </span>
          <span>World Cup Predictor</span>
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#predictions">Fixtures</a>
          <a href="#rewards">Rewards</a>
          <a href="#operations">Operations</a>
        </nav>
        <button className="account-button" type="button">
          <Ticket size={17} />
          <span>
            {lockedCount} locked · {drawCount} draws
          </span>
        </button>
      </header>

      <section className="hero-band" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">{selectedTeam.chant}</p>
          <h1 id="page-title">{selectedTeam.name} Match Picks</h1>
          <p className="hero-subtitle">
            Predict the match, enter sponsor-funded draws, unlock localized
            supporter shirts, and move winners into shipping and review flows.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#predictions">
              <Target size={18} />
              <span>Make Picks</span>
              <ChevronRight size={17} />
            </a>
            <a className="secondary-action" href="#rewards">
              <Gift size={18} />
              <span>Reward Flow</span>
            </a>
          </div>
        </div>

        <aside className="supporter-panel" aria-label="Selected team summary">
          <div className="kit-preview" aria-hidden="true">
            <span>{selectedTeam.code}</span>
          </div>
          <div>
            <p className="panel-label">Supporter mode</p>
            <h2>{selectedTeam.name}</h2>
            <p>{selectedTeam.mood}</p>
          </div>
          <div className="stat-row">
            {selectedTeam.supporterStats.map((stat) => (
              <div className="mini-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="team-strip" aria-labelledby="supporter-team">
        <div className="section-heading compact">
          <span className="icon-box">
            <UsersRound size={18} />
          </span>
          <div>
            <p className="section-kicker">Supporter Team</p>
            <h2 id="supporter-team">Choose Your Theme</h2>
          </div>
        </div>
        <div className="team-picker" role="list">
          {teamThemes.map((team) => (
            <button
              aria-pressed={team.key === selectedTeamKey}
              className="team-chip"
              key={team.key}
              onClick={() =>
                store.set('/selectedTeamKey', team.key satisfies TeamKey)
              }
              type="button"
            >
              <span
                className="team-swatch"
                style={
                  {
                    '--swatch-primary': team.colors.primary,
                    '--swatch-secondary': team.colors.secondary,
                    '--swatch-accent': team.colors.accent,
                  } as CSSProperties
                }
              />
              <span>
                <strong>{team.code}</strong>
                {team.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="workspace-shell">
        <aside className="flow-rail" aria-label="Prediction workflow">
          <div className="flow-rail-header">
            <span>{selectedTeam.code}</span>
            <strong>Matchday Flow</strong>
          </div>
          <nav aria-label="Prediction workflow stages">
            {flowItems.map((item) => (
              <a href={item.href} key={item.label}>
                <span className="flow-icon">{item.icon}</span>
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.meta}</em>
                </span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="workspace-main">
          <section className="insight-band" id="predict">
            <div className="spotlight">
              <div>
                <p className="section-kicker">Matchday Command Center</p>
                <h2>
                  {getTeam(featuredMatch.home).name} vs{' '}
                  {getTeam(featuredMatch.away).name}
                </h2>
                <p>
                  Your supporter theme follows the team you choose, and match
                  actions move from prediction to draw, shipping, and review.
                </p>
              </div>
              <div className="spotlight-meter" aria-label="Theme intensity">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="receipt-panel">
              <div className="receipt-header">
                <ShieldCheck size={20} />
                <div>
                  <p className="section-kicker">Live State</p>
                  <h2>{lockedCount} Picks Locked</h2>
                </div>
              </div>
              <div className="receipt-list">
                <div className="receipt-line">
                  <span>Draws run</span>
                  <strong>{drawCount}</strong>
                </div>
                <div className="receipt-line">
                  <span>Fulfillment queues</span>
                  <strong>{predictionState.fulfillmentQueue.length}</strong>
                </div>
                <div className="receipt-line">
                  <span>Review batches</span>
                  <strong>{reviewCount}</strong>
                </div>
              </div>
            </div>
          </section>

          <JSONUIProvider registry={registry} store={store}>
            <Renderer spec={predictionSpec} registry={registry} />
          </JSONUIProvider>
        </div>
      </div>
    </main>
  )
}

export default App
