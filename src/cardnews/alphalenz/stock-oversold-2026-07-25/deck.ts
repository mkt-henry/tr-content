import type { AnySlide, CardNewsDeck } from '../../types';

/* AlphaLenz · Stock Angle Report (2026-07-25) — macro 테마.
   LinkedIn 4:5 7장 · X 16:9 1장 · Instagram 4:5 7장 · Reels 9:16 영상.
   레짐 Slowdown · 확신 HIGH. 승리 가설 B(SHORT the narrative): 시장이 틀렸다 — 스태그플레이션 공포가
   실물경제의 바닥(INDPRO 102.64 · ICSA 18.7만 · T10Y2Y +0.36%)을 과소평가한 과매도 구간.
   ACTION: Overweight SPX · Underweight KOSPI · Underweight GOLD.
   슬라이드 카피는 영어(macro 테마 규칙) · 게시 본문(caption)은 한/영 + 플랫폼별로 분리.
   데이터 출처: alpha-lenz.com 2026-07-25 Stock Angle Report. */

const captionKo = `중동發 유가 급등이 시장을 흔들었다. 그런데 노동시장은 멀쩡하다.

이번 주식 앵글 리포트는 이번 급락을 '지연된 낙관'이 만든 과매도 구간으로 본다. 스태그플레이션 공포가 실물경제의 바닥을 과소평가하고 있다.

콜 (확신 HIGH):
→ S&P500(SPX) 비중확대
→ 코스피(KOSPI) 비중축소
→ 금(GOLD) 비중축소

침체가 아니라고 보는 이유:
• 신규 실업수당(ICSA) 18.7만 건 — 25만 임계선에 한참 못 미친다
• 10Y-2Y 금리차 +0.36% — 여전히 플러스, 침체 신호 없음
• 산업생산(INDPRO) 102.64 — 완만한 성장 지속
• 소비심리(UMCSENT) 44.8 — 고금리 환경의 일시적 위축
• WTI +25.79% — 유가 충격은 실물 지표가 반박한다

시장은 중동 확전과 연준의 'Higher for Longer'를 스태그플레이션으로 읽었다. 나스닥 -2%대, 코스피 -5.72%, 원/달러 1,466.6. 그러나 18.7만 건의 실업수당과 플러스 금리차는 침체를 부정한다. 5년 1,000억 달러 규모로 전망되는 반도체 섹터의 장기 강세가 시장 전반의 약세를 상쇄할 동력이다. 다만 CPI 332.57은 연준의 인하 여력을 제한한다 — 리포트가 함께 제시한 종목은 XOM·S-Oil(유가 헤지), LMT(지정학 헤지), WMT·JNJ·KT&G(방어적 현금흐름)다.

무효화 — 신규 실업수당(ICSA)이 2주 연속 25만 건을 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트 & 실시간 시그널 → https://alpha-lenz.com/en/angle-reports/2026-07-25-alpha-lenz-stock-report

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #S&P500 #코스피 #유가 #과매도 #AIinFinance #AlphaLenz`;

const captionEn = `Crude spiked, the tape broke — and the labor market didn't blink.

Our latest Stock Angle reads this drawdown as an oversold zone built on "delayed optimism." The stagflation panic underestimates the floor under the real economy.

The call (conviction HIGH):
→ Overweight SPX
→ Underweight KOSPI
→ Underweight GOLD

Why this isn't a recession:
• Jobless claims (ICSA) at 187K — far below the 250K break line
• 10Y–2Y at +0.36% — still positive, no recession signal
• Industrial production (INDPRO) steady at 102.64 — moderate growth intact
• Consumer sentiment (UMCSENT) 44.8 — a temporary high-rate squeeze
• WTI +25.79% — an oil shock the hard data refutes

The market read Middle East escalation and the Fed's Higher for Longer stance as stagflation: the Nasdaq off more than 2%, KOSPI down 5.72%, USD/KRW at 1,466.6. But 187K claims and a positive curve say otherwise. A semiconductor sector projected at $100B in five years is the driver capable of offsetting broad-market weakness. The caveat: CPI at 332.57 leaves the Fed little room to cut — which is why the report pairs the call with hedges: XOM and S-Oil (oil), LMT (geopolitical), WMT, J&J and KT&G (defensive cash-flows).

Invalidation is explicit — jobless claims (ICSA) above 250K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report & live signals → https://alpha-lenz.com/en/angle-reports/2026-07-25-alpha-lenz-stock-report

Not investment advice. For research & informational purposes.

#Macro #Markets #Investing #SP500 #Oil #Oversold #AIinFinance #AlphaLenz`;

