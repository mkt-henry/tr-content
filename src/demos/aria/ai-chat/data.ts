import type { L, Lang } from '../_shared/i18n';

export interface Evidence {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}

export interface Answer {
  text: string;
  evidence?: Evidence[];
  source?: string;
}

/** 질문·답변 한 쌍 — 질문/답변 모두 언어별 버전을 가진다 */
export interface QAItem {
  question: L;
  answer: L<Answer>;
}

export const QA: QAItem[] = [
  {
    question: {
      ko: '이 특약의 사고당 한도와 면책금액은?',
      en: "What are this treaty's per-occurrence limit and retention?",
    },
    answer: {
      ko: {
        text: '본 Property Cat XoL 특약의 사고당 한도(per occurrence limit)는 ₩300억, 자기보유(retention)는 ₩60억입니다.\n\n연간 누적 한도(aggregate)는 ₩600억이며, Reinstatement는 연 2회 · 100% 추가보험료 조건입니다. 한도 산정은 Ultimate Net Loss 기준이고, 풍수해의 경우 Hours Clause 168시간이 적용됩니다.',
        evidence: [
          { label: '사고당 한도', value: '₩300억', delta: 'Per Occurrence', positive: true },
          { label: '자기보유 (Retention)', value: '₩60억', delta: 'UNL 기준', positive: true },
          { label: '연간 누적 한도', value: '₩600억', delta: 'Aggregate', positive: true },
          { label: 'Reinstatement', value: '2회', delta: '@100% A.P.', positive: true },
        ],
        source: 'Slip p.3 §Limits · Treaty Wording Art.4',
      },
      en: {
        text: 'This Property Cat XoL treaty carries a per-occurrence limit of ₩30bn with a retention of ₩6bn.\n\nThe annual aggregate limit is ₩60bn, with 2 reinstatements per year at 100% additional premium. Limits are calculated on an Ultimate Net Loss basis, and a 168-hour Hours Clause applies to windstorm events.',
        evidence: [
          { label: 'Per-occurrence limit', value: '₩30bn', delta: 'Per Occurrence', positive: true },
          { label: 'Retention', value: '₩6bn', delta: 'UNL basis', positive: true },
          { label: 'Annual aggregate', value: '₩60bn', delta: 'Aggregate', positive: true },
          { label: 'Reinstatement', value: '2×', delta: '@100% A.P.', positive: true },
        ],
        source: 'Slip p.3 §Limits · Treaty Wording Art.4',
      },
    },
  },
  {
    question: {
      ko: '최근 3년 클레임 이력을 요약해줘',
      en: 'Summarize the claims history for the last 3 years',
    },
    answer: {
      ko: {
        text: '최근 3년간 본 특약에서 접수된 클레임은 총 4건, 지급 보험금 합계는 ₩142억입니다.\n\n2023년 태풍 카눈 관련 2건(₩96억)이 가장 컸고, 2024년 공장 화재 1건(₩31억), 2025년 집중호우 1건(₩15억)입니다. 3년 평균 손해율은 66%로 상승 추세이며, 태풍 익스포저 누적이 주요 요인입니다.',
        evidence: [
          { label: '클레임 건수 (3년)', value: '4건', delta: '지급 완료 3 · 진행 1', positive: true },
          { label: '지급 보험금 합계', value: '₩142억', delta: '태풍 카눈 ₩96억 포함', positive: false },
          { label: '3년 평균 손해율', value: '66%', delta: "'25년 74%로 상승", positive: false },
        ],
        source: 'Claims Bordereaux 2023–2025 · 분기 정산서',
      },
      en: {
        text: 'Over the last 3 years this treaty recorded 4 claims totalling ₩14.2bn in paid losses.\n\nThe largest were 2 claims from Typhoon Khanun in 2023 (₩9.6bn), followed by a factory fire in 2024 (₩3.1bn) and torrential flooding in 2025 (₩1.5bn). The 3-year average loss ratio is 66% and trending upward, driven mainly by accumulating typhoon exposure.',
        evidence: [
          { label: 'Claims (3 yrs)', value: '4', delta: '3 paid · 1 open', positive: true },
          { label: 'Total paid losses', value: '₩14.2bn', delta: 'incl. Khanun ₩9.6bn', positive: false },
          { label: '3-yr avg loss ratio', value: '66%', delta: "rising to 74% in '25", positive: false },
        ],
        source: 'Claims Bordereaux 2023–2025 · Quarterly statements',
      },
    },
  },
  {
    question: {
      ko: 'Hours Clause 조건은 어떻게 돼?',
      en: 'What are the Hours Clause terms?',
    },
    answer: {
      ko: {
        text: 'Hours Clause는 풍수해(windstorm) 기준 연속 168시간입니다.\n\n하나의 사고(loss occurrence)로 간주되는 손해의 시간적 범위를 정하는 조항으로, 168시간 내 발생한 동일 원인 손해는 1건의 사고로 합산되어 사고당 한도와 자기보유가 1회만 적용됩니다. 지진의 경우 별도로 72시간이 적용됩니다.',
        evidence: [
          { label: '풍수해 (Windstorm)', value: '168시간', delta: '연속 기준', positive: true },
          { label: '지진 (Earthquake)', value: '72시간', delta: '연속 기준', positive: true },
          { label: '적용 기준', value: '동일 원인', delta: '1 Loss Occurrence 합산', positive: true },
        ],
        source: 'Treaty Wording Art.6 §Hours Clause',
      },
      en: {
        text: 'The Hours Clause is 168 consecutive hours for windstorm.\n\nIt defines the time window within which losses count as a single loss occurrence: same-cause losses within 168 hours are aggregated into one occurrence, so the per-occurrence limit and retention apply only once. Earthquake carries a separate 72-hour clause.',
        evidence: [
          { label: 'Windstorm', value: '168 hrs', delta: 'consecutive', positive: true },
          { label: 'Earthquake', value: '72 hrs', delta: 'consecutive', positive: true },
          { label: 'Aggregation basis', value: 'Same cause', delta: 'one loss occurrence', positive: true },
        ],
        source: 'Treaty Wording Art.6 §Hours Clause',
      },
    },
  },
];

