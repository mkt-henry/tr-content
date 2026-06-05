import type { Scenario } from '../../../engine/types';
import { useMatrix } from './state';

const st = () => useMatrix.getState();

// 열 1개 채움 ≈ 0.35s + 5×~0.54s ≈ 3.1s

/** v1 — 일괄 추출 소구: 열을 연달아 추가하며 30개 항목이 채워지는 과정 */
export const batchScenario: Scenario = {
  id: 'matrix-batch',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // LoB
    { kind: 'wait', ms: 3400 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // Limit
    { kind: 'wait', ms: 3400 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // Deductible
    { kind: 'wait', ms: 2200 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // Rate
    { kind: 'wait', ms: 2200 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // Reinstatement
    { kind: 'wait', ms: 2200 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // Exclusions
    { kind: 'wait', ms: 3800 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 인용 검증 소구: 추출 후 셀을 클릭해 원문 인용 패널 확인 */
export const citedScenario: Scenario = {
  id: 'matrix-cited',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // LoB
    { kind: 'wait', ms: 3400 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // Limit
    { kind: 'wait', ms: 3400 },
    { kind: 'click', target: 'add-col-btn', run: () => st().addColumn() }, // Deductible
    { kind: 'wait', ms: 3400 },
    // 셀 클릭 → V7 스타일 원문 인용 패널
    { kind: 'click', target: 'cell-propcat-limit', run: () => st().openPopover('propcat', 'limit') },
    { kind: 'wait', ms: 3200 },
    { kind: 'click', target: 'cell-casualty-deductible', run: () => st().openPopover('casualty', 'deductible') },
    { kind: 'wait', ms: 3200 },
    { kind: 'do', run: () => st().closePopover() },
    { kind: 'wait', ms: 1000 },
  ],
};
