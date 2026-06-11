import { BarChart3 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { FINDLE_BG, FINDLE_GREEN } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useLeaderboard } from './state';
import { competeScenario, badgeScenario } from './scenario';

const leaderboard: FeatureDefinition = {
  id: 'findle-leaderboard',
  title: '클래스 리더보드 + 뱃지',
  description: '정답으로 XP를 쌓아 클래스 순위를 올리고, 목표 달성 시 뱃지를 언락하는 동기부여 루프입니다.',
  icon: BarChart3,
  accent: FINDLE_GREEN,
  Desktop,
  Mobile,
  resetState: () => useLeaderboard.getState().reset(),
  variants: [
    {
      id: 'compete',
      label: '또래 경쟁으로 순위 상승',
      version: 'v1',
      sellingPoint: '클래스 리더보드',
      url: 'findle.io/ranks',
      background: FINDLE_BG,
      scenario: competeScenario,
    },
    {
      id: 'badge',
      label: 'Top 3 뱃지 언락',
      version: 'v2',
      sellingPoint: '뱃지 컬렉션',
      url: 'findle.io/ranks',
      background: FINDLE_BG,
      scenario: badgeScenario,
    },
  ],
};

export default leaderboard;
