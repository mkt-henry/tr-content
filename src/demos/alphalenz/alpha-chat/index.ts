import { MessageSquareText } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, cyanBg } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useChat } from './state';
import { evidenceScenario, multiturnScenario } from './scenario';

const alphaChat: FeatureDefinition = {
  id: 'alpha-chat',
  title: 'Alpha Chat 에이전트',
  description: '종목·재무·뉴스를 자연어로 물으면 데이터 근거와 차트로 즉시 답합니다.',
  icon: MessageSquareText,
  accent: '#7c5cff',
  Desktop,
  Mobile,
  resetState: () => useChat.getState().reset(),
  variants: [
    {
      id: 'evidence',
      label: '근거까지 한눈에',
      version: 'v1',
      sellingPoint: '데이터 정확성',
      url: 'alpha-lenz.com/chat',
      background: purpleBg,
      scenario: evidenceScenario,
    },
    {
      id: 'multiturn',
      label: '멀티턴 대화',
      version: 'v2',
      sellingPoint: '쉬운 사용성',
      url: 'alpha-lenz.com/chat',
      background: cyanBg,
      scenario: multiturnScenario,
    },
  ],
};

export default alphaChat;
