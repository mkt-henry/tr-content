import type { Scenario } from '../../../engine/types';
import { EXTRACTION } from './data';
import { useInbox } from './state';

const st = () => useInbox.getState();
const TARGET = EXTRACTION.emailId;

/** v1 — 인박스 자동 정리: 분류 클릭 → 순차 스캔 → 우선순위 재정렬 → 긴급 메일 호버 요약 */
export const sortScenario: Scenario = {
  id: 'inbox-sort',
  steps: [
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'triage-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'triage-run', run: () => st().startTriage() },
    { kind: 'wait', ms: 4600 },
    { kind: 'cursor', target: `email-row-${TARGET}`, ms: 800 },
    { kind: 'do', run: () => st().setHovered(TARGET) },
    { kind: 'wait', ms: 2400 },
    { kind: 'do', run: () => st().setHovered(null) },
    { kind: 'wait', ms: 600 },
  ],
};

/** v2 — 메일에서 파이프라인까지: 분류된 인박스에서 긴급 의뢰 클릭 → 핵심 추출 → 파이프라인 등록 */
export const pipelineScenario: Scenario = {
  id: 'inbox-pipeline',
  steps: [
    { kind: 'do', run: () => st().seedSorted() },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: `email-row-${TARGET}`, ms: 700 },
    { kind: 'click', target: `email-row-${TARGET}`, run: () => st().selectEmail(TARGET) },
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'extract-run', run: () => st().extract() },
    { kind: 'wait', ms: 5900 },
    { kind: 'cursor', target: 'pipeline-add', ms: 700 },
    { kind: 'click', target: 'pipeline-add', run: () => st().addToPipeline() },
    { kind: 'wait', ms: 2400 },
  ],
};
