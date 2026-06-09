import type { L, Lang } from '../_shared/i18n';

/** 스크리너 결과 한 행 */
export interface ScreenRow {
  /** 종목명 — 한/영 */
  name: L;
  ticker: string;
  /** 전략 적합도 점수 0~100 */
  score: number;
  /** 등락률 % (±) */
  changePct: number;
  /** 거래대금 (억원) */
  turnover: number;
  /** 시가총액 (조원) */
  mktCap: number;
}

/** 전략 한 개의 메타 */
export interface Strategy {
  id: string;
  /** 전략명 — 국제 통용 영문 그대로 (양 언어 공통) */
  name: string;
  /** 전략 한 줄 부제 — 한/영 */
  sub: L;
  rows: ScreenRow[];
}

// 종목 풀 (행 정의 재사용용 헬퍼)
const r = (name: L, ticker: string, score: number, changePct: number, turnover: number, mktCap: number): ScreenRow => ({
  name,
  ticker,
  score,
  changePct,
  turnover,
  mktCap,
});

// 자주 등장하는 종목 사전
const samsung = (s: number, c: number, t: number) => r({ ko: '삼성전자', en: 'Samsung Elec.' }, '005930', s, c, t, 421.3);
const hynix = (s: number, c: number, t: number) => r({ ko: 'SK하이닉스', en: 'SK hynix' }, '000660', s, c, t, 142.7);
const ecopro = (s: number, c: number, t: number) => r({ ko: '에코프로', en: 'EcoPro' }, '086520', s, c, t, 13.4);
const hanmi = (s: number, c: number, t: number) => r({ ko: '한미반도체', en: 'Hanmi Semicon.' }, '042700', s, c, t, 11.2);
const alteogen = (s: number, c: number, t: number) => r({ ko: '알테오젠', en: 'Alteogen' }, '196170', s, c, t, 18.9);
const nvidia = (s: number, c: number, t: number) => r({ ko: '엔비디아', en: 'NVIDIA' }, 'NVDA', s, c, t, 4210.0);
const palantir = (s: number, c: number, t: number) => r({ ko: '팔란티어', en: 'Palantir' }, 'PLTR', s, c, t, 168.5);
const tesla = (s: number, c: number, t: number) => r({ ko: '테슬라', en: 'Tesla' }, 'TSLA', s, c, t, 1080.0);
const posco = (s: number, c: number, t: number) => r({ ko: 'POSCO홀딩스', en: 'POSCO Holdings' }, '005490', s, c, t, 28.6);
const kakao = (s: number, c: number, t: number) => r({ ko: '카카오', en: 'Kakao' }, '035720', s, c, t, 17.8);
const naver = (s: number, c: number, t: number) => r({ ko: 'NAVER', en: 'NAVER' }, '035420', s, c, t, 31.5);
const celltrion = (s: number, c: number, t: number) => r({ ko: '셀트리온', en: 'Celltrion' }, '068270', s, c, t, 40.2);
const amd = (s: number, c: number, t: number) => r({ ko: 'AMD', en: 'AMD' }, 'AMD', s, c, t, 285.0);
const meta = (s: number, c: number, t: number) => r({ ko: '메타', en: 'Meta' }, 'META', s, c, t, 1520.0);
const ljc = (s: number, c: number, t: number) => r({ ko: '리노공업', en: 'LEENO Ind.' }, '058470', s, c, t, 4.6);
const dbhitek = (s: number, c: number, t: number) => r({ ko: 'DB하이텍', en: 'DB HiTek' }, '000990', s, c, t, 2.1);
const hmm = (s: number, c: number, t: number) => r({ ko: 'HMM', en: 'HMM' }, '011200', s, c, t, 16.4);
const krafton = (s: number, c: number, t: number) => r({ ko: '크래프톤', en: 'KRAFTON' }, '259960', s, c, t, 14.7);

