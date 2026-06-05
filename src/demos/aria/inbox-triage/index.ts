import { Inbox } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useInbox } from './state';
import { pipelineScenario, sortScenario } from './scenario';

const inboxTriage: FeatureDefinition = {
  id: 'inbox-triage',
  title: '인박스 AI Triage',
  description: '쏟아지는 출재 의뢰 메일을 AI가 분류·우선순위화하고, 핵심 정보 추출부터 파이프라인 등록까지.',
  icon: Inbox,
  accent: '#f59e0b',
  Desktop,
  Mobile,
  resetState: () => useInbox.getState().reset(),
  variants: [
    {
      id: 'sort',
      label: '인박스 자동 정리',
      version: 'v1',
      sellingPoint: '시간 절약',
      url: 'insightre.ai/inbox',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 82% 10%, rgba(245,158,11,0.22), transparent 58%), radial-gradient(ellipse 60% 55% at 8% 90%, rgba(120,53,15,0.28), transparent 60%), linear-gradient(160deg, #171107 0%, #0b0804 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-amber-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-orange-800/20 blur-[120px]',
        ],
      },
      scenario: sortScenario,
    },
    {
      id: 'pipeline',
      label: '메일에서 파이프라인까지 30초',
      version: 'v2',
      sellingPoint: '엔드투엔드',
      url: 'insightre.ai/inbox',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(249,115,22,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(146,64,14,0.26), transparent 60%), linear-gradient(165deg, #151008 0%, #0a0703 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-orange-500/10 blur-[140px]'],
      },
      scenario: pipelineScenario,
    },
  ],
};

export default inboxTriage;
