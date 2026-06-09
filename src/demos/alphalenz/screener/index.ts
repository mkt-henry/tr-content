import { Filter } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, cyanBg } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useScreener } from './state';
import { sixScenario, surgeScenario } from './scenario';

const screener: FeatureDefinition = {
  id: 'screener',
  title: '전략 스크리너',
  description: '검증된 6가지 전략으로 조건에 맞는 종목을 즉시 선별합니다.',
  icon: Filter,
  accent: '#7c5cff',
  Desktop,
  Mobile,
  resetState: () => useScreener.getState().reset(),
  variants: [
    {
      id: 'six',
      label: '6대 전략 스크리너',
      version: 'v1',
      sellingPoint: '검증된 전략',
      url: 'alpha-lenz.com/screener',
      background: purpleBg,
      scenario: sixScenario,
    },
    {
      id: 'surge',
      label: '실시간 급등 포착',
      version: 'v2',
      sellingPoint: '타이밍',
      url: 'alpha-lenz.com/screener',
      background: cyanBg,
      scenario: surgeScenario,
    },
  ],
};

export default screener;
