import { LayoutDashboard } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useDash } from './state';
import { overviewScenario, drilldownScenario } from './scenario';

const dashboard: FeatureDefinition = {
  id: 'finance-dashboard',
  title: '수재 매출 포캐스트',
  description: '수재·출재 보험료와 갱신 파이프라인이 살아 움직이는 브로커 대시보드입니다.',
  icon: LayoutDashboard,
  accent: '#34d399',
  Desktop,
  Mobile,
  resetState: () => useDash.getState().reset(),
  variants: [
    {
      id: 'overview',
      label: '실시간 포캐스트',
      version: 'v1',
      sellingPoint: '가시성',
      url: 'insightre.ai/forecast',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 75% 12%, rgba(16,185,129,0.22), transparent 58%), radial-gradient(ellipse 65% 55% at 12% 90%, rgba(6,78,59,0.32), transparent 60%), linear-gradient(160deg, #0a1410 0%, #05080a 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-emerald-500/10 blur-[140px]',
          'absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-teal-900/25 blur-[120px]',
        ],
      },
      scenario: overviewScenario,
    },
    {
      id: 'drilldown',
      label: 'LoB 드릴다운',
      version: 'v2',
      sellingPoint: '분석 깊이',
      url: 'insightre.ai/forecast/lob',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 20% 12%, rgba(217,173,120,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(64,52,30,0.35), transparent 60%), linear-gradient(165deg, #14110c 0%, #080706 100%)',
        blobs: [
          'absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-brass-500/10 blur-[140px]',
        ],
      },
      scenario: drilldownScenario,
    },
  ],
};

export default dashboard;
