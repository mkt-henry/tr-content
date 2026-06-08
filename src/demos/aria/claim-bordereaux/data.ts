import type { L, Lang } from '../_shared/i18n';

export type ErrorType = 'currency' | 'sum' | 'duplicate';
export type Currency = 'KRW' | 'USD';

/** 셀 오류 — 검증 시 해당 행의 col 셀에 플래그 */
export interface CellError {
  type: ErrorType;
  /** 오류가 표시될 컬럼 */
  col: 'currency' | 'ceded' | 'claimId';
  note: L;
  /** 자동 수정 후 표시 값 (해당 컬럼에 들어갈 문자열) */
  fixValue: string;
}

export interface Row {
  id: number;
  claimId: string;
  /** 손해일 (표기 고정) */
  lossDate: string;
  lob: L;
  currency: Currency;
  /** 총손해액 (백만원 단위 숫자) */
  gross: number;
  /** 출재 회수액 (백만원 단위 숫자) */
  ceded: number;
  error?: CellError;
}

export const ERROR_META: Record<ErrorType, { label: L; badge: string }> = {
  currency: {
    label: { ko: '통화 오류', en: 'Currency error' },
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  },
  sum: {
    label: { ko: '합산 불일치', en: 'Sum mismatch' },
    badge: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
  },
  duplicate: {
    label: { ko: '중복 ID', en: 'Duplicate ID' },
    badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  },
};

/** 검증 순서 = 배열 순서. gross/ceded 단위: 백만원 */
export const ROWS: Row[] = [
  { id: 1, claimId: 'CLM-2026-0411', lossDate: '2026-03-12', lob: { ko: '재물', en: 'Property' }, currency: 'KRW', gross: 1240, ceded: 880 },
  { id: 2, claimId: 'CLM-2026-0427', lossDate: '2026-03-18', lob: { ko: '해상', en: 'Marine' }, currency: 'KRW', gross: 620, ceded: 430 },
  {
    id: 3,
    claimId: 'CLM-2026-0451',
    lossDate: '2026-03-25',
    lob: { ko: '해상', en: 'Marine' },
    currency: 'KRW',
    gross: 2100,
    ceded: 1500,
    // 실제 USD 건인데 KRW로 입력 — 통화 오류
    error: {
      type: 'currency',
      col: 'currency',
      note: {
        ko: '원장은 USD 건이나 보더로에 KRW로 입력 — 환산 시 약 1,300배 과다 계상',
        en: 'Ledger shows USD but bordereaux entered KRW — ~1,300x overstated on conversion',
      },
      fixValue: 'USD',
    },
  },
  { id: 4, claimId: 'CLM-2026-0463', lossDate: '2026-04-02', lob: { ko: '엔지니어링', en: 'Engineering' }, currency: 'KRW', gross: 980, ceded: 700 },
  {
    id: 5,
    claimId: 'CLM-2026-0488',
    lossDate: '2026-04-09',
    lob: { ko: '재물', en: 'Property' },
    currency: 'KRW',
    gross: 540,
    ceded: 760,
    // ceded > gross — 합산 불일치. 정정값 = gross 540 × 70% 출재율 = 378
    error: {
      type: 'sum',
      col: 'ceded',
      note: {
        ko: '출재 회수액이 총손해액을 초과 — 출재율 재계산 필요 (₩760M > ₩540M)',
        en: 'Ceded exceeds gross loss — recompute cession (₩760M > ₩540M)',
      },
      fixValue: '₩378M',
    },
  },
  { id: 6, claimId: 'CLM-2026-0502', lossDate: '2026-04-15', lob: { ko: '배상책임', en: 'Liability' }, currency: 'KRW', gross: 1450, ceded: 1015 },
  {
    id: 7,
    claimId: 'CLM-2026-0427',
    lossDate: '2026-04-21',
    lob: { ko: '해상', en: 'Marine' },
    currency: 'KRW',
    gross: 310,
    ceded: 217,
    // 2행과 동일 claimId — 중복
    error: {
      type: 'duplicate',
      col: 'claimId',
      note: {
        ko: '클레임 번호가 2행과 중복 — 별도 사고 여부 확인 후 재부여 필요',
        en: 'Claim number duplicates row 2 — verify if distinct loss and reassign',
      },
      fixValue: 'CLM-2026-0511',
    },
  },
  { id: 8, claimId: 'CLM-2026-0524', lossDate: '2026-04-28', lob: { ko: '재물', en: 'Property' }, currency: 'KRW', gross: 870, ceded: 609 },
];

