import type { L, Lang } from '../_shared/i18n';

/** 대회(Meridian Academy) 리스크 리밋 — 실제 페이지 값 그대로(%) */
export const LIMITS = { net: 20, gross: 200, single: 10 } as const;

/** 페어의 한 다리(롱 또는 숏) 종목 */
export interface Leg {
  name: L;
  ticker: string;
}

/** AI가 제안하는 롱/숏 페어 한 세트 */
export interface PairSeed {
  id: string;
  long: Leg;
  /** 롱 비중 (%) */
  longW: number;
  short: Leg;
  /** 숏 비중 (%) */
  shortW: number;
  /** 기대 스프레드(롱−숏, %p) — Sharpe 추정 근거 */
  edge: number;
  thesis: L;
}

const leg = (ko: string, en: string, ticker: string): Leg => ({ name: { ko, en }, ticker });

/** 섹터별 AI 페어 제안 풀 (더미) */
export const SECTOR_SETS: Record<string, PairSeed[]> = {
  semi: [
    {
      id: 'semi-0',
      long: leg('SK하이닉스', 'SK hynix', '000660'),
      longW: 10,
      short: leg('DB하이텍', 'DB HiTek', '000990'),
      shortW: 4,
      edge: 6.5,
      thesis: { ko: 'HBM 사이클 수혜 롱 · 레거시 파운드리 부진 숏', en: 'Long HBM cycle · short lagging legacy foundry' },
    },
    {
      id: 'semi-1',
      long: leg('한미반도체', 'Hanmi Semicon.', '042700'),
      longW: 9,
      short: leg('리노공업', 'LEENO Ind.', '058470'),
      shortW: 5,
      edge: 5.2,
      thesis: { ko: 'TC본더 수주 확대 롱 · 밸류에이션 부담 숏', en: 'Long TC-bonder order growth · short stretched valuation' },
    },
    {
      id: 'semi-2',
      long: leg('엔비디아', 'NVIDIA', 'NVDA'),
      longW: 10,
      short: leg('AMD', 'AMD', 'AMD'),
      shortW: 6,
      edge: 7.1,
      thesis: { ko: 'AI 가속기 점유율 롱 · 신제품 지연 숏', en: 'Long accelerator share · short delayed launch' },
    },
  ],
  battery: [
    {
      id: 'battery-0',
      long: leg('에코프로비엠', 'EcoPro BM', '247540'),
      longW: 9,
      short: leg('엘앤에프', 'L&F', '066970'),
      shortW: 8,
      edge: 5.8,
      thesis: { ko: '양극재 출하 회복 롱 · 고객 집중 리스크 숏', en: 'Long cathode shipment recovery · short customer concentration' },
    },
    {
      id: 'battery-1',
      long: leg('LG에너지솔루션', 'LG Energy', '373220'),
      longW: 8,
      short: leg('삼성SDI', 'Samsung SDI', '006400'),
      shortW: 9,
      edge: 6.2,
      thesis: { ko: '북미 IRA 수혜 롱 · 각형 수요 둔화 숏', en: 'Long US IRA tailwind · short prismatic demand slowdown' },
    },
  ],
  platform: [
    {
      id: 'platform-0',
      long: leg('팔란티어', 'Palantir', 'PLTR'),
      longW: 9,
      short: leg('C3.ai', 'C3.ai', 'AI'),
      shortW: 7,
      edge: 7.4,
      thesis: { ko: 'AIP 매출 가속 롱 · 적자 지속 숏', en: 'Long AIP revenue accel. · short persistent losses' },
    },
    {
      id: 'platform-1',
      long: leg('NAVER', 'NAVER', '035420'),
      longW: 8,
      short: leg('카카오', 'Kakao', '035720'),
      shortW: 8,
      edge: 4.9,
      thesis: { ko: '커머스·광고 반등 롱 · 신사업 부진 숏', en: 'Long commerce/ad rebound · short weak new bets' },
    },
  ],
  bio: [
    {
      id: 'bio-0',
      long: leg('알테오젠', 'Alteogen', '196170'),
      longW: 8,
      short: leg('셀트리온', 'Celltrion', '068270'),
      shortW: 8,
      edge: 6.6,
      thesis: { ko: 'ADC 기술수출 롱 · 바이오시밀러 경쟁 숏', en: 'Long ADC licensing · short biosimilar competition' },
    },
    {
      id: 'bio-1',
      long: leg('유한양행', 'Yuhan', '000100'),
      longW: 9,
      short: leg('한미약품', 'Hanmi Pharm', '128940'),
      shortW: 7,
      edge: 5.1,
      thesis: { ko: '렉라자 로열티 롱 · 파이프라인 공백 숏', en: 'Long Leclaza royalty · short pipeline gap' },
    },
  ],
};

