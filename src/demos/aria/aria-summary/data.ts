import type { L } from '../_shared/i18n';

export interface Clause {
  id: string;
  section: string;
  text: string;
}

/**
 * 좌측 영문 원문 슬립 (발췌 6문단).
 * 슬립 원문은 양 언어 공통(영어 유지) — "영문 슬립을 구조화 요약"이라는 컨셉상 원문은 번역하지 않는다.
 */
export const CLAUSES: Clause[] = [
  {
    id: 's1',
    section: '§1 REINSURED',
    text: 'Korean Reinsurance Company, Seoul, Republic of Korea (hereinafter referred to as the "Reinsured"), in respect of its head office and all branch offices.',
  },
  {
    id: 's2',
    section: '§2 CLASS',
    text: 'Property per Risk Excess of Loss Reinsurance, covering all property business written by the Reinsured, including Fire, Allied Perils and Extended Coverage.',
  },
  {
    id: 's3',
    section: '§3 LIMITS',
    text: 'USD 20,000,000 each and every risk, each and every loss occurrence, in excess of USD 5,000,000 each and every risk, subject to an annual aggregate deductible of USD 2,500,000.',
  },
  {
    id: 's4',
    section: '§4 REINSTATEMENTS',
    text: 'Two (2) reinstatements at 100% additional premium, pro rata as to amount, calculated on the reinsurance premium hereon.',
  },
  {
    id: 's5',
    section: '§5 EXCLUSIONS',
    text: 'Nuclear Energy Risks, War and Civil War, Cyber Loss (LMA5400), Communicable Disease (LMA5394), Terrorism, and Pollution unless arising from a sudden and accidental event.',
  },
  {
    id: 's6',
    section: '§6 SPECIAL CONDITIONS',
    text: 'Hours Clause: 168 consecutive hours in respect of windstorm, 72 consecutive hours in respect of earthquake. Ultimate Net Loss basis. Currency: USD. Governing Law: English Law.',
  },
];

export interface SummaryItem {
  id: string;
  /** 항목 라벨 — 언어별 */
  label: L;
  /** 스트리밍될 구조화 요약 전문 — 언어별 (ko: 한국어 요약, en: 영어 요약) */
  fullText: L;
  clauseId: string;
  citation: string;
}

/** 우측 구조화 요약 카드 7개 — 출력은 언어별로 현지화 */
export const SUMMARY_ITEMS: SummaryItem[] = [
  {
    id: 'cedant',
    label: { ko: '피보험자 (Reinsured)', en: 'Reinsured' },
    fullText: {
      ko: 'Korean Re (대한재보험) — 본점 및 전 지점 포함',
      en: 'Korean Re (Korean Reinsurance Co.) — head office and all branches',
    },
    clauseId: 's1',
    citation: '§1',
  },
  {
    id: 'class',
    label: { ko: '담보 (Class)', en: 'Class' },
    fullText: {
      ko: '물건별 초과손해액 재보험 (Property per Risk XoL) — 화재·연관 담보 포함',
      en: 'Property per Risk Excess of Loss — incl. Fire & Allied Perils',
    },
    clauseId: 's2',
    citation: '§2',
  },
  {
    id: 'limit',
    label: { ko: '한도 (Limit)', en: 'Limit' },
    fullText: {
      ko: '위험당 USD 2,000만 초과분 담보 (xs USD 500만)',
      en: 'USD 20m each risk, excess of USD 5m each risk',
    },
    clauseId: 's3',
    citation: '§3',
  },
  {
    id: 'retention',
    label: { ko: '면책 (Retention)', en: 'Retention' },
    fullText: {
      ko: '위험당 USD 500만 자기보유 + 연간 누적 면책(AAD) USD 250만',
      en: 'USD 5m retention each risk + USD 2.5m annual aggregate deductible',
    },
    clauseId: 's3',
    citation: '§3',
  },
  {
    id: 'reinst',
    label: { ko: '재축적 (Reinstatement)', en: 'Reinstatement' },
    fullText: {
      ko: '연 2회 · 100% 추가보험료 · 손액 비례 산정',
      en: '2 reinstatements · 100% additional premium · pro rata as to amount',
    },
    clauseId: 's4',
    citation: '§4',
  },
  {
    id: 'excl',
    label: { ko: '면책담보 (Exclusions)', en: 'Exclusions' },
    fullText: {
      ko: '원자력 · 전쟁 · 사이버(LMA5400) · 감염병(LMA5394) · 테러 · 점진적 오염',
      en: 'Nuclear · War · Cyber (LMA5400) · Communicable Disease (LMA5394) · Terrorism · gradual Pollution',
    },
    clauseId: 's5',
    citation: '§5',
  },
  {
    id: 'special',
    label: { ko: '특이사항', en: 'Special conditions' },
    fullText: {
      ko: 'Hours Clause 168시간(풍수해) / 72시간(지진) · UNL 기준 · 영국법 준거',
      en: 'Hours Clause 168h (windstorm) / 72h (earthquake) · UNL basis · English law',
    },
    clauseId: 's6',
    citation: '§6',
  },
];

export const DOC_NAME = 'KoreanRe_Property_XoL_Slip_2026.pdf';

/** 앱 UI 문자열 */
export const STR = {
  headerTitle: { ko: '리스크 요약·번역', en: 'Risk Summary & Translation' },
  uploadDoc: { ko: '문서 업로드', en: 'Upload document' },
  slipHeading: { ko: 'SLIP — PROPERTY PER RISK EXCESS OF LOSS', en: 'SLIP — PROPERTY PER RISK EXCESS OF LOSS' },
  summaryTitle: { ko: '구조화 요약', en: 'Structured summary' },
  doneBadge: { ko: '7개 항목 · 원문 100% 인용 연결', en: '7 items · 100% linked to source' },
  emptyTitle: {
    ko: '영문 슬립을 한국어로 구조화합니다',
    en: 'Structure the English slip in seconds',
  },
  emptySubtitle: {
    ko: '모든 요약 항목이 원문 구절과 연결됩니다',
    en: 'Every summary item links back to the source clause',
  },
  generateBtn: { ko: '요약 생성', en: 'Generate summary' },
  tabSummary: { ko: '요약', en: 'Summary' },
  tabSource: { ko: '원문', en: 'Source' },
} satisfies Record<string, L>;
