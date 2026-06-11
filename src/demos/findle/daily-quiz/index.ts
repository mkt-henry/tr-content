import { Newspaper } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { FINDLE_BG, FINDLE_GREEN } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useDailyQuiz } from './state';
import { fastScenario, deepScenario } from './scenario';

const dailyQuiz: FeatureDefinition = {
  id: 'findle-daily-quiz',
  title: '뉴스 → AI 데일리 퀴즈',
  description: '오늘의 금융 뉴스를 AI가 퀴즈로 바꿔 출제하고, 풀면 XP·Fins가 쌓이는 핀들의 핵심 학습 루프입니다.',
  icon: Newspaper,
  accent: FINDLE_GREEN,
  Desktop,
  Mobile,
  resetState: () => useDailyQuiz.getState().reset(),
  variants: [
    {
      id: 'fast',
      label: '뉴스 → 퀴즈 → 보상 30초',
      version: 'v1',
      sellingPoint: '오늘의 뉴스가 오늘의 수업',
      url: 'findle.io/learn',
      background: FINDLE_BG,
      scenario: fastScenario,
    },
    {
      id: 'deep',
      label: '해설 · 오답 복습 문항',
      version: 'v2',
      sellingPoint: '약점 개념 AI 복습',
      url: 'findle.io/learn',
      background: FINDLE_BG,
      scenario: deepScenario,
    },
  ],
};

export default dailyQuiz;
