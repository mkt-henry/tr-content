import type { CardNewsDeck } from '../../types';

/* AlphaLenz · Stock Angle Report (2026-06-22) — macro 테마(세로 1080×1350 LinkedIn + X 16:9).
   레짐 Slowdown · 확신 HIGH. 승리 가설 B(SHORT the fear): 시장의 침체 공포는 과잉반응, 연착륙이 진행 중.
   ACTION: Overweight NDX · Overweight COPPER · Maintain VIX short (리스크온).
   슬라이드 카피는 영어(macro 테마 규칙) · 게시 본문(caption)은 한/영 언어별로 분리해 토글 전환.
   데이터 출처: alpha-lenz.com 2026-06-22 Stock Angle Report.
   직전 06-17 'Fake Rebound'의 반대 국면 — 공포를 매수. */

const captionKo = `시장의 컨센서스는 '침체'다. 그런데 데이터는 정반대를 가리킨다.

이번 주식 앵글 리포트는 과도한 침체 공포를 '비이성적 과잉반응'으로 본다. 위험은 경착륙이 아니라, 연착륙을 놓치는 것이다.

콜 (확신 HIGH):
→ 나스닥(NDX) 비중확대
→ 구리(COPPER) 비중확대
→ VIX 숏 유지

리스크온으로 기우는 이유:
• 산업생산(INDPRO) 102.65 — 제조업 견고
• 신규 실업수당(ICSA) 22.6만 건 — 24만 스트레스선 한참 아래
• 10Y-2Y 금리차 +0.27% — 역전이 아니라 수렴
• 나스닥100 +27.23%, 구리 +16.5% (3개월) — AI 주도 성장 사이클
• 원/달러 1,529.89는 일시적 유동성 불균형 (DXY 100.85로 안정)

시장은 원/달러 1,520 돌파와 0.27% 금리차를 침체 신호로 읽는다. 그러나 실물 데이터가 이를 반박한다 — 중국의 반도체 반격과 미국 규제(CHIPS Act)가 오히려 국내 투자를 가속하는 '공급 재편' 기회로, 나스닥과 구리를 끌어올린다.

무효화 — 신규 실업수당(ICSA)이 2주 연속 24만 건을 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트 & 실시간 시그널 → https://alpha-lenz.com/en/angle-reports/2026-06-22-alpha-lenz-stock-report

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #나스닥 #구리 #연착륙 #AIinFinance #AlphaLenz`;

const captionEn = `Recession is the consensus trade. The data disagrees.

Our latest Stock Angle reads the market's recession fear as an irrational overreaction. The risk isn't a hard landing — it's missing the soft one.

The call (conviction HIGH):
→ Overweight NDX
→ Overweight COPPER
→ Maintain VIX short

Why we're leaning risk-on:
• Industrial production (INDPRO) firm at 102.65
• Jobless claims (ICSA) resilient at 226K — well below the 240K stress line
• 10Y–2Y at +0.27% — converging, not inverted
• Nasdaq-100 +27.23% and copper +16.5% over 3 months — an AI-led growth cycle
• USD/KRW at 1,529.89 is a liquidity blip; the dollar (DXY) sits calm at 100.85

The market reads KRW past 1,520 and the 0.27% curve as recession signals. The real-economy data refutes it: China's semiconductor counterattack and US rules (CHIPS Act) are accelerating domestic investment — a "supply realignment" that lifts the Nasdaq and copper.

Invalidation is explicit — jobless claims (ICSA) above 240K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report & live signals → https://alpha-lenz.com/en/angle-reports/2026-06-22-alpha-lenz-stock-report

Not investment advice. For research & informational purposes.

#Macro #Markets #Investing #Nasdaq #Copper #SoftLanding #AIinFinance #AlphaLenz`;

/* X(트위터) 전용 — 매체 특성: 훅 우선·압축·캐시태그($NDX)·짧은 줄·해시태그 최소. 링크드인보다 훨씬 타이트. */
const xCaptionKo = `'침체'가 컨센서스다. 그런데 데이터는 정반대.

생산·고용·구리 모두 연착륙을 가리킨다 — 공포를 매수하라.

콜 (확신 HIGH):
↑ 나스닥 $NDX 비중확대
↑ 구리 $COPPER 비중확대
↓ $VIX 숏

근거:
• 산업생산 102.65 — 제조업 견고
• 신규 실업수당 22.6만 — 24만 스트레스선 아래
• 10Y-2Y +0.27% — 역전 아닌 수렴
• 나스닥 +27.23% / 구리 +16.5% (3개월) — AI 성장

원/달러 1,520 돌파 = 위기 아닌 유동성 불균형 (DXY 100.85 안정).

무효화: 실업수당 24만 2주 연속 초과.

전체 앵글 ↓
https://alpha-lenz.com/en/angle-reports/2026-06-22-alpha-lenz-stock-report

투자자문 아님 · 리서치용

#매크로 #나스닥 #구리 #AlphaLenz`;

