import type { L, Lang } from '../_shared/i18n';

/** 근거 KPI 셀 */
export interface Evidence {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}

/** 종목 비교 표 한 행 */
export interface CompareRow {
  name: string;
  ticker: string;
  cells: string[];
}

/** 종목 비교 표 (헤더 + 행) */
export interface CompareTable {
  columns: L<string[]>;
  rows: CompareRow[];
}

/** 삼성전자 5년 실적 차트 한 포인트 */
export interface PerfPoint {
  year: string;
  revenue: number; // 조 원
  profit: number; // 조 원
}

export interface Answer {
  text: string;
  evidence?: Evidence[];
  table?: CompareTable;
  chart?: PerfPoint[];
  source?: string;
}

/** 질문·답변 한 쌍 — 질문/답변 모두 언어별 버전을 가진다 */
export interface QAItem {
  question: L;
  answer: L<Answer>;
}

/** 삼성전자 5년 실적 (매출/영업이익, 단위: 조 원) */
const SEC_PERF: PerfPoint[] = [
  { year: '2021', revenue: 279, profit: 52 },
  { year: '2022', revenue: 302, profit: 43 },
  { year: '2023', revenue: 258, profit: 6.6 },
  { year: '2024', revenue: 259, profit: 28 },
  { year: '2025', revenue: 268, profit: 33 },
];

