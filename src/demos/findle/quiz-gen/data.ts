import type { L } from '../_shared/i18n';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'mixed';

export const DIFFICULTIES: { id: Difficulty; label: L }[] = [
  { id: 'beginner', label: { ko: '초급', en: 'Beginner' } },
  { id: 'intermediate', label: { ko: '중급', en: 'Intermediate' } },
  { id: 'advanced', label: { ko: '고급', en: 'Advanced' } },
  { id: 'mixed', label: { ko: '혼합 (전 범위)', en: 'Mixed (full range)' } },
];

export const COUNTS = [3, 5, 8];

/** 교사가 붙여넣는 샘플 뉴스 */
export const ARTICLE = {
  url: 'finance.news/nvidia-record-q',
  title: {
    ko: '엔비디아, AI 칩 수요로 사상 최대 분기 매출',
    en: 'Nvidia posts record quarterly revenue on AI chip demand',
  } as L,
  source: { ko: 'Findle 뉴스', en: 'Findle News' } as L,
};

export interface GenQuestion {
  level: Difficulty;
  question: L;
  options: L<string[]>;
  correctIndex: number;
  explanation: L;
}

/** AI가 기사에서 생성한 개념 문항 (난이도 초→고) */
export const GENERATED: GenQuestion[] = [
  {
    level: 'beginner',
    question: { ko: "기업의 '매출(revenue)'은 무엇일까요?", en: "What is a company's 'revenue'?" },
    options: {
      ko: ['제품·서비스를 팔아 번 총금액', '직원에게 준 월급', '세금으로 낸 돈', '주식의 가격'],
      en: ['Total money earned from sales', 'Salaries paid to staff', 'Money paid as tax', 'The price of a share'],
    },
    correctIndex: 0,
    explanation: {
      ko: '매출은 기업이 제품·서비스를 팔아 벌어들인 총금액입니다. 비용을 빼기 전 수치예요.',
      en: 'Revenue is the total money a company earns from selling its products or services, before costs.',
    },
  },
  {
    level: 'intermediate',
    question: { ko: '수요가 공급보다 크게 늘면 가격은 보통 어떻게 될까요?', en: 'If demand rises well above supply, prices usually…' },
    options: {
      ko: ['오르는 경향이 있다', '항상 0이 된다', '반드시 내린다', '변하지 않는다'],
      en: ['Tend to rise', 'Always become zero', 'Must fall', 'Never change'],
    },
    correctIndex: 0,
    explanation: {
      ko: 'AI 칩처럼 수요가 공급을 크게 웃돌면 가격과 매출이 오르는 경향이 있습니다.',
      en: 'When demand far exceeds supply — as with AI chips — prices and revenue tend to rise.',
    },
  },
  {
    level: 'advanced',
    question: { ko: "'시가총액'은 어떻게 계산할까요?", en: 'How is market capitalization calculated?' },
    options: {
      ko: ['주가 × 발행 주식 수', '매출 ÷ 직원 수', '자산 + 부채', '주가 + 배당금'],
      en: ['Share price × shares outstanding', 'Revenue ÷ employees', 'Assets + liabilities', 'Share price + dividend'],
    },
    correctIndex: 0,
    explanation: {
      ko: '시가총액 = 현재 주가 × 발행 주식 수. 기업의 시장 가치를 나타냅니다.',
      en: 'Market cap = current share price × shares outstanding — the market value of the company.',
    },
  },
];

export const STR = {
  appTitle: { ko: 'AI 퀴즈 생성기', en: 'Quiz Generator' },
  subtitle: { ko: '최신 금융 뉴스로 만드는 AI 퀴즈', en: 'AI-powered quiz from current finance news' },
  teacher: { ko: 'Sam 선생님', en: 'Sam Teacher' },
  urlLabel: { ko: '뉴스 URL', en: 'News URL' },
  required: { ko: '필수', en: 'Required' },
  countLabel: { ko: '문항 수', en: 'Question count' },
  difficultyLabel: { ko: '난이도', en: 'Difficulty' },
  countUnit: { ko: '{n}문항', en: '{n} Questions' },
  generateBtn: { ko: 'AI로 생성', en: 'Generate with AI' },
  regenerate: { ko: '다시 생성', en: 'Regenerate' },
  generating: { ko: '생성 중…', en: 'Generating…' },
  statusReading: { ko: '기사 분석 중…', en: 'Reading the article…' },
  statusGenerating: { ko: '개념 문항 생성 중…', en: 'Writing concept questions…' },
  statusDone: { ko: '{n}문항 생성 완료 · 검토 후 저장', en: '{n} questions ready · review & save' },
  emptyTitle: { ko: 'AI 문항 생성 준비됨', en: 'Ready to Generate AI Questions' },
  emptyBody: {
    ko: '왼쪽에 뉴스 URL을 넣고 생성을 누르면, AI가 기사를 읽고 핵심 개념 문항을 작성합니다.',
    en: 'Paste a news URL on the left and press Generate. The AI reads the article and writes quiz questions about the underlying concepts.',
  },
  answerLabel: { ko: '정답', en: 'Answer' },
  saveBtn: { ko: '퀴즈 저장 · 클래스 배정', en: 'Save quiz · assign to class' },
  tipsTitle: { ko: '사용 팁', en: 'Usage tips' },
  tips: {
    ko: [
      '금융 뉴스 기사 URL을 붙여넣으면 — AI가 기사를 읽고 개념 문항을 만듭니다',
      '난이도(초급/중급/고급/혼합)로 학생 수준에 맞춰 출제',
      '생성된 문항은 저장 전에 편집하거나 추가할 수 있어요',
    ],
    en: [
      'Paste a finance news URL — the AI reads it and writes concept questions',
      'Set difficulty (Beginner / Intermediate / Advanced / Mixed) to match your class',
      'Generated questions can be edited or added to before saving',
    ],
  } as L<string[]>,
} satisfies Record<string, L | L<string[]>>;
