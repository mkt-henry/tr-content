import type { AnySlide, CardNewsDeck } from '../../types';

/* AlphaLenz · Stock Angle Report (2026-07-27) — macro 테마.
   LinkedIn 4:5 7장 · X 16:9 1장 · Instagram 4:5 7장 · Reels 9:16 영상.
   레짐 Slowdown · 확신 HIGH · 방향 SHORT(내러티브 매도). 승리 가설 B: 시장이 틀렸다 —
   중동 리스크와 유가 급등을 '영구 충격'으로 과대평가한 과매도 구간. 실물 바닥(INDPRO 102.64 ·
   ICSA 18.7만)이 소프트랜딩을 지지하고, WTI–VIX 1M 베타 0.0734가 충격의 선택적 흡수를 보여준다.
   ACTION: Overweight NDX. INVALIDATION: ICSA 25만 2주 연속 초과.
   슬라이드 카피는 영어(macro 테마 규칙) · 게시 본문(caption)은 한/영 + 플랫폼별로 분리.
   데이터 출처: alpha-lenz.com 2026-07-27 Stock Angle Report. */

const captionKo = `유가가 뛰었고, 나스닥은 2% 넘게 빠졌다. 그런데 실물 지표는 흔들리지 않았다.

이번 주식 앵글 리포트는 이 하락을 '과도한 공포'가 만든 과매도 구간으로 본다. 시장은 중동 리스크와 유가 급등을 영구 충격으로 과대평가하고 있다.

콜 (확신 HIGH):
→ 나스닥100(NDX) 비중확대

침체가 아니라고 보는 이유:
• 신규 실업수당(ICSA) 18.7만 건(7/18) — 시장이 두려워하는 25만 임계선에 한참 못 미친다
• 산업생산(INDPRO) 102.64(6월) — 실물 바닥은 무너지지 않았다
• WTI–VIX 1개월 베타 0.0734 — 유가 충격이 시장 패닉으로 즉시 번지지 않고 선택적으로 흡수되고 있다
• 10Y-2Y 금리차 0.36% — 침체 신호가 아니라 연준의 인하 지연에 대한 일시적 혼란
• 소비심리(UMCSENT) 44.8(5월) — 실제 소비의 급감이 아닌 유가 급등에 대한 일시적 공포 반응

시장은 WTI 1개월 +24.18%를 성장을 질식시키는 스태그플레이션의 전조로 읽었다. 소비심리 붕괴와 금리차 축소를 노동시장 붕괴의 선행 신호로 보고, ICSA가 2주 안에 25만을 넘을 것이라는 공포에 나스닥이 2% 넘게 밀렸다. 그러나 핵심 질문 — 노동시장 경직성이 깨지는가 — 에 대한 증거는 18.7만 건이다. 연준이 인플레이션보다 성장 둔화를 우선해 인하를 재개하면 시장은 급반등한다. 리포트가 함께 제시한 종목은 XOM·S-Oil(유가·정제마진 헤지), MSFT·AAPL(방어적 기술주로 NDX 익스포저 확대), UNH·KT&G(경기방어·고배당 4.1%)다.

무효화 — 신규 실업수당(ICSA)이 2주 연속 25만 건을 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트 & 실시간 시그널 → https://alpha-lenz.com/en/angle-reports/2026-07-27-alpha-lenz-stock-report

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #나스닥 #유가 #과매도 #소프트랜딩 #AIinFinance #AlphaLenz`;

