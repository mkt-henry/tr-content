/** 토너먼트 출전자 한 명 (사진 대신 그라디언트+이니셜 플레이스홀더) */
export interface Contestant {
  /** 안정적인 식별자 (data-demo-id·라운드 추적용) */
  id: string;
  /** 아이돌 본명 */
  name: string;
  /** 소속 그룹 */
  group: string;
  /** 플레이스홀더 카드 그라디언트 (Tailwind from/to) */
  gradient: string;
  /** 플레이스홀더 이모지 */
  emoji: string;
  /** 결과 화면 "다른 유저들의 선택" 막대에 쓰는 사전 집계 득표율(%) */
  votePct: number;
}

/**
 * 16강 출전자 — VN 부스팅 콘텐츠 ("Nữ idol" = 여자 아이돌).
 * 데모 시나리오는 항상 같은 경로를 타도록 시드 배열(seedBracket)로 고정한다.
 */
export const CONTESTANTS: Record<string, Contestant> = {
  winter: { id: 'winter', name: 'Winter', group: 'Aespa', gradient: 'from-rose-400 to-fuchsia-500', emoji: '❄️', votePct: 38 },
  wonyoung: { id: 'wonyoung', name: 'Wonyoung', group: 'Ive', gradient: 'from-sky-400 to-indigo-500', emoji: '👑', votePct: 27 },
  karina: { id: 'karina', name: 'Karina', group: 'Aespa', gradient: 'from-violet-400 to-purple-600', emoji: '🪐', votePct: 14 },
  hanni: { id: 'hanni', name: 'Hanni', group: 'NewJeans', gradient: 'from-amber-300 to-orange-500', emoji: '🐰', votePct: 11 },
  jang: { id: 'jang', name: 'Ahyeon', group: 'Babymonster', gradient: 'from-emerald-400 to-teal-500', emoji: '🌊', votePct: 4 },
  yuna: { id: 'yuna', name: 'Yuna', group: 'Itzy', gradient: 'from-pink-400 to-rose-500', emoji: '🍒', votePct: 3 },
  minji: { id: 'minji', name: 'Minji', group: 'NewJeans', gradient: 'from-cyan-400 to-blue-500', emoji: '🦋', votePct: 2 },
  sakura: { id: 'sakura', name: 'Sakura', group: 'Le Sserafim', gradient: 'from-fuchsia-400 to-pink-500', emoji: '🌸', votePct: 1 },
};

/** 한 매치 = 출전자 두 명 */
export interface Match {
  /** 라운드 라벨 — 헤더에 그대로 노출 */
  round: string;
  a: Contestant;
  b: Contestant;
}

const c = CONTESTANTS;

/**
 * 시연용 고정 대진표. 시나리오가 매치를 순서대로 소비한다.
 * Round of 16: 4매치 → Round of 8: 2매치 → Final: 1매치 (총 7매치)
 */
export const BRACKET: Match[] = [
  { round: 'Round of 16', a: c.winter, b: c.sakura },
  { round: 'Round of 16', a: c.wonyoung, b: c.minji },
  { round: 'Round of 16', a: c.karina, b: c.yuna },
  { round: 'Round of 16', a: c.hanni, b: c.jang },
  { round: 'Round of 8', a: c.winter, b: c.wonyoung },
  { round: 'Round of 8', a: c.karina, b: c.hanni },
  { round: 'Final', a: c.winter, b: c.karina },
];

/** 시나리오가 선택할 승자 id (BRACKET과 인덱스 1:1) — 결승 우승자는 Winter */
export const WINNERS: string[] = ['winter', 'wonyoung', 'karina', 'hanni', 'winter', 'karina', 'winter'];

/** 토너먼트 질문 (VN 마켓 느낌: 베트남어 + 한국어 부제 병기) */
export const TOURNAMENT_TITLE_VI = 'Bình chọn hình mẫu lý tưởng — Nữ idol';
export const TOURNAMENT_TITLE_KO = '이상형 월드컵 — 여자 아이돌';

/** 우승 시 지급 골드 */
export const GOLD_REWARD = 20;

/** 데모 시작 시 보유 골드 (Mockup_01 우상단과 동일) */
export const INITIAL_GOLD = 8077;