/** 좌측 섹터 레인 목록 */
export const SECTORS: { id: string; label: L }[] = [
  { id: 'semi', label: { ko: '반도체', en: 'Semiconductor' } },
  { id: 'battery', label: { ko: '2차전지', en: 'Battery' } },
  { id: 'platform', label: { ko: '플랫폼·AI', en: 'Platform · AI' } },
  { id: 'bio', label: { ko: '바이오', en: 'Biotech' } },
];

export interface Exposure {
  /** 순노출 = 롱합 − 숏합 */
  net: number;
  /** 총노출 = 롱합 + 숏합 */
  gross: number;
  /** 단일종목 최대 비중 */
  maxSingle: number;
  /** 예상 위험조정수익(Sharpe, 더미) */
  sharpe: number;
}

/** 페어 북의 노출/Sharpe를 계산한다 (더미 공식) */
export function computeExposure(pairs: PairSeed[]): Exposure {
  const longSum = pairs.reduce((a, p) => a + p.longW, 0);
  const shortSum = pairs.reduce((a, p) => a + p.shortW, 0);
  const net = longSum - shortSum;
  const gross = longSum + shortSum;
  const legs = pairs.flatMap((p) => [p.longW, p.shortW]);
  const maxSingle = legs.length ? Math.max(...legs) : 0;
  const avgEdge = pairs.length ? pairs.reduce((a, p) => a + p.edge, 0) / pairs.length : 0;
  // 균형이 맞을수록(net→0) 위험조정수익이 개선되는 구조
  const sharpe = Math.max(0.3, 1.15 + avgEdge / 10 - Math.abs(net) / 35);
  return { net, gross, maxSingle, sharpe };
}

/** 리밋 위반 여부 */
export function isBreach(e: Exposure): boolean {
  return Math.abs(e.net) > LIMITS.net || e.gross > LIMITS.gross || e.maxSingle > LIMITS.single;
}

/** UI 문자열 */
export const STR = {
  pageTitle: { ko: '롱/숏 페어 빌더', en: 'Long/Short Pair Builder' },
  search: { ko: '페어·섹터·리스크 검색', en: 'Search pairs, sectors, risk' },
  sectorRow: { ko: '섹터', en: 'Sector' },
  emptyTitle: { ko: '섹터를 선택하세요', en: 'Select a sector' },
  emptyHint: {
    ko: '섹터를 누르면 AI가 롱·숏 페어와 노출 밸런스를 제안합니다.',
    en: 'Pick a sector — AI proposes long/short pairs and balances the exposure.',
  },
  bookTitle: { ko: 'AI 페어 제안', en: 'AI pair proposals' },
  autoBalance: { ko: '노출 자동 밸런싱', en: 'Auto-balance exposure' },
  longLabel: { ko: '롱', en: 'LONG' },
  shortLabel: { ko: '숏', en: 'SHORT' },
  edgeLabel: { ko: '기대 스프레드', en: 'Expected spread' },
  riskTitle: { ko: '리스크 리밋', en: 'Risk limits' },
  riskSub: { ko: 'Meridian Academy 기준', en: 'Meridian Academy ruleset' },
  netLabel: { ko: '순노출 (Net)', en: 'Net exposure' },
  grossLabel: { ko: '총노출 (Gross)', en: 'Gross exposure' },
  singleLabel: { ko: '단일종목 최대', en: 'Max single name' },
  netShort: { ko: '순노출', en: 'Net' },
  singleShort: { ko: '단일종목', en: 'Single' },
  sharpeShort: { ko: 'Sharpe', en: 'Sharpe' },
  sharpeLabel: { ko: '예상 Sharpe', en: 'Est. Sharpe' },
  sharpeSub: { ko: '위험조정수익', en: 'Risk-adjusted return' },
  limitTag: { ko: '한도', en: 'Limit' },
  roomTag: { ko: '여유', en: 'Room' },
  breachTag: { ko: '초과', en: 'Breach' },
  neutralTag: { ko: '중립', en: 'Neutral' },
} satisfies Record<string, L>;

/** 순노출 부호 표기 (+14% / −6%) */
export function fmtSigned(v: number): string {
  const r = Math.round(v);
  return `${r >= 0 ? '+' : '−'}${Math.abs(r)}%`;
}

/** 대회 컨텍스트 배지 문구 */
export const CONTEXT: L = {
  ko: 'Meridian Academy · 롱/숏 · 3개월 추적',
  en: 'Meridian Academy · L/S · 3-month track',
};

export type { Lang };
