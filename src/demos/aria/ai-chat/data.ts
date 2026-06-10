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
      ko: '이 출재 건의 보유·한도 조건은?',
      en: "What are this cession's retention and limit?",
    },
    answer: {
      ko: {
        text: '본 건은 단체 정기보험(Term Life) 초과손해(XL) 재보험으로, 출재사 보유(Retention)는 ₩30억, 재보험 한도(Limit)는 ₩100억입니다.\n\nSum at Risk(SAR)는 약 ₩800억 규모이며, 한도와 보유는 1인당(per life) · 1사고당(per event) 기준으로 적용됩니다. 즉 단일 피보험자 또는 단일 집단사고에서 보유 ₩30억을 초과하는 손해를 ₩100억 한도까지 재보험사가 부담합니다.',
        evidence: [
          { label: '보종 (Line)', value: '단체 정기보험 XL', delta: 'Excess of Loss', positive: true },
          { label: 'Retention (보유)', value: '₩30억', delta: 'per life / per event', positive: true },
          { label: 'Limit (한도)', value: '₩100억', delta: '보유 초과분', positive: true },
          { label: 'Sum at Risk', value: '약 ₩800억', delta: 'TSI 기준', positive: true },
        ],
        source: 'Slip p.2 §Cover · Reinsurance Wording Art.3',
      },
      en: {
        text: 'This is a group term life excess-of-loss (XL) reinsurance, with a cedent retention of ₩3bn and a reinsurance limit of ₩10bn.\n\nThe Sum at Risk (SAR) is approximately ₩80bn. Limit and retention apply on a per-life and per-event basis: for any single insured life or a single catastrophe event, the reinsurer covers losses above the ₩3bn retention up to the ₩10bn limit.',
        evidence: [
          { label: 'Line', value: 'Group Term Life XL', delta: 'Excess of Loss', positive: true },
          { label: 'Retention', value: '₩3bn', delta: 'per life / per event', positive: true },
          { label: 'Limit', value: '₩10bn', delta: 'above retention', positive: true },
          { label: 'Sum at Risk', value: '~₩80bn', delta: 'TSI basis', positive: true },
        ],
        source: 'Slip p.2 §Cover · Reinsurance Wording Art.3',
      },
    },
  },
  {
    question: {
      ko: '보험기간과 담보 범위는?',
      en: 'What is the period and scope of cover?',
    },
    answer: {
      ko: {
        text: '보험기간은 2026.07.01부터 2027.06.30까지 1년이며, 출재사는 한화생명입니다.\n\n담보 범위는 단체 정기보험의 사망담보 초과손해로, 피보험 집단에서 발생한 사망보험금 중 보유(₩30억)를 초과하는 부분을 재보험사가 부담합니다. 1년 누적 기준으로 보장되며, 출재 방식은 XL(Excess of Loss) 구조입니다.',
        evidence: [
          { label: '보험기간 (Period)', value: '2026.07.01–2027.06.30', delta: '1년', positive: true },
          { label: '담보 (Cover)', value: '사망담보 초과손해', delta: 'Term Life death benefit', positive: true },
          { label: '출재방식 (Basis)', value: 'XL', delta: 'Excess of Loss', positive: true },
          { label: '출재사 (Cedent)', value: '한화생명', delta: 'Hanwha Life', positive: true },
        ],
        source: 'Slip p.1 §Period & Reassured',
      },
      en: {
        text: 'The period of cover runs one year, from 2026.07.01 to 2027.06.30, with Hanwha Life as the ceding company.\n\nCover is excess of loss on the death benefit of a group term life portfolio: the reinsurer pays death claims above the ₩3bn retention. Cover applies on a one-year aggregate basis under an excess-of-loss (XL) structure.',
        evidence: [
          { label: 'Period', value: '2026.07.01–2027.06.30', delta: '1 year', positive: true },
          { label: 'Cover', value: 'Death benefit XL', delta: 'Group term life', positive: true },
          { label: 'Basis', value: 'XL', delta: 'Excess of Loss', positive: true },
          { label: 'Cedent', value: 'Hanwha Life', delta: '한화생명', positive: true },
        ],
        source: 'Slip p.1 §Period & Reassured',
      },
    },
  },
  {
    question: {
      ko: '주요 면책·특별 조항은?',
      en: 'What are the key exclusions and special clauses?',
    },
    answer: {
      ko: {
        text: '주요 면책·특별 조항은 다음과 같습니다.\n\n자살은 계약(또는 부활) 후 2년 이내 발생 시 면책되며, 전쟁·테러·내란으로 인한 사망은 담보에서 제외됩니다. 집단사고(catastrophe)는 1사고당 한도가 적용되어 단일 사고에서 다수 사망이 발생하더라도 ₩100억 한도로 제한됩니다. 위험 직업·위험등급 가입자에 대해서는 별도 인수기준과 할증이 적용됩니다.',
        evidence: [
          { label: '자살 면책', value: '계약 후 2년', delta: '부활 시 재기산', positive: true },
          { label: '전쟁·테러', value: '면책', delta: 'War & Terrorism 제외', positive: false },
          { label: '집단사고 (Cat)', value: '1사고 한도', delta: '₩100억 cap', positive: true },
          { label: '직업·위험등급', value: '별도 인수기준', delta: '할증 적용', positive: true },
        ],
        source: 'Reinsurance Wording Art.7 §Exclusions & Special Conditions',
      },
      en: {
        text: 'The key exclusions and special clauses are as follows.\n\nSuicide is excluded if it occurs within 2 years of inception (or reinstatement). Death caused by war, terrorism or civil commotion is excluded. A catastrophe (single-event) limit applies, so even multiple deaths from one event are capped at the ₩10bn limit. Hazardous occupations and substandard risk classes are subject to separate underwriting terms and loadings.',
        evidence: [
          { label: 'Suicide exclusion', value: '2-year', delta: 'resets on reinstatement', positive: true },
          { label: 'War & terrorism', value: 'Excluded', delta: 'no cover', positive: false },
          { label: 'Catastrophe', value: 'Per-event cap', delta: '₩10bn limit', positive: true },
          { label: 'Occupation / class', value: 'Separate terms', delta: 'loadings apply', positive: true },
        ],
        source: 'Reinsurance Wording Art.7 §Exclusions & Special Conditions',
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
    text: '현재 연결된 한화생명 Term Life XL 슬립을 기준으로 답변드립니다. 보유·한도 조건, 보험기간·담보 범위, 면책·특별 조항 중 어떤 항목이 궁금하신가요?\n\n예: "이 출재 건의 보유·한도 조건은?"',
  },
  en: {
    text: 'I answer based on the connected Hanwha Life Term Life XL slip. Which would you like to explore — retention & limit, period & scope of cover, or exclusions & special clauses?\n\ne.g. "What are this cession\'s retention and limit?"',
  },
};

/** 앱 UI 문자열 */
export const STR = {
  newChat: { ko: '새 대화', en: 'New chat' },
  searchChats: { ko: '대화 검색', en: 'Search chats' },
  recentChats: { ko: '최근 대화', en: 'Recent chats' },
  userName: { ko: '김중개', en: 'J. Kim' },
  userRole: { ko: '재보험팀 · Broker', en: 'Reinsurance · Broker' },
  placeholder: { ko: '이 출재 슬립에 대해 질문하세요…', en: 'Ask about this cession slip…' },
  placeholderShort: { ko: '질문을 입력하세요…', en: 'Type a question…' },
  footerNote: {
    ko: '현재 문서: 한화생명 Term Life XL Slip 2026 (갱신 파이프라인 연동) · 모든 답변에 원문 인용이 함께 표시됩니다.',
    en: 'Source: Hanwha Life Term Life XL Slip 2026 (from renewal pipeline) · Every answer includes citations.',
  },
  emptyTitle: { ko: '연결된 출재 슬립에 물어보세요', en: 'Ask the connected cession slip' },
  emptySubtitle: {
    ko: '한화생명 Term Life XL Slip 기준으로 답변합니다',
    en: 'Answers are grounded in the Hanwha Life Term Life XL slip',
  },
  evidenceHeader: { ko: '원문 근거', en: 'Source evidence' },
  sourceConnecting: { ko: '갱신 파이프라인에서 문서 연결 중', en: 'Connecting document from renewal pipeline' },
  sourceReady: { ko: '문서 연결 완료', en: 'Document connected' },
  sourceReadyHint: { ko: '이제 이 슬립에 대해 질문할 수 있습니다', en: 'You can now ask about this slip' },
} satisfies Record<string, L>;

/** 사이드바 최근 대화 목록 */
export const HISTORY: L<string[]> = {
  ko: ['한화생명 Term Life XL', '단체 정기보험 XL 조건', '생명재보험 면책 조항', 'CI 출재 검토'],
  en: ['Hanwha Life Term Life XL', 'Group term life XL terms', 'Life reinsurance exclusions', 'CI cession review'],
};

/** ai-chat 소스 문서 — 인박스에서 갱신 파이프라인에 등록된 첨부파일 */
export const SOURCE_DOC = {
  file: 'HW_TermLife_XL_Slip_2026.pdf',
  label: { ko: '한화생명 Term Life XL', en: 'Hanwha Life Term Life XL' } as L,
};

/** 소스 연결 세팅 단계 — 파이프라인에서 불러오기 → 분석·인덱싱 */
export const SOURCE_STEPS: L[] = [
  { ko: '갱신 파이프라인에서 첨부파일 불러오기', en: 'Fetching attachment from renewal pipeline' },
  { ko: '문서 분석·인덱싱', en: 'Analyzing & indexing document' },
];
