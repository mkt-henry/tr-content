import { Sparkles } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { TZ_BACKGROUND } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useAiDailyQuiz } from './state';
import { localizeScenario, newsToQuizScenario } from './scenario';

const aiDailyQuiz: FeatureDefinition = {
  id: 'tz-ai-daily-quiz',
  title: 'AI 데일리 퀴즈',
  description:
    '오늘의 뉴스 기사를 AI가 그날의 퀴즈로 자동 변환하고, 나라별 언어로 즉시 현지화합니다.',
  icon: Sparkles,
  accent: '#f97316',
  Desktop,
  Mobile,
  resetState: () => useAiDailyQuiz.getState().reset(),
  variants: [
    {
      id: 'news-to-quiz',
      label: '오늘 뉴스가 오늘 퀴즈로',
      version: 'v1',
      sellingPoint: 'AI 생성',
      url: 'treazer.app/daily-quiz',
      background: TZ_BACKGROUND,
      scenario: newsToQuizScenario,
    },
    {
      id: 'localize',
      label: '나라별 맞춤 현지화',
      version: 'v2',
      sellingPoint: '글로벌',
      url: 'treazer.app/daily-quiz',
      background: TZ_BACKGROUND,
      scenario: localizeScenario,
    },
  ],
};

export default aiDailyQuiz;
