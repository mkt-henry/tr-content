import type { ComponentType } from 'react';
import { Coffee, Flame, Moon, Sun, Sunset, Target } from 'lucide-react';

/** 데일리 미션 한 건 — 매일 자정 초기화 */
export interface DailyMission {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  reward: number;
  /** 목표치 (진행도 바 분모) */
  goal: number;
}

/** 시간대 미션 한 건 — 시간대별로 잠금/오픈 */
export interface TimedMission {
  id: string;
  /** 오픈되는 시작 시각 (24h, 분 단위는 무시) */
  openHour: number;
  /** 오픈 종료 시각 */
  closeHour: number;
  /** 카드에 표시할 시간대 라벨 */
  window: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  /** 보상 범위 라벨 */
  rewardRange: string;
  /** 완료 시 지급되는 골드 (데모 연출용 고정값) */
  reward: number;
}

/** 데일리 미션 2종 (실제 미션 정책의 대표 예시) */
export const DAILY_MISSIONS: DailyMission[] = [
  { id: 'streak', title: 'Get 5 Correct Answers in a Row', icon: Flame, reward: 100, goal: 5 },
  { id: 'gold-day', title: 'Reach 500 Gold in a Day', icon: Target, reward: 200, goal: 500 },
];

/** 시간제 미션 4종 — 아침·점심·오후·저녁 */
export const TIMED_MISSIONS: TimedMission[] = [
  {
    id: 'morning',
    openHour: 9,
    closeHour: 12,
    window: '9:00 AM – 11:59 AM',
    title: 'Morning Special Quiz',
    icon: Coffee,
    rewardRange: '10~100',
    reward: 40,
  },
  {
    id: 'lunch',
    openHour: 12,
    closeHour: 15,
    window: '12:00 PM – 2:59 PM',
    title: 'Lunch Break Quiz',
    icon: Sun,
    rewardRange: '10~100',
    reward: 50,
  },
  {
    id: 'afternoon',
    openHour: 15,
    closeHour: 19,
    window: '3:00 PM – 6:59 PM',
    title: 'Afternoon Boost Quiz',
    icon: Sunset,
    rewardRange: '10~100',
    reward: 60,
  },
  {
    id: 'evening',
    openHour: 19,
    closeHour: 24,
    window: '7:00 PM – 11:59 PM',
    title: 'Evening Wrap-up Quiz',
    icon: Moon,
    rewardRange: '10~100',
    reward: 80,
  },
];

/** 리워디드 광고 길이 (실제 30초). 데모에서는 압축 카운트다운 시작값으로만 사용 */
export const AD_DURATION_SEC = 30;

/** 데모 시작 시 보유 골드 (Mission.png 기준) */
export const INITIAL_GOLD = 8077;

/** 데모 시작 시각 — 점심 미션이 곧 열리는 11:58 AM */
export const INITIAL_CLOCK_MIN = 11 * 60 + 58;
