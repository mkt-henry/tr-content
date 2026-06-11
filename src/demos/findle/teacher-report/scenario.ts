import type { Scenario } from '../../../engine/types';
import { useTeacherReport } from './state';

const st = () => useTeacherReport.getState();

/** v1 — 반 전체 한눈에 + 자동 리포트 */
export const reportScenario: Scenario = {
  id: 'findle-teacher-report',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'cursor', target: 'generate-report', ms: 700 },
    { kind: 'click', target: 'generate-report', run: () => st().generate() },
    { kind: 'wait', ms: 1600 },
    { kind: 'cursor', target: 'report-panel', ms: 700 },
    { kind: 'wait', ms: 3400 }, // 요약 스트리밍 + 섹션 등장
    { kind: 'wait', ms: 1600 },
  ],
};

/** v2 — 개별 학생 약점 분석: 진도 확인 후 리포트 생성, 약점·권고 클로즈업 */
export const insightScenario: Scenario = {
  id: 'findle-teacher-insight',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'cursor', target: 'roster', ms: 800 },
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'generate-report', ms: 600 },
    { kind: 'click', target: 'generate-report', run: () => st().generate() },
    { kind: 'wait', ms: 1600 },
    { kind: 'cursor', target: 'report-panel', ms: 700 },
    { kind: 'wait', ms: 4200 },
  ],
};
