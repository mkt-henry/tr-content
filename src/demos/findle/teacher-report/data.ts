import type { L } from '../_shared/i18n';

export interface WeakConcept {
  label: L;
  accuracy: number;
}

export interface Student {
  name: string;
  rank: number; // 반 내 순위 (1 = 최상위)
  progress: number; // 완료율 %
  accuracy: number; // 정답률 %
  trend: number[]; // 6주 정답률 추이
  mastery: number[]; // 개념별 숙련도 (CONCEPTS 순서)
  coaching: L; // AI 코칭 노트 (스트리밍)
  lastActive: L; // 최근 활동
  recent: { c: number; score: number }[]; // 최근 학습 (개념 인덱스 + 점수)
}

/** data-demo-id 용 슬러그 (예: 'Leo Park' → 'leo-park') */
export const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

/** 레이더 5축 — 핵심 금융 개념 */
export const CONCEPTS: { label: L; short: L }[] = [
  { label: { ko: '금리', en: 'Interest rates' }, short: { ko: '금리', en: 'Rates' } },
  { label: { ko: '인플레이션', en: 'Inflation' }, short: { ko: '인플레', en: 'Inflation' } },
  { label: { ko: '시가총액', en: 'Market cap' }, short: { ko: '시총', en: 'Mkt cap' } },
  { label: { ko: '주식·기업', en: 'Stocks' }, short: { ko: '주식', en: 'Stocks' } },
  { label: { ko: '채권', en: 'Bonds' }, short: { ko: '채권', en: 'Bonds' } },
];

export const ROSTER: Student[] = [
  {
    name: 'Maya Chen',
    rank: 1,
    progress: 96,
    accuracy: 92,
    trend: [82, 85, 88, 90, 91, 92],
    mastery: [90, 92, 88, 95, 94],
    coaching: {
      ko: 'Maya는 모든 단원에서 뛰어난 성취를 보입니다. 흥미를 유지하도록 고급 난이도 문항을 추가로 배정하는 것을 권장합니다.',
      en: 'Maya is excelling across every unit. Assign advanced-difficulty questions to keep her challenged and engaged.',
    },
    lastActive: { ko: '오늘', en: 'Today' },
    recent: [{ c: 3, score: 96 }, { c: 4, score: 92 }, { c: 1, score: 90 }],
  },
  {
    name: 'Jordan Lee',
    rank: 2,
    progress: 90,
    accuracy: 85,
    trend: [78, 80, 82, 84, 84, 85],
    mastery: [82, 84, 70, 90, 86],
    coaching: {
      ko: '전반적으로 우수하나 시가총액 계산에서 가끔 실수가 있습니다. 짧은 복습 문항 한 세트면 격차를 좁힐 수 있습니다.',
      en: 'Strong overall, with occasional slips on market-cap calculations. One short refresher set will close the gap.',
    },
    lastActive: { ko: '오늘', en: 'Today' },
    recent: [{ c: 3, score: 90 }, { c: 2, score: 70 }, { c: 4, score: 86 }],
  },
  {
    name: 'Alex Kim',
    rank: 3,
    progress: 84,
    accuracy: 78,
    trend: [70, 72, 74, 76, 77, 78],
    mastery: [72, 64, 80, 85, 78],
    coaching: {
      ko: '꾸준히 향상되고 있습니다. 다음 단원 전에 인플레이션 개념을 한 번 더 다지면 좋겠습니다.',
      en: 'Making steady progress. Reinforce inflation concepts once more before the next unit.',
    },
    lastActive: { ko: '어제', en: 'Yesterday' },
    recent: [{ c: 1, score: 64 }, { c: 3, score: 85 }, { c: 2, score: 80 }],
  },
  {
    name: 'Tara Kim',
    rank: 4,
    progress: 80,
    accuracy: 74,
    trend: [68, 70, 71, 72, 73, 74],
    mastery: [62, 74, 76, 82, 70],
    coaching: {
      ko: '목표 진도에 있지만 금리 문항이 아직 불안정합니다. 금리 집중 복습 세트 한 개를 권장합니다.',
      en: 'On track, but interest-rate questions remain shaky. One targeted rate-review set is recommended.',
    },
    lastActive: { ko: '어제', en: 'Yesterday' },
    recent: [{ c: 0, score: 62 }, { c: 3, score: 82 }, { c: 4, score: 70 }],
  },
  {
    name: 'Sam Torres',
    rank: 5,
    progress: 70,
    accuracy: 68,
    trend: [60, 63, 62, 65, 66, 68],
    mastery: [55, 60, 66, 74, 68],
    coaching: {
      ko: 'Sam은 반 평균보다 낮고 진도가 더딥니다. 금리·인플레이션 중심의 짝 복습 세션과 AI 추가 연습을 권장합니다.',
      en: 'Sam is below the class average and progressing slowly. Recommend paired review sessions plus extra AI practice on rates and inflation.',
    },
    lastActive: { ko: '2일 전', en: '2 days ago' },
    recent: [{ c: 0, score: 55 }, { c: 1, score: 60 }, { c: 4, score: 68 }],
  },
  {
    name: 'Leo Park',
    rank: 6,
    progress: 58,
    accuracy: 55,
    trend: [40, 44, 42, 50, 53, 55],
    mastery: [45, 52, 60, 66, 58],
    coaching: {
      ko: 'Leo는 매주 조금씩 나아지고 있지만 여전히 반 평균에 못 미치며, 특히 금리 문항에서 어려움을 겪습니다. 이번 주 금리 집중 AI 복습 세션 2개를 배정한 뒤 재평가하는 것을 권장합니다.',
      en: 'Leo is improving week over week but still trails the class, mainly on interest-rate questions. Assign two short AI review sessions on rates this week, then re-test.',
    },
    lastActive: { ko: '3일 전', en: '3 days ago' },
    recent: [{ c: 0, score: 40 }, { c: 1, score: 52 }, { c: 2, score: 60 }],
  },
];