const captionEn = `Crude ripped, the Nasdaq shed more than 2% — and the hard data didn't move.

Our latest Stock Angle reads this drawdown as an oversold zone built on excess fear. The market has overpriced Middle East risk and the oil spike as a permanent shock.

The call (conviction HIGH):
→ Overweight NDX

Why this isn't a recession:
• Jobless claims (ICSA) at 187K on July 18 — far below the 250K line the market fears
• Industrial production (INDPRO) at 102.64 in June — the real-economy floor is intact
• WTI–VIX 1M beta of 0.0734 — the oil shock is being absorbed selectively, not spreading into panic
• 10Y–2Y at 0.36% — temporary confusion over delayed Fed cuts, not a recession signal
• Consumer sentiment (UMCSENT) 44.8 in May — a fear response to crude, not a collapse in spending

The market read WTI's +24.18% one-month move as the prelude to stagflation choking growth. Sinking sentiment and a converging curve were treated as leading indicators of a labor-market break, and on the fear that claims would clear 250K within two weeks the Nasdaq fell more than 2%. But the evidence on the key question — does labor-market rigidity break? — reads 187K. If the Fed prioritizes the growth slowdown over inflation and resumes cutting, the rebound is sharp. The report pairs the call with hedges: XOM and S-Oil (crude and refining margins), MSFT and AAPL (defensive tech to add NDX exposure), UNH and KT&G (low-beta cash flows, a 4.1% yield).

Invalidation is explicit — jobless claims above 250K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report & live signals → https://alpha-lenz.com/en/angle-reports/2026-07-27-alpha-lenz-stock-report

Not investment advice. For research & informational purposes.

#Macro #Markets #Investing #Nasdaq #Oil #Oversold #AIinFinance #AlphaLenz`;

/* X(트위터) 전용 — 훅 우선·압축·캐시태그·짧은 줄. 링크드인보다 훨씬 타이트. */
const xCaptionKo = `유가가 뛰었다. $NDX는 2% 넘게 빠졌다. 실물 지표는 그대로다.

이번 하락은 침체가 아니라 과도한 공포다.

콜 (확신 HIGH):
↑ $NDX 비중확대

근거:
• 실업수당 18.7만 — 시장이 두려워하는 25만 한참 아래
• 산업생산 102.64 — 실물 바닥 유지
• $WTI–$VIX 1M 베타 0.0734 — 유가 충격이 패닉으로 안 번진다
• 10Y-2Y 0.36% — 침체 신호가 아니라 인하 지연에 대한 혼란

$WTI +24.18%를 영구 충격으로 가격에 반영한 결과 = 과매도.

무효화: 실업수당 25만 2주 연속 초과.

전체 앵글 ↓
https://alpha-lenz.com/en/angle-reports/2026-07-27-alpha-lenz-stock-report

투자자문 아님 · 리서치용

#매크로 #유가 #나스닥 #AlphaLenz`;

const xCaptionEn = `Crude ripped. $NDX shed 2%+. The hard data didn't move.

This drawdown is excess fear, not recession.

The call (HIGH):
↑ Overweight $NDX

Why:
• Jobless claims 187K — far below the 250K line the market fears
• INDPRO 102.64 — real-economy floor intact
• $WTI–$VIX 1M beta 0.0734 — the oil shock isn't spreading into panic
• 10Y–2Y 0.36% — confusion over delayed cuts, not recession

$WTI +24.18% priced as a permanent shock = oversold.

Invalidation: claims above 250K for 2 straight weeks.

Full angle ↓
https://alpha-lenz.com/en/angle-reports/2026-07-27-alpha-lenz-stock-report

Not advice · research only

#Macro #Oil #Nasdaq #AlphaLenz`;

/* 인스타그램 전용 — 링크가 클릭되지 않고 첫 2줄만 펼침 전에 보이는 매체.
   첫 2줄에 결론까지, URL 대신 프로필 링크 안내, 해시태그 15~20개. 릴스와 공유한다. */
