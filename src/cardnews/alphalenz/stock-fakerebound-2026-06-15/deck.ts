import type { AnySlide, CardNewsDeck } from '../../types';

/* AlphaLenz Macro · Stock Angle (2026-06-15) — claude.ai/design 핸드오프(.dc.html) 충실 재현.
   영어 전용 · macro 테마. LinkedIn 4:5 7장 · Instagram 4:5 7장 · Reels 9:16 영상.
   데이터 출처: angle_stock_2026-06-15.pdf */

const linkedinCaption = `Everyone's calling the bottom. The macro data disagrees.

The relief rally looks like recovery — it isn't. Our latest Stock Angle reads the tape and sees a defensive rotation, not a risk-on turn.

The call (conviction 4/5, HIGH):
→ Short NDX
→ Long US10Y

Why we're leaning defensive:
• Consumer sentiment at 49.8 — recession territory
• May CPI 333.98 — disinflation stalling, near the 335 trigger
• Corporate dollar hoarding at a 3.5-year high (USD/KRW ~1,518)
• VIX 17.68 — complacency masking tail risk

The market is pricing a soft landing the data doesn't support. We call it the Fake Rebound: priced on a soft-landing illusion, not a fundamental recovery.

Invalidation is explicit — jobless claims (ICSA) above 250K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable; this one grades 4.5/5.

Full report & live signals → https://alpha-lenz.com/en/angle-reports/2026-06-15-alpha-lenz-stock-report

Not investment advice. For research & informational purposes.

#Macro #Markets #Investing #Nasdaq #Treasuries #FX #AIinFinance #AlphaLenz`;

/* 인스타그램 전용 — 링크가 클릭되지 않고 첫 2줄만 펼침 전에 보이는 매체.
   첫 2줄에 결론까지, URL 대신 프로필 링크 안내, 해시태그 15~20개. 릴스와 공유한다. */
const igCaptionKo = `모두가 바닥을 외친다.
매크로 데이터는 동의하지 않는다 — 이 반등은 신기루다.

방어로 기울이는 이유
• 소비심리(UMCSENT) 49.8 — 50 아래, 침체 영역
• CPI 333.98(5월) — 디스인플레이션 정체, 335 트리거 근접
• 원/달러 1,518 (▲1.43%) — 원화 강세가 아니라 달러 수요
• 신규 실업수당(ICSA) 22.9만 건 — 25만이 트리거
• VIX 17.68 — 낮은 변동성이 테일 리스크를 가린다
• 10Y-2Y +0.39% — 아직 침체는 아니다

시장은 데이터가 뒷받침하지 않는 연착륙을 가격에 넣고 있다. 우리는 이것을 가짜 반등이라 부른다 — 펀더멘털 회복이 아니라 연착륙 착시에 매겨진 값이다. 금리에 민감한 기술주에서 듀레이션으로 로테이션할 국면이다.

무효화 조건: 신규 실업수당이 2주 연속 25만 건을 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하며, 이 앵글은 4.5/5 등급이다.

전체 리포트는 프로필 링크에서 👆

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #나스닥 #채권 #환율 #주식투자 #해외주식 #미국주식 #연준 #금리 #소비심리 #경제지표 #투자공부 #재테크 #AI투자 #AlphaLenz #알파렌즈 #InvestingKR #StockMarket`;

const igCaptionEn = `Everyone is calling the bottom.
The macro data disagrees — this relief rally is a mirage.

WHY WE LEAN DEFENSIVE
• Consumer sentiment (UMCSENT) 49.8 — below 50, in recession territory
• CPI 333.98 in May — disinflation stalling near the 335 trigger
• USD/KRW 1,518 (up 1.43%) — dollar demand, not KRW strength
• Jobless claims (ICSA) 229K — 250K is the trigger
• VIX 17.68 — low vol masks tail risk
• 10Y–2Y +0.39% — not a recession yet

The market is pricing a soft landing the data does not support. We call it the Fake Rebound: priced on a soft-landing illusion, not a fundamental recovery. This is the moment to rotate out of rate-sensitive tech and into duration.

Invalidation: jobless claims above 250K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable; this one grades 4.5/5.

Full report via the link in bio 👆

Not investment advice. For research & informational purposes.

#macro #markets #investing #nasdaq #treasuries #bonds #fx #stocks #stockmarket #fed #interestrates #economy #inflation #quant #aiinfinance #fintech #investor #marketanalysis #AlphaLenz`;

