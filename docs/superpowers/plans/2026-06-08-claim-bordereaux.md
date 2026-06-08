# 클레임 보더로 처리 데모 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ARIA Demo Studio에 "클레임 보더로 처리" 데모(보더로 그리드 행 단위 검증 → 오류 플래그/자동수정 → 정산 산출)를 추가한다.

**Architecture:** 기존 데모 패턴 — `src/demos/aria/claim-bordereaux/`에 zustand 스토어 + 자동 재생 시나리오 + Desktop/Mobile. registry glob 자동 등록. 스펙: `docs/superpowers/specs/2026-06-08-claim-bordereaux-design.md`

**Tech Stack:** React 18 + TypeScript + zustand 5 + framer-motion 11(`animate()` 카운트업) + Tailwind 4 + lucide-react. 테스트 러너 없음 — 검증은 `npx tsc --noEmit` + dev 서버 수동 재생.

**검증 공통:** 각 태스크 ① `npx tsc --noEmit` 통과 ② 마지막 태스크에서 `npm run build`. 커밋은 태스크당 1회, 해당 파일만 (작업 트리에 무관한 미커밋 변경 다수 — 절대 같이 커밋 금지).

---

### Task 1: 데이터 모델 + 더미 데이터 (`data.ts`)

**Files:**
- Create: `src/demos/aria/claim-bordereaux/data.ts`

- [ ] **Step 1: data.ts 작성**

```ts
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
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/claim-bordereaux/data.ts
git commit -m "feat(claim-bordereaux): 데이터 모델 — 보더로 8행(오류 3건) + 정산 산출"
```

---

### Task 2: zustand 스토어 (`state.ts`)

**Files:**
- Create: `src/demos/aria/claim-bordereaux/state.ts`

slip-check/cat-warroom에서 확립한 runId 가드 + phase 가드 패턴을 따른다.

- [ ] **Step 1: state.ts 작성**

```ts
import { create } from 'zustand';
import { ROWS } from './data';

export type Phase = 'raw' | 'validating' | 'validated' | 'settled';

interface BordereauxState {
  phase: Phase;
  /** 검증 완료된 행 수 — 스캔 하이라이트는 인덱스 scannedRows에 표시 */
  scannedRows: number;
  /** 오류 자동 수정 반영 여부 */
  fixed: boolean;
  settling: boolean;
  /** 정산 청구 금액 산출 완료 시 표시 트리거 */
  settledShown: boolean;
  /** raw → validating → validated: 행 순차 검증 */
  validate: () => void;
  /** v2 시작 상태 — 검증 완료로 세팅 */
  seedValidated: () => void;
  /** 오류 셀 일괄 수정 */
  autoFix: () => void;
  /** 정산 산출 → settled */
  settle: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useBordereaux = create<BordereauxState>((set, get) => ({
  phase: 'raw',
  scannedRows: 0,
  fixed: false,
  settling: false,
  settledShown: false,

  validate: () => {
    if (get().phase !== 'raw') return;
    const id = ++runId;
    set({ phase: 'validating' });
    void (async () => {
      for (let i = 1; i <= ROWS.length; i++) {
        await sleep(450);
        if (id !== runId) return;
        set({ scannedRows: i });
      }
      await sleep(500);
      if (id !== runId) return;
      set({ phase: 'validated' });
    })();
  },

  seedValidated: () => {
    runId++;
    set({ phase: 'validated', scannedRows: ROWS.length, fixed: false, settling: false, settledShown: false });
  },

  autoFix: () => {
    if (get().phase !== 'validated' || get().fixed) return;
    set({ fixed: true });
  },

  settle: () => {
    const { phase, fixed, settling } = get();
    if (phase !== 'validated' || !fixed || settling) return;
    const id = ++runId;
    set({ settling: true });
    void (async () => {
      await sleep(900);
      if (id !== runId) return;
      set({ phase: 'settled', settling: false, settledShown: true });
    })();
  },

  reset: () => {
    runId++;
    set({ phase: 'raw', scannedRows: 0, fixed: false, settling: false, settledShown: false });
  },
}));
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/claim-bordereaux/state.ts
git commit -m "feat(claim-bordereaux): zustand 스토어 — raw/validating/validated/settled"
```

