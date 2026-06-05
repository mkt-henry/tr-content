import type { Scenario } from '../../../engine/types';
import { useWarroom } from './state';

const st = () => useWarroom.getState();

/** v1 — 실시간 워룸: 속보 → 태풍 경로 → 노출 분석 → 순차 점등 → 합계 카운트업 */
export const liveScenario: Scenario = {
  id: 'warroom-live',
  steps: [
    { kind: 'wait', ms: 1400 },
    { kind: 'do', run: () => st().triggerEvent() },
    { kind: 'wait', ms: 2800 },
    { kind: 'cursor', target: 'scan-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'scan-run', run: () => st().scanExposures() },
    { kind: 'wait', ms: 4400 },
    { kind: 'cursor', target: 'summary-card', ms: 800 },
    { kind: 'wait', ms: 2200 },
  ],
};

/** v2 — 출재사 알림 30초: 분석 완료 상태 → 초안 순차 작성 → 일괄 발송 */
export const alertsScenario: Scenario = {
  id: 'warroom-alerts',
  steps: [
    { kind: 'do', run: () => st().seedAssessed() },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'draft-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'draft-run', run: () => st().draftAlerts() },
    { kind: 'wait', ms: 3000 },
    { kind: 'cursor', target: 'send-all', ms: 700 },
    { kind: 'wait', ms: 250 },
    { kind: 'click', target: 'send-all', run: () => st().sendAll() },
    { kind: 'wait', ms: 2400 },
  ],
};
