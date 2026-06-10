import { MessageSquarePlus } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useSourceChat } from './store';
import { addSourceScenario, slashSourceScenario } from './scenario';

const sourceChat: FeatureDefinition = {
  id: 'source-chat',
  title: '출처 지정 Q&A',
  description: '/ 명령어나 + 버튼으로 갱신 파이프라인의 특정 출재 건을 컨텍스트로 지정하면, 그 문서만 근거로 답변합니다.',
  icon: MessageSquarePlus,
  accent: '#2dd4bf',
  Desktop,
  Mobile,
  resetState: () => useSourceChat.getState().reset(),
  variants: [
    {
      id: 'add-source',
      label: '+ 버튼으로 출처 첨부',
      version: 'v1',
      sellingPoint: '직관적 컨텍스트 지정',
      url: 'insightre.ai/assistant',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(20,184,166,0.28), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 92%, rgba(8,90,84,0.3), transparent 60%), linear-gradient(160deg, #0a1716 0%, #060b0c 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-teal-500/12 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-emerald-800/20 blur-[120px]',
        ],
      },
      scenario: addSourceScenario,
    },
    {
      id: 'slash',
      label: '/ 명령어로 출처 지정',
      version: 'v2',
      sellingPoint: '빠른 키보드 워크플로우',
      url: 'insightre.ai/assistant',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(56,130,246,0.26), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(13,60,120,0.3), transparent 60%), linear-gradient(165deg, #0b1220 0%, #06080f 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-blue-600/12 blur-[140px]'],
      },
      scenario: slashSourceScenario,
    },
  ],
};

export default sourceChat;
