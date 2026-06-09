import type { Scenario } from '../../../engine/types';
import { SOLVABLE_ARTICLE } from './data';
import { useAiDailyQuiz } from './state';

const st = () => useAiDailyQuiz.getState();
const correctOf = (i: number) => SOLVABLE_ARTICLE.quizzes[i].correctIndex;

/** v1 — 풀이+적립 루프: 피드 → 기사 → 정답 풀이 → 결과 */
export const solveEarnScenario: Scenario = {
  id: 'tz-daily-quiz-solve-earn',
  steps: [
    { kind: 'do', run: () => st().setComboMode(false) },
    { kind: 'wait', ms: 1000 },
    { kind: 'cursor', target: 'feed-article-fed-rate', ms: 700 },
    { kind: 'wait', ms: 600 },
    { kind: 'click', target: 'feed-article-fed-rate', run: () => st().openArticle() },
    { kind: 'wait', ms: 1400 },
    { kind: 'click', target: 'quiz-0-opt-' + correctOf(0), run: () => st().selectAnswer(0, correctOf(0)) },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'quiz-1-opt-' + correctOf(1), run: () => st().selectAnswer(1, correctOf(1)) },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'quiz-2-opt-' + correctOf(2), run: () => st().selectAnswer(2, correctOf(2)) },
    { kind: 'wait', ms: 1400 },
    { kind: 'click', target: 'see-result', run: () => st().finish() },
    { kind: 'wait', ms: 2400 },
  ],
};

/** v2 — 콤보/스트릭: 동일 흐름이되 연속 정답으로 콤보 강조 */
export const comboStreakScenario: Scenario = {
  id: 'tz-daily-quiz-combo-streak',
  steps: [
    { kind: 'do', run: () => st().setComboMode(true) },
    { kind: 'wait', ms: 1000 },
    { kind: 'cursor', target: 'feed-article-fed-rate', ms: 600 },
    { kind: 'click', target: 'feed-article-fed-rate', run: () => st().openArticle() },
    { kind: 'wait', ms: 1200 },
    { kind: 'click', target: 'quiz-0-opt-' + correctOf(0), run: () => st().selectAnswer(0, correctOf(0)) },
    { kind: 'wait', ms: 1500 },
    { kind: 'click', target: 'quiz-1-opt-' + correctOf(1), run: () => st().selectAnswer(1, correctOf(1)) },
    { kind: 'wait', ms: 1700 },
    { kind: 'click', target: 'quiz-2-opt-' + correctOf(2), run: () => st().selectAnswer(2, correctOf(2)) },
    { kind: 'wait', ms: 1700 },
    { kind: 'click', target: 'see-result', run: () => st().finish() },
    { kind: 'wait', ms: 2600 },
  ],
};