export const QA: QAItem[] = [
  {
    question: {
      ko: '삼성전자 실적 어때?',
      en: 'How is Samsung Electronics doing?',
    },
    answer: {
      ko: {
        text: '삼성전자(005930)의 최근 5년 매출은 258조~302조 원 사이에서 등락했고, 영업이익은 2023년 반도체 다운사이클로 6.6조 원까지 급감했습니다.\n\n다만 2024~2025년에는 메모리 업황 회복으로 영업이익이 28조 → 33조 원으로 강한 회복세를 보였습니다. 현재 PER 12.4배, ROE 8.7%로 동종 대비 밸류에이션 부담은 낮은 편입니다.',
        chart: SEC_PERF,
        evidence: [
          { label: '현재가', value: '58,400원', delta: '시총 348.5조', positive: true },
          { label: '2025 영업이익', value: '33조', delta: 'YoY +17.9%', positive: true },
          { label: 'PER', value: '12.4배', delta: '업종 평균 하회', positive: true },
          { label: 'ROE', value: '8.7%', delta: '회복 구간', positive: true },
        ],
        source: 'DART 사업보고서 2021–2025 · 컨센서스 종합',
      },
      en: {
        text: "Samsung Electronics (005930) posted revenue between KRW 258tn and 302tn over the past five years, while operating profit plunged to KRW 6.6tn in 2023 amid the semiconductor downcycle.\n\nHowever, 2024–2025 showed a strong recovery as the memory cycle turned, with operating profit climbing from KRW 28tn to 33tn. At a PER of 12.4x and ROE of 8.7%, valuation remains undemanding versus peers.",
        chart: SEC_PERF,
        evidence: [
          { label: 'Price', value: 'KRW 58,400', delta: 'Mkt cap 348.5tn', positive: true },
          { label: '2025 Op. profit', value: 'KRW 33tn', delta: 'YoY +17.9%', positive: true },
          { label: 'PER', value: '12.4x', delta: 'below sector avg', positive: true },
          { label: 'ROE', value: '8.7%', delta: 'recovering', positive: true },
        ],
        source: 'DART filings 2021–2025 · Consensus',
      },
    },
  },
  {
    question: {
      ko: '네이버 vs 카카오 영업이익률 비교해줘',
      en: 'Compare operating margins: Naver vs Kakao',
    },
    answer: {
      ko: {
        text: '네이버(035420)는 카카오(035720) 대비 영업이익률에서 꾸준히 우위를 보입니다. 네이버 영업이익률은 약 16%대인 반면 카카오는 한 자릿수 중반에 머물러 있습니다.\n\n네이버는 검색·커머스의 높은 마진 구조가, 카카오는 신사업 투자 부담이 수익성 격차의 핵심 요인입니다.',
        table: {
          columns: {
            ko: ['종목', '영업이익률', 'PER', 'ROE'],
            en: ['Name', 'Op. margin', 'PER', 'ROE'],
          },
          rows: [
            { name: '네이버', ticker: '035420', cells: ['16.3%', '22.1배', '11.2%'] },
            { name: '카카오', ticker: '035720', cells: ['5.4%', '38.6배', '3.1%'] },
          ],
        },
        evidence: [
          { label: '영업이익률 격차', value: '+10.9%p', delta: '네이버 우위', positive: true },
          { label: '네이버 PER', value: '22.1배', delta: '시총 35.0조', positive: true },
          { label: '카카오 수익성', value: '5.4%', delta: '신사업 부담', positive: false },
        ],
        source: '각사 사업보고서 2025 · 분기 실적 종합',
      },
      en: {
        text: 'Naver (035420) consistently outpaces Kakao (035720) on operating margin. Naver runs around 16% while Kakao sits in the mid-single digits.\n\nNaver benefits from high-margin search and commerce, whereas Kakao’s heavy new-business investment weighs on profitability — the core driver of the gap.',
        table: {
          columns: {
            ko: ['종목', '영업이익률', 'PER', 'ROE'],
            en: ['Name', 'Op. margin', 'PER', 'ROE'],
          },
          rows: [
            { name: 'Naver', ticker: '035420', cells: ['16.3%', '22.1x', '11.2%'] },
            { name: 'Kakao', ticker: '035720', cells: ['5.4%', '38.6x', '3.1%'] },
          ],
        },
        evidence: [
          { label: 'Margin gap', value: '+10.9pp', delta: 'Naver leads', positive: true },
          { label: 'Naver PER', value: '22.1x', delta: 'Mkt cap 35.0tn', positive: true },
          { label: 'Kakao margin', value: '5.4%', delta: 'investment drag', positive: false },
        ],
        source: 'Company filings 2025 · Quarterly results',
      },
    },
  },
  {
    question: {
      ko: '반도체 업종 투자 매력도는?',
      en: 'How attractive is the semiconductor sector?',
    },
    answer: {
      ko: {
        text: '반도체 업종은 메모리 업황 반등과 HBM 수요 확대로 투자 매력도가 높아지는 구간입니다. 특히 SK하이닉스(000660)는 ROE 28.4%, PER 7.2배로 고수익·저밸류 조합이 돋보입니다.\n\n삼성전자는 회복 초입 구간으로 밸류에이션 부담이 낮고, 업종 전반의 이익 모멘텀이 2025년 들어 우상향하고 있습니다.',
        table: {
          columns: {
            ko: ['종목', '현재가', 'PER', 'ROE'],
            en: ['Name', 'Price', 'PER', 'ROE'],
          },
          rows: [
            { name: 'SK하이닉스', ticker: '000660', cells: ['198,500원', '7.2배', '28.4%'] },
            { name: '삼성전자', ticker: '005930', cells: ['58,400원', '12.4배', '8.7%'] },
          ],
        },
        evidence: [
          { label: 'SK하이닉스 ROE', value: '28.4%', delta: '업종 최상위', positive: true },
          { label: 'SK하이닉스 PER', value: '7.2배', delta: '시총 144.5조', positive: true },
          { label: '업종 이익 모멘텀', value: '회복', delta: 'HBM 수요 견인', positive: true },
        ],
        source: '업종 리서치 2025 · 컨센서스 종합',
      },
      en: {
        text: 'The semiconductor sector is growing more attractive as the memory cycle rebounds and HBM demand expands. SK hynix (000660) stands out with a 28.4% ROE against a 7.2x PER — a rare high-return, low-valuation mix.\n\nSamsung Electronics sits at the start of its recovery with undemanding multiples, and sector-wide earnings momentum has turned upward through 2025.',
        table: {
          columns: {
            ko: ['종목', '현재가', 'PER', 'ROE'],
            en: ['Name', 'Price', 'PER', 'ROE'],
          },
          rows: [
            { name: 'SK hynix', ticker: '000660', cells: ['KRW 198,500', '7.2x', '28.4%'] },
            { name: 'Samsung', ticker: '005930', cells: ['KRW 58,400', '12.4x', '8.7%'] },
          ],
        },
        evidence: [
          { label: 'SK hynix ROE', value: '28.4%', delta: 'sector top', positive: true },
          { label: 'SK hynix PER', value: '7.2x', delta: 'Mkt cap 144.5tn', positive: true },
          { label: 'Earnings momentum', value: 'Rebound', delta: 'HBM-driven', positive: true },
        ],
        source: 'Sector research 2025 · Consensus',
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
    text: '종목·재무·뉴스에 대해 자연어로 물어보시면 데이터 근거와 함께 답변드립니다. 실적, 밸류에이션, 업종 비교 중 어떤 것이 궁금하신가요?\n\n예: "삼성전자 실적 어때?"',
  },
  en: {
    text: 'Ask me anything about stocks, financials, or news and I’ll answer with grounded data. Would you like earnings, valuation, or a sector comparison?\n\ne.g. "How is Samsung Electronics doing?"',
  },
};

/** 앱 UI 문자열 */
export const STR = {
  newAnalysis: { ko: '새 분석', en: 'New analysis' },
  recentChats: { ko: '최근 대화', en: 'Recent' },
  userName: { ko: '박보현', en: 'B. Park' },
  userRole: { ko: '리서치 · Analyst', en: 'Research · Analyst' },
  placeholder: { ko: '종목·재무·뉴스를 자연어로 물어보세요…', en: 'Ask about stocks, financials, or news…' },
  placeholderShort: { ko: '질문을 입력하세요…', en: 'Type a question…' },
  footerNote: {
    ko: 'AlphaLenz는 데이터 근거와 출처를 함께 제시합니다 · 투자 판단은 본인 책임입니다.',
    en: 'AlphaLenz cites data and sources with every answer · Not investment advice.',
  },
  emptyTitle: { ko: '무엇이든 물어보세요', en: 'Ask anything about the market' },
  emptySubtitle: {
    ko: '종목·재무·뉴스를 데이터 근거와 차트로 답합니다',
    en: 'Answers grounded in data, charts, and sources',
  },
  evidenceHeader: { ko: '데이터 근거', en: 'Data evidence' },
  chartTitle: { ko: '삼성전자 5년 실적 (조 원)', en: 'Samsung 5-yr results (KRW tn)' },
  legendRevenue: { ko: '매출', en: 'Revenue' },
  legendProfit: { ko: '영업이익', en: 'Op. profit' },
} satisfies Record<string, L>;

/** 사이드바 최근 대화 목록 */
export const HISTORY: L<string[]> = {
  ko: ['삼성전자 실적 분석', '2차전지 업종 점검', 'AI 반도체 밸류에이션', '네이버 vs 카카오'],
  en: ['Samsung earnings', 'Battery sector check', 'AI chip valuation', 'Naver vs Kakao'],
};
