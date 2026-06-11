import { Sparkles } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { FINDLE_BG, FINDLE_GREEN } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useQuizGen } from './state';
import { fastScenario, adaptiveScenario } from './scenario';

const quizGen: FeatureDefinition = {
  id: 'findle-quiz-gen',
  title: 'AI Quiz Generator',
  description: '교사가 뉴스 URL만 붙여넣으면 AI가 기사를 읽고 난이도별 개념 퀴즈를 자동 생성합니다.',
  icon: Sparkles,
  accent: FINDLE_GREEN,
  Desktop,
  Mobile,
  resetState: () => useQuizGen.getState().reset(),
  variants: [
    {
      id: 'fast',
      label: '어떤 뉴스든 30초 퀴즈화',
      version: 'v1',
      sellingPoint: '뉴스 URL → AI 문항 생성',
      url: 'findle.io/teacher/quiz-generator',
      background: FINDLE_BG,
      scenario: fastScenario,
    },
    {
      id: 'adaptive',
      label: '난이도 적응 (초급→대학)',
      version: 'v2',
      sellingPoint: '학생 수준 맞춤 출제',
      url: 'findle.io/teacher/quiz-generator',
      background: FINDLE_BG,
      scenario: adaptiveScenario,
    },
  ],
};

export default quizGen;
