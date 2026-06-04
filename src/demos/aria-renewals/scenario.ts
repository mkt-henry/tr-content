import type { Scenario } from '../../engine/types';
import { useRenewals } from './state';

const st = () => useRenewals.getState();

// 브리핑: 0.7s + 4개 아이템 × (텍스트 ~16ms/자 + 0.3s) ≈ 12s

/** v1 — 파이프라인 가시성 소구: D-day 칸반 훑기 → 브리핑 */
export const pipelineScenario: Scenario = {
  id: 'renewals-pipeline',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'cursor', target: 'renewal-db', ms: 800 },
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'renewal-samsung', ms: 700 },
    { kind: 'wait', ms: 700 },
    { kind: 'click', target: 'renewal-kbmarine', run: () => st().selectCard('kbmarine') },
    { kind: 'wait', ms: 1200 },
    { kind: 'click', target: 'brief-btn', run: () => st().generateBriefing() },
    { kind: 'wait', ms: 13000 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 미팅 브리핑 소구: 바로 브리핑 생성에 집중, 추천 논점 강조 */
export const briefScenario: Scenario = {
  id: 'renewals-brief',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'renewal-kbmarine', run: () => st().selectCard('kbmarine') },
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'brief-btn', run: () => st().generateBriefing() },
    { kind: 'wait', ms: 13000 },
    { kind: 'cursor', target: 'brief-points', ms: 800 },
    { kind: 'wait', ms: 2200 },
  ],
};
