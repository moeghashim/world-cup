import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { Renderer, JSONUIProvider, type StateStore } from '@json-render/react'
import {
  ArrowLeft,
  BadgeDollarSign,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dice5,
  ExternalLink,
  FileText,
  FlaskConical,
  Gift,
  Handshake,
  Megaphone,
  Minus,
  PackageCheck,
  Palette,
  Plus,
  ShieldCheck,
  Shirt,
  Sparkles,
  Target,
  Ticket,
  UsersRound,
} from 'lucide-react'
import heroImage from './assets/world-cup-hero.png'
import brandLogo from './assets/winworldcup2026-logo.svg'
import argentinaPrizeImage from './assets/prizes/argentina-shirt.png'
import brazilPrizeImage from './assets/prizes/brazil-shirt.png'
import englandPrizeImage from './assets/prizes/england-shirt.png'
import francePrizeImage from './assets/prizes/france-shirt.png'
import japanPrizeImage from './assets/prizes/japan-shirt.png'
import moroccoPrizeImage from './assets/prizes/morocco-shirt.png'
import spainPrizeImage from './assets/prizes/spain-shirt.png'
import usaPrizeImage from './assets/prizes/usa-shirt.png'
import './App.css'
import agentsMd from '../AGENTS.md?raw'
import buildBlogMd from '../BUILD_BLOG.md?raw'
import designMd from '../DESIGN.md?raw'
import productMd from '../PRODUCT.md?raw'
import websiteFlowMd from '../WEBSITE_FLOW.md?raw'
import {
  getTeam,
  shirtConcepts,
  teamThemes,
  type TeamKey,
} from './data/worldCup'
import {
  formatFixtureDate,
  formatTimeET,
  getTournamentTeamCode,
  worldCupFixtures,
  type TournamentFixture,
} from './data/worldCupSchedule'
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

const experimentDocs = [
  {
    title: 'Build Blog',
    filename: 'BUILD_BLOG.md',
    purpose: 'Narrative article for how the project was built over time.',
    body: buildBlogMd,
  },
  {
    title: 'Agent Build Log',
    filename: 'AGENTS.md',
    purpose: 'Working agreement, architecture notes, completed work, and verification trail.',
    body: agentsMd,
  },
  {
    title: 'Product Context',
    filename: 'PRODUCT.md',
    purpose: 'Product flow, audience, principles, and MVP boundaries.',
    body: productMd,
  },
  {
    title: 'Website Flow',
    filename: 'WEBSITE_FLOW.md',
    purpose: 'Diagrams for the visitor journey, app architecture, draw flow, and tools used.',
    body: websiteFlowMd,
  },
  {
    title: 'Design Context',
    filename: 'DESIGN.md',
    purpose: 'Design direction, layout rules, theming guidance, and quality checklist.',
    body: designMd,
  },
] as const

const prizeImages: Record<TeamKey, string> = {
  brazil: brazilPrizeImage,
  argentina: argentinaPrizeImage,
  usa: usaPrizeImage,
  france: francePrizeImage,
  england: englandPrizeImage,
  spain: spainPrizeImage,
  morocco: moroccoPrizeImage,
  japan: japanPrizeImage,
}

const prizeDetails: Record<
  TeamKey,
  {
    headline: string
    drawCopy: string
    included: string[]
    printSpecs: string[]
    uiNotes: string[]
  }
