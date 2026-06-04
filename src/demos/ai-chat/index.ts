import { MessageSquareText } from 'lucide-react';
import type { FeatureDefinition } from '../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useChat } from './state';
import { evidenceScenario, naturalScenario } from './scenario';

const aiChat: FeatureDefinition = {
  id: 'ai-chat',
  title: '계약·클레임 Q&A',
  description: '특약·클레임 문서에 자연어로 질문하면 원문 근거와 함께 즉시 답변합니다.',
  icon: MessageSquareText,
  accent: '#2dd4bf',
  Desktop,
  Mobile,
  resetState: () => useChat.getState().reset(),
  variants: [
    {
      id: 'evidence',
      label: '근거까지 한눈에',
      version: 'v1',
      sellingPoint: '신뢰성',
      url: 'insightre.ai/assistant',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(20,184,166,0.28), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 92%, rgba(8,90,84,0.3), transparent 60%), linear-gradient(160deg, #0a1716 0%, #060b0c 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-teal-500/12 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-emerald-800/20 blur-[120px]',
        ],
      },
      scenario: evidenceScenario,
    },
    {
      id: 'natural',
      label: '말로 묻는 계약 분석',
      version: 'v2',
      sellingPoint: '쉬운 사용성',
      url: 'insightre.ai/assistant',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(56,130,246,0.26), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(13,60,120,0.3), transparent 60%), linear-gradient(165deg, #0b1220 0%, #06080f 100%)',
        blobs: [
          'absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-blue-600/12 blur-[140px]',
        ],
      },
      scenario: naturalScenario,
    },
  ],
};

export default aiChat;