export const findStudent = (name: string) => ROSTER.find((s) => s.name === name);

/** 반 평균 개념 숙련도 (레이더 비교선용) */
export const CLASS_MASTERY: number[] = CONCEPTS.map((_, i) =>
  Math.round(ROSTER.reduce((sum, s) => sum + s.mastery[i], 0) / ROSTER.length),
);

/** 숙련도 배열 → 강점(상위)·약점(하위) 개념 분해 */
export function conceptBreakdown(mastery: number[], weakN = 3, strongN = 2) {
  const arr = CONCEPTS.map((c, i) => ({ label: c.label, accuracy: mastery[i] }));
  const asc = [...arr].sort((a, b) => a.accuracy - b.accuracy);
  return { weak: asc.slice(0, weakN), strong: [...asc].reverse().slice(0, strongN) };
}

const classBreak = conceptBreakdown(CLASS_MASTERY);
export const WEAK_CONCEPTS: WeakConcept[] = classBreak.weak;
export const STRONG_CONCEPTS: WeakConcept[] = classBreak.strong;

export const CLASS = {
  name: { ko: '금융 101 · 3교시', en: 'Finance 101 · Period 3' } as L,
  avgAccuracy: 75,
  completion: 82,
  students: 6,
  onTrack: 4,
  participation: 94, // 주간 참여율 %
};

/** AI 리포트 요약 본문 (스트리밍) */
export const REPORT_SUMMARY: L = {
  ko: '이번 주 금융 101 3교시 반은 평균 정답률 75%, 완료율 82%, 주간 참여율 94%를 기록했습니다. 6명 중 4명이 목표 진도를 달성했고, "주식·기업"과 "채권" 단원은 반 전체가 잘 이해하고 있습니다.\n\n다만 "금리"와 "인플레이션" 개념에서 반 전체 숙련도가 낮아, 다음 주 집중 복습이 필요합니다.',
  en: 'This week the Finance 101 (Period 3) class averaged 75% accuracy, 82% completion, and 94% weekly participation. 4 of 6 students are on track, and the "Stocks" and "Bonds" units are well understood class-wide.\n\nHowever, class-wide mastery is low on "Interest rates" and "Inflation," so a focused review is recommended next week.',
};

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

/** 시나리오 줌 캡션 */
export const SPOTLIGHT = {
  glance: { ko: '반 전체를 한눈에', en: 'Whole class at a glance' },
  generate: { ko: '한 번 클릭 → AI가 반 리포트 작성', en: 'One click → AI writes the class report' },
  weak: { ko: '반 강점·약점 자동 분석', en: 'Auto-analysed strengths & weaknesses' },
  needHelp: { ko: '도움이 필요한 학생 · 실행 권고', en: 'Who needs help · next steps' },
  sendAll: { ko: '전 학생에게 맞춤 리포트 자동 발송', en: 'Auto-send personalized reports to all' },
  dispatchDone: { ko: '전 학생·보호자에게 발송 완료', en: 'Delivered to every student & guardian' },
  drill: { ko: '학생 리포트 열기', en: 'Open a full student report' },
  radar: { ko: '개념 숙련도 · 반 평균 대비 강·약점', en: 'Concept mastery vs class average' },
  trend: { ko: '주별 정답률 추이', en: 'Accuracy trend over time' },
  strengths: { ko: '개인 강점·약점 개념', en: 'Personal strengths & weaknesses' },
  coaching: { ko: '학생 맞춤 AI 코칭', en: 'AI coaching tailored to the student' },
  sendGuardian: { ko: '보호자에게 리포트 발송', en: 'Send this report to the guardian' },
} satisfies Record<string, L>;

