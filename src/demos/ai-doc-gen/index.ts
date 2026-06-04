import { Presentation } from 'lucide-react';
import type { FeatureDefinition } from '../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useDocGen } from './state';
import { speedScenario, templateScenario } from './scenario';

const docGen: FeatureDefinition = {
  id: 'ai-doc-gen',
  title: 'AI 갱신 제안서 생성',
  description: '계약·손해율 데이터를 기반으로 Treaty 갱신 제안서 슬라이드를 자동 생성합니다.',
  icon: Presentation,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useDocGen.getState().reset(),
  variants: [
    {
      id: 'speed',
      label: '30초 만에 초안 완성',
      version: 'v1',
      sellingPoint: '속도',
      url: 'insightre.ai/proposals',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 78% 18%, rgba(192,141,82,0.38), transparent 58%), radial-gradient(ellipse 65% 55% at 12% 88%, rgba(122,82,42,0.32), transparent 60%), linear-gradient(155deg, #1d140c 0%, #0c0806 100%)',
        blobs: [
          'absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-brass-500/15 blur-[140px]',
          'absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-amber-900/25 blur-[120px]',
        ],
      },
      scenario: speedScenario,
    },
    {
      id: 'template',
      label: '회사 템플릿 그대로',
      version: 'v2',
      sellingPoint: '브랜드 일관성',
      url: 'insightre.ai/proposals',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 22% 15%, rgba(99,102,241,0.3), transparent 58%), radial-gradient(ellipse 60% 55% at 85% 90%, rgba(67,56,202,0.25), transparent 60%), linear-gradient(165deg, #12101d 0%, #08070d 100%)',
        blobs: [
          'absolute -left-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-600/15 blur-[140px]',
        ],
      },
      scenario: templateScenario,
    },
  ],
};

export default docGen;
