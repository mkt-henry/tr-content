import type { Scenario } from '../../../engine/types';
import { QUESTIONS } from './data';
import { useQuizGold } from './state';

const st = () => useQuizGold.getState();

/** v1 — 리워드 소구: 출석 → 정답 → 골드 적립 → 스트릭 갱신 */
export const rewardScenario: Scenario = {
  id: 'quiz-gold-reward',
  steps: [
    { kind: 'wait', ms: 1200 },
    { kind: 'click', target: 'checkin-btn', run: () => st().startQuiz() },
    { kind: 'wait', ms: 1100 },

    // Q1 — 정답 선택
    { kind: 'cursor', target: `quiz-option-${QUESTIONS[0].answer}`, ms: 700 },
    { kind: 'wait', ms: 400 },
    { kind: 'click', target: `quiz-option-${QUESTIONS[0].answer}`, run: () => st().selectOption(QUESTIONS[0].answer) },
    { kind: 'wait', ms: 500 },
    { kind: 'click', target: 'quiz-submit', run: () => st().submit() },
    { kind: 'wait', ms: 700 },
    // 골드 필 강조
    { kind: 'cursor', target: 'explanation', ms: 600 },
    { kind: 'wait', ms: 2200 },
    { kind: 'click', target: 'quiz-next', run: () => st().next() },
    { kind: 'wait', ms: 800 },

    // Q2 — 정답 선택
    { kind: 'cursor', target: `quiz-option-${QUESTIONS[1].answer}`, ms: 700 },
    { kind: 'wait', ms: 400 },
    { kind: 'click', target: `quiz-option-${QUESTIONS[1].answer}`, run: () => st().selectOption(QUESTIONS[1].answer) },
    { kind: 'wait', ms: 500 },
    { kind: 'click', target: 'quiz-submit', run: () => st().submit() },
    { kind: 'wait', ms: 2200 },
    { kind: 'click', target: 'quiz-next', run: () => st().next() },

    // 홈 복귀 — 스트릭·골드 갱신 확인
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'gold-pill', ms: 800 },
    { kind: 'wait', ms: 2000 },
  ],
};

/** v2 — 학습 소구: 오답 → 해설로 배우기 → 다음 문제는 정답 */
export const learningScenario: Scenario = {
  id: 'quiz-gold-learning',
  steps: [
    { kind: 'wait', ms: 1200 },
    { kind: 'click', target: 'checkin-btn', run: () => st().startQuiz() },
    { kind: 'wait', ms: 1100 },

    // Q1 — 일부러 오답 선택 → 해설 강조
    { kind: 'cursor', target: 'quiz-option-0', ms: 700 },
    { kind: 'wait', ms: 500 },
    { kind: 'click', target: 'quiz-option-0', run: () => st().selectOption(0) },
    { kind: 'wait', ms: 600 },
    { kind: 'click', target: 'quiz-submit', run: () => st().submit() },
    { kind: 'wait', ms: 800 },
    { kind: 'cursor', target: 'explanation', ms: 900 },
    { kind: 'wait', ms: 3600 },
    { kind: 'click', target: 'quiz-next', run: () => st().next() },
    { kind: 'wait', ms: 800 },

    // Q2 — 배운 대로 정답
    { kind: 'cursor', target: `quiz-option-${QUESTIONS[1].answer}`, ms: 700 },
    { kind: 'wait', ms: 400 },
    { kind: 'click', target: `quiz-option-${QUESTIONS[1].answer}`, run: () => st().selectOption(QUESTIONS[1].answer) },
    { kind: 'wait', ms: 500 },
    { kind: 'click', target: 'quiz-submit', run: () => st().submit() },
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'explanation', ms: 800 },
    { kind: 'wait', ms: 2600 },
    { kind: 'click', target: 'quiz-next', run: () => st().next() },
    { kind: 'wait', ms: 2000 },
  ],
};
