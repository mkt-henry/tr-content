import type { L, Lang } from '../_shared/i18n';

export interface MatrixDoc {
  id: string;
  fileName: string;
  /** 문서 종류 — 재보험 문서 유형(영어 원어 공통 사용) */
  type: string;
}

export const DOCUMENTS: MatrixDoc[] = [
  { id: 'propcat', fileName: 'Korean_Property_Cat_Slip_2026.pdf', type: 'Treaty Slip' },
  { id: 'marine', fileName: 'Hyundai_Marine_Cargo_Fac_RQ.pdf', type: 'Facultative' },
  { id: 'casualty', fileName: 'Casualty_XoL_Wording_v3.pdf', type: 'Treaty Wording' },
  { id: 'energy', fileName: 'Energy_Onshore_Slip.pdf', type: 'Fac Slip' },
  { id: 'aviation', fileName: 'Aviation_Hull_Treaty_2025.pdf', type: 'Treaty' },
];

export interface MatrixColumn {
  id: string;
  /** 추출 항목(컬럼) 헤더 라벨 — 언어별 */
  label: L;
}

/** 추출 항목(컬럼). 재보험 전문용어는 영어 원어를 양 언어 공통으로 유지 */
export const COLUMNS: MatrixColumn[] = [
  { id: 'lob', label: { ko: '담보 종목 (LoB)', en: 'Line of Business' } },
  { id: 'limit', label: { ko: 'Per Occurrence Limit', en: 'Per Occurrence Limit' } },
  { id: 'deductible', label: { ko: 'Deductible / Retention', en: 'Deductible / Retention' } },
  { id: 'rate', label: { ko: 'Rate / Premium', en: 'Rate / Premium' } },
  { id: 'reinst', label: { ko: 'Reinstatement', en: 'Reinstatement' } },
  { id: 'exclusions', label: { ko: '주요 면책 (Exclusions)', en: 'Key Exclusions' } },
];

export interface CellData {
  /** 추출된 셀 값 — 언어별 (숫자·전문용어는 양 언어 동일) */
  value: L;
  citation: string;
  /** 원문 인용 스니펫 — 영문 슬립 원문이므로 양 언어 공통 영어 유지. **굵게**가 하이라이트 */
  snippet: string;
  /** 인용 미리보기에서 하이라이트 박스 위치 (0~1) */
  highlightAt: number;
}

