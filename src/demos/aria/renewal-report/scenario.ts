import type { Scenario } from '../../../engine/types';
import { useRenewalReport } from './state';

const st = () => useRenewalReport.getState();

/** 자료 선택 → 풍부한 보고서 → CTA 모달 → 수신자 선택 → AI 의도 분석 → 맞춤 전달 이메일 */
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
    { kind: 'wait', ms: 5200 }, // 분석 + 섹션 8개 스트리밍
    // 생성된 보고서를 위에서부터 훑어 내려가며 전체 내용 검토
    { kind: 'cursor', target: 'report-panel', ms: 600 },
    { kind: 'scroll', target: 'report-panel', to: 'top', ms: 900 },
    { kind: 'wait', ms: 1500 }, // 표지 + Executive Summary
    { kind: 'scroll', target: 'report-panel', toId: 'section-lossrun', ms: 1300 },
    { kind: 'wait', ms: 1600 }, // 손해실적 차트
    { kind: 'scroll', target: 'report-panel', toId: 'section-structure', ms: 1100 },
    { kind: 'wait', ms: 1500 }, // 프로그램 구조도
    { kind: 'scroll', target: 'report-panel', toId: 'section-panel', ms: 1100 },
    { kind: 'wait', ms: 1400 }, // 재보험사 패널 + 등급
    { kind: 'scroll', target: 'report-panel', to: 'bottom', ms: 1300 },
    { kind: 'wait', ms: 1500 }, // 변경 + 결론
    // CTA → 전달 이메일 모달 오픈
    { kind: 'cursor', target: 'email-cta', ms: 700 },
    { kind: 'click', target: 'email-cta', run: () => st().openEmailModal() },
    { kind: 'wait', ms: 800 }, // 모달 등장
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