export const STRATEGIES: Strategy[] = [
  {
    id: 'canslim',
    name: 'CANSLIM',
    sub: { ko: '실적·주도주 성장 모멘텀', en: 'Earnings-led growth leaders' },
    rows: [
      hynix(94, 3.8, 8420),
      nvidia(92, 2.4, 11250),
      alteogen(90, 5.1, 1380),
      palantir(88, 4.2, 6210),
      hanmi(86, 6.3, 2240),
      celltrion(83, 1.9, 980),
      naver(80, 2.1, 1640),
      meta(78, 1.2, 5320),
      ecopro(75, 3.0, 1120),
      krafton(72, 2.6, 870),
    ],
  },
  {
    id: 'vcp',
    name: 'VCP',
    sub: { ko: '변동성 수축 후 돌파 직전', en: 'Volatility contraction breakout' },
    rows: [
      ljc(95, 2.2, 640),
      hanmi(91, 4.9, 2240),
      alteogen(89, 3.4, 1380),
      dbhitek(86, 5.7, 410),
      hynix(84, 1.8, 8420),
      amd(82, 2.9, 4180),
      ecopro(79, 4.1, 1120),
      posco(76, 1.4, 760),
      celltrion(73, 0.9, 980),
      kakao(70, 2.0, 540),
      naver(68, 1.1, 1640),
      krafton(66, 1.7, 870),
    ],
  },
  {
    id: 'pead',
    name: 'PEAD',
    sub: { ko: '어닝 서프라이즈 후 드리프트', en: 'Post-earnings drift' },
    rows: [
      nvidia(96, 3.1, 11250),
      palantir(93, 5.8, 6210),
      hynix(90, 2.7, 8420),
      meta(87, 2.0, 5320),
      alteogen(84, 4.4, 1380),
      celltrion(81, 2.3, 980),
      amd(78, 1.6, 4180),
      samsung(74, 1.0, 9870),
    ],
  },
  {
    id: 'regime',
    name: 'Regime',
    sub: { ko: '국면 전환 추세 정렬 종목', en: 'Regime-aligned trend' },
    rows: [
      samsung(89, 1.7, 9870),
      hynix(87, 2.1, 8420),
      posco(84, 3.2, 760),
      hmm(82, 4.0, 1240),
      naver(79, 1.3, 1640),
      kakao(76, 2.5, 540),
      meta(73, 0.8, 5320),
      tesla(70, 2.9, 7640),
      amd(67, 1.5, 4180),
    ],
  },
  {
    id: 'surge',
    name: 'Surge',
    sub: { ko: '실시간 거래대금 급증 포착', en: 'Real-time turnover surge' },
    rows: [
      hanmi(97, 9.2, 5210),
      ecopro(94, 11.4, 3180),
      dbhitek(92, 8.6, 1240),
      palantir(90, 7.8, 8420),
      alteogen(88, 6.9, 2140),
      tesla(85, 5.4, 9210),
      hmm(83, 7.1, 1980),
      ljc(80, 6.2, 940),
      krafton(77, 5.0, 1120),
      kakao(74, 4.6, 860),
    ],
  },
  {
    id: 'angle',
    name: 'Angle',
    sub: { ko: '이평선 기울기 우상향 가속', en: 'Moving-average angle accel.' },
    rows: [
      nvidia(93, 2.6, 11250),
      hynix(91, 2.0, 8420),
      ljc(88, 3.3, 640),
      alteogen(86, 4.0, 1380),
      hanmi(84, 5.5, 2240),
      meta(81, 1.1, 5320),
      celltrion(78, 1.8, 980),
      posco(75, 2.4, 760),
      amd(72, 1.9, 4180),
      naver(69, 1.4, 1640),
      krafton(66, 2.2, 870),
    ],
  },
];

export function getStrategy(id: string | null): Strategy | undefined {
  if (!id) return undefined;
  return STRATEGIES.find((s) => s.id === id);
}

/** 좌측 필터 사이드바 장식용 시장 목록 */
export const MARKETS: { id: string; label: string; checked: boolean }[] = [
  { id: 'kospi', label: 'KOSPI', checked: true },
  { id: 'kosdaq', label: 'KOSDAQ', checked: true },
  { id: 'nyse', label: 'NYSE', checked: true },
  { id: 'nasdaq', label: 'NASDAQ', checked: false },
];

/** 좌측 필터 사이드바 장식용 섹터 목록 */
export const SECTORS: { id: string; label: L; checked: boolean }[] = [
  { id: 'semi', label: { ko: '반도체', en: 'Semiconductor' }, checked: true },
  { id: 'bio', label: { ko: '바이오', en: 'Biotech' }, checked: true },
  { id: 'battery', label: { ko: '2차전지', en: 'Battery' }, checked: false },
  { id: 'platform', label: { ko: '플랫폼', en: 'Platform' }, checked: false },
  { id: 'ai', label: { ko: 'AI/SW', en: 'AI / Software' }, checked: true },
];

/** 스크리너 UI 문자열 */
export const STR = {
  search: { ko: '종목·전략·테마 검색', en: 'Search tickers, strategies, themes' },
  pageTitle: { ko: '전략 스크리너', en: 'Strategy Screener' },
  pageSubtitle: { ko: '검증된 6가지 전략으로 조건에 맞는 종목을 즉시 선별', en: 'Instantly screen stocks with 6 proven strategies' },
  filterTitle: { ko: '필터', en: 'Filters' },
  marketLabel: { ko: '시장', en: 'Market' },
  sectorLabel: { ko: '섹터', en: 'Sector' },
  strategyRow: { ko: '전략', en: 'Strategy' },
  // 빈 상태
  emptyTitle: { ko: '전략을 선택하세요', en: 'Select a strategy' },
  emptyHint: { ko: '상단 전략 칩을 누르면 조건에 맞는 종목이 즉시 채워집니다.', en: 'Tap a strategy chip above to instantly populate matching stocks.' },
  // 테이블 컬럼
  colRank: { ko: '순위', en: 'Rank' },
  colName: { ko: '종목', en: 'Stock' },
  colScore: { ko: '점수', en: 'Score' },
  colChange: { ko: '등락률', en: 'Change' },
  colTurnover: { ko: '거래대금', en: 'Turnover' },
  colMktCap: { ko: '시가총액', en: 'Market cap' },
} satisfies Record<string, L>;

/** 'N개 종목 검색됨' 헤더 — CountUp과 함께 라벨만 반환 */
export function resultLabel(lang: Lang): { pre: string; post: string } {
  return lang === 'ko' ? { pre: '', post: '개 종목 검색됨' } : { pre: '', post: ' stocks matched' };
}

/** 거래대금 표기 (억원) */
export function fmtTurnover(v: number, lang: Lang): string {
  return lang === 'ko' ? `${v.toLocaleString()}억` : `₩${v.toLocaleString()} ×100M`;
}

/** 시가총액 표기 (조원) */
export function fmtMktCap(v: number, lang: Lang): string {
  return lang === 'ko' ? `${v.toLocaleString()}조` : `₩${v.toLocaleString()}T`;
}