/** docId → colId → 셀 값 */
export const CELLS: Record<string, Record<string, CellData>> = {
  propcat: {
    lob: { value: { ko: 'Property Catastrophe', en: 'Property Catastrophe' }, citation: 'p.1', snippet: 'CLASS: **Property Catastrophe Excess of Loss** Reinsurance covering all property business...', highlightAt: 0.18 },
    limit: { value: { ko: 'USD 250M xs 50M', en: 'USD 250M xs 50M' }, citation: 'p.3', snippet: '...shall pay the Reinsured **USD 250,000,000 in excess of USD 50,000,000** each and every loss occurrence...', highlightAt: 0.42 },
    deductible: { value: { ko: 'USD 50M', en: 'USD 50M' }, citation: 'p.3', snippet: 'The Reinsured shall retain net for its own account **USD 50,000,000** each and every loss occurrence.', highlightAt: 0.55 },
    rate: { value: { ko: 'RoL 8.2%', en: 'RoL 8.2%' }, citation: 'p.4', snippet: 'Premium: **Rate on Line 8.2%** payable in quarterly instalments.', highlightAt: 0.3 },
    reinst: { value: { ko: '2회 @ 100%', en: '2 @ 100%' }, citation: 'p.4', snippet: '**Two reinstatements at 100% additional premium**, pro rata as to amount.', highlightAt: 0.48 },
    exclusions: { value: { ko: '전쟁 · 사이버 · 테러', en: 'War · Cyber · Terrorism' }, citation: 'p.6', snippet: 'EXCLUSIONS: **War and Civil War, Cyber Loss (LMA5400), Terrorism**, Nuclear Energy Risks...', highlightAt: 0.25 },
  },
  marine: {
    lob: { value: { ko: 'Marine Cargo', en: 'Marine Cargo' }, citation: 'p.1', snippet: 'CLASS: **Marine Cargo** Facultative Reinsurance in respect of containerised cargo...', highlightAt: 0.2 },
    limit: { value: { ko: 'USD 30M / 선박당', en: 'USD 30M any one vessel' }, citation: 'p.2', snippet: 'Limit: **USD 30,000,000 any one vessel**, any one location.', highlightAt: 0.35 },
    deductible: { value: { ko: 'USD 250K', en: 'USD 250K' }, citation: 'p.2', snippet: 'Deductible: **USD 250,000** each and every loss.', highlightAt: 0.5 },
    rate: { value: { ko: '보험료 USD 420K', en: 'Premium USD 420K' }, citation: 'p.3', snippet: 'Gross Premium: **USD 420,000** annual, payable in advance.', highlightAt: 0.28 },
    reinst: { value: { ko: '해당 없음', en: 'N/A' }, citation: 'p.3', snippet: 'Reinstatement provisions are **not applicable** to this facultative placement.', highlightAt: 0.6 },
    exclusions: { value: { ko: '내항성 결여 · 지연', en: 'Unseaworthiness · Delay' }, citation: 'p.5', snippet: 'Excluding losses arising from **unseaworthiness of vessel and delay**, inherent vice...', highlightAt: 0.4 },
  },
  casualty: {
    lob: { value: { ko: 'General Liability', en: 'General Liability' }, citation: 'p.2', snippet: 'BUSINESS COVERED: **General Third Party Liability** business written by the Reinsured...', highlightAt: 0.15 },
    limit: { value: { ko: 'USD 20M xs 5M', en: 'USD 20M xs 5M' }, citation: 'p.4', snippet: 'Limit of Liability: **USD 20,000,000 each and every loss in excess of USD 5,000,000**.', highlightAt: 0.45 },
    deductible: { value: { ko: 'USD 5M', en: 'USD 5M' }, citation: 'p.4', snippet: 'Priority: the Reinsured retains **USD 5,000,000** ultimate net loss each and every loss.', highlightAt: 0.58 },
    rate: { value: { ko: 'GNPI의 6.5%', en: '6.5% of GNPI' }, citation: 'p.5', snippet: 'Premium: **6.5% of Gross Net Premium Income**, minimum and deposit premium USD 850,000.', highlightAt: 0.32 },
    reinst: { value: { ko: '무제한 (무료)', en: 'Unlimited (free)' }, citation: 'p.5', snippet: '**Unlimited free reinstatements** of the limit hereunder.', highlightAt: 0.5 },
    exclusions: { value: { ko: '석면 · PFAS', en: 'Asbestos · PFAS' }, citation: 'p.8', snippet: 'EXCLUSIONS: **Asbestos, PFAS and per- and polyfluoroalkyl substances**, pure financial loss...', highlightAt: 0.22 },
  },
  energy: {
    lob: { value: { ko: 'Energy / Property', en: 'Energy / Property' }, citation: 'p.1', snippet: 'CLASS: **Onshore Energy Property Damage** and Business Interruption.', highlightAt: 0.2 },
    limit: { value: { ko: 'USD 100M', en: 'USD 100M' }, citation: 'p.2', snippet: 'Sum Reinsured: **USD 100,000,000** any one accident or occurrence.', highlightAt: 0.38 },
    deductible: { value: { ko: 'USD 10M', en: 'USD 10M' }, citation: 'p.2', snippet: 'Deductible: **USD 10,000,000** each and every loss, combined PD/BI.', highlightAt: 0.52 },
    rate: { value: { ko: '보험료 USD 1.8M', en: 'Premium USD 1.8M' }, citation: 'p.3', snippet: 'Premium: **USD 1,800,000** gross annual premium.', highlightAt: 0.3 },
    reinst: { value: { ko: '1회 @ 100%', en: '1 @ 100%' }, citation: 'p.3', snippet: '**One reinstatement at 100% additional premium**, pro rata as to time and amount.', highlightAt: 0.46 },
    exclusions: { value: { ko: 'NCBR · 점진적 오염', en: 'NCBR · Gradual Pollution' }, citation: 'p.6', snippet: 'Excluding **NCBR perils and gradual pollution**, wear and tear, cyber...', highlightAt: 0.35 },
  },
  aviation: {
    lob: { value: { ko: 'Aviation Hull & Liability', en: 'Aviation Hull & Liability' }, citation: 'p.1', snippet: 'CLASS: **Aviation Hull and Liability** Treaty covering the aviation portfolio of the Reinsured.', highlightAt: 0.17 },
    limit: { value: { ko: 'USD 500M CSL', en: 'USD 500M CSL' }, citation: 'p.3', snippet: 'Limit: **USD 500,000,000 Combined Single Limit** any one aircraft, any one occurrence.', highlightAt: 0.4 },
    deductible: { value: { ko: 'USD 1M', en: 'USD 1M' }, citation: 'p.3', snippet: 'Deductible: **USD 1,000,000** each and every loss, each aircraft.', highlightAt: 0.55 },
    rate: { value: { ko: 'RoL 4.1%', en: 'RoL 4.1%' }, citation: 'p.4', snippet: 'Premium: **Rate on Line 4.1%**, adjustable at expiry on fleet value declarations.', highlightAt: 0.28 },
    reinst: { value: { ko: '3회 @ 비례', en: '3 @ pro-rata' }, citation: 'p.4', snippet: '**Three reinstatements at pro rata additional premium** as to time and amount.', highlightAt: 0.5 },
    exclusions: { value: { ko: '전쟁 (AVN52 별도)', en: 'War (sep. AVN52)' }, citation: 'p.7', snippet: 'War, hijacking and allied perils excluded — **covered separately under AVN52E** endorsement.', highlightAt: 0.3 },
  },
};

export const MODEL_CHIP: L = { ko: 'ARIA-R1 · 추론 높음', en: 'ARIA-R1 · High reasoning' };

/** 앱 UI 문자열 */
export const STR = {
  appTitle: { ko: '문서 비교 Matrix', en: 'Document Comparison Matrix' },
  byline: { ko: 'ARIA by Treasurer', en: 'ARIA by Treasurer' },
  documents: { ko: '문서', en: 'Documents' },
  extracting: { ko: '추출 중', en: 'Extracting' },
  extractProgress: { ko: '추출', en: 'extracted' },
  addColumn: { ko: '열 추가', en: 'Add column' },
  allColumnsAdded: { ko: '모든 열 추가됨', en: 'All columns added' },
  emptyHint: { ko: '열을 추가하면 ARIA가 자동 추출합니다', en: 'Add a column and ARIA extracts automatically' },
} satisfies Record<string, L>;

/** 추출 완료 배지 문구 — 문서 수·항목 수 치환 */
export function extractedSummary(lang: Lang, docs: number, cells: number): string {
  return lang === 'ko'
    ? `${docs}개 문서 · ${cells}개 항목 추출 완료`
    : `${docs} documents · ${cells} fields extracted`;
}

/** "열 추가: <항목>" 버튼 라벨 */
export function addColumnLabel(lang: Lang, colLabel: string): string {
  return lang === 'ko' ? `열 추가: ${colLabel}` : `Add column: ${colLabel}`;
}
