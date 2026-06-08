import type { L } from '../_shared/i18n';

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

/** 라운드 식별자 — 언어 무관 id (그룹핑/필터용). 표시는 ROUND_LABEL로 매핑 */
export type RoundId = 'r16' | 'r8' | 'final';

/** 한 매치 = 출전자 두 명 */
export interface Match {
  /** 라운드 id — 그룹핑/필터에 사용, 표시는 ROUND_LABEL로 변환 */
  round: RoundId;
  a: Contestant;
  b: Contestant;
}

const c = CONTESTANTS;

/**
 * 시연용 고정 대진표. 시나리오가 매치를 순서대로 소비한다.
 * Round of 16: 4매치 → Round of 8: 2매치 → Final: 1매치 (총 7매치)
 */
export const BRACKET: Match[] = [
  { round: 'r16', a: c.winter, b: c.sakura },
  { round: 'r16', a: c.wonyoung, b: c.minji },
  { round: 'r16', a: c.karina, b: c.yuna },
  { round: 'r16', a: c.hanni, b: c.jang },
  { round: 'r8', a: c.winter, b: c.wonyoung },
  { round: 'r8', a: c.karina, b: c.hanni },
  { round: 'final', a: c.winter, b: c.karina },
];

/** 시나리오가 선택할 승자 id (BRACKET과 인덱스 1:1) — 결승 우승자는 Winter */
export const WINNERS: string[] = ['winter', 'wonyoung', 'karina', 'hanni', 'winter', 'karina', 'winter'];

/** 라운드 id → 언어별 표시 라벨 (영어는 'Round of 16' 등 원문 유지) */
export const ROUND_LABEL: Record<RoundId, L> = {
  r16: { en: 'Round of 16', ja: 'ベスト16', vi: 'Vòng 16', th: 'รอบ 16 คน' },
  r8: { en: 'Round of 8', ja: 'ベスト8', vi: 'Vòng 8', th: 'รอบ 8 คน' },
  final: { en: 'Final', ja: '決勝', vi: 'Chung kết', th: 'รอบชิงฯ' },
};

/** 앱 UI 문자열 — '{n}' 플레이스홀더는 fmt()로 치환 */
export const STR = {
  /** 토너먼트 메인 타이틀 */
  tournamentTitle: {
    en: 'Vote for Your Ideal Female Idol',
    ja: '理想の女性アイドル投票',
    vi: 'Bình chọn hình mẫu lý tưởng — Nữ idol',
    th: 'โหวตไอดอลหญิงในอุดมคติของคุณ',
  },
  /** 보조 설명 (이전 한국어 부제 자리) */
  tournamentSubtitle: {
    en: 'Pick your favorite in each matchup',
    ja: '対戦ごとに推しを選ぼう',
    vi: 'Chọn người bạn thích nhất ở mỗi cặp đấu',
    th: 'เลือกคนที่คุณชอบในแต่ละคู่',
  },
  /** 토너먼트 헤더 (영어 고유명 유지) */
  header: { en: 'Favorite Pick Tournament', ja: 'Favorite Pick Tournament', vi: 'Favorite Pick Tournament', th: 'Favorite Pick Tournament' },
  /** 하단 안내 문구 */
  tapHint: {
    en: 'Tap the one you like — finishing the tournament checks you in.',
    ja: '好きな方をタップ — トーナメントを終えると自動で出席チェック。',
    vi: 'Chạm vào người bạn thích — hoàn thành giải đấu sẽ tự động điểm danh.',
    th: 'แตะคนที่คุณชอบ — เมื่อจบทัวร์นาเมนต์จะเช็คอินให้อัตโนมัติ',
  },
  /** 결과 화면 헤더 */
  result: { en: 'Result', ja: '結果', vi: 'Kết quả', th: 'ผลลัพธ์' },
  /** 우승 메시지 */
  championMsg: {
    en: 'Your Pick is the Champion!',
    ja: 'あなたの推しが優勝！',
    vi: 'Lựa chọn của bạn là nhà vô địch!',
    th: 'ตัวเลือกของคุณคือแชมป์!',
  },
  /** 골드 보상 — {n} 골드 */
  goldEarned: {
    en: '+{n} Gold earned',
    ja: '+{n} ゴールド獲得',
    vi: 'Nhận +{n} Gold',
    th: 'ได้รับ +{n} Gold',
  },
  /** "다른 유저들의 선택" 통계 섹션 제목 */
  othersPicks: {
    en: "Everyone's Picks",
    ja: 'みんなの選択',
    vi: 'Lựa chọn của mọi người',
    th: 'ตัวเลือกของทุกคน',
  },
  /** 결과 화면 헤더 (Champion 라벨, Desktop 라이브 스탯 공용) */
  champion: { en: 'Champion', ja: 'チャンピオン', vi: 'Nhà vô địch', th: 'แชมป์' },
} satisfies Record<string, L>;

/** 우승 시 지급 골드 */
export const GOLD_REWARD = 20;

/** 데모 시작 시 보유 골드 (Mockup_01 우상단과 동일) */
export const INITIAL_GOLD = 8077;