/* X(트위터) 전용 — 훅 우선·압축·캐시태그·짧은 줄. 링크드인보다 훨씬 타이트. */
const xCaptionKo = `유가가 튀었고, 시장은 무너졌다. 노동시장은 멀쩡하다.

이번 급락은 침체가 아니라 과매도다.

콜 (확신 HIGH):
↑ $SPX 비중확대
↓ $KOSPI 비중축소
↓ $GOLD 비중축소

근거:
• 실업수당 18.7만 — 25만 임계선 한참 아래
• 10Y-2Y +0.36% — 플러스, 침체 신호 없음
• 산업생산 102.64 — 완만한 성장 지속
• $WTI +25.79% — 유가 충격은 실물이 반박

코스피 -5.72%, 원/달러 1,466.6 = 지정학 리스크에 대한 일시적 과잉반응.

무효화: 실업수당 25만 2주 연속 초과.

전체 앵글 ↓
https://alpha-lenz.com/en/angle-reports/2026-07-25-alpha-lenz-stock-report

투자자문 아님 · 리서치용

#매크로 #유가 #코스피 #AlphaLenz`;

const xCaptionEn = `Crude spiked. The tape broke. The labor market didn't blink.

This drawdown is oversold, not recessionary.

The call (HIGH):
↑ Overweight $SPX
↓ Underweight $KOSPI
↓ Underweight $GOLD

Why:
• Jobless claims 187K — far below the 250K break line
• 10Y–2Y +0.36% — positive, no recession signal
• INDPRO 102.64 — moderate growth intact
• $WTI +25.79% — an oil shock the hard data refutes

KOSPI -5.72% and KRW at 1,466.6 = a temporary overreaction to geopolitical risk.

Invalidation: claims above 250K for 2 straight weeks.

Full angle ↓
https://alpha-lenz.com/en/angle-reports/2026-07-25-alpha-lenz-stock-report

Not advice · research only

#Macro #Oil #SP500 #AlphaLenz`;

/* 인스타그램 전용 — 링크가 클릭되지 않고 첫 2줄만 펼침 전에 보이는 매체.
   첫 2줄에 결론까지, URL 대신 프로필 링크 안내, 해시태그 15~20개. 릴스와 공유한다. */
const igCaptionKo = `중동發 유가 급등이 시장을 흔들었다.
그런데 노동시장은 멀쩡하다 — 침체가 아니라 과매도다.

콜 (확신 HIGH)
↑ S&P500(SPX) 비중확대
↓ 코스피(KOSPI) 비중축소
↓ 금(GOLD) 비중축소

침체가 아니라고 보는 이유
• 신규 실업수당(ICSA) 18.7만 건 — 25만 임계선에 한참 못 미친다
• 10Y-2Y 금리차 +0.36% — 여전히 플러스, 침체 신호 없음
• 산업생산(INDPRO) 102.64 — 완만한 성장 지속
• 소비심리(UMCSENT) 44.8 — 고금리 환경의 일시적 위축
• WTI +25.79% — 유가 충격은 실물 지표가 반박한다

시장은 중동 확전과 연준의 'Higher for Longer'를 스태그플레이션으로 읽었다. 나스닥 -2%대, 코스피 -5.72%, 원/달러 1,466.6. 그러나 18.7만 건의 실업수당과 플러스 금리차는 침체를 부정한다. 다만 CPI 332.57은 연준의 인하 여력을 제한한다 — 리포트가 함께 제시한 종목은 XOM·S-Oil(유가 헤지), LMT(지정학 헤지), WMT·JNJ·KT&G(방어적 현금흐름)다.

무효화 조건: 신규 실업수당이 2주 연속 25만 건을 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트는 프로필 링크에서 👆

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #S&P500 #코스피 #유가 #과매도 #주식투자 #해외주식 #미국주식 #연준 #금리 #경제지표 #투자공부 #재테크 #AI투자 #원자재 #AlphaLenz #알파렌즈 #InvestingKR #StockMarket`;

