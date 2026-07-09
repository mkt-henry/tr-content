import { Scale } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, cyanBg } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { usePair } from './state';
import { neutralScenario, guardrailScenario } from './scenario';

const pairBuilder: FeatureDefinition = {
  id: 'pair-builder',
  title: '롱/숏 페어 빌더',
  description: '같은 섹터에서 롱·숏 페어를 제안하고 노출·리밋을 자동으로 맞춰 마켓 뉴트럴 북을 설계합니다.',
  icon: Scale,
  accent: '#a78bfa',
  Desktop,
  Mobile,
  resetState: () => usePair.getState().reset(),
  variants: [
    {
      id: 'neutral',
      label: '마켓 뉴트럴 자동 설계',
      version: 'v1',
      sellingPoint: '포트폴리오 구성',
      url: 'alpha-lenz.com/pair-builder',
      background: purpleBg,
      scenario: neutralScenario,
    },
    {
      id: 'guardrail',
      label: '리스크 리밋 가드레일',
      version: 'v2',
      sellingPoint: '리스크 관리',
      url: 'alpha-lenz.com/pair-builder',
      background: cyanBg,
      scenario: guardrailScenario,
    },
  ],
};

export default pairBuilder;
