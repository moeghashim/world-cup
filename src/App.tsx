import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Renderer, JSONUIProvider, type StateStore } from '@json-render/react'
import {
  Activity,
  ArrowLeft,
  BadgeDollarSign,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dice5,
  ExternalLink,
  FileText,
  FlaskConical,
  Gauge,
  Gift,
  Handshake,
  ListChecks,
  Megaphone,
  Minus,
  MousePointerClick,
  PackageCheck,
  Palette,
  Plus,
  ShieldCheck,
  Shirt,
  Sparkles,
  Target,
  Ticket,
  TrendingUp,
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
import { initializeGoogleAnalytics } from './analytics'
import './App.css'
import agentsMd from '../AGENTS.md?raw'
import buildBlogMd from '../BUILD_BLOG.md?raw'
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

const aiBuildMetrics = {
  tokenTotal: '~2.9M',
  estimatedCost: '~$22',
  costLabel: 'API-equivalent estimate',
  note: 'Estimated from Codex build activity; not a billing receipt.',
} as const

const posthogDashboardUrl = 'https://us.posthog.com/dashboard'

const posthogDashboardMetrics = [
  {
    label: 'Acquisition',
    title: 'Supporter Visits',
    value: '$pageview',
    detail: 'Track page paths, referrers, selected team pages, and sponsor routes.',
    icon: MousePointerClick,
  },
  {
    label: 'Core Funnel',
    title: 'Prediction Conversion',
    value: '5 events',
    detail: 'Follow a visitor from first pick through locked receipt and draw entry.',
    icon: TrendingUp,
  },
  {
    label: 'Reward Flow',
    title: 'Prize Claims',
    value: '3 stages',
    detail: 'Monitor winner reveal, claim start, shipment queue, and review prompt.',
    icon: Gift,
  },
  {
    label: 'Operations',
    title: 'Fulfillment Health',
    value: 'Live queue',
    detail: 'Give sponsors a clean status readout for packages, shirts, and reviews.',
    icon: Gauge,
  },
] as const

const posthogFunnelSteps = [
  ['Visit match page', '$pageview', 'Route-level traffic by fixture, team, and campaign.'],
  ['Start prediction', 'prediction_started', 'Visitor selects a match or begins score entry.'],
  ['Lock receipt', 'prediction_locked', 'A draw receipt is created and committed.'],
  ['Enter draw', 'draw_entry_created', 'Correct prediction qualifies for match reward draw.'],
  ['Reveal result', 'draw_revealed', 'Participant sees winner, alternate, or not-selected state.'],
  ['Claim reward', 'reward_claim_started', 'Winner starts shirt and sponsor package claim.'],
] as const

const posthogEventPlan = [
  {
    area: 'Prediction',
    events: ['prediction_started', 'prediction_locked', 'score_changed'],
    owner: 'Frontend',
  },
  {
    area: 'Draw',
    events: ['draw_entry_created', 'draw_revealed', 'winner_selected'],
    owner: 'Draw engine',
  },
  {
    area: 'Prizes',
    events: ['prize_detail_viewed', 'reward_claim_started', 'shirt_selected'],
    owner: 'Rewards UI',
  },
  {
    area: 'Sponsors',
    events: ['sponsor_card_viewed', 'sponsor_cta_clicked', 'review_prompt_sent'],
    owner: 'Campaign ops',
  },
  {
    area: 'Fulfillment',
    events: ['fulfillment_queued', 'shipment_created', 'review_completed'],
    owner: 'Operations',
  },
] as const

const posthogSetupItems = [
  'Use the existing Projects.dev PostHog analytics resource and frontend-safe project token.',
  'Expose only VITE_POSTHOG_KEY and VITE_POSTHOG_HOST to the browser; keep personal API keys server-side.',
  'Install posthog-js or the PostHog web snippet after the final tracking policy is approved.',
  'Create a real PostHog dashboard with prediction funnel, route traffic, sponsor conversions, fulfillment queue, and review completion tiles.',
  'Add privacy copy before enabling session replay or person-level identity tracking.',
] as const

const technologyFlow = [
  {
    label: 'Build Agent',
    title: 'Codex Desktop App',
    detail:
      'Coordinates the local workspace, edits the product, verifies behavior, and updates the build artifact.',
    tools: ['OpenAI Codex', 'local app browser'],
  },
  {
    label: 'Source Control',
    title: 'GitHub',
    detail:
      'Stores commits, branches, pull requests, and the public review trail for each coherent build task.',
    tools: ['Git', 'GitHub CLI', 'PRs'],
  },
  {
    label: 'Deployment',
    title: 'Vercel',
    detail:
      'Serves the Vite app and uses a rewrite so clean page routes resolve on direct refresh.',
    tools: ['Vite build', 'vercel.json'],
  },
  {
    label: 'Frontend Runtime',
    title: 'React + TypeScript',
    detail:
      'Owns supporter team state, predictions, draw receipts, fulfillment status, and routed views.',
    tools: ['React', 'TypeScript', 'CSS variables'],
  },
  {
    label: 'Spec Layer',
    title: 'JSON-render',
    detail:
      'Composes controlled prediction, schedule, draw, reward, and operations sections from a typed catalog.',
    tools: ['@json-render/react', 'zod'],
  },
  {
    label: 'Infrastructure Planning',
    title: 'Stripe Projects',
    detail:
      'Tracks provider setup and future operational services without replacing contest or fulfillment rules.',
    tools: ['projects.dev', 'Stripe CLI'],
  },
  {
    label: 'Production Services',
    title: 'Providers',
    detail:
      'Planned services for analytics, auth, database, observability, shirts, sponsor kits, and reviews.',
    tools: ['PostHog', 'WorkOS', 'Neon', 'POD', '3PL'],
  },
] as const

const sectionRouteMap = {
  '/fixtures': 'predictions',
  '/teams': 'teams',
  '/draws': 'draws',
  '/shirts': 'shirts',
  '/rewards': 'rewards',
  '/operations': 'operations',
} as const

const pageTitleMap = {
  '/fixtures': {
    kicker: 'Fixtures',
    title: 'Pick, Score, Lock',
    copy: 'Predict match scores, lock receipts, and enter sponsor-funded draws when the result is right.',
  },
  '/teams': {
    kicker: 'Teams',
    title: 'Teams And Schedule',
    copy: 'Review all participating teams, groups, fixtures, kickoff times, and the selected supporter-team schedule.',
  },
  '/draws': {
    kicker: 'Draws',
    title: 'Match-Level Winner Draws',
    copy: 'Run deterministic winner reveals with eligible receipts, alternates, participant outcomes, and audit metadata.',
  },
  '/shirts': {
    kicker: 'Shirts',
    title: 'Localized Shirt Studio',
    copy: 'Preview independent supporter-shirt concepts that change with the team a visitor supports.',
  },
  '/rewards': {
    kicker: 'Rewards',
    title: 'Ship, Track, Review',
    copy: 'Move winners through sponsor packages, localized shirts, fulfillment queues, and post-delivery review prompts.',
  },
  '/operations': {
    kicker: 'Operations',
    title: 'POD, 3PL, And Provider Plan',
    copy: 'Review how shirt production, sponsor kits, infrastructure providers, and campaign operations fit together.',
  },
} as const

type SectionPath = keyof typeof sectionRouteMap

type RouteState = {
  activePrizeKey: TeamKey | null
  isExperimentView: boolean
  pathname: string
  sectionPath: SectionPath | null
}

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname

  return pathname.replace(/\/+$/, '')
}

