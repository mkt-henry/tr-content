import type { Scenario, Step } from '../../../engine/types';
import { CARDS } from './data';
import { useRewards } from './state';

const st = () => useRewards.getState();
const card = (id: string) => CARDS.find((c) => c.id === id)!;

/** 카드 선택 → 시트 → 교환 → 성공 → 확인 */
function redeemFlow(cardId: string): Step[] {
  return [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: `card-${cardId}`, ms: 700 },
    { kind: 'click', target: `card-${cardId}`, run: () => st().openSheet(card(cardId)) },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'redeem-btn', ms: 600 },
    { kind: 'click', target: 'redeem-btn', run: () => st().redeem() },
    { kind: 'wait', ms: 1600 },
    { kind: 'cursor', target: 'redeem-success', ms: 700 },
    { kind: 'wait', ms: 1400 },
    { kind: 'click', target: 'success-cta', run: () => st().closeRedeemed() },
    { kind: 'wait', ms: 1400 },
  ];
}

/** v1 — 배움이 진짜 보상으로: Fins로 커피 기프트카드 교환 */
export const redeemScenario: Scenario = {
  id: 'findle-rewards-redeem',
  steps: redeemFlow('sbux'),
};

/** v2 — 다양한 기프트카드: 더 큰 보상으로 교환 */
export const premiumScenario: Scenario = {
  id: 'findle-rewards-premium',
  steps: redeemFlow('amzn'),
};
