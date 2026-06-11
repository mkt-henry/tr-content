import type { Scenario } from '../../../engine/types';
import { useRenewalReport } from './state';

const st = () => useRenewalReport.getState();

/** 자료 선택 → 보고서 → 수신자 선택 → AI 의도 분석 → 맞춤 전달 이메일 */
export const renewalReportScenario: Scenario = {
  id: 'renewal-report-flow',
  steps: [
    { kind: 'wait', ms: 900 },
    // 근거 자료에 '브로커 노트' 추가 선택
    { kind: 'cursor', target: 'source-toggle-notes', ms: 700 },
    { kind: 'click', target: 'source-toggle-notes', run: () => st().toggleSource('notes') },
    { kind: 'wait', ms: 700 },
    // 보고서 생성
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
    { kind: 'wait', ms: 4400 }, // 분석 + 섹션 5개 스트리밍
    { kind: 'cursor', target: 'report-panel', ms: 700 },
    { kind: 'wait', ms: 1100 },
    // 수신자 선택 — 출재사(cedent)
    { kind: 'cursor', target: 'recipient-cedent', ms: 800 },
    { kind: 'click', target: 'recipient-cedent', run: () => st().selectRecipient('cedent') },
    // AI 의도 분석 카드
    { kind: 'wait', ms: 1500 },
    { kind: 'cursor', target: 'analysis-card', ms: 700 },
    { kind: 'wait', ms: 1200 },
    // 맞춤 이메일 스트리밍
    { kind: 'wait', ms: 4200 },
    { kind: 'cursor', target: 'attachment-chip', ms: 700 },
    { kind: 'wait', ms: 1600 },
  ],
};
