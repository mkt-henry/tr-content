import type { Scenario } from '../../../engine/types';
import { ERROR_ROWS } from './data';
import { useBordereaux } from './state';

const st = () => useBordereaux.getState();
const FIRST_ERROR = ERROR_ROWS[0].id;

/** v1 — 행 단위 자동 검증: 검증 클릭 → 행 순차 스캔 → 오류 셀 플래그 → 요약 + 오류 카드 */
export const validateScenario: Scenario = {
  id: 'bdx-validate',
  steps: [
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'validate-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'validate-run', run: () => st().validate() },
    { kind: 'wait', ms: 4500 },
    { kind: 'cursor', target: `cell-${FIRST_ERROR}-currency`, ms: 800 },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'summary-bar', ms: 700 },
    { kind: 'wait', ms: 1400 },
  ],
};

/** v2 — 정산 대조 → 청구서: 검증 완료 → 자동 수정 → 정산 산출 → 정산 카드 */
export const settleScenario: Scenario = {
  id: 'bdx-settle',
  steps: [
    { kind: 'do', run: () => st().seedValidated() },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'fix-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'fix-run', run: () => st().autoFix() },
    { kind: 'wait', ms: 1500 },
    { kind: 'cursor', target: 'settle-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'settle-run', run: () => st().settle() },
    { kind: 'wait', ms: 2200 },
  ],
};
