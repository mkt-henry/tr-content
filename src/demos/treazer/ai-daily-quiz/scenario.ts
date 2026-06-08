import type { Scenario } from '../../../engine/types';
import { GENERATED_QUIZZES } from './data';
import { useAiDailyQuiz } from './state';

const st = () => useAiDailyQuiz.getState();

/** v1 — AI 생성 소구: 기사 → 생성 버튼 → AI 분석 → 퀴즈 카드 순차 등장 → 커서로 훑기 */
export const newsToQuizScenario: Scenario = {
  id: 'ai-daily-quiz-news-to-quiz',
  steps: [
    { kind: 'wait', ms: 1200 },
    // 오늘의 기사 먼저 보여주기
    { kind: 'cursor', target: 'article-card', ms: 700 },
    { kind: 'wait', ms: 1400 },

    // 생성 버튼 클릭 → AI 분석 시작 (shimmer)
    { kind: 'click', target: 'generate-btn', run: () => st().startGenerate() },
    { kind: 'cursor', target: 'analyzing-card', ms: 600 },
    { kind: 'wait', ms: 2400 },

    // 분석 완료 → done 전환 후 퀴즈 카드 1개씩 순차 등장
    { kind: 'do', run: () => st().finishAnalyze() },
    { kind: 'wait', ms: 500 },
    { kind: 'do', run: () => st().revealNext() },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().revealNext() },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().revealNext() },
    { kind: 'wait', ms: 900 },

    // 커서로 생성된 카드들 훑기
    { kind: 'cursor', target: 'quiz-card-0', ms: 700 },
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'quiz-card-1', ms: 700 },
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: `quiz-card-${GENERATED_QUIZZES.length - 1}`, ms: 700 },
    { kind: 'wait', ms: 2000 },
  ],
};

/** v2 — 글로벌 소구: 생성 완료 상태에서 시작 → JA → TH → VI 순으로 현지화 전환 */
export const localizeScenario: Scenario = {
  id: 'ai-daily-quiz-localize',
  steps: [
    // 생성 단계는 건너뛰고 완료 상태로 세팅 (글로벌 언어로 노출 중)
    { kind: 'do', run: () => st().presetDone() },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'quiz-card-0', ms: 700 },
    { kind: 'wait', ms: 1200 },

    // 일본어로 현지화
    { kind: 'click', target: 'lang-chip-ja', run: () => st().setLang('ja') },
    { kind: 'wait', ms: 2400 },

    // 태국어 (실제 태국 문자)
    { kind: 'click', target: 'lang-chip-th', run: () => st().setLang('th') },
    { kind: 'wait', ms: 2400 },

    // 베트남어 (실제 성조 문자)
    { kind: 'click', target: 'lang-chip-vi', run: () => st().setLang('vi') },
    { kind: 'wait', ms: 2600 },
  ],
};
