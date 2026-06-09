import type { Scenario } from '../../../engine/types';
import { usePipe } from './state';

const st = () => usePipe.getState();

/** v1 — 실시간 데이터 검증: 로드 → 소스 패널 → 검증 파이프라인 훑기 */
export const ingestScenario: Scenario = {
  id: 'pipe-ingest',
  steps: [
    { kind: 'wait', ms: 800 },
    { kind: 'click', target: 'load-btn', run: () => st().load() },
    { kind: 'wait', ms: 2500 },
    { kind: 'cursor', target: 'source-dart' },
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'source-reports' },
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'pipeline-card' },
    { kind: 'wait', ms: 1600 },
    { kind: 'cursor', target: 'kpi-accuracy' },
    { kind: 'wait', ms: 1600 },
  ],
};

/** v2 — Fin-RATE 벤치마크: 로드 → 벤치마크 카드 강조 */
export const benchmarkScenario: Scenario = {
  id: 'pipe-benchmark',
  steps: [
    { kind: 'wait', ms: 800 },
    { kind: 'click', target: 'load-btn', run: () => st().load() },
    { kind: 'wait', ms: 2200 },
    { kind: 'cursor', target: 'source-sec' },
    { kind: 'wait', ms: 800 },
    { kind: 'click', target: 'benchmark-card', run: () => st().setBenchmark(true) },
    { kind: 'wait', ms: 2600 },
  ],
};