const xCaptionEn = `Recession is the consensus trade. The data disagrees.

Production, jobs, and copper say soft landing — fade the fear.

The call (HIGH):
↑ Overweight $NDX
↑ Overweight $COPPER
↓ Short $VIX

Why:
• INDPRO 102.65 — manufacturing firm
• Jobless claims 226K — below the 240K stress line
• 10Y–2Y +0.27% — converging, not inverted
• $NDX +27.23% / copper +16.5% (3M) — AI-led growth

KRW past 1,520 = liquidity blip, not crisis (DXY calm at 100.85).

Invalidation: claims above 240K for 2 straight weeks.

Full angle ↓
https://alpha-lenz.com/en/angle-reports/2026-06-22-alpha-lenz-stock-report

Not advice · research only

#Macro #Nasdaq #Copper #AlphaLenz`;

const deck: CardNewsDeck = {
  id: 'stock-softlanding-2026-06-22',
  project: 'alphalenz',
  title: { ko: '연착륙은 진짜다', en: 'The Soft Landing Is Real' },
  source: 'https://alpha-lenz.com/en/angle-reports/2026-06-22-alpha-lenz-stock-report',
  date: '2026-06-22',
  theme: 'macro',
  accent: '#4FD1A5',
  caption: { ko: captionKo, en: captionEn },
  variants: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      width: 1080,
      height: 1350,
      slides: [
        { type: 'm-cover',
          kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
          title: 'Recession?\nNot in the\nData',
          subtitle: 'The market prices a recession. Production, jobs, and copper say soft landing — stay risk-on.',
          signals: [
            { side: 'LONG', ticker: 'NDX', tone: 'pos' },
            { side: 'LONG', ticker: 'COPPER', tone: 'pos' },
          ],
          conviction: 4, max: 5, convLabel: 'HIGH', regime: 'SOFT LANDING' },

        { type: 'm-call',
          idx: '01 / THE CALL',
          title: 'Stay\nrisk-on',
          subtitle: 'The fear is overdone. Real-economy data refutes the recession narrative — lean into the AI-led growth cycle.',
          cards: [
            { tone: 'pos', arrow: '↑', tag: 'INCREASE EXPOSURE', headline: 'Overweight NDX', desc: 'Nasdaq-100 — up +27.23% in 3 months on an AI-led growth cycle, not a bubble to fear.' },
            { tone: 'pos', arrow: '↑', tag: 'INCREASE EXPOSURE', headline: 'Overweight COPPER', desc: 'Copper +16.5% in 3 months — vigorous industrial demand; pair it with a maintained VIX short.' },
          ],
          conviction: 4, max: 5, convText: '4 / 5 · HIGH' },

        { type: 'm-narrative',
          idx: '02 / THE THESIS',
          title: 'Narrative\nvs. Reality',
          narrative: ['The market reads ', { t: 'USD/KRW past 1,520', tone: 'white' }, ' and a converging ', { t: '10Y–2Y at 0.27%', tone: 'white' }, ' as recession signals — pricing in a failed soft landing on Fed-hawkish fears.'],
          reality: ['Industrial output holds at ', { t: '102.65', tone: 'white' }, ', jobless claims sit at ', { t: '226K', tone: 'white' }, ', and the curve is converging — not inverted. ', { t: 'NDX +27.23%', tone: 'white' }, ' and ', { t: 'copper +16.5%', tone: 'white' }, ' confirm an AI-led growth cycle.'],
          verdict: [{ t: 'Verdict:', tone: 'white' }, ' excessive fear is an overreaction — a soft landing, not a recession. Buy the fear.'] },

        { type: 'm-data',
          idx: '03 / THE DATA',
          title: 'The macro reality',
          source: 'Source: FRED · price feeds',
          metrics: [
            { code: 'INDPRO', status: 'RESILIENT', statusTone: 'pos', value: '102.65', caption: 'Industrial output · manufacturing firm', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
            { code: 'ICSA', status: 'HEALTHY', statusTone: 'pos', value: '226K', caption: 'Jobless claims · below 240K stress line', viz: { kind: 'bar', pct: 56, tone: 'pos' } },
            { code: 'T10Y2Y', status: '+0.27%', statusTone: 'pos', value: '+0.27%', caption: 'Curve converging · not inverted', viz: { kind: 'bar', from: 50, pct: 7, tone: 'pos', marker: 'center' } },
            { code: 'NDX · 3M', status: 'GROWTH', statusTone: 'pos', value: '+27.23%', caption: 'AI-led cycle · momentum strong', viz: { kind: 'bars', heights: [40, 55, 62, 75, 88, 100], tone: 'pos' } },
            { code: 'COPPER · 3M', status: 'STRONG', statusTone: 'pos', value: '+16.5%', caption: 'Industrial demand · supply realignment', viz: { kind: 'bars', heights: [45, 55, 68, 78, 90, 100], tone: 'pos' } },
            { code: 'USD/KRW', status: 'LIQUIDITY', statusTone: 'warn', value: '1,529.89', caption: 'Temporary imbalance · DXY calm at 100.85', viz: { kind: 'bar', pct: 85, tone: 'warn' } },
          ] },

        { type: 'm-tensions',
          idx: '04 / TENSIONS',
          title: 'Three tensions\nto watch',
          items: [
            { n: '01', text: ['A ', { t: 'recession scare', tone: 'neg' }, ' (KRW, curve) vs. a ', { t: 'resilient real economy', tone: 'pos' }, ' (output, jobs, copper).'], tags: ['NDX', 'COPPER', 'VIX'] },
            { n: '02', text: ['Soft ', { t: 'consumer sentiment 49.8', tone: 'warn' }, ' vs. ', { t: 'firm production 102.65', tone: 'pos' }, ' and sticky ', { t: 'CPI 333.98', tone: 'warn' }, '.'], tags: ['SPX', 'CPI', 'US10Y'] },
            { n: '03', text: ['A ', { t: 'China semi counterattack', tone: 'warn' }, ' & US rules vs. a ', { t: 'CHIPS-Act supply realignment', tone: 'pos' }, ' lifting tech.'], tags: ['NDX', 'COPPER', 'SOX'] },
          ] },

        { type: 'm-plan',
          idx: '05 / THE PLAN',
          title: 'Trade plan',
          action: 'Overweight NDX & COPPER · Maintain VIX short',
          invalidation: 'ICSA above 240K for 2 weeks straight',
          risks: [
            { tag: 'MACRO', text: 'Delayed Fed cuts or resurgent inflation push US10Y above 4.5% → growth-stock valuations compress.' },
            { tag: 'POSITIONING', text: 'NDX & copper overbought — profit-taking once 3-month gains clear +30% spikes volatility.' },
            { tag: 'EVENT', text: 'Geopolitical escalation spikes WTI and USD/KRW → renewed supply-chain fears.' },
          ] },

        { type: 'm-cta',
          idx: '06 / METHOD',
          title: 'Scored &\nfalsifiable',
          subtitle: 'Every tension is graded for narrative-vs-reality divergence before the angle ships.',
          score: '0.7',
          breakdown: [
            { label: 'Fear vs. data', value: '0.7', tone: 'pos' },
            { label: 'KRW vs. DXY', value: '0.6' },
            { label: 'Output vs. sentiment', value: '0.5' },
            { label: 'Direction', value: 'RISK-ON', tone: 'pos' },
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
      caption: { ko: xCaptionKo, en: xCaptionEn },
      slides: [
        { type: 'm-twitter',
          kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
          title: 'Recession? Not\nin the Data',
          subtitle: 'The market prices a recession. Production, jobs, and copper say soft landing — stay risk-on.',
          signals: [
            { side: 'LONG', ticker: 'NDX', tone: 'pos' },
            { side: 'LONG', ticker: 'COPPER', tone: 'pos' },
          ],
          conviction: 4, max: 5, convLabel: 'HIGH', regime: 'SOFT LANDING',
          metrics: [
            { code: 'INDPRO', status: 'RESILIENT', statusTone: 'pos', value: '102.65', caption: 'Industrial output · manufacturing firm', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
            { code: 'ICSA', status: 'HEALTHY', statusTone: 'pos', value: '226K', caption: 'Jobless claims · below 240K stress line', viz: { kind: 'bar', pct: 56, tone: 'pos' } },
            { code: 'NDX · 3M', status: 'GROWTH', statusTone: 'pos', value: '+27.23%', caption: 'AI-led cycle · momentum strong', viz: { kind: 'bars', heights: [40, 55, 62, 75, 88, 100], tone: 'pos' } },
            { code: 'COPPER · 3M', status: 'STRONG', statusTone: 'pos', value: '+16.5%', caption: 'Industrial demand · supply realignment', viz: { kind: 'bars', heights: [45, 55, 68, 78, 90, 100], tone: 'pos' } },
          ],
          verdict: [{ t: 'Verdict:', tone: 'white' }, ' excessive fear is an overreaction — a soft landing, not a recession. Buy the fear.'],
          url: 'alpha-lenz.com',
          disclaimer: 'Not investment advice. For research & informational purposes.' },
      ],
    },
  ],
};

export default deck;
