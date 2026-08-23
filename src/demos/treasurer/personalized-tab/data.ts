/** 맞춤 탭 데모 더미 데이터 — 트레져러 앱 개인화 탭 구성 시안 기준 */

export type SegmentId = 'commodity' | 'apptech' | 'briefing';

export interface Segment {
  id: SegmentId;
  label: string;
  /** 세그먼트 판별 근거 — 행동 데이터 자동 판별 (온보딩 설문 없음) */
  basis: string;
}

export const SEGMENTS: Segment[] = [
  { id: 'commodity', label: '원자재 투자자', basis: '최근 14일 · 시세 조회 12회, 매수 2회' },
  { id: 'apptech', label: '앱테크 유저', basis: '최근 14일 · 출석 11일, 퀴즈 26회' },
  { id: 'briefing', label: '시세·뉴스 관심층', basis: '최근 14일 · 브리핑 9회 열람' },
];

/* ---------------- 원자재 투자자 ---------------- */

export const PORTFOLIO = {
  total: '102,057',
  pnl: '-15,089 (-12.88%)',
  avgPrice: '24K 금 평단 228,335원',
  recover: '회복까지 +14.9%',
};

export const GOLD_QUOTE = { name: '금 Au', price: '198,686', unit: '원/g', change: '+3.17%' };

/** 시세 스파크라인 (viewBox 300×64) */
export const GOLD_SPARK = '0,52 25,48 50,50 75,38 100,42 125,26 150,30 175,18 200,22 225,14 250,17 275,8 300,6';

export const QUICK_BUY = ['1만원', '5만원', '10만원'];

export const METAL_GRID = [
  { name: '은', price: '3,004', change: '+6.05%' },
  { name: '백금', price: '82,031', change: '+4.60%' },
  { name: '구리', price: '20', change: '+1.01%' },
];

/* ---------------- 앱테크 유저 ---------------- */

export const POINT_TODAY = { amount: '4,584', done: 3, total: 6, percent: 50 };

export const POINT_CHIPS = ['퀴즈 2개', '미션 1개', '광고 3개'];

/** 출석체크 7일 — state: 완료 / 오늘 / 예정 */
export const ATTENDANCE = [
  { day: '1일', mark: '✓', state: 'done' as const },
  { day: '2일', mark: 'x2', state: 'done' as const },
  { day: '3일', mark: '✓', state: 'done' as const },
  { day: '4일', mark: '✓', state: 'done' as const },
  { day: '5일', mark: 'x2', state: 'today' as const },
  { day: '6일', mark: '·', state: 'todo' as const },
  { day: '7일', mark: '1,000', state: 'bonus' as const },
];

export const QUIZZES = [
  { title: '빛이 나는 블핑 제니 퀴즈', reward: '1P' },
  { title: '여기서 깜짝 QUIZ! (간단 사자성어)', reward: '1P' },
];

export const FREE_POINTS = [
  { title: '알바천국 최초 회원가입', reward: '420P' },
  { title: 'GS25 유튜브 구독', reward: '84P' },
];

export const GOLD_PIECE = { amount: '0.51', remain: '1g까지 0.49g', percent: 51 };

/* ---------------- 시세·뉴스 관심층 ---------------- */

export const BRIEFING = {
  time: '오늘 · 오전 9:08',
  headlineLead: '안전자산 쏠림과 기술주 ',
  headlineAccent: '급락',
  headlineTail: ', 헬스케어 방어주 부각',
};

export const INDICATORS = [
  { label: 'USD/KRW', value: '1,388', change: '▼ 1.8%', up: false },
  { label: 'WTI', value: '$85.7', change: '▲ 0.4%', up: true },
  { label: 'GOLD', value: '$4,519', change: '▲ 4.2%', up: true },
  { label: 'S&P 500', value: '7,708', change: '▲ 0.2%', up: true },
];

export const MOVED_ASSETS = [
  { name: '금 Au', change: '+3.17%', primary: true },
  { name: '은 Ag', change: '+6.05%', primary: false },
];

export const WATCHLIST = [
  { name: '금 Au', price: '198,686', change: '+3.17%', up: true },
  { name: '백금 Pt', price: '82,031', change: '+4.60%', up: true },
  { name: '주석 Sn', price: '44,120', change: '-1.67%', up: false },
];

export const NEXT_BRIEFINGS = [
  { title: '헬스케어 방어주 자금 유입 3주 연속', read: '2분' },
  { title: '구리 재고 급감, 산업금속 수급 점검', read: '3분' },
];
