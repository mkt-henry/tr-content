import { ClipboardList } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { FINDLE_BG, FINDLE_GREEN } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useTeacherReport } from './state';
import { reportScenario, insightScenario } from './scenario';

const teacherReport: FeatureDefinition = {
  id: 'findle-teacher-report',
  title: '교사 대시보드 + AI 리포트',
  description: '반 전체 진도를 한눈에 보고, AI가 약점 개념·도움이 필요한 학생·권고를 담은 리포트를 자동 작성합니다.',
  icon: ClipboardList,
  accent: FINDLE_GREEN,
  Desktop,
  Mobile,
  resetState: () => useTeacherReport.getState().reset(),
  variants: [
    {
      id: 'report',
      label: '반 전체 한눈에 + 자동 리포트',
      version: 'v1',
      sellingPoint: '진도 추적 + AI 리포트',
      url: 'findle.io/teacher/dashboard',
      background: FINDLE_BG,
      scenario: reportScenario,
    },
    {
      id: 'insight',
      label: '개별 학생 약점 분석',
      version: 'v2',
      sellingPoint: '약점 개념·권고',
      url: 'findle.io/teacher/dashboard',
      background: FINDLE_BG,
      scenario: insightScenario,
    },
  ],
};

export default teacherReport;
