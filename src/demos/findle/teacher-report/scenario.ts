import type { Scenario } from '../../../engine/types';
import { getLang, pick } from '../_shared/i18n';
import { CLASS, findStudent, REPORT_SUMMARY, slug, STR } from './data';
import { useTeacherReport } from './state';

const st = () => useTeacherReport.getState();
const leo = `student-${slug('Leo Park')}`;

/**
 * 흐름 내레이션 워크스루 — 프레임 결정론 버전. async generate/openStudent/startDispatch/notify 대신
 * 동기 setter + stream/카운터 스텝으로 구동한다(라이브·프레임 공용). waitFor 제거.
 *  ① 개요 → ② AI 반 리포트 → ③ 전 학생 발송 → ④ 학생 리포트 심층.
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
    { kind: 'click', target: 'generate-report', run: () => st().beginReport() },
    { kind: 'wait', ms: 1200 }, // 분석
    { kind: 'do', run: () => st().reportWriting() },
    { kind: 'stream', text: () => REPORT_SUMMARY[getLang()], cps: 60, append: (s) => st().appendReport(s) },
    { kind: 'wait', ms: 300 },
    { kind: 'do', run: () => st().reportSectionsReady() },
    { kind: 'wait', ms: 500 },
    { kind: 'do', run: () => st().reportDone() },

    // 강점 → 약점 → 도움 필요 → 권고 검토
    { kind: 'cursor', target: 'report-strong', ms: 700 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'report-weak', ms: 650 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'report-needhelp', ms: 650 },
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'report-reco', ms: 650 },
    { kind: 'wait', ms: 1400 },

    // ③ 전 학생 맞춤 리포트 자동 발송 (waitFor 제거 → 명시 카운터)
    { kind: 'cursor', target: 'send-all', ms: 700 },
    { kind: 'click', target: 'send-all', run: () => st().beginDispatch() },
    { kind: 'wait', ms: 700 }, // 모달 등장
    { kind: 'do', run: () => st().setSentCount(1) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(2) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(3) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(4) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(5) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(CLASS.students) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().dispatchDone() },
    { kind: 'wait', ms: 1600 }, // 발송 완료 배너 정독
    { kind: 'cursor', target: 'dispatch-done', ms: 600 },
    { kind: 'click', target: 'dispatch-done', run: () => st().closeDispatch() },
    { kind: 'wait', ms: 800 },

    // ④ 개별 학생 리포트 모달
    { kind: 'cursor', target: leo, ms: 700 },
    { kind: 'click', target: leo, run: () => st().beginCoach('Leo Park') },
    { kind: 'wait', ms: 900 }, // 분석
    { kind: 'do', run: () => st().coachWriting() },
    {
      kind: 'stream',
      text: () => findStudent('Leo Park')?.coaching[getLang()] ?? '',
      cps: 55,
      append: (s) => st().appendCoach(s),
    },
    { kind: 'do', run: () => st().coachDone() },
    { kind: 'wait', ms: 800 },

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
    { kind: 'click', target: 'modal-send-guardian', run: () => st().showNotice(pick(STR.noticeSentGuardian, getLang())) },
    { kind: 'wait', ms: 1700 }, // 발송 토스트

    // 마무리
    { kind: 'cursor', target: 'student-radar', ms: 900 },
    { kind: 'wait', ms: 3200 },
  ],
};