---

### Task 3: 공용 위젯 (`widgets.tsx`)

**Files:**
- Create: `src/demos/aria/claim-bordereaux/widgets.tsx`

그리드(BordereauxGrid: 헤더 + 행 + 셀 플래그/수정), 검증 요약 바, 오류 카드, 정산 카드.

- [ ] **Step 1: widgets.tsx 작성**

```tsx
import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle2, Receipt, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import {
  COLUMNS,
  ERROR_META,
  ERROR_ROWS,
  ROWS,
  SETTLEMENT,
  STR,
  amount,
  cellValue,
  settlementAmount,
  summary,
  type Row,
} from './data';
import { useBordereaux } from './state';

/** 금액 카운트업 */
function CountUp({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, { duration: 1.1, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [to]);
  return <>{amount(val)}</>;
}

/** 한 셀 */
function Cell({ row, col, align }: { row: Row; col: string; align: 'left' | 'right' }) {
  const { phase, scannedRows, fixed } = useBordereaux();
  const lang = useLang();
  const rowIndex = ROWS.findIndex((r) => r.id === row.id);
  const analyzed = scannedRows > rowIndex;
  const isErrorCell = !!row.error && row.error.col === col;
  const flagged = analyzed && isErrorCell && !fixed;
  const justFixed = fixed && isErrorCell;

  let content: string;
  if (col === 'lob') content = pick(row.lob, lang);
  else content = cellValue(row, col, fixed);

  return (
    <td
      data-demo-id={isErrorCell ? `cell-${row.id}-${col}` : undefined}
      className={cn(
        'whitespace-nowrap px-3 py-2 text-[11.5px] transition-colors',
        align === 'right' ? 'text-right tabular-nums' : 'text-left',
        flagged && 'bg-rose-500/15 text-rose-200 ring-1 ring-inset ring-rose-500/40',
        justFixed && 'bg-indigo-500/15 text-indigo-200',
        !flagged && !justFixed && 'text-zinc-300',
      )}
    >
      <span className="inline-flex items-center gap-1">
        {flagged && <AlertTriangle className="h-3 w-3 shrink-0 text-rose-400" />}
        {content}
      </span>
    </td>
  );
}

/** 보더로 그리드 */
export function BordereauxGrid() {
  const { phase, scannedRows } = useBordereaux();
  const lang = useLang();

  return (
    <div className="demo-scroll min-h-0 flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-[#0c0d16]">
          <tr className="border-b border-white/[0.08]">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'whitespace-nowrap px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500',
                  c.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {pick(c.label, lang)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => {
            const scanningNow = phase === 'validating' && scannedRows === i;
            return (
              <tr
                key={row.id}
                data-demo-id={`row-${row.id}`}
                className={cn(
                  'border-b border-white/[0.04] transition-colors',
                  scanningNow ? 'bg-indigo-500/[0.1]' : 'hover:bg-white/[0.02]',
                )}
              >
                {COLUMNS.map((c) => (
                  <Cell key={c.key} row={row} col={c.key} align={c.align} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 검증 요약 바 — validated 이상에서 등장 */
export function ValidationSummary() {
  const phase = useBordereaux((s) => s.phase);
  const lang = useLang();
  if (phase === 'raw' || phase === 'validating') return null;
  const s = summary();
  return (
    <motion.div
      data-demo-id="summary-bar"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
      <span className="text-[11px] font-medium text-zinc-300">{fmt(pick(STR.sumTotal, lang), { n: s.total })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] text-emerald-300">{fmt(pick(STR.sumOk, lang), { n: s.ok })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] font-semibold text-rose-300">{fmt(pick(STR.sumErrors, lang), { n: s.errors })}</span>
    </motion.div>
  );
}

/** 오류 카드 1건 */
function ErrorCard({ row }: { row: Row }) {
  const { fixed } = useBordereaux();
  const lang = useLang();
  if (!row.error) return null;
  const meta = ERROR_META[row.error.type];
  return (
    <motion.div
      data-demo-id={`error-card-${row.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border px-3 py-2.5 transition-colors',
        fixed ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-white/[0.07] bg-white/[0.02]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className={cn('rounded-md border px-1.5 py-0.5 text-[9.5px] font-medium', meta.badge)}>
            {pick(meta.label, lang)}
          </span>
          <span className="font-mono text-[11px] text-zinc-400">{row.claimId}</span>
        </span>
        {fixed && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> {pick(STR.fixedLabel, lang)}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">{pick(row.error.note, lang)}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-indigo-300">
        <ArrowRight className="h-3 w-3 shrink-0" />
        <span className="font-medium">{pick(STR.fixArrow, lang)}: {row.error.fixValue}</span>
      </p>
    </motion.div>
  );
}

