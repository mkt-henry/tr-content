import type { AnySlide, CardNewsDeck } from '../../types';

/* AlphaLenz · Bitcoin Angle Report (2026-08-06) — macro 테마.
   LinkedIn 4:5 7장 · X 16:9 1장 · Instagram 4:5 7장 · Reels 9:16 영상.
   레짐 Transition · 확신 HIGH · 방향 SHORT(비트코인). 승리 가설 B: 규제 리스크 해소(CLARITY Act)의
   호재를 인플레 경직성과 제한적 인하가 만든 유동성 부족이 상쇄한다. 5년 실질금리(T5YIFR) 2.26%가
   무이자 자산의 밸류에이션을 누르고, 안전자산 수요는 금으로 간다(GOLD +4.83% vs BTC +0.88%).
   소프트랜딩(INDPRO 102.6 · T10Y2Y 0.45)이 유지돼 급격한 리스크오프도 오지 않는다.
   ACTION: Overweight GOLD. INVALIDATION: UMCSENT 55 초과 2주 연속.
   슬라이드 카피는 영어(macro 테마 규칙) · 게시 본문(caption)은 한/영 + 플랫폼별로 분리.
   데이터 출처: alpha-lenz.com 2026-08-06 Bitcoin Angle Report. */

const captionKo = `시장은 8월 상원의 CLARITY Act 표결을 기다리며 $64,000을 바닥으로 본다. 그런데 안전자산 수요는 이미 비트코인이 아닌 금으로 가고 있다.

이번 비트코인 앵글 리포트는 규제 리스크 해소라는 호재를 거시 현실이 상쇄한다고 본다. 인플레 경직성과 제한적 인하가 만든 유동성 부족이 더 크다.

콜 (확신 HIGH):
→ 금(GOLD) 비중확대 · 비트코인은 $64,000 중심 횡보 또는 하방

거시가 이긴다고 보는 이유:
• 5년 실질금리(T5YIFR) 2.26% — 무이자 자산의 밸류에이션을 지속적으로 누른다
• 같은 기간 금 +4.83% vs 비트코인 +0.88% — 안전자산 경쟁력이 뚜렷하게 훼손됐다
• 산업생산(INDPRO) 102.6 — 소프트랜딩이 유지돼 급격한 리스크오프가 오지 않는다
• 10Y-2Y 금리차 0.45 — 플러스 전환으로 침체 공포가 완화됐다
• 소비심리(UMCSENT) 49.5(6월) — 수축 국면이지만 붕괴는 아니다. 실수요는 약한 채로 남는다
• 소비자물가(CPI) 332.5 — 인플레 경직성이 연준의 인하 속도를 제약한다

시장의 서사는 낙관이다. 블랙록 등 기관의 ETF 순유입과 고래 매집이 $64,000을 지지하고, AI 버블이 터지면 비트코인이 '디지털 금'으로 재평가된다는 극단적 시나리오가 공포를 달래는 심리적 앵커 역할을 한다. 그러나 데이터는 반대 방향이다. 리스크오프 모멘텀이 없는 상태에서 규제 리스크 해소만으로는 유동성 부족을 메울 수 없고, 고래·기관의 매수는 CLARITY Act 지연이 만든 규제 불확실성에 상쇄된다. 거시 역풍 다섯 개가 호재 하나를 압도하는 구도다.

무효화 — 소비심리(UMCSENT)가 2주 연속 55를 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트 & 실시간 시그널 → https://alpha-lenz.com/en/angle-reports/2026-08-06-alpha-lenz-bitcoin-report

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#비트코인 #매크로 #금 #실질금리 #디지털금 #ETF #AIinFinance #AlphaLenz`;

