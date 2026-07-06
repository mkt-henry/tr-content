import { ClipboardList } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { FINDLE_BG, FINDLE_GREEN } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useTeacherReport } from './state';
import { fullScenario } from './scenario';

const teacherReport: FeatureDefinition = {
  id: 'findle-teacher-report',
  title: '교사 대시보드 + AI 리포트',
  description: '반 전체 진도를 한눈에 보고, AI가 약점 개념·도움이 필요한 학생·권고를 담은 리포트를 자동 작성하고, 학생 한 명씩 약점·추이·AI 코칭까지 드릴다운합니다.',
  icon: ClipboardList,
  accent: FINDLE_GREEN,
  chromeless: true,
  Desktop,
  Mobile,
  resetState: () => useTeacherReport.getState().reset(),
  variants: [
    {
      id: 'full',
      label: '흐름 따라 설명 자막',
      version: 'v1',
      sellingPoint: '단계별 내레이션 · 기능 설명',
      url: 'findle.io/teacher/dashboard',
      background: FINDLE_BG,
      scenario: fullScenario,
    },
  ],
};

export default teacherReport;
