import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { MIN_RATING, PLACEMENT, QUOTES, STR, type Quote } from './data';
import { usePanelOptimizer } from './state';

/** 등급 칩 색 — 적격(A− 이상)/미달 구분은 안 하고 톤만 */
function RatingChip({ rating }: { rating: string }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
      {rating}
    </span>
  );
}

/** 견적 1행 — 정규화 진행에 따라 스캔 하이라이트, 완료 후 플래그/제외/캡 배지 */
function QuoteRow({ quote, idx }: { quote: Quote; idx: number }) {
  const lang = useLang();
  const { phase, scannedQuotes, currentPanel } = usePanelOptimizer();
  const scanned = scannedQuotes > idx || phase === 'normalized' || phase === 'optimizing' || phase === 'optimized';
  const optimized = phase === 'optimized';
  const panelLine = optimized ? currentPanel().lines.find((l) => l.quoteId === quote.id) : undefined;
  const excluded = optimized && !panelLine;
  const capped = !!panelLine && panelLine.line < quote.offered;

  return (
    <tr
      data-demo-id={quote.id === 'lloyds' ? 'quote-lloyds' : undefined}
      className={cn(
        'border-b border-white/[0.05] transition-colors',
        scanned ? 'opacity-100' : 'opacity-40',
        excluded && 'bg-rose-500/[0.05]',
        panelLine && 'bg-emerald-500/[0.05]',
      )}
    >
      <td className="px-3 py-2.5 text-[13px] font-medium text-zinc-100">{quote.name}</td>
      <td className="px-3 py-2.5"><RatingChip rating={quote.rating} /></td>
      <td className="px-3 py-2.5 text-right font-mono text-[13px] text-zinc-300">{quote.offered}%</td>
      <td className="px-3 py-2.5 text-right font-mono text-[13px] font-semibold text-zinc-100">{quote.rol.toFixed(1)}%</td>
      <td className="px-3 py-2.5 text-[11.5px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span>{pick(quote.terms, lang)}</span>
          {scanned && quote.flag && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
        </div>
      </td>
      <td className="px-3 py-2.5 text-right">
        {optimized && panelLine && (
          <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-emerald-300">
            {panelLine.line}%{capped && <span className="ml-1 text-[10px] font-normal text-amber-300">{pick(STR.capped, lang)}</span>}
          </span>
        )}
        {excluded && (
          <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-medium text-rose-300">
            {pick(STR.excluded, lang)}
          </span>
        )}
      </td>
    </tr>
  );
}

/** 견적 비교표 */
export function QuoteTable() {
  const lang = useLang();
  return (
    <div className="overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-left text-[10.5px] uppercase tracking-wider text-zinc-500">
            <th className="px-3 py-2 font-medium">{pick(STR.colReinsurer, lang)}</th>
            <th className="px-3 py-2 font-medium">{pick(STR.colRating, lang)}</th>
            <th className="px-3 py-2 text-right font-medium">{pick(STR.colOffered, lang)}</th>
            <th className="px-3 py-2 text-right font-medium">{pick(STR.colRol, lang)}</th>
            <th className="px-3 py-2 font-medium">{pick(STR.colTerms, lang)}</th>
            <th className="px-3 py-2 text-right font-medium">{pick(STR.signed, lang)}</th>
          </tr>
        </thead>
        <tbody>
          {QUOTES.map((q, i) => <QuoteRow key={q.id} quote={q} idx={i} />)}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[10.5px] text-zinc-600">{pick(MIN_RATING.label, lang)} · {pick(STR.expiring, lang)} {PLACEMENT.expiringRol.toFixed(1)}%</p>
    </div>
  );
}

/** 100% 스택 배분 바 + 라인 리스트 */
export function PanelAllocation() {
  const lang = useLang();
  const { phase, currentPanel } = usePanelOptimizer();
  if (phase !== 'optimized') return null;
  const panel = currentPanel();
  const colors = ['#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
  const nameOf = (id: string) => QUOTES.find((q) => q.id === id)?.name ?? id;

  return (
    <motion.div
      data-demo-id="panel-result"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-3.5"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-teal-300">
        <CheckCircle2 className="h-4 w-4" /> {pick(STR.panelHeader, lang)}
        <span className="ml-auto rounded-md bg-white/[0.06] px-2 py-0.5 text-[10.5px] font-normal text-zinc-400">
          {pick(panel.constraintLabel, lang)}
        </span>
      </div>
      {/* 스택 바 */}
      <div className="flex h-7 w-full overflow-hidden rounded-lg">
        {panel.lines.map((l, i) => (
          <motion.div
            key={l.quoteId}
            initial={{ width: 0 }}
            animate={{ width: `${l.line}%` }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center text-[10px] font-semibold text-black/70"
            style={{ background: colors[i % colors.length] }}
          >
            {l.line}%
          </motion.div>
        ))}
      </div>
      {/* 라인 리스트 */}
      <div className="mt-2.5 grid grid-cols-1 gap-1">
        {panel.lines.map((l, i) => (
          <div key={l.quoteId} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
            <span className="text-zinc-200">{nameOf(l.quoteId)}</span>
            <span className="ml-auto font-mono font-semibold text-zinc-100">{l.line}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** 요약 메트릭 */
export function SummaryMetrics() {
  const lang = useLang();
  const { phase, currentPanel } = usePanelOptimizer();
  if (phase !== 'optimized') return null;
  const p = currentPanel();
  const cell = (label: string, value: string, accent?: string) => (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <p className="text-[10.5px] text-zinc-500">{label}</p>
      <p className={cn('mt-0.5 font-mono text-[15px] font-semibold', accent ?? 'text-zinc-100')}>{value}</p>
    </div>
  );
  return (
    <div className="mt-2.5 grid grid-cols-2 gap-2">
      {cell(pick(STR.blendedRol, lang), `${p.blendedRol.toFixed(2)}%`)}
      {cell(pick(STR.avgRating, lang), p.avgRating)}
      {cell(pick(STR.premium, lang), `₩${p.premiumEok.toFixed(1)}억`)}
      {cell(pick(STR.saving, lang), `₩${p.savingEok.toFixed(1)}억 (${p.savingPct.toFixed(1)}%)`, 'text-emerald-400')}
    </div>
  );
}

/** 근거 불릿 */
export function RationaleList() {
  const lang = useLang();
  const { phase, currentPanel } = usePanelOptimizer();
  if (phase !== 'optimized') return null;
  const p = currentPanel();
  return (
    <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-300">
        <TrendingDown className="h-3.5 w-3.5 text-teal-400" /> {pick(STR.rationaleHeader, lang)}
      </div>
      <ul className="space-y-1.5">
        {p.rationale.map((r, i) => (
          <motion.li
            key={r.ko}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex gap-1.5 text-[12px] leading-snug text-zinc-400"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400" />
            {pick(r, lang)}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
