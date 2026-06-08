import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { CLAUSES, DOCS, FIX_CLAUSES, STR, VERDICT_META, summary, type Clause } from './data';
import { useSlipCheck } from './state';

/** 판정 칩 */
function VerdictChip({ clause }: { clause: Clause }) {
  const lang = useLang();
  const m = VERDICT_META[clause.verdict];
  return (
    <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[9.5px] font-medium', m.badge)}>
      {pick(m.label, lang)}
    </span>
  );
}

/**
 * 문서 패널 — 한쪽(slip|wording) 조항을 렌더.
 * scanning 중 현재 조항 하이라이트, done에서 판정 테두리. wording은 반영 시 redline.
 */
export function DocPanel({ side }: { side: 'slip' | 'wording' }) {
  const { phase, scannedCount, appliedIds } = useSlipCheck();
  const lang = useLang();
  const doc = DOCS[side];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <FileText className="h-3.5 w-3.5 shrink-0 text-violet-400" />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-zinc-200">{pick(doc.title, lang)}</p>
          <p className="truncate text-[10px] text-zinc-600">{pick(doc.sub, lang)}</p>
        </div>
      </div>
      <div className="demo-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {CLAUSES.map((c, i) => {
          const analyzed = scannedCount > i;
          const scanningNow = phase === 'scanning' && scannedCount === i;
          const applied = appliedIds.includes(c.key);
          const text = side === 'slip' ? c.slipText : c.wordingText;
          const m = VERDICT_META[c.verdict];
          return (
            <div
              key={c.key}
              data-demo-id={`clause-${side}-${c.key}`}
              className={cn(
                'rounded-lg border px-3 py-2 transition-colors',
                scanningNow
                  ? 'border-violet-400/50 bg-violet-500/[0.08] ring-1 ring-inset ring-violet-400/40'
                  : 'border-white/[0.06] bg-white/[0.02]',
                analyzed && c.verdict !== 'match' && !scanningNow &&
                  (c.verdict === 'mismatch' ? 'border-rose-500/30' : 'border-amber-500/30'),
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-[10.5px] font-medium uppercase tracking-wide text-zinc-500">{pick(c.title, lang)}</p>
                <AnimatePresence>
                  {analyzed && (
                    <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
                      <VerdictChip clause={c} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {/* 본문 */}
              {side === 'wording' && c.wordingText === '' ? (
                <p className="text-[11px] italic leading-relaxed text-zinc-600">{pick(STR.missingInWording, lang)}</p>
              ) : applied && c.fix ? (
                <p className="text-[11.5px] leading-relaxed text-zinc-300">
                  <span className="text-rose-400/70 line-through decoration-rose-500/50">{c.fix.from}</span>{' '}
                  <motion.span
                    initial={{ backgroundColor: 'rgba(139,92,246,0.35)' }}
                    animate={{ backgroundColor: 'rgba(139,92,246,0.14)' }}
                    transition={{ duration: 1.2 }}
                    className="rounded px-1 font-medium text-violet-200"
                  >
                    {c.fix.to}
                  </motion.span>
                </p>
              ) : (
                <p
                  className={cn(
                    'text-[11.5px] leading-relaxed',
                    analyzed && c.verdict !== 'match' ? 'text-zinc-200' : 'text-zinc-400',
                  )}
                >
                  {text}
                </p>
              )}
              {/* 판정 설명 — 문제 조항만, done에서 */}
              {analyzed && c.verdict !== 'match' && (
                <p className="mt-1 text-[10px] leading-relaxed" style={{ color: m.dot }}>
                  {pick(c.note, lang)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 파인딩 요약 바 — done에서 등장 */
export function FindingsSummary() {
  const phase = useSlipCheck((s) => s.phase);
  const lang = useLang();
  if (phase !== 'done') return null;
  const s = summary();
  return (
    <motion.div
      data-demo-id="summary-bar"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-400" />
      <span className="text-[11px] font-medium text-zinc-300">{fmt(pick(STR.sumTotal, lang), { n: s.total })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] text-emerald-300">{fmt(pick(STR.sumMatch, lang), { n: s.match })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] font-semibold text-rose-300">{fmt(pick(STR.sumMismatch, lang), { n: s.mismatch })}</span>
      <span className="text-zinc-700">·</span>
      <span className="text-[11px] font-semibold text-amber-300">{fmt(pick(STR.sumMissing, lang), { n: s.missing })}</span>
    </motion.div>
  );
}

/** 수정안 카드 1건 */
function FixCard({ clause }: { clause: Clause }) {
  const { appliedIds } = useSlipCheck();
  const lang = useLang();
  const applied = appliedIds.includes(clause.key);
  if (!clause.fix) return null;
  return (
    <motion.div
      data-demo-id={`finding-${clause.key}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border px-3 py-2.5 transition-colors',
        applied ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-white/[0.07] bg-white/[0.02]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <VerdictChip clause={clause} />
          <span className="text-[11.5px] font-semibold text-zinc-200">{pick(clause.title, lang)}</span>
        </span>
        {applied && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> {pick(STR.appliedLabel, lang)}
          </span>
        )}
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-violet-400">
        <Sparkles className="h-3 w-3" /> {pick(STR.fixLabel, lang)}
      </p>
      <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-zinc-300">
        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" />
        <span className="font-medium text-violet-200">{clause.fix.to}</span>
      </p>
      <p className="mt-1 text-[10px] text-zinc-500">{pick(clause.fix.note, lang)}</p>
    </motion.div>
  );
}

/** 파인딩 패널 — 수정안 카드 + 전체 반영 버튼 + 리포트 배지. done에서 등장 */
export function FindingsPanel() {
  const { phase, appliedIds, applying, reportReady, applyAll } = useSlipCheck();
  const lang = useLang();
  if (phase !== 'done') return null;
  const notApplied = appliedIds.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-medium uppercase tracking-wider text-zinc-600">{pick(STR.findingsTitle, lang)}</p>
        {notApplied && (
          <button
            data-demo-id="apply-all"
            onClick={applyAll}
            disabled={applying}
            className="rounded-lg bg-violet-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-violet-400 disabled:opacity-60"
          >
            {applying ? pick(STR.applyingLabel, lang) : fmt(pick(STR.applyAllBtn, lang), { n: FIX_CLAUSES.length })}
          </button>
        )}
      </div>
      {FIX_CLAUSES.map((c) => (
        <FixCard key={c.key} clause={c} />
      ))}
      <AnimatePresence>
        {reportReady && (
          <motion.div
            data-demo-id="report-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-2.5"
          >
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {pick(STR.reportBadge, lang)}
            </p>
            <p className="mt-0.5 pl-5 text-[10px] text-zinc-500">{fmt(pick(STR.toast, lang), { n: FIX_CLAUSES.length })}</p>
            <p className="mt-0.5 pl-5 text-[10px] text-zinc-600">{pick(STR.toastSub, lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