const captionEn = `The market is waiting on the August Senate vote on the CLARITY Act and treating $64,000 as a floor. Meanwhile the safe-haven bid has already moved — into gold, not bitcoin.

Our latest Bitcoin Angle reads the regulatory catalyst as real but outweighed. Sticky inflation and limited cuts leave a liquidity shortage that regulatory clarity alone cannot fill.

The call (conviction HIGH):
→ Overweight GOLD · bitcoin range-bound around $64,000 or lower

Why macro wins:
• 5Y real yield (T5YIFR) at 2.26% — persistent discount pressure on a non-yielding asset
• Gold +4.83% vs bitcoin +0.88% over the same window — safe-haven competitiveness is deteriorating
• Industrial production (INDPRO) 102.6 — the soft landing holds, so the sharp risk-off never arrives
• 10Y–2Y at 0.45 — the curve has turned positive and recession fear is easing
• Consumer sentiment (UMCSENT) 49.5 in June — contraction, but not collapse. Real demand stays weak
• CPI at 332.5 — inflation stickiness constrains the pace of Fed cuts

The market narrative is optimistic: ETF net inflows from institutions like BlackRock and whale accumulation underpin $64,000, and an extreme "bitcoin to $1 million if the AI bubble bursts" scenario works as a psychological anchor against fear. The data points the other way. Without risk-off momentum, resolving regulatory risk cannot compensate for the liquidity shortage, and institutional buying is offset by the uncertainty a delayed CLARITY Act creates. Five macro headwinds against one positive catalyst.

Invalidation is explicit — UMCSENT above 55 for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report & live signals → https://alpha-lenz.com/en/angle-reports/2026-08-06-alpha-lenz-bitcoin-report

Not investment advice. For research & informational purposes.

#Bitcoin #Macro #Gold #RealRates #DigitalGold #ETF #AIinFinance #AlphaLenz`;

/* X(트위터) 전용 — 훅 우선·압축·캐시태그·짧은 줄. */
const xCaptionKo = `시장은 $BTC $64,000을 바닥으로 본다. 안전자산 수요는 이미 $GOLD로 갔다.

규제 해소 호재보다 거시 역풍이 크다.

콜 (확신 HIGH):
↑ $GOLD 비중확대 · $BTC는 $64K 횡보 또는 하방

근거:
• 5년 실질금리 2.26% — 무이자 자산 밸류에이션 압박
• 금 +4.83% vs 비트코인 +0.88% — 안전자산 경쟁력 훼손
• 산업생산 102.6 — 소프트랜딩 유지, 급격한 리스크오프 없음
• 10Y-2Y 0.45 — 침체 공포 완화

거시 역풍 5개 vs 호재 1개(CLARITY Act).

무효화: 소비심리 55 초과 2주 연속.

전체 앵글 ↓
https://alpha-lenz.com/en/angle-reports/2026-08-06-alpha-lenz-bitcoin-report

투자자문 아님 · 리서치용

#비트코인 #금 #매크로 #AlphaLenz`;

const xCaptionEn = `The market calls $64,000 a floor for $BTC. The safe-haven bid already left — for $GOLD.

Macro headwinds outweigh the regulatory catalyst.

The call (HIGH):
↑ Overweight $GOLD · $BTC range-bound at $64K or lower

Why:
• 5Y real yield 2.26% — discount pressure on a non-yielding asset
• Gold +4.83% vs BTC +0.88% — safe-haven edge eroding
• INDPRO 102.6 — soft landing holds, no sharp risk-off
• 10Y–2Y 0.45 — recession fear easing

Five macro headwinds vs one catalyst (CLARITY Act).

Invalidation: UMCSENT above 55 for 2 straight weeks.

Full angle ↓
https://alpha-lenz.com/en/angle-reports/2026-08-06-alpha-lenz-bitcoin-report

Not advice · research only

#Bitcoin #Gold #Macro #AlphaLenz`;