const igCaptionKo = `유가가 뛰었고 나스닥은 2% 넘게 빠졌다.
그런데 실물 지표는 흔들리지 않았다 — 침체가 아니라 과도한 공포다.

콜 (확신 HIGH)
↑ 나스닥100(NDX) 비중확대

침체가 아니라고 보는 이유
• 신규 실업수당 18.7만 건(7/18) — 시장이 두려워하는 25만 임계선 한참 아래
• 산업생산 102.64(6월) — 실물 바닥은 무너지지 않았다
• WTI–VIX 1개월 베타 0.0734 — 유가 충격이 시장 패닉으로 번지지 않고 선택적으로 흡수되고 있다
• 10Y-2Y 금리차 0.36% — 침체 신호가 아니라 연준의 인하 지연에 대한 일시적 혼란
• 소비심리 44.8(5월) — 실제 소비 급감이 아닌 유가 급등에 대한 공포 반응

시장은 WTI 1개월 +24.18%를 스태그플레이션의 전조로 읽었다. 그러나 핵심 질문 — 노동시장 경직성이 깨지는가 — 에 대한 증거는 18.7만 건이다. 연준이 인플레이션보다 성장 둔화를 우선해 인하를 재개하면 시장은 급반등한다.

무효화 조건: 신규 실업수당이 2주 연속 25만 건을 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트는 프로필 링크에서 👆

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #나스닥 #주식투자 #해외주식 #미국주식 #유가 #과매도 #소프트랜딩 #연준 #금리 #경제지표 #투자공부 #재테크 #AI투자 #퀀트 #AlphaLenz #알파렌즈 #InvestingKR #StockMarket`;

const igCaptionEn = `Crude ripped and the Nasdaq shed more than 2%.
The hard data didn't move — this is excess fear, not recession.

THE CALL (conviction HIGH)
↑ Overweight NDX

WHY THIS ISN'T A RECESSION
• Jobless claims 187K on July 18 — far below the 250K line the market fears
• Industrial production 102.64 in June — the real-economy floor is intact
• WTI–VIX 1M beta of 0.0734 — the oil shock is absorbed selectively, not spreading into panic
• 10Y–2Y at 0.36% — confusion over delayed Fed cuts, not a recession signal
• Consumer sentiment 44.8 in May — a fear response to crude, not collapsing spending

The market read WTI's +24.18% one-month move as the prelude to stagflation. But the evidence on the key question — does labor-market rigidity break? — reads 187K. If the Fed prioritizes the growth slowdown over inflation and resumes cutting, the rebound is sharp.

Invalidation: jobless claims above 250K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report via the link in bio 👆

Not investment advice. For research & informational purposes.

#macro #markets #investing #nasdaq #stocks #stockmarket #oil #oversold #softlanding #fed #interestrates #economy #quant #aiinfinance #fintech #tradingview #investor #marketanalysis #AlphaLenz`;

