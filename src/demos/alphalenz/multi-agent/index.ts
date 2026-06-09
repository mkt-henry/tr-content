import { Workflow } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, cyanBg } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useAgents } from './state';
import { orchestrateScenario, parallelScenario } from './scenario';

const multiAgent: FeatureDefinition = {
  id: 'multi-agent',
  title: '멀티 에이전트 추론',
  description: '전문 AI 에이전트들이 병렬로 분석하고 교차 검증해 환각을 최소화합니다.',
  icon: Workflow,
  accent: '#a855f7',
  Desktop,
  Mobile,
  resetState: () => useAgents.getState().reset(),
  variants: [
    {
      id: 'orchestrate',
      label: '오케스트레이터 협업',
      version: 'v1',
      sellingPoint: '분석 품질',
      url: 'alpha-lenz.com/agents',
      background: purpleBg,
      scenario: orchestrateScenario,
    },
    {
      id: 'parallel',
      label: '48개 에이전트 병렬',
      version: 'v2',
      sellingPoint: '처리 규모',
      url: 'alpha-lenz.com/agents',
      background: cyanBg,
      scenario: parallelScenario,
    },
  ],
};

export default multiAgent;