/* 인스타그램 전용 — 첫 2줄에 결론까지, URL 대신 프로필 링크, 해시태그 15~20개. 릴스와 공유. */
const igCaptionKo = `시장은 $64,000을 비트코인의 바닥으로 본다.
그런데 안전자산 수요는 이미 비트코인이 아닌 금으로 갔다 — 거시가 규제 호재를 이긴다.

콜 (확신 HIGH)
↑ 금(GOLD) 비중확대 · 비트코인은 $64,000 중심 횡보 또는 하방

거시가 이긴다고 보는 이유
• 5년 실질금리(T5YIFR) 2.26% — 무이자 자산의 밸류에이션을 지속적으로 누른다
• 같은 기간 금 +4.83% vs 비트코인 +0.88% — 안전자산 경쟁력이 뚜렷하게 훼손됐다
• 산업생산(INDPRO) 102.6 — 소프트랜딩이 유지돼 급격한 리스크오프가 오지 않는다
• 10Y-2Y 금리차 0.45 — 플러스 전환으로 침체 공포가 완화됐다
• 소비심리(UMCSENT) 49.5(6월) — 수축 국면, 실수요는 약한 채로 남는다
• 소비자물가(CPI) 332.5 — 인플레 경직성이 인하 속도를 제약한다

시장은 ETF 순유입과 고래 매집, 그리고 'AI 버블이 터지면 비트코인이 디지털 금이 된다'는 서사에 기대고 있다. 그러나 리스크오프 모멘텀이 없는 상태에서 규제 해소만으로는 유동성 부족을 메울 수 없다. 거시 역풍 다섯 개가 호재 하나를 압도한다.

무효화 조건: 소비심리가 2주 연속 55를 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트는 프로필 링크에서 👆

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#비트코인 #암호화폐 #코인 #가상자산 #금투자 #금 #매크로 #실질금리 #연준 #금리 #ETF #경제지표 #투자공부 #재테크 #자산배분 #퀀트 #AlphaLenz #알파렌즈 #Bitcoin #CryptoKR`;

const igCaptionEn = `The market calls $64,000 the floor for bitcoin.
But the safe-haven bid already moved to gold — macro is beating the regulatory catalyst.

THE CALL (conviction HIGH)
↑ Overweight GOLD · bitcoin range-bound around $64,000 or lower

WHY MACRO WINS
• 5Y real yield (T5YIFR) 2.26% — persistent discount pressure on a non-yielding asset
• Gold +4.83% vs bitcoin +0.88% over the same window — safe-haven competitiveness deteriorating
• Industrial production (INDPRO) 102.6 — the soft landing holds, so the sharp risk-off never arrives
• 10Y–2Y at 0.45 — the curve turned positive, recession fear easing
• Consumer sentiment (UMCSENT) 49.5 in June — contraction, real demand stays weak
• CPI 332.5 — inflation stickiness constrains the pace of cuts

The market leans on ETF inflows, whale accumulation and a "bitcoin becomes digital gold when the AI bubble bursts" story. Without risk-off momentum, resolving regulatory risk cannot compensate for the liquidity shortage. Five macro headwinds against one catalyst.

Invalidation: UMCSENT above 55 for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report via the link in bio 👆

Not investment advice. For research & informational purposes.

#bitcoin #crypto #btc #gold #macro #realrates #investing #markets #fed #interestrates #etf #digitalgold #economy #quant #aiinfinance #fintech #marketanalysis #investor #AlphaLenz`;