> = {
  brazil: {
    headline: 'A canary-yellow supporter shirt built around street rhythm.',
    drawCopy:
      'Winners receive the Brazil-inspired shirt after their locked prediction qualifies for a draw.',
    included: [
      'Canary cotton tee',
      'Mosaic-wave print',
      'Free domestic shipping credit',
    ],
    printSpecs: ['Yellow base', 'Green mosaic artwork', 'Blue rhythm accents'],
    uiNotes: [
      'Use a bright prize card',
      'Show green/yellow swatches',
      'Avoid official kit striping',
    ],
  },
  argentina: {
    headline: 'A clean sky-and-horizon shirt for composed matchday energy.',
    drawCopy:
      'Winners receive the Argentina-inspired shirt with soft sky bands and a warm sun detail.',
    included: ['White cotton tee', 'Skyline artwork', 'Winner claim receipt'],
    printSpecs: ['White base', 'Pale-blue horizon bands', 'Gold sun accent'],
    uiNotes: [
      'Keep the card airy',
      'Prioritize negative space',
      'Avoid replica vertical stripes',
    ],
  },
  usa: {
    headline: 'A navy rally shirt with stadium lights and modular motion.',
    drawCopy:
      'Winners receive the USA-inspired shirt when their prediction ticket lands in the selected draw pool.',
    included: [
      'Navy cotton tee',
      'Stadium rally print',
      'Draw winner packaging insert',
    ],
    printSpecs: ['Navy base', 'Off-white type', 'Red motion geometry'],
    uiNotes: [
      'Use a dark preview surface',
      'Show red/navy controls',
      'Avoid exact flag layouts',
    ],
  },
  france: {
    headline: 'A refined blue shirt with art-deco motion and tricolor rhythm.',
    drawCopy:
      'Winners receive the France-inspired shirt as an independent supporter reward, not official team gear.',
    included: ['Deep-blue cotton tee', 'Art-deco line print', 'Claim confirmation'],
    printSpecs: ['Deep blue base', 'White speed lines', 'Red and gold accents'],
    uiNotes: [
      'Keep the UI restrained',
      'Use fine-line detail zooms',
      'Avoid rooster or crest symbols',
    ],
  },
  england: {
    headline: 'A white terrace shirt with abstract rose-petal movement.',
    drawCopy:
      'Winners receive the England-inspired shirt with supporter copy and abstract terrace linework.',
    included: ['White cotton tee', 'Rose-petal print', 'Winner order tracking'],
    printSpecs: ['White base', 'Red petal artwork', 'Navy terrace lines'],
    uiNotes: [
      'Use a clean white card',
      'Show red/navy swatches',
      'Avoid shields and heraldry',
    ],
  },
  spain: {
    headline: 'A red-and-gold shirt shaped by plaza tile and scarf rhythm.',
    drawCopy:
      'Winners receive the Spain-inspired shirt after their qualifying prediction enters the reward draw.',
    included: [
      'Red cotton tee',
      'Plaza-tile print',
      'Sponsor reward confirmation',
    ],
    printSpecs: ['Red base', 'Gold tile geometry', 'Burgundy motion strokes'],
    uiNotes: [
      'Use warm color bands',
      'Show tile motif closeups',
      'Avoid royal crest language',
    ],
  },
  morocco: {
    headline: 'A deep-red shirt with Atlas linework and zellige-inspired geometry.',
    drawCopy:
      'Winners receive the Morocco-inspired shirt with landscape and architectural pattern references.',
    included: [
      'Deep-red cotton tee',
      'Atlas mountain print',
      'Fulfillment-ready prize record',
    ],
    printSpecs: [
      'Red base',
      'Green mountain linework',
      'Sand and gold pattern detail',
    ],
    uiNotes: [
      'Use pattern-rich cards',
      'Show geometric border detail',
      'Avoid central crest stars',
    ],
  },
  japan: {
    headline: 'A minimal white shirt with brush motion, waves, and origami linework.',
    drawCopy:
      'Winners receive the Japan-inspired shirt after a qualifying draw result is selected.',
    included: ['White cotton tee', 'Brushstroke artwork', 'Winner claim instructions'],
    printSpecs: ['White base', 'Red sun-disc detail', 'Indigo brushstroke'],
    uiNotes: [
      'Keep the layout calm',
      'Use generous white space',
      'Avoid official badge framing',
    ],
  },
}

