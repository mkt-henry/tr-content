import { Star } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { TZ_BACKGROUND } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useMissionEngine } from './state';
import { dailyScenario, timedScenario } from './scenario';

const missionEngine: FeatureDefinition = {
  id: 'tz-mission-engine',
  title: '미션 엔진',
  description:
    '시간대별로 열리는 미션과 데일리 미션이 하루 종일 재방문을 만드는 리텐션 엔진입니다.',
  icon: Star,
  accent: '#f97316',
  Desktop,
  Mobile,
  resetState: () => useMissionEngine.getState().reset(),
  variants: [
    {
      id: 'timed',
      label: '시간마다 열리는 미션',
      version: 'v1',
      sellingPoint: '리텐션',
      url: 'treazer.app/mission',
      background: TZ_BACKGROUND,
      scenario: timedScenario,
    },
    {
      id: 'daily',
      label: '매일 리셋되는 보상',
      version: 'v2',
      sellingPoint: '데일리 루프',
      url: 'treazer.app/mission',
      background: TZ_BACKGROUND,
      scenario: dailyScenario,
    },
  ],
};

export default missionEngine;
