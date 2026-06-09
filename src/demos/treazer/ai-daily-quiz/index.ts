import { Sparkles } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { TZ_BACKGROUND } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useAiDailyQuiz } from './state';
import { solveEarnScenario, comboStreakScenario } from './scenario';

const aiDailyQuiz: FeatureDefinition = {
  id: 'tz-ai-daily-quiz',
  title: 'AI 데일리 퀴즈',
  description:
    '오늘의 뉴스를 읽고 AI 퀴즈를 풀면 골드가 쌓입니다. 연속 정답 콤보와 출석 보상까지.',
  icon: Sparkles,
  accent: '#f97316',
  Desktop,
  Mobile,
  resetState: () => useAiDailyQuiz.getState().reset(),
  variants: [
    { id: 'solve-earn', label: '풀고 골드 적립', version: 'v1', sellingPoint: 'Learn & Earn',
      url: 'treazer.app/daily-quiz', background: TZ_BACKGROUND, scenario: solveEarnScenario },
    { id: 'combo-streak', label: '연속 정답 콤보', version: 'v2', sellingPoint: '데일리 리텐션',
      url: 'treazer.app/daily-quiz', background: TZ_BACKGROUND, scenario: comboStreakScenario },
  ],
};

export default aiDailyQuiz;
