import { shirtConcepts, teamThemes, type TeamKey } from './worldCup.js'
import {
  getTournamentTeamCode,
  worldCupFixtures,
  type TournamentFixture,
} from './worldCupSchedule.js'

export type PrizeItemType =
  | 'supporter_wear'
  | 'culture_gift'
  | 'sponsor_product'
  | 'bonus_credit'

export type PrizeBundleItem = {
  country: string
  description: string
  label: string
  type: PrizeItemType
}

export type MatchPrizeBundle = {
  bonusPrizeLabel: string
  entrantGiftNote: string
  id: string
  items: PrizeBundleItem[]
  joinedCountSeed: number
  lifecycleCopy: string
  sponsorCampaignId: string
  sponsorName: string
  tag: string
  title: string
  winnerSlots: number
}

const supportedScheduleTeamToKey: Partial<Record<string, TeamKey>> = {
  Argentina: 'argentina',
  Brazil: 'brazil',
  England: 'england',
  France: 'france',
  Japan: 'japan',
  Morocco: 'morocco',
  Spain: 'spain',
  USA: 'usa',
}

const cultureGiftByTeam: Record<string, string> = {
  Argentina: 'mate-inspired pantry kit or alfajor-style snack box',
  Australia: 'Australian coffee or coastal snack sampler',
  Austria: 'Vienna-inspired wafer or cafe treat bundle',
  Belgium: 'Belgian chocolate or waffle-inspired snack box',
  Brazil: 'Brazilian coffee or tropical snack sampler',
  Canada: 'maple pantry item or local roaster sampler',
  Colombia: 'Colombian coffee or cacao-inspired gift',
  Croatia: 'Adriatic-inspired pantry or travel accessory',
  Egypt: 'Egyptian tea or spice-inspired pantry kit',
  England: 'English tea or biscuit-inspired watch-party box',
  France: 'French cafe treat or skincare-style sponsor sample',
  Germany: 'German pretzel snack or design-goods sampler',
  Ghana: 'Ghanaian cocoa or spice-inspired pantry gift',
  Japan: 'Japanese tea, snack, or stationery-inspired gift',
  Mexico: 'Mexican coffee, chocolate, or salsa-inspired kit',
  Morocco: 'Moroccan mint tea or spice-inspired pantry kit',
  Netherlands: 'Dutch cookie or design-goods sampler',
  Portugal: 'Portuguese coffee or custard-inspired treat box',
  'Saudi Arabia': 'Saudi dates or Arabic coffee-inspired kit',
  Senegal: 'Senegalese coffee or textile-inspired accessory',
  Spain: 'Spanish olive oil, saffron, or tapas-inspired gift',
  'South Korea': 'Korean snack or beauty-sample bundle',
  Türkiye: 'Turkish coffee or delight-inspired pantry box',
  Uruguay: 'mate-inspired pantry item or artisan snack',
  USA: 'host-city snack, travel, or retailer gift credit',
}

function getSupportedTeamKey(teamName: string) {
  return supportedScheduleTeamToKey[teamName] ?? null
}

function getSupporterWearItem(teamName: string): PrizeBundleItem {
  const teamKey = getSupportedTeamKey(teamName)

  if (!teamKey) {
    return {
      country: teamName,
      description:
        'A scarf-style or tee-style fan item inspired by colors and culture, with no official marks or federation branding.',
      label: `${teamName}-inspired independent fan item`,
      type: 'supporter_wear',
    }
  }

  const shirt = shirtConcepts[teamKey]

  return {
    country: teamName,
    description: `${shirt.conceptName}: ${shirt.motif}`,
    label: `${teamName}-inspired independent supporter shirt`,
    type: 'supporter_wear',
  }
}

function getCultureGiftItem(teamName: string): PrizeBundleItem {
  return {
    country: teamName,
    description:
      cultureGiftByTeam[teamName] ??
      `${teamName} culture-inspired snack, pantry, or home-goods item selected without official tournament marks.`,
    label: `${teamName} culture-inspired gift`,
    type: 'culture_gift',
  }
}

function getSponsorLabel(matchNumber: number) {
  const campaignNames = [
    'Matchday Featured Sponsor Placeholder',
    'Fan Drop Sponsor Placeholder',
    'Culture Box Sponsor Placeholder',
  ] as const

  return campaignNames[matchNumber % campaignNames.length]
}

export function getPrizeBundleForFixture(
  fixture: TournamentFixture,
): MatchPrizeBundle {
  const homeCode = getTournamentTeamCode(fixture.home)
  const awayCode = getTournamentTeamCode(fixture.away)
  const winnerSlots = 5 + (fixture.matchNumber % 6)
  const joinedCountSeed = 280 + fixture.matchNumber * 37
  const sponsorCampaignId = `campaign-match-${fixture.matchNumber}`
  const id = `bundle-match-${fixture.matchNumber}`

  return {
    bonusPrizeLabel: '$500 Amazon credit eligibility',
    entrantGiftNote:
      'Sponsors may choose to send culture-inspired gifts to more entrants after eligibility review; no prize is guaranteed.',
    id,
    items: [
      getSupporterWearItem(fixture.home),
      getSupporterWearItem(fixture.away),
      getCultureGiftItem(fixture.home),
      getCultureGiftItem(fixture.away),
      {
        country: 'Sponsor',
        description:
          'Sponsor-funded samples, vouchers, or digital perks selected for this match campaign.',
        label: 'Sponsor product samples or voucher',
        type: 'sponsor_product',
      },
      {
        country: 'United States',
        description:
          'Optional bonus draw eligibility for qualifying entries in this independent fan campaign.',
        label: '$500 Amazon credit eligibility',
        type: 'bonus_credit',
      },
    ],
    joinedCountSeed,
    lifecycleCopy:
      'Winners move from draw receipt to claim review, fulfillment queue, shipping update, and optional product review prompt.',
    sponsorCampaignId,
    sponsorName: getSponsorLabel(fixture.matchNumber),
    tag: `${homeCode}/${awayCode} sponsor-funded bundle`,
    title: `${fixture.home} vs ${fixture.away} fan prize bundle`,
    winnerSlots,
  }
}

export function getPrizeBundleForMatchNumber(matchNumber: number) {
  const fixture = worldCupFixtures.find(
    (candidate) => candidate.matchNumber === matchNumber,
  )

  return fixture ? getPrizeBundleForFixture(fixture) : null
}

export function getPrizeBundlesForFixtures(fixtures: TournamentFixture[]) {
  return fixtures.map((fixture) => ({
    fixture,
    prizeBundle: getPrizeBundleForFixture(fixture),
  }))
}

export function isSupportedPrizeShirtTeam(teamName: string) {
  return teamThemes.some((team) => team.key === getSupportedTeamKey(teamName))
}