/** 링크드인·인스타·릴스가 공유하는 7장. 배열을 공유하므로 수치 불일치가 발생할 수 없다. */
const slides: AnySlide[] = [
  { type: 'm-cover',
    kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
    title: 'The Fake\nRebound',
    subtitle: 'The relief rally is a mirage. The macro data points to a defensive rotation — out of tech, into duration.',
    signals: [
      { side: 'SHORT', ticker: 'NDX', tone: 'neg' },
      { side: 'LONG', ticker: 'US10Y', tone: 'pos' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'SLOWDOWN' },

  { type: 'm-call',
    idx: '01 / THE CALL',
    title: 'Position for\nHigh-for-Long',
    subtitle: "Rotate out of rate-sensitive tech and into duration. The market is pricing a soft landing the data doesn't support.",
    cards: [
      { tone: 'neg', arrow: '↓', tag: 'REDUCE EXPOSURE', headline: 'Short NDX', desc: 'Nasdaq-100 — the "weak link" of the AI boom under sustained high rates.' },
      { tone: 'pos', arrow: '↑', tag: 'INCREASE EXPOSURE', headline: 'Long US10Y', desc: '10-year Treasuries — duration as the macro reality reasserts itself.' },
    ],
    conviction: 4, max: 5, convText: '4 / 5 · HIGH' },

  { type: 'm-narrative',
    idx: '02 / THE THESIS',
    title: 'Narrative\nvs. Reality',
    narrative: ['Iran ceasefire hopes lift Nasdaq ', { t: '+2.5%', tone: 'white' }, ' and pull USD/KRW back to ', { t: '1,518', tone: 'white' }, '. With ', { t: '70%', tone: 'white' }, ' expecting a rate hold, risk appetite expands — read as "fear is fading."'],
    reality: ['Consumer sentiment sits at ', { t: '49.8', tone: 'white' }, ' — deep in recession territory. May CPI ', { t: '333.98', tone: 'white' }, ' shows disinflation stalling, and firms are hoarding dollars at a ', { t: '3.5-year high', tone: 'white' }, '. High-for-Long is the regime.'],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' a rebound priced on a soft-landing illusion — not a fundamental recovery.'] },

  { type: 'm-data',
    idx: '03 / THE DATA',
    title: 'The macro reality',
    source: 'Source: FRED · price feeds',
    metrics: [
      { code: 'UMCSENT', status: 'RECESSION', statusTone: 'neg', value: '49.8', caption: 'Consumer sentiment · below 50', viz: { kind: 'bar', pct: 49.8, tone: 'neg', marker: 'center' } },
      { code: 'CPI · MAY', status: 'STALLING', statusTone: 'warn', value: '333.98', caption: 'Disinflation stalls · 335 trigger near', viz: { kind: 'bar', pct: 88, tone: 'warn' } },
      { code: 'USD/KRW', status: '▲ 1.43%', statusTone: 'neg', value: '1,518', caption: 'Dollar demand, not KRW strength', viz: { kind: 'bars', heights: [38, 46, 40, 62, 74, 100], tone: 'neg' } },
      { code: 'ICSA', status: 'WATCH', statusTone: 'warn', value: '229K', caption: 'Jobless claims · 250K = trigger', viz: { kind: 'bar', pct: 91.6, tone: 'warn', marker: 'end' } },
      { code: 'VIX', status: 'COMPLACENT', statusTone: 'warn', value: '17.68', caption: 'Low vol masks tail risk', viz: { kind: 'bar', pct: 24, tone: 'pos' } },
      { code: 'T10Y2Y', status: '+0.39', statusTone: 'pos', value: '+0.39%', caption: 'Curve positive · no recession yet', viz: { kind: 'bar', from: 50, pct: 9, tone: 'pos', marker: 'center' } },
    ] },

  { type: 'm-tensions',
    idx: '04 / TENSIONS',
    title: 'Three tensions\nto watch',
    items: [
      { n: '01', text: [{ t: 'Relief rally', tone: 'warn' }, ' on ceasefire hopes vs. a ', { t: 'recessionary consumer', tone: 'neg' }, ' & sticky CPI.'], tags: ['NDX', 'USDKRW', 'US10Y'] },
      { n: '02', text: [{ t: 'AI & semiconductor optimism', tone: 'pos' }, ' vs. the ', { t: '"weak link"', tone: 'neg' }, ' of tech valuation at high rates.'], tags: ['NDX', 'VIX', 'US10Y'] },
      { n: '03', text: ['Market pricing in ', { t: 'KRW strength', tone: 'warn' }, ' vs. ', { t: 'corporate dollar hoarding', tone: 'neg' }, ' at a 3.5-year high.'], tags: ['USDKRW', 'DXY', 'SPX'] },
    ] },

  { type: 'm-plan',
    idx: '05 / THE PLAN',
    title: 'Trade plan',
    action: 'Reduce NDX · Add US10Y',
    invalidation: 'ICSA > 250K for 2 weeks straight',
    risks: [
      { tag: 'MACRO', text: 'CPI breaks above 335 → a hawkish Fed pivot accelerates the tech-valuation unwind.' },
      { tag: 'POSITIONING', text: 'VIX at 17.68 → over-confidence in the rebound risks a sharp panic unwind.' },
      { tag: 'EVENT', text: 'USD/KRW breaks 1,520 → KRW-weakness narrative drives EM (KOSPI) outflows.' },
    ] },

  { type: 'm-cta',
    idx: '06 / METHOD',
    title: 'Scored &\nfalsifiable',
    subtitle: 'Every angle is graded for logical rigor before it ships.',
    score: '4.5',
    breakdown: [
      { label: 'Tension', value: '4' },
      { label: 'Hypothesis', value: '5', tone: 'pos' },
      { label: 'Evidence', value: '5', tone: 'pos' },
      { label: 'Verdict Logic', value: '4' },
    ],
    ctaTitle: 'See the full angle report\nand live signals.',
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

const deck: CardNewsDeck = {
  id: 'stock-fakerebound-2026-06-15',
  project: 'alphalenz',
  title: { ko: 'The Fake Rebound', en: 'The Fake Rebound' },
  source: 'https://alpha-lenz.com/en/angle-reports/2026-06-15-alpha-lenz-stock-report',
  date: '2026-06-15',
  theme: 'macro',
  accent: '#4FD1A5',
  width: 1080,
  height: 1350,
  variants: [
    { id: 'linkedin', label: 'LinkedIn', width: 1080, height: 1350, caption: linkedinCaption, slides },
    { id: 'instagram', label: 'Instagram', width: 1080, height: 1350, caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
    { id: 'reels', label: 'Reels', width: 1080, height: 1920, kind: 'reels', caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
  ],
};

export default deck;
