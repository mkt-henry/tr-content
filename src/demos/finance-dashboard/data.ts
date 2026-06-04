export interface Kpi {
  id: string;
  label: string;
  value: number;
  unit: string;
  prefix?: string;
  decimals?: number;
  delta: string;
  positive: boolean;
}

export const KPIS: Kpi[] = [
  { id: 'revenue', label: '수재보험료 (Assumed)', value: 1840, unit: '억', prefix: '₩', delta: '+9.2% YoY', positive: true },
  { id: 'op', label: '출재보험료 (Ceded)', value: 620, unit: '억', prefix: '₩', delta: '+4.1% YoY', positive: true },
  { id: 'opm', label: '갱신 적중률', value: 87, unit: '%', delta: '+3%p YoY', positive: true },
  { id: 'cash', label: '순보유 (Net Retained)', value: 1220, unit: '억', prefix: '₩', delta: '+12.0% YoY', positive: true },
];

/** 분기별 수재(value) vs 출재(op) 보험료 — Q4 갱신 시즌 피크 (단위: 억원) */
export const REVENUE_QUARTERLY = [
  { name: '2Q24', value: 352, op: 118 },
  { name: '3Q24', value: 388, op: 130 },
  { name: '4Q24', value: 512, op: 172 },
  { name: '1Q25', value: 405, op: 138 },
  { name: '2Q25', value: 392, op: 132 },
  { name: '3Q25', value: 430, op: 145 },
  { name: '4Q25', value: 568, op: 190 },
  { name: '1Q26', value: 462, op: 156 },
];

/** 연간 수재 vs 출재 (2026E = 포캐스트) */
export const REVENUE_YEARLY = [
  { name: '2022', value: 1080, op: 372 },
  { name: '2023', value: 1290, op: 440 },
  { name: '2024', value: 1520, op: 516 },
  { name: '2025', value: 1795, op: 607 },
  { name: '2026E', value: 2010, op: 680 },
];

export interface Segment {
  id: string;
  name: string;
  value: number;
  share: number;
  delta: string;
  color: string;
}

/** Line of Business별 수재보험료 */
export const SEGMENTS: Segment[] = [
  { id: 'property', name: 'Property Cat', value: 620, share: 34, delta: '+14% YoY', color: '#34d399' },
  { id: 'marine', name: 'Marine', value: 410, share: 22, delta: '+7% YoY', color: '#38bdf8' },
  { id: 'casualty', name: 'Casualty', value: 330, share: 18, delta: '+5% YoY', color: '#d9ad78' },
  { id: 'engineering', name: 'Engineering', value: 280, share: 15, delta: '+11% YoY', color: '#a78bfa' },
  { id: 'aviation', name: 'Aviation', value: 200, share: 11, delta: '+3% YoY', color: '#f472b6' },
];

/** 갱신 파이프라인 단계별 건수 */
export const PIPELINE = [
  { id: 'nego', label: '협의중', count: 14, color: '#38bdf8' },
  { id: 'quote', label: '견적발송', count: 9, color: '#d9ad78' },
  { id: 'binding', label: '바인딩대기', count: 5, color: '#fbbf24' },
  { id: 'done', label: '완료', count: 22, color: '#34d399' },
];

export const EVENTS = [
  { date: '12.15', title: 'KB Marine Hull Treaty 견적 마감', tag: 'D-12' },
  { date: '12.20', title: 'Korean Re Property Cat 조건 협의', tag: 'D-17' },
  { date: '01.01', title: '1/1 갱신 일괄 발효 (28건)', tag: '갱신' },
];
