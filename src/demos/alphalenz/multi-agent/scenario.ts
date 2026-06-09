import type { Scenario } from '../../../engine/types';
import { useAgents } from './state';

const st = () => useAgents.getState();

/** v1 — 오케스트레이터 협업 소구: 작업 분배 → 병렬 분석 → 교차검증 → 합성 */
export const orchestrateScenario: Scenario = {
  id: 'multi-agent-orchestrate',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'run-btn', ms: 600 },
    { kind: 'wait', ms: 250 },
    { kind: 'click', target: 'run-btn', run: () => st().start('orchestrate') },
    // routing(≈2.1s) + working(≈4.5s) + verifying(≈2s) ≈ 8.6s
    { kind: 'wait', ms: 8800 },
    { kind: 'cursor', target: 'result-card', ms: 800 },
    { kind: 'wait', ms: 1600 },
  ],
};

/** v2 — 48개 병렬 처리 규모 소구: 같은 그래프, 병렬성/규모 강조 로그 */
export const parallelScenario: Scenario = {
  id: 'multi-agent-parallel',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'run-btn', ms: 600 },
    { kind: 'wait', ms: 250 },
    { kind: 'click', target: 'run-btn', run: () => st().start('parallel') },
    { kind: 'wait', ms: 8800 },
    { kind: 'cursor', target: 'result-card', ms: 800 },
    { kind: 'wait', ms: 1600 },
  ],
};