const sponsorshipTiers = [
  {
    name: 'Global Cup Partner',
    price: '$50,000',
    spots: '2 spots',
    signal: 'Tournament-wide sponsor presence',
    icon: Sparkles,
    featured: true,
    summary:
      'The flagship package for brands that want to sit across the whole World Cup prediction experience, not only one match window.',
    includes: [
      'Prominent sponsor placement on the website, prediction workspace, prize flow, and winner follow-up moments.',
      'Ten high-quality winner product review videos, captured after product delivery with a guided review prompt.',
      'Sponsor product gifts shipped to selected winners alongside the localized supporter shirt workflow.',
      'Featured sponsor story block with brand-safe product education, offer links, and campaign recap reporting.',
      'Priority category lockout review so direct competitors are not placed in the same top-tier sponsor position.',
    ],
    creative:
      'Best for national launches, hero product drops, travel, electronics, sportswear, food delivery, streaming, telecom, fintech, and fan-experience brands.',
  },
  {
    name: 'Matchday Featured Sponsor',
    price: '$10,000',
    spots: '10 spots',
    signal: 'Featured match or regional campaign',
    icon: Megaphone,
    featured: false,
    summary:
      'A high-visibility match package for sponsors that want a focused campaign around key fixtures, markets, or supporter communities.',
    includes: [
      'Featured placement on selected match cards, prediction receipts, and qualifying draw screens.',
      'Sponsor product gift or voucher included in the winner fulfillment queue for the assigned campaign.',
      'Three guided winner review prompts with photo/video-friendly questions and sponsor-approved talking points.',
      'Regional or team-theme targeting, such as host-city fans, language markets, or selected supporter teams.',
      'Post-campaign summary covering entries, qualified draws, winners, shipment status, and review completion.',
    ],
    creative:
      'Best for match launches, retail promotions, watch-party offers, product sampling, city activations, and market-specific brand moments.',
  },
  {
    name: 'Fan Drop Sponsor',
    price: '$5,000',
    spots: '30 spots',
    signal: 'Accessible product sampling package',
    icon: Gift,
    featured: false,
    summary:
      'A lighter package for brands that want to test demand, seed products, and reach fans without owning a full match campaign.',
    includes: [
      'Sponsor mention inside eligible draw pools, reward emails, and winner claim moments.',
      'Product gift, discount code, or digital perk attached to selected winner packages.',
      'One guided review prompt after delivery with optional product rating and quote capture.',
      'Basic sponsor recap with claimed entries, winner fulfillment state, and review response status.',
      'Upgrade path into Matchday Featured Sponsor if the campaign performs well.',
    ],
    creative:
      'Best for startups, local merchants, creator products, snacks, apps, merch, wellness, accessories, and digital offers.',
  },
] as const

const sponsorshipAddOns = [
  'Custom landing page for a sponsor product drop',
  'Extra winner review videos or short-form clips',
  'Localized email and SMS follow-up sequence',
  'Host-city or supporter-team targeting package',
  'Creator-style recap reel from winner submissions',
  'Sponsor dashboard export with campaign metrics',
]

