import {
  type CSSProperties,
  type ReactNode,
  useCallback,
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
  Gift,
  Globe2,
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
import heroImage from './assets/world-cup-hero.jpg'
import brandLogo from './assets/winworldcup2026-logo.svg'
import argentinaPrizeImage from './assets/prizes/argentina-shirt.jpg'
import brazilPrizeImage from './assets/prizes/brazil-shirt.jpg'
import englandPrizeImage from './assets/prizes/england-shirt.jpg'
import francePrizeImage from './assets/prizes/france-shirt.jpg'
import japanPrizeImage from './assets/prizes/japan-shirt.jpg'
import moroccoPrizeImage from './assets/prizes/morocco-shirt.jpg'
import spainPrizeImage from './assets/prizes/spain-shirt.jpg'
import usaPrizeImage from './assets/prizes/usa-shirt.jpg'
import { captureAnalyticsEvent, initializeGoogleAnalytics, initializePostHog } from './analytics'
import {
  formatLocalizedNumber,
  I18nProvider,
  languageOptions,
  useI18n,
  type LanguageCode,
  type TranslationKey,
  type Translator,
} from './i18n'
import './App.css'
import agentsMd from '../AGENTS.md?raw'
import buildBlogMd from '../BUILD_BLOG.md?raw'
import {
  getPrizeBundleForFixture,
  type MatchPrizeBundle,
} from './data/homepagePrizeBundles'
import {
  getFixtureKickoffMs,
  getUpcomingHomepageFixtures,
} from './data/homepageFixtures'
import {
  emptyPredictionEntryForm,
  predictionEntryFormSchema,
  usStateCodes,
  type PredictionEntryForm,
  type PredictionEntryPayload,
} from './data/predictionEntry'
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
  type TournamentFixture,
} from './data/worldCupSchedule'
import {
  TEAM_SPONSORSHIP_PRICING,
  formatUsd,
  getFixtureOpponent,
  getTeamFixtureSummary,
  getTeamIdentityBySlug,
  getTeamSponsorshipMath,
  teamIdentities,
  teamIdentitiesByGroup,
  teamResearchSources,
  type TeamIdentity,
} from './data/teamIdentity'
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
    name: 'Website Sponsor',
    price: '$25,000',
    spots: '4 spots',
    signal: 'Homepage and site-wide visibility',
    icon: MousePointerClick,
    featured: false,
    summary:
      'A premium website package for brands that want always-on visibility across the homepage, prediction banner, prize pages, and sponsor discovery paths.',
    includes: [
      'Featured website placement in the homepage sponsor board, top prediction flow, and prize discovery surfaces.',
      'Sponsor badge attached to selected homepage match cards and prize bundle previews without using official team marks.',
      'Dedicated sponsor story panel with product education, offer links, and campaign-safe creative copy.',
      'Five winner product review prompts or short-form quote captures after delivery.',
      'Website performance recap covering views, prediction starts, entry volume, prize clicks, and review completion.',
    ],
    creative:
      'Best for brands that want persistent website reach before choosing specific match campaigns: apps, CPG, travel, creator tools, local services, and fan-commerce launches.',
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

const sponsorshipTierTranslationKeys = [
  'global',
  'website',
  'matchday',
  'fan',
] as const
const sponsorIncludeIndexes = [1, 2, 3, 4, 5] as const
const sponsorAddOnIndexes = [1, 2, 3, 4, 5, 6] as const

const sponsorshipBoardStats = [
  ['sponsor.board.packages', '4'],
  ['sponsor.board.entryPoint', 'sponsor.board.homepage'],
  ['sponsor.board.winnerSlots', '5-10'],
  ['sponsor.board.proof', 'sponsor.board.reviews'],
] as const

const aiBuildMetrics = {
  tokenTotal: '~5.3M',
  estimatedCost: '~$46',
  costLabel: 'API-equivalent estimate',
  note: 'Estimated from Codex build activity; not a billing receipt.',
} as const

const posthogResourceName = 'WorldCup'
const posthogEnvVars = [
  'WORLDCUP_API_KEY',
  'WORLDCUP_HOST',
  'WORLDCUP_PERSONAL_API_KEY',
] as const

const posthogDashboardMetrics = [
  {
    label: 'Traffic',
    title: 'Daily Visitors',
    value: 'Aggregate only',
    detail: 'Count daily unique visitors without showing identity, email, address, or session details.',
    icon: MousePointerClick,
  },
  {
    label: 'Audience',
    title: 'Number Of Signups',
    value: 'Aggregate only',
    detail: 'Show the total signup count only. No names, emails, phone numbers, or address data.',
    icon: UsersRound,
  },
  {
    label: 'Engagement',
    title: 'Number Of Predictions',
    value: 'Aggregate only',
    detail: 'Show locked prediction totals by day or match without receipt hashes or participant records.',
    icon: TrendingUp,
  },
  {
    label: 'Prize Status',
    title: 'No Winners',
    value: '0',
    detail: 'No winner names or winner records are exposed on this public dashboard.',
    icon: ShieldCheck,
  },
] as const

const posthogFunnelSteps = [
  ['Daily visitors', '$pageview', 'Aggregate unique visitor count by day.'],
  ['Number of signups', 'signup_completed', 'Aggregate signup count from approved signup events or server totals.'],
  ['Number of predictions', 'prediction_locked', 'Aggregate locked prediction count by day or match.'],
  ['No winners', 'winner_count', 'Display 0 until an approved winner workflow exists.'],
] as const

const posthogEventPlan = [
  {
    area: 'Names',
    events: ['first_name', 'last_name', 'full_name'],
    owner: 'Never expose',
  },
  {
    area: 'Contact',
    events: ['email', 'phone', 'address'],
    owner: 'Never expose',
  },
  {
    area: 'Receipts',
    events: ['receipt_hash', 'participant_id', 'session_id'],
    owner: 'Never expose',
  },
  {
    area: 'Raw Activity',
    events: ['raw events', 'session recordings', 'event payloads'],
    owner: 'Never expose',
  },
  {
    area: 'Winners',
    events: ['winner names', 'winner addresses', 'winner records'],
    owner: 'Never expose',
  },
] as const

