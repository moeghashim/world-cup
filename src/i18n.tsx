/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export const languageOptions = [
  {
    code: 'en',
    direction: 'ltr',
    htmlLang: 'en',
    nativeLabel: 'English',
  },
  {
    code: 'ar',
    direction: 'rtl',
    htmlLang: 'ar',
    nativeLabel: 'العربية',
  },
  {
    code: 'fr',
    direction: 'ltr',
    htmlLang: 'fr',
    nativeLabel: 'Français',
  },
  {
    code: 'de',
    direction: 'ltr',
    htmlLang: 'de',
    nativeLabel: 'Deutsch',
  },
  {
    code: 'es',
    direction: 'ltr',
    htmlLang: 'es',
    nativeLabel: 'Español',
  },
  {
    code: 'pt',
    direction: 'ltr',
    htmlLang: 'pt',
    nativeLabel: 'Português',
  },
  {
    code: 'zh',
    direction: 'ltr',
    htmlLang: 'zh-Hans',
    nativeLabel: '中文',
  },
  {
    code: 'ko',
    direction: 'ltr',
    htmlLang: 'ko',
    nativeLabel: '한국어',
  },
] as const

export type LanguageCode = (typeof languageOptions)[number]['code']
export type LanguageDirection = (typeof languageOptions)[number]['direction']

type TranslationValues = Record<string, string | number>

