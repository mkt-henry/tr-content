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
    // routing(≈2.1s) + working(5×1.56≈7.8s) + verifying(≈2s) ≈ 12.2s
    { kind: 'wait', ms: 12800 },
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
    // routing(≈2.1s) + working(5×1.06≈5.3s) + verifying(≈2s) ≈ 9.4s
    { kind: 'wait', ms: 10300 },
    { kind: 'cursor', target: 'result-card', ms: 800 },
    { kind: 'wait', ms: 1600 },
  ],
};
