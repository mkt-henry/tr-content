export interface Clause {
  id: string;
  section: string;
  text: string;
}

/** 좌측 영문 원문 슬립 (발췌 6문단) */
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
  label: string;
  /** 스트리밍될 한국어 요약 전문 */
  fullText: string;
  clauseId: string;
  citation: string;
}

/** 우측 한국어 구조화 요약 카드 7개 */
export const SUMMARY_ITEMS: SummaryItem[] = [
  {
    id: 'cedant',
    label: '피보험자 (Reinsured)',
    fullText: 'Korean Re (대한재보험) — 본점 및 전 지점 포함',
    clauseId: 's1',
    citation: '§1',
  },
  {
    id: 'class',
    label: '담보 (Class)',
    fullText: '물건별 초과손해액 재보험 (Property per Risk XoL) — 화재·연관 담보 포함',
    clauseId: 's2',
    citation: '§2',
  },
  {
    id: 'limit',
    label: '한도 (Limit)',
    fullText: '위험당 USD 2,000만 초과분 담보 (xs USD 500만)',
    clauseId: 's3',
    citation: '§3',
  },
  {
    id: 'retention',
    label: '면책 (Retention)',
    fullText: '위험당 USD 500만 자기보유 + 연간 누적 면책(AAD) USD 250만',
    clauseId: 's3',
    citation: '§3',
  },
  {
    id: 'reinst',
    label: '재축적 (Reinstatement)',
    fullText: '연 2회 · 100% 추가보험료 · 손액 비례 산정',
    clauseId: 's4',
    citation: '§4',
  },
  {
    id: 'excl',
    label: '면책담보 (Exclusions)',
    fullText: '원자력 · 전쟁 · 사이버(LMA5400) · 감염병(LMA5394) · 테러 · 점진적 오염',
    clauseId: 's5',
    citation: '§5',
  },
  {
    id: 'special',
    label: '특이사항',
    fullText: 'Hours Clause 168시간(풍수해) / 72시간(지진) · UNL 기준 · 영국법 준거',
    clauseId: 's6',
    citation: '§6',
  },
];

export const DOC_NAME = 'KoreanRe_Property_XoL_Slip_2026.pdf';
