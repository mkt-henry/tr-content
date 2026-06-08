import type { ComponentType } from 'react';
import { Coffee, Flame, Moon, Sun, Sunset, Target } from 'lucide-react';
import type { L } from '../_shared/i18n';

/** 데일리 미션 한 건 — 매일 자정 초기화 */
export interface DailyMission {
  id: string;
  title: L;
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
  /** 카드에 표시할 시간대 라벨 (언어 공통) */
  window: string;
  title: L;
  icon: ComponentType<{ className?: string }>;
  /** 보상 범위 라벨 */
  rewardRange: string;
  /** 완료 시 지급되는 골드 (데모 연출용 고정값) */
  reward: number;
}

/** 데일리 미션 2종 (실제 미션 정책의 대표 예시) */
export const DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'streak',
    title: {
      en: 'Get 5 Correct Answers in a Row',
      ja: '5問連続で正解する',
      vi: 'Trả lời đúng 5 câu liên tiếp',
      th: 'ตอบถูก 5 ข้อติดต่อกัน',
    },
    icon: Flame,
    reward: 100,
    goal: 5,
  },
  {
    id: 'gold-day',
    title: {
      en: 'Reach 500 Gold in a Day',
      ja: '1日で500ゴールド貯める',
      vi: 'Đạt 500 vàng trong một ngày',
      th: 'สะสมทองให้ถึง 500 ภายในวันเดียว',
    },
    icon: Target,
    reward: 200,
    goal: 500,
  },
];

/** 시간제 미션 4종 — 아침·점심·오후·저녁 */
export const TIMED_MISSIONS: TimedMission[] = [
  {
    id: 'morning',
    openHour: 9,
    closeHour: 12,
    window: '9:00 AM – 11:59 AM',
    title: {
      en: 'Morning Special Quiz',
      ja: 'モーニングスペシャルクイズ',
      vi: 'Quiz đặc biệt buổi sáng',
      th: 'ควิซพิเศษยามเช้า',
    },
    icon: Coffee,
    rewardRange: '10~100',
    reward: 40,
  },
  {
    id: 'lunch',
    openHour: 12,
    closeHour: 15,
    window: '12:00 PM – 2:59 PM',
    title: {
      en: 'Lunch Break Quiz',
      ja: 'ランチタイムクイズ',
      vi: 'Quiz giờ nghỉ trưa',
      th: 'ควิซช่วงพักเที่ยง',
    },
    icon: Sun,
    rewardRange: '10~100',
    reward: 50,
  },
  {
    id: 'afternoon',
    openHour: 15,
    closeHour: 19,
    window: '3:00 PM – 6:59 PM',
    title: {
      en: 'Afternoon Boost Quiz',
      ja: 'アフタヌーンブーストクイズ',
      vi: 'Quiz tăng tốc buổi chiều',
      th: 'ควิซเพิ่มพลังยามบ่าย',
    },
    icon: Sunset,
    rewardRange: '10~100',
    reward: 60,
  },
  {
    id: 'evening',
    openHour: 19,
    closeHour: 24,
    window: '7:00 PM – 11:59 PM',
    title: {
      en: 'Evening Wrap-up Quiz',
      ja: 'イブニングまとめクイズ',
      vi: 'Quiz tổng kết buổi tối',
      th: 'ควิซสรุปยามค่ำ',
    },
    icon: Moon,
    rewardRange: '10~100',
    reward: 80,
  },
];

/** 앱 UI 문자열 — '{n}' 플레이스홀더는 fmt()로 치환 */
export const STR = {
  missionTitle: { en: 'Mission', ja: 'ミッション', vi: 'Nhiệm vụ', th: 'ภารกิจ' },
  dailyMission: {
    en: 'Daily Mission',
    ja: 'デイリーミッション',
    vi: 'Nhiệm vụ hằng ngày',
    th: 'ภารกิจประจำวัน',
  },
  timedMission: {
    en: 'Timed Mission',
    ja: '時間限定ミッション',
    vi: 'Nhiệm vụ theo giờ',
    th: 'ภารกิจตามเวลา',
  },
  unitDesc: {
    en: 'Complete 1 unit · 5 questions',
    ja: '1ユニット完了 · 5問',
    vi: 'Hoàn thành 1 phần · 5 câu hỏi',
    th: 'ทำให้ครบ 1 ชุด · 5 ข้อ',
  },
  opensSoon: { en: 'Opens Soon', ja: 'まもなく開放', vi: 'Sắp mở', th: 'เปิดเร็ว ๆ นี้' },
  openStartNow: {
    en: 'OPEN · Start Now',
    ja: 'OPEN · 今すぐ開始',
    vi: 'MỞ · Bắt đầu ngay',
    th: 'เปิดแล้ว · เริ่มเลย',
  },
  inProgress: {
    en: 'In Progress',
    ja: '進行中',
    vi: 'Đang thực hiện',
    th: 'กำลังดำเนินการ',
  },
  claimReward: {
    en: 'Claim Reward',
    ja: '報酬を受け取る',
    vi: 'Nhận thưởng',
    th: 'รับรางวัล',
  },
  claimed: { en: 'Claimed', ja: '受取済み', vi: 'Đã nhận', th: 'รับแล้ว' },
  completed: { en: 'Completed', ja: '完了', vi: 'Hoàn thành', th: 'เสร็จสิ้น' },
  rewardedAd: {
    en: 'Rewarded Ad',
    ja: 'リワード広告',
    vi: 'Quảng cáo có thưởng',
    th: 'โฆษณารับรางวัล',
  },
  sponsoredVideo: {
    en: 'Sponsored Video',
    ja: 'スポンサー動画',
    vi: 'Video tài trợ',
    th: 'วิดีโอผู้สนับสนุน',
  },
  watchToEarn: {
    en: 'Watch to earn your reward',
    ja: '視聴して報酬を獲得',
    vi: 'Xem để nhận phần thưởng',
    th: 'รับชมเพื่อรับรางวัลของคุณ',
  },
  plusGold: { en: '+{n} Gold', ja: '+{n} ゴールド', vi: '+{n} Vàng', th: '+{n} ทอง' },
} satisfies Record<string, L>;

/** 리워디드 광고 길이 (실제 30초). 데모에서는 압축 카운트다운 시작값으로만 사용 */
export const AD_DURATION_SEC = 30;

/** 데모 시작 시 보유 골드 (Mission.png 기준) */
export const INITIAL_GOLD = 8077;

/** 데모 시작 시각 — 점심 미션이 곧 열리는 11:58 AM */
export const INITIAL_CLOCK_MIN = 11 * 60 + 58;
