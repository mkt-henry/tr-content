import { CalendarClock } from 'lucide-react';
import type { FeatureDefinition } from '../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useRenewals } from './state';
import { pipelineScenario, briefScenario } from './scenario';

const ariaRenewals: FeatureDefinition = {
  id: 'aria-renewals',
  title: '갱신 파이프라인 + 미팅 브리핑',
  description: 'D-day 기반 갱신 추적과 미팅 전 30초 자동 브리핑을 제공합니다.',
  icon: CalendarClock,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useRenewals.getState().reset(),
  variants: [
    {
      id: 'pipeline',
      label: 'D-day 한눈에',
      version: 'v1',
      sellingPoint: '파이프라인 가시성',
      url: 'insightre.ai/renewals',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(72,68,80,0.32), transparent 58%), radial-gradient(ellipse 60% 50% at 85% 92%, rgba(154,108,58,0.2), transparent 60%), linear-gradient(170deg, #0d0c10 0%, #0b0908 100%)',
        blobs: [
          'absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brass-500/10 blur-[130px]',
        ],
      },
      scenario: pipelineScenario,
    },
    {
      id: 'brief',
      label: '30초 미팅 브리핑',
      version: 'v2',
      sellingPoint: 'Meeting Prep 자동화',
      url: 'insightre.ai/renewals/brief',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 12%, rgba(192,141,82,0.24), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 90%, rgba(64,60,70,0.32), transparent 60%), linear-gradient(155deg, #120f0b 0%, #0a0a0d 100%)',
        blobs: [
          'absolute -left-28 top-1/3 h-[24rem] w-[24rem] rounded-full bg-brass-500/12 blur-[140px]',
        ],
      },
      scenario: briefScenario,
    },
  ],
};

export default ariaRenewals;
