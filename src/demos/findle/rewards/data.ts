import type { L } from '../_shared/i18n';

export const INITIAL_FINS = 1850;

export interface GiftCard {
  id: string;
  brand: string;
  emoji: string;
  /** 카드 배경 그라디언트 (from→to) */
  from: string;
  to: string;
  fins: number;
  value: L; // 상품권 액면
}

export const CARDS: GiftCard[] = [
  { id: 'sbux', brand: 'Starbucks', emoji: '☕', from: '#0b6b3a', to: '#1f9d63', fins: 500, value: { ko: '₩5,000 상품권', en: '$5 gift card' } },
  { id: 'cgv', brand: 'Movie Ticket', emoji: '🎬', from: '#7c2d12', to: '#ea580c', fins: 800, value: { ko: '영화 1편', en: '1 movie ticket' } },
  { id: 'amzn', brand: 'Amazon', emoji: '📦', from: '#1f2937', to: '#f59e0b', fins: 1200, value: { ko: '₩12,000 상품권', en: '$10 gift card' } },
  { id: 'nflx', brand: 'Netflix', emoji: '🍿', from: '#7f1d1d', to: '#dc2626', fins: 1500, value: { ko: '1개월 이용권', en: '1-month pass' } },
];

export const STR = {
  appTitle: { ko: '리워드', en: 'Rewards' },
  subtitle: { ko: '모은 Fins를 진짜 기프트카드로', en: 'Turn your Fins into real gift cards' },
  balance: { ko: '보유 Fins', en: 'Your Fins' },
  redeemFor: { ko: '{n} Fins로 교환', en: 'Redeem for {n} Fins' },
  notEnough: { ko: 'Fins 부족', en: 'Not enough Fins' },
  detailRedeem: { ko: '교환하기', en: 'Redeem' },
  successTitle: { ko: '교환 완료!', en: 'Redeemed!' },
  successBody: { ko: '{brand} 기프트카드가 보관함에 추가됐어요', en: '{brand} gift card added to your wallet' },
  successCta: { ko: '확인', en: 'Done' },
  remaining: { ko: '잔여 {n} Fins', en: '{n} Fins left' },
  learnToReward: { ko: '배움이 진짜 보상으로', en: 'Learning becomes real rewards' },
} satisfies Record<string, L>;