function getPrizeTeamFromHash(hash: string): TeamKey | null {
  const slug = hash.match(/^#prizes\/([a-z]+)$/)?.[1]

  if (!slug) return null

  return teamThemes.some((team) => team.key === slug)
    ? (slug as TeamKey)
    : null
}

function getMarkdownExcerpt(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .slice(0, 7)
    .join('\n')
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

function clampScore(score: number) {
  return Math.max(0, Math.min(9, score))
}

type FixtureScorePrediction = {
  homeScore: number
  awayScore: number
  locked: boolean
}

const defaultFixtureScorePrediction: FixtureScorePrediction = {
  homeScore: 0,
  awayScore: 0,
  locked: false,
}

function getFixtureKickoffMs(fixture: TournamentFixture) {
  return new Date(`${fixture.date}T${fixture.timeET}:00-04:00`).getTime()
}

function getSoonestUpcomingFixtureDay(now = new Date()) {
  const sortedFixtures = [...worldCupFixtures].sort(
    (first, second) => getFixtureKickoffMs(first) - getFixtureKickoffMs(second),
  )
  const nowMs = now.getTime()
  const futureFixtures = sortedFixtures.filter(
    (fixture) => getFixtureKickoffMs(fixture) >= nowMs,
  )
  const firstFixture =
    futureFixtures[0] ?? sortedFixtures[sortedFixtures.length - 1]
  const fixturePool = futureFixtures.length ? futureFixtures : sortedFixtures
  const sameDayFixtures = fixturePool
    .filter((fixture) => fixture.date === firstFixture.date)
    .sort(
      (first, second) =>
        getFixtureKickoffMs(first) - getFixtureKickoffMs(second),
    )

  return {
    date: firstFixture.date,
    fixtures: sameDayFixtures,
  }
}

function getFixturePrediction(
  predictions: Record<number, FixtureScorePrediction>,
  matchNumber: number,
) {
  return {
    ...defaultFixtureScorePrediction,
    ...predictions[matchNumber],
  }
}

function updateFixtureScorePrediction(
  predictions: Record<number, FixtureScorePrediction>,
  fixture: TournamentFixture,
  side: 'home' | 'away',
  score: number,
) {
  const currentPrediction = getFixturePrediction(
    predictions,
    fixture.matchNumber,
  )

  return {
    ...predictions,
    [fixture.matchNumber]: {
      ...currentPrediction,
      [side === 'home' ? 'homeScore' : 'awayScore']: clampScore(score),
      locked: false,
    },
  }
}

function lockFixturePrediction(
  predictions: Record<number, FixtureScorePrediction>,
  fixture: TournamentFixture,
) {
  const currentPrediction = getFixturePrediction(
    predictions,
    fixture.matchNumber,
  )

  return {
    ...predictions,
    [fixture.matchNumber]: {
      ...currentPrediction,
      locked: true,
    },
  }
}

function getFixturePickLabel(
  fixture: TournamentFixture,
  prediction: FixtureScorePrediction,
) {
  if (prediction.homeScore > prediction.awayScore) return fixture.home
  if (prediction.awayScore > prediction.homeScore) return fixture.away

  return 'Draw'
}

function App() {
  const [activePrizeKey, setActivePrizeKey] = useState<TeamKey | null>(() =>
    getPrizeTeamFromHash(window.location.hash),
  )
  const [isExperimentView, setIsExperimentView] = useState(
    () => window.location.hash === '#experiment',
  )
  const [predictionState, setPredictionState] = useState<PredictionState>(
    initialPredictionState,
  )
  const [activeFixtureSlide, setActiveFixtureSlide] = useState(0)
  const [fixturePredictions, setFixturePredictions] = useState<
    Record<number, FixtureScorePrediction>
  >({})
  const store = usePredictionStore(predictionState, setPredictionState)
  const selectedTeamKey = predictionState.selectedTeamKey
  const selectedTeam = getTeam(selectedTeamKey)
  const selectedShirt = shirtConcepts[selectedTeamKey]
  const selectedPrize = prizeDetails[selectedTeamKey]

  useEffect(() => {
    const syncPrizeHash = () => {
      const hash = window.location.hash

      setActivePrizeKey(getPrizeTeamFromHash(hash))
      setIsExperimentView(hash === '#experiment')
    }

    syncPrizeHash()
    window.addEventListener('hashchange', syncPrizeHash)

    return () => window.removeEventListener('hashchange', syncPrizeHash)
  }, [])

  useEffect(() => {
    if (!activePrizeKey) return undefined

    const frame = window.requestAnimationFrame(() => {
      document.getElementById('prize-detail')?.scrollIntoView({
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activePrizeKey])

  const nextFixtureDay = useMemo(() => getSoonestUpcomingFixtureDay(), [])
  const sameDayFixtures = nextFixtureDay.fixtures
  const activeFixtureIndex =
    sameDayFixtures.length > 0
      ? ((activeFixtureSlide % sameDayFixtures.length) + sameDayFixtures.length) %
        sameDayFixtures.length
      : 0
  const activeFixture = sameDayFixtures[activeFixtureIndex] ?? worldCupFixtures[0]
  const activeFixturePrediction = getFixturePrediction(
    fixturePredictions,
    activeFixture.matchNumber,
  )
  const activeFixturePickLabel = getFixturePickLabel(
    activeFixture,
    activeFixturePrediction,
  )
  const sameDayHasSlider = sameDayFixtures.length > 1

  const fixtureLockedCount = Object.values(fixturePredictions).filter(
    (prediction) => prediction.locked,
  ).length
  const lockedCount =
    fixtureLockedCount +
    Object.values(predictionState.predictions).filter(
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
      href: '#teams',
      icon: <CalendarDays size={17} />,
      label: 'Teams',
      meta: '48-team field',
    },
    {
      href: '#draws',
      icon: <Dice5 size={17} />,
      label: 'Draw',
      meta: `${drawCount} complete`,
    },
    {
      href: '#prizes',
      icon: <Gift size={17} />,
      label: 'Prize',
      meta: 'Free shirt',
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

  if (isExperimentView) {
    return (
      <main className="app-shell" style={themeVars}>
        <header className="topbar">
          <a className="brand" href="#predict">
            <img
              alt="Win World Cup 2026"
              className="brand-logo"
              height="82"
              src={brandLogo}
              width="82"
            />
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#predictions">Fixtures</a>
            <a href="#teams">Teams</a>
            <a href="#prizes">Prizes</a>
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

        <ExperimentPage />
        <SiteFooter />
      </main>
    )
  }

  return (
    <main className="app-shell" style={themeVars}>
      <header className="topbar">
        <a className="brand" href="#predict">
          <img
            alt="Win World Cup 2026"
            className="brand-logo"
            height="82"
            src={brandLogo}
            width="82"
          />
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#predictions">Fixtures</a>
          <a href="#teams">Teams</a>
          <a href="#prizes">Prizes</a>
          <a href="#sponsors">Sponsors</a>
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
            <a className="secondary-action" href="#prizes">
              <Gift size={18} />
              <span>Free Shirt Prize</span>
            </a>
            <a className="secondary-action" href="#sponsors">
              <Handshake size={18} />
              <span>Sponsor Packages</span>
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
            <h2 id="supporter-team">Choose Your Team</h2>
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

      <section className="prize-home" id="prizes" aria-labelledby="prize-title">
        <div className="prize-home-heading">
          <div className="section-heading compact">
            <span className="icon-box">
              <Gift size={18} />
            </span>
            <div>
              <p className="section-kicker">Prize Draw</p>
              <h2 id="prize-title">Win The Team Shirt You Picked</h2>
            </div>
          </div>
          <p>
            Each qualified draw winner receives a free localized supporter shirt
            for their selected team. These are independent fan designs with no
            official tournament, federation, player, or sponsor branding.
          </p>
        </div>

        <div className="featured-prize">
          <div className="featured-prize-media">
            <img
              alt={`${selectedTeam.name} supporter shirt prize`}
              src={prizeImages[selectedTeamKey]}
            />
          </div>
          <div className="featured-prize-copy">
            <p className="section-kicker">{selectedTeam.name} Prize</p>
            <h3>{selectedShirt.conceptName}</h3>
            <p>{selectedPrize.headline}</p>
            <div className="prize-pill-row" aria-label="Selected prize colors">
              {[selectedShirt.base, selectedShirt.graphic, selectedShirt.accent].map(
                (color) => (
                  <span key={color} style={{ background: color }} />
                ),
              )}
            </div>
            <ul className="featured-prize-list">
              <li>
                <Shirt size={17} />
                <span>{selectedShirt.primaryCopy}</span>
              </li>
              <li>
                <Palette size={17} />
                <span>{selectedShirt.motif}</span>
              </li>
              <li>
                <ShieldCheck size={17} />
                <span>No official marks, crests, players, or sponsor logos.</span>
              </li>
            </ul>
            <div className="prize-actions">
              <a className="prize-action primary" href={`#prizes/${selectedTeamKey}`}>
                <span>View Team Prize</span>
                <ChevronRight size={17} />
              </a>
              <a className="prize-action secondary" href="#predictions">
                <Target size={17} />
                <span>Make Picks</span>
              </a>
            </div>
          </div>
        </div>

        <div className="prize-team-grid" aria-label="Team prize previews">
          {teamThemes.map((team) => {
            const shirt = shirtConcepts[team.key]

            return (
              <article className="prize-card" key={team.key}>
                <div
                  className="prize-card-media"
                  style={
                    {
                      '--prize-primary': team.colors.primary,
                      '--prize-secondary': team.colors.secondary,
                      '--prize-accent': team.colors.accent,
                    } as CSSProperties
                  }
                >
                  <img
                    alt={`${team.name} shirt prize preview`}
                    loading="lazy"
                    src={prizeImages[team.key]}
                  />
                </div>
                <div className="prize-card-copy">
                  <span>{team.code}</span>
                  <h3>{team.name}</h3>
                  <p>{shirt.conceptName}</p>
                  <a
                    className="prize-card-link"
                    href={`#prizes/${team.key}`}
                    onClick={() => store.set('/selectedTeamKey', team.key)}
                  >
                    <span>Prize Details</span>
                    <ChevronRight size={16} />
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className="sponsor-band"
        id="sponsors"
        aria-labelledby="sponsor-title"
      >
        <div className="sponsor-heading">
          <div className="section-heading compact">
            <span className="icon-box">
              <Handshake size={18} />
            </span>
            <div>
              <p className="section-kicker">Sponsor Packages</p>
              <h2 id="sponsor-title">Fund The Rewards Fans Remember</h2>
            </div>
          </div>
          <p>
            Sponsors fund match campaigns, winner product gifts, localized shirt
            drops, and post-delivery review prompts. Packages are designed for
            product sampling, media proof, and measurable fan engagement.
          </p>
        </div>

        <div className="sponsor-tier-grid" aria-label="Sponsorship tiers">
          {sponsorshipTiers.map((tier) => {
            const TierIcon = tier.icon

            return (
              <article
                className={`sponsor-tier ${tier.featured ? 'is-featured' : ''}`}
                key={tier.name}
              >
                <header className="sponsor-tier-header">
                  <span className="sponsor-tier-icon">
                    <TierIcon size={19} />
                  </span>
                  <div>
                    <p>{tier.signal}</p>
                    <h3>{tier.name}</h3>
                  </div>
                </header>
                <div className="sponsor-price-row">
                  <strong>{tier.price}</strong>
                  <span>{tier.spots}</span>
                </div>
                <p className="sponsor-summary">{tier.summary}</p>
                <ul className="sponsor-feature-list">
                  {tier.includes.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="sponsor-creative">{tier.creative}</p>
              </article>
            )
          })}
        </div>

        <div className="sponsor-addons">
          <div>
            <p className="section-kicker">Creative Add-ons</p>
            <h3>More Ways To Build The Campaign</h3>
            <p>
              Add-ons keep the core sponsorship packages simple while giving
              larger brands, agencies, and regional partners more room to shape
              the activation.
            </p>
          </div>
          <ul>
            {sponsorshipAddOns.map((addOn) => (
              <li key={addOn}>
                <BadgeDollarSign size={17} />
                <span>{addOn}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sponsor-compliance-note">
          <ShieldCheck size={18} />
          <p>
            Sponsor campaigns must stay separate from official tournament,
            federation, player, crest, and mascot marks. Prize, review, and
            fulfillment language should be reviewed before any live campaign.
          </p>
        </div>
      </section>

      {activePrizeKey ? (
        <PrizeDetailPage
          onSelectTeam={(teamKey) => store.set('/selectedTeamKey', teamKey)}
          teamKey={activePrizeKey}
        />
      ) : null}

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
          <section className="insight-band next-score-band" id="predict">
            <div className="next-score-slider-card">
              <div className="next-score-header">
                <div>
                  <p className="section-kicker">Soonest Upcoming Match</p>
                  <h2>
                    {activeFixture.home} vs {activeFixture.away}
                  </h2>
                  <p>
                    Predict the exact score before kickoff. Browse the rest of
                    the {formatFixtureDate(nextFixtureDay.date)} fixtures when
                    more than one match is scheduled that day.
                  </p>
                </div>
                <div className="match-slider-status">
                  <span className="next-match-badge">
                    Match {activeFixture.matchNumber}
                  </span>
                  {sameDayHasSlider ? (
                    <div
                      className="match-slider-controls"
                      aria-label={`${formatFixtureDate(
                        nextFixtureDay.date,
                      )} match slider`}
                    >
                      <button
                        aria-label="Previous match"
                        className="match-slide-button"
                        onClick={() =>
                          setActiveFixtureSlide((current) => current - 1)
                        }
                        type="button"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <span>
                        {activeFixtureIndex + 1} / {sameDayFixtures.length}
                      </span>
                      <button
                        aria-label="Next match"
                        className="match-slide-button"
                        onClick={() =>
                          setActiveFixtureSlide((current) => current + 1)
                        }
                        type="button"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                className="next-score-board"
                aria-label={`${activeFixture.home} ${activeFixturePrediction.homeScore}, ${activeFixture.away} ${activeFixturePrediction.awayScore}`}
              >
                <div className="next-score-team">
                  <span>{getTournamentTeamCode(activeFixture.home)}</span>
                  <strong>{activeFixturePrediction.homeScore}</strong>
                </div>
                <span className="next-score-separator">:</span>
                <div className="next-score-team away">
                  <span>{getTournamentTeamCode(activeFixture.away)}</span>
                  <strong>{activeFixturePrediction.awayScore}</strong>
                </div>
              </div>

              <div className="next-score-fields">
                <ScoreField
                  code={getTournamentTeamCode(activeFixture.home)}
                  label={activeFixture.home}
                  onChange={(score) =>
                    setFixturePredictions((previous) =>
                      updateFixtureScorePrediction(
                        previous,
                        activeFixture,
                        'home',
                        score,
                      ),
                    )
                  }
                  value={activeFixturePrediction.homeScore}
                />
                <ScoreField
                  code={getTournamentTeamCode(activeFixture.away)}
                  label={activeFixture.away}
                  onChange={(score) =>
                    setFixturePredictions((previous) =>
                      updateFixtureScorePrediction(
                        previous,
                        activeFixture,
                        'away',
                        score,
                      ),
                    )
                  }
                  value={activeFixturePrediction.awayScore}
                />
              </div>

              {sameDayHasSlider ? (
                <div className="match-slide-dots" role="tablist">
                  {sameDayFixtures.map((fixture, index) => (
                    <button
                      aria-label={`Show match ${fixture.matchNumber}: ${fixture.home} vs ${fixture.away}`}
                      aria-pressed={index === activeFixtureIndex}
                      className="match-slide-dot"
                      key={fixture.matchNumber}
                      onClick={() => setActiveFixtureSlide(index)}
                      type="button"
                    />
                  ))}
                </div>
              ) : null}

              <div className="next-score-actions">
                <div>
                  <span>Current pick</span>
                  <strong>
                    {activeFixturePickLabel} ·{' '}
                    {activeFixturePrediction.homeScore}-
                    {activeFixturePrediction.awayScore}
                  </strong>
                </div>
                <button
                  className={`next-lock-button ${
                    activeFixturePrediction.locked ? 'is-locked' : ''
                  }`}
                  onClick={() =>
                    setFixturePredictions((previous) =>
                      lockFixturePrediction(previous, activeFixture),
                    )
                  }
                  type="button"
                >
                  <ShieldCheck size={17} />
                  <span>
                    {activeFixturePrediction.locked
                      ? 'Score Locked'
                      : 'Lock Score'}
                  </span>
                </button>
              </div>
            </div>

            <aside className="score-stakes-panel">
              <div className="receipt-header">
                <ShieldCheck size={20} />
                <div>
                  <p className="section-kicker">Match Stakes</p>
                  <h2>Group {activeFixture.group}</h2>
                </div>
              </div>
              <div className="receipt-list">
                <div className="receipt-line">
                  <span>Kickoff</span>
                  <strong>
                    {formatFixtureDate(activeFixture.date)} ·{' '}
                    {formatTimeET(activeFixture.timeET)}
                  </strong>
                </div>
                <div className="receipt-line">
                  <span>Venue</span>
                  <strong>{activeFixture.venue.name}</strong>
                </div>
                <div className="receipt-line">
                  <span>City</span>
                  <strong>
                    {activeFixture.venue.city}, {activeFixture.venue.country}
                  </strong>
                </div>
                <div className="receipt-line">
                  <span>Match day</span>
                  <strong>
                    {sameDayFixtures.length}{' '}
                    {sameDayFixtures.length === 1 ? 'match' : 'matches'}
                  </strong>
                </div>
              </div>
            </aside>
          </section>

          <JSONUIProvider registry={registry} store={store}>
            <Renderer spec={predictionSpec} registry={registry} />
          </JSONUIProvider>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}

function ExperimentPage() {
  return (
    <section
      className="experiment-page"
      id="experiment"
      aria-labelledby="experiment-title"
    >
      <div className="experiment-heading">
        <span className="icon-box">
          <FlaskConical size={18} />
        </span>
        <div>
          <p className="section-kicker">Experiment</p>
          <h2 id="experiment-title">How This Was Built</h2>
          <p>
            This section keeps the working docs visible in the product so the
            build process can be reviewed alongside the match prediction
            experience.
          </p>
          <p>
            This project is being built with Codex Desktop App and{' '}
            <a href="https://projects.dev/" rel="noreferrer" target="_blank">
              projects.dev
              <ExternalLink size={13} />
            </a>
            .
          </p>
        </div>
      </div>

      <div className="experiment-doc-grid">
        {experimentDocs.map((doc) => (
          <article className="experiment-doc" key={doc.filename}>
            <header>
              <span>
                <FileText size={17} />
                {doc.filename}
              </span>
              <h3>{doc.title}</h3>
              <p>{doc.purpose}</p>
            </header>
            <pre aria-label={`${doc.filename} excerpt`}>
              {getMarkdownExcerpt(doc.body)}
            </pre>
            <details>
              <summary>
                <BookOpen size={16} />
                <span>Read Full File</span>
              </summary>
              <pre>{doc.body}</pre>
            </details>
          </article>
        ))}
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Win World Cup 2026</strong>
        <span>
          An experiment from{' '}
          <a href="https://10claws.com/" rel="noreferrer" target="_blank">
            10claws.com
            <ExternalLink size={13} />
          </a>
        </span>
      </div>
      <nav aria-label="Footer navigation">
        <a href="#experiment">Experiment</a>
        <a href="#predictions">Fixtures</a>
        <a href="#teams">Teams</a>
        <a href="#prizes">Prizes</a>
        <a href="#sponsors">Sponsors</a>
        <a href="#operations">Operations</a>
      </nav>
    </footer>
  )
}

function PrizeDetailPage({
  onSelectTeam,
  teamKey,
}: {
  onSelectTeam: (teamKey: TeamKey) => void
  teamKey: TeamKey
}) {
  const team = getTeam(teamKey)
  const shirt = shirtConcepts[teamKey]
  const prize = prizeDetails[teamKey]
  const detailStyle = {
    '--prize-primary': team.colors.primary,
    '--prize-secondary': team.colors.secondary,
    '--prize-accent': team.colors.accent,
    '--prize-ink': team.colors.ink,
    '--prize-soft': team.colors.soft,
  } as CSSProperties

  return (
    <section
      className="prize-detail-page"
      id="prize-detail"
      style={detailStyle}
      aria-labelledby={`prize-detail-${team.key}`}
    >
      <div className="prize-detail-toolbar">
        <a className="prize-back-link" href="#prizes">
          <ArrowLeft size={17} />
          <span>All Prizes</span>
        </a>
        <button
          className="prize-action secondary"
          onClick={() => onSelectTeam(teamKey)}
          type="button"
        >
          <UsersRound size={17} />
          <span>Select {team.code}</span>
        </button>
      </div>

      <div className="prize-detail-hero">
        <div className="prize-detail-image">
          <img
            alt={`${team.name} standalone supporter shirt prize`}
            src={prizeImages[teamKey]}
          />
        </div>

        <div className="prize-detail-copy">
          <p className="section-kicker">{team.name} Prize Page</p>
          <h2 id={`prize-detail-${team.key}`}>{shirt.conceptName}</h2>
          <p>{prize.headline}</p>
          <div className="prize-detail-callout">
            <Gift size={20} />
            <span>{prize.drawCopy}</span>
          </div>
          <div className="prize-actions">
            <a className="prize-action primary" href="#predictions">
              <Target size={17} />
              <span>Enter A Draw</span>
            </a>
            <a className="prize-action secondary" href="#rewards">
              <PackageCheck size={17} />
              <span>Fulfillment Flow</span>
            </a>
          </div>
        </div>
      </div>

      <div className="prize-detail-grid">
        <article className="prize-detail-panel">
          <span className="prize-panel-icon">
            <Shirt size={18} />
          </span>
          <h3>Winner Package</h3>
          <ul>
            {prize.included.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="prize-detail-panel">
          <span className="prize-panel-icon">
            <Palette size={18} />
          </span>
          <h3>Print Direction</h3>
          <ul>
            {prize.printSpecs.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="prize-detail-panel">
          <span className="prize-panel-icon">
            <Target size={18} />
          </span>
          <h3>Web UI Representation</h3>
          <ul>
            {prize.uiNotes.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="prize-detail-panel safety">
          <span className="prize-panel-icon">
            <ShieldCheck size={18} />
          </span>
          <h3>Safety Boundary</h3>
          <p>
            Independent fan design. No official team, tournament, federation,
            sponsor, player, mascot, trophy, crest, shield, or manufacturer
            branding is used or implied.
          </p>
        </article>
      </div>
    </section>
  )
}

function ScoreField({
  code,
  label,
  onChange,
  value,
}: {
  code: string
  label: string
  onChange: (score: number) => void
  value: number
}) {
  const inputId = `next-score-${code.toLowerCase()}`

  return (
    <div className="next-score-field">
      <label htmlFor={inputId}>
        <span>
          <strong>{code}</strong>
          {label}
        </span>
      </label>
      <div className="score-field-control">
        <button
          aria-label={`Decrease ${label} score`}
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          type="button"
        >
          <Minus size={16} />
        </button>
        <input
          aria-label={`${label} predicted goals`}
          id={inputId}
          inputMode="numeric"
          max={9}
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          value={value}
        />
        <button
          aria-label={`Increase ${label} score`}
          disabled={value >= 9}
          onClick={() => onChange(value + 1)}
          type="button"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export default App