const messages = {
  en: {
    'language.selector.label': 'Choose language',
    'language.selector.shortLabel': 'Language',
    'nav.primaryAria': 'Primary navigation',
    'nav.fixtures': 'Fixtures',
    'nav.teams': 'Teams',
    'nav.prizes': 'Prizes',
    'nav.sponsors': 'Sponsors',
    'nav.rewards': 'Rewards',
    'nav.operations': 'Operations',
    'nav.accountStatus': '{lockedCount} locked · {drawCount} draws',
    'ai.aria': 'AI build disclosure',
    'ai.usageAria': 'Estimated AI usage',
    'ai.built': 'Built entirely by AI',
    'ai.totalTokens': 'Total tokens',
    'ai.estimatedCost': 'Estimated cost',
    'ai.costLabel': 'API-equivalent estimate',
    'ai.note': 'Estimated from Codex build activity; not a billing receipt.',
    'route.fixtures.kicker': 'Fixtures',
    'route.fixtures.title': 'Pick, Score, Lock',
    'route.fixtures.copy':
      'Predict match scores, lock receipts, and enter sponsor-funded draws when the result is right.',
    'route.teams.kicker': 'Teams',
    'route.teams.title': 'Teams And Schedule',
    'route.teams.copy':
      'Review all participating teams, groups, fixtures, kickoff times, and the selected supporter-team schedule.',
    'route.draws.kicker': 'Draws',
    'route.draws.title': 'Match-Level Winner Draws',
    'route.draws.copy':
      'Run deterministic winner reveals with eligible receipts, alternates, participant outcomes, and audit metadata.',
    'route.shirts.kicker': 'Shirts',
    'route.shirts.title': 'Localized Shirt Studio',
    'route.shirts.copy':
      'Preview independent supporter-shirt concepts that change with the team a visitor supports.',
    'route.rewards.kicker': 'Rewards',
    'route.rewards.title': 'Ship, Track, Review',
    'route.rewards.copy':
      'Move winners through sponsor packages, localized shirts, fulfillment queues, and post-delivery review prompts.',
    'route.operations.kicker': 'Operations',
    'route.operations.title': 'POD, 3PL, And Provider Plan',
    'route.operations.copy':
      'Review how shirt production, sponsor kits, infrastructure providers, and campaign operations fit together.',
    'json.predictions.kicker': 'Prediction System',
    'json.predictions.title': 'Pick, Score, Lock',
    'json.teams.kicker': 'Tournament Snapshot',
    'json.teams.title': 'Teams And Group-Stage Schedule',
    'json.draws.kicker': 'Winner Draw',
    'json.draws.title': 'Run Match-Level Draws',
    'json.shirts.kicker': 'Localized Reward',
    'json.shirts.title': 'Supporter T-Shirt Studio',
    'json.rewards.kicker': 'After The Draw',
    'json.rewards.title': 'Ship, Track, Review',
    'json.operations.kicker': 'Operations',
    'json.operations.title': 'POD, 3PL, And Stripe Projects',
    'flow.aria': 'Prediction workflow',
    'flow.stagesAria': 'Prediction workflow stages',
    'flow.header': 'Matchday Flow',
    'flow.predict.label': 'Predict',
    'flow.predict.meta': '{count} locked',
    'flow.teams.label': 'Teams',
    'flow.teams.meta': '48-team field',
    'flow.draw.label': 'Draw',
    'flow.draw.meta': '{count} complete',
    'flow.prize.label': 'Prize',
    'flow.prize.meta': 'Free shirt',
    'flow.personalize.label': 'Personalize',
    'flow.fulfill.label': 'Fulfill',
    'flow.fulfill.meta': '{count} queued',
    'flow.review.label': 'Review',
    'flow.review.meta': '{count} sent',
    'hero.title': 'Predict {home} vs {away}',
    'hero.subtitle':
      'Set the score, lock a draw entry, and see the sponsor-funded prize bundle before leaving the first screen.',
    'hero.supporterModeAria': 'Supporter mode',
    'hero.selectedMatchDetailsAria': 'Selected match details',
    'hero.status.awaitingResult': 'Awaiting result snapshot',
    'hero.status.kickoffDay': 'Kickoff in {count} day',
    'hero.status.kickoffDays': 'Kickoff in {count} days',
    'hero.status.kickoffHour': 'Kickoff in {count} hour',
    'hero.status.kickoffHours': 'Kickoff in {count} hours',
    'hero.match': 'Match {number}',
    'hero.group': 'Group {group}',
    'hero.draw': 'Draw',
    'hero.scoreAria': '{home} {homeScore}, {away} {awayScore}',
    'hero.predictedOutcome': 'Predicted outcome',
    'hero.entryReceived': 'Entry Received',
    'hero.lockPrediction': 'Lock Prediction',
    'hero.prizeBundleAria': 'Prize bundle details',
    'hero.sponsorPrizeBundle': 'Sponsor Prize Bundle',
    'hero.winners': 'Winners',
    'hero.joined': 'Joined',
    'hero.sponsor': 'Sponsor',
    'hero.sponsorThisMatch': 'Sponsor this match',
    'hero.guardrailNoteSuffix':
      'Independent fan rewards only; no official team, tournament, federation, player, or sponsor marks are used.',
    'hero.upcomingAria': 'Upcoming match rail',
    'hero.upcomingMatches': 'Upcoming Matches',
    'hero.browseNearbyFixtures': 'Browse Nearby Fixtures',
    'hero.fullFixtures': 'Full Fixtures',
    'hero.receiptSaved': 'Receipt saved',
    'hero.fixturePrizeMeta': '{count} winners · {tag}',
    'receipt.aria': 'Prediction receipt',
    'receipt.kicker': 'Receipt',
    'receipt.title': 'Prediction Locked',
    'receipt.match': 'Match',
    'receipt.prediction': 'Prediction',
    'receipt.email': 'Email',
    'receipt.hash': 'Receipt hash',
    'receipt.prizeBundle': 'Prize bundle',
    'receipt.followup':
      'Watch for draw updates at this email. Shipping address is stored server-side for eligibility and sponsor gift review, and is not shown here.',
    'receipt.fallback':
      'This environment returned a non-persistent fallback receipt.',
    'modal.drawEntry': 'Draw Entry',
    'modal.title': 'Complete Your Prediction Entry',
    'modal.copy':
      'US shipping details are collected now because sponsors may choose to send gifts to more entrants after eligibility review.',
    'modal.close': 'Close',
    'modal.closeAria': 'Close entry form',
    'modal.summaryPrediction':
      'Prediction: {prediction} · {winnerSlots} winner slots · {sponsor}',
    'modal.firstName': 'First name',
    'modal.lastName': 'Last name',
    'modal.email': 'Email',
    'modal.phone': 'Phone',
    'modal.address1': 'Address line 1',
    'modal.address2': 'Address line 2',
    'modal.city': 'City',
    'modal.state': 'State',
    'modal.zip': 'ZIP code',
    'modal.rulesStrong': 'I am eligible and accept the rules/privacy terms.',
    'modal.rulesCopy':
      'This MVP is US-only and requires sponsor-safe prize review before any real campaign.',
    'modal.marketingStrong': 'Send optional sponsor and draw updates.',
    'modal.marketingCopy':
      'Consent is optional and does not affect entry eligibility.',
    'modal.errorCheck': 'Check the highlighted fields before submitting.',
    'modal.errorRetry': 'Prediction entry could not be saved. Please retry.',
    'modal.cancel': 'Cancel',
    'modal.submitting': 'Submitting',
    'modal.submit': 'Submit Entry',
    'team.kicker': 'Supporter Team',
    'team.title': 'Choose Your Team',
    'prize.kicker': 'Prize Draw',
    'prize.title': 'Win The Team Shirt You Picked',
    'prize.copy':
      'Each qualified draw winner receives a free localized supporter shirt for their selected team. These are independent fan designs with no official tournament, federation, player, or sponsor branding.',
    'prize.teamPrize': '{team} Prize',
    'prize.selectedColorsAria': 'Selected prize colors',
    'prize.noOfficialMarks':
      'No official marks, crests, players, or sponsor logos.',
    'prize.viewTeamPrize': 'View Team Prize',
    'prize.makePicks': 'Make Picks',
    'prize.previewsAria': 'Team prize previews',
    'prize.details': 'Prize Details',
    'prize.allPrizes': 'All Prizes',
    'prize.selectTeam': 'Select {code}',
    'prize.pageKicker': '{team} Prize Page',
    'prize.enterDraw': 'Enter A Draw',
    'prize.fulfillmentFlow': 'Fulfillment Flow',
    'prize.winnerPackage': 'Winner Package',
    'prize.printDirection': 'Print Direction',
    'prize.webRepresentation': 'Web UI Representation',
    'prize.safetyBoundary': 'Safety Boundary',
    'prize.safetyCopy':
      'Independent fan design. No official team, tournament, federation, sponsor, player, mascot, trophy, crest, shield, or manufacturer branding is used or implied.',
    'sponsor.kicker': 'Sponsor Packages',
    'sponsor.title': 'Fund The Rewards Fans Remember',
    'sponsor.copy':
      'Sponsors fund match campaigns, winner product gifts, localized shirt drops, and post-delivery review prompts. Packages are designed for product sampling, media proof, and measurable fan engagement.',
    'sponsor.tiersAria': 'Sponsorship tiers',
    'sponsor.addonsKicker': 'Creative Add-ons',
    'sponsor.addonsTitle': 'More Ways To Build The Campaign',
    'sponsor.addonsCopy':
      'Add-ons keep the core sponsorship packages simple while giving larger brands, agencies, and regional partners more room to shape the activation.',
    'sponsor.compliance':
      'Sponsor campaigns must stay separate from official tournament, federation, player, crest, and mascot marks. Prize, review, and fulfillment language should be reviewed before any live campaign.',
    'sponsor.tier.global.name': 'Global Cup Partner',
    'sponsor.tier.global.signal': 'Tournament-wide sponsor presence',
    'sponsor.tier.global.spots': '2 spots',
    'sponsor.tier.global.summary':
      'The flagship package for brands that want to sit across the whole World Cup prediction experience, not only one match window.',
    'sponsor.tier.global.creative':
      'Best for national launches, hero product drops, travel, electronics, sportswear, food delivery, streaming, telecom, fintech, and fan-experience brands.',
    'sponsor.tier.global.include.1':
      'Prominent sponsor placement on the website, prediction workspace, prize flow, and winner follow-up moments.',
    'sponsor.tier.global.include.2':
      'Ten high-quality winner product review videos, captured after product delivery with a guided review prompt.',
    'sponsor.tier.global.include.3':
      'Sponsor product gifts shipped to selected winners alongside the localized supporter shirt workflow.',
    'sponsor.tier.global.include.4':
      'Featured sponsor story block with brand-safe product education, offer links, and campaign recap reporting.',
    'sponsor.tier.global.include.5':
      'Priority category lockout review so direct competitors are not placed in the same top-tier sponsor position.',
    'sponsor.tier.matchday.name': 'Matchday Featured Sponsor',
    'sponsor.tier.matchday.signal': 'Featured match or regional campaign',
    'sponsor.tier.matchday.spots': '10 spots',
    'sponsor.tier.matchday.summary':
      'A high-visibility match package for sponsors that want a focused campaign around key fixtures, markets, or supporter communities.',
    'sponsor.tier.matchday.creative':
      'Best for match launches, retail promotions, watch-party offers, product sampling, city activations, and market-specific brand moments.',
    'sponsor.tier.matchday.include.1':
      'Featured placement on selected match cards, prediction receipts, and qualifying draw screens.',
    'sponsor.tier.matchday.include.2':
      'Sponsor product gift or voucher included in the winner fulfillment queue for the assigned campaign.',
    'sponsor.tier.matchday.include.3':
      'Three guided winner review prompts with photo/video-friendly questions and sponsor-approved talking points.',
    'sponsor.tier.matchday.include.4':
      'Regional or team-theme targeting, such as host-city fans, language markets, or selected supporter teams.',
    'sponsor.tier.matchday.include.5':
      'Post-campaign summary covering entries, qualified draws, winners, shipment status, and review completion.',
    'sponsor.tier.fan.name': 'Fan Drop Sponsor',
    'sponsor.tier.fan.signal': 'Accessible product sampling package',
    'sponsor.tier.fan.spots': '30 spots',
    'sponsor.tier.fan.summary':
      'A lighter package for brands that want to test demand, seed products, and reach fans without owning a full match campaign.',
    'sponsor.tier.fan.creative':
      'Best for startups, local merchants, creator products, snacks, apps, merch, wellness, accessories, and digital offers.',
    'sponsor.tier.fan.include.1':
      'Sponsor mention inside eligible draw pools, reward emails, and winner claim moments.',
    'sponsor.tier.fan.include.2':
      'Product gift, discount code, or digital perk attached to selected winner packages.',
    'sponsor.tier.fan.include.3':
      'One guided review prompt after delivery with optional product rating and quote capture.',
    'sponsor.tier.fan.include.4':
      'Basic sponsor recap with claimed entries, winner fulfillment state, and review response status.',
    'sponsor.tier.fan.include.5':
      'Upgrade path into Matchday Featured Sponsor if the campaign performs well.',
    'sponsor.addon.1': 'Custom landing page for a sponsor product drop',
    'sponsor.addon.2': 'Extra winner review videos or short-form clips',
    'sponsor.addon.3': 'Localized email and SMS follow-up sequence',
    'sponsor.addon.4': 'Host-city or supporter-team targeting package',
    'sponsor.addon.5': 'Creator-style recap reel from winner submissions',
    'sponsor.addon.6': 'Sponsor dashboard export with campaign metrics',
    'footer.experimentCopy': 'An experiment from',
    'footer.experiment': 'Experiment',
    'footer.aria': 'Footer navigation',
    'score.decrease': 'Decrease {label} score',
    'score.predictedGoals': '{label} predicted goals',
    'score.increase': 'Increase {label} score',
  },
  ar: {
    'language.selector.label': 'اختر اللغة',
    'language.selector.shortLabel': 'اللغة',
    'nav.primaryAria': 'التنقل الرئيسي',
    'nav.fixtures': 'المباريات',
    'nav.teams': 'الفرق',
    'nav.prizes': 'الجوائز',
    'nav.sponsors': 'الرعاة',
    'nav.rewards': 'المكافآت',
    'nav.operations': 'العمليات',
    'nav.accountStatus': '{lockedCount} مقفلة · {drawCount} سحوبات',
    'ai.aria': 'إفصاح بناء الذكاء الاصطناعي',
    'ai.usageAria': 'الاستخدام التقديري للذكاء الاصطناعي',
    'ai.built': 'بني بالكامل بالذكاء الاصطناعي',
    'ai.totalTokens': 'إجمالي الرموز',
    'ai.estimatedCost': 'التكلفة المقدرة',
    'ai.costLabel': 'تقدير مكافئ للـ API',
    'ai.note': 'تقدير من نشاط بناء Codex؛ وليس إيصال فوترة.',
    'route.fixtures.kicker': 'المباريات',
    'route.fixtures.title': 'اختر، سجل، ثبّت',
    'route.fixtures.copy':
      'توقع نتائج المباريات، وثبّت الإيصالات، وادخل سحوبات ممولة من الرعاة عندما تكون النتيجة صحيحة.',
    'route.teams.kicker': 'الفرق',
    'route.teams.title': 'الفرق والجدول',
    'route.teams.copy':
      'راجع كل الفرق المشاركة والمجموعات والمباريات وأوقات البداية وجدول فريقك المختار.',
    'route.draws.kicker': 'السحوبات',
    'route.draws.title': 'سحوبات الفائزين لكل مباراة',
    'route.draws.copy':
      'شغّل كشف فائزين حتميا مع الإيصالات المؤهلة والبدلاء ونتائج المشاركين وبيانات التدقيق.',
    'route.shirts.kicker': 'القمصان',
    'route.shirts.title': 'استوديو القمصان المحلية',
    'route.shirts.copy':
      'عاين أفكار قمصان مشجعين مستقلة تتغير حسب الفريق الذي يدعمه الزائر.',
    'route.rewards.kicker': 'المكافآت',
    'route.rewards.title': 'اشحن، تتبع، راجع',
    'route.rewards.copy':
      'انقل الفائزين عبر حزم الرعاة والقمصان المحلية وطوابير التنفيذ وطلبات المراجعة بعد التسليم.',
    'route.operations.kicker': 'العمليات',
    'route.operations.title': 'خطة POD و3PL والمزودين',
    'route.operations.copy':
      'راجع كيف تتكامل صناعة القمصان وحزم الرعاة ومزودو البنية التشغيلية وعمليات الحملات.',
    'json.predictions.kicker': 'نظام التوقعات',
    'json.predictions.title': 'اختر، سجل، ثبّت',
    'json.teams.kicker': 'لقطة البطولة',
    'json.teams.title': 'الفرق وجدول دور المجموعات',
    'json.draws.kicker': 'سحب الفائز',
    'json.draws.title': 'شغّل سحوبات كل مباراة',
    'json.shirts.kicker': 'مكافأة محلية',
    'json.shirts.title': 'استوديو قميص المشجع',
    'json.rewards.kicker': 'بعد السحب',
    'json.rewards.title': 'اشحن، تتبع، راجع',
    'json.operations.kicker': 'العمليات',
    'json.operations.title': 'POD و3PL وStripe Projects',
    'flow.aria': 'سير عمل التوقعات',
    'flow.stagesAria': 'مراحل سير عمل التوقعات',
    'flow.header': 'تدفق يوم المباراة',
    'flow.predict.label': 'توقع',
    'flow.predict.meta': '{count} مقفلة',
    'flow.teams.label': 'الفرق',
    'flow.teams.meta': 'حقل من 48 فريقا',
    'flow.draw.label': 'السحب',
    'flow.draw.meta': '{count} مكتملة',
    'flow.prize.label': 'الجائزة',
    'flow.prize.meta': 'قميص مجاني',
    'flow.personalize.label': 'خصص',
    'flow.fulfill.label': 'التنفيذ',
    'flow.fulfill.meta': '{count} في الطابور',
    'flow.review.label': 'المراجعة',
    'flow.review.meta': '{count} مرسلة',
    'hero.title': 'توقع {home} ضد {away}',
    'hero.subtitle':
      'حدد النتيجة، وثبّت مشاركة في السحب، وشاهد حزمة الجائزة الممولة من الرعاة قبل مغادرة الشاشة الأولى.',
    'hero.supporterModeAria': 'وضع المشجع',
    'hero.selectedMatchDetailsAria': 'تفاصيل المباراة المختارة',
    'hero.status.awaitingResult': 'في انتظار لقطة النتيجة',
    'hero.status.kickoffDay': 'البداية بعد {count} يوم',
    'hero.status.kickoffDays': 'البداية بعد {count} أيام',
    'hero.status.kickoffHour': 'البداية بعد {count} ساعة',
    'hero.status.kickoffHours': 'البداية بعد {count} ساعات',
    'hero.match': 'مباراة {number}',
    'hero.group': 'المجموعة {group}',
    'hero.draw': 'تعادل',
    'hero.scoreAria': '{home} {homeScore}، {away} {awayScore}',
    'hero.predictedOutcome': 'النتيجة المتوقعة',
    'hero.entryReceived': 'تم استلام المشاركة',
    'hero.lockPrediction': 'ثبّت التوقع',
    'hero.prizeBundleAria': 'تفاصيل حزمة الجائزة',
    'hero.sponsorPrizeBundle': 'حزمة جائزة الراعي',
    'hero.winners': 'الفائزون',
    'hero.joined': 'المشاركون',
    'hero.sponsor': 'الراعي',
    'hero.sponsorThisMatch': 'ارع هذه المباراة',
    'hero.guardrailNoteSuffix':
      'مكافآت مشجعين مستقلة فقط؛ لا تستخدم أي علامات رسمية لفريق أو بطولة أو اتحاد أو لاعب أو راع.',
    'hero.upcomingAria': 'شريط المباريات القادمة',
    'hero.upcomingMatches': 'المباريات القادمة',
    'hero.browseNearbyFixtures': 'تصفح المباريات القريبة',
    'hero.fullFixtures': 'كل المباريات',
    'hero.receiptSaved': 'تم حفظ الإيصال',
    'hero.fixturePrizeMeta': '{count} فائزين · {tag}',
    'receipt.aria': 'إيصال التوقع',
    'receipt.kicker': 'الإيصال',
    'receipt.title': 'تم تثبيت التوقع',
    'receipt.match': 'المباراة',
    'receipt.prediction': 'التوقع',
    'receipt.email': 'البريد الإلكتروني',
    'receipt.hash': 'رمز الإيصال',
    'receipt.prizeBundle': 'حزمة الجائزة',
    'receipt.followup':
      'راقب تحديثات السحب على هذا البريد. يتم حفظ عنوان الشحن على الخادم للأهلية ومراجعة هدية الراعي، ولا يظهر هنا.',
    'receipt.fallback':
      'أعادت هذه البيئة إيصالا احتياطيا غير دائم.',
    'modal.drawEntry': 'مشاركة السحب',
    'modal.title': 'أكمل مشاركة توقعك',
    'modal.copy':
      'تجمع تفاصيل الشحن داخل الولايات المتحدة الآن لأن الرعاة قد يختارون إرسال هدايا لمشاركين أكثر بعد مراجعة الأهلية.',
    'modal.close': 'إغلاق',
    'modal.closeAria': 'إغلاق نموذج المشاركة',
    'modal.summaryPrediction':
      'التوقع: {prediction} · {winnerSlots} خانات فائزين · {sponsor}',
    'modal.firstName': 'الاسم الأول',
    'modal.lastName': 'اسم العائلة',
    'modal.email': 'البريد الإلكتروني',
    'modal.phone': 'الهاتف',
    'modal.address1': 'العنوان 1',
    'modal.address2': 'العنوان 2',
    'modal.city': 'المدينة',
    'modal.state': 'الولاية',
    'modal.zip': 'الرمز البريدي',
    'modal.rulesStrong': 'أنا مؤهل وأقبل القواعد وشروط الخصوصية.',
    'modal.rulesCopy':
      'هذا النموذج الأولي للولايات المتحدة فقط ويتطلب مراجعة جوائز آمنة للرعاة قبل أي حملة حقيقية.',
    'modal.marketingStrong': 'أرسل تحديثات اختيارية من الرعاة والسحوبات.',
    'modal.marketingCopy':
      'الموافقة اختيارية ولا تؤثر على أهلية المشاركة.',
    'modal.errorCheck': 'تحقق من الحقول المميزة قبل الإرسال.',
    'modal.errorRetry': 'تعذر حفظ مشاركة التوقع. يرجى المحاولة مرة أخرى.',
    'modal.cancel': 'إلغاء',
    'modal.submitting': 'جار الإرسال',
    'modal.submit': 'إرسال المشاركة',
    'team.kicker': 'فريق المشجع',
    'team.title': 'اختر فريقك',
    'prize.kicker': 'سحب الجائزة',
    'prize.title': 'اربح قميص الفريق الذي اخترته',
    'prize.copy':
      'يحصل كل فائز مؤهل في السحب على قميص مشجع محلي مجاني لفريقه المختار. هذه تصاميم مستقلة للمشجعين بلا علامات رسمية للبطولة أو الاتحاد أو اللاعبين أو الرعاة.',
    'prize.teamPrize': 'جائزة {team}',
    'prize.selectedColorsAria': 'ألوان الجائزة المختارة',
    'prize.noOfficialMarks':
      'لا توجد علامات رسمية أو شعارات أو لاعبين أو شعارات رعاة.',
    'prize.viewTeamPrize': 'عرض جائزة الفريق',
    'prize.makePicks': 'قدّم توقعات',
    'prize.previewsAria': 'معاينات جوائز الفرق',
    'prize.details': 'تفاصيل الجائزة',
    'prize.allPrizes': 'كل الجوائز',
    'prize.selectTeam': 'اختر {code}',
    'prize.pageKicker': 'صفحة جائزة {team}',
    'prize.enterDraw': 'ادخل السحب',
    'prize.fulfillmentFlow': 'تدفق التنفيذ',
    'prize.winnerPackage': 'حزمة الفائز',
    'prize.printDirection': 'اتجاه الطباعة',
    'prize.webRepresentation': 'تمثيل واجهة الويب',
    'prize.safetyBoundary': 'حدود السلامة',
    'prize.safetyCopy':
      'تصميم مستقل للمشجعين. لا يتم استخدام أو الإيحاء بأي علامة رسمية لفريق أو بطولة أو اتحاد أو راع أو لاعب أو تعويذة أو كأس أو شعار أو درع أو مصنع.',
    'sponsor.kicker': 'حزم الرعاية',
    'sponsor.title': 'موّل المكافآت التي يتذكرها المشجعون',
    'sponsor.copy':
      'يمول الرعاة حملات المباريات وهدايا المنتجات للفائزين وإصدارات القمصان المحلية وطلبات المراجعة بعد التسليم. صممت الحزم لأخذ عينات المنتجات وإثبات الوسائط وقياس تفاعل المشجعين.',
    'sponsor.tiersAria': 'مستويات الرعاية',
    'sponsor.addonsKicker': 'إضافات إبداعية',
    'sponsor.addonsTitle': 'طرق أكثر لبناء الحملة',
    'sponsor.addonsCopy':
      'تحافظ الإضافات على بساطة حزم الرعاية الأساسية وتمنح العلامات الأكبر والوكالات والشركاء الإقليميين مساحة أكبر لتشكيل التفعيل.',
    'sponsor.compliance':
      'يجب أن تبقى حملات الرعاية منفصلة عن علامات البطولة والاتحادات واللاعبين والشعارات والتمائم الرسمية. يجب مراجعة لغة الجوائز والمراجعات والتنفيذ قبل أي حملة مباشرة.',
    'sponsor.tier.global.name': 'شريك الكأس العالمي',
    'sponsor.tier.global.signal': 'حضور راع على مستوى البطولة',
    'sponsor.tier.global.spots': 'مكانان',
    'sponsor.tier.global.summary':
      'الحزمة الرئيسية للعلامات التي تريد الظهور عبر تجربة توقعات كأس العالم كاملة، وليس نافذة مباراة واحدة فقط.',
    'sponsor.tier.global.creative':
      'مناسبة للإطلاقات الوطنية والمنتجات الرئيسية والسفر والإلكترونيات والملابس الرياضية وتوصيل الطعام والبث والاتصالات والتقنية المالية وتجارب المشجعين.',
    'sponsor.tier.global.include.1':
      'موضع راع بارز في الموقع ومساحة التوقعات وتدفق الجوائز ولحظات متابعة الفائزين.',
    'sponsor.tier.global.include.2':
      'عشرة فيديوهات مراجعة عالية الجودة من الفائزين بعد التسليم مع طلب مراجعة موجه.',
    'sponsor.tier.global.include.3':
      'هدايا منتجات الراعي تشحن للفائزين المختارين بجانب قميص المشجع المحلي.',
    'sponsor.tier.global.include.4':
      'قسم قصة راع مميز مع تعليم آمن للعلامة وروابط عروض وتقارير ملخص الحملة.',
    'sponsor.tier.global.include.5':
      'مراجعة أولوية لقفل الفئة حتى لا يوضع المنافسون المباشرون في نفس موضع الراعي الأعلى.',
    'sponsor.tier.matchday.name': 'راع مميز ليوم المباراة',
    'sponsor.tier.matchday.signal': 'مباراة مميزة أو حملة إقليمية',
    'sponsor.tier.matchday.spots': '10 أماكن',
    'sponsor.tier.matchday.summary':
      'حزمة عالية الظهور للرعاة الذين يريدون حملة مركزة حول مباريات أو أسواق أو مجتمعات مشجعين محددة.',
    'sponsor.tier.matchday.creative':
      'مناسبة لإطلاقات المباريات والعروض والمتاجر وحفلات المشاهدة وعينات المنتجات والتفعيل داخل المدن ولحظات السوق المحددة.',
    'sponsor.tier.matchday.include.1':
      'موضع مميز على بطاقات مباريات مختارة وإيصالات التوقع وشاشات السحب المؤهلة.',
    'sponsor.tier.matchday.include.2':
      'هدية منتج أو قسيمة من الراعي ضمن طابور تنفيذ الفائز للحملة المعينة.',
    'sponsor.tier.matchday.include.3':
      'ثلاثة طلبات مراجعة موجهة للفائزين مع أسئلة مناسبة للصور والفيديو ونقاط معتمدة من الراعي.',
    'sponsor.tier.matchday.include.4':
      'استهداف إقليمي أو بحسب الفريق، مثل مشجعي المدن المضيفة أو أسواق اللغة أو فرق مشجعين مختارة.',
    'sponsor.tier.matchday.include.5':
      'ملخص بعد الحملة يغطي المشاركات والسحوبات المؤهلة والفائزين وحالة الشحن وإكمال المراجعات.',
    'sponsor.tier.fan.name': 'راع إسقاط المشجعين',
    'sponsor.tier.fan.signal': 'حزمة عينات منتجات ميسرة',
    'sponsor.tier.fan.spots': '30 مكانا',
    'sponsor.tier.fan.summary':
      'حزمة أخف للعلامات التي تريد اختبار الطلب وبذر المنتجات والوصول إلى المشجعين دون امتلاك حملة مباراة كاملة.',
    'sponsor.tier.fan.creative':
      'مناسبة للشركات الناشئة والتجار المحليين ومنتجات المبدعين والوجبات الخفيفة والتطبيقات والمنتجات والصحة والإكسسوارات والعروض الرقمية.',
    'sponsor.tier.fan.include.1':
      'ذكر الراعي داخل مجموعات السحب المؤهلة ورسائل المكافأة ولحظات مطالبة الفائزين.',
    'sponsor.tier.fan.include.2':
      'هدية منتج أو رمز خصم أو ميزة رقمية مرفقة بحزم الفائزين المختارين.',
    'sponsor.tier.fan.include.3':
      'طلب مراجعة واحد بعد التسليم مع تقييم منتج اختياري واقتباس.',
    'sponsor.tier.fan.include.4':
      'ملخص راع أساسي بالمشاركات المطالب بها وحالة تنفيذ الفائزين واستجابة المراجعات.',
    'sponsor.tier.fan.include.5':
      'مسار ترقية إلى راع مميز ليوم المباراة إذا كان أداء الحملة جيدا.',
    'sponsor.addon.1': 'صفحة هبوط مخصصة لإسقاط منتج الراعي',
    'sponsor.addon.2': 'فيديوهات مراجعة فائزين إضافية أو مقاطع قصيرة',
    'sponsor.addon.3': 'تسلسل متابعة بريد إلكتروني ورسائل SMS محلي',
    'sponsor.addon.4': 'حزمة استهداف مدينة مضيفة أو فريق مشجعين',
    'sponsor.addon.5': 'فيلم ملخص بأسلوب المبدعين من مشاركات الفائزين',
    'sponsor.addon.6': 'تصدير لوحة الراعي مع مقاييس الحملة',
    'footer.experimentCopy': 'تجربة من',
    'footer.experiment': 'التجربة',
    'footer.aria': 'تنقل التذييل',
    'score.decrease': 'أنقص نتيجة {label}',
    'score.predictedGoals': 'أهداف {label} المتوقعة',
    'score.increase': 'زد نتيجة {label}',
  },
  fr: {
    'language.selector.label': 'Choisir la langue',
    'language.selector.shortLabel': 'Langue',
    'nav.primaryAria': 'Navigation principale',
    'nav.fixtures': 'Matchs',
    'nav.teams': 'Équipes',
    'nav.prizes': 'Prix',
    'nav.sponsors': 'Sponsors',
    'nav.rewards': 'Récompenses',
    'nav.operations': 'Opérations',
    'nav.accountStatus': '{lockedCount} verrouillées · {drawCount} tirages',
    'ai.aria': 'Information sur la création par IA',
    'ai.usageAria': 'Usage estimé de l’IA',
    'ai.built': 'Construit entièrement par IA',
    'ai.totalTokens': 'Total de tokens',
    'ai.estimatedCost': 'Coût estimé',
    'ai.costLabel': 'Estimation équivalente API',
    'ai.note': 'Estimé à partir de l’activité Codex; ce n’est pas une facture.',
    'route.fixtures.kicker': 'Matchs',
    'route.fixtures.title': 'Choisir, marquer, verrouiller',
    'route.fixtures.copy':
      'Prédisez les scores, verrouillez des reçus et entrez dans les tirages financés par les sponsors si le résultat est juste.',
    'route.teams.kicker': 'Équipes',
    'route.teams.title': 'Équipes et calendrier',
    'route.teams.copy':
      'Consultez les équipes participantes, les groupes, les matchs, les coups d’envoi et le calendrier de l’équipe suivie.',
    'route.draws.kicker': 'Tirages',
    'route.draws.title': 'Tirages de gagnants par match',
    'route.draws.copy':
      'Lancez des révélations déterministes avec reçus éligibles, suppléants, résultats participant et métadonnées d’audit.',
    'route.shirts.kicker': 'T-shirts',
    'route.shirts.title': 'Studio de t-shirts localisés',
    'route.shirts.copy':
      'Prévisualisez des concepts indépendants de t-shirts de supporters qui changent selon l’équipe choisie.',
    'route.rewards.kicker': 'Récompenses',
    'route.rewards.title': 'Expédier, suivre, évaluer',
    'route.rewards.copy':
      'Faites passer les gagnants par les colis sponsors, les t-shirts localisés, les files de traitement et les demandes d’avis après livraison.',
    'route.operations.kicker': 'Opérations',
    'route.operations.title': 'Plan POD, 3PL et fournisseurs',
    'route.operations.copy':
      'Voyez comment la production de t-shirts, les kits sponsors, les fournisseurs d’infrastructure et les opérations de campagne s’assemblent.',
    'json.predictions.kicker': 'Système de prédiction',
    'json.predictions.title': 'Choisir, marquer, verrouiller',
    'json.teams.kicker': 'Instantané du tournoi',
    'json.teams.title': 'Équipes et calendrier de groupes',
    'json.draws.kicker': 'Tirage gagnant',
    'json.draws.title': 'Lancer les tirages par match',
    'json.shirts.kicker': 'Récompense localisée',
    'json.shirts.title': 'Studio de t-shirt supporter',
    'json.rewards.kicker': 'Après le tirage',
    'json.rewards.title': 'Expédier, suivre, évaluer',
    'json.operations.kicker': 'Opérations',
    'json.operations.title': 'POD, 3PL et Stripe Projects',
    'flow.aria': 'Parcours de prédiction',
    'flow.stagesAria': 'Étapes du parcours de prédiction',
    'flow.header': 'Flux matchday',
    'flow.predict.label': 'Prédire',
    'flow.predict.meta': '{count} verrouillées',
    'flow.teams.label': 'Équipes',
    'flow.teams.meta': '48 équipes',
    'flow.draw.label': 'Tirage',
    'flow.draw.meta': '{count} terminés',
    'flow.prize.label': 'Prix',
    'flow.prize.meta': 'T-shirt gratuit',
    'flow.personalize.label': 'Personnaliser',
    'flow.fulfill.label': 'Traiter',
    'flow.fulfill.meta': '{count} en file',
    'flow.review.label': 'Avis',
    'flow.review.meta': '{count} envoyés',
    'hero.title': 'Prédisez {home} vs {away}',
    'hero.subtitle':
      'Définissez le score, verrouillez une entrée au tirage et consultez le lot sponsorisé dès le premier écran.',
    'hero.supporterModeAria': 'Mode supporter',
    'hero.selectedMatchDetailsAria': 'Détails du match sélectionné',
    'hero.status.awaitingResult': 'Résultat en attente',
    'hero.status.kickoffDay': 'Coup d’envoi dans {count} jour',
    'hero.status.kickoffDays': 'Coup d’envoi dans {count} jours',
    'hero.status.kickoffHour': 'Coup d’envoi dans {count} heure',
    'hero.status.kickoffHours': 'Coup d’envoi dans {count} heures',
    'hero.match': 'Match {number}',
    'hero.group': 'Groupe {group}',
    'hero.draw': 'Nul',
    'hero.scoreAria': '{home} {homeScore}, {away} {awayScore}',
    'hero.predictedOutcome': 'Résultat prédit',
    'hero.entryReceived': 'Entrée reçue',
    'hero.lockPrediction': 'Verrouiller',
    'hero.prizeBundleAria': 'Détails du lot',
    'hero.sponsorPrizeBundle': 'Lot sponsorisé',
    'hero.winners': 'Gagnants',
    'hero.joined': 'Participants',
    'hero.sponsor': 'Sponsor',
    'hero.sponsorThisMatch': 'Sponsoriser ce match',
    'hero.guardrailNoteSuffix':
      'Récompenses de fans indépendantes uniquement; aucune marque officielle d’équipe, de tournoi, de fédération, de joueur ou de sponsor n’est utilisée.',
    'hero.upcomingAria': 'Rail des prochains matchs',
    'hero.upcomingMatches': 'Prochains matchs',
    'hero.browseNearbyFixtures': 'Parcourir les matchs proches',
    'hero.fullFixtures': 'Tous les matchs',
    'hero.receiptSaved': 'Reçu enregistré',
    'hero.fixturePrizeMeta': '{count} gagnants · {tag}',
    'receipt.aria': 'Reçu de prédiction',
    'receipt.kicker': 'Reçu',
    'receipt.title': 'Prédiction verrouillée',
    'receipt.match': 'Match',
    'receipt.prediction': 'Prédiction',
    'receipt.email': 'E-mail',
    'receipt.hash': 'Hash du reçu',
    'receipt.prizeBundle': 'Lot',
    'receipt.followup':
      'Surveillez cet e-mail pour les mises à jour du tirage. L’adresse de livraison reste côté serveur pour l’éligibilité et l’avis cadeau sponsor; elle n’est pas affichée ici.',
    'receipt.fallback':
      'Cet environnement a renvoyé un reçu de secours non persistant.',
    'modal.drawEntry': 'Entrée au tirage',
    'modal.title': 'Compléter votre entrée de prédiction',
    'modal.copy':
      'Les informations d’expédition aux États-Unis sont collectées maintenant, car les sponsors peuvent envoyer des cadeaux à plus de participants après examen d’éligibilité.',
    'modal.close': 'Fermer',
    'modal.closeAria': 'Fermer le formulaire',
    'modal.summaryPrediction':
      'Prédiction : {prediction} · {winnerSlots} places gagnantes · {sponsor}',
    'modal.firstName': 'Prénom',
    'modal.lastName': 'Nom',
    'modal.email': 'E-mail',
    'modal.phone': 'Téléphone',
    'modal.address1': 'Adresse ligne 1',
    'modal.address2': 'Adresse ligne 2',
    'modal.city': 'Ville',
    'modal.state': 'État',
    'modal.zip': 'Code ZIP',
    'modal.rulesStrong':
      'Je suis éligible et j’accepte les règles et conditions de confidentialité.',
    'modal.rulesCopy':
      'Ce MVP est réservé aux États-Unis et nécessite une revue des prix sûre pour les sponsors avant toute campagne réelle.',
    'modal.marketingStrong':
      'Envoyer les mises à jour optionnelles des sponsors et tirages.',
    'modal.marketingCopy':
      'Le consentement est optionnel et n’affecte pas l’éligibilité.',
    'modal.errorCheck': 'Vérifiez les champs indiqués avant l’envoi.',
    'modal.errorRetry':
      'L’entrée de prédiction n’a pas pu être enregistrée. Réessayez.',
    'modal.cancel': 'Annuler',
    'modal.submitting': 'Envoi',
    'modal.submit': 'Envoyer l’entrée',
    'team.kicker': 'Équipe supportée',
    'team.title': 'Choisissez votre équipe',
    'prize.kicker': 'Tirage au sort',
    'prize.title': 'Gagnez le t-shirt de l’équipe choisie',
    'prize.copy':
      'Chaque gagnant qualifié reçoit un t-shirt de supporter localisé gratuit pour son équipe choisie. Ce sont des créations indépendantes, sans marque officielle de tournoi, fédération, joueur ou sponsor.',
    'prize.teamPrize': 'Prix {team}',
    'prize.selectedColorsAria': 'Couleurs du prix sélectionné',
    'prize.noOfficialMarks':
      'Aucune marque officielle, écusson, joueur ou logo sponsor.',
    'prize.viewTeamPrize': 'Voir le prix équipe',
    'prize.makePicks': 'Faire des pronostics',
    'prize.previewsAria': 'Aperçus des prix par équipe',
    'prize.details': 'Détails du prix',
    'prize.allPrizes': 'Tous les prix',
    'prize.selectTeam': 'Choisir {code}',
    'prize.pageKicker': 'Page prix {team}',
    'prize.enterDraw': 'Entrer au tirage',
    'prize.fulfillmentFlow': 'Flux de traitement',
    'prize.winnerPackage': 'Pack gagnant',
    'prize.printDirection': 'Direction d’impression',
    'prize.webRepresentation': 'Représentation web',
    'prize.safetyBoundary': 'Limite de sécurité',
    'prize.safetyCopy':
      'Design de fan indépendant. Aucune marque officielle d’équipe, tournoi, fédération, sponsor, joueur, mascotte, trophée, écusson, bouclier ou fabricant n’est utilisée ou suggérée.',
    'sponsor.kicker': 'Packages sponsor',
    'sponsor.title': 'Financez les récompenses mémorables',
    'sponsor.copy':
      'Les sponsors financent les campagnes de match, cadeaux produit, drops de t-shirts localisés et demandes d’avis après livraison. Les packages servent l’échantillonnage, la preuve média et l’engagement mesurable.',
    'sponsor.tiersAria': 'Niveaux de sponsoring',
    'sponsor.addonsKicker': 'Options créatives',
    'sponsor.addonsTitle': 'Plus de façons de construire la campagne',
    'sponsor.addonsCopy':
      'Les options gardent les offres simples tout en donnant aux marques, agences et partenaires régionaux plus d’espace pour façonner l’activation.',
    'sponsor.compliance':
      'Les campagnes sponsor doivent rester séparées des marques officielles de tournoi, fédération, joueur, écusson et mascotte. Le langage prix, avis et traitement doit être revu avant toute campagne active.',
    'sponsor.tier.global.name': 'Partenaire Global Cup',
    'sponsor.tier.global.signal': 'Présence sponsor sur tout le tournoi',
    'sponsor.tier.global.spots': '2 places',
    'sponsor.tier.global.summary':
      'L’offre phare pour les marques qui veulent couvrir toute l’expérience de prédiction, pas seulement une fenêtre de match.',
    'sponsor.tier.global.creative':
      'Idéal pour lancements nationaux, produits héros, voyage, électronique, sportswear, livraison, streaming, télécoms, fintech et expériences fans.',
    'sponsor.tier.global.include.1':
      'Placement sponsor visible sur le site, l’espace de prédiction, le flux prix et les suivis gagnants.',
    'sponsor.tier.global.include.2':
      'Dix vidéos d’avis gagnants de haute qualité après livraison avec prompt guidé.',
    'sponsor.tier.global.include.3':
      'Cadeaux produit expédiés aux gagnants avec le t-shirt de supporter localisé.',
    'sponsor.tier.global.include.4':
      'Bloc histoire sponsor avec pédagogie de marque sûre, liens d’offre et reporting de campagne.',
    'sponsor.tier.global.include.5':
      'Revue prioritaire d’exclusivité de catégorie pour éviter les concurrents directs sur le même niveau.',
    'sponsor.tier.matchday.name': 'Sponsor vedette matchday',
    'sponsor.tier.matchday.signal': 'Match vedette ou campagne régionale',
    'sponsor.tier.matchday.spots': '10 places',
    'sponsor.tier.matchday.summary':
      'Une offre très visible pour les sponsors qui veulent une campagne ciblée autour de matchs, marchés ou communautés.',
    'sponsor.tier.matchday.creative':
      'Idéal pour lancements match, promotions, watch parties, échantillons, activations ville et moments de marché.',
    'sponsor.tier.matchday.include.1':
      'Placement sur cartes match, reçus de prédiction et écrans de tirage qualifiés.',
    'sponsor.tier.matchday.include.2':
      'Cadeau produit ou bon inclus dans la file de traitement du gagnant pour la campagne.',
    'sponsor.tier.matchday.include.3':
      'Trois prompts d’avis guidés avec questions photo/vidéo et points approuvés par le sponsor.',
    'sponsor.tier.matchday.include.4':
      'Ciblage régional ou par thème d’équipe, comme villes hôtes, marchés linguistiques ou supporters choisis.',
    'sponsor.tier.matchday.include.5':
      'Résumé post-campagne couvrant entrées, tirages qualifiés, gagnants, expédition et avis.',
    'sponsor.tier.fan.name': 'Sponsor Fan Drop',
    'sponsor.tier.fan.signal': 'Package d’échantillonnage accessible',
    'sponsor.tier.fan.spots': '30 places',
    'sponsor.tier.fan.summary':
      'Une offre plus légère pour tester la demande, semer des produits et atteindre les fans sans posséder une campagne complète.',
    'sponsor.tier.fan.creative':
      'Idéal pour startups, commerces locaux, produits créateurs, snacks, apps, merch, bien-être, accessoires et offres numériques.',
    'sponsor.tier.fan.include.1':
      'Mention sponsor dans les pools éligibles, e-mails de récompense et moments de réclamation.',
    'sponsor.tier.fan.include.2':
      'Cadeau produit, code remise ou avantage numérique ajouté aux packs gagnants.',
    'sponsor.tier.fan.include.3':
      'Un prompt d’avis après livraison avec note et citation optionnelles.',
    'sponsor.tier.fan.include.4':
      'Récap sponsor de base avec entrées, état de traitement et réponses aux avis.',
    'sponsor.tier.fan.include.5':
      'Chemin de montée vers Sponsor vedette matchday si la campagne performe.',
    'sponsor.addon.1': 'Page d’atterrissage dédiée à un drop produit sponsor',
    'sponsor.addon.2': 'Vidéos d’avis gagnants supplémentaires ou clips courts',
    'sponsor.addon.3': 'Séquence e-mail et SMS localisée',
    'sponsor.addon.4': 'Ciblage ville hôte ou équipe supportée',
    'sponsor.addon.5': 'Récap vidéo style créateur à partir des gagnants',
    'sponsor.addon.6': 'Export tableau sponsor avec métriques',
    'footer.experimentCopy': 'Une expérience de',
    'footer.experiment': 'Expérience',
    'footer.aria': 'Navigation du pied de page',
    'score.decrease': 'Diminuer le score de {label}',
    'score.predictedGoals': 'Buts prédits de {label}',
    'score.increase': 'Augmenter le score de {label}',
  },
  de: {
    'language.selector.label': 'Sprache wählen',
    'language.selector.shortLabel': 'Sprache',
    'nav.primaryAria': 'Hauptnavigation',
    'nav.fixtures': 'Spiele',
    'nav.teams': 'Teams',
    'nav.prizes': 'Preise',
    'nav.sponsors': 'Sponsoren',
    'nav.rewards': 'Rewards',
    'nav.operations': 'Betrieb',
    'nav.accountStatus': '{lockedCount} gesperrt · {drawCount} Ziehungen',
    'ai.aria': 'Hinweis zum KI-Build',
    'ai.usageAria': 'Geschätzte KI-Nutzung',
    'ai.built': 'Vollständig mit KI gebaut',
    'ai.totalTokens': 'Tokens gesamt',
    'ai.estimatedCost': 'Geschätzte Kosten',
    'ai.costLabel': 'API-äquivalente Schätzung',
    'ai.note': 'Aus Codex-Build-Aktivität geschätzt; keine Rechnung.',
    'route.fixtures.kicker': 'Spiele',
    'route.fixtures.title': 'Tippen, zählen, sichern',
    'route.fixtures.copy':
      'Sage Spielstände voraus, sichere Belege und nimm an sponsorfinanzierten Ziehungen teil, wenn das Ergebnis stimmt.',
    'route.teams.kicker': 'Teams',
    'route.teams.title': 'Teams und Spielplan',
    'route.teams.copy':
      'Sieh alle Teams, Gruppen, Spiele, Anstoßzeiten und den Spielplan deines Supporter-Teams.',
    'route.draws.kicker': 'Ziehungen',
    'route.draws.title': 'Gewinnerziehungen pro Spiel',
    'route.draws.copy':
      'Starte deterministische Gewinner-Reveals mit berechtigten Belegen, Ersatzplätzen, Teilnehmerstatus und Auditdaten.',
    'route.shirts.kicker': 'Shirts',
    'route.shirts.title': 'Lokalisierte Shirt-Werkstatt',
    'route.shirts.copy':
      'Vorschau unabhängiger Supporter-Shirt-Konzepte, die sich mit dem gewählten Team ändern.',
    'route.rewards.kicker': 'Rewards',
    'route.rewards.title': 'Versenden, verfolgen, bewerten',
    'route.rewards.copy':
      'Führe Gewinner durch Sponsorpakete, lokale Shirts, Fulfillment-Warteschlangen und Review-Prompts nach Lieferung.',
    'route.operations.kicker': 'Betrieb',
    'route.operations.title': 'POD-, 3PL- und Provider-Plan',
    'route.operations.copy':
      'Prüfe, wie Shirt-Produktion, Sponsorkits, Infrastruktur-Provider und Kampagnenbetrieb zusammenpassen.',
    'json.predictions.kicker': 'Tippsystem',
    'json.predictions.title': 'Tippen, zählen, sichern',
    'json.teams.kicker': 'Turnier-Snapshot',
    'json.teams.title': 'Teams und Gruppen-Spielplan',
    'json.draws.kicker': 'Gewinnerziehung',
    'json.draws.title': 'Ziehungen pro Spiel starten',
    'json.shirts.kicker': 'Lokaler Reward',
    'json.shirts.title': 'Supporter-Shirt-Studio',
    'json.rewards.kicker': 'Nach der Ziehung',
    'json.rewards.title': 'Versenden, verfolgen, bewerten',
    'json.operations.kicker': 'Betrieb',
    'json.operations.title': 'POD, 3PL und Stripe Projects',
    'flow.aria': 'Prediction-Workflow',
    'flow.stagesAria': 'Workflow-Stufen',
    'flow.header': 'Matchday-Flow',
    'flow.predict.label': 'Tippen',
    'flow.predict.meta': '{count} gesperrt',
    'flow.teams.label': 'Teams',
    'flow.teams.meta': '48 Teams',
    'flow.draw.label': 'Ziehung',
    'flow.draw.meta': '{count} fertig',
    'flow.prize.label': 'Preis',
    'flow.prize.meta': 'Gratis-Shirt',
    'flow.personalize.label': 'Personalisieren',
    'flow.fulfill.label': 'Fulfillment',
    'flow.fulfill.meta': '{count} in Queue',
    'flow.review.label': 'Review',
    'flow.review.meta': '{count} gesendet',
    'hero.title': '{home} gegen {away} tippen',
    'hero.subtitle':
      'Lege den Spielstand fest, sichere eine Ziehungsteilnahme und sieh das sponsorfinanzierte Preispaket im ersten Bildschirm.',
    'hero.supporterModeAria': 'Supporter-Modus',
    'hero.selectedMatchDetailsAria': 'Details zum ausgewählten Spiel',
    'hero.status.awaitingResult': 'Ergebnis-Snapshot ausstehend',
    'hero.status.kickoffDay': 'Anstoß in {count} Tag',
    'hero.status.kickoffDays': 'Anstoß in {count} Tagen',
    'hero.status.kickoffHour': 'Anstoß in {count} Stunde',
    'hero.status.kickoffHours': 'Anstoß in {count} Stunden',
    'hero.match': 'Spiel {number}',
    'hero.group': 'Gruppe {group}',
    'hero.draw': 'Unentschieden',
    'hero.scoreAria': '{home} {homeScore}, {away} {awayScore}',
    'hero.predictedOutcome': 'Vorhergesagtes Ergebnis',
    'hero.entryReceived': 'Teilnahme erhalten',
    'hero.lockPrediction': 'Tipp sichern',
    'hero.prizeBundleAria': 'Details zum Preispaket',
    'hero.sponsorPrizeBundle': 'Sponsor-Preispaket',
    'hero.winners': 'Gewinner',
    'hero.joined': 'Teilnahmen',
    'hero.sponsor': 'Sponsor',
    'hero.sponsorThisMatch': 'Dieses Spiel sponsern',
    'hero.guardrailNoteSuffix':
      'Nur unabhängige Fan-Rewards; keine offiziellen Marken von Teams, Turnier, Verbänden, Spielern oder Sponsoren.',
    'hero.upcomingAria': 'Leiste kommender Spiele',
    'hero.upcomingMatches': 'Kommende Spiele',
    'hero.browseNearbyFixtures': 'Nahe Spiele ansehen',
    'hero.fullFixtures': 'Alle Spiele',
    'hero.receiptSaved': 'Beleg gespeichert',
    'hero.fixturePrizeMeta': '{count} Gewinner · {tag}',
    'receipt.aria': 'Tipp-Beleg',
    'receipt.kicker': 'Beleg',
    'receipt.title': 'Tipp gesichert',
    'receipt.match': 'Spiel',
    'receipt.prediction': 'Tipp',
    'receipt.email': 'E-Mail',
    'receipt.hash': 'Beleg-Hash',
    'receipt.prizeBundle': 'Preispaket',
    'receipt.followup':
      'Achte auf Ziehungsupdates an diese E-Mail. Die Lieferadresse bleibt serverseitig für Berechtigung und Sponsor-Geschenkprüfung und wird hier nicht gezeigt.',
    'receipt.fallback':
      'Diese Umgebung hat einen nicht persistenten Ersatzbeleg zurückgegeben.',
    'modal.drawEntry': 'Ziehungsteilnahme',
    'modal.title': 'Tippteilnahme abschließen',
    'modal.copy':
      'US-Versanddaten werden jetzt gesammelt, weil Sponsoren nach Berechtigungsprüfung mehr Teilnehmern Geschenke senden können.',
    'modal.close': 'Schließen',
    'modal.closeAria': 'Teilnahmeformular schließen',
    'modal.summaryPrediction':
      'Tipp: {prediction} · {winnerSlots} Gewinnerplätze · {sponsor}',
    'modal.firstName': 'Vorname',
    'modal.lastName': 'Nachname',
    'modal.email': 'E-Mail',
    'modal.phone': 'Telefon',
    'modal.address1': 'Adresszeile 1',
    'modal.address2': 'Adresszeile 2',
    'modal.city': 'Stadt',
    'modal.state': 'Bundesstaat',
    'modal.zip': 'ZIP-Code',
    'modal.rulesStrong':
      'Ich bin berechtigt und akzeptiere Regeln und Datenschutzbedingungen.',
    'modal.rulesCopy':
      'Dieses MVP ist US-only und benötigt vor jeder echten Kampagne sponsor-sichere Preisprüfung.',
    'modal.marketingStrong':
      'Optionale Sponsor- und Ziehungsupdates senden.',
    'modal.marketingCopy':
      'Die Zustimmung ist optional und beeinflusst die Teilnahmeberechtigung nicht.',
    'modal.errorCheck': 'Prüfe die markierten Felder vor dem Absenden.',
    'modal.errorRetry': 'Die Tippteilnahme konnte nicht gespeichert werden. Bitte erneut versuchen.',
    'modal.cancel': 'Abbrechen',
    'modal.submitting': 'Wird gesendet',
    'modal.submit': 'Teilnahme senden',
    'team.kicker': 'Supporter-Team',
    'team.title': 'Wähle dein Team',
    'prize.kicker': 'Preisziehung',
    'prize.title': 'Gewinne das Shirt deines Teams',
    'prize.copy':
      'Jeder qualifizierte Gewinner erhält ein kostenloses lokalisiertes Supporter-Shirt für das gewählte Team. Es sind unabhängige Fan-Designs ohne offizielle Turnier-, Verbands-, Spieler- oder Sponsormarken.',
    'prize.teamPrize': '{team}-Preis',
    'prize.selectedColorsAria': 'Ausgewählte Preisfarben',
    'prize.noOfficialMarks':
      'Keine offiziellen Marken, Wappen, Spieler oder Sponsorlogos.',
    'prize.viewTeamPrize': 'Team-Preis ansehen',
    'prize.makePicks': 'Tipps abgeben',
    'prize.previewsAria': 'Team-Preisvorschauen',
    'prize.details': 'Preisdetails',
    'prize.allPrizes': 'Alle Preise',
    'prize.selectTeam': '{code} wählen',
    'prize.pageKicker': '{team}-Preisseite',
    'prize.enterDraw': 'An Ziehung teilnehmen',
    'prize.fulfillmentFlow': 'Fulfillment-Flow',
    'prize.winnerPackage': 'Gewinnerpaket',
    'prize.printDirection': 'Druckrichtung',
    'prize.webRepresentation': 'Web-UI-Darstellung',
    'prize.safetyBoundary': 'Sicherheitsgrenze',
    'prize.safetyCopy':
      'Unabhängiges Fan-Design. Keine offiziellen Team-, Turnier-, Verbands-, Sponsor-, Spieler-, Maskottchen-, Pokal-, Wappen-, Schild- oder Herstellermarken werden genutzt oder angedeutet.',
    'sponsor.kicker': 'Sponsor-Pakete',
    'sponsor.title': 'Finanziere Rewards, die Fans behalten',
    'sponsor.copy':
      'Sponsoren finanzieren Match-Kampagnen, Gewinnergeschenke, lokale Shirt-Drops und Review-Prompts nach Lieferung. Die Pakete sind für Produktsampling, Media-Proof und messbares Fan-Engagement ausgelegt.',
    'sponsor.tiersAria': 'Sponsoring-Stufen',
    'sponsor.addonsKicker': 'Kreative Add-ons',
    'sponsor.addonsTitle': 'Mehr Wege zur Kampagne',
    'sponsor.addonsCopy':
      'Add-ons halten die Kernpakete einfach und geben größeren Marken, Agenturen und regionalen Partnern mehr Raum für die Aktivierung.',
    'sponsor.compliance':
      'Sponsor-Kampagnen müssen getrennt von offiziellen Turnier-, Verbands-, Spieler-, Wappen- und Maskottchenmarken bleiben. Preis-, Review- und Fulfillment-Texte sollten vor Live-Kampagnen geprüft werden.',
    'sponsor.tier.global.name': 'Global Cup Partner',
    'sponsor.tier.global.signal': 'Turnierweite Sponsorpräsenz',
    'sponsor.tier.global.spots': '2 Plätze',
    'sponsor.tier.global.summary':
      'Das Flaggschiffpaket für Marken, die über das gesamte Prediction-Erlebnis präsent sein wollen, nicht nur in einem Spielzeitfenster.',
    'sponsor.tier.global.creative':
      'Ideal für nationale Launches, Hero-Produkte, Reise, Elektronik, Sportswear, Food Delivery, Streaming, Telekom, Fintech und Fan-Erlebnisse.',
    'sponsor.tier.global.include.1':
      'Prominente Platzierung auf Website, Prediction-Workspace, Preisflow und Gewinner-Follow-ups.',
    'sponsor.tier.global.include.2':
      'Zehn hochwertige Gewinner-Reviewvideos nach Produktlieferung mit geführtem Review-Prompt.',
    'sponsor.tier.global.include.3':
      'Sponsor-Produktgeschenke an ausgewählte Gewinner zusammen mit lokalisiertem Shirt.',
    'sponsor.tier.global.include.4':
      'Sponsor-Storyblock mit markensicherer Produktbildung, Angebotslinks und Kampagnenreporting.',
    'sponsor.tier.global.include.5':
      'Priorisierte Kategorieprüfung, damit direkte Wettbewerber nicht im selben Top-Sponsorplatz erscheinen.',
    'sponsor.tier.matchday.name': 'Matchday Featured Sponsor',
    'sponsor.tier.matchday.signal': 'Featured Match oder regionale Kampagne',
    'sponsor.tier.matchday.spots': '10 Plätze',
    'sponsor.tier.matchday.summary':
      'Ein sichtbares Match-Paket für Sponsoren, die Kampagnen um bestimmte Spiele, Märkte oder Supporter-Communities wollen.',
    'sponsor.tier.matchday.creative':
      'Ideal für Match-Launches, Retail-Aktionen, Watch-Partys, Sampling, City-Aktivierungen und marktspezifische Momente.',
    'sponsor.tier.matchday.include.1':
      'Platzierung auf ausgewählten Matchkarten, Tippbelegen und qualifizierenden Ziehungsflächen.',
    'sponsor.tier.matchday.include.2':
      'Sponsor-Geschenk oder Gutschein in der Fulfillment-Queue der zugewiesenen Kampagne.',
    'sponsor.tier.matchday.include.3':
      'Drei geführte Review-Prompts mit foto-/videofreundlichen Fragen und Sponsor-Talking-Points.',
    'sponsor.tier.matchday.include.4':
      'Regionales oder Team-Targeting, etwa Host-City-Fans, Sprachmärkte oder ausgewählte Supporter-Teams.',
    'sponsor.tier.matchday.include.5':
      'Post-Campaign-Zusammenfassung zu Entries, qualifizierten Ziehungen, Gewinnern, Versand und Reviews.',
    'sponsor.tier.fan.name': 'Fan Drop Sponsor',
    'sponsor.tier.fan.signal': 'Zugängliches Produktsampling-Paket',
    'sponsor.tier.fan.spots': '30 Plätze',
    'sponsor.tier.fan.summary':
      'Ein leichteres Paket für Marken, die Nachfrage testen, Produkte streuen und Fans ohne komplette Matchkampagne erreichen wollen.',
    'sponsor.tier.fan.creative':
      'Ideal für Startups, lokale Händler, Creator-Produkte, Snacks, Apps, Merch, Wellness, Accessoires und digitale Angebote.',
    'sponsor.tier.fan.include.1':
      'Sponsor-Erwähnung in berechtigten Draw-Pools, Reward-Mails und Claim-Momenten.',
    'sponsor.tier.fan.include.2':
      'Produktgeschenk, Rabattcode oder digitales Extra an ausgewählte Gewinnerpakete angehängt.',
    'sponsor.tier.fan.include.3':
      'Ein geführter Review-Prompt nach Lieferung mit optionaler Bewertung und Zitat.',
    'sponsor.tier.fan.include.4':
      'Einfacher Sponsor-Recap mit Entries, Fulfillment-Status und Reviewantworten.',
    'sponsor.tier.fan.include.5':
      'Upgrade-Pfad zu Matchday Featured Sponsor, wenn die Kampagne gut läuft.',
    'sponsor.addon.1': 'Eigene Landingpage für einen Sponsor-Produktdrop',
    'sponsor.addon.2': 'Zusätzliche Gewinner-Reviewvideos oder Kurzclips',
    'sponsor.addon.3': 'Lokalisierte E-Mail- und SMS-Follow-up-Sequenz',
    'sponsor.addon.4': 'Host-City- oder Supporter-Team-Targeting',
    'sponsor.addon.5': 'Creator-Recap-Reel aus Gewinnerbeiträgen',
    'sponsor.addon.6': 'Sponsor-Dashboardexport mit Kampagnenmetriken',
    'footer.experimentCopy': 'Ein Experiment von',
    'footer.experiment': 'Experiment',
    'footer.aria': 'Footer-Navigation',
    'score.decrease': 'Score von {label} verringern',
    'score.predictedGoals': 'Vorhergesagte Tore für {label}',
    'score.increase': 'Score von {label} erhöhen',
  },
  es: {
    'language.selector.label': 'Elegir idioma',
    'language.selector.shortLabel': 'Idioma',
    'nav.primaryAria': 'Navegación principal',
    'nav.fixtures': 'Partidos',
    'nav.teams': 'Equipos',
    'nav.prizes': 'Premios',
    'nav.sponsors': 'Patrocinadores',
    'nav.rewards': 'Recompensas',
    'nav.operations': 'Operaciones',
    'nav.accountStatus': '{lockedCount} bloqueadas · {drawCount} sorteos',
    'ai.aria': 'Aviso de construcción con IA',
    'ai.usageAria': 'Uso estimado de IA',
    'ai.built': 'Construido íntegramente con IA',
    'ai.totalTokens': 'Tokens totales',
    'ai.estimatedCost': 'Costo estimado',
    'ai.costLabel': 'Estimación equivalente a API',
    'ai.note': 'Estimado desde actividad de Codex; no es un recibo de facturación.',
    'route.fixtures.kicker': 'Partidos',
    'route.fixtures.title': 'Elige, marca, bloquea',
    'route.fixtures.copy':
      'Predice marcadores, bloquea recibos y entra en sorteos financiados por patrocinadores cuando aciertas el resultado.',
    'route.teams.kicker': 'Equipos',
    'route.teams.title': 'Equipos y calendario',
    'route.teams.copy':
      'Revisa equipos, grupos, partidos, horarios de inicio y el calendario del equipo que apoyas.',
    'route.draws.kicker': 'Sorteos',
    'route.draws.title': 'Sorteos de ganadores por partido',
    'route.draws.copy':
      'Ejecuta revelaciones deterministas con recibos elegibles, suplentes, resultados de participantes y metadatos de auditoría.',
    'route.shirts.kicker': 'Camisetas',
    'route.shirts.title': 'Estudio de camisetas localizadas',
    'route.shirts.copy':
      'Previsualiza conceptos independientes de camisetas de aficionado que cambian con el equipo elegido.',
    'route.rewards.kicker': 'Recompensas',
    'route.rewards.title': 'Enviar, seguir, reseñar',
    'route.rewards.copy':
      'Mueve ganadores por paquetes de patrocinador, camisetas localizadas, colas de cumplimiento y solicitudes de reseña tras la entrega.',
    'route.operations.kicker': 'Operaciones',
    'route.operations.title': 'Plan de POD, 3PL y proveedores',
    'route.operations.copy':
      'Revisa cómo encajan producción de camisetas, kits de patrocinador, proveedores de infraestructura y operaciones de campaña.',
    'json.predictions.kicker': 'Sistema de predicción',
    'json.predictions.title': 'Elige, marca, bloquea',
    'json.teams.kicker': 'Instantánea del torneo',
    'json.teams.title': 'Equipos y calendario de grupos',
    'json.draws.kicker': 'Sorteo de ganador',
    'json.draws.title': 'Ejecutar sorteos por partido',
    'json.shirts.kicker': 'Recompensa localizada',
    'json.shirts.title': 'Estudio de camiseta de aficionado',
    'json.rewards.kicker': 'Después del sorteo',
    'json.rewards.title': 'Enviar, seguir, reseñar',
    'json.operations.kicker': 'Operaciones',
    'json.operations.title': 'POD, 3PL y Stripe Projects',
    'flow.aria': 'Flujo de predicción',
    'flow.stagesAria': 'Etapas del flujo de predicción',
    'flow.header': 'Flujo de partido',
    'flow.predict.label': 'Predecir',
    'flow.predict.meta': '{count} bloqueadas',
    'flow.teams.label': 'Equipos',
    'flow.teams.meta': '48 equipos',
    'flow.draw.label': 'Sorteo',
    'flow.draw.meta': '{count} completos',
    'flow.prize.label': 'Premio',
    'flow.prize.meta': 'Camiseta gratis',
    'flow.personalize.label': 'Personalizar',
    'flow.fulfill.label': 'Cumplir',
    'flow.fulfill.meta': '{count} en cola',
    'flow.review.label': 'Reseña',
    'flow.review.meta': '{count} enviadas',
    'hero.title': 'Predice {home} vs {away}',
    'hero.subtitle':
      'Define el marcador, bloquea una entrada al sorteo y mira el paquete de premio patrocinado antes de salir de la primera pantalla.',
    'hero.supporterModeAria': 'Modo aficionado',
    'hero.selectedMatchDetailsAria': 'Detalles del partido seleccionado',
    'hero.status.awaitingResult': 'Esperando resultado',
    'hero.status.kickoffDay': 'Inicio en {count} día',
    'hero.status.kickoffDays': 'Inicio en {count} días',
    'hero.status.kickoffHour': 'Inicio en {count} hora',
    'hero.status.kickoffHours': 'Inicio en {count} horas',
    'hero.match': 'Partido {number}',
    'hero.group': 'Grupo {group}',
    'hero.draw': 'Empate',
    'hero.scoreAria': '{home} {homeScore}, {away} {awayScore}',
    'hero.predictedOutcome': 'Resultado previsto',
    'hero.entryReceived': 'Entrada recibida',
    'hero.lockPrediction': 'Bloquear predicción',
    'hero.prizeBundleAria': 'Detalles del paquete de premio',
    'hero.sponsorPrizeBundle': 'Paquete de premio del patrocinador',
    'hero.winners': 'Ganadores',
    'hero.joined': 'Participantes',
    'hero.sponsor': 'Patrocinador',
    'hero.sponsorThisMatch': 'Patrocina este partido',
    'hero.guardrailNoteSuffix':
      'Solo recompensas independientes para fans; no se usan marcas oficiales de equipos, torneo, federaciones, jugadores o patrocinadores.',
    'hero.upcomingAria': 'Carril de próximos partidos',
    'hero.upcomingMatches': 'Próximos partidos',
    'hero.browseNearbyFixtures': 'Explorar partidos cercanos',
    'hero.fullFixtures': 'Todos los partidos',
    'hero.receiptSaved': 'Recibo guardado',
    'hero.fixturePrizeMeta': '{count} ganadores · {tag}',
    'receipt.aria': 'Recibo de predicción',
    'receipt.kicker': 'Recibo',
    'receipt.title': 'Predicción bloqueada',
    'receipt.match': 'Partido',
    'receipt.prediction': 'Predicción',
    'receipt.email': 'Correo',
    'receipt.hash': 'Hash del recibo',
    'receipt.prizeBundle': 'Paquete de premio',
    'receipt.followup':
      'Busca actualizaciones del sorteo en este correo. La dirección de envío se guarda en el servidor para elegibilidad y revisión del regalo del patrocinador, y no se muestra aquí.',
    'receipt.fallback':
      'Este entorno devolvió un recibo de respaldo no persistente.',
    'modal.drawEntry': 'Entrada al sorteo',
    'modal.title': 'Completa tu entrada de predicción',
    'modal.copy':
      'Los datos de envío de EE. UU. se recopilan ahora porque los patrocinadores pueden enviar regalos a más participantes tras revisar elegibilidad.',
    'modal.close': 'Cerrar',
    'modal.closeAria': 'Cerrar formulario',
    'modal.summaryPrediction':
      'Predicción: {prediction} · {winnerSlots} cupos ganadores · {sponsor}',
    'modal.firstName': 'Nombre',
    'modal.lastName': 'Apellido',
    'modal.email': 'Correo',
    'modal.phone': 'Teléfono',
    'modal.address1': 'Dirección 1',
    'modal.address2': 'Dirección 2',
    'modal.city': 'Ciudad',
    'modal.state': 'Estado',
    'modal.zip': 'Código ZIP',
    'modal.rulesStrong':
      'Soy elegible y acepto las reglas y términos de privacidad.',
    'modal.rulesCopy':
      'Este MVP es solo para EE. UU. y requiere revisión de premios segura para patrocinadores antes de cualquier campaña real.',
    'modal.marketingStrong':
      'Enviar actualizaciones opcionales de patrocinadores y sorteos.',
    'modal.marketingCopy':
      'El consentimiento es opcional y no afecta la elegibilidad.',
    'modal.errorCheck': 'Revisa los campos resaltados antes de enviar.',
    'modal.errorRetry': 'No se pudo guardar la entrada. Inténtalo de nuevo.',
    'modal.cancel': 'Cancelar',
    'modal.submitting': 'Enviando',
    'modal.submit': 'Enviar entrada',
    'team.kicker': 'Equipo aficionado',
    'team.title': 'Elige tu equipo',
    'prize.kicker': 'Sorteo de premio',
    'prize.title': 'Gana la camiseta del equipo que elegiste',
    'prize.copy':
      'Cada ganador calificado recibe una camiseta localizada gratis de su equipo elegido. Son diseños independientes sin marcas oficiales de torneo, federación, jugador o patrocinador.',
    'prize.teamPrize': 'Premio {team}',
    'prize.selectedColorsAria': 'Colores del premio seleccionado',
    'prize.noOfficialMarks':
      'Sin marcas oficiales, escudos, jugadores ni logos de patrocinadores.',
    'prize.viewTeamPrize': 'Ver premio del equipo',
    'prize.makePicks': 'Hacer predicciones',
    'prize.previewsAria': 'Vistas de premios por equipo',
    'prize.details': 'Detalles del premio',
    'prize.allPrizes': 'Todos los premios',
    'prize.selectTeam': 'Seleccionar {code}',
    'prize.pageKicker': 'Página del premio {team}',
    'prize.enterDraw': 'Entrar a un sorteo',
    'prize.fulfillmentFlow': 'Flujo de cumplimiento',
    'prize.winnerPackage': 'Paquete ganador',
    'prize.printDirection': 'Dirección de impresión',
    'prize.webRepresentation': 'Representación web',
    'prize.safetyBoundary': 'Límite de seguridad',
    'prize.safetyCopy':
      'Diseño independiente para fans. No se usa ni se implica ninguna marca oficial de equipo, torneo, federación, patrocinador, jugador, mascota, trofeo, escudo o fabricante.',
    'sponsor.kicker': 'Paquetes de patrocinio',
    'sponsor.title': 'Financia recompensas que los fans recuerdan',
    'sponsor.copy':
      'Los patrocinadores financian campañas de partido, regalos para ganadores, drops de camisetas localizadas y solicitudes de reseña tras la entrega. Los paquetes sirven para muestreo, prueba de medios y engagement medible.',
    'sponsor.tiersAria': 'Niveles de patrocinio',
    'sponsor.addonsKicker': 'Extras creativos',
    'sponsor.addonsTitle': 'Más formas de construir la campaña',
    'sponsor.addonsCopy':
      'Los extras mantienen simples los paquetes centrales y dan a marcas, agencias y socios regionales más espacio para moldear la activación.',
    'sponsor.compliance':
      'Las campañas de patrocinio deben mantenerse separadas de marcas oficiales del torneo, federaciones, jugadores, escudos y mascotas. El lenguaje de premios, reseñas y cumplimiento debe revisarse antes de campañas activas.',
    'sponsor.tier.global.name': 'Socio Global Cup',
    'sponsor.tier.global.signal': 'Presencia de patrocinador en todo el torneo',
    'sponsor.tier.global.spots': '2 lugares',
    'sponsor.tier.global.summary':
      'El paquete principal para marcas que quieren estar en toda la experiencia de predicción, no solo en una ventana de partido.',
    'sponsor.tier.global.creative':
      'Ideal para lanzamientos nacionales, productos héroe, viajes, electrónica, sportswear, delivery, streaming, telecom, fintech y experiencias de fans.',
    'sponsor.tier.global.include.1':
      'Ubicación destacada en sitio, espacio de predicción, flujo de premios y seguimientos a ganadores.',
    'sponsor.tier.global.include.2':
      'Diez videos de reseña de ganadores de alta calidad tras la entrega con prompt guiado.',
    'sponsor.tier.global.include.3':
      'Regalos de producto enviados a ganadores seleccionados junto con la camiseta localizada.',
    'sponsor.tier.global.include.4':
      'Bloque de historia del patrocinador con educación de producto segura, enlaces y reporte.',
    'sponsor.tier.global.include.5':
      'Revisión prioritaria de exclusividad de categoría para evitar competidores directos en la misma posición.',
    'sponsor.tier.matchday.name': 'Patrocinador destacado de partido',
    'sponsor.tier.matchday.signal': 'Partido destacado o campaña regional',
    'sponsor.tier.matchday.spots': '10 lugares',
    'sponsor.tier.matchday.summary':
      'Paquete de alta visibilidad para patrocinadores que quieren una campaña enfocada en partidos, mercados o comunidades.',
    'sponsor.tier.matchday.creative':
      'Ideal para lanzamientos de partido, promociones retail, watch parties, muestreo, activaciones urbanas y momentos de mercado.',
    'sponsor.tier.matchday.include.1':
      'Ubicación destacada en tarjetas de partido, recibos de predicción y pantallas de sorteos calificados.',
    'sponsor.tier.matchday.include.2':
      'Regalo o cupón del patrocinador en la cola de cumplimiento del ganador asignado.',
    'sponsor.tier.matchday.include.3':
      'Tres prompts de reseña guiados con preguntas para foto/video y mensajes aprobados.',
    'sponsor.tier.matchday.include.4':
      'Segmentación regional o por equipo, como fans de ciudades sede, mercados lingüísticos o equipos elegidos.',
    'sponsor.tier.matchday.include.5':
      'Resumen postcampaña de entradas, sorteos calificados, ganadores, envíos y reseñas.',
    'sponsor.tier.fan.name': 'Patrocinador Fan Drop',
    'sponsor.tier.fan.signal': 'Paquete accesible de muestreo',
    'sponsor.tier.fan.spots': '30 lugares',
    'sponsor.tier.fan.summary':
      'Paquete ligero para marcas que quieren probar demanda, sembrar productos y llegar a fans sin una campaña completa.',
    'sponsor.tier.fan.creative':
      'Ideal para startups, comercios locales, productos de creadores, snacks, apps, merch, wellness, accesorios y ofertas digitales.',
    'sponsor.tier.fan.include.1':
      'Mención de patrocinador en pools elegibles, correos de recompensa y reclamos de ganadores.',
    'sponsor.tier.fan.include.2':
      'Regalo, descuento o beneficio digital unido a paquetes de ganadores seleccionados.',
    'sponsor.tier.fan.include.3':
      'Un prompt de reseña tras entrega con calificación y cita opcionales.',
    'sponsor.tier.fan.include.4':
      'Resumen básico con entradas, estado de cumplimiento y respuestas de reseña.',
    'sponsor.tier.fan.include.5':
      'Ruta de mejora a patrocinador destacado si la campaña funciona bien.',
    'sponsor.addon.1': 'Landing page personalizada para un drop de producto',
    'sponsor.addon.2': 'Videos extra de reseñas de ganadores o clips cortos',
    'sponsor.addon.3': 'Secuencia localizada de email y SMS',
    'sponsor.addon.4': 'Segmentación por ciudad sede o equipo',
    'sponsor.addon.5': 'Reel resumen estilo creador con envíos de ganadores',
    'sponsor.addon.6': 'Exportación de dashboard con métricas de campaña',
    'footer.experimentCopy': 'Un experimento de',
    'footer.experiment': 'Experimento',
    'footer.aria': 'Navegación del pie',
    'score.decrease': 'Bajar marcador de {label}',
    'score.predictedGoals': 'Goles previstos de {label}',
    'score.increase': 'Subir marcador de {label}',
  },
  pt: {
    'language.selector.label': 'Escolher idioma',
    'language.selector.shortLabel': 'Idioma',
    'nav.primaryAria': 'Navegação principal',
    'nav.fixtures': 'Jogos',
    'nav.teams': 'Times',
    'nav.prizes': 'Prêmios',
    'nav.sponsors': 'Patrocinadores',
    'nav.rewards': 'Recompensas',
    'nav.operations': 'Operações',
    'nav.accountStatus': '{lockedCount} travadas · {drawCount} sorteios',
    'ai.aria': 'Divulgação de construção por IA',
    'ai.usageAria': 'Uso estimado de IA',
    'ai.built': 'Construído totalmente por IA',
    'ai.totalTokens': 'Tokens totais',
    'ai.estimatedCost': 'Custo estimado',
    'ai.costLabel': 'Estimativa equivalente à API',
    'ai.note': 'Estimado pela atividade do Codex; não é recibo de cobrança.',
    'route.fixtures.kicker': 'Jogos',
    'route.fixtures.title': 'Escolha, marque, trave',
    'route.fixtures.copy':
      'Preveja placares, trave recibos e entre em sorteios financiados por patrocinadores quando acertar o resultado.',
    'route.teams.kicker': 'Times',
    'route.teams.title': 'Times e calendário',
    'route.teams.copy':
      'Veja times participantes, grupos, jogos, horários e o calendário do time escolhido.',
    'route.draws.kicker': 'Sorteios',
    'route.draws.title': 'Sorteios de vencedores por jogo',
    'route.draws.copy':
      'Execute revelações determinísticas com recibos elegíveis, suplentes, resultados do participante e metadados de auditoria.',
    'route.shirts.kicker': 'Camisetas',
    'route.shirts.title': 'Estúdio de camisetas localizadas',
    'route.shirts.copy':
      'Pré-visualize conceitos independentes de camisetas de torcedor que mudam com o time escolhido.',
    'route.rewards.kicker': 'Recompensas',
    'route.rewards.title': 'Enviar, rastrear, avaliar',
    'route.rewards.copy':
      'Leve vencedores por pacotes de patrocinador, camisetas localizadas, filas de fulfillment e pedidos de avaliação pós-entrega.',
    'route.operations.kicker': 'Operações',
    'route.operations.title': 'Plano de POD, 3PL e provedores',
    'route.operations.copy':
      'Veja como produção de camisetas, kits de patrocinador, provedores de infraestrutura e operações de campanha se encaixam.',
    'json.predictions.kicker': 'Sistema de previsão',
    'json.predictions.title': 'Escolha, marque, trave',
    'json.teams.kicker': 'Retrato do torneio',
    'json.teams.title': 'Times e calendário da fase de grupos',
    'json.draws.kicker': 'Sorteio de vencedor',
    'json.draws.title': 'Executar sorteios por jogo',
    'json.shirts.kicker': 'Recompensa localizada',
    'json.shirts.title': 'Estúdio de camiseta de torcedor',
    'json.rewards.kicker': 'Depois do sorteio',
    'json.rewards.title': 'Enviar, rastrear, avaliar',
    'json.operations.kicker': 'Operações',
    'json.operations.title': 'POD, 3PL e Stripe Projects',
    'flow.aria': 'Fluxo de previsão',
    'flow.stagesAria': 'Etapas do fluxo de previsão',
    'flow.header': 'Fluxo de jogo',
    'flow.predict.label': 'Prever',
    'flow.predict.meta': '{count} travadas',
    'flow.teams.label': 'Times',
    'flow.teams.meta': '48 times',
    'flow.draw.label': 'Sorteio',
    'flow.draw.meta': '{count} completos',
    'flow.prize.label': 'Prêmio',
    'flow.prize.meta': 'Camiseta grátis',
    'flow.personalize.label': 'Personalizar',
    'flow.fulfill.label': 'Cumprir',
    'flow.fulfill.meta': '{count} na fila',
    'flow.review.label': 'Avaliar',
    'flow.review.meta': '{count} enviados',
    'hero.title': 'Preveja {home} vs {away}',
    'hero.subtitle':
      'Defina o placar, trave uma entrada no sorteio e veja o pacote de prêmio patrocinado antes de sair da primeira tela.',
    'hero.supporterModeAria': 'Modo torcedor',
    'hero.selectedMatchDetailsAria': 'Detalhes do jogo selecionado',
    'hero.status.awaitingResult': 'Aguardando resultado',
    'hero.status.kickoffDay': 'Início em {count} dia',
    'hero.status.kickoffDays': 'Início em {count} dias',
    'hero.status.kickoffHour': 'Início em {count} hora',
    'hero.status.kickoffHours': 'Início em {count} horas',
    'hero.match': 'Jogo {number}',
    'hero.group': 'Grupo {group}',
    'hero.draw': 'Empate',
    'hero.scoreAria': '{home} {homeScore}, {away} {awayScore}',
    'hero.predictedOutcome': 'Resultado previsto',
    'hero.entryReceived': 'Entrada recebida',
    'hero.lockPrediction': 'Travar previsão',
    'hero.prizeBundleAria': 'Detalhes do pacote de prêmio',
    'hero.sponsorPrizeBundle': 'Pacote de prêmio do patrocinador',
    'hero.winners': 'Vencedores',
    'hero.joined': 'Participantes',
    'hero.sponsor': 'Patrocinador',
    'hero.sponsorThisMatch': 'Patrocine este jogo',
    'hero.guardrailNoteSuffix':
      'Apenas recompensas independentes para fãs; nenhuma marca oficial de time, torneio, federação, jogador ou patrocinador é usada.',
    'hero.upcomingAria': 'Trilho de próximos jogos',
    'hero.upcomingMatches': 'Próximos jogos',
    'hero.browseNearbyFixtures': 'Explorar jogos próximos',
    'hero.fullFixtures': 'Todos os jogos',
    'hero.receiptSaved': 'Recibo salvo',
    'hero.fixturePrizeMeta': '{count} vencedores · {tag}',
    'receipt.aria': 'Recibo de previsão',
    'receipt.kicker': 'Recibo',
    'receipt.title': 'Previsão travada',
    'receipt.match': 'Jogo',
    'receipt.prediction': 'Previsão',
    'receipt.email': 'E-mail',
    'receipt.hash': 'Hash do recibo',
    'receipt.prizeBundle': 'Pacote de prêmio',
    'receipt.followup':
      'Acompanhe atualizações do sorteio neste e-mail. O endereço de envio fica no servidor para elegibilidade e revisão do presente do patrocinador, e não aparece aqui.',
    'receipt.fallback':
      'Este ambiente retornou um recibo alternativo não persistente.',
    'modal.drawEntry': 'Entrada no sorteio',
    'modal.title': 'Complete sua entrada de previsão',
    'modal.copy':
      'Os dados de envio nos EUA são coletados agora porque patrocinadores podem enviar presentes a mais participantes após revisão de elegibilidade.',
    'modal.close': 'Fechar',
    'modal.closeAria': 'Fechar formulário',
    'modal.summaryPrediction':
      'Previsão: {prediction} · {winnerSlots} vagas vencedoras · {sponsor}',
    'modal.firstName': 'Nome',
    'modal.lastName': 'Sobrenome',
    'modal.email': 'E-mail',
    'modal.phone': 'Telefone',
    'modal.address1': 'Endereço linha 1',
    'modal.address2': 'Endereço linha 2',
    'modal.city': 'Cidade',
    'modal.state': 'Estado',
    'modal.zip': 'CEP/ZIP',
    'modal.rulesStrong':
      'Sou elegível e aceito as regras e termos de privacidade.',
    'modal.rulesCopy':
      'Este MVP é apenas para os EUA e exige revisão segura de prêmios antes de qualquer campanha real.',
    'modal.marketingStrong':
      'Enviar atualizações opcionais de patrocinadores e sorteios.',
    'modal.marketingCopy':
      'O consentimento é opcional e não afeta a elegibilidade.',
    'modal.errorCheck': 'Confira os campos destacados antes de enviar.',
    'modal.errorRetry': 'A entrada não pôde ser salva. Tente novamente.',
    'modal.cancel': 'Cancelar',
    'modal.submitting': 'Enviando',
    'modal.submit': 'Enviar entrada',
    'team.kicker': 'Time de apoio',
    'team.title': 'Escolha seu time',
    'prize.kicker': 'Sorteio de prêmio',
    'prize.title': 'Ganhe a camiseta do time escolhido',
    'prize.copy':
      'Cada vencedor qualificado recebe uma camiseta localizada grátis do time escolhido. São designs independentes de fãs sem marcas oficiais de torneio, federação, jogador ou patrocinador.',
    'prize.teamPrize': 'Prêmio {team}',
    'prize.selectedColorsAria': 'Cores do prêmio selecionado',
    'prize.noOfficialMarks':
      'Sem marcas oficiais, escudos, jogadores ou logos de patrocinadores.',
    'prize.viewTeamPrize': 'Ver prêmio do time',
    'prize.makePicks': 'Fazer palpites',
    'prize.previewsAria': 'Prévia dos prêmios dos times',
    'prize.details': 'Detalhes do prêmio',
    'prize.allPrizes': 'Todos os prêmios',
    'prize.selectTeam': 'Selecionar {code}',
    'prize.pageKicker': 'Página do prêmio {team}',
    'prize.enterDraw': 'Entrar em sorteio',
    'prize.fulfillmentFlow': 'Fluxo de fulfillment',
    'prize.winnerPackage': 'Pacote do vencedor',
    'prize.printDirection': 'Direção de impressão',
    'prize.webRepresentation': 'Representação na web',
    'prize.safetyBoundary': 'Limite de segurança',
    'prize.safetyCopy':
      'Design independente para fãs. Nenhuma marca oficial de time, torneio, federação, patrocinador, jogador, mascote, troféu, escudo ou fabricante é usada ou sugerida.',
    'sponsor.kicker': 'Pacotes de patrocínio',
    'sponsor.title': 'Financie recompensas que fãs lembram',
    'sponsor.copy':
      'Patrocinadores financiam campanhas de jogo, presentes para vencedores, drops de camisetas localizadas e pedidos de avaliação pós-entrega. Os pacotes são feitos para amostragem, prova de mídia e engajamento mensurável.',
    'sponsor.tiersAria': 'Níveis de patrocínio',
    'sponsor.addonsKicker': 'Extras criativos',
    'sponsor.addonsTitle': 'Mais formas de montar a campanha',
    'sponsor.addonsCopy':
      'Extras mantêm os pacotes centrais simples e dão a marcas, agências e parceiros regionais mais espaço para moldar a ativação.',
    'sponsor.compliance':
      'Campanhas de patrocinador devem ficar separadas de marcas oficiais de torneio, federação, jogador, escudo e mascote. Linguagem de prêmio, avaliação e fulfillment deve ser revisada antes de campanhas ao vivo.',
    'sponsor.tier.global.name': 'Parceiro Global Cup',
    'sponsor.tier.global.signal': 'Presença no torneio inteiro',
    'sponsor.tier.global.spots': '2 vagas',
    'sponsor.tier.global.summary':
      'O pacote principal para marcas que querem estar em toda a experiência de previsão, não só em uma janela de jogo.',
    'sponsor.tier.global.creative':
      'Ideal para lançamentos nacionais, produtos herói, viagem, eletrônicos, sportswear, delivery, streaming, telecom, fintech e experiências de fãs.',
    'sponsor.tier.global.include.1':
      'Posicionamento destacado no site, workspace de previsão, fluxo de prêmio e follow-ups de vencedores.',
    'sponsor.tier.global.include.2':
      'Dez vídeos de avaliação de vencedores de alta qualidade após entrega com prompt guiado.',
    'sponsor.tier.global.include.3':
      'Presentes de produto enviados a vencedores selecionados junto com a camiseta localizada.',
    'sponsor.tier.global.include.4':
      'Bloco de história do patrocinador com educação segura da marca, links e relatório.',
    'sponsor.tier.global.include.5':
      'Revisão prioritária de bloqueio de categoria para evitar concorrentes diretos na mesma posição.',
    'sponsor.tier.matchday.name': 'Patrocinador destaque de jogo',
    'sponsor.tier.matchday.signal': 'Jogo destaque ou campanha regional',
    'sponsor.tier.matchday.spots': '10 vagas',
    'sponsor.tier.matchday.summary':
      'Pacote de alta visibilidade para patrocinadores que querem uma campanha focada em jogos, mercados ou comunidades.',
    'sponsor.tier.matchday.creative':
      'Ideal para lançamentos de jogo, promoções, watch parties, amostragem, ativações de cidade e momentos de mercado.',
    'sponsor.tier.matchday.include.1':
      'Posição destacada em cards de jogo, recibos de previsão e telas de sorteio qualificado.',
    'sponsor.tier.matchday.include.2':
      'Presente ou voucher do patrocinador na fila de fulfillment da campanha.',
    'sponsor.tier.matchday.include.3':
      'Três prompts de avaliação guiados com perguntas para foto/vídeo e pontos aprovados.',
    'sponsor.tier.matchday.include.4':
      'Segmentação regional ou por time, como cidades-sede, mercados de idioma ou torcidas escolhidas.',
    'sponsor.tier.matchday.include.5':
      'Resumo pós-campanha de entradas, sorteios qualificados, vencedores, envio e avaliações.',
    'sponsor.tier.fan.name': 'Patrocinador Fan Drop',
    'sponsor.tier.fan.signal': 'Pacote acessível de amostragem',
    'sponsor.tier.fan.spots': '30 vagas',
    'sponsor.tier.fan.summary':
      'Pacote mais leve para marcas que querem testar demanda, semear produtos e alcançar fãs sem campanha completa.',
    'sponsor.tier.fan.creative':
      'Ideal para startups, lojas locais, produtos de criadores, snacks, apps, merch, wellness, acessórios e ofertas digitais.',
    'sponsor.tier.fan.include.1':
      'Menção do patrocinador em pools elegíveis, e-mails de recompensa e momentos de reivindicação.',
    'sponsor.tier.fan.include.2':
      'Presente, desconto ou benefício digital anexado a pacotes de vencedores selecionados.',
    'sponsor.tier.fan.include.3':
      'Um prompt de avaliação após entrega com nota e citação opcionais.',
    'sponsor.tier.fan.include.4':
      'Resumo básico com entradas, status de fulfillment e respostas de avaliação.',
    'sponsor.tier.fan.include.5':
      'Caminho de upgrade para patrocinador destaque se a campanha performar bem.',
    'sponsor.addon.1': 'Landing page personalizada para drop de produto',
    'sponsor.addon.2': 'Vídeos extras de avaliação ou clipes curtos',
    'sponsor.addon.3': 'Sequência localizada de e-mail e SMS',
    'sponsor.addon.4': 'Segmentação por cidade-sede ou time',
    'sponsor.addon.5': 'Reel resumo estilo creator com envios dos vencedores',
    'sponsor.addon.6': 'Exportação de dashboard com métricas da campanha',
    'footer.experimentCopy': 'Um experimento de',
    'footer.experiment': 'Experimento',
    'footer.aria': 'Navegação do rodapé',
    'score.decrease': 'Diminuir placar de {label}',
    'score.predictedGoals': 'Gols previstos de {label}',
    'score.increase': 'Aumentar placar de {label}',
  },
  zh: {
    'language.selector.label': '选择语言',
    'language.selector.shortLabel': '语言',
    'nav.primaryAria': '主导航',
    'nav.fixtures': '赛程',
    'nav.teams': '球队',
    'nav.prizes': '奖品',
    'nav.sponsors': '赞助',
    'nav.rewards': '奖励',
    'nav.operations': '运营',
    'nav.accountStatus': '{lockedCount} 已锁定 · {drawCount} 次抽奖',
    'ai.aria': 'AI 构建披露',
    'ai.usageAria': 'AI 使用量估算',
    'ai.built': '完全由 AI 构建',
    'ai.totalTokens': 'Token 总数',
    'ai.estimatedCost': '估算成本',
    'ai.costLabel': 'API 等效估算',
    'ai.note': '根据 Codex 构建活动估算；不是账单收据。',
    'route.fixtures.kicker': '赛程',
    'route.fixtures.title': '预测、比分、锁定',
    'route.fixtures.copy':
      '预测比赛比分，锁定收据，并在结果正确时进入赞助商资助的抽奖。',
    'route.teams.kicker': '球队',
    'route.teams.title': '球队与赛程',
    'route.teams.copy':
      '查看参赛球队、分组、比赛、开球时间以及所选支持球队的赛程。',
    'route.draws.kicker': '抽奖',
    'route.draws.title': '按比赛抽取获奖者',
    'route.draws.copy':
      '用合格收据、候补、参与者结果和审计元数据运行确定性的获奖揭晓。',
    'route.shirts.kicker': 'T 恤',
    'route.shirts.title': '本地化球迷 T 恤工作室',
    'route.shirts.copy':
      '预览独立球迷 T 恤概念，并随访客支持的球队而变化。',
    'route.rewards.kicker': '奖励',
    'route.rewards.title': '发货、追踪、评价',
    'route.rewards.copy':
      '让获奖者进入赞助商礼包、本地化 T 恤、履约队列和送达后的评价提示流程。',
    'route.operations.kicker': '运营',
    'route.operations.title': 'POD、3PL 与供应商计划',
    'route.operations.copy':
      '查看 T 恤生产、赞助商礼包、基础设施供应商和活动运营如何协同。',
    'json.predictions.kicker': '预测系统',
    'json.predictions.title': '预测、比分、锁定',
    'json.teams.kicker': '赛事快照',
    'json.teams.title': '球队与小组赛赛程',
    'json.draws.kicker': '获奖抽奖',
    'json.draws.title': '运行比赛级抽奖',
    'json.shirts.kicker': '本地化奖励',
    'json.shirts.title': '球迷 T 恤工作室',
    'json.rewards.kicker': '抽奖之后',
    'json.rewards.title': '发货、追踪、评价',
    'json.operations.kicker': '运营',
    'json.operations.title': 'POD、3PL 与 Stripe Projects',
    'flow.aria': '预测流程',
    'flow.stagesAria': '预测流程阶段',
    'flow.header': '比赛日流程',
    'flow.predict.label': '预测',
    'flow.predict.meta': '{count} 已锁定',
    'flow.teams.label': '球队',
    'flow.teams.meta': '48 支球队',
    'flow.draw.label': '抽奖',
    'flow.draw.meta': '{count} 已完成',
    'flow.prize.label': '奖品',
    'flow.prize.meta': '免费 T 恤',
    'flow.personalize.label': '个性化',
    'flow.fulfill.label': '履约',
    'flow.fulfill.meta': '{count} 排队中',
    'flow.review.label': '评价',
    'flow.review.meta': '{count} 已发送',
    'hero.title': '预测 {home} vs {away}',
    'hero.subtitle':
      '设置比分，锁定抽奖入口，并在首屏查看赞助商资助的奖品包。',
    'hero.supporterModeAria': '球迷模式',
    'hero.selectedMatchDetailsAria': '所选比赛详情',
    'hero.status.awaitingResult': '等待结果快照',
    'hero.status.kickoffDay': '{count} 天后开球',
    'hero.status.kickoffDays': '{count} 天后开球',
    'hero.status.kickoffHour': '{count} 小时后开球',
    'hero.status.kickoffHours': '{count} 小时后开球',
    'hero.match': '比赛 {number}',
    'hero.group': '{group} 组',
    'hero.draw': '平局',
    'hero.scoreAria': '{home} {homeScore}，{away} {awayScore}',
    'hero.predictedOutcome': '预测结果',
    'hero.entryReceived': '已收到入口',
    'hero.lockPrediction': '锁定预测',
    'hero.prizeBundleAria': '奖品包详情',
    'hero.sponsorPrizeBundle': '赞助商奖品包',
    'hero.winners': '获奖者',
    'hero.joined': '已参与',
    'hero.sponsor': '赞助商',
    'hero.sponsorThisMatch': '赞助这场比赛',
    'hero.guardrailNoteSuffix':
      '仅限独立球迷奖励；不使用任何球队、赛事、协会、球员或赞助商官方标志。',
    'hero.upcomingAria': '即将比赛横栏',
    'hero.upcomingMatches': '即将比赛',
    'hero.browseNearbyFixtures': '浏览附近赛程',
    'hero.fullFixtures': '完整赛程',
    'hero.receiptSaved': '收据已保存',
    'hero.fixturePrizeMeta': '{count} 位获奖者 · {tag}',
    'receipt.aria': '预测收据',
    'receipt.kicker': '收据',
    'receipt.title': '预测已锁定',
    'receipt.match': '比赛',
    'receipt.prediction': '预测',
    'receipt.email': '邮箱',
    'receipt.hash': '收据哈希',
    'receipt.prizeBundle': '奖品包',
    'receipt.followup':
      '请留意此邮箱的抽奖更新。配送地址仅保存在服务器端，用于资格和赞助商礼品审核，不会在此显示。',
    'receipt.fallback': '此环境返回了非持久化备用收据。',
    'modal.drawEntry': '抽奖入口',
    'modal.title': '完成你的预测入口',
    'modal.copy':
      '现在收集美国配送信息，因为赞助商可能会在资格审核后向更多参与者发送礼品。',
    'modal.close': '关闭',
    'modal.closeAria': '关闭入口表单',
    'modal.summaryPrediction':
      '预测：{prediction} · {winnerSlots} 个获奖名额 · {sponsor}',
    'modal.firstName': '名',
    'modal.lastName': '姓',
    'modal.email': '邮箱',
    'modal.phone': '电话',
    'modal.address1': '地址行 1',
    'modal.address2': '地址行 2',
    'modal.city': '城市',
    'modal.state': '州',
    'modal.zip': '邮编',
    'modal.rulesStrong': '我符合资格并接受规则/隐私条款。',
    'modal.rulesCopy':
      '此 MVP 仅限美国，在任何真实活动前都需要完成赞助商安全奖品审核。',
    'modal.marketingStrong': '发送可选的赞助商和抽奖更新。',
    'modal.marketingCopy': '同意是可选的，不影响入口资格。',
    'modal.errorCheck': '提交前请检查高亮字段。',
    'modal.errorRetry': '预测入口无法保存。请重试。',
    'modal.cancel': '取消',
    'modal.submitting': '提交中',
    'modal.submit': '提交入口',
    'team.kicker': '支持球队',
    'team.title': '选择你的球队',
    'prize.kicker': '奖品抽奖',
    'prize.title': '赢取你选择球队的 T 恤',
    'prize.copy':
      '每位合格抽奖获奖者都会获得一件所选球队的免费本地化球迷 T 恤。这些是独立球迷设计，不含官方赛事、协会、球员或赞助商品牌。',
    'prize.teamPrize': '{team} 奖品',
    'prize.selectedColorsAria': '所选奖品颜色',
    'prize.noOfficialMarks': '不含官方标志、队徽、球员或赞助商 logo。',
    'prize.viewTeamPrize': '查看球队奖品',
    'prize.makePicks': '进行预测',
    'prize.previewsAria': '球队奖品预览',
    'prize.details': '奖品详情',
    'prize.allPrizes': '全部奖品',
    'prize.selectTeam': '选择 {code}',
    'prize.pageKicker': '{team} 奖品页',
    'prize.enterDraw': '进入抽奖',
    'prize.fulfillmentFlow': '履约流程',
    'prize.winnerPackage': '获奖者包裹',
    'prize.printDirection': '印刷方向',
    'prize.webRepresentation': '网页呈现',
    'prize.safetyBoundary': '安全边界',
    'prize.safetyCopy':
      '独立球迷设计。不使用或暗示任何球队、赛事、协会、赞助商、球员、吉祥物、奖杯、队徽、盾牌或制造商官方品牌。',
    'sponsor.kicker': '赞助套餐',
    'sponsor.title': '资助球迷会记住的奖励',
    'sponsor.copy':
      '赞助商资助比赛活动、获奖者产品礼物、本地化 T 恤投放和送达后评价提示。套餐用于产品试用、媒体证明和可衡量的球迷互动。',
    'sponsor.tiersAria': '赞助等级',
    'sponsor.addonsKicker': '创意附加项',
    'sponsor.addonsTitle': '更多活动构建方式',
    'sponsor.addonsCopy':
      '附加项让核心套餐保持简单，同时给大品牌、机构和区域伙伴更多激活空间。',
    'sponsor.compliance':
      '赞助活动必须与官方赛事、协会、球员、队徽和吉祥物标志保持分离。任何上线活动前都应审查奖品、评价和履约文案。',
    'sponsor.tier.global.name': 'Global Cup 合作伙伴',
    'sponsor.tier.global.signal': '覆盖整个赛事的赞助曝光',
    'sponsor.tier.global.spots': '2 个名额',
    'sponsor.tier.global.summary':
      '旗舰套餐，适合希望覆盖整个世界杯预测体验而不只是单一比赛窗口的品牌。',
    'sponsor.tier.global.creative':
      '适合全国发布、主打产品、旅行、电子、运动服、外卖、流媒体、电信、金融科技和球迷体验品牌。',
    'sponsor.tier.global.include.1':
      '在网站、预测空间、奖品流程和获奖者后续触点中获得突出赞助位置。',
    'sponsor.tier.global.include.2':
      '交付后通过引导式评价提示收集十条高质量获奖者产品评价视频。',
    'sponsor.tier.global.include.3':
      '赞助商产品礼品与本地化球迷 T 恤一同寄给选中获奖者。',
    'sponsor.tier.global.include.4':
      '带品牌安全产品教育、优惠链接和活动复盘报告的赞助商故事区块。',
    'sponsor.tier.global.include.5':
      '优先品类排他审核，避免直接竞争者出现在同一顶级赞助位置。',
    'sponsor.tier.matchday.name': '比赛日特色赞助商',
    'sponsor.tier.matchday.signal': '特色比赛或区域活动',
    'sponsor.tier.matchday.spots': '10 个名额',
    'sponsor.tier.matchday.summary':
      '高曝光比赛套餐，适合围绕关键赛程、市场或球迷社群开展聚焦活动的赞助商。',
    'sponsor.tier.matchday.creative':
      '适合比赛发布、零售促销、观赛派对、产品试用、城市激活和特定市场节点。',
    'sponsor.tier.matchday.include.1':
      '在所选比赛卡、预测收据和合格抽奖页面中获得特色展示。',
    'sponsor.tier.matchday.include.2':
      '赞助商产品礼物或礼券进入指定活动的获奖者履约队列。',
    'sponsor.tier.matchday.include.3':
      '三条引导式获奖者评价提示，含适合照片/视频的问题和赞助商批准要点。',
    'sponsor.tier.matchday.include.4':
      '区域或球队主题定向，例如主办城市球迷、语言市场或选定支持球队。',
    'sponsor.tier.matchday.include.5':
      '活动后总结，覆盖入口、合格抽奖、获奖者、发货状态和评价完成。',
    'sponsor.tier.fan.name': 'Fan Drop 赞助商',
    'sponsor.tier.fan.signal': '易进入的产品试用套餐',
    'sponsor.tier.fan.spots': '30 个名额',
    'sponsor.tier.fan.summary':
      '较轻量套餐，适合想测试需求、投放产品并触达球迷，但不拥有完整比赛活动的品牌。',
    'sponsor.tier.fan.creative':
      '适合初创、本地商家、创作者产品、零食、应用、周边、健康、配件和数字优惠。',
    'sponsor.tier.fan.include.1':
      '在合格抽奖池、奖励邮件和获奖者领取节点中出现赞助商提及。',
    'sponsor.tier.fan.include.2':
      '产品礼物、折扣码或数字权益附加到选中获奖者包裹。',
    'sponsor.tier.fan.include.3':
      '送达后一条引导评价提示，可选产品评分和引用。',
    'sponsor.tier.fan.include.4':
      '基础赞助商复盘，包含领取入口、履约状态和评价反馈。',
    'sponsor.tier.fan.include.5':
      '若活动表现良好，可升级到比赛日特色赞助商。',
    'sponsor.addon.1': '赞助商产品投放专属落地页',
    'sponsor.addon.2': '额外获奖者评价视频或短视频',
    'sponsor.addon.3': '本地化邮件和短信跟进序列',
    'sponsor.addon.4': '主办城市或支持球队定向套餐',
    'sponsor.addon.5': '基于获奖者提交内容的创作者风格复盘短片',
    'sponsor.addon.6': '带活动指标的赞助商仪表盘导出',
    'footer.experimentCopy': '来自',
    'footer.experiment': '实验',
    'footer.aria': '页脚导航',
    'score.decrease': '降低 {label} 分数',
    'score.predictedGoals': '{label} 预测进球',
    'score.increase': '提高 {label} 分数',
  },
  ko: {
    'language.selector.label': '언어 선택',
    'language.selector.shortLabel': '언어',
    'nav.primaryAria': '기본 내비게이션',
    'nav.fixtures': '경기',
    'nav.teams': '팀',
    'nav.prizes': '상품',
    'nav.sponsors': '스폰서',
    'nav.rewards': '리워드',
    'nav.operations': '운영',
    'nav.accountStatus': '{lockedCount}개 잠금 · 추첨 {drawCount}개',
    'ai.aria': 'AI 빌드 고지',
    'ai.usageAria': '예상 AI 사용량',
    'ai.built': '전부 AI로 구축',
    'ai.totalTokens': '총 토큰',
    'ai.estimatedCost': '예상 비용',
    'ai.costLabel': 'API 상당 추정치',
    'ai.note': 'Codex 빌드 활동 기준 추정치이며 청구 영수증이 아닙니다.',
    'route.fixtures.kicker': '경기',
    'route.fixtures.title': '예측하고, 점수 넣고, 잠그기',
    'route.fixtures.copy':
      '경기 점수를 예측하고 영수증을 잠근 뒤 결과가 맞으면 스폰서 후원 추첨에 참여하세요.',
    'route.teams.kicker': '팀',
    'route.teams.title': '팀과 일정',
    'route.teams.copy':
      '참가 팀, 조, 경기, 킥오프 시간, 선택한 응원팀 일정을 확인하세요.',
    'route.draws.kicker': '추첨',
    'route.draws.title': '경기별 당첨자 추첨',
    'route.draws.copy':
      '적격 영수증, 대기자, 참가자 결과, 감사 메타데이터가 있는 결정적 당첨 공개를 실행합니다.',
    'route.shirts.kicker': '셔츠',
    'route.shirts.title': '현지화 셔츠 스튜디오',
    'route.shirts.copy':
      '방문자가 응원하는 팀에 따라 바뀌는 독립 응원 셔츠 콘셉트를 미리 봅니다.',
    'route.rewards.kicker': '리워드',
    'route.rewards.title': '배송, 추적, 리뷰',
    'route.rewards.copy':
      '당첨자를 스폰서 패키지, 현지화 셔츠, 배송 처리 대기열, 배송 후 리뷰 요청으로 이동시킵니다.',
    'route.operations.kicker': '운영',
    'route.operations.title': 'POD, 3PL, 제공업체 계획',
    'route.operations.copy':
      '셔츠 제작, 스폰서 키트, 인프라 제공업체, 캠페인 운영이 어떻게 맞물리는지 확인합니다.',
    'json.predictions.kicker': '예측 시스템',
    'json.predictions.title': '예측하고, 점수 넣고, 잠그기',
    'json.teams.kicker': '토너먼트 스냅샷',
    'json.teams.title': '팀과 조별리그 일정',
    'json.draws.kicker': '당첨 추첨',
    'json.draws.title': '경기별 추첨 실행',
    'json.shirts.kicker': '현지화 리워드',
    'json.shirts.title': '응원 셔츠 스튜디오',
    'json.rewards.kicker': '추첨 이후',
    'json.rewards.title': '배송, 추적, 리뷰',
    'json.operations.kicker': '운영',
    'json.operations.title': 'POD, 3PL, Stripe Projects',
    'flow.aria': '예측 워크플로',
    'flow.stagesAria': '예측 워크플로 단계',
    'flow.header': '매치데이 흐름',
    'flow.predict.label': '예측',
    'flow.predict.meta': '{count}개 잠금',
    'flow.teams.label': '팀',
    'flow.teams.meta': '48팀',
    'flow.draw.label': '추첨',
    'flow.draw.meta': '{count}개 완료',
    'flow.prize.label': '상품',
    'flow.prize.meta': '무료 셔츠',
    'flow.personalize.label': '개인화',
    'flow.fulfill.label': '처리',
    'flow.fulfill.meta': '{count}개 대기',
    'flow.review.label': '리뷰',
    'flow.review.meta': '{count}개 발송',
    'hero.title': '{home} vs {away} 예측',
    'hero.subtitle':
      '점수를 설정하고 추첨 엔트리를 잠근 뒤 첫 화면에서 스폰서 후원 상품 패키지를 확인하세요.',
    'hero.supporterModeAria': '응원 모드',
    'hero.selectedMatchDetailsAria': '선택한 경기 상세',
    'hero.status.awaitingResult': '결과 스냅샷 대기 중',
    'hero.status.kickoffDay': '{count}일 후 킥오프',
    'hero.status.kickoffDays': '{count}일 후 킥오프',
    'hero.status.kickoffHour': '{count}시간 후 킥오프',
    'hero.status.kickoffHours': '{count}시간 후 킥오프',
    'hero.match': '경기 {number}',
    'hero.group': '{group}조',
    'hero.draw': '무승부',
    'hero.scoreAria': '{home} {homeScore}, {away} {awayScore}',
    'hero.predictedOutcome': '예상 결과',
    'hero.entryReceived': '엔트리 접수',
    'hero.lockPrediction': '예측 잠그기',
    'hero.prizeBundleAria': '상품 패키지 상세',
    'hero.sponsorPrizeBundle': '스폰서 상품 패키지',
    'hero.winners': '당첨자',
    'hero.joined': '참여',
    'hero.sponsor': '스폰서',
    'hero.sponsorThisMatch': '이 경기 후원',
    'hero.guardrailNoteSuffix':
      '독립 팬 리워드만 제공되며 공식 팀, 대회, 협회, 선수, 스폰서 마크는 사용하지 않습니다.',
    'hero.upcomingAria': '다가오는 경기 레일',
    'hero.upcomingMatches': '다가오는 경기',
    'hero.browseNearbyFixtures': '근처 경기 보기',
    'hero.fullFixtures': '전체 경기',
    'hero.receiptSaved': '영수증 저장됨',
    'hero.fixturePrizeMeta': '당첨자 {count}명 · {tag}',
    'receipt.aria': '예측 영수증',
    'receipt.kicker': '영수증',
    'receipt.title': '예측 잠금 완료',
    'receipt.match': '경기',
    'receipt.prediction': '예측',
    'receipt.email': '이메일',
    'receipt.hash': '영수증 해시',
    'receipt.prizeBundle': '상품 패키지',
    'receipt.followup':
      '이 이메일로 추첨 업데이트를 확인하세요. 배송 주소는 자격 및 스폰서 선물 검토를 위해 서버에만 저장되며 여기에는 표시되지 않습니다.',
    'receipt.fallback': '이 환경은 비영구 백업 영수증을 반환했습니다.',
    'modal.drawEntry': '추첨 엔트리',
    'modal.title': '예측 엔트리 완료',
    'modal.copy':
      '스폰서가 자격 검토 후 더 많은 참가자에게 선물을 보낼 수 있으므로 미국 배송 정보를 지금 수집합니다.',
    'modal.close': '닫기',
    'modal.closeAria': '엔트리 양식 닫기',
    'modal.summaryPrediction':
      '예측: {prediction} · 당첨 슬롯 {winnerSlots}개 · {sponsor}',
    'modal.firstName': '이름',
    'modal.lastName': '성',
    'modal.email': '이메일',
    'modal.phone': '전화',
    'modal.address1': '주소 1',
    'modal.address2': '주소 2',
    'modal.city': '도시',
    'modal.state': '주',
    'modal.zip': 'ZIP 코드',
    'modal.rulesStrong': '자격이 있으며 규칙/개인정보 조건에 동의합니다.',
    'modal.rulesCopy':
      '이 MVP는 미국 전용이며 실제 캠페인 전 스폰서 안전 상품 검토가 필요합니다.',
    'modal.marketingStrong': '선택적 스폰서 및 추첨 업데이트를 받습니다.',
    'modal.marketingCopy': '동의는 선택이며 엔트리 자격에 영향을 주지 않습니다.',
    'modal.errorCheck': '제출 전 강조된 필드를 확인하세요.',
    'modal.errorRetry': '예측 엔트리를 저장할 수 없습니다. 다시 시도하세요.',
    'modal.cancel': '취소',
    'modal.submitting': '제출 중',
    'modal.submit': '엔트리 제출',
    'team.kicker': '응원팀',
    'team.title': '팀 선택',
    'prize.kicker': '상품 추첨',
    'prize.title': '선택한 팀 셔츠 받기',
    'prize.copy':
      '각 적격 추첨 당첨자는 선택한 팀의 무료 현지화 응원 셔츠를 받습니다. 공식 대회, 협회, 선수, 스폰서 브랜딩이 없는 독립 팬 디자인입니다.',
    'prize.teamPrize': '{team} 상품',
    'prize.selectedColorsAria': '선택한 상품 색상',
    'prize.noOfficialMarks':
      '공식 마크, 엠블럼, 선수, 스폰서 로고 없음.',
    'prize.viewTeamPrize': '팀 상품 보기',
    'prize.makePicks': '예측하기',
    'prize.previewsAria': '팀 상품 미리보기',
    'prize.details': '상품 상세',
    'prize.allPrizes': '모든 상품',
    'prize.selectTeam': '{code} 선택',
    'prize.pageKicker': '{team} 상품 페이지',
    'prize.enterDraw': '추첨 참여',
    'prize.fulfillmentFlow': '처리 흐름',
    'prize.winnerPackage': '당첨자 패키지',
    'prize.printDirection': '인쇄 방향',
    'prize.webRepresentation': '웹 UI 표현',
    'prize.safetyBoundary': '안전 경계',
    'prize.safetyCopy':
      '독립 팬 디자인입니다. 공식 팀, 대회, 협회, 스폰서, 선수, 마스코트, 트로피, 엠블럼, 방패, 제조사 브랜딩을 사용하거나 암시하지 않습니다.',
    'sponsor.kicker': '스폰서 패키지',
    'sponsor.title': '팬이 기억할 리워드를 후원하세요',
    'sponsor.copy':
      '스폰서는 경기 캠페인, 당첨자 제품 선물, 현지화 셔츠 드롭, 배송 후 리뷰 요청을 후원합니다. 패키지는 샘플링, 미디어 증거, 측정 가능한 팬 참여를 위해 설계되었습니다.',
    'sponsor.tiersAria': '스폰서십 등급',
    'sponsor.addonsKicker': '크리에이티브 추가 옵션',
    'sponsor.addonsTitle': '캠페인을 만드는 더 많은 방법',
    'sponsor.addonsCopy':
      '추가 옵션은 핵심 패키지를 단순하게 유지하면서 대형 브랜드, 에이전시, 지역 파트너가 활성화를 더 세밀하게 만들 수 있게 합니다.',
    'sponsor.compliance':
      '스폰서 캠페인은 공식 대회, 협회, 선수, 엠블럼, 마스코트 마크와 분리되어야 합니다. 실제 캠페인 전 상품, 리뷰, 처리 문구를 검토해야 합니다.',
    'sponsor.tier.global.name': 'Global Cup 파트너',
    'sponsor.tier.global.signal': '토너먼트 전체 스폰서 노출',
    'sponsor.tier.global.spots': '2자리',
    'sponsor.tier.global.summary':
      '단일 경기 창이 아니라 전체 월드컵 예측 경험 전반에 자리하고 싶은 브랜드를 위한 플래그십 패키지입니다.',
    'sponsor.tier.global.creative':
      '전국 출시, 대표 제품, 여행, 전자제품, 스포츠웨어, 배달, 스트리밍, 통신, 핀테크, 팬 경험 브랜드에 적합합니다.',
    'sponsor.tier.global.include.1':
      '웹사이트, 예측 공간, 상품 흐름, 당첨자 후속 순간의 주요 스폰서 배치.',
    'sponsor.tier.global.include.2':
      '배송 후 안내된 리뷰 프롬프트로 수집하는 고품질 당첨자 제품 리뷰 영상 10개.',
    'sponsor.tier.global.include.3':
      '현지화 응원 셔츠와 함께 선택 당첨자에게 배송되는 스폰서 제품 선물.',
    'sponsor.tier.global.include.4':
      '브랜드 안전 제품 교육, 오퍼 링크, 캠페인 리포트를 포함한 스폰서 스토리 블록.',
    'sponsor.tier.global.include.5':
      '직접 경쟁사가 같은 최상위 위치에 배치되지 않도록 하는 우선 카테고리 검토.',
    'sponsor.tier.matchday.name': '매치데이 추천 스폰서',
    'sponsor.tier.matchday.signal': '추천 경기 또는 지역 캠페인',
    'sponsor.tier.matchday.spots': '10자리',
    'sponsor.tier.matchday.summary':
      '주요 경기, 시장, 응원 커뮤니티를 중심으로 집중 캠페인을 원하는 스폰서를 위한 고노출 패키지입니다.',
    'sponsor.tier.matchday.creative':
      '경기 출시, 리테일 프로모션, 관람 파티, 샘플링, 도시 활성화, 시장별 순간에 적합합니다.',
    'sponsor.tier.matchday.include.1':
      '선택한 경기 카드, 예측 영수증, 적격 추첨 화면의 추천 배치.',
    'sponsor.tier.matchday.include.2':
      '지정 캠페인의 당첨자 처리 대기열에 포함되는 스폰서 제품 선물 또는 바우처.',
    'sponsor.tier.matchday.include.3':
      '사진/영상에 맞춘 질문과 승인된 메시지가 있는 당첨자 리뷰 프롬프트 3개.',
    'sponsor.tier.matchday.include.4':
      '개최 도시 팬, 언어 시장, 선택 응원팀 등 지역 또는 팀 테마 타깃팅.',
    'sponsor.tier.matchday.include.5':
      '엔트리, 적격 추첨, 당첨자, 배송 상태, 리뷰 완료를 다루는 캠페인 요약.',
    'sponsor.tier.fan.name': 'Fan Drop 스폰서',
    'sponsor.tier.fan.signal': '접근 가능한 제품 샘플링 패키지',
    'sponsor.tier.fan.spots': '30자리',
    'sponsor.tier.fan.summary':
      '전체 경기 캠페인을 소유하지 않고도 수요를 테스트하고 제품을 심고 팬에게 도달하려는 브랜드를 위한 가벼운 패키지입니다.',
    'sponsor.tier.fan.creative':
      '스타트업, 지역 상점, 크리에이터 제품, 스낵, 앱, 굿즈, 웰니스, 액세서리, 디지털 오퍼에 적합합니다.',
    'sponsor.tier.fan.include.1':
      '적격 추첨 풀, 리워드 이메일, 당첨자 클레임 순간의 스폰서 언급.',
    'sponsor.tier.fan.include.2':
      '선택 당첨자 패키지에 연결되는 제품 선물, 할인 코드 또는 디지털 혜택.',
    'sponsor.tier.fan.include.3':
      '배송 후 선택적 제품 평점과 인용을 포함한 리뷰 프롬프트 1개.',
    'sponsor.tier.fan.include.4':
      '클레임 엔트리, 당첨자 처리 상태, 리뷰 응답을 포함한 기본 스폰서 요약.',
    'sponsor.tier.fan.include.5':
      '캠페인 성과가 좋으면 매치데이 추천 스폰서로 업그레이드 가능.',
    'sponsor.addon.1': '스폰서 제품 드롭용 맞춤 랜딩 페이지',
    'sponsor.addon.2': '추가 당첨자 리뷰 영상 또는 숏폼 클립',
    'sponsor.addon.3': '현지화 이메일 및 SMS 후속 시퀀스',
    'sponsor.addon.4': '개최 도시 또는 응원팀 타깃팅 패키지',
    'sponsor.addon.5': '당첨자 제출물 기반 크리에이터 스타일 요약 릴',
    'sponsor.addon.6': '캠페인 지표가 포함된 스폰서 대시보드 내보내기',
    'footer.experimentCopy': '실험 제공:',
    'footer.experiment': '실험',
    'footer.aria': '푸터 내비게이션',
    'score.decrease': '{label} 점수 낮추기',
    'score.predictedGoals': '{label} 예상 골',
    'score.increase': '{label} 점수 높이기',
  },
} as const

