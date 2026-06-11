import type { L } from '../_shared/i18n';

export interface Member {
  id: string;
  name: string;
  xp: number;
  streak: number;
  you?: boolean;
}

/** 사용자(Alex) 외 클래스 동료 — Alex는 state에서 합쳐 정렬 */
export const OTHERS: Member[] = [
  { id: 'maya', name: 'Maya Chen', xp: 4210, streak: 21 },
  { id: 'jordan', name: 'Jordan Lee', xp: 3890, streak: 15 },
  { id: 'sam', name: 'Sam Torres', xp: 3140, streak: 9 },
  { id: 'tara', name: 'Tara Kim', xp: 1980, streak: 6 },
  { id: 'leo', name: 'Leo Park', xp: 1620, streak: 4 },
];

export const USER = { id: 'alex', name: 'Alex Kim', xp: 2340, streak: 12 };

/** 정답 한 번당 획득 XP (시나리오가 반복 호출) */
export const STUDY_XP = 280;

export interface Badge {
  id: string;
  title: L;
  desc: L;
  emoji: string;
}

export const TOP3_BADGE: Badge = {
  id: 'top3',
  title: { ko: 'Top 3 진입!', en: 'Top 3 Club!' },
  desc: { ko: '클래스 상위 3위에 처음 올랐어요', en: 'Reached the top 3 of your class' },
  emoji: '🏅',
};

export const STR = {
  appTitle: { ko: '클래스 랭킹', en: 'Class Standings' },
  classLabel: { ko: '금융 101 · 3교시', en: 'Finance 101 · Period 3' },
  toRankUp: { ko: '{n} XP면 순위 상승', en: '{n} XP to rank up' },
  you: { ko: '나', en: 'You' },
  dayStreakShort: { ko: '일 연속', en: '-day streak' },
  studyBtn: { ko: '오늘의 퀴즈 풀기', en: 'Answer today’s quiz' },
  rankUp: { ko: '순위 상승! #{from} → #{to}', en: 'Rank up! #{from} → #{to}' },
  badgeCta: { ko: '계속하기', en: 'Continue' },
} satisfies Record<string, L>;
