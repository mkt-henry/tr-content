import type { Scenario } from '../../../engine/types';
import { useMatch } from './state';

const st = () => useMatch.getState();

// 분석: 5×0.85s + 0.9s ≈ 5.2s · 이메일: subject ~1.1s + body ~6.5s

/** v1 — 데이터 기반 추천 소구: 적합도 분석과 근거에 집중 */
export const rankingScenario: Scenario = {
  id: 'match-ranking',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'analyze-btn', run: () => st().analyze() },
    { kind: 'wait', ms: 6500 },
    { kind: 'cursor', target: 'select-swissre', ms: 800 },
    { kind: 'wait', ms: 1200 },
    { kind: 'click', target: 'select-swissre', run: () => st().select('swissre') },
    { kind: 'wait', ms: 9500 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 이메일 자동화 소구: 선택 후 이메일 생성·발송 흐름 강조 */
export const outreachScenario: Scenario = {
  id: 'match-outreach',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'analyze-btn', run: () => st().analyze() },
    { kind: 'wait', ms: 6500 },
    { kind: 'click', target: 'select-swissre', run: () => st().select('swissre') },
    { kind: 'wait', ms: 9500 },
    { kind: 'cursor', target: 'email-body', ms: 700 },
    { kind: 'wait', ms: 800 },
    { kind: 'cursor', target: 'email-send', ms: 700 },
    { kind: 'wait', ms: 1800 },
  ],
};