const posthogSetupItems = [
  'Show only daily visitors, signup count, prediction count, and winner status.',
  'Keep all participant PII out of this page and out of browser-visible metric payloads.',
  'Use server-safe aggregate counts for signups and predictions when database data is available.',
  'Keep session replay and raw event inspection off this public dashboard.',
  'Leave winner count at 0 until the legal and fulfillment workflow is approved.',
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

function getPageTitleMap(t: Translator) {
  return {
    '/fixtures': {
      kicker: t('route.fixtures.kicker'),
      title: t('route.fixtures.title'),
      copy: t('route.fixtures.copy'),
    },
    '/teams': {
      kicker: t('route.teams.kicker'),
      title: t('route.teams.title'),
      copy: t('route.teams.copy'),
    },
    '/draws': {
      kicker: t('route.draws.kicker'),
      title: t('route.draws.title'),
      copy: t('route.draws.copy'),
    },
    '/shirts': {
      kicker: t('route.shirts.kicker'),
      title: t('route.shirts.title'),
      copy: t('route.shirts.copy'),
    },
    '/rewards': {
      kicker: t('route.rewards.kicker'),
      title: t('route.rewards.title'),
      copy: t('route.rewards.copy'),
    },
    '/operations': {
      kicker: t('route.operations.kicker'),
      title: t('route.operations.title'),
      copy: t('route.operations.copy'),
    },
  } as const
}

type SectionPath = keyof typeof sectionRouteMap

type RouteState = {
  activePrizeKey: TeamKey | null
  activeTeamSlug: string | null
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

function getTeamSlugFromPath(pathname: string) {
  const slug = normalizePathname(pathname).match(/^\/teams\/([a-z0-9-]+)$/)?.[1]

  return slug && getTeamIdentityBySlug(slug) ? slug : null
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

  const teamSlug = hash.match(/^#teams\/([a-z0-9-]+)$/)?.[1]

  if (teamSlug && getTeamIdentityBySlug(teamSlug)) {
    return `/teams/${teamSlug}`
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
  const activeTeamSlug = getTeamSlugFromPath(pathname)
  const sectionPath =
    pathname in sectionRouteMap ? (pathname as SectionPath) : null

  return {
    activePrizeKey,
    activeTeamSlug,
    isExperimentView: pathname === '/experiment',
    pathname,
    sectionPath,
  }
}

function localizePredictionSpec(
  spec: typeof predictionSpec,
  t: Translator,
): typeof predictionSpec {
  const sectionCopy: Record<
    string,
    {
      kicker: string
      title: string
    }
  > = {
    draws: {
      kicker: t('json.draws.kicker'),
      title: t('json.draws.title'),
    },
    operations: {
      kicker: t('json.operations.kicker'),
      title: t('json.operations.title'),
    },
    predictions: {
      kicker: t('json.predictions.kicker'),
      title: t('json.predictions.title'),
    },
    rewards: {
      kicker: t('json.rewards.kicker'),
      title: t('json.rewards.title'),
    },
    shirts: {
      kicker: t('json.shirts.kicker'),
      title: t('json.shirts.title'),
    },
    teams: {
      kicker: t('json.teams.kicker'),
      title: t('json.teams.title'),
    },
  }

  return {
    ...spec,
    elements: Object.fromEntries(
      Object.entries(spec.elements).map(([elementId, element]) => {
        if (
          'props' in element &&
          typeof element.props === 'object' &&
          element.props !== null &&
          'id' in element.props &&
          typeof element.props.id === 'string' &&
          sectionCopy[element.props.id]
        ) {
          return [
            elementId,
            {
              ...element,
              props: {
                ...element.props,
                ...sectionCopy[element.props.id],
              },
            },
          ]
        }

        return [elementId, element]
      }),
    ) as typeof predictionSpec.elements,
  }
}

function getRoutePredictionSpec(
  sectionPath: SectionPath | null,
  spec: typeof predictionSpec,
) {
  if (!sectionPath) return spec

  const sectionId = sectionRouteMap[sectionPath]
  const sectionElementId = Object.entries(spec.elements).find(
    ([, element]) =>
      'props' in element &&
      typeof element.props === 'object' &&
      element.props !== null &&
      'id' in element.props &&
      element.props.id === sectionId,
  )?.[0]

  if (!sectionElementId) return predictionSpec

  return {
    ...spec,
    elements: {
      ...spec.elements,
      experience: {
        ...spec.elements.experience,
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

type EntryFormErrors = Partial<Record<keyof PredictionEntryForm, string>>

type PredictionReceipt = {
  awayScore: number
  awayTeam: string
  createdAt: string
  homeScore: number
  homeTeam: string
  joinedCount: number
  matchNumber: number
  participantEmail: string
  persisted: boolean
  persistenceMessage?: string
  persistenceMode: string
  predictedOutcome: string
  prizeBundleTitle: string
  receiptHash: string
  receiptId: string
}

type PredictionEntryApiResponse = {
  createdAt: string
  error?: string
  joinedCount: number
  message?: string
  participantEmail: string
  persisted: boolean
  persistenceMode: string
  predictedOutcome: string
  receiptHash: string
  receiptId: string
}

const defaultFixtureScorePrediction: FixtureScorePrediction = {
  homeScore: 0,
  awayScore: 0,
  locked: false,
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

function getLocalizedPickLabel(label: string, t: Translator) {
  return label === 'Draw' ? t('hero.draw') : label
}

function getFixtureAnalyticsProperties(fixture: TournamentFixture) {
  return {
    match_id: `fixture-${fixture.matchNumber}`,
    match_number: fixture.matchNumber,
    group: fixture.group,
    home_team: fixture.home,
    away_team: fixture.away,
    kickoff_date: fixture.date,
    kickoff_time_et: fixture.timeET,
    venue_name: fixture.venue.name,
    venue_city: fixture.venue.city,
    venue_country: fixture.venue.country,
  }
}

function getHomepagePredictionAnalyticsProperties({
  fixture,
  language,
  prediction,
  prizeBundle,
  supporterTeamKey,
}: {
  fixture: TournamentFixture
  language?: LanguageCode
  prediction: FixtureScorePrediction
  prizeBundle: MatchPrizeBundle
  supporterTeamKey: TeamKey
}) {
  return {
    ...getFixtureAnalyticsProperties(fixture),
    predicted_away_score: prediction.awayScore,
    predicted_home_score: prediction.homeScore,
    predicted_outcome: getFixturePickLabel(fixture, prediction),
    prize_bundle_id: prizeBundle.id,
    sponsor_campaign_id: prizeBundle.sponsorCampaignId,
    supporter_team: supporterTeamKey,
    ...(language ? { language } : {}),
  }
}

function getFieldErrors(error: ReturnType<typeof predictionEntryFormSchema.safeParse>) {
  if (error.success) return {}

  return Object.fromEntries(
    Object.entries(error.error.flatten().fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0],
    ]),
  ) as EntryFormErrors
}

function AppContent() {
  const { direction, htmlLang, language, t } = useI18n()
  const [routeState, setRouteState] = useState<RouteState>(() =>
    getCurrentRouteState(),
  )
  const [predictionState, setPredictionState] = useState<PredictionState>(
    () =>
      routeState.activePrizeKey
        ? { ...initialPredictionState, selectedTeamKey: routeState.activePrizeKey }
        : initialPredictionState,
  )
  const [homepageReceiptCount, setHomepageReceiptCount] = useState(0)
  const store = usePredictionStore(predictionState, setPredictionState)
  const selectedTeamKey = predictionState.selectedTeamKey
  const selectedTeam = getTeam(selectedTeamKey)
  const activePrizeKey = routeState.activePrizeKey
  const activeTeamIdentity = routeState.activeTeamSlug
    ? getTeamIdentityBySlug(routeState.activeTeamSlug)
    : null
  const isExperimentView = routeState.isExperimentView
  const localizedPredictionSpec = useMemo(
    () => localizePredictionSpec(predictionSpec, t),
    [t],
  )
  const routePredictionSpec = useMemo(
    () => getRoutePredictionSpec(routeState.sectionPath, localizedPredictionSpec),
    [localizedPredictionSpec, routeState.sectionPath],
  )
  const pageTitleMap = useMemo(() => getPageTitleMap(t), [t])
  const localizedCount = useCallback(
    (count: number) => formatLocalizedNumber(count, language),
    [language],
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
    initializePostHog()
  }, [])

  useEffect(() => {
    if (!activePrizeKey) return undefined

    store.set('/selectedTeamKey', activePrizeKey)
    captureAnalyticsEvent('prize_detail_viewed', {
      language,
      team_key: activePrizeKey,
      team_name: getTeam(activePrizeKey).name,
      source: 'prize_detail_route',
    })

    const frame = window.requestAnimationFrame(() => {
      document.getElementById('prize-detail')?.scrollIntoView({
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activePrizeKey, language, store])

  const lockedCount =
    homepageReceiptCount +
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
      label: t('flow.predict.label'),
      meta: t('flow.predict.meta', { count: localizedCount(lockedCount) }),
    },
    {
      href: '/teams',
      icon: <CalendarDays size={17} />,
      label: t('flow.teams.label'),
      meta: t('flow.teams.meta'),
    },
    {
      href: '/draws',
      icon: <Dice5 size={17} />,
      label: t('flow.draw.label'),
      meta: t('flow.draw.meta', { count: localizedCount(drawCount) }),
    },
    {
      href: '/prizes',
      icon: <Gift size={17} />,
      label: t('flow.prize.label'),
      meta: t('flow.prize.meta'),
    },
    {
      href: '/shirts',
      icon: <Shirt size={17} />,
      label: t('flow.personalize.label'),
      meta: selectedTeam.code,
    },
    {
      href: '/rewards',
      icon: <PackageCheck size={17} />,
      label: t('flow.fulfill.label'),
      meta: t('flow.fulfill.meta', {
        count: localizedCount(predictionState.fulfillmentQueue.length),
      }),
    },
    {
      href: '/operations',
      icon: <ShieldCheck size={17} />,
      label: t('flow.review.label'),
      meta: t('flow.review.meta', { count: localizedCount(reviewCount) }),
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
  const shellProps = {
    className: 'app-shell',
    dir: direction,
    lang: htmlLang,
    style: themeVars,
  }

  const selectSupporterTeam = (
    teamKey: TeamKey,
    source: 'team_picker' | 'prize_card' | 'prize_detail',
  ) => {
    const team = getTeam(teamKey)

    store.set('/selectedTeamKey', teamKey)
    captureAnalyticsEvent('team_selected', {
      language,
      team_key: teamKey,
      team_name: team.name,
      team_code: team.code,
      source,
    })
  }

  if (isExperimentView) {
    return (
      <main {...shellProps}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <ExperimentPage />
        <SiteFooter />
      </main>
    )
  }

  if (activePrizeKey) {
    return (
      <main {...shellProps}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <PrizeDetailPage
          onSelectTeam={(teamKey) => selectSupporterTeam(teamKey, 'prize_detail')}
          teamKey={activePrizeKey}
        />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.pathname === '/prizes') {
    return (
      <main {...shellProps}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <PrizeHomeSection
          onSelectTeam={(teamKey) => selectSupporterTeam(teamKey, 'prize_card')}
          selectedTeamKey={selectedTeamKey}
        />
        <SiteFooter />
      </main>
    )
  }

  if (activeTeamIdentity) {
    return (
      <main {...shellProps}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <TeamDetailPage identity={activeTeamIdentity} />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.pathname === '/teams') {
    return (
      <main {...shellProps}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <TeamDirectoryPage />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.pathname === '/sponsors') {
    return (
      <main {...shellProps}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <SponsorSection />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.pathname === '/posthog') {
    return (
      <main {...shellProps}>
        <Topbar drawCount={drawCount} lockedCount={lockedCount} />
        <PostHogDashboardPage />
        <SiteFooter />
      </main>
    )
  }

  if (routeState.sectionPath) {
    const routeCopy = pageTitleMap[routeState.sectionPath]

    return (
      <main {...shellProps}>
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
          <aside className="flow-rail" aria-label={t('flow.aria')}>
            <div className="flow-rail-header">
              <span>{selectedTeam.code}</span>
              <strong>{t('flow.header')}</strong>
            </div>
            <nav aria-label={t('flow.stagesAria')}>
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
    <main {...shellProps}>
      <Topbar drawCount={drawCount} lockedCount={lockedCount} />

      <HeroPredictionArena
        onReceiptCountChange={setHomepageReceiptCount}
        selectedTeam={selectedTeam}
        selectedTeamKey={selectedTeamKey}
      />

      <section className="team-strip" aria-labelledby="supporter-team">
        <div className="section-heading compact">
          <span className="icon-box">
            <UsersRound size={18} />
          </span>
          <div>
            <p className="section-kicker">{t('team.kicker')}</p>
            <h2 id="supporter-team">{t('team.title')}</h2>
          </div>
        </div>
        <div className="team-picker" role="list">
          {teamThemes.map((team) => (
            <button
              aria-pressed={team.key === selectedTeamKey}
              className="team-chip"
              key={team.key}
              onClick={() =>
                selectSupporterTeam(team.key satisfies TeamKey, 'team_picker')
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
        onSelectTeam={(teamKey) => selectSupporterTeam(teamKey, 'prize_card')}
        selectedTeamKey={selectedTeamKey}
      />

      <SponsorSection />

      <div className="workspace-shell">
        <aside className="flow-rail" aria-label={t('flow.aria')}>
          <div className="flow-rail-header">
            <span>{selectedTeam.code}</span>
            <strong>{t('flow.header')}</strong>
          </div>
          <nav aria-label={t('flow.stagesAria')}>
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
            <Renderer spec={localizedPredictionSpec} registry={registry} />
          </JSONUIProvider>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}

const scheduleTeamKeyByName: Partial<Record<string, TeamKey>> = {
  Argentina: 'argentina',
  Brazil: 'brazil',
  England: 'england',
  France: 'france',
  Japan: 'japan',
  Morocco: 'morocco',
  Spain: 'spain',
  USA: 'usa',
}

const fallbackFixtureColors = {
  primary: '#31515a',
  secondary: '#f0c66a',
  accent: '#d95f43',
  ink: '#111812',
  soft: '#edf3ee',
} as const

function getFixtureVisualTeam(teamName: string) {
  const teamKey = scheduleTeamKeyByName[teamName]

  if (teamKey) return getTeam(teamKey)

  return {
    code: getTournamentTeamCode(teamName),
    colors: fallbackFixtureColors,
    name: teamName,
  }
}

function getFixtureStatusLabel(fixture: TournamentFixture, t: Translator) {
  const diffMs = getFixtureKickoffMs(fixture) - Date.now()

  if (diffMs <= 0) return t('hero.status.awaitingResult')

  const dayMs = 24 * 60 * 60 * 1000
  const hourMs = 60 * 60 * 1000

  if (diffMs >= dayMs) {
    const days = Math.ceil(diffMs / dayMs)

    return t(days === 1 ? 'hero.status.kickoffDay' : 'hero.status.kickoffDays', {
      count: days,
    })
  }

  const hours = Math.max(1, Math.ceil(diffMs / hourMs))

  return t(
    hours === 1 ? 'hero.status.kickoffHour' : 'hero.status.kickoffHours',
    {
      count: hours,
    },
  )
}

function HeroPredictionArena({
  onReceiptCountChange,
  selectedTeam,
  selectedTeamKey,
}: {
  onReceiptCountChange: (count: number) => void
  selectedTeam: ReturnType<typeof getTeam>
  selectedTeamKey: TeamKey
}) {
  const { language, t } = useI18n()
  const upcomingFixtures = useMemo(() => getUpcomingHomepageFixtures(8), [])
  const [activeMatchNumber, setActiveMatchNumber] = useState(
    () => upcomingFixtures[0]?.matchNumber ?? 1,
  )
  const [entryForm, setEntryForm] = useState<PredictionEntryForm>(
    emptyPredictionEntryForm,
  )
  const [entryFormErrors, setEntryFormErrors] = useState<EntryFormErrors>({})
  const [fixturePredictions, setFixturePredictions] = useState<
    Record<number, FixtureScorePrediction>
  >({})
  const [isEntryOpen, setIsEntryOpen] = useState(false)
  const [joinedCountOverrides, setJoinedCountOverrides] = useState<
    Record<number, number>
  >({})
  const [receipts, setReceipts] = useState<Record<number, PredictionReceipt>>({})
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'submitting' | 'error'
  >('idle')
  const [scorePulseSide, setScorePulseSide] = useState<'away' | 'home' | null>(
    null,
  )
  const pulseTimeoutRef = useRef<number | null>(null)

  const activeFixture =
    upcomingFixtures.find((fixture) => fixture.matchNumber === activeMatchNumber) ??
    upcomingFixtures[0]
  const activePrediction = useMemo(
    () => getFixturePrediction(fixturePredictions, activeFixture.matchNumber),
    [activeFixture.matchNumber, fixturePredictions],
  )
  const activePrizeBundle = useMemo(
    () => getPrizeBundleForFixture(activeFixture),
    [activeFixture],
  )
  const activeReceipt = receipts[activeFixture.matchNumber]
  const activePickLabel = getFixturePickLabel(activeFixture, activePrediction)
  const activePickDisplayLabel = getLocalizedPickLabel(activePickLabel, t)
  const activeSponsorName = activePrizeBundle.sponsorName.includes('Placeholder')
    ? t('hero.sponsorThisMatch')
    : activePrizeBundle.sponsorName
  const activeJoinedCount =
    activeReceipt?.joinedCount ??
    joinedCountOverrides[activeFixture.matchNumber] ??
    activePrizeBundle.joinedCountSeed
  const homeVisualTeam = getFixtureVisualTeam(activeFixture.home)
  const awayVisualTeam = getFixtureVisualTeam(activeFixture.away)
  const arenaStyle = {
    '--arena-home': homeVisualTeam.colors.primary,
    '--arena-away': awayVisualTeam.colors.primary,
    '--arena-home-soft': homeVisualTeam.colors.soft,
    '--arena-away-soft': awayVisualTeam.colors.soft,
    '--arena-accent': selectedTeam.colors.accent,
    '--arena-secondary': selectedTeam.colors.secondary,
  } as CSSProperties
  const activeAnalyticsProperties = useMemo(
    () =>
      getHomepagePredictionAnalyticsProperties({
        fixture: activeFixture,
        language,
        prediction: activePrediction,
        prizeBundle: activePrizeBundle,
        supporterTeamKey: selectedTeamKey,
      }),
    [activeFixture, activePrediction, activePrizeBundle, language, selectedTeamKey],
  )

  useEffect(() => {
    onReceiptCountChange(Object.keys(receipts).length)
  }, [onReceiptCountChange, receipts])

  useEffect(
    () => () => {
      if (pulseTimeoutRef.current) {
        window.clearTimeout(pulseTimeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    captureAnalyticsEvent('prize_bundle_viewed', {
      ...getFixtureAnalyticsProperties(activeFixture),
      language,
      prize_bundle_id: activePrizeBundle.id,
      sponsor_campaign_id: activePrizeBundle.sponsorCampaignId,
      supporter_team: selectedTeamKey,
      surface: 'homepage_prediction_hero',
    })
  }, [activeFixture, activePrizeBundle, language, selectedTeamKey])

  const updateEntryFormField = <K extends keyof PredictionEntryForm>(
    field: K,
    value: PredictionEntryForm[K],
  ) => {
    setEntryForm((current) => ({ ...current, [field]: value }))
    setEntryFormErrors((current) => ({ ...current, [field]: undefined }))
  }

  const selectFixture = (fixture: TournamentFixture) => {
    if (fixture.matchNumber === activeFixture.matchNumber) return

    const fixturePrediction = getFixturePrediction(
      fixturePredictions,
      fixture.matchNumber,
    )
    const prizeBundle = getPrizeBundleForFixture(fixture)

    setActiveMatchNumber(fixture.matchNumber)
    setSubmissionError(null)
    setSubmissionStatus('idle')
    captureAnalyticsEvent('homepage_match_selected', {
      ...getHomepagePredictionAnalyticsProperties({
        fixture,
        language,
        prediction: fixturePrediction,
        prizeBundle,
        supporterTeamKey: selectedTeamKey,
      }),
      surface: 'homepage_prediction_rail',
    })
  }

  const updateScore = (side: 'home' | 'away', score: number) => {
    if (activeReceipt) return

    const hadPrediction = Boolean(fixturePredictions[activeFixture.matchNumber])
    const clampedScore = clampScore(score)
    const nextPrediction = {
      ...activePrediction,
      [side === 'home' ? 'homeScore' : 'awayScore']: clampedScore,
      locked: false,
    }

    setFixturePredictions((previous) =>
      updateFixtureScorePrediction(previous, activeFixture, side, clampedScore),
    )
    setScorePulseSide(side)

    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current)
    }

    pulseTimeoutRef.current = window.setTimeout(() => {
      setScorePulseSide(null)
    }, 420)

    const analyticsProperties = getHomepagePredictionAnalyticsProperties({
      fixture: activeFixture,
      language,
      prediction: nextPrediction,
      prizeBundle: activePrizeBundle,
      supporterTeamKey: selectedTeamKey,
    })

    if (!hadPrediction) {
      captureAnalyticsEvent('prediction_started', {
        ...analyticsProperties,
        surface: 'homepage_prediction_hero',
      })
    }

    captureAnalyticsEvent('score_changed', {
      ...analyticsProperties,
      score: clampedScore,
      side,
      surface: 'homepage_prediction_hero',
    })
  }

  const openEntryForm = () => {
    if (activeReceipt) return

    setEntryFormErrors({})
    setSubmissionError(null)
    setSubmissionStatus('idle')
    setIsEntryOpen(true)
    captureAnalyticsEvent('prediction_entry_opened', {
      ...activeAnalyticsProperties,
      surface: 'homepage_prediction_hero',
    })
  }

  const submitEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formValidation = predictionEntryFormSchema.safeParse(entryForm)

    if (!formValidation.success) {
      setEntryFormErrors(getFieldErrors(formValidation))
      setSubmissionError(t('modal.errorCheck'))
      setSubmissionStatus('error')
      captureAnalyticsEvent('prediction_entry_failed', {
        ...activeAnalyticsProperties,
        failure_reason: 'client_validation',
        surface: 'homepage_prediction_hero',
      })
      return
    }

    const submittedFixture = activeFixture
    const submittedPrediction = activePrediction
    const submittedBundle = activePrizeBundle
    const submittedAnalyticsProperties = getHomepagePredictionAnalyticsProperties({
      fixture: submittedFixture,
      language,
      prediction: submittedPrediction,
      prizeBundle: submittedBundle,
      supporterTeamKey: selectedTeamKey,
    })
    const payload: PredictionEntryPayload = {
      participant: formValidation.data,
      prediction: {
        awayScore: submittedPrediction.awayScore,
        awayTeam: submittedFixture.away,
        homeScore: submittedPrediction.homeScore,
        homeTeam: submittedFixture.home,
        matchId: `fixture-${submittedFixture.matchNumber}`,
        matchNumber: submittedFixture.matchNumber,
        predictedOutcome: getFixturePickLabel(
          submittedFixture,
          submittedPrediction,
        ),
        prizeBundleId: submittedBundle.id,
        sponsorCampaignId: submittedBundle.sponsorCampaignId,
        supporterTeamKey: selectedTeamKey,
      },
    }

    setEntryFormErrors({})
    setSubmissionError(null)
    setSubmissionStatus('submitting')
    captureAnalyticsEvent('prediction_entry_submitted', {
      ...submittedAnalyticsProperties,
      surface: 'homepage_prediction_hero',
    })

    try {
      const response = await fetch('/api/prediction-entries', {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      const responseBody = (await response
        .json()
        .catch(() => null)) as PredictionEntryApiResponse | null

      if (!response.ok || !responseBody?.receiptHash) {
        throw new Error(
          responseBody?.error ??
            t('modal.errorRetry'),
        )
      }

      setFixturePredictions((previous) =>
        lockFixturePrediction(previous, submittedFixture),
      )
      setJoinedCountOverrides((current) => ({
        ...current,
        [submittedFixture.matchNumber]: responseBody.joinedCount,
      }))
      setReceipts((current) => ({
        ...current,
        [submittedFixture.matchNumber]: {
          awayScore: submittedPrediction.awayScore,
          awayTeam: submittedFixture.away,
          createdAt: responseBody.createdAt,
          homeScore: submittedPrediction.homeScore,
          homeTeam: submittedFixture.home,
          joinedCount: responseBody.joinedCount,
          matchNumber: submittedFixture.matchNumber,
          participantEmail: responseBody.participantEmail,
          persisted: responseBody.persisted,
          persistenceMessage: responseBody.message,
          persistenceMode: responseBody.persistenceMode,
          predictedOutcome: responseBody.predictedOutcome,
          prizeBundleTitle: submittedBundle.title,
          receiptHash: responseBody.receiptHash,
          receiptId: responseBody.receiptId,
        },
      }))
      setEntryForm(emptyPredictionEntryForm)
      setIsEntryOpen(false)
      setSubmissionStatus('idle')
      captureAnalyticsEvent('prediction_locked', {
        ...submittedAnalyticsProperties,
        persisted: responseBody.persisted,
        persistence_mode: responseBody.persistenceMode,
        surface: 'homepage_prediction_hero',
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('modal.errorRetry')

      setSubmissionError(message)
      setSubmissionStatus('error')
      captureAnalyticsEvent('prediction_entry_failed', {
        ...submittedAnalyticsProperties,
        failure_reason: 'server_submission',
        surface: 'homepage_prediction_hero',
      })
    }
  }

  return (
    <section
      className="hero-prediction-arena"
      style={arenaStyle}
      aria-labelledby="page-title"
      id="predict"
    >
      <div className="hero-prediction-grid">
        <article className="hero-match-panel">
          <header className="hero-match-header">
            <div>
              <p className="eyebrow">{selectedTeam.chant}</p>
              <h1 id="page-title">
                {t('hero.title', {
                  away: activeFixture.away,
                  home: activeFixture.home,
                })}
              </h1>
              <p>{t('hero.subtitle')}</p>
            </div>
            <div
              className="supporter-mini-panel"
              aria-label={t('hero.supporterModeAria')}
            >
              <span>{selectedTeam.code}</span>
              <strong>{selectedTeam.name}</strong>
              <em>{selectedTeam.mood}</em>
            </div>
          </header>

          <div
            className="hero-fixture-meta"
            aria-label={t('hero.selectedMatchDetailsAria')}
          >
            <span>{getFixtureStatusLabel(activeFixture, t)}</span>
            <span>
              {t('hero.match', { number: activeFixture.matchNumber })}
            </span>
            <span>{t('hero.group', { group: activeFixture.group })}</span>
            <span>
              {formatFixtureDate(activeFixture.date)} ·{' '}
              {formatTimeET(activeFixture.timeET)}
            </span>
            <span>
              {activeFixture.venue.city}, {activeFixture.venue.country}
            </span>
          </div>

          <div
            className="next-score-board hero-score-board"
            aria-label={t('hero.scoreAria', {
              away: activeFixture.away,
              awayScore: activePrediction.awayScore,
              home: activeFixture.home,
              homeScore: activePrediction.homeScore,
            })}
          >
            <div
              className={`next-score-team ${
                scorePulseSide === 'home' ? 'is-pulsing' : ''
              }`}
            >
              <span>{getTournamentTeamCode(activeFixture.home)}</span>
              <strong>{activePrediction.homeScore}</strong>
            </div>
            <span className="next-score-separator">:</span>
            <div
              className={`next-score-team away ${
                scorePulseSide === 'away' ? 'is-pulsing' : ''
              }`}
            >
              <span>{getTournamentTeamCode(activeFixture.away)}</span>
              <strong>{activePrediction.awayScore}</strong>
            </div>
          </div>

          <div className="hero-outcome-row">
            <div>
              <span>{t('hero.predictedOutcome')}</span>
              <strong>
                {activePickDisplayLabel} · {activePrediction.homeScore}-
                {activePrediction.awayScore}
              </strong>
            </div>
            <button
              className={`next-lock-button hero-lock-button ${
                activeReceipt ? 'is-locked' : ''
              }`}
              disabled={Boolean(activeReceipt)}
              onClick={openEntryForm}
              type="button"
            >
              <ShieldCheck size={17} />
              <span>
                {activeReceipt ? t('hero.entryReceived') : t('hero.lockPrediction')}
              </span>
            </button>
          </div>

          <div className="next-score-fields hero-score-fields">
            <ScoreField
              code={getTournamentTeamCode(activeFixture.home)}
              disabled={Boolean(activeReceipt)}
              label={activeFixture.home}
              onChange={(score) => updateScore('home', score)}
              value={activePrediction.homeScore}
            />
            <ScoreField
              code={getTournamentTeamCode(activeFixture.away)}
              disabled={Boolean(activeReceipt)}
              label={activeFixture.away}
              onChange={(score) => updateScore('away', score)}
              value={activePrediction.awayScore}
            />
          </div>

          {activeReceipt ? <PredictionReceiptPanel receipt={activeReceipt} /> : null}
        </article>

        <aside
          className="hero-prize-panel"
          key={activePrizeBundle.id}
          aria-label={t('hero.prizeBundleAria')}
        >
          <div className="receipt-header">
            <Gift size={20} />
            <div>
              <p className="section-kicker">{t('hero.sponsorPrizeBundle')}</p>
              <h2>{activePrizeBundle.title}</h2>
            </div>
          </div>

          <div className="hero-prize-stats">
            <div>
              <span>{t('hero.winners')}</span>
              <strong>{activePrizeBundle.winnerSlots}</strong>
            </div>
            <div>
              <span>{t('hero.joined')}</span>
              <strong>{formatLocalizedNumber(activeJoinedCount, language)}</strong>
            </div>
            <div>
              <span>{t('hero.sponsor')}</span>
              <strong>{activeSponsorName}</strong>
            </div>
          </div>

          <ul className="hero-prize-list">
            {activePrizeBundle.items.slice(0, 3).map((item) => (
              <li key={`${item.type}-${item.label}`}>
                <CheckCircle2 size={16} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="hero-prize-note">
            <ShieldCheck size={17} />
            <p>
              {activePrizeBundle.entrantGiftNote} {t('hero.guardrailNoteSuffix')}
            </p>
          </div>
        </aside>
      </div>

      <div className="hero-match-rail" aria-label={t('hero.upcomingAria')}>
        <div className="hero-rail-heading">
          <div>
            <p className="section-kicker">{t('hero.upcomingMatches')}</p>
            <h2>{t('hero.browseNearbyFixtures')}</h2>
          </div>
          <a className="prize-action secondary" href="/fixtures">
            <CalendarDays size={17} />
            <span>{t('hero.fullFixtures')}</span>
          </a>
        </div>
        <div className="hero-rail-list">
          {upcomingFixtures.map((fixture) => {
            const fixtureBundle = getPrizeBundleForFixture(fixture)
            const fixtureReceipt = receipts[fixture.matchNumber]
            const isActive = fixture.matchNumber === activeFixture.matchNumber

            return (
              <button
                aria-pressed={isActive}
                className="hero-rail-match"
                key={fixture.matchNumber}
                onClick={() => selectFixture(fixture)}
              type="button"
            >
                <span>{t('hero.match', { number: fixture.matchNumber })}</span>
                <strong>
                  {getTournamentTeamCode(fixture.home)} vs{' '}
                  {getTournamentTeamCode(fixture.away)}
                </strong>
                <em>
                  {formatFixtureDate(fixture.date)} ·{' '}
                  {t('hero.group', { group: fixture.group })}
                </em>
                <small>
                  {fixtureReceipt
                    ? t('hero.receiptSaved')
                    : t('hero.fixturePrizeMeta', {
                        count: fixtureBundle.winnerSlots,
                        tag: fixtureBundle.tag,
                      })}
                </small>
              </button>
            )
          })}
        </div>
      </div>

      {isEntryOpen ? (
        <PredictionEntryModal
          entryForm={entryForm}
          errors={entryFormErrors}
          fixture={activeFixture}
          onChange={updateEntryFormField}
          onClose={() => {
            if (submissionStatus === 'submitting') return
            setIsEntryOpen(false)
          }}
          onSubmit={submitEntry}
          prediction={activePrediction}
          prizeBundle={activePrizeBundle}
          submissionError={submissionError}
          submissionStatus={submissionStatus}
        />
      ) : null}
    </section>
  )
}

function PredictionReceiptPanel({ receipt }: { receipt: PredictionReceipt }) {
  const { t } = useI18n()
  const predictedOutcome = getLocalizedPickLabel(receipt.predictedOutcome, t)

  return (
    <aside className="hero-receipt-panel" aria-label={t('receipt.aria')}>
      <div className="receipt-header">
        <Ticket size={18} />
        <div>
          <p className="section-kicker">{t('receipt.kicker')}</p>
          <h2>{t('receipt.title')}</h2>
        </div>
      </div>
      <div className="receipt-list">
        <div className="receipt-line">
          <span>{t('receipt.match')}</span>
          <strong>
            {receipt.homeTeam} vs {receipt.awayTeam}
          </strong>
        </div>
        <div className="receipt-line">
          <span>{t('receipt.prediction')}</span>
          <strong>
            {predictedOutcome} · {receipt.homeScore}-{receipt.awayScore}
          </strong>
        </div>
        <div className="receipt-line">
          <span>{t('receipt.email')}</span>
          <strong>{receipt.participantEmail}</strong>
        </div>
        <div className="receipt-line">
          <span>{t('receipt.hash')}</span>
          <strong>{receipt.receiptHash}</strong>
        </div>
        <div className="receipt-line">
          <span>{t('receipt.prizeBundle')}</span>
          <strong>{receipt.prizeBundleTitle}</strong>
        </div>
      </div>
      <p>{t('receipt.followup')}</p>
      {!receipt.persisted ? (
        <p className="receipt-warning">
          {receipt.persistenceMessage ?? t('receipt.fallback')}
        </p>
      ) : null}
    </aside>
  )
}

type UpdateEntryFormField = <K extends keyof PredictionEntryForm>(
  field: K,
  value: PredictionEntryForm[K],
) => void

function PredictionEntryModal({
  entryForm,
  errors,
  fixture,
  onChange,
  onClose,
  onSubmit,
  prediction,
  prizeBundle,
  submissionError,
  submissionStatus,
}: {
  entryForm: PredictionEntryForm
  errors: EntryFormErrors
  fixture: TournamentFixture
  onChange: UpdateEntryFormField
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  prediction: FixtureScorePrediction
  prizeBundle: MatchPrizeBundle
  submissionError: string | null
  submissionStatus: 'idle' | 'submitting' | 'error'
}) {
  const { t } = useI18n()
  const predictionLabel = getFixturePickLabel(fixture, prediction)
  const predictionDisplayLabel = getLocalizedPickLabel(predictionLabel, t)
  const isSubmitting = submissionStatus === 'submitting'

  return (
    <div className="entry-modal-backdrop">
      <div
        aria-labelledby="prediction-entry-title"
        aria-modal="true"
        className="entry-modal"
        role="dialog"
      >
        <header className="entry-modal-header">
          <div>
            <p className="section-kicker">{t('modal.drawEntry')}</p>
            <h2 id="prediction-entry-title">{t('modal.title')}</h2>
            <p>{t('modal.copy')}</p>
          </div>
          <button
            aria-label={t('modal.closeAria')}
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            {t('modal.close')}
          </button>
        </header>

        <form className="entry-form" onSubmit={onSubmit}>
          <div className="entry-summary">
            <span>{t('hero.match', { number: fixture.matchNumber })}</span>
            <strong>
              {fixture.home} {prediction.homeScore} · {prediction.awayScore}{' '}
              {fixture.away}
            </strong>
            <em>
              {t('modal.summaryPrediction', {
                prediction: predictionDisplayLabel,
                sponsor: prizeBundle.sponsorName,
                winnerSlots: prizeBundle.winnerSlots,
              })}
            </em>
          </div>

          <div className="entry-form-grid">
            <EntryTextField
              autoComplete="given-name"
              error={errors.firstName}
              id="entry-first-name"
              label={t('modal.firstName')}
              onChange={(value) => onChange('firstName', value)}
              value={entryForm.firstName}
            />
            <EntryTextField
              autoComplete="family-name"
              error={errors.lastName}
              id="entry-last-name"
              label={t('modal.lastName')}
              onChange={(value) => onChange('lastName', value)}
              value={entryForm.lastName}
            />
            <EntryTextField
              autoComplete="email"
              error={errors.email}
              id="entry-email"
              label={t('modal.email')}
              onChange={(value) => onChange('email', value)}
              type="email"
              value={entryForm.email}
            />
            <EntryTextField
              autoComplete="tel"
              error={errors.phone}
              id="entry-phone"
              label={t('modal.phone')}
              onChange={(value) => onChange('phone', value)}
              type="tel"
              value={entryForm.phone}
            />
            <EntryTextField
              autoComplete="address-line1"
              error={errors.addressLine1}
              id="entry-address-line1"
              label={t('modal.address1')}
              onChange={(value) => onChange('addressLine1', value)}
              value={entryForm.addressLine1}
            />
            <EntryTextField
              autoComplete="address-line2"
              error={errors.addressLine2}
              id="entry-address-line2"
              label={t('modal.address2')}
              onChange={(value) => onChange('addressLine2', value)}
              required={false}
              value={entryForm.addressLine2 ?? ''}
            />
            <EntryTextField
              autoComplete="address-level2"
              error={errors.city}
              id="entry-city"
              label={t('modal.city')}
              onChange={(value) => onChange('city', value)}
              value={entryForm.city}
            />
            <label className={`entry-field ${errors.state ? 'has-error' : ''}`}>
              <span>{t('modal.state')}</span>
              <select
                autoComplete="address-level1"
                onChange={(event) =>
                  onChange('state', event.target.value as PredictionEntryForm['state'])
                }
                value={entryForm.state}
              >
                {usStateCodes.map((stateCode) => (
                  <option key={stateCode} value={stateCode}>
                    {stateCode}
                  </option>
                ))}
              </select>
              {errors.state ? <em>{errors.state}</em> : null}
            </label>
            <EntryTextField
              autoComplete="postal-code"
              error={errors.postalCode}
              id="entry-postal-code"
              label={t('modal.zip')}
              onChange={(value) => onChange('postalCode', value)}
              value={entryForm.postalCode}
            />
          </div>

          <div className="entry-consent-list">
            <label className={errors.rulesAccepted ? 'has-error' : ''}>
              <input
                checked={entryForm.rulesAccepted}
                onChange={(event) =>
                  onChange('rulesAccepted', event.target.checked)
                }
                type="checkbox"
              />
              <span>
                <strong>{t('modal.rulesStrong')}</strong>
                {t('modal.rulesCopy')}
              </span>
            </label>
            {errors.rulesAccepted ? <em>{errors.rulesAccepted}</em> : null}
            <label>
              <input
                checked={entryForm.marketingConsent}
                onChange={(event) =>
                  onChange('marketingConsent', event.target.checked)
                }
                type="checkbox"
              />
              <span>
                <strong>{t('modal.marketingStrong')}</strong>
                {t('modal.marketingCopy')}
              </span>
            </label>
          </div>

          {submissionError ? (
            <p className="entry-submit-error" role="alert">
              {submissionError}
            </p>
          ) : null}

          <div className="entry-modal-actions">
            <button disabled={isSubmitting} onClick={onClose} type="button">
              {t('modal.cancel')}
            </button>
            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Activity size={17} />
                  <span>{t('modal.submitting')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  <span>{t('modal.submit')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EntryTextField({
  autoComplete,
  error,
  id,
  label,
  onChange,
  required = true,
  type = 'text',
  value,
}: {
  autoComplete: string
  error?: string
  id: string
  label: string
  onChange: (value: string) => void
  required?: boolean
  type?: 'email' | 'tel' | 'text'
  value: string
}) {
  return (
    <label className={`entry-field ${error ? 'has-error' : ''}`} htmlFor={id}>
      <span>{label}</span>
      <input
        autoComplete={autoComplete}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
      {error ? <em>{error}</em> : null}
    </label>
  )
}

function PrizeHomeSection({
  onSelectTeam,
  selectedTeamKey,
}: {
  onSelectTeam: (teamKey: TeamKey) => void
  selectedTeamKey: TeamKey
}) {
  const { t } = useI18n()
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
            <p className="section-kicker">{t('prize.kicker')}</p>
            <h2 id="prize-title">{t('prize.title')}</h2>
          </div>
        </div>
        <p>{t('prize.copy')}</p>
      </div>

      <div className="featured-prize">
        <div className="featured-prize-media">
          <img
            alt={`${selectedTeam.name} supporter shirt prize`}
            src={prizeImages[selectedTeamKey]}
          />
        </div>
        <div className="featured-prize-copy">
          <p className="section-kicker">
            {t('prize.teamPrize', { team: selectedTeam.name })}
          </p>
          <h3>{selectedShirt.conceptName}</h3>
          <p>{selectedPrize.headline}</p>
          <div
            className="prize-pill-row"
            aria-label={t('prize.selectedColorsAria')}
          >
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
              <span>{t('prize.noOfficialMarks')}</span>
            </li>
          </ul>
          <div className="prize-actions">
            <a className="prize-action primary" href={`/prizes/${selectedTeamKey}`}>
              <span>{t('prize.viewTeamPrize')}</span>
              <ChevronRight size={17} />
            </a>
            <a className="prize-action secondary" href="/fixtures">
              <Target size={17} />
              <span>{t('prize.makePicks')}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="prize-team-grid" aria-label={t('prize.previewsAria')}>
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
                  <span>{t('prize.details')}</span>
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

function getSourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function TeamSponsorshipMathPanel({
  fixtureCount = TEAM_SPONSORSHIP_PRICING.groupStageMatches,
}: {
  fixtureCount?: number
}) {
  const math = getTeamSponsorshipMath(fixtureCount)

  return (
    <aside className="team-sponsor-math" aria-label="Team sponsorship math">
      <div>
        <p className="section-kicker">Sponsor Math</p>
        <h2>{formatUsd(math.teamPackageTotal)} Team Package</h2>
        <p>
          {fixtureCount} group matches x{' '}
          {formatUsd(TEAM_SPONSORSHIP_PRICING.matchSpotlightUsd)} match
          spotlight = {formatUsd(math.matchSpotlightTotal)}. Add {fixtureCount}{' '}
          reward drops x {formatUsd(TEAM_SPONSORSHIP_PRICING.rewardDropUsd)} ={' '}
          {formatUsd(math.rewardDropTotal)}.
        </p>
      </div>
      <dl>
        <div>
          <dt>Per match</dt>
          <dd>{formatUsd(math.matchActivationUsd)}</dd>
        </div>
        <div>
          <dt>Team group stage</dt>
          <dd>{formatUsd(math.teamPackageTotal)}</dd>
        </div>
        <div>
          <dt>Team-side slots</dt>
          <dd>{math.tournamentTeamSideSlots}</dd>
        </div>
      </dl>
      <p>
        Pricing is an MVP planning model. Product cost, shipping, taxes, legal
        review, creative production, and payment processing still need separate
        approval.
      </p>
    </aside>
  )
}

function TeamDirectoryPage() {
  const math = getTeamSponsorshipMath()

  return (
    <section
      className="team-directory-page"
      id="teams"
      aria-labelledby="team-directory-title"
    >
      <div className="team-directory-hero">
        <div>
          <p className="section-kicker">Teams</p>
          <h1 id="team-directory-title">All 48 Team Identities</h1>
          <p>
            Each team has a sponsor-safe identity line, a known-for statement,
            and a path to sponsor the whole team journey or specific group-stage
            games.
          </p>
        </div>
        <TeamSponsorshipMathPanel />
      </div>

      <div className="team-directory-stats" aria-label="Team catalog stats">
        <span>
          <strong>{teamIdentities.length}</strong>
          researched team pages
        </span>
        <span>
          <strong>{teamIdentitiesByGroup.length}</strong>
          groups
        </span>
        <span>
          <strong>{formatUsd(math.matchActivationUsd)}</strong>
          per game package
        </span>
        <span>
          <strong>{math.tournamentTeamSideSlots}</strong>
          team-side sponsor slots
        </span>
      </div>

      <section className="team-source-strip" aria-labelledby="team-source-title">
        <div>
          <p className="section-kicker">Research Basis</p>
          <h2 id="team-source-title">Nicknames, Fan Lines, And Guardrails</h2>
          <p>
            The catalog uses public nickname research plus stronger team or
            destination sources where available. Fan lines are independent site
            copy and do not imply official sponsorship.
          </p>
        </div>
        <div>
          {teamResearchSources.map((source) => (
            <a href={source.url} key={source.url} rel="noreferrer" target="_blank">
              <ExternalLink size={15} />
              <span>{source.label}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="team-group-directory">
        {teamIdentitiesByGroup.map((group) => (
          <section
            className="team-group-section"
            key={group.id}
            aria-labelledby={`team-group-${group.id}`}
          >
            <header>
              <div>
                <p className="section-kicker">Group {group.id}</p>
                <h2 id={`team-group-${group.id}`}>Sponsor The Group Story</h2>
              </div>
              <span>{group.teams.length} teams</span>
            </header>
            <div className="team-identity-grid">
              {group.teams.map((identity) => (
                <article className="team-identity-card" key={identity.slug}>
                  <div className="team-identity-card-top">
                    <span>{identity.code}</span>
                    <em>Group {identity.group}</em>
                  </div>
                  <h3>{identity.name}</h3>
                  <strong>{identity.supportLine}</strong>
                  <p className="team-known-as">{identity.knownAs}</p>
                  <p>{identity.knownFor}</p>
                  <div className="team-card-actions">
                    <a className="prize-action primary" href={`/teams/${identity.slug}`}>
                      <span>Open Team Page</span>
                      <ChevronRight size={16} />
                    </a>
                    <a className="prize-action secondary" href="/sponsors">
                      <Handshake size={16} />
                      <span>Sponsor {identity.code}</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function TeamDetailPage({ identity }: { identity: TeamIdentity }) {
  const fixtures = getTeamFixtureSummary(identity)
  const groupMath = getTeamSponsorshipMath(fixtures.length)
  const matchMath = getTeamSponsorshipMath(1)

  return (
    <section
      className="team-detail-page"
      aria-labelledby="team-detail-title"
      id={`team-${identity.slug}`}
    >
      <div className="team-detail-toolbar">
        <a className="prize-back-link" href="/teams">
          <ArrowLeft size={17} />
          <span>All Teams</span>
        </a>
        <a className="prize-action secondary" href="/sponsors">
          <Handshake size={17} />
          <span>Sponsor Packages</span>
        </a>
      </div>

      <div className="team-detail-hero">
        <div>
          <p className="section-kicker">Group {identity.group} Team</p>
          <h1 id="team-detail-title">{identity.name}</h1>
          <strong>{identity.supportLine}</strong>
          <p className="team-known-as">{identity.knownAs}</p>
          <p>{identity.knownFor}</p>
          <div className="team-detail-actions">
            <a className="prize-action primary" href="/sponsors">
              <BadgeDollarSign size={17} />
              <span>Sponsor {identity.name}</span>
            </a>
            <a className="prize-action secondary" href="/fixtures">
              <Target size={17} />
              <span>Predict Games</span>
            </a>
          </div>
        </div>
        <TeamSponsorshipMathPanel fixtureCount={fixtures.length} />
      </div>

      <div className="team-detail-layout">
        <article className="team-sponsor-invite">
          <div>
            <p className="section-kicker">Sponsor Invitation</p>
            <h2>Own The {identity.name} Fan Journey</h2>
            <p>
              Invite a sponsor to support {identity.name} fans across all{' '}
              {fixtures.length} group-stage games. The MVP planning package is{' '}
              {fixtures.length} x{' '}
              {formatUsd(TEAM_SPONSORSHIP_PRICING.matchSpotlightUsd)} for match
              spotlight placement plus {fixtures.length} x{' '}
              {formatUsd(TEAM_SPONSORSHIP_PRICING.rewardDropUsd)} for sponsor
              reward drops, totaling {formatUsd(groupMath.teamPackageTotal)}.
            </p>
          </div>
          <div className="team-sponsor-options">
            <span>
              <strong>{formatUsd(groupMath.teamPackageTotal)}</strong>
              Team group package
            </span>
            <span>
              <strong>{formatUsd(matchMath.matchActivationUsd)}</strong>
              Sponsor one game
            </span>
            <span>
              <strong>{formatUsd(TEAM_SPONSORSHIP_PRICING.rewardDropUsd)}</strong>
              Reward drop add-on
            </span>
          </div>
          <p>
            {identity.sponsorAngle} All creative must stay independent and avoid
            official federation, tournament, player, sponsor, mascot, trophy,
            crest, and kit marks unless rights are secured.
          </p>
        </article>

        <aside className="team-identity-notes">
          <p className="section-kicker">Known For</p>
          <h2>{identity.knownAs}</h2>
          <p>{identity.knownFor}</p>
          <ul>
            {identity.sourceUrls.map((url) => (
              <li key={url}>
                <ExternalLink size={15} />
                <a href={url} rel="noreferrer" target="_blank">
                  {getSourceHost(url)}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="team-fixture-sponsor-list" aria-labelledby="team-games-title">
        <div className="schedule-panel-heading">
          <div>
            <p className="section-kicker">Sponsor Certain Games</p>
            <h2 id="team-games-title">{identity.name} Group Fixtures</h2>
          </div>
          <span>{formatUsd(matchMath.matchActivationUsd)} per game</span>
        </div>
        <div className="team-fixture-grid">
          {fixtures.map((fixture) => {
            const opponent = getFixtureOpponent(fixture, identity.name)

            return (
              <article className="team-fixture-sponsor-card" key={fixture.matchNumber}>
                <header>
                  <span>Match {fixture.matchNumber}</span>
                  <strong>
                    {identity.code} vs {getTournamentTeamCode(opponent)}
                  </strong>
                </header>
                <p>
                  {formatFixtureDate(fixture.date)} · {formatTimeET(fixture.timeET)}
                </p>
                <p>
                  {fixture.venue.name}, {fixture.venue.city}
                </p>
                <dl>
                  <div>
                    <dt>Spotlight</dt>
                    <dd>{formatUsd(TEAM_SPONSORSHIP_PRICING.matchSpotlightUsd)}</dd>
                  </div>
                  <div>
                    <dt>Reward drop</dt>
                    <dd>{formatUsd(TEAM_SPONSORSHIP_PRICING.rewardDropUsd)}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>{formatUsd(matchMath.matchActivationUsd)}</dd>
                  </div>
                </dl>
                <a className="prize-action secondary" href="/sponsors">
                  <Handshake size={16} />
                  <span>Sponsor This Game</span>
                </a>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}

function SponsorSection() {
  const { t } = useI18n()
  const localizedSponsorshipTiers = sponsorshipTiers.map((tier, index) => {
    const tierKey = sponsorshipTierTranslationKeys[index]

    return {
      ...tier,
      creative: t(`sponsor.tier.${tierKey}.creative` as TranslationKey),
      includes: sponsorIncludeIndexes.map((includeIndex) =>
        t(`sponsor.tier.${tierKey}.include.${includeIndex}` as TranslationKey),
      ),
      name: t(`sponsor.tier.${tierKey}.name` as TranslationKey),
      signal: t(`sponsor.tier.${tierKey}.signal` as TranslationKey),
      spots: t(`sponsor.tier.${tierKey}.spots` as TranslationKey),
      summary: t(`sponsor.tier.${tierKey}.summary` as TranslationKey),
    }
  })
  const localizedSponsorshipAddOns = sponsorAddOnIndexes.map((addOnIndex) =>
    t(`sponsor.addon.${addOnIndex}` as TranslationKey),
  )

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
            <p className="section-kicker">{t('sponsor.kicker')}</p>
            <h2 id="sponsor-title">{t('sponsor.title')}</h2>
          </div>
        </div>
        <p>{t('sponsor.copy')}</p>
      </div>

      <div className="sponsor-board" aria-label={t('sponsor.boardAria')}>
        <div className="sponsor-board-strip">
          {sponsorshipBoardStats.map(([labelKey, value]) => (
            <div className="sponsor-board-stat" key={labelKey}>
              <span>{t(labelKey as TranslationKey)}</span>
              <strong>
                {value.startsWith('sponsor.')
                  ? t(value as TranslationKey)
                  : value}
              </strong>
            </div>
          ))}
        </div>

        <div className="sponsor-tier-grid" aria-label={t('sponsor.tiersAria')}>
          {localizedSponsorshipTiers.map((tier, index) => {
            const TierIcon = tier.icon

            return (
              <article
                className={`sponsor-tier ${tier.featured ? 'is-featured' : ''}`}
                key={tier.name}
              >
                <header className="sponsor-tier-header">
                  <div className="sponsor-tier-rank">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className="sponsor-tier-icon">
                      <TierIcon size={19} />
                    </span>
                  </div>
                  <div>
                    <p>{tier.signal}</p>
                    <h3>{tier.name}</h3>
                  </div>
                </header>
                <div className="sponsor-price-row">
                  <div>
                    <span>{t('sponsor.packageLabel')}</span>
                    <strong>{tier.price}</strong>
                  </div>
                  <div>
                    <span>{t('sponsor.availabilityLabel')}</span>
                    <strong>{tier.spots}</strong>
                  </div>
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
      </div>

      <div className="sponsor-addons">
        <div>
          <p className="section-kicker">{t('sponsor.addonsKicker')}</p>
          <h3>{t('sponsor.addonsTitle')}</h3>
          <p>{t('sponsor.addonsCopy')}</p>
        </div>
        <ul>
          {localizedSponsorshipAddOns.map((addOn) => (
            <li key={addOn}>
              <BadgeDollarSign size={17} />
              <span>{addOn}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sponsor-compliance-note">
        <ShieldCheck size={18} />
        <p>{t('sponsor.compliance')}</p>
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
            <p className="section-kicker">Dashboard</p>
            <h1 id="posthog-title">Public Campaign Snapshot</h1>
          </div>
        </div>
        <div>
          <p>
            A privacy-safe snapshot for the World Cup campaign: daily visitors,
            signups, predictions, and winner status. It exposes aggregate counts
            only and never shows private participant information.
          </p>
          <div className="posthog-dashboard-actions">
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
              <p className="section-kicker">Aggregate Sources</p>
              <h2>What This Dashboard May Show</h2>
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
              <p className="section-kicker">Privacy Rules</p>
              <h2>Never Show Private Data</h2>
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
          <h2>Public Aggregates Only</h2>
          <p>
            The new PostHog project resource is present in the Projects.dev
            state as <code>{posthogResourceName}</code>. The public dashboard
            should use only aggregate analytics and server-safe counts. Do not
            expose names, emails, phone numbers, addresses, receipt hashes, raw
            events, session recordings, or winner records.
          </p>
        </div>
        <div className="posthog-resource-panel" aria-label="PostHog resource">
          <span>Projects.dev Resource</span>
          <strong>{posthogResourceName}</strong>
          <p>
            Provisioned on the PostHog free analytics tier and kept as the only
            active PostHog analytics resource in the default environment.
          </p>
          <ul>
            {posthogEnvVars.map((envVar) => (
              <li key={envVar}>
                <code>{envVar}</code>
              </li>
            ))}
          </ul>
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
  const { language, t } = useI18n()

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
        <nav className="nav-links" aria-label={t('nav.primaryAria')}>
          <a href="/fixtures">{t('nav.fixtures')}</a>
          <a href="/teams">{t('nav.teams')}</a>
          <a href="/prizes">{t('nav.prizes')}</a>
          <a href="/sponsors">{t('nav.sponsors')}</a>
          <a href="/rewards">{t('nav.rewards')}</a>
          <a href="/operations">{t('nav.operations')}</a>
        </nav>
        <div className="topbar-actions">
          <LanguageSelector />
          <button className="account-button" type="button">
            <Ticket size={17} />
            <span>
              {t('nav.accountStatus', {
                drawCount: formatLocalizedNumber(drawCount, language),
                lockedCount: formatLocalizedNumber(lockedCount, language),
              })}
            </span>
          </button>
        </div>
      </header>
    </div>
  )
}

function LanguageSelector() {
  const { language, setLanguage, t } = useI18n()

  return (
    <label className="language-selector">
      <span className="language-selector-icon" aria-hidden="true">
        <Globe2 size={16} />
      </span>
      <span className="language-selector-label">
        {t('language.selector.shortLabel')}
      </span>
      <select
        aria-label={t('language.selector.label')}
        onChange={(event) => {
          const nextLanguage = event.target.value as LanguageCode

          if (nextLanguage === language) return

          captureAnalyticsEvent('language_changed', {
            language: nextLanguage,
            previous_language: language,
            surface: 'topbar',
          })
          setLanguage(nextLanguage)
        }}
        value={language}
      >
        {languageOptions.map((option) => (
          <option
            dir={option.direction}
            key={option.code}
            lang={option.htmlLang}
            value={option.code}
          >
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function AIBuildBanner() {
  const { t } = useI18n()

  return (
    <aside className="ai-build-banner" aria-label={t('ai.aria')}>
      <div>
        <span className="ai-build-icon">
          <Sparkles size={17} />
        </span>
        <strong>{t('ai.built')}</strong>
      </div>
      <dl aria-label={t('ai.usageAria')}>
        <div>
          <dt>{t('ai.totalTokens')}</dt>
          <dd>{aiBuildMetrics.tokenTotal}</dd>
        </div>
        <div>
          <dt>{t('ai.estimatedCost')}</dt>
          <dd>{aiBuildMetrics.estimatedCost}</dd>
        </div>
      </dl>
      <span>{t('ai.costLabel')}</span>
      <em>{t('ai.note')}</em>
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
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div>
        <strong>Win World Cup 2026</strong>
        <span>
          {t('footer.experimentCopy')}{' '}
          <a href="https://10claws.com/" rel="noreferrer" target="_blank">
            10claws.com
            <ExternalLink size={13} />
          </a>
        </span>
      </div>
      <nav aria-label={t('footer.aria')}>
        <a href="/experiment">{t('footer.experiment')}</a>
        <a href="/fixtures">{t('nav.fixtures')}</a>
        <a href="/teams">{t('nav.teams')}</a>
        <a href="/prizes">{t('nav.prizes')}</a>
        <a href="/sponsors">{t('nav.sponsors')}</a>
        <a href="/operations">{t('nav.operations')}</a>
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
  const { t } = useI18n()
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
          <span>{t('prize.allPrizes')}</span>
        </a>
        <button
          className="prize-action secondary"
          onClick={() => onSelectTeam(teamKey)}
          type="button"
        >
          <UsersRound size={17} />
          <span>{t('prize.selectTeam', { code: team.code })}</span>
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
          <p className="section-kicker">
            {t('prize.pageKicker', { team: team.name })}
          </p>
          <h2 id={`prize-detail-${team.key}`}>{shirt.conceptName}</h2>
          <p>{prize.headline}</p>
          <div className="prize-detail-callout">
            <Gift size={20} />
            <span>{prize.drawCopy}</span>
          </div>
          <div className="prize-actions">
            <a className="prize-action primary" href="/fixtures">
              <Target size={17} />
              <span>{t('prize.enterDraw')}</span>
            </a>
            <a className="prize-action secondary" href="/rewards">
              <PackageCheck size={17} />
              <span>{t('prize.fulfillmentFlow')}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="prize-detail-grid">
        <article className="prize-detail-panel">
          <span className="prize-panel-icon">
            <Shirt size={18} />
          </span>
          <h3>{t('prize.winnerPackage')}</h3>
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
          <h3>{t('prize.printDirection')}</h3>
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
          <h3>{t('prize.webRepresentation')}</h3>
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
          <h3>{t('prize.safetyBoundary')}</h3>
          <p>{t('prize.safetyCopy')}</p>
        </article>
      </div>
    </section>
  )
}

function ScoreField({
  code,
  disabled = false,
  label,
  onChange,
  value,
}: {
  code: string
  disabled?: boolean
  label: string
  onChange: (score: number) => void
  value: number
}) {
  const { t } = useI18n()
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
          aria-label={t('score.decrease', { label })}
          disabled={disabled || value <= 0}
          onClick={() => onChange(value - 1)}
          type="button"
        >
          <Minus size={16} />
        </button>
        <input
          aria-label={t('score.predictedGoals', { label })}
          id={inputId}
          inputMode="numeric"
          max={9}
          min={0}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          value={value}
        />
        <button
          aria-label={t('score.increase', { label })}
          disabled={disabled || value >= 9}
          onClick={() => onChange(value + 1)}
          type="button"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App