/** 컬럼 정의 — 헤더 렌더용 */
export const COLUMNS: { key: 'claimId' | 'lossDate' | 'lob' | 'currency' | 'gross' | 'ceded'; label: L; align: 'left' | 'right' }[] = [
  { key: 'claimId', label: { ko: '클레임 ID', en: 'Claim ID' }, align: 'left' },
  { key: 'lossDate', label: { ko: '손해일', en: 'Loss date' }, align: 'left' },
  { key: 'lob', label: { ko: '보종', en: 'LoB' }, align: 'left' },
  { key: 'currency', label: { ko: '통화', en: 'Ccy' }, align: 'left' },
  { key: 'gross', label: { ko: '총손해액', en: 'Gross' }, align: 'right' },
  { key: 'ceded', label: { ko: '출재 회수액', en: 'Ceded' }, align: 'right' },
];

/** 오류가 있는 행 (3건) */
export const ERROR_ROWS = ROWS.filter((r) => r.error);

/** 백만원 단위 → 표기. ko: ₩1,240M / en: ₩1,240M (통화 KRW 가정, 단위 동일) */
export function amount(n: number): string {
  return `₩${n.toLocaleString('en-US')}M`;
}

/** 자동수정 반영 후의 셀 표시값 — 오류 행/컬럼이면 fixValue, 아니면 원본 */
export function cellValue(row: Row, col: string, fixed: boolean): string {
  if (fixed && row.error && row.error.col === col) return row.error.fixValue;
  if (col === 'gross') return amount(row.gross);
  if (col === 'ceded') return amount(row.ceded);
  if (col === 'claimId') return row.claimId;
  if (col === 'lossDate') return row.lossDate;
  if (col === 'currency') return row.currency;
  return '';
}

/** 검증 요약 — 데이터에서 계산 */
export function summary() {
  return { total: ROWS.length, ok: ROWS.length - ERROR_ROWS.length, errors: ERROR_ROWS.length };
}

/**
 * 정산 산출 — 수정 반영 기준.
 * id 3은 USD로 정정되므로 KRW 정산 합계에서 제외(별도 통화), id 5는 ceded 378로 정정.
 * 정산액 = Σ(KRW 행의 ceded, 수정 반영) − 출재 수수료.
 */
export const SETTLEMENT = {
  commissionRate: 0.15, // 출재 수수료 15%
  quarter: { ko: '2026 Q2', en: '2026 Q2' },
};

/** 합산 불일치 행의 정정 출재액(백만원) — 그리드 표시값 '₩378M'과 일치 */
const FIXED_CEDED_SUM = 378;

/** 정산 청구 금액(백만원) — 수정 반영된 KRW 행 ceded 합계에서 수수료 차감 */
export function settlementAmount(): number {
  const cededSum = ROWS.reduce((s, r) => {
    // USD로 정정되는 행(통화 오류)은 KRW 정산에서 제외
    if (r.error?.type === 'currency') return s;
    // 합산 불일치 행은 정정된 출재액으로 대체
    if (r.error?.type === 'sum') return s + FIXED_CEDED_SUM;
    return s + r.ceded;
  }, 0);
  return Math.round(cededSum * (1 - SETTLEMENT.commissionRate));
}

/** 앱 UI 문자열 */
export const STR = {
  validateBtn: { ko: 'AI 검증', en: 'AI validate' },
  validating: { ko: '검증 중…', en: 'Validating…' },
  validated: { ko: '검증 완료', en: 'Validated' },
  sumTotal: { ko: '{n}행', en: '{n} rows' },
  sumOk: { ko: '정상 {n}', en: '{n} clean' },
  sumErrors: { ko: '오류 {n}', en: '{n} errors' },
  errorsTitle: { ko: '검출된 오류', en: 'Detected errors' },
  fixBtn: { ko: '자동 수정', en: 'Auto-fix' },
  fixingLabel: { ko: '수정 중…', en: 'Fixing…' },
  fixedLabel: { ko: '수정 완료', en: 'Fixed' },
  settleBtn: { ko: '정산 산출', en: 'Compute settlement' },
  settlingLabel: { ko: '산출 중…', en: 'Computing…' },
  settleTitle: { ko: '분기 정산', en: 'Quarterly settlement' },
  settleAmount: { ko: '정산 청구액', en: 'Settlement due' },
  settleNote: { ko: '출재 수수료 15% 차감 · USD 건 별도 정산', en: 'Net of 15% ceding commission · USD items settled separately' },
  toast: { ko: '{q} 정산서가 생성되었습니다', en: '{q} settlement statement generated' },
  toastSub: { ko: '출재사 회신 대기로 전환됩니다', en: 'Moves to awaiting cedent confirmation' },
  fixArrow: { ko: '수정', en: 'Fix' },
} satisfies Record<string, L>;

export type { Lang };
