import type { Scenario } from '../../../engine/types';
import { useScreener } from './state';

const st = () => useScreener.getState();

/** v1 — 6대 전략: VCP 선별 → CANSLIM 전환 → 상위 종목 훑기 */
export const sixScenario: Scenario = {
  id: 'screener-six',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'strategy-vcp', run: () => st().select('vcp') },
    { kind: 'wait', ms: 2600 },
    { kind: 'click', target: 'strategy-canslim', run: () => st().select('canslim') },
    { kind: 'wait', ms: 2200 },
    { kind: 'cursor', target: 'row-0' },
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'row-1' },
    { kind: 'wait', ms: 1400 },
  ],
};

/** v2 — 실시간 급등 포착: Surge → PEAD 전환 */
export const surgeScenario: Scenario = {
  id: 'screener-surge',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'strategy-surge', run: () => st().select('surge') },
    { kind: 'wait', ms: 2600 },
    { kind: 'click', target: 'strategy-pead', run: () => st().select('pead') },
    { kind: 'wait', ms: 2400 },
    { kind: 'cursor', target: 'row-0' },
    { kind: 'wait', ms: 1000 },
  ],
};
