import type { Scenario } from '../../../engine/types';
import { getLang, pick } from '../_shared/i18n';
import { slug, STR } from './data';
import { useTeacherReport } from './state';

const st = () => useTeacherReport.getState();
const leo = `student-${slug('Leo Park')}`;

/**
 * 흐름 내레이션 워크스루 — 하단 밴드가 STEP·설명을 담당하고, 커서가 실제 기능을 짚는다.
 *  ① 개요 → ② AI 반 리포트 생성/검토 → ③ 전 학생 자동 발송 → ④ 학생 리포트 심층 분석.
 *  chromeless 라 카메라 줌은 없다 — 커서 이동 시 대상이 자동으로 화면에 들어온다.
 */
export const fullScenario: Scenario = {
  id: 'findle-teacher-report-full',
  steps: [
    // ① 개요
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'class-stats', ms: 800 },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'roster', ms: 800 },
    { kind: 'wait', ms: 1300 },

    // ② AI 반 리포트 생성
    { kind: 'cursor', target: 'generate-report', ms: 700 },
    { kind: 'click', target: 'generate-report', run: () => st().generate() },
    { kind: 'wait', ms: 4300 }, // 분석 + 요약 스트리밍 + 섹션 등장 + 완료

    // 강점 → 약점 → 도움 필요 검토 (커서 이동이 섹션을 화면으로 끌어온다)
    { kind: 'cursor', target: 'report-strong', ms: 700 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'report-weak', ms: 650 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'report-needhelp', ms: 650 },
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'report-reco', ms: 650 },
    { kind: 'wait', ms: 1400 },

    // ③ 전 학생 맞춤 리포트 자동 발송
    { kind: 'cursor', target: 'send-all', ms: 700 },
    { kind: 'click', target: 'send-all', run: () => st().startDispatch() },
    { kind: 'wait', ms: 700 }, // 모달 등장
    { kind: 'waitFor', check: () => st().dispatchPhase === 'done', timeoutMs: 6000 },
    { kind: 'wait', ms: 1600 }, // 발송 완료 배너 정독
    { kind: 'cursor', target: 'dispatch-done', ms: 600 },
    { kind: 'click', target: 'dispatch-done', run: () => st().closeDispatch() },
    { kind: 'wait', ms: 800 },

    // ④ 개별 학생 리포트 모달
    { kind: 'cursor', target: leo, ms: 700 },
    { kind: 'click', target: leo, run: () => st().openStudent('Leo Park') },
    { kind: 'wait', ms: 2500 }, // 모달 등장 + 코칭 분석/스트리밍

    { kind: 'cursor', target: 'student-radar', ms: 800 },
    { kind: 'wait', ms: 1900 }, // 오각형 정독
    { kind: 'cursor', target: 'student-strengths', ms: 700 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'student-trend', ms: 700 },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'student-coaching', ms: 700 },
    { kind: 'wait', ms: 1800 }, // 코칭 정독

    // 보호자 발송
    { kind: 'cursor', target: 'modal-send-guardian', ms: 700 },
    { kind: 'click', target: 'modal-send-guardian', run: () => st().notify(pick(STR.noticeSentGuardian, getLang())) },
    { kind: 'wait', ms: 1700 }, // 발송 토스트

    // 마무리 — 완성된 학생 리포트로 시선을 복귀시켜 차분히 홀드 (STEP 4에서 끝)
    { kind: 'cursor', target: 'student-radar', ms: 900 },
    { kind: 'wait', ms: 3200 },
  ],
};
