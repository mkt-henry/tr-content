import type { AnySlide, CardNewsDeck } from '../../types';

/* AlphaLenz Macro · Stock Angle (2026-06-17) — 영어 전용 · macro 테마.
   한 주제, 네 플랫폼:
   - linkedin: 세로 1080×1350 캐러셀 7장 (서술형 캡션)
   - x: 가로 16:9 단일 카드 1920×1080 (불릿형 캡션) — 7장을 한 장에 압축
   - instagram: 세로 1080×1350 캐러셀 7장 (링크 미작동 매체용 캡션, 한/영)
   - reels: 세로 1080×1920 자동 전환 영상 (인스타 캡션 공유)
   수치·티커·invalidation은 네 버전 동일(데이터 정확성 가드).
   데이터 출처: alpha-lenz.com 2026-06-17 Stock Angle Report (report #523).
   직전 06-15 'Fake Rebound'의 연속편 — GOLD 로테이션 + 스태그플레이션 경고. */

const linkedinCaption = `The Dow just printed a record. KOSPI cleared 8,100. The data says: don't chase it.

Our latest Stock Angle reads the rally as a "Fake Rebound" — a bubble priced on rate-cut hopes, not a fundamental recovery. The risk isn't a soft landing. It's stagflation.

The call (conviction 4/5, HIGH):
→ Underweight NDX
→ Overweight GOLD

Why we're leaning defensive:
• Consumer sentiment at 49.8 — below 50, in contraction
• CPI 333.98 — disinflation stalling, near the 335 trigger
• Jobless claims sticky at 229K — labor rigidity keeps the Fed tight
• PGIM sees three more hikes this year
• NDX up +22.69% in 3 months — overbought, unwind risk rising

The market is pricing a soft landing on ceasefire relief and the AI-semis boom. But weak consumption and stalled inflation argue the other way: if the case for further tightening firms up, the rally is exposed as a False Recovery and corrects sharply.

Positioning the rotation: gold and miners (NEM), plus defensive cash-flows — BRK.B, J&J, P&G, KT&G.

Invalidation is explicit — jobless claims (ICSA) below 215K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report & live signals → https://alpha-lenz.com/en/angle-reports/2026-06-17-alpha-lenz-stock-report

Not investment advice. For research & informational purposes.

#Macro #Markets #Investing #Nasdaq #Gold #Stagflation #AIinFinance #AlphaLenz`;

const xCaption = `The Dow just printed a record. KOSPI cleared 8,100. The data says: don't chase it.

We read this rally as a "Fake Rebound" — a bubble priced on rate-cut hopes, not recovery. The risk isn't a soft landing. It's stagflation.

The call (conviction 4/5, HIGH):
→ Underweight NDX
→ Overweight GOLD

Why we lean defensive:
• Consumer sentiment 49.8 — below 50, contracting
• CPI 333.98 — disinflation stalling near the 335 trigger
• Jobless claims sticky at 229K — labor keeps the Fed tight
• NDX +22.69% in 3M — overbought, unwind risk rising

Invalidation is explicit: jobless claims (ICSA) below 215K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report & live signals → https://alpha-lenz.com/en/angle-reports/2026-06-17-alpha-lenz-stock-report

Not investment advice. For research & informational purposes.

#Macro #Markets #Nasdaq #Gold #Stagflation #AlphaLenz`;

/* 인스타그램 전용 — 링크가 클릭되지 않고 첫 2줄만 펼침 전에 보이는 매체.
   첫 2줄에 결론까지, URL 대신 프로필 링크 안내, 해시태그 15~20개. 릴스와 공유한다. */
const igCaptionKo = `다우가 사상 최고를 찍었고 코스피는 8,100을 넘었다.
쫓아가지 마라 — 이건 금리인하 기대가 만든 가짜 반등이다.

콜 (확신 4/5 HIGH)
↓ 나스닥100(NDX) 비중축소
↑ 금(GOLD) 비중확대

방어로 기울이는 이유
• 소비심리 49.8 — 50 아래, 위축 국면
• CPI 333.98 — 디스인플레이션 정체, 335 트리거 근접
• 신규 실업수당 22.9만 건 — 노동시장 경직성이 연준을 계속 조인다
• PGIM은 올해 세 번의 추가 인상을 본다
• NDX 3개월 +22.69% — 과매수, 되돌림 위험 상승

시장은 휴전 안도감과 AI 반도체 붐으로 연착륙을 가격에 넣었다. 그러나 약한 소비와 멈춘 인플레이션은 반대를 말한다. 추가 긴축 논거가 굳어지면 이 반등은 '거짓 회복'으로 드러나며 급격히 조정된다.

로테이션: 금과 금광주(NEM), 그리고 방어적 현금흐름 — BRK.B, J&J, P&G, KT&G.

무효화 조건: 신규 실업수당(ICSA)이 2주 연속 21.5만 건을 밑돌면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트는 프로필 링크에서 👆

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #나스닥 #금투자 #스태그플레이션 #주식투자 #해외주식 #미국주식 #연준 #금리 #소비심리 #경제지표 #투자공부 #재테크 #AI투자 #AlphaLenz #알파렌즈 #InvestingKR #StockMarket`;