export type TranslationKey = keyof (typeof messages)['en']
export type Translator = (
  key: TranslationKey,
  values?: TranslationValues,
) => string

const storageKey = 'worldcup.language'
const supportedLanguageCodes = new Set<LanguageCode>(
  languageOptions.map((option) => option.code),
)

function isLanguageCode(value: string | null): value is LanguageCode {
  return Boolean(value && supportedLanguageCodes.has(value as LanguageCode))
}

function getInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en'

  const storedLanguage = (() => {
    try {
      return window.localStorage.getItem(storageKey)
    } catch {
      return null
    }
  })()

  if (isLanguageCode(storedLanguage)) return storedLanguage

  const browserLanguage = window.navigator.language.split('-')[0]

  return isLanguageCode(browserLanguage) ? browserLanguage : 'en'
}

function interpolate(template: string, values: TranslationValues = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    values[key] === undefined ? match : String(values[key]),
  )
}

export function getLanguageOption(language: LanguageCode) {
  return (
    languageOptions.find((option) => option.code === language) ??
    languageOptions[0]
  )
}

export function formatLocalizedNumber(
  value: number,
  language: LanguageCode,
) {
  return new Intl.NumberFormat(getLanguageOption(language).htmlLang).format(value)
}

type I18nContextValue = {
  direction: LanguageDirection
  htmlLang: string
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: Translator
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage)
  const option = getLanguageOption(language)

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage)

    try {
      window.localStorage.setItem(storageKey, nextLanguage)
    } catch {
      // Language still updates for the current session when storage is blocked.
    }
  }, [])

  const t = useCallback<Translator>(
    (key, values) =>
      interpolate(messages[language][key] ?? messages.en[key] ?? key, values),
    [language],
  )

  useEffect(() => {
    document.documentElement.lang = option.htmlLang
    document.documentElement.dir = option.direction
  }, [option.direction, option.htmlLang])

  const value = useMemo<I18nContextValue>(
    () => ({
      direction: option.direction,
      htmlLang: option.htmlLang,
      language,
      setLanguage,
      t,
    }),
    [language, option.direction, option.htmlLang, setLanguage, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider')
  }

  return context
}