/** 링크드인·인스타·릴스가 공유하는 7장. 배열을 공유하므로 수치 불일치가 발생할 수 없다. */
const slides: AnySlide[] = [
  { type: 'm-cover',
    kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
    title: 'Panic\nPriced,\nFloor Holds',
    subtitle: 'Crude ripped and the Nasdaq lost over 2%. Claims at 187K and output at 102.64 say this is excess fear, not a recession.',
    signals: [
      { side: 'LONG', ticker: 'NDX', tone: 'pos' },
      { side: 'LONG', ticker: 'MSFT', tone: 'pos' },
      { side: 'LONG', ticker: 'XOM', tone: 'pos' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'SLOWDOWN' },

  { type: 'm-call',
    idx: '01 / THE CALL',
    title: 'Buy the\npanic',
    subtitle: 'The stagflation scare is in the price. Add NDX exposure, and pair it with the hedges that survive a stalled rebound.',
    cards: [
      { tone: 'pos', arrow: '↑', tag: 'INCREASE EXPOSURE', headline: 'Overweight NDX', desc: 'Oversold on excess fear — 187K claims and INDPRO 102.64 hold the floor.' },
      { tone: 'pos', arrow: '↑', tag: 'OIL HEDGE', headline: 'XOM · S-Oil', desc: 'Direct hedge on the WTI spike, plus refining-margin upside.' },
      { tone: 'pos', arrow: '↑', tag: 'DEFENSIVE SLEEVE', headline: 'MSFT · UNH · KT&G', desc: 'Low-beta cash flows and a 4.1% yield if the bounce stalls.' },
    ],
    conviction: 4, max: 5, convText: '4 / 5 · HIGH' },

  { type: 'm-narrative',
    idx: '02 / THE THESIS',
    title: 'Narrative\nvs. Reality',
    narrative: ['Middle East escalation sent ', { t: 'WTI +24.18% in a month', tone: 'white' }, ', and the market read it as stagflation choking growth. With sentiment at ', { t: '44.8', tone: 'white' }, ' and the curve converging, the ', { t: 'Nasdaq fell over 2%', tone: 'white' }, ' on fear that claims clear 250K.'],
    reality: ['Claims printed ', { t: '187K', tone: 'white' }, ' — well below the ', { t: '250K', tone: 'white' }, ' break line — and industrial output holds at ', { t: '102.64', tone: 'white' }, '. A ', { t: 'WTI–VIX 1M beta of 0.0734', tone: 'white' }, ' shows the shock is absorbed selectively, not systemically.'],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' the market is wrong — it overpriced the oil spike as a permanent shock. The soft landing is still the base case.'] },

  { type: 'm-data',
    idx: '03 / THE DATA',
    title: 'The macro reality',
    source: 'Source: FRED · price feeds',
    metrics: [
      { code: 'ICSA', status: 'RESILIENT', statusTone: 'pos', value: '187K', caption: 'Jobless claims Jul 18 · below the 250K line', viz: { kind: 'bar', pct: 45, tone: 'pos' } },
      { code: 'INDPRO', status: 'STEADY', statusTone: 'pos', value: '102.64', caption: 'Industrial output Jun · floor intact', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
      { code: 'WTI·VIX β', status: 'CONTAINED', statusTone: 'pos', value: '0.0734', caption: '1M beta · shock absorbed, not systemic', viz: { kind: 'bar', pct: 7, tone: 'pos' } },
      { code: 'T10Y2Y', status: 'NARROWING', statusTone: 'warn', value: '0.36%', caption: 'Curve converging · delayed cuts, not recession', viz: { kind: 'bar', from: 50, pct: 9, tone: 'warn', marker: 'center' } },
      { code: 'UMCSENT', status: 'CONTRACTION', statusTone: 'neg', value: '44.8', caption: 'Consumer sentiment May · fear, not spending', viz: { kind: 'bar', pct: 44.8, tone: 'neg', marker: 'center' } },
      { code: 'WTI', status: 'SPIKE', statusTone: 'warn', value: '+24.18%', caption: '1M move · Middle East supply risk', viz: { kind: 'bars', heights: [38, 46, 58, 72, 88, 100], tone: 'warn' } },
    ] },

  { type: 'm-tensions',
    idx: '04 / TENSIONS',
    title: 'Three tensions\nto watch',
    items: [
      { n: '01', text: ['An ', { t: 'oil-driven panic', tone: 'neg' }, ' (WTI +24.18%, Nasdaq -2%) vs. ', { t: 'modest real growth', tone: 'pos' }, ' — INDPRO 102.64 and 187K claims. Divergence 0.7.'], tags: ['NDX', 'WTI', 'VIX', 'US10Y'] },
      { n: '02', text: ['The ', { t: 'Fed holding on a 2.1% growth call', tone: 'neg' }, ' vs. a ', { t: 'curve at 0.36%', tone: 'pos' }, ' that has already priced recession risk. Divergence 0.6.'], tags: ['SPX', 'US10Y', 'DXY'] },
      { n: '03', text: ['A ', { t: 'semiconductor-AI rebound thesis', tone: 'pos' }, ' vs. ', { t: 'FX instability', tone: 'neg' }, ' — USD/KRW volatility widening from 1,450 toward 1,600. Divergence 0.6.'], tags: ['NDX', 'USDKRW', 'GOLD'] },
    ] },

  { type: 'm-plan',
    idx: '05 / THE PLAN',
    title: 'Trade plan',
    action: 'Overweight NDX',
    invalidation: 'ICSA above 250K for 2 weeks straight',
    risks: [
      { tag: 'MACRO', text: 'Prolonged Middle East risk pushes WTI above $100, re-igniting inflation expectations and pulling the Fed back from cuts.' },
      { tag: 'POSITIONING', text: 'Heavy selling near the one-month high turns the NDX oversold rebound into a dead cat bounce.' },
      { tag: 'EVENT', text: 'Unexpected hawkish Fed remarks or a sharp CPI/PCE surprise contracts sentiment all over again.' },
    ] },

  { type: 'm-cta',
    idx: '06 / METHOD',
    title: 'Scored &\nfalsifiable',
    subtitle: 'Every tension is graded for narrative-vs-reality divergence before the angle ships.',
    score: '0.7',
    breakdown: [
      { label: 'Oil vs. output', value: '0.7', tone: 'pos' },
      { label: 'Fed vs. curve', value: '0.6' },
      { label: 'Semis vs. FX', value: '0.6' },
      { label: 'Direction', value: 'RISK-ON', tone: 'pos' },
    ],
    ctaTitle: 'See the full angle report\nand live signals.',
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

/** X(16:9) 전용 단일 카드 */
const twitterSlides: AnySlide[] = [
  { type: 'm-twitter',
    kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
    title: 'Panic Priced,\nFloor Holds',
    subtitle: 'Crude ripped and the Nasdaq lost over 2%. Claims at 187K and output at 102.64 say this is excess fear, not a recession.',
    signals: [
      { side: 'LONG', ticker: 'NDX', tone: 'pos' },
      { side: 'LONG', ticker: 'MSFT', tone: 'pos' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'SLOWDOWN',
    metrics: [
      { code: 'ICSA', status: 'RESILIENT', statusTone: 'pos', value: '187K', caption: 'Jobless claims Jul 18 · below the 250K line', viz: { kind: 'bar', pct: 45, tone: 'pos' } },
      { code: 'INDPRO', status: 'STEADY', statusTone: 'pos', value: '102.64', caption: 'Industrial output Jun · floor intact', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
      { code: 'WTI·VIX β', status: 'CONTAINED', statusTone: 'pos', value: '0.0734', caption: '1M beta · shock absorbed, not systemic', viz: { kind: 'bar', pct: 7, tone: 'pos' } },
      { code: 'WTI', status: 'SPIKE', statusTone: 'warn', value: '+24.18%', caption: '1M move · Middle East supply risk', viz: { kind: 'bars', heights: [38, 46, 58, 72, 88, 100], tone: 'warn' } },
    ],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' the market overpriced the oil spike as a permanent shock — the soft landing is still the base case.'],
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

const deck: CardNewsDeck = {
  id: 'stock-excessfear-2026-07-27',
  project: 'alphalenz',
  title: { ko: '공포는 과했다, 바닥은 버틴다', en: 'Panic Priced, Floor Holds' },
  source: 'https://alpha-lenz.com/en/angle-reports/2026-07-27-alpha-lenz-stock-report',
  date: '2026-07-27',
  theme: 'macro',
  accent: '#4FD1A5',
  caption: { ko: captionKo, en: captionEn },
  variants: [
    { id: 'linkedin', label: 'LinkedIn', width: 1080, height: 1350, slides },
    { id: 'x', label: 'X', width: 1920, height: 1080, caption: { ko: xCaptionKo, en: xCaptionEn }, slides: twitterSlides },
    { id: 'instagram', label: 'Instagram', width: 1080, height: 1350, caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
    { id: 'reels', label: 'Reels', width: 1080, height: 1920, kind: 'reels', caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
  ],
};

export default deck;