function isTeamKey(value: string): value is TeamKey {
  return teamThemes.some((team) => team.key === value)
}

function getPrizeTeamFromPath(pathname: string): TeamKey | null {
  const slug = normalizePathname(pathname).match(/^\/prizes\/([a-z]+)$/)?.[1]

  return slug && isTeamKey(slug) ? slug : null
}

function getLegacyHashPath(hash: string) {
  const hashPathMap: Record<string, string> = {
    '#predictions': '/fixtures',
    '#teams': '/teams',
    '#draws': '/draws',
    '#prizes': '/prizes',
    '#shirts': '/shirts',
    '#sponsors': '/sponsors',
    '#rewards': '/rewards',
    '#operations': '/operations',
    '#posthog': '/posthog',
    '#analytics': '/posthog',
    '#experiment': '/experiment',
  }

  if (hashPathMap[hash]) return hashPathMap[hash]

  const prizeSlug = hash.match(/^#prizes\/([a-z]+)$/)?.[1]

  if (prizeSlug && isTeamKey(prizeSlug)) {
    return `/prizes/${prizeSlug}`
  }

  return null
}

function getCurrentRouteState(): RouteState {
  const legacyPath = getLegacyHashPath(window.location.hash)

  if (legacyPath) {
    window.history.replaceState(null, '', legacyPath)
  }

  const pathname = normalizePathname(window.location.pathname)
  const activePrizeKey = getPrizeTeamFromPath(pathname)
  const sectionPath =
    pathname in sectionRouteMap ? (pathname as SectionPath) : null

  return {
    activePrizeKey,
    isExperimentView: pathname === '/experiment',
    pathname,
    sectionPath,
  }
}

function getRoutePredictionSpec(sectionPath: SectionPath | null) {
  if (!sectionPath) return predictionSpec

  const sectionId = sectionRouteMap[sectionPath]
  const sectionElementId = Object.entries(predictionSpec.elements).find(
    ([, element]) =>
      'props' in element &&
      typeof element.props === 'object' &&
      element.props !== null &&
      'id' in element.props &&
      element.props.id === sectionId,
  )?.[0]

  if (!sectionElementId) return predictionSpec

  return {
    ...predictionSpec,
    elements: {
      ...predictionSpec.elements,
      experience: {
        ...predictionSpec.elements.experience,
        children: [sectionElementId],
      },
    },
  }
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
  const [routeState, setRouteState] = useState<RouteState>(() =>
    getCurrentRouteState(),
  )
  const [predictionState, setPredictionState] = useState<PredictionState>(
    () =>
      routeState.activePrizeKey
        ? { ...initialPredictionState, selectedTeamKey: routeState.activePrizeKey }
        : initialPredictionState,
  )
  const [activeFixtureSlide, setActiveFixtureSlide] = useState(0)
  const [fixturePredictions, setFixturePredictions] = useState<
    Record<number, FixtureScorePrediction>
  >({})
  const store = usePredictionStore(predictionState, setPredictionState)
  const selectedTeamKey = predictionState.selectedTeamKey
  const selectedTeam = getTeam(selectedTeamKey)
  const activePrizeKey = routeState.activePrizeKey
  const isExperimentView = routeState.isExperimentView
  const routePredictionSpec = useMemo(
    () => getRoutePredictionSpec(routeState.sectionPath),
    [routeState.sectionPath],
  )

  useEffect(() => {
    const syncRoute = () => setRouteState(getCurrentRouteState())

    syncRoute()
    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)

    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  useEffect(() => {
    const navigateToInternalPage = (event: MouseEvent) => {
      const target = event.target

      if (!(target instanceof Element)) return

      const anchor = target.closest<HTMLAnchorElement>('a[href^="/"]')

      if (!anchor || anchor.target || anchor.hasAttribute('download')) return

      const url = new URL(anchor.href)

      if (url.origin !== window.location.origin) return

      event.preventDefault()
      window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`)
      setRouteState(getCurrentRouteState())
      window.scrollTo({ top: 0 })
    }

    document.addEventListener('click', navigateToInternalPage)

    return () => {
      document.removeEventListener('click', navigateToInternalPage)
    }
  }, [])

  useEffect(() => {
    initializeGoogleAnalytics()
  }, [])

  useEffect(() => {
    if (!activePrizeKey) return undefined

    store.set('/selectedTeamKey', activePrizeKey)

    const frame = window.requestAnimationFrame(() => {
      document.getElementById('prize-detail')?.scrollIntoView({
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activePrizeKey, store])

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
      href: '/fixtures',
      icon: <Target size={17} />,
      label: 'Predict',
      meta: `${lockedCount} locked`,
    },
    {
      href: '/teams',
      icon: <CalendarDays size={17} />,
      label: 'Teams',
      meta: '48-team field',
    },
    {
      href: '/draws',
      icon: <Dice5 size={17} />,
      label: 'Draw',
      meta: `${drawCount} complete`,
    },
    {
      href: '/prizes',
      icon: <Gift size={17} />,
      label: 'Prize',
      meta: 'Free shirt',
    },
    {
      href: '/shirts',
      icon: <Shirt size={17} />,
      label: 'Personalize',
      meta: selectedTeam.code,
    },
    {
      href: '/rewards',
      icon: <PackageCheck size={17} />,
      label: 'Fulfill',
      meta: `${predictionState.fulfillmentQueue.length} queued`,
    },
    {
      href: '/operations',
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
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <ExperimentPage />
        <SiteFooter />
      </main>
    )
  }

  if (activePrizeKey) {
    return (
      <main className="app-shell" style={themeVars}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <PrizeDetailPage
          onSelectTeam={(teamKey) => store.set('/selectedTeamKey', teamKey)}
          teamKey={activePrizeKey}
        />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.pathname === '/prizes') {
    return (
      <main className="app-shell" style={themeVars}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <PrizeHomeSection
          onSelectTeam={(teamKey) => store.set('/selectedTeamKey', teamKey)}
          selectedTeamKey={selectedTeamKey}
        />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.pathname === '/sponsors') {
    return (
      <main className="app-shell" style={themeVars}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <SponsorSection />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.pathname === '/posthog') {
    return (
      <main className="app-shell" style={themeVars}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <PostHogDashboardPage />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.sectionPath) {
    const routeCopy = pageTitleMap[routeState.sectionPath]

    return (
      <main className="app-shell" style={themeVars}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />

        <section className="route-page-hero" aria-labelledby="route-page-title">
          <div className="section-heading">
            <span className="icon-box">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="section-kicker">{routeCopy.kicker}</p>
              <h1 id="route-page-title">{routeCopy.title}</h1>
              <p>{routeCopy.copy}</p>
            </div>
          </div>
        </section>

        <div className="workspace-shell route-workspace">
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
            <JSONUIProvider registry={registry} store={store}>
              <Renderer spec={routePredictionSpec} registry={registry} />
            </JSONUIProvider>
          </div>
        </div>

        <SiteFooter />
      </main>
    )
  }

  return (
    <main className="app-shell" style={themeVars}>
      <Topbar drawCount={drawCount} lockedCount={lockedCount} />

      <section className="hero-band" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">{selectedTeam.chant}</p>
          <h1 id="page-title">{selectedTeam.name} Match Picks</h1>
          <p className="hero-subtitle">
            Predict the match, enter sponsor-funded draws, unlock localized
            supporter shirts, and move winners into shipping and review flows.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="/fixtures">
              <Target size={18} />
              <span>Make Picks</span>
              <ChevronRight size={17} />
            </a>
            <a className="secondary-action" href="/prizes">
              <Gift size={18} />
              <span>Free Shirt Prize</span>
            </a>
            <a className="secondary-action" href="/sponsors">
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

      <PrizeHomeSection
        onSelectTeam={(teamKey) => store.set('/selectedTeamKey', teamKey)}
        selectedTeamKey={selectedTeamKey}
      />

      <SponsorSection />

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

function PrizeHomeSection({
  onSelectTeam,
  selectedTeamKey,
}: {
  onSelectTeam: (teamKey: TeamKey) => void
  selectedTeamKey: TeamKey
}) {
  const selectedTeam = getTeam(selectedTeamKey)
  const selectedShirt = shirtConcepts[selectedTeamKey]
  const selectedPrize = prizeDetails[selectedTeamKey]

  return (
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
            <a className="prize-action primary" href={`/prizes/${selectedTeamKey}`}>
              <span>View Team Prize</span>
              <ChevronRight size={17} />
            </a>
            <a className="prize-action secondary" href="/fixtures">
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
                  href={`/prizes/${team.key}`}
                  onClick={() => onSelectTeam(team.key)}
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
  )
}

function SponsorSection() {
  return (
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
  )
}

function PostHogDashboardPage() {
  return (
    <section
      className="posthog-dashboard"
      id="posthog"
      aria-labelledby="posthog-title"
    >
      <div className="posthog-dashboard-hero">
        <div className="section-heading compact">
          <span className="icon-box">
            <BarChart3 size={18} />
          </span>
          <div>
            <p className="section-kicker">PostHog Dashboard</p>
            <h1 id="posthog-title">Measure The Prediction Funnel</h1>
          </div>
        </div>
        <div>
          <p>
            This dashboard defines the PostHog view for visitor acquisition,
            prediction conversion, draw reveals, prize claims, sponsor reviews,
            and fulfillment health. It is the operational map for the real
            PostHog insights once event capture is enabled.
          </p>
          <div className="posthog-dashboard-actions">
            <a
              className="prize-action"
              href={posthogDashboardUrl}
              rel="noreferrer"
              target="_blank"
            >
              <BarChart3 size={17} />
              <span>Open PostHog</span>
              <ExternalLink size={15} />
            </a>
            <a className="prize-action secondary" href="/operations">
              <ShieldCheck size={17} />
              <span>Operations Plan</span>
            </a>
          </div>
        </div>
      </div>

      <div className="posthog-status-grid" aria-label="Dashboard metrics">
        {posthogDashboardMetrics.map((metric) => {
          const MetricIcon = metric.icon

          return (
            <article className="posthog-metric-card" key={metric.title}>
              <span className="posthog-metric-icon">
                <MetricIcon size={18} />
              </span>
              <p>{metric.label}</p>
              <h2>{metric.title}</h2>
              <strong>{metric.value}</strong>
              <span>{metric.detail}</span>
            </article>
          )
        })}
      </div>

      <div className="posthog-dashboard-layout">
        <article className="posthog-panel">
          <header>
            <Activity size={18} />
            <div>
              <p className="section-kicker">Main Funnel</p>
              <h2>Visitor To Reward Claim</h2>
            </div>
          </header>
          <ol className="posthog-funnel-list">
            {posthogFunnelSteps.map(([title, eventName, detail], index) => (
              <li className="posthog-funnel-step" key={eventName}>
                <span>{index + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <code>{eventName}</code>
                  <p>{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="posthog-panel">
          <header>
            <ListChecks size={18} />
            <div>
              <p className="section-kicker">Event Taxonomy</p>
              <h2>Dashboard Tiles To Build</h2>
            </div>
          </header>
          <div className="posthog-event-table" role="table">
            {posthogEventPlan.map((group) => (
              <div className="posthog-event-row" role="row" key={group.area}>
                <strong>{group.area}</strong>
                <span>{group.events.join(', ')}</span>
                <em>{group.owner}</em>
              </div>
            ))}
          </div>
        </article>
      </div>

      <aside className="posthog-setup-panel">
        <div>
          <p className="section-kicker">Setup State</p>
          <h2>Connected Through Projects.dev, Capture Still Pending</h2>
          <p>
            The PostHog account and analytics resource are present in the
            project state. The dashboard is ready as a tracking contract, but
            real product events should wait until the SDK, privacy copy, and
            production event names are approved.
          </p>
        </div>
        <ul className="posthog-setup-list">
          {posthogSetupItems.map((item) => (
            <li key={item}>
              <CheckCircle2 size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}

function Topbar({
  drawCount,
  lockedCount,
}: {
  drawCount: number
  lockedCount: number
}) {
  return (
    <div className="site-chrome">
      <AIBuildBanner />
      <header className="topbar">
        <a className="brand" href="/">
          <img
            alt="Win World Cup 2026"
            className="brand-logo"
            height="78"
            src={brandLogo}
            width="78"
          />
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="/fixtures">Fixtures</a>
          <a href="/teams">Teams</a>
          <a href="/prizes">Prizes</a>
          <a href="/sponsors">Sponsors</a>
          <a href="/rewards">Rewards</a>
          <a href="/operations">Operations</a>
          <a href="/posthog">Analytics</a>
        </nav>
        <button className="account-button" type="button">
          <Ticket size={17} />
          <span>
            {lockedCount} locked · {drawCount} draws
          </span>
        </button>
      </header>
    </div>
  )
}

function AIBuildBanner() {
  return (
    <aside className="ai-build-banner" aria-label="AI build disclosure">
      <div>
        <span className="ai-build-icon">
          <Sparkles size={17} />
        </span>
        <strong>Built entirely by AI</strong>
      </div>
      <dl aria-label="Estimated AI usage">
        <div>
          <dt>Total tokens</dt>
          <dd>{aiBuildMetrics.tokenTotal}</dd>
        </div>
        <div>
          <dt>Estimated cost</dt>
          <dd>{aiBuildMetrics.estimatedCost}</dd>
        </div>
      </dl>
      <span>{aiBuildMetrics.costLabel}</span>
      <em>{aiBuildMetrics.note}</em>
    </aside>
  )
}

function renderInlineMarkdown(text: string) {
  const inlineNodes: ReactNode[] = []
  const inlinePattern = /(\[[^\]]+\]\([^)]+\)|`[^`]+`)/g
  let lastIndex = 0

  text.replace(inlinePattern, (match, _capture, offset) => {
    if (offset > lastIndex) {
      inlineNodes.push(text.slice(lastIndex, offset))
    }

    if (match.startsWith('[')) {
      const linkMatch = match.match(/^\[([^\]]+)\]\(([^)]+)\)$/)

      if (linkMatch) {
        inlineNodes.push(
          <a
            href={linkMatch[2]}
            key={`${match}-${offset}`}
            rel="noreferrer"
            target={linkMatch[2].startsWith('http') ? '_blank' : undefined}
          >
            {linkMatch[1]}
          </a>,
        )
      }
    } else {
      inlineNodes.push(<code key={`${match}-${offset}`}>{match.slice(1, -1)}</code>)
    }

    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < text.length) {
    inlineNodes.push(text.slice(lastIndex))
  }

  return inlineNodes.length ? inlineNodes : [text]
}

function renderMarkdownHeading(
  level: number,
  content: string,
  key: string,
) {
  if (level === 1) return <h1 key={key}>{renderInlineMarkdown(content)}</h1>
  if (level === 2) return <h2 key={key}>{renderInlineMarkdown(content)}</h2>
  if (level === 3) return <h3 key={key}>{renderInlineMarkdown(content)}</h3>

  return <h4 key={key}>{renderInlineMarkdown(content)}</h4>
}

function MarkdownArticle({ markdown }: { markdown: string }) {
  const blocks: ReactNode[] = []
  const lines = markdown.split('\n')
  let index = 0
  let blockIndex = 0

  const isBlockStart = (line: string) =>
    /^#{1,6}\s+/.test(line) ||
    /^-\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^```/.test(line)

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const language = line.replace(/^```/, '').trim()
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      if (index < lines.length) index += 1

      blocks.push(
        <pre className="markdown-code" key={`code-${blockIndex}`}>
          <code data-language={language || undefined}>{codeLines.join('\n')}</code>
        </pre>,
      )
      blockIndex += 1
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)

    if (heading) {
      blocks.push(
        renderMarkdownHeading(
          Math.min(heading[1].length, 4),
          heading[2],
          `heading-${blockIndex}`,
        ),
      )
      blockIndex += 1
      index += 1
      continue
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = []

      while (index < lines.length && /^-\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^-\s+/, ''))
        index += 1
      }

      blocks.push(
        <ul key={`list-${blockIndex}`}>
          {items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      )
      blockIndex += 1
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []

      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''))
        index += 1
      }

      blocks.push(
        <ol key={`ordered-${blockIndex}`}>
          {items.map((item) => (
            <li key={item}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>,
      )
      blockIndex += 1
      continue
    }

    const paragraphLines: string[] = []

    while (
      index < lines.length &&
      lines[index].trim() &&
      !isBlockStart(lines[index])
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    blocks.push(
      <p key={`paragraph-${blockIndex}`}>
        {renderInlineMarkdown(paragraphLines.join(' '))}
      </p>,
    )
    blockIndex += 1
  }

  return <div className="markdown-article">{blocks}</div>
}

function TechnologyFlowChart() {
  return (
    <section
      className="technology-flow-card"
      aria-labelledby="technology-flow-title"
    >
      <div className="technology-flow-heading">
        <span className="icon-box">
          <Sparkles size={18} />
        </span>
        <div>
          <p className="section-kicker">Technology Flow</p>
          <h3 id="technology-flow-title">How The App Is Built And Operated</h3>
          <p>
            This flowchart focuses on the tools and services around the app, not
            the public website pages.
          </p>
        </div>
      </div>

      <div className="technology-flow-grid" role="list">
        {technologyFlow.map((item, index) => (
          <article className="technology-flow-node" key={item.title} role="listitem">
            <span className="technology-flow-step">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p>{item.label}</p>
            <h4>{item.title}</h4>
            <span>{item.detail}</span>
            <div aria-label={`${item.title} tools`}>
              {item.tools.map((tool) => (
                <em key={tool}>{tool}</em>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
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
          <h2 id="experiment-title">Build Blog</h2>
          <p>
            The Experiment page now keeps the public build article front and
            center, with the agent log preserved as a markdown file below.
          </p>
          <p>
            This project is being built with{' '}
            <a href="https://chatgpt.com/codex" rel="noreferrer" target="_blank">
              Codex
              <ExternalLink size={13} />
            </a>{' '}
            Desktop App by OpenAI and{' '}
            <a href="https://projects.dev/" rel="noreferrer" target="_blank">
              projects.dev
              <ExternalLink size={13} />
            </a>{' '}
            by Stripe without writing a single line of code.
          </p>
        </div>
      </div>

      <TechnologyFlowChart />

      <article className="build-blog-card" aria-label="Build blog article">
        <header className="build-blog-header">
          <span>
            <BookOpen size={18} />
            BUILD_BLOG.md
          </span>
          <h3>Public Build Article</h3>
          <p>
            A readable HTML version of the project story, decisions,
            verification trail, and next build steps.
          </p>
        </header>
        <MarkdownArticle markdown={buildBlogMd} />
      </article>

      <section className="agent-log-card" aria-labelledby="agent-log-title">
        <header>
          <span>
            <FileText size={18} />
            AGENTS.md
          </span>
          <h3 id="agent-log-title">Agent Log Markdown File</h3>
          <p>
            The working agreement, architecture notes, task history, and
            verification log stay available as the raw markdown source.
          </p>
        </header>
        <details>
          <summary>
            <BookOpen size={16} />
            <span>Open Agent Log</span>
          </summary>
          <pre>{agentsMd}</pre>
        </details>
      </section>
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
        <a href="/experiment">Experiment</a>
        <a href="/fixtures">Fixtures</a>
        <a href="/teams">Teams</a>
        <a href="/prizes">Prizes</a>
        <a href="/sponsors">Sponsors</a>
        <a href="/operations">Operations</a>
        <a href="/posthog">PostHog</a>
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
        <a className="prize-back-link" href="/prizes">
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
            <a className="prize-action primary" href="/fixtures">
              <Target size={17} />
              <span>Enter A Draw</span>
            </a>
            <a className="prize-action secondary" href="/rewards">
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
