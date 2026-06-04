import type { Scenario } from '../../engine/types';
import { useDash } from './state';

const st = () => useDash.getState();

/** v1 — 한눈에 보는 실적: 로드 → KPI 훑기 → 기간 전환 */
export const overviewScenario: Scenario = {
  id: 'dash-overview',
  steps: [
    { kind: 'wait', ms: 800 },
    { kind: 'click', target: 'load-btn', run: () => st().load() },
    { kind: 'wait', ms: 2200 },
    { kind: 'click', target: 'kpi-revenue', run: () => st().setHighlight('revenue') },
    { kind: 'wait', ms: 1100 },
    { kind: 'click', target: 'kpi-opm', run: () => st().setHighlight('opm') },
    { kind: 'wait', ms: 1100 },
    { kind: 'do', run: () => st().setHighlight(null) },
    { kind: 'click', target: 'period-year', run: () => st().setPeriod('year') },
    { kind: 'wait', ms: 2400 },
    { kind: 'click', target: 'period-quarter', run: () => st().setPeriod('quarter') },
    { kind: 'wait', ms: 2000 },
  ],
};

/** v2 — 부문 드릴다운: 로드 → 부문 필터 → 차트 전환 */
export const drilldownScenario: Scenario = {
  id: 'dash-drilldown',
  steps: [
    { kind: 'wait', ms: 800 },
    { kind: 'click', target: 'load-btn', run: () => st().load() },
    { kind: 'wait', ms: 2400 },
    { kind: 'click', target: 'segment-property', run: () => st().setSegment('property') },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'segment-aviation', run: () => st().setSegment('aviation') },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'segment-aviation', run: () => st().setSegment('aviation') },
    { kind: 'wait', ms: 800 },
    { kind: 'click', target: 'period-year', run: () => st().setPeriod('year') },
    { kind: 'wait', ms: 2400 },
  ],
};