const igCaptionEn = `Crude spiked and the tape broke.
The labor market didn't blink — this is oversold, not recessionary.

THE CALL (conviction HIGH)
↑ Overweight SPX
↓ Underweight KOSPI
↓ Underweight GOLD

WHY THIS ISN'T A RECESSION
• Jobless claims (ICSA) at 187K — far below the 250K break line
• 10Y–2Y at +0.36% — still positive, no recession signal
• Industrial production (INDPRO) steady at 102.64 — moderate growth intact
• Consumer sentiment (UMCSENT) 44.8 — a temporary high-rate squeeze
• WTI +25.79% — an oil shock the hard data refutes

The market read Middle East escalation and the Fed's Higher for Longer stance as stagflation: the Nasdaq off more than 2%, KOSPI down 5.72%, USD/KRW at 1,466.6. But 187K claims and a positive curve say otherwise. The caveat: CPI at 332.57 leaves the Fed little room to cut — which is why the report pairs the call with hedges: XOM and S-Oil (oil), LMT (geopolitical), WMT, J&J and KT&G (defensive cash-flows).

Invalidation: jobless claims above 250K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report via the link in bio 👆

Not investment advice. For research & informational purposes.

#macro #markets #investing #sp500 #kospi #oil #oversold #stocks #stockmarket #fed #interestrates #economy #commodities #quant #aiinfinance #fintech #investor #marketanalysis #AlphaLenz`;