export const STR = {
  appTitle: { ko: '교사 대시보드', en: 'Teacher Dashboard' },
  teacher: { ko: 'Sam 선생님', en: 'Sam Teacher' },
  avgAccuracy: { ko: '평균 정답률', en: 'Avg. accuracy' },
  completion: { ko: '완료율', en: 'Completion' },
  onTrack: { ko: '목표 달성', en: 'On track' },
  participation: { ko: '주간 참여율', en: 'Participation' },
  rosterTitle: { ko: '학생 진도 · 클릭해 리포트 열기', en: 'Student progress · click to open report' },

  reportTitle: { ko: 'AI 반 진도 리포트', en: 'AI class report' },
  generateBtn: { ko: 'AI 리포트 생성', en: 'Generate AI report' },
  statusAnalyzing: { ko: '반 전체 학습 데이터 분석 중…', en: 'Analysing class data…' },
  statusWriting: { ko: '리포트 작성 중…', en: 'Writing the report…' },
  reportEmpty: { ko: 'AI 리포트 생성을 누르면 반 진도 요약·강점·약점·권고가 자동 작성됩니다', en: 'Generate to auto-write a class summary, strengths, weak concepts, and recommendations' },
  weakTitle: { ko: '반 약점 개념', en: 'Class weak concepts' },
  strongTitle: { ko: '반 강점 개념', en: 'Class strengths' },
  needHelpTitle: { ko: '도움이 필요한 학생', en: 'Students needing help' },
  recoTitle: { ko: '권고', en: 'Recommendations' },
  exportBtn: { ko: 'PDF', en: 'PDF' },
  sendAllBtn: { ko: '전 학생 리포트 발송', en: 'Send reports to all' },

  // 학생 모달
  studentReport: { ko: '학생 리포트', en: 'Student report' },
  atRisk: { ko: '도움 필요', en: 'At risk' },
  onTrackBadge: { ko: '양호', en: 'On track' },
  detailAccuracy: { ko: '정답률', en: 'Accuracy' },
  detailCompletion: { ko: '완료율', en: 'Completion' },
  rankLabel: { ko: '반 순위', en: 'Class rank' },
  lastActiveLabel: { ko: '최근 활동', en: 'Last active' },
  conceptMastery: { ko: '개념별 숙련도', en: 'Concept mastery' },
  radarStudent: { ko: '학생', en: 'Student' },
  radarClass: { ko: '반 평균', en: 'Class avg' },
  trendTitle: { ko: '정답률 추이 · 6주', en: 'Accuracy trend · 6 wks' },
  strengthsTitle: { ko: '강점 개념', en: 'Strengths' },
  studentWeakTitle: { ko: '약점 개념', en: 'Weak concepts' },
  coachingTitle: { ko: 'AI 코칭', en: 'AI coaching' },
  statusCoaching: { ko: '학생 학습 이력 분석 중…', en: 'Analysing student history…' },
  recentTitle: { ko: '최근 학습', en: 'Recent activity' },
  assignBtn: { ko: '복습 퀴즈 배정', en: 'Assign review quiz' },
  sendReportBtn: { ko: '보호자에게 리포트 발송', en: 'Send report to guardian' },

  // 발송 모달
  dispatchTitle: { ko: '학생 리포트 자동 발송', en: 'Send student reports' },
  dispatchIntro: { ko: 'AI가 학생별 맞춤 리포트를 생성했습니다. 학생과 보호자에게 발송합니다.', en: 'AI generated a personalized report for each student — sending to students & guardians.' },
  dispatchSending: { ko: '발송 중…', en: 'Sending…' },
  dispatchSent: { ko: '발송됨', en: 'Sent' },
  dispatchQueued: { ko: '대기', en: 'Queued' },
  dispatchDone: { ko: '{n}명에게 맞춤 리포트를 발송했습니다', en: '{n} personalized reports sent to students & guardians' },
  doneBtn: { ko: '완료', en: 'Done' },
  closeLabel: { ko: '닫기', en: 'Close' },

  // 토스트
  noticeAssigned: { ko: '복습 퀴즈를 배정했습니다', en: 'Review quiz assigned' },
  noticeSentGuardian: { ko: '보호자에게 리포트를 발송했습니다', en: 'Report sent to guardian' },
} satisfies Record<string, L>;
