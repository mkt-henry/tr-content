import type { Scenario } from '../../../engine/types';
import { SOLVABLE_ARTICLE } from './data';
import { useAiDailyQuiz } from './state';

const st = () => useAiDailyQuiz.getState();
const correctOf = (i: number) => SOLVABLE_ARTICLE.quizzes[i].correctIndex;

// builds the repeated per-question steps (select correct → submit → reveal → next)
function answerSteps(i: number): Scenario['steps'] {
  const c = correctOf(i);
  return [
    { kind: 'click', target: `quiz-opt-${c}`, run: () => st().selectOption(c) },
    { kind: 'wait', ms: 700 },
    { kind: 'click', target: 'submit-answer', run: () => st().submitAnswer() },
    { kind: 'wait', ms: 1900 },
    { kind: 'click', target: 'next-quiz', run: () => st().nextQuiz() },
    { kind: 'wait', ms: 900 },
  ];
}

/** v1 — 풀이+적립 루프 */
export const solveEarnScenario: Scenario = {
  id: 'tz-daily-quiz-solve-earn',
  steps: [
    { kind: 'do', run: () => st().setComboMode(false) },
    { kind: 'wait', ms: 1000 },
    { kind: 'cursor', target: 'feed-article-fed-rate', ms: 700 },
    { kind: 'wait', ms: 500 },
    { kind: 'click', target: 'feed-article-fed-rate', run: () => st().openArticle() },
    { kind: 'wait', ms: 1800 },
    { kind: 'cursor', target: 'lets-start', ms: 700 },
    { kind: 'click', target: 'lets-start', run: () => st().startQuiz() },
    { kind: 'wait', ms: 1200 },
    ...answerSteps(0),
    ...answerSteps(1),
    ...answerSteps(2),
    { kind: 'wait', ms: 2200 },
  ],
};

/** v2 — 콤보/스트릭 (동일 흐름, 콤보 모드 on) */
export const comboStreakScenario: Scenario = {
  id: 'tz-daily-quiz-combo-streak',
  steps: [
    { kind: 'do', run: () => st().setComboMode(true) },
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'feed-article-fed-rate', run: () => st().openArticle() },
    { kind: 'wait', ms: 1600 },
    { kind: 'cursor', target: 'lets-start', ms: 600 },
    { kind: 'click', target: 'lets-start', run: () => st().startQuiz() },
    { kind: 'wait', ms: 1100 },
    ...answerSteps(0),
    ...answerSteps(1),
    ...answerSteps(2),
    { kind: 'wait', ms: 2400 },
  ],
};