/** 링크드인·인스타·릴스가 공유하는 7장. 배열을 공유하므로 수치 불일치가 발생할 수 없다. */
const slides: AnySlide[] = [
  { type: 'm-cover',
    kicker: 'BITCOIN ANGLE · AI MARKET ANALYSIS',
    title: 'Macro\nWins,\nBTC Lags',
    subtitle: 'The market calls $64K a floor. Real yields at 2.26% and gold outrunning bitcoin 4.83% to 0.88% say the safe-haven bid already left.',
    signals: [
      { side: 'SHORT', ticker: 'BTC', tone: 'neg' },
      { side: 'LONG', ticker: 'GOLD', tone: 'pos' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'TRANSITION' },

  { type: 'm-call',
    idx: '01 / THE CALL',
    title: 'Own the\nother\nhedge',
    subtitle: 'Regulatory clarity is a real catalyst, but it cannot buy liquidity. The safe-haven flow is already going somewhere else.',
    cards: [
      { tone: 'pos', arrow: '↑', tag: 'INCREASE EXPOSURE', headline: 'Overweight GOLD', desc: 'Gold gained 4.83% while bitcoin managed 0.88% — the hedge bid is picking a side.' },
      { tone: 'neg', arrow: '→', tag: 'RANGE, NOT BREAKOUT', headline: 'Bitcoin near $64K', desc: 'Support may hold, but liquidity scarcity caps the range ceiling the market expects in October.' },
      { tone: 'neg', arrow: '↓', tag: 'THE DISCOUNT RATE', headline: 'Real yields at 2.26%', desc: 'T5YIFR keeps pressing the valuation of a non-yielding asset until cuts arrive.' },
    ],
    conviction: 4, max: 5, convText: '4 / 5 · HIGH' },

  { type: 'm-narrative',
    idx: '02 / THE THESIS',
    title: 'Narrative\nvs. Reality',
    narrative: ['Ahead of the ', { t: 'August Senate vote on the CLARITY Act', tone: 'white' }, ', ETF net inflows from BlackRock and whale accumulation make ', { t: '$64,000', tone: 'white' }, ' look like a floor — with a breakout expected around October and a re-rating to "digital gold" if the AI bubble bursts.'],
    reality: ['The ', { t: '5Y real yield sits at 2.26%', tone: 'white' }, ', and over the same window ', { t: 'gold gained 4.83% against bitcoin\'s 0.88%', tone: 'white' }, '. With ', { t: 'INDPRO at 102.6', tone: 'white' }, ' and the curve back positive, the sharp risk-off that would drive safe-haven demand never arrives.'],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' five macro headwinds outweigh one catalyst. Even if $64K holds, sideways or lower beats a breakout.'] },

  { type: 'm-data',
    idx: '03 / THE DATA',
    title: 'The macro reality',
    source: 'Source: FRED · price feeds',
    metrics: [
      { code: 'T5YIFR', status: 'ELEVATED', statusTone: 'neg', value: '2.26%', caption: '5Y real yield · discount pressure on non-yielding assets', viz: { kind: 'bar', pct: 75, tone: 'neg' } },
      { code: 'GOLD', status: 'LEADING', statusTone: 'pos', value: '+4.83%', caption: 'Same-window return · the safe-haven bid', viz: { kind: 'bars', heights: [34, 46, 55, 70, 86, 100], tone: 'pos' } },
      { code: 'BTC', status: 'LAGGING', statusTone: 'neg', value: '+0.88%', caption: 'Same-window return · hedge competitiveness eroding', viz: { kind: 'bar', pct: 9, tone: 'neg' } },
      { code: 'INDPRO', status: 'STEADY', statusTone: 'pos', value: '102.6', caption: 'Industrial output · soft landing intact', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
      { code: 'UMCSENT', status: 'CONTRACTION', statusTone: 'neg', value: '49.5', caption: 'Consumer sentiment Jun · below the 50 line', viz: { kind: 'bar', pct: 49.5, tone: 'neg', marker: 'center' } },
      { code: 'T10Y2Y', status: 'NORMALIZED', statusTone: 'warn', value: '0.45', caption: 'Curve positive · recession fear easing', viz: { kind: 'bar', from: 50, pct: 11, tone: 'warn', marker: 'center' } },
    ] },

  { type: 'm-tensions',
    idx: '04 / TENSIONS',
    title: 'Three tensions\nto watch',
    items: [
      { n: '01', text: [{ t: 'Regulatory relief and ETF inflows', tone: 'pos' }, ' vs. ', { t: 'liquidity constraints', tone: 'neg' }, ' from sticky inflation — CPI 332.5 and limited cuts. Divergence 0.7.'], tags: ['BTC', 'ETH', 'US10Y', 'DXY'] },
      { n: '02', text: ['The ', { t: '$1M AI-bubble safe-haven story', tone: 'pos' }, ' vs. ', { t: 'no risk-off momentum', tone: 'neg' }, ' — INDPRO 102.6 and a normalized curve. Divergence 0.6.'], tags: ['BTC', 'NDX', 'GOLD', 'VIX'] },
      { n: '03', text: [{ t: 'Whale and ETF accumulation at $64K', tone: 'pos' }, ' vs. ', { t: 'stagnation under a delayed CLARITY Act', tone: 'neg' }, '. Divergence 0.5.'], tags: ['BTC', 'ETH', 'XRP'] },
    ] },

  { type: 'm-plan',
    idx: '05 / THE PLAN',
    title: 'Trade plan',
    action: 'Overweight GOLD',
    invalidation: 'UMCSENT above 55 for 2 weeks straight',
    risks: [
      { tag: 'MACRO', text: 'Real yields (T5YIFR) push above 2.5%, intensifying discount-rate pressure on non-yielding assets.' },
      { tag: 'EVENT', text: 'The CLARITY Act floor vote is delayed, or amendments pass and regulatory uncertainty reignites.' },
      { tag: 'GROWTH', text: 'INDPRO deteriorates sharply, breaking the soft-landing case and triggering the risk-off move this thesis rules out.' },
    ] },

  { type: 'm-cta',
    idx: '06 / METHOD',
    title: 'Scored &\nfalsifiable',
    subtitle: 'Every tension is graded for narrative-vs-reality divergence before the angle ships.',
    score: '0.7',
    breakdown: [
      { label: 'Clarity vs. liquidity', value: '0.7', tone: 'neg' },
      { label: 'Hedge story vs. data', value: '0.6' },
      { label: 'Flows vs. regulation', value: '0.5' },
      { label: 'Direction', value: 'DEFENSIVE', tone: 'neg' },
    ],
    ctaTitle: 'See the full angle report\nand live signals.',
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

/** X(16:9) 전용 단일 카드 */
const twitterSlides: AnySlide[] = [
  { type: 'm-twitter',
    kicker: 'BITCOIN ANGLE · AI MARKET ANALYSIS',
    title: 'Macro Wins,\nBTC Lags',
    subtitle: 'The market calls $64K a floor. Real yields at 2.26% and gold outrunning bitcoin 4.83% to 0.88% say the safe-haven bid already left.',
    signals: [
      { side: 'SHORT', ticker: 'BTC', tone: 'neg' },
      { side: 'LONG', ticker: 'GOLD', tone: 'pos' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'TRANSITION',
    metrics: [
      { code: 'T5YIFR', status: 'ELEVATED', statusTone: 'neg', value: '2.26%', caption: '5Y real yield · discount pressure on non-yielding assets', viz: { kind: 'bar', pct: 75, tone: 'neg' } },
      { code: 'GOLD', status: 'LEADING', statusTone: 'pos', value: '+4.83%', caption: 'Same-window return · the safe-haven bid', viz: { kind: 'bars', heights: [34, 46, 55, 70, 86, 100], tone: 'pos' } },
      { code: 'BTC', status: 'LAGGING', statusTone: 'neg', value: '+0.88%', caption: 'Same-window return · hedge competitiveness eroding', viz: { kind: 'bar', pct: 9, tone: 'neg' } },
      { code: 'INDPRO', status: 'STEADY', statusTone: 'pos', value: '102.6', caption: 'Industrial output · soft landing intact', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
    ],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' regulatory relief cannot buy liquidity — bitcoin stays range-bound near $64K while gold takes the hedge bid.'],
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

const deck: CardNewsDeck = {
  id: 'btc-macrowins-2026-08-06',
  project: 'alphalenz',
  title: { ko: '거시가 이긴다, 비트코인은 뒤처진다', en: 'Macro Wins, BTC Lags' },
  source: 'https://alpha-lenz.com/en/angle-reports/2026-08-06-alpha-lenz-bitcoin-report',
  date: '2026-08-06',
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
