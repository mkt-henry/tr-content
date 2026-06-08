import type { L, Lang } from '../_shared/i18n';

export interface Kpi {
  id: string;
  /** KPI 라벨 — 언어별 */
  label: L;
  value: number;
  unit: L;
  prefix?: string;
  decimals?: number;
  /** 증감 표시 — 언어별 (YoY 등) */
  delta: L;
  positive: boolean;
}

export const KPIS: Kpi[] = [
  {
    id: 'revenue',
    label: { ko: '수재보험료 (Assumed)', en: 'Assumed premium' },
    value: 1840,
    unit: { ko: '억', en: ' ×100M' },
    prefix: '₩',
    delta: { ko: '+9.2% YoY', en: '+9.2% YoY' },
    positive: true,
  },
  {
    id: 'op',
    label: { ko: '출재보험료 (Ceded)', en: 'Ceded premium' },
    value: 620,
    unit: { ko: '억', en: ' ×100M' },
    prefix: '₩',
    delta: { ko: '+4.1% YoY', en: '+4.1% YoY' },
    positive: true,
  },
  {
    id: 'opm',
    label: { ko: '갱신 적중률', en: 'Renewal hit ratio' },
    value: 87,
    unit: { ko: '%', en: '%' },
    delta: { ko: '+3%p YoY', en: '+3pp YoY' },
    positive: true,
  },
  {
    id: 'cash',
    label: { ko: '순보유 (Net Retained)', en: 'Net retained' },
    value: 1220,
    unit: { ko: '억', en: ' ×100M' },
    prefix: '₩',
    delta: { ko: '+12.0% YoY', en: '+12.0% YoY' },
    positive: true,
  },
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
  /** LoB 이름 — 영문 고유명사라 양 언어 공통이지만 L<>로 일관성 유지 */
  name: L;
  value: number;
  share: number;
  delta: L;
  color: string;
}

/** Line of Business별 수재보험료 */
export const SEGMENTS: Segment[] = [
  { id: 'property', name: { ko: 'Property Cat', en: 'Property Cat' }, value: 620, share: 34, delta: { ko: '+14% YoY', en: '+14% YoY' }, color: '#34d399' },
  { id: 'marine', name: { ko: 'Marine', en: 'Marine' }, value: 410, share: 22, delta: { ko: '+7% YoY', en: '+7% YoY' }, color: '#38bdf8' },
  { id: 'casualty', name: { ko: 'Casualty', en: 'Casualty' }, value: 330, share: 18, delta: { ko: '+5% YoY', en: '+5% YoY' }, color: '#d9ad78' },
  { id: 'engineering', name: { ko: 'Engineering', en: 'Engineering' }, value: 280, share: 15, delta: { ko: '+11% YoY', en: '+11% YoY' }, color: '#a78bfa' },
  { id: 'aviation', name: { ko: 'Aviation', en: 'Aviation' }, value: 200, share: 11, delta: { ko: '+3% YoY', en: '+3% YoY' }, color: '#f472b6' },
];

export interface PipelineStage {
  id: string;
  label: L;
  count: number;
  color: string;
}

/** 갱신 파이프라인 단계별 건수 */
export const PIPELINE: PipelineStage[] = [
  { id: 'nego', label: { ko: '협의중', en: 'Negotiating' }, count: 14, color: '#38bdf8' },
  { id: 'quote', label: { ko: '견적발송', en: 'Quoted' }, count: 9, color: '#d9ad78' },
  { id: 'binding', label: { ko: '바인딩대기', en: 'Awaiting bind' }, count: 5, color: '#fbbf24' },
  { id: 'done', label: { ko: '완료', en: 'Bound' }, count: 22, color: '#34d399' },
];

export interface DashEvent {
  date: string;
  title: L;
  tag: L;
}

export const EVENTS: DashEvent[] = [
  { date: '12.15', title: { ko: 'KB Marine Hull Treaty 견적 마감', en: 'KB Marine Hull Treaty quote deadline' }, tag: { ko: 'D-12', en: 'D-12' } },
  { date: '12.20', title: { ko: 'Korean Re Property Cat 조건 협의', en: 'Korean Re Property Cat terms negotiation' }, tag: { ko: 'D-17', en: 'D-17' } },
  { date: '01.01', title: { ko: '1/1 갱신 일괄 발효 (28건)', en: '1/1 renewals go live (28 treaties)' }, tag: { ko: '갱신', en: 'Renewal' } },
];

/** 대시보드 UI 문자열 */
export const STR = {
  // 사이드 내비
  navForecast: { ko: '포캐스트', en: 'Forecast' },
  navPipeline: { ko: '갱신 파이프라인', en: 'Renewal pipeline' },
  navLob: { ko: 'LoB 현황', en: 'Line of business' },
  navSettlement: { ko: '정산 관리', en: 'Settlements' },
  sidebarNote: { ko: '1/1 갱신 시즌 파이프라인이 반영되었습니다.', en: 'The 1/1 renewal season pipeline is loaded.' },
  sidebarHighlight: { ko: '2026 갱신 시즌 · 50건 추적 중', en: '2026 renewal season · tracking 50 treaties' },
  // 헤더
  pageTitle: { ko: '수재 매출 포캐스트', en: 'Assumed premium forecast' },
  pageSubtitle: { ko: '2026 갱신 시즌 · 수재/출재 · 포캐스트 포함', en: '2026 renewal season · assumed/ceded · forecast included' },
  mobileSubtitle: { ko: 'ARIA · 2026 갱신 시즌', en: 'ARIA · 2026 renewal season' },
  periodQuarter: { ko: '분기', en: 'Quarterly' },
  periodYear: { ko: '연간', en: 'Annual' },
  report: { ko: '리포트', en: 'Report' },
  loadData: { ko: '갱신 시즌 데이터 불러오기', en: 'Load renewal season data' },
  // 매출 차트
  revenueTitle: { ko: '수재 vs 출재 보험료 추이', en: 'Assumed vs ceded premium trend' },
  revenueNote: { ko: '단위: 억원 · 점선 = 출재', en: 'Unit: ₩100M · dashed = ceded' },
  seriesAssumed: { ko: '수재', en: 'Assumed' },
  seriesCeded: { ko: '출재', en: 'Ceded' },
  // 부문 바
  segmentTitle: { ko: 'Line of Business별 수재보험료', en: 'Assumed premium by line of business' },
  segmentHint: { ko: 'LoB를 클릭하면 해당 부문만 강조됩니다', en: 'Click a line of business to focus on it' },
  // 파이프라인
  pipelineTitle: { ko: '갱신 파이프라인', en: 'Renewal pipeline' },
  // 이벤트
  eventsTitle: { ko: '다가오는 갱신 일정', en: 'Upcoming renewals' },
} satisfies Record<string, L>;

/** '총 {n}건' 형태의 카운트 표기 */
export function pipelineTotal(n: number, lang: Lang): string {
  return lang === 'ko' ? `총 ${n}건` : `${n} total`;
}
