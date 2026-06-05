import { Coins } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { TZ_BACKGROUND } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useQuizGold } from './state';
import { learningScenario, rewardScenario } from './scenario';

const quizGold: FeatureDefinition = {
  id: 'tz-quiz-gold',
  title: '퀴즈 투 골드',
  description: '출석 퀴즈를 풀면 진짜 금에 연동된 골드가 쌓이는 Treazer의 핵심 루프입니다.',
  icon: Coins,
  accent: '#f97316',
  Desktop,
  Mobile,
  resetState: () => useQuizGold.getState().reset(),
  variants: [
    {
      id: 'reward',
      label: '퀴즈 풀고 진짜 금 받기',
      version: 'v1',
      sellingPoint: '리워드',
      url: 'treazer.app/home',
      background: TZ_BACKGROUND,
      scenario: rewardScenario,
    },
    {
      id: 'learning',
      label: '해설로 배우는 경제 상식',
      version: 'v2',
      sellingPoint: '학습',
      url: 'treazer.app/quiz',
      background: TZ_BACKGROUND,
      scenario: learningScenario,
    },
  ],
};

export default quizGold;
