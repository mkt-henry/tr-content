import type { Scenario, Step } from '../../../engine/types';
import { FOLLOW_UP, QUIZZES } from './data';
import { useDailyQuiz } from './state';

const st = () => useDailyQuiz.getState();

/** 한 문항 풀이 스텝 — 보기 선택 → 제출 → 해설 → 다음 */
function answer(optIndex: number): Step[] {
  return [
    { kind: 'click', target: `quiz-opt-${optIndex}`, run: () => st().selectOption(optIndex) },
    { kind: 'wait', ms: 650 },
    { kind: 'click', target: 'submit-answer', run: () => st().submitAnswer() },
    { kind: 'wait', ms: 1800 },
    { kind: 'click', target: 'next-quiz', run: () => st().nextQuiz() },
    { kind: 'wait', ms: 800 },
  ];
}

const NAV: Step[] = [
  { kind: 'wait', ms: 900 },
  { kind: 'cursor', target: 'todays-quiz', ms: 700 },
  { kind: 'click', target: 'todays-quiz', run: () => st().openNews() },
  { kind: 'wait', ms: 1400 },
  { kind: 'cursor', target: 'start-quiz', ms: 600 },
  { kind: 'click', target: 'start-quiz', run: () => st().startQuiz() },
  { kind: 'wait', ms: 1000 },
];

/** v1 — 속도: 뉴스 → 퀴즈(정답) → 보상 30초 */
export const fastScenario: Scenario = {
  id: 'findle-daily-quiz-fast',
  steps: [
    ...NAV,
    ...answer(QUIZZES[0].correctIndex),
    ...answer(QUIZZES[1].correctIndex),
    { kind: 'wait', ms: 2400 },
  ],
};

/** v2 — 학습 깊이: 1정답 + 1오답 → AI 복습 문항 추가 → 정답 */
export const deepScenario: Scenario = {
  id: 'findle-daily-quiz-deep',
  steps: [
    { kind: 'do', run: () => st().setDeepMode(true) },
    ...NAV,
    ...answer(QUIZZES[0].correctIndex),
    // Q2 오답 → 복습 문항 예약
    ...answer((QUIZZES[1].correctIndex + 1) % 4),
    // 복습 문항 등장 강조 후 정답
    { kind: 'cursor', target: 'followup-banner', ms: 800 },
    { kind: 'wait', ms: 1200 },
    ...answer(FOLLOW_UP.correctIndex),
    { kind: 'wait', ms: 2400 },
  ],
};
