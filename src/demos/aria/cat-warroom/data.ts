import type { L, Lang } from '../_shared/i18n';

export type Severity = 'high' | 'medium' | 'low';

/** SVG viewBox(0 0 400 480) 기준 좌표 — 디자인용 근사치 */
export interface Point {
  x: number;
  y: number;
}

export interface CatEvent {
  name: L;
  /** 속보 배너 문구 */
  headline: L;
  category: L;
  detail: L;
  /** 태풍 경로 — 남동 해상에서 남해안 상륙 */
  path: Point[];
  /** 영향권 반경 (마지막 경로점 기준) */
  impactRadius: number;
}

export interface Exposure {
  id: number;
  cedent: L;
  treaty: L;
  region: L;
  pos: Point;
  tsi: L;
  /** 예상 손해액 (억원) — 합계 계산용 숫자 */
  loss: number;
  severity: Severity;
}

export interface AlertDraft {
  cedent: L;
  subject: L;
  body: L;
}

export const SEVERITY_META: Record<Severity, { label: L; dot: string; badge: string }> = {
  high: {
    label: { ko: '높음', en: 'High' },
    dot: '#fb7185',
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  },
  medium: {
    label: { ko: '중간', en: 'Medium' },
    dot: '#fbbf24',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  low: {
    label: { ko: '낮음', en: 'Low' },
    dot: '#a1a1aa',
    badge: 'border-white/10 bg-white/[0.05] text-zinc-400',
  },
};

export const EVENT: CatEvent = {
  name: { ko: '태풍 12호 나리', en: 'Typhoon No.12 NARI' },
  headline: {
    ko: '태풍 12호 나리, 금일 14시 남해안 상륙 — 최대풍속 45m/s',
    en: 'Typhoon No.12 NARI makes landfall on the south coast at 14:00 — winds 45 m/s',
  },
  category: { ko: '카테고리 3 · 945hPa', en: 'Category 3 · 945hPa' },
  detail: {
    ko: '진로: 남동 해상 → 통영 인근 상륙 → 내륙 북상',
    en: 'Track: SE waters → landfall near Tongyeong → inland',
  },
  path: [
    { x: 338, y: 452 },
    { x: 316, y: 402 },
    { x: 292, y: 356 },
    { x: 266, y: 316 },
    { x: 244, y: 288 },
  ],
  impactRadius: 80,
};

/** 점등 순서 = 배열 순서 (심각도 높은 순) */
export const EXPOSURES: Exposure[] = [
  {
    id: 1,
    cedent: { ko: '한화손해보험', en: 'Hanwha General' },
    treaty: { ko: 'Property Cat XoL', en: 'Property Cat XoL' },
    region: { ko: '부산', en: 'Busan' },
    pos: { x: 258, y: 284 },
    tsi: { ko: '₩1.2조', en: '₩1.2tn' },
    loss: 62,
    severity: 'high',
  },
  {
    id: 2,
    cedent: { ko: '삼성화재', en: 'Samsung F&M' },
    treaty: { ko: '풍수해 QS', en: 'Windstorm & Flood QS' },
    region: { ko: '창원', en: 'Changwon' },
    pos: { x: 242, y: 278 },
    tsi: { ko: '₩8,400억', en: '₩840bn' },
    loss: 48,
    severity: 'high',
  },
  {
    id: 3,
    cedent: { ko: 'DB손해보험', en: 'DB Insurance' },
    treaty: { ko: 'Marine Cargo XoL', en: 'Marine Cargo XoL' },
    region: { ko: '여수', en: 'Yeosu' },
    pos: { x: 214, y: 292 },
    tsi: { ko: '₩5,600억', en: '₩560bn' },
    loss: 35,
    severity: 'medium',
  },
  {
    id: 4,
    cedent: { ko: '현대해상', en: 'Hyundai M&F' },
    treaty: { ko: 'Property Surplus', en: 'Property Surplus' },
    region: { ko: '통영', en: 'Tongyeong' },
    pos: { x: 234, y: 290 },
    tsi: { ko: '₩3,200억', en: '₩320bn' },
    loss: 24,
    severity: 'medium',
  },
  {
    id: 5,
    cedent: { ko: 'KB손해보험', en: 'KB Insurance' },
    treaty: { ko: '풍수해 QS', en: 'Windstorm & Flood QS' },
    region: { ko: '목포', en: 'Mokpo' },
    pos: { x: 162, y: 294 },
    tsi: { ko: '₩2,900억', en: '₩290bn' },
    loss: 21,
    severity: 'medium',
  },
  {
    id: 6,
    cedent: { ko: '삼성화재', en: 'Samsung F&M' },
    treaty: { ko: 'Engineering CAR', en: 'Engineering CAR' },
    region: { ko: '거제', en: 'Geoje' },
    pos: { x: 244, y: 294 },
    tsi: { ko: '₩4,100억', en: '₩410bn' },
    loss: 14,
    severity: 'low',
  },
  {
    id: 7,
    cedent: { ko: '한화손해보험', en: 'Hanwha General' },
    treaty: { ko: 'Marine Hull', en: 'Marine Hull' },
    region: { ko: '울산', en: 'Ulsan' },
    pos: { x: 266, y: 264 },
    tsi: { ko: '₩2,400억', en: '₩240bn' },
    loss: 10,
    severity: 'low',
  },
];

/** 요약 합계 — 데이터에서 계산 (하드코딩 금지) */
export function summary() {
  const totalLoss = EXPOSURES.reduce((s, e) => s + e.loss, 0);
  const cedents = new Set(EXPOSURES.map((e) => e.cedent.ko)).size;
  return { count: EXPOSURES.length, totalLoss, cedents };
}

/** 손해액 표기 — ko: ₩214억 / en: ₩21.4bn */
export function lossLabel(n: number, lang: Lang): string {
  return lang === 'ko' ? `₩${n}억` : `₩${(n / 10).toFixed(1)}bn`;
}

/** 출재사 알림 초안 — 예상 손해 상위 3개 출재사 (한화 72 · 삼성 62 · DB 35) */
export const ALERTS: AlertDraft[] = [
  {
    cedent: { ko: '한화손해보험', en: 'Hanwha General' },
    subject: {
      ko: '[긴급] 태풍 나리 — Property Cat XoL·Marine Hull 노출 안내',
      en: '[Urgent] Typhoon NARI — Property Cat XoL & Marine Hull exposure',
    },
    body: {
      ko: '태풍 12호 나리 상륙에 따라 귀사 출재 특약의 예상 노출을 안내드립니다.\n\n· Property Cat XoL (부산) — 예상 손해 ₩62억\n· Marine Hull (울산) — 예상 손해 ₩10억\n\n클레임 접수 절차와 Hours Clause(168시간) 적용 기준을 첨부했습니다.',
      en: 'Following Typhoon NARI landfall, estimated exposure on your ceded treaties:\n\n· Property Cat XoL (Busan) — est. loss ₩6.2bn\n· Marine Hull (Ulsan) — est. loss ₩1.0bn\n\nClaims procedure and the 168-hour Hours Clause guidance are attached.',
    },
  },
  {
    cedent: { ko: '삼성화재', en: 'Samsung F&M' },
    subject: {
      ko: '[긴급] 태풍 나리 — 풍수해 QS·Engineering CAR 노출 안내',
      en: '[Urgent] Typhoon NARI — Windstorm QS & Engineering CAR exposure',
    },
    body: {
      ko: '태풍 12호 나리 상륙에 따라 귀사 출재 특약의 예상 노출을 안내드립니다.\n\n· 풍수해 QS (창원) — 예상 손해 ₩48억\n· Engineering CAR (거제) — 예상 손해 ₩14억\n\n클레임 접수 절차를 첨부했습니다. 현장 피해 확인 시 즉시 회신 부탁드립니다.',
      en: 'Following Typhoon NARI landfall, estimated exposure on your ceded treaties:\n\n· Windstorm & Flood QS (Changwon) — est. loss ₩4.8bn\n· Engineering CAR (Geoje) — est. loss ₩1.4bn\n\nClaims procedure attached. Please reply once on-site damage is confirmed.',
    },
  },
  {
    cedent: { ko: 'DB손해보험', en: 'DB Insurance' },
    subject: {
      ko: '[긴급] 태풍 나리 — Marine Cargo XoL 노출 안내',
      en: '[Urgent] Typhoon NARI — Marine Cargo XoL exposure',
    },
    body: {
      ko: '태풍 12호 나리 상륙에 따라 귀사 출재 특약의 예상 노출을 안내드립니다.\n\n· Marine Cargo XoL (여수) — 예상 손해 ₩35억\n\n여수항 체선 화물 기준 산정치이며, 상세 내역은 산정 후 추가 송부드립니다.',
      en: 'Following Typhoon NARI landfall, estimated exposure on your ceded treaty:\n\n· Marine Cargo XoL (Yeosu) — est. loss ₩3.5bn\n\nBased on cargo berthed at Yeosu port; details to follow after assessment.',
    },
  },
];

/** 지도 도시 라벨 */
export const CITIES: { name: L; pos: Point }[] = [
  { name: { ko: '서울', en: 'Seoul' }, pos: { x: 152, y: 118 } },
  { name: { ko: '부산', en: 'Busan' }, pos: { x: 258, y: 284 } },
  { name: { ko: '여수', en: 'Yeosu' }, pos: { x: 214, y: 292 } },
  { name: { ko: '목포', en: 'Mokpo' }, pos: { x: 162, y: 294 } },
];

/** 앱 UI 문자열 */
export const STR = {
  monitoring: { ko: '실시간 모니터링 — 이상 없음', en: 'Live monitoring — all clear' },
  liveBadge: { ko: 'LIVE', en: 'LIVE' },
  eventTitle: { ko: '재해 이벤트', en: 'Cat event' },
  scanBtn: { ko: '노출 분석', en: 'Analyze exposure' },
  scanning: { ko: '분석 중…', en: 'Analyzing…' },
  scanDone: { ko: '분석 완료', en: 'Analyzed' },
  exposureTitle: { ko: '노출 특약', en: 'Exposed treaties' },
  awaitingScan: { ko: '노출 분석을 실행하세요', en: 'Run exposure analysis' },
  estLoss: { ko: '예상 손해', en: 'Est. loss' },
  sumTitle: { ko: '예상 영향 합계', en: 'Estimated impact' },
  sumTreaties: { ko: '노출 특약 {n}건', en: '{n} treaties exposed' },
  sumCedents: { ko: '영향 출재사 {n}곳', en: '{n} cedents affected' },
  sumLossLabel: { ko: '총 예상 손해', en: 'Total estimated loss' },
  draftsTitle: { ko: '출재사 알림', en: 'Cedent alerts' },
  draftBtn: { ko: '알림 초안 생성', en: 'Draft alerts' },
  draftingLabel: { ko: '작성 중…', en: 'Drafting…' },
  sendAllBtn: { ko: '일괄 발송 ({n}통)', en: 'Send all ({n})' },
  sentLabel: { ko: '발송 완료', en: 'Sent' },
  toast: { ko: '출재사 {n}곳에 알림이 발송되었습니다', en: 'Alerts sent to {n} cedents' },
  toastSub: { ko: '회신은 받은편지함에서 추적됩니다', en: 'Replies are tracked in your inbox' },
} satisfies Record<string, L>;
