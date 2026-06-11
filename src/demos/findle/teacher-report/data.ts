import type { L } from '../_shared/i18n';

export interface Student {
  name: string;
  progress: number; // 완료율 %
  accuracy: number; // 정답률 %
  weak: L; // 약점 개념
}

export const CLASS = {
  name: { ko: '금융 101 · 3교시', en: 'Finance 101 · Period 3' } as L,
  avgAccuracy: 75,
  completion: 82,
  students: 6,
  onTrack: 4,
};

export const ROSTER: Student[] = [
  { name: 'Maya Chen', progress: 96, accuracy: 92, weak: { ko: '—', en: '—' } },
  { name: 'Jordan Lee', progress: 90, accuracy: 85, weak: { ko: '시가총액', en: 'Market cap' } },
  { name: 'Alex Kim', progress: 84, accuracy: 78, weak: { ko: '인플레이션', en: 'Inflation' } },
  { name: 'Tara Kim', progress: 80, accuracy: 74, weak: { ko: '금리', en: 'Interest rates' } },
  { name: 'Sam Torres', progress: 70, accuracy: 68, weak: { ko: '금리', en: 'Interest rates' } },
  { name: 'Leo Park', progress: 58, accuracy: 55, weak: { ko: '금리 · 인플레이션', en: 'Rates · Inflation' } },
];

/** AI 리포트 요약 본문 (스트리밍) */
export const REPORT_SUMMARY: L = {
  ko: '이번 주 금융 101 3교시 반은 평균 정답률 75%, 완료율 82%를 기록했습니다. 6명 중 4명이 목표 진도를 달성했고, 전반적으로 "주식·기업" 단원은 잘 이해하고 있습니다.\n\n다만 "금리"와 "인플레이션" 개념에서 반 전체 정답률이 낮아, 다음 주 집중 복습이 필요합니다.',
  en: 'This week the Finance 101 (Period 3) class averaged 75% accuracy and 82% completion. 4 of 6 students are on track, and the "Stocks & Companies" unit is well understood.\n\nHowever, class-wide accuracy is low on "Interest rates" and "Inflation," so a focused review is recommended next week.',
};

export interface WeakConcept {
  label: L;
  accuracy: number;
}
export const WEAK_CONCEPTS: WeakConcept[] = [
  { label: { ko: '금리', en: 'Interest rates' }, accuracy: 58 },
  { label: { ko: '인플레이션', en: 'Inflation' }, accuracy: 62 },
  { label: { ko: '시가총액', en: 'Market cap' }, accuracy: 67 },
];

export const NEED_HELP = ['Leo Park', 'Sam Torres'];

export const RECOMMENDATION: L<string[]> = {
  ko: [
    '다음 주 "금리" 집중 복습 퀴즈를 클래스에 배정',
    'Leo·Sam에게 AI 복습 문항 추가 제공',
    '잘하는 학생(Maya·Jordan)에게 고급 난이도 출제',
  ],
  en: [
    'Assign a focused "Interest rates" review quiz next week',
    'Give Leo & Sam extra AI review questions',
    'Raise difficulty for top students (Maya, Jordan)',
  ],
};

export const STR = {
  appTitle: { ko: '교사 대시보드', en: 'Teacher Dashboard' },
  teacher: { ko: 'Sam 선생님', en: 'Sam Teacher' },
  avgAccuracy: { ko: '평균 정답률', en: 'Avg. accuracy' },
  completion: { ko: '완료율', en: 'Completion' },
  onTrack: { ko: '목표 달성', en: 'On track' },
  rosterTitle: { ko: '학생 진도', en: 'Student progress' },
  weakTag: { ko: '약점', en: 'Weak' },

  reportTitle: { ko: 'AI 진도 리포트', en: 'AI progress report' },
  generateBtn: { ko: 'AI 리포트 생성', en: 'Generate AI report' },
  regenerate: { ko: '다시 생성', en: 'Regenerate' },
  generating: { ko: '생성 중…', en: 'Generating…' },
  statusAnalyzing: { ko: '반 전체 학습 데이터 분석 중…', en: 'Analysing class data…' },
  statusWriting: { ko: '리포트 작성 중…', en: 'Writing the report…' },
  reportEmpty: { ko: 'AI 리포트 생성을 누르면 반 진도 요약·약점·권고가 자동 작성됩니다', en: 'Generate to auto-write a class summary, weak concepts, and recommendations' },
  doneBadge: { ko: '리포트 완성 · 보호자 공유 가능', en: 'Report ready · shareable with guardians' },
  weakTitle: { ko: '반 약점 개념', en: 'Class weak concepts' },
  needHelpTitle: { ko: '도움이 필요한 학생', en: 'Students needing help' },
  recoTitle: { ko: '권고', en: 'Recommendations' },
  classOverview: { ko: '한눈에 보는 반 진도 + 자동 리포트', en: 'Class progress at a glance + auto report' },
} satisfies Record<string, L>;
