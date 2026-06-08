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
  const { scannedRows, fixed } = useBordereaux();
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
