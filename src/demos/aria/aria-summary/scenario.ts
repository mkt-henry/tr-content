import type { Scenario } from '../../../engine/types';
import { useSummary } from './state';

const st = () => useSummary.getState();

// 7개 카드 × (스트리밍 ~22ms/자 + 간격) ≈ 11~12초

/** v1 — 속도 소구: 영문 슬립이 30초 안에 한국어 구조화 요약으로 */
export const speedScenario: Scenario = {
  id: 'summary-speed',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'summarize-btn', run: () => st().generate() },
    { kind: 'wait', ms: 13500 },
    { kind: 'wait', ms: 1500 },
  ],
};

/** v2 — 인용 추적 소구: 요약 완료 후 카드를 호버하며 원문 연결 시연 */
export const traceScenario: Scenario = {
  id: 'summary-trace',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'summarize-btn', run: () => st().generate() },
    { kind: 'wait', ms: 13500 },
    // 카드 → 원문 하이라이트 동기화 시연
    { kind: 'click', target: 'card-limit', run: () => st().highlight('s3') },
    { kind: 'wait', ms: 1800 },
    { kind: 'click', target: 'card-excl', run: () => st().highlight('s5') },
    { kind: 'wait', ms: 1800 },
    { kind: 'click', target: 'card-special', run: () => st().highlight('s6') },
    { kind: 'wait', ms: 1800 },
    { kind: 'do', run: () => st().highlight(null) },
    { kind: 'wait', ms: 1000 },
  ],
};