const igCaptionEn = `The Dow printed a record and KOSPI cleared 8,100.
Don't chase it — this is a bubble priced on rate-cut hopes.

THE CALL (conviction 4/5, HIGH)
↓ Underweight NDX
↑ Overweight GOLD

WHY WE LEAN DEFENSIVE
• Consumer sentiment 49.8 — below 50, in contraction
• CPI 333.98 — disinflation stalling near the 335 trigger
• Jobless claims sticky at 229K — labor rigidity keeps the Fed tight
• PGIM sees three more hikes this year
• NDX +22.69% in 3 months — overbought, unwind risk rising

The market is pricing a soft landing on ceasefire relief and the AI-semis boom. Weak consumption and stalled inflation argue the other way: if the case for further tightening firms up, the rally is exposed as a False Recovery.

The rotation: gold and miners (NEM), plus defensive cash-flows — BRK.B, J&J, P&G, KT&G.

Invalidation: jobless claims below 215K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report via the link in bio 👆

Not investment advice. For research & informational purposes.

#macro #markets #investing #nasdaq #gold #stagflation #stocks #stockmarket #fed #interestrates #economy #inflation #quant #aiinfinance #fintech #investor #marketanalysis #AlphaLenz`;

/** 링크드인·인스타·릴스가 공유하는 7장. 배열을 공유하므로 수치 불일치가 발생할 수 없다. */
const slides: AnySlide[] = [
  { type: 'm-cover',
    kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
    title: 'A Bubble\nBuilt on\nRate Cuts',
    subtitle: 'The market prices a soft landing. The data warns of stagflation — rotate out of tech, into gold.',
    signals: [
      { side: 'SHORT', ticker: 'NDX', tone: 'neg' },
      { side: 'LONG', ticker: 'GOLD', tone: 'pos' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'STAGFLATION' },

  { type: 'm-call',
    idx: '01 / THE CALL',
    title: 'Rotate into\ndefense',
    subtitle: "Trade rate-sensitive tech for gold and defensive cash-flows. The market is pricing a soft landing the data won't support.",
    cards: [
      { tone: 'neg', arrow: '↓', tag: 'REDUCE EXPOSURE', headline: 'Underweight NDX', desc: 'Nasdaq-100 — up +22.69% in 3 months, the overbought "weak link" of the AI rally at high-for-long rates.' },
      { tone: 'pos', arrow: '↑', tag: 'INCREASE EXPOSURE', headline: 'Overweight GOLD', desc: 'The stagflation hedge — gold and miners (NEM), paired with defensive cash-flows (BRK.B, J&J, KT&G).' },
    ],
    conviction: 4, max: 5, convText: '4 / 5 · HIGH' },

  { type: 'm-narrative',
    idx: '02 / THE THESIS',
    title: 'Narrative\nvs. Reality',
    narrative: ['US–Iran ceasefire hopes and an AI-semiconductor boom lift the tape — ', { t: 'KOSPI tops 8,100', tone: 'white' }, ', the Dow prints a record. With recession signals fading (', { t: '10Y–2Y +0.38%', tone: 'white' }, '), the market reads "soft landing."'],
    reality: ['Consumer sentiment sits at ', { t: '49.8', tone: 'white' }, ' — below 50, in contraction. CPI ', { t: '333.98', tone: 'white' }, ' shows disinflation stalling, jobless claims hold at ', { t: '229K', tone: 'white' }, ', and PGIM sees ', { t: '3 more hikes', tone: 'white' }, '. High-for-Long risks tipping into stagflation.'],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' a bubble priced on rate-cut hopes — a Fake Rebound that breaks when the macro warnings land.'] },

  { type: 'm-data',
    idx: '03 / THE DATA',
    title: 'The macro reality',
    source: 'Source: FRED · price feeds',
    metrics: [
      { code: 'UMCSENT', status: 'CONTRACTION', statusTone: 'neg', value: '49.8', caption: 'Consumer sentiment · below 50', viz: { kind: 'bar', pct: 49.8, tone: 'neg', marker: 'center' } },
      { code: 'CPI', status: 'STALLING', statusTone: 'warn', value: '333.98', caption: 'Disinflation stalls · 335 trigger near', viz: { kind: 'bar', pct: 88, tone: 'warn' } },
      { code: 'ICSA', status: 'STICKY', statusTone: 'warn', value: '229K', caption: 'Jobless claims · labor stays tight', viz: { kind: 'bar', pct: 70, tone: 'warn' } },
      { code: 'INDPRO', status: 'EXPANSION', statusTone: 'pos', value: '102.65', caption: 'Output strong — but inventory-led', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
      { code: 'T10Y2Y', status: '+0.38%', statusTone: 'pos', value: '+0.38%', caption: 'Curve positive · no recession yet', viz: { kind: 'bar', from: 50, pct: 9, tone: 'pos', marker: 'center' } },
      { code: 'NDX · 3M', status: 'OVERBOUGHT', statusTone: 'neg', value: '+22.69%', caption: 'Stretched · unwind risk rising', viz: { kind: 'bars', heights: [40, 52, 60, 72, 85, 100], tone: 'neg' } },
    ] },

  { type: 'm-tensions',
    idx: '04 / TENSIONS',
    title: 'Three tensions\nto watch',
    items: [
      { n: '01', text: ['A ', { t: 'relief rally', tone: 'warn' }, ' on ceasefire & AI hopes vs. a ', { t: 'recessionary consumer', tone: 'neg' }, ' (49.8) and stalling CPI.'], tags: ['NDX', 'US10Y', 'VIX'] },
      { n: '02', text: ['Market pricing ', { t: 'KRW strength', tone: 'warn' }, ' & FX calm vs. ', { t: 'dollar strength', tone: 'neg' }, ' from a still-hawkish Fed.'], tags: ['USDKRW', 'DXY', 'SPX'] },
      { n: '03', text: ['Robust ', { t: 'production (INDPRO 102.65)', tone: 'pos' }, ' vs. ', { t: 'contracting demand', tone: 'neg' }, ' & rigid labor underneath.'], tags: ['SPX', 'COPPER', 'US10Y'] },
    ] },

  { type: 'm-plan',
    idx: '05 / THE PLAN',
    title: 'Trade plan',
    action: 'Underweight NDX · Overweight GOLD + defensives',
    invalidation: 'ICSA below 215K for 2 weeks straight',
    risks: [
      { tag: 'MACRO', text: 'High-for-Long pushes US10Y above 4.8% → growth-stock valuations compress further.' },
      { tag: 'POSITIONING', text: 'NDX +22.69% in 3M → an overbought AI-positioning unwind spreads contagion market-wide.' },
      { tag: 'EVENT', text: 'UMCSENT below 45 → a consumption breakdown forces downward earnings revisions.' },
    ] },

  { type: 'm-cta',
    idx: '06 / METHOD',
    title: 'Scored &\nfalsifiable',
    subtitle: 'Every tension is graded for narrative-vs-reality divergence before the angle ships.',
    score: '0.6',
    breakdown: [
      { label: 'Rally vs. data', value: '0.7', tone: 'neg' },
      { label: 'KRW vs. USD', value: '0.6' },
      { label: 'Output vs. demand', value: '0.5' },
      { label: 'Direction', value: 'SHORT', tone: 'neg' },
    ],
    ctaTitle: 'See the full angle report\nand live signals.',
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

/** X(16:9) 전용 단일 카드 */
const twitterSlides: AnySlide[] = [
  { type: 'm-twitter',
    kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
    title: 'A Bubble on\nRate Cuts',
    subtitle: 'The market prices a soft landing. The data warns of stagflation — rotate out of tech, into gold.',
    signals: [
      { side: 'SHORT', ticker: 'NDX', tone: 'neg' },
      { side: 'LONG', ticker: 'GOLD', tone: 'pos' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'STAGFLATION',
    metrics: [
      { code: 'UMCSENT', status: 'CONTRACTION', statusTone: 'neg', value: '49.8', caption: 'Consumer sentiment · below 50', viz: { kind: 'bar', pct: 49.8, tone: 'neg', marker: 'center' } },
      { code: 'CPI', status: 'STALLING', statusTone: 'warn', value: '333.98', caption: 'Disinflation stalls · 335 trigger near', viz: { kind: 'bar', pct: 88, tone: 'warn' } },
      { code: 'ICSA', status: 'STICKY', statusTone: 'warn', value: '229K', caption: 'Jobless claims · labor stays tight', viz: { kind: 'bar', pct: 70, tone: 'warn' } },
      { code: 'NDX · 3M', status: 'OVERBOUGHT', statusTone: 'neg', value: '+22.69%', caption: 'Stretched · unwind risk rising', viz: { kind: 'bars', heights: [40, 52, 60, 72, 85, 100], tone: 'neg' } },
    ],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' a bubble priced on rate-cut hopes — a Fake Rebound that breaks when the macro warnings land.'],
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

const deck: CardNewsDeck = {
  id: 'stock-fakerebound-2026-06-17',
  project: 'alphalenz',
  title: { ko: '가짜 반등 — 금리인하 거품', en: 'A Bubble on Rate Cuts' },
  source: 'https://alpha-lenz.com/en/angle-reports/2026-06-17-alpha-lenz-stock-report',
  date: '2026-06-17',
  theme: 'macro',
  accent: '#4FD1A5',
  variants: [
    { id: 'linkedin', label: 'LinkedIn', width: 1080, height: 1350, caption: linkedinCaption, slides },
    { id: 'x', label: 'X', width: 1920, height: 1080, caption: xCaption, slides: twitterSlides },
    { id: 'instagram', label: 'Instagram', width: 1080, height: 1350, caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
    { id: 'reels', label: 'Reels', width: 1080, height: 1920, kind: 'reels', caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
  ],
};

export default deck;
