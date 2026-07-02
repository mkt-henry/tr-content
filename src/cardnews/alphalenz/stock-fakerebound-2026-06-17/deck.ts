import type { CardNewsDeck } from '../../types';

/* AlphaLenz Macro · Stock Angle (2026-06-17) — 영어 전용 · macro 테마.
   한 주제, 두 플랫폼:
   - linkedin: 세로 1080×1350 캐러셀 7장 (서술형 캡션)
   - x: 가로 16:9 단일 카드 1920×1080 (불릿형 캡션) — 7장을 한 장에 압축
   수치·티커·invalidation은 두 버전 동일(데이터 정확성 가드).
   데이터 출처: alpha-lenz.com 2026-06-17 Stock Angle Report (report #523).
   직전 06-15 'Fake Rebound'의 연속편 — GOLD 로테이션 + 스태그플레이션 경고. */
const deck: CardNewsDeck = {
  id: 'stock-fakerebound-2026-06-17',
  project: 'alphalenz',
  title: { ko: '가짜 반등 — 금리인하 거품', en: 'A Bubble on Rate Cuts' },
  source: 'https://alpha-lenz.com/en/angle-reports/2026-06-17-alpha-lenz-stock-report',
  date: '2026-06-17',
  theme: 'macro',
  accent: '#4FD1A5',
  variants: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      width: 1080,
      height: 1350,
      caption: `The Dow just printed a record. KOSPI cleared 8,100. The data says: don't chase it.

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

#Macro #Markets #Investing #Nasdaq #Gold #Stagflation #AIinFinance #AlphaLenz`,
      slides: [
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
      ],
    },
    {
      id: 'x',
      label: 'X',
      width: 1920,
      height: 1080,
      caption: `The Dow just printed a record. KOSPI cleared 8,100. The data says: don't chase it.

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

#Macro #Markets #Nasdaq #Gold #Stagflation #AlphaLenz`,
      slides: [
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
      ],
    },
  ],
};

export default deck;