/** 파인딩/정산 패널 — validated 이상에서 등장 */
export function SidePanel() {
  const { phase, fixed, settling, settledShown, autoFix, settle } = useBordereaux();
  const lang = useLang();
  if (phase === 'raw' || phase === 'validating') return null;

  return (
    <div className="space-y-3">
      {/* 오류 섹션 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-600">{pick(STR.errorsTitle, lang)}</p>
          {!fixed && (
            <button
              data-demo-id="fix-run"
              onClick={autoFix}
              className="rounded-lg bg-indigo-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-indigo-400"
            >
              {pick(STR.fixBtn, lang)}
            </button>
          )}
        </div>
        {ERROR_ROWS.map((r) => (
          <ErrorCard key={r.id} row={r} />
        ))}
      </div>

      {/* 정산 섹션 — 수정 완료 후 */}
      {fixed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 border-t border-white/[0.06] pt-3">
          {!settledShown && (
            <button
              data-demo-id="settle-run"
              onClick={settle}
              disabled={settling}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-500 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-60"
            >
              <Receipt className="h-3.5 w-3.5" />
              {settling ? pick(STR.settlingLabel, lang) : pick(STR.settleBtn, lang)}
            </button>
          )}
          <AnimatePresence>
            {settledShown && (
              <motion.div
                data-demo-id="settle-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/[0.12] to-transparent p-3.5"
              >
                <p className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-indigo-300">
                  <Receipt className="h-3.5 w-3.5" /> {pick(STR.settleTitle, lang)} · {pick(SETTLEMENT.quarter, lang)}
                </p>
                <p className="mt-2 text-[11px] text-zinc-400">{pick(STR.settleAmount, lang)}</p>
                <p className="text-[22px] font-bold tracking-tight text-indigo-200">
                  <CountUp to={settlementAmount()} />
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">{pick(STR.settleNote, lang)}</p>
                <div className="mt-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {fmt(pick(STR.toast, lang), { q: pick(SETTLEMENT.quarter, lang) })}
                  </p>
                  <p className="mt-0.5 pl-5 text-[10px] text-zinc-500">{pick(STR.toastSub, lang)}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0. (`fmt`의 vars는 `Record<string, string|number>` — `{ q: pick(...) }` 문자열 OK)

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/claim-bordereaux/widgets.tsx
git commit -m "feat(claim-bordereaux): 그리드(스캔·플래그·수정)·검증 요약·오류/정산 카드 위젯"
```

---

### Task 4: 데스크톱 레이아웃 (`Desktop.tsx`)

**Files:**
- Create: `src/demos/aria/claim-bordereaux/Desktop.tsx`

- [ ] **Step 1: Desktop.tsx 작성**

```tsx
import { Table2, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useBordereaux } from './state';
import { BordereauxGrid, SidePanel, ValidationSummary } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const { phase, validate } = useBordereaux();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/90 text-white">
          <Table2 className="h-4 w-4" />
        </div>
        <span className="text-[14px] font-semibold text-zinc-100">
          ARIA Bordereaux <span className="text-[10px] font-normal text-zinc-500">by Treasurer</span>
        </span>
        <button
          data-demo-id="validate-run"
          onClick={validate}
          disabled={phase !== 'raw'}
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors',
            phase === 'raw' && 'bg-indigo-500 text-white hover:bg-indigo-400',
            phase === 'validating' && 'bg-indigo-500/20 text-indigo-300',
            (phase === 'validated' || phase === 'settled') && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {phase === 'raw' && pick(STR.validateBtn, lang)}
          {phase === 'validating' && pick(STR.validating, lang)}
          {(phase === 'validated' || phase === 'settled') && pick(STR.validated, lang)}
        </button>
      </header>

      {/* 본문: 그리드 + 사이드 */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col border-r border-white/[0.06]">
          <BordereauxGrid />
          <ValidationSummary />
        </div>
        <aside className="demo-scroll w-[320px] shrink-0 overflow-y-auto bg-[#0b0c14] p-3.5">
          <SidePanel />
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/claim-bordereaux/Desktop.tsx
git commit -m "feat(claim-bordereaux): 데스크톱 — 그리드 + 정산 사이드"
```

---

### Task 5: 모바일 레이아웃 (`Mobile.tsx`)

**Files:**
- Create: `src/demos/aria/claim-bordereaux/Mobile.tsx`

그리드 가로 스크롤 상단(flex-[3]) + 하단 사이드 패널 인라인(flex-[2]).

- [ ] **Step 1: Mobile.tsx 작성**

```tsx
import { Table2, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useBordereaux } from './state';
import { BordereauxGrid, SidePanel, ValidationSummary } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const { phase, validate } = useBordereaux();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-indigo-500/90 text-white">
          <Table2 className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-semibold text-zinc-100">ARIA Bordereaux</span>
        <button
          data-demo-id="validate-run"
          onClick={validate}
          disabled={phase !== 'raw'}
          className={cn(
            'ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
            phase === 'raw' && 'bg-indigo-500 text-white',
            phase === 'validating' && 'bg-indigo-500/20 text-indigo-300',
            (phase === 'validated' || phase === 'settled') && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3 w-3" />
          {phase === 'raw' && pick(STR.validateBtn, lang)}
          {phase === 'validating' && pick(STR.validating, lang)}
          {(phase === 'validated' || phase === 'settled') && pick(STR.validated, lang)}
        </button>
      </header>

      {/* 그리드 — 상단 */}
      <div className="flex min-h-0 flex-[3] flex-col border-b border-white/[0.06]">
        <BordereauxGrid />
        <ValidationSummary />
      </div>

      {/* 사이드 패널 — 하단 인라인 */}
      <div className="demo-scroll min-h-0 flex-[2] overflow-y-auto p-3.5">
        <SidePanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크** — `npx tsc --noEmit`, exit 0.

- [ ] **Step 3: 커밋**

```powershell
git add src/demos/aria/claim-bordereaux/Mobile.tsx
git commit -m "feat(claim-bordereaux): 모바일 — 그리드 + 인라인 정산 패널"
```

---

### Task 6: 시나리오 + 갤러리 등록 (`scenario.ts`, `index.ts`)

**Files:**
- Create: `src/demos/aria/claim-bordereaux/scenario.ts`
- Create: `src/demos/aria/claim-bordereaux/index.ts`

타이밍 근거: v1 — 검증 8행 × 450ms + 500ms = 4100ms → 4500ms 대기. v2 — autoFix 즉시 + settle 900ms → fix 후 1500ms, settle 후 2000ms.

- [ ] **Step 1: scenario.ts 작성**

```ts
import type { Scenario } from '../../../engine/types';
import { ERROR_ROWS } from './data';
import { useBordereaux } from './state';

const st = () => useBordereaux.getState();
const FIRST_ERROR = ERROR_ROWS[0].id;

/** v1 — 행 단위 자동 검증: 검증 클릭 → 행 순차 스캔 → 오류 셀 플래그 → 요약 + 오류 카드 */
export const validateScenario: Scenario = {
  id: 'bdx-validate',
  steps: [
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'validate-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'validate-run', run: () => st().validate() },
    { kind: 'wait', ms: 4500 },
    { kind: 'cursor', target: `cell-${FIRST_ERROR}-currency`, ms: 800 },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'summary-bar', ms: 700 },
    { kind: 'wait', ms: 1400 },
  ],
};

/** v2 — 정산 대조 → 청구서: 검증 완료 → 자동 수정 → 정산 산출 → 정산 카드 */
export const settleScenario: Scenario = {
  id: 'bdx-settle',
  steps: [
    { kind: 'do', run: () => st().seedValidated() },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'fix-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'fix-run', run: () => st().autoFix() },
    { kind: 'wait', ms: 1500 },
    { kind: 'cursor', target: 'settle-run', ms: 700 },
    { kind: 'wait', ms: 300 },
    { kind: 'click', target: 'settle-run', run: () => st().settle() },
    { kind: 'wait', ms: 2200 },
  ],
};
```

- [ ] **Step 2: index.ts 작성**

```ts
import { Table2 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useBordereaux } from './state';
import { settleScenario, validateScenario } from './scenario';

const claimBordereaux: FeatureDefinition = {
  id: 'claim-bordereaux',
  title: '클레임 보더로 처리',
  description: '출재사 클레임 보더로(bordereaux)를 AI가 행 단위로 검증하고, 오류를 잡아 정산 금액까지 산출합니다.',
  icon: Table2,
  accent: '#6366f1',
  Desktop,
  Mobile,
  resetState: () => useBordereaux.getState().reset(),
  variants: [
    {
      id: 'validate',
      label: '행 단위 자동 검증',
      version: 'v1',
      sellingPoint: '데이터 품질',
      url: 'insightre.ai/bordereaux',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(99,102,241,0.24), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(40,40,110,0.32), transparent 60%), linear-gradient(160deg, #0c0d1a 0%, #07070e 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-blue-900/25 blur-[120px]',
        ],
      },
      scenario: validateScenario,
    },
    {
      id: 'settle',
      label: '정산 대조 → 청구서',
      version: 'v2',
      sellingPoint: '정산 자동화',
      url: 'insightre.ai/bordereaux',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(79,70,229,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(30,30,90,0.32), transparent 60%), linear-gradient(165deg, #0b0c17 0%, #06060c 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-600/10 blur-[140px]'],
      },
      scenario: settleScenario,
    },
  ],
};

export default claimBordereaux;
```

- [ ] **Step 3: 전체 빌드** — `npm run build`, exit 0.

- [ ] **Step 4: 커밋**

```powershell
git add src/demos/aria/claim-bordereaux/scenario.ts src/demos/aria/claim-bordereaux/index.ts
git commit -m "feat(claim-bordereaux): 시나리오 2종 + 갤러리 등록"
```

---

### Task 7: 런타임 검증

**Files:** 없음 (검증만 — 이전 데모 Task와 동일: dev 서버 + 브라우저)

- [ ] **Step 1:** `npm run dev` 백그라운드 기동 (포트는 출력 확인 — 5173~5175 점유 시 다음 포트)
- [ ] **Step 2:** 갤러리에 "클레임 보더로 처리" 카드(인디고, Table2 아이콘) 등장 확인
- [ ] **Step 3: v1 (데스크톱)** — 보더로 그리드 → "AI 검증" → 8행 순차 스캔 하이라이트 → 오류 셀 3개 로즈 플래그(3행 통화 / 5행 ceded / 7행 claimId) → 요약 바 "8행 · 정상 5 · 오류 3" → 우측 오류 카드 3건
- [ ] **Step 4: v2 (데스크톱)** — 검증 완료 시작 → "자동 수정" → 오류 셀 3개 인디고로 교체(USD / ₩378M / CLM-2026-0511) + 오류 카드 "수정 완료" → "정산 산출" → 정산 청구액 카운트업 + 분기 정산 카드 + 토스트
- [ ] **Step 5:** 모바일 양 변형(그리드 가로 스크롤 확인) + EN 전환 + 검증/정산 중 리셋 (고스트 타이머 없음)
- [ ] **Step 6:** 발견 이슈 수정·커밋 후 종료. 검증 스크린샷은 `.verify-bdx-*.png`로 저장하고 종료 시 삭제
