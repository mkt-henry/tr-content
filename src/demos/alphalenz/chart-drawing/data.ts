import type { L } from '../_shared/i18n';

/**
 * AI 차트 드로잉 데모 더미 데이터.
 * - 가격 시계열: 상승 추세 + 중간 눌림목이 있는 더미 (인덱스 기준 좌표)
 * - 종목 메타 / 드로잉 단계 라벨·코멘트 / 패턴명 (모두 ko/en)
 */

export interface PricePoint {
  /** 0..N-1 인덱스 */
  i: number;
  /** 종가 */
  price: number;
}

/**
 * 52개 포인트. 저점 → 1차 상승 → 눌림목(되돌림) → 돌파 → 손잡이 → 마지막 상승.
 * Cup & Handle 형태를 의도적으로 그렸다.
 */
export const PRICE_SERIES: PricePoint[] = [
  198, 201, 197, 203, 206, 204, 209, 213, 211, 216, // 0-9  1차 랠리
  220, 224, 221, 226, 230, 228, 233, 231, 227, 222, // 10-19 고점 찍고 하락 시작
  216, 209, 204, 199, 196, 194, 197, 195, 199, 203, // 20-29 컵 바닥
  208, 213, 217, 222, 226, 229, 231, 233, 230, 226, // 30-39 컵 오른쪽 + 손잡이 시작
  223, 221, 224, 222, 226, 229, 232, 230, 234, 238, // 40-49 손잡이 후 돌파
  241, 245, // 50-51 마지막 상승
].map((price, i) => ({ i, price }));

export const PRICE_MIN = 188;
export const PRICE_MAX = 252;

/** 종목 메타 — variant별로 다른 종목 */
export interface Ticker {
  name: L;
  symbol: string;
  exchange: string;
  price: string;
  change: L;
  positive: boolean;
}

export const TICKER_ANALYSIS: Ticker = {
  name: { ko: '애플', en: 'Apple Inc.' },
  symbol: 'AAPL',
  exchange: 'NASDAQ',
  price: '$245.18',
  change: { ko: '+1.8% (4시간봉)', en: '+1.8% (4H)' },
  positive: true,
};

export const TICKER_SETUP: Ticker = {
  name: { ko: '엔비디아', en: 'NVIDIA Corp.' },
  symbol: 'NVDA',
  exchange: 'NASDAQ',
  price: '$148.62',
  change: { ko: '+2.4% (일봉)', en: '+2.4% (1D)' },
  positive: true,
};

/** 드로잉 한 단계 = 차트 위 요소 1종 + 우측 코멘트 1줄 */
export interface DrawStep {
  /** 차트 위 라벨 */
  label: L;
  /** 우측 패널 분석 코멘트 */
  comment: L;
  /** 라벨 칩 색 */
  color: string;
}

/** v1 — 기술 분석 톤 */
export const STEPS_ANALYSIS: DrawStep[] = [
  {
    label: { ko: '지지선', en: 'Support' },
    comment: { ko: '$196 부근에서 3회 지지 확인 — 주요 수요 구간', en: 'Triple-tested support near $196 — key demand zone' },
    color: '#34d399',
  },
  {
    label: { ko: '저항선', en: 'Resistance' },
    comment: { ko: '$232 전고점이 저항으로 작동 중', en: 'Prior high at $232 acting as resistance' },
    color: '#f43f5e',
  },
  {
    label: { ko: '추세선', en: 'Trend' },
    comment: { ko: '저점 우상향 — 상승 추세선 유효', en: 'Higher lows intact — rising trendline confirmed' },
    color: '#7c5cff',
  },
  {
    label: { ko: '유동성 구간', en: 'Liquidity' },
    comment: { ko: '$224~232 매물대에 유동성 집중', en: 'Liquidity pocket clustered at $224–232' },
    color: '#22d3ee',
  },
  {
    label: { ko: 'Cup & Handle', en: 'Cup & Handle' },
    comment: { ko: '컵앤핸들 완성 — 돌파 시 목표가 $258', en: 'Cup & Handle complete — breakout target $258' },
    color: '#a78bfa',
  },
];

/** v2 — 스윙 셋업 톤 (돌파/눌림목 시그널) */
export const STEPS_SETUP: DrawStep[] = [
  {
    label: { ko: '눌림목 지지', en: 'Pullback support' },
    comment: { ko: '$196 눌림목에서 매수세 유입 포착', en: 'Buyers stepping in at the $196 pullback' },
    color: '#34d399',
  },
  {
    label: { ko: '돌파 라인', en: 'Breakout line' },
    comment: { ko: '$232 돌파 시 추세 가속 예상', en: 'Trend acceleration expected above $232' },
    color: '#f43f5e',
  },
  {
    label: { ko: '진입 추세', en: 'Entry trend' },
    comment: { ko: '상승 추세선 리테스트 후 진입 유효', en: 'Valid entry after rising-trendline retest' },
    color: '#7c5cff',
  },
  {
    label: { ko: '거래량 매물대', en: 'Volume node' },
    comment: { ko: '$224~232 매물대 소화 후 분출 구간', en: 'Supply at $224–232 absorbed, primed to expand' },
    color: '#22d3ee',
  },
  {
    label: { ko: 'VCP 셋업', en: 'VCP setup' },
    comment: { ko: 'VCP 변동성 수축 완료 — 손절 $219 / 목표 $258', en: 'VCP contraction done — stop $219 / target $258' },
    color: '#a78bfa',
  },
];

/** UI 문자열 */
export const STR = {
  analyzeBtn: { ko: 'AI 분석 실행', en: 'Run AI analysis' },
  analyzing: { ko: 'AI 드로잉 진행 중', en: 'AI Drawing Active' },
  drawingDone: { ko: '분석 완료', en: 'Analysis complete' },
  panelTitle: { ko: 'AI 차트 분석', en: 'AI chart analysis' },
  idleHint: { ko: '버튼을 누르면 AI가 차트 위에 분석을 그립니다', en: 'Press the button — AI draws its analysis on the chart' },
  timeframe: { ko: '4시간봉', en: '4H' },
  livePrice: { ko: '실시간', en: 'Live' },
  legendSupport: { ko: '지지', en: 'Support' },
  legendResistance: { ko: '저항', en: 'Resistance' },
  legendTrend: { ko: '추세', en: 'Trend' },
} satisfies Record<string, L>;
