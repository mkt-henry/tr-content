export interface MatrixDoc {
  id: string;
  fileName: string;
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
  label: string;
}

export const COLUMNS: MatrixColumn[] = [
  { id: 'lob', label: 'Line of Business' },
  { id: 'limit', label: 'Per Occurrence Limit' },
  { id: 'deductible', label: 'Deductible / Retention' },
  { id: 'rate', label: 'Rate / Premium' },
  { id: 'reinst', label: 'Reinstatement' },
  { id: 'exclusions', label: 'Key Exclusions' },
];

export interface CellData {
  value: string;
  citation: string;
  snippet: string;
  /** 인용 미리보기에서 하이라이트 박스 위치 (0~1) */
  highlightAt: number;
}

/** docId → colId → 셀 값 */
export const CELLS: Record<string, Record<string, CellData>> = {
  propcat: {
    lob: { value: 'Property Catastrophe', citation: 'p.1', snippet: 'CLASS: **Property Catastrophe Excess of Loss** Reinsurance covering all property business...', highlightAt: 0.18 },
    limit: { value: 'USD 250M xs 50M', citation: 'p.3', snippet: '...shall pay the Reinsured **USD 250,000,000 in excess of USD 50,000,000** each and every loss occurrence...', highlightAt: 0.42 },
    deductible: { value: 'USD 50M', citation: 'p.3', snippet: 'The Reinsured shall retain net for its own account **USD 50,000,000** each and every loss occurrence.', highlightAt: 0.55 },
    rate: { value: 'RoL 8.2%', citation: 'p.4', snippet: 'Premium: **Rate on Line 8.2%** payable in quarterly instalments.', highlightAt: 0.3 },
    reinst: { value: '2 @ 100%', citation: 'p.4', snippet: '**Two reinstatements at 100% additional premium**, pro rata as to amount.', highlightAt: 0.48 },
    exclusions: { value: 'War · Cyber · Terrorism', citation: 'p.6', snippet: 'EXCLUSIONS: **War and Civil War, Cyber Loss (LMA5400), Terrorism**, Nuclear Energy Risks...', highlightAt: 0.25 },
  },
  marine: {
    lob: { value: 'Marine Cargo', citation: 'p.1', snippet: 'CLASS: **Marine Cargo** Facultative Reinsurance in respect of containerised cargo...', highlightAt: 0.2 },
    limit: { value: 'USD 30M any one vessel', citation: 'p.2', snippet: 'Limit: **USD 30,000,000 any one vessel**, any one location.', highlightAt: 0.35 },
    deductible: { value: 'USD 250K', citation: 'p.2', snippet: 'Deductible: **USD 250,000** each and every loss.', highlightAt: 0.5 },
    rate: { value: 'Premium USD 420K', citation: 'p.3', snippet: 'Gross Premium: **USD 420,000** annual, payable in advance.', highlightAt: 0.28 },
    reinst: { value: 'N/A', citation: 'p.3', snippet: 'Reinstatement provisions are **not applicable** to this facultative placement.', highlightAt: 0.6 },
    exclusions: { value: 'Unseaworthiness · Delay', citation: 'p.5', snippet: 'Excluding losses arising from **unseaworthiness of vessel and delay**, inherent vice...', highlightAt: 0.4 },
  },
  casualty: {
    lob: { value: 'General Liability', citation: 'p.2', snippet: 'BUSINESS COVERED: **General Third Party Liability** business written by the Reinsured...', highlightAt: 0.15 },
    limit: { value: 'USD 20M xs 5M', citation: 'p.4', snippet: 'Limit of Liability: **USD 20,000,000 each and every loss in excess of USD 5,000,000**.', highlightAt: 0.45 },
    deductible: { value: 'USD 5M', citation: 'p.4', snippet: 'Priority: the Reinsured retains **USD 5,000,000** ultimate net loss each and every loss.', highlightAt: 0.58 },
    rate: { value: '6.5% of GNPI', citation: 'p.5', snippet: 'Premium: **6.5% of Gross Net Premium Income**, minimum and deposit premium USD 850,000.', highlightAt: 0.32 },
    reinst: { value: 'Unlimited (free)', citation: 'p.5', snippet: '**Unlimited free reinstatements** of the limit hereunder.', highlightAt: 0.5 },
    exclusions: { value: 'Asbestos · PFAS', citation: 'p.8', snippet: 'EXCLUSIONS: **Asbestos, PFAS and per- and polyfluoroalkyl substances**, pure financial loss...', highlightAt: 0.22 },
  },
  energy: {
    lob: { value: 'Energy / Property', citation: 'p.1', snippet: 'CLASS: **Onshore Energy Property Damage** and Business Interruption.', highlightAt: 0.2 },
    limit: { value: 'USD 100M', citation: 'p.2', snippet: 'Sum Reinsured: **USD 100,000,000** any one accident or occurrence.', highlightAt: 0.38 },
    deductible: { value: 'USD 10M', citation: 'p.2', snippet: 'Deductible: **USD 10,000,000** each and every loss, combined PD/BI.', highlightAt: 0.52 },
    rate: { value: 'Premium USD 1.8M', citation: 'p.3', snippet: 'Premium: **USD 1,800,000** gross annual premium.', highlightAt: 0.3 },
    reinst: { value: '1 @ 100%', citation: 'p.3', snippet: '**One reinstatement at 100% additional premium**, pro rata as to time and amount.', highlightAt: 0.46 },
    exclusions: { value: 'NCBR · Gradual Pollution', citation: 'p.6', snippet: 'Excluding **NCBR perils and gradual pollution**, wear and tear, cyber...', highlightAt: 0.35 },
  },
  aviation: {
    lob: { value: 'Aviation Hull & Liability', citation: 'p.1', snippet: 'CLASS: **Aviation Hull and Liability** Treaty covering the aviation portfolio of the Reinsured.', highlightAt: 0.17 },
    limit: { value: 'USD 500M CSL', citation: 'p.3', snippet: 'Limit: **USD 500,000,000 Combined Single Limit** any one aircraft, any one occurrence.', highlightAt: 0.4 },
    deductible: { value: 'USD 1M', citation: 'p.3', snippet: 'Deductible: **USD 1,000,000** each and every loss, each aircraft.', highlightAt: 0.55 },
    rate: { value: 'RoL 4.1%', citation: 'p.4', snippet: 'Premium: **Rate on Line 4.1%**, adjustable at expiry on fleet value declarations.', highlightAt: 0.28 },
    reinst: { value: '3 @ pro-rata', citation: 'p.4', snippet: '**Three reinstatements at pro rata additional premium** as to time and amount.', highlightAt: 0.5 },
    exclusions: { value: 'War (sep. AVN52)', citation: 'p.7', snippet: 'War, hijacking and allied perils excluded — **covered separately under AVN52E** endorsement.', highlightAt: 0.3 },
  },
};

export const MODEL_CHIP = 'ARIA-R1 · 추론 높음';
