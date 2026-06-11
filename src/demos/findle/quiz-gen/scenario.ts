import type { Scenario } from '../../../engine/types';
import { ARTICLE } from './data';
import { useQuizGen } from './state';

const st = () => useQuizGen.getState();

/** v1 — 어떤 뉴스든 30초 퀴즈화 */
export const fastScenario: Scenario = {
  id: 'findle-quiz-gen-fast',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'url-input', ms: 600 },
    { kind: 'type', target: 'url-input', text: () => ARTICLE.url, cps: 22, set: (v) => st().setUrl(v) },
    { kind: 'wait', ms: 500 },
    { kind: 'do', run: () => st().setDifficulty('mixed') },
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
    { kind: 'wait', ms: 1500 },
    { kind: 'cursor', target: 'result-panel', ms: 700 },
    { kind: 'wait', ms: 3400 }, // 문항 스트리밍
    { kind: 'wait', ms: 1600 },
  ],
};

/** v2 — 난이도 적응(중→대학): 고급 선택 후 생성, 레벨 태그 강조 */
export const adaptiveScenario: Scenario = {
  id: 'findle-quiz-gen-adaptive',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'url-input', ms: 600 },
    { kind: 'type', target: 'url-input', text: () => ARTICLE.url, cps: 22, set: (v) => st().setUrl(v) },
    { kind: 'wait', ms: 500 },
    { kind: 'cursor', target: 'difficulty-select', ms: 600 },
    { kind: 'do', run: () => st().setDifficulty('advanced') },
    { kind: 'wait', ms: 700 },
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
    { kind: 'wait', ms: 1500 },
    { kind: 'cursor', target: 'result-panel', ms: 700 },
    { kind: 'wait', ms: 3400 },
    { kind: 'wait', ms: 1600 },
  ],
};