/** 링크드인·인스타·릴스가 공유하는 7장. 배열을 공유하므로 수치 불일치가 발생할 수 없다. */
const slides: AnySlide[] = [
  { type: 'm-cover',
    kicker: 'STOCK ANGLE · AI MARKET ANALYSIS',
    title: 'Oil Shock,\nNot a\nRecession',
    subtitle: 'Crude spiked and the tape broke. Jobless claims at 187K and a positive curve say this is an oversold zone, not a downturn.',
    signals: [
      { side: 'LONG', ticker: 'SPX', tone: 'pos' },
      { side: 'SHORT', ticker: 'KOSPI', tone: 'neg' },
      { side: 'SHORT', ticker: 'GOLD', tone: 'neg' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'SLOWDOWN' },

  { type: 'm-call',
    idx: '01 / THE CALL',
    title: 'Buy the\nselloff',
    subtitle: 'The stagflation panic is priced. Rotate out of the fear trade, back into US large caps.',
    cards: [
      { tone: 'pos', arrow: '↑', tag: 'INCREASE EXPOSURE', headline: 'Overweight SPX', desc: 'Resilient jobs and a positive curve — oversold, not broken.' },
      { tone: 'neg', arrow: '↓', tag: 'REDUCE EXPOSURE', headline: 'Underweight KOSPI', desc: 'Down -5.72%, won at 1,466.6 — the full brunt of the shock.' },
      { tone: 'neg', arrow: '↓', tag: 'REDUCE EXPOSURE', headline: 'Underweight GOLD', desc: 'A crowded hedge — the safe-haven bid unwinds first.' },
    ],
    conviction: 4, max: 5, convText: '4 / 5 · HIGH' },

  { type: 'm-narrative',
    idx: '02 / THE THESIS',
    title: 'Narrative\nvs. Reality',
    narrative: ['Middle East escalation sent ', { t: 'WTI +25.79%', tone: 'white' }, ', dragging the ', { t: 'Nasdaq down over 2%', tone: 'white' }, ' and ', { t: 'KOSPI -5.72%', tone: 'white' }, '. With the Fed stuck at Higher for Longer, the tape prices stagflation.'],
    reality: ['Industrial output holds at ', { t: '102.64', tone: 'white' }, ', jobless claims sit at ', { t: '187K', tone: 'white' }, ' — far below the ', { t: '250K', tone: 'white' }, ' break line — and the ', { t: '10Y–2Y stays positive at +0.36%', tone: 'white' }, '. No recession signal in the hard data.'],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' the drawdown is an oversold zone of delayed optimism — the real-economy floor holds.'] },

  { type: 'm-data',
    idx: '03 / THE DATA',
    title: 'The macro reality',
    source: 'Source: FRED · price feeds',
    metrics: [
      { code: 'ICSA', status: 'RESILIENT', statusTone: 'pos', value: '187K', caption: 'Jobless claims · far below the 250K line', viz: { kind: 'bar', pct: 45, tone: 'pos' } },
      { code: 'T10Y2Y', status: '+0.36%', statusTone: 'pos', value: '+0.36%', caption: 'Curve positive · no recession signal', viz: { kind: 'bar', from: 50, pct: 9, tone: 'pos', marker: 'center' } },
      { code: 'INDPRO', status: 'STEADY', statusTone: 'pos', value: '102.64', caption: 'Industrial output · moderate growth', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
      { code: 'UMCSENT', status: 'CONTRACTION', statusTone: 'neg', value: '44.8', caption: 'Consumer sentiment · high-rate squeeze', viz: { kind: 'bar', pct: 44.8, tone: 'neg', marker: 'center' } },
      { code: 'WTI', status: 'SPIKE', statusTone: 'warn', value: '+25.79%', caption: 'Oil shock · inflation fear re-ignites', viz: { kind: 'bars', heights: [38, 46, 58, 72, 88, 100], tone: 'warn' } },
      { code: 'KOSPI', status: 'OVERSOLD', statusTone: 'neg', value: '-5.72%', caption: 'Sharp drop · USD/KRW at 1,466.6', viz: { kind: 'bars', heights: [100, 94, 86, 72, 58, 44], tone: 'neg' } },
    ] },

  { type: 'm-tensions',
    idx: '04 / TENSIONS',
    title: 'Three tensions\nto watch',
    items: [
      { n: '01', text: ['An ', { t: 'oil-driven panic', tone: 'neg' }, ' (WTI +25.79%) vs. ', { t: 'moderate real growth', tone: 'pos' }, ' with INDPRO at 102.64.'], tags: ['NDX', 'WTI', 'US10Y'] },
      { n: '02', text: [{ t: 'Consumer sentiment 44.8', tone: 'neg' }, ' in deep contraction vs. a ', { t: 'resilient labor market', tone: 'pos' }, ' at 187K claims.'], tags: ['SPX', 'DXY', 'USDKRW'] },
      { n: '03', text: ['A ', { t: 'semiconductor boom', tone: 'pos' }, ' ($100B in five years) vs. ', { t: 'broad-market fragmentation', tone: 'neg' }, ' — KOSPI -5.72%, a weak won.'], tags: ['KOSPI', 'NDX', 'USDKRW'] },
    ] },

  { type: 'm-plan',
    idx: '05 / THE PLAN',
    title: 'Trade plan',
    action: 'Overweight SPX · Underweight KOSPI & GOLD',
    invalidation: 'ICSA above 250K for 2 weeks straight',
    risks: [
      { tag: 'MACRO', text: 'Oil-driven stagflation re-ignites and the Fed turns back to hikes — CPI 332.57 already leaves little room to cut.' },
      { tag: 'POSITIONING', text: 'If the rebound fails in the oversold zone, algorithmic selling extends the risk-off leg.' },
      { tag: 'EVENT', text: 'Further Middle East escalation sharply amplifies supply-chain disruption and geopolitical risk.' },
    ] },

  { type: 'm-cta',
    idx: '06 / METHOD',
    title: 'Scored &\nfalsifiable',
    subtitle: 'Every tension is graded for narrative-vs-reality divergence before the angle ships.',
    score: '0.8',
    breakdown: [
      { label: 'Semis vs. market', value: '0.8', tone: 'pos' },
      { label: 'Oil vs. output', value: '0.7' },
      { label: 'Sentiment vs. jobs', value: '0.7' },
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
    title: 'Oil Shock, Not\na Recession',
    subtitle: 'Crude spiked and the tape broke. Jobless claims at 187K and a positive curve say this is an oversold zone, not a downturn.',
    signals: [
      { side: 'LONG', ticker: 'SPX', tone: 'pos' },
      { side: 'SHORT', ticker: 'KOSPI', tone: 'neg' },
    ],
    conviction: 4, max: 5, convLabel: 'HIGH', regime: 'SLOWDOWN',
    metrics: [
      { code: 'ICSA', status: 'RESILIENT', statusTone: 'pos', value: '187K', caption: 'Jobless claims · far below the 250K line', viz: { kind: 'bar', pct: 45, tone: 'pos' } },
      { code: 'T10Y2Y', status: '+0.36%', statusTone: 'pos', value: '+0.36%', caption: 'Curve positive · no recession signal', viz: { kind: 'bar', from: 50, pct: 9, tone: 'pos', marker: 'center' } },
      { code: 'INDPRO', status: 'STEADY', statusTone: 'pos', value: '102.64', caption: 'Industrial output · moderate growth', viz: { kind: 'bar', pct: 82, tone: 'pos' } },
      { code: 'WTI', status: 'SPIKE', statusTone: 'warn', value: '+25.79%', caption: 'Oil shock · inflation fear re-ignites', viz: { kind: 'bars', heights: [38, 46, 58, 72, 88, 100], tone: 'warn' } },
    ],
    verdict: [{ t: 'Verdict:', tone: 'white' }, ' the drawdown is an oversold zone of delayed optimism — the real-economy floor holds.'],
    url: 'alpha-lenz.com',
    disclaimer: 'Not investment advice. For research & informational purposes.' },
];

const deck: CardNewsDeck = {
  id: 'stock-oversold-2026-07-25',
  project: 'alphalenz',
  title: { ko: '오일 쇼크는 침체가 아니다', en: 'Oil Shock, Not a Recession' },
  source: 'https://alpha-lenz.com/en/angle-reports/2026-07-25-alpha-lenz-stock-report',
  date: '2026-07-25',
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
