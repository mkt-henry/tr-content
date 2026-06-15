import type { Scenario } from '../../../engine/types';
import { usePanelOptimizer } from './state';

const st = () => usePanelOptimizer.getState();

/** v1 — 견적 정규화 → 최적 패널 + 근거 */
export const normalizeOptimizeScenario: Scenario = {
  id: 'panel-base',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'normalize-run', run: () => st().normalize() },
    { kind: 'wait', ms: 3200 },
    // 비적격 견적(Lloyd's) 강조
    { kind: 'cursor', target: 'quote-lloyds', ms: 700, zoom: true },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'optimize-run', run: () => st().optimize(), zoom: true },
    { kind: 'wait', ms: 1300 },
    // 최적 패널 결과 강조
    { kind: 'cursor', target: 'panel-result', ms: 700, zoom: true },
    { kind: 'wait', ms: 2400 },
  ],
};

/** v2 — 제약 강화(1사 20%) → 재최적화 */
export const reoptimizeScenario: Scenario = {
  id: 'panel-tighten',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'normalize-run', run: () => st().normalize() },
    { kind: 'wait', ms: 3200 },
    { kind: 'click', target: 'optimize-run', run: () => st().optimize(), zoom: true },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'panel-result', ms: 700, zoom: true },
    { kind: 'wait', ms: 2000 },
    // 제약 강화 → 재최적화
    { kind: 'click', target: 'constraint-tighten', run: () => st().tighten(), zoom: true },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'panel-result', ms: 700, zoom: true },
    { kind: 'wait', ms: 2400 },
  ],
};
