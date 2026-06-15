import { SlidersHorizontal } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { usePanelOptimizer } from './state';
import { normalizeOptimizeScenario, reoptimizeScenario } from './scenario';

const panelOptimizer: FeatureDefinition = {
  id: 'panel-optimizer',
  title: '견적 비교 + AI 패널 최적화',
  description: '여러 재보험사 견적을 정규화·비교하고, 제약(등급·한도·분산)을 지켜 100% 라인을 자동 최적 배분한 인수 패널을 근거와 함께 제시합니다.',
  icon: SlidersHorizontal,
  accent: '#0ea5e9',
  Desktop,
  Mobile,
  resetState: () => usePanelOptimizer.getState().reset(),
  variants: [
    {
      id: 'optimal-panel',
      label: '정규화 → 최적 패널',
      version: 'v1',
      sellingPoint: '패널 최적화',
      url: 'insightre.ai/placement',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(14,165,233,0.22), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(13,110,160,0.30), transparent 60%), linear-gradient(160deg, #0a0d16 0%, #06080e 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-sky-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-cyan-900/25 blur-[120px]',
        ],
      },
      scenario: normalizeOptimizeScenario,
    },
    {
      id: 'reoptimize',
      label: '제약 강화 → 재최적화',
      version: 'v2',
      sellingPoint: 'what-if 대응',
      url: 'insightre.ai/placement',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(13,148,180,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(20,80,120,0.30), transparent 60%), linear-gradient(165deg, #0a0d15 0%, #06080d 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-600/10 blur-[140px]'],
      },
      scenario: reoptimizeScenario,
    },
  ],
};

export default panelOptimizer;
