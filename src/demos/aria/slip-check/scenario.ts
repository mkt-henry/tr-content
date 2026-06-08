import type { Scenario } from '../../../engine/types';
import { useSlipCheck } from './state';

const st = () => useSlipCheck.getState();

/** v1 — 불일치 자동 검출: 검사 클릭 → 조항 순차 대조 → 불일치/누락 플래그 → 요약 */
export const checkScenario: Scenario = {
  id: 'slip-check-scan',
  steps: [
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'check-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'check-run', run: () => st().startScan() },
    { kind: 'wait', ms: 5800 },
    { kind: 'cursor', target: 'clause-wording-hours', ms: 800 },
    { kind: 'wait', ms: 1600 },
    { kind: 'cursor', target: 'summary-bar', ms: 700 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 수정안 반영: 검사 완료 상태 → 전체 반영 → redline 순차 → 리포트 배지 */
export const applyScenario: Scenario = {
  id: 'slip-check-apply',
  steps: [
    { kind: 'do', run: () => st().seedDone() },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'apply-all', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'apply-all', run: () => st().applyAll() },
    { kind: 'wait', ms: 3000 },
    { kind: 'cursor', target: 'report-badge', ms: 700 },
    { kind: 'wait', ms: 1800 },
  ],
};