/** 현재 언어의 추천 질문 목록 */
export function suggested(lang: Lang): string[] {
  return QA.map((q) => q.question[lang]);
}

export const FALLBACK: L<Answer> = {
  ko: {
    text: '해당 질문은 현재 선택된 Korean Re Property Cat XoL 특약 문서를 기준으로 답변드릴 수 있습니다. 한도, 면책, 클레임 이력, 특별 조항 중 어떤 항목이 궁금하신가요?\n\n예: "이 특약의 사고당 한도와 면책금액은?"',
  },
  en: {
    text: 'I can answer that based on the currently selected Korean Re Property Cat XoL treaty documents. Which would you like to explore — limits, retention, claims history, or special clauses?\n\ne.g. "What are this treaty\'s per-occurrence limit and retention?"',
  },
};

/** 앱 UI 문자열 */
export const STR = {
  newChat: { ko: '새 대화', en: 'New chat' },
  searchChats: { ko: '대화 검색', en: 'Search chats' },
  recentChats: { ko: '최근 대화', en: 'Recent chats' },
  userName: { ko: '김중개', en: 'J. Kim' },
  userRole: { ko: '재보험팀 · Broker', en: 'Reinsurance · Broker' },
  placeholder: { ko: '특약·클레임 문서에 대해 질문하세요…', en: 'Ask about treaty & claims documents…' },
  placeholderShort: { ko: '질문을 입력하세요…', en: 'Type a question…' },
  footerNote: {
    ko: '현재 문서: Korean Re Property Cat XoL Slip 2026 · 모든 답변에 원문 인용이 함께 표시됩니다.',
    en: 'Current document: Korean Re Property Cat XoL Slip 2026 · Every answer includes source citations.',
  },
  emptyTitle: { ko: '계약·클레임 문서에 물어보세요', en: 'Ask your treaty & claims documents' },
  emptySubtitle: {
    ko: 'Korean Re Property Cat XoL Slip 기준으로 답변합니다',
    en: 'Answers are grounded in the Korean Re Property Cat XoL Slip',
  },
  evidenceHeader: { ko: '원문 근거', en: 'Source evidence' },
} satisfies Record<string, L>;

/** 사이드바 최근 대화 목록 */
export const HISTORY: L<string[]> = {
  ko: ['Korean Re Cat XoL 특약', 'KB Marine Hull 갱신', '태풍 카눈 클레임', 'Casualty Wording 검토'],
  en: ['Korean Re Cat XoL Treaty', 'KB Marine Hull renewal', 'Typhoon Khanun claims', 'Casualty wording review'],
};
