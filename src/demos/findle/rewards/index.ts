import { Gift } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { FINDLE_BG, FINDLE_GREEN } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useRewards } from './state';
import { redeemScenario, premiumScenario } from './scenario';

const rewards: FeatureDefinition = {
  id: 'findle-rewards',
  title: '리워드 교환 (Fins → eGift)',
  description: '학습으로 모은 Fins를 실제 기프트카드로 교환하는 보상 루프입니다.',
  icon: Gift,
  accent: FINDLE_GREEN,
  Desktop,
  Mobile,
  resetState: () => useRewards.getState().reset(),
  variants: [
    {
      id: 'redeem',
      label: '배움이 진짜 보상으로',
      version: 'v1',
      sellingPoint: 'Fins → 기프트카드',
      url: 'findle.io/rewards',
      background: FINDLE_BG,
      scenario: redeemScenario,
    },
    {
      id: 'premium',
      label: '다양한 기프트카드',
      version: 'v2',
      sellingPoint: '교환 카탈로그',
      url: 'findle.io/rewards',
      background: FINDLE_BG,
      scenario: premiumScenario,
    },
  ],
};

export default rewards;
