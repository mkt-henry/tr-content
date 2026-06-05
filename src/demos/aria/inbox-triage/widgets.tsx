import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, FileText, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import {
  CATEGORY_META,
  EMAILS,
  EXTRACTION,
  PRIORITY_META,
  STR,
  sortedEmails,
  summaryCounts,
  type Email,
} from './data';
import { useInbox } from './state';

/** 카테고리·우선순위·마감 배지 줄 — 분석 완료된 메일에 표시 */
function BadgeRow({ email }: { email: Email }) {
  const lang = useLang();
  const { category, priority, due } = email.analysis;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 flex flex-wrap items-center gap-1.5"
    >
      <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium', CATEGORY_META[category].badge)}>
        {pick(CATEGORY_META[category].label, lang)}
      </span>
      <span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_META[priority].badge)}>
        {pick(PRIORITY_META[priority].label, lang)}
      </span>
      {due && (
        <span className="rounded-md border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
          {pick(due, lang)}
        </span>
      )}
    </motion.div>
  );
}

/** 분류 완료 후 상단 요약 바 */
export function SummaryBar() {
  const phase = useInbox((s) => s.phase);
  const lang = useLang();
  if (phase !== 'sorted') return null;
  const c = summaryCounts();
  const items = [
    fmt(pick(STR.sumSubmission, lang), { n: c.submission }),
    fmt(pick(STR.sumRenewal, lang), { n: c.renewal }),
    fmt(pick(STR.sumClaim, lang), { n: c.claim }),
    fmt(pick(STR.sumDueToday, lang), { n: c.dueToday }),
  ];
  return (
    <motion.div
      data-demo-id="summary-bar"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 border-b border-amber-500/15 bg-amber-500/[0.06] px-4 py-2"
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
      {items.map((t, i) => (
        <span key={i} className={cn('text-[11px]', i === items.length - 1 ? 'font-semibold text-rose-300' : 'text-amber-200/90')}>
          {t}
          {i < items.length - 1 && <span className="ml-2 text-amber-500/40">·</span>}
        </span>
      ))}
    </motion.div>
  );
}

/** 메일 리스트 — phase에 따라 도착순/우선순위순, layout 애니메이션으로 재정렬 */
export function EmailList({ compact }: { compact?: boolean }) {
  const { phase, scannedIds, selectedId, hoveredId, selectEmail, setHovered } = useInbox();
  const lang = useLang();
  const emails = phase === 'sorted' ? sortedEmails() : EMAILS;
  const lastScanned = scannedIds[scannedIds.length - 1];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {emails.map((e) => {
        const analyzed = scannedIds.includes(e.id);
        const scanningNow = phase === 'scanning' && lastScanned === e.id;
        return (
          <motion.button
            key={e.id}
            layout
            transition={{ layout: { type: 'spring', stiffness: 320, damping: 30 } }}
            data-demo-id={`email-row-${e.id}`}
            onClick={() => selectEmail(e.id)}
            onMouseEnter={() => phase === 'sorted' && setHovered(e.id)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'block w-full border-b border-white/[0.04] px-4 py-3 text-left transition-colors',
              selectedId === e.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]',
              scanningNow && 'bg-amber-500/[0.07] ring-1 ring-inset ring-amber-400/40',
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                {!analyzed && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />}
                <span className="truncate text-[12px] font-semibold text-zinc-200">{pick(e.sender, lang)}</span>
              </span>
              <span className="shrink-0 text-[10.5px] text-zinc-600">{pick(e.time, lang)}</span>
            </div>
            <p className="mt-0.5 truncate text-[12px] text-zinc-300">{pick(e.subject, lang)}</p>
            {!compact && <p className="mt-0.5 truncate text-[11px] text-zinc-600">{pick(e.preview, lang)}</p>}
            {e.attachment && (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-zinc-500">
                <Paperclip className="h-3 w-3" /> {e.attachment}
              </span>
            )}
            <AnimatePresence>{analyzed && <BadgeRow key={e.id} email={e} />}</AnimatePresence>
            <AnimatePresence>
              {hoveredId === e.id && analyzed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] px-2.5 py-2">
                    <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-amber-400">
                      <Sparkles className="h-3 w-3" /> {pick(STR.aiSummary, lang)}
                    </p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-amber-100/90">{pick(e.analysis.summary, lang)}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

/** 상세 패널 — 본문 + 첨부 칩 + (추출 대상이면) 핵심 추출 → 파이프라인 등록 */
export function DetailPane({ compact }: { compact?: boolean }) {
  const { selectedId, extracting, extractedCount, pipelineAdded, extract, addToPipeline } = useInbox();
  const lang = useLang();
  const email = EMAILS.find((e) => e.id === selectedId);

  if (!email) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-[12px] text-zinc-600">
        {pick(STR.detailEmpty, lang)}
      </div>
    );
  }

  const extractable = email.id === EXTRACTION.emailId;
  const allExtracted = extractedCount === EXTRACTION.fields.length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className={cn('border-b border-white/[0.06] px-5 py-4', compact && 'px-4 py-3')}>
        <p className="text-[14px] font-semibold text-zinc-100">{pick(email.subject, lang)}</p>
        <p className="mt-1 text-[11.5px] text-zinc-500">
          {pick(email.sender, lang)} · {pick(email.time, lang)}
        </p>
      </div>
      <div className={cn('px-5 py-4', compact && 'px-4 py-3')}>
        <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-zinc-300">{pick(email.body, lang)}</p>
        {email.attachment && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-zinc-400">
            <FileText className="h-3.5 w-3.5 text-amber-400" /> {email.attachment}
          </span>
        )}

        {extractable && (
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-300">
                <Sparkles className="h-3.5 w-3.5" /> {pick(STR.extractTitle, lang)}
              </p>
              {extractedCount === 0 && (
                <button
                  data-demo-id="extract-run"
                  onClick={extract}
                  disabled={extracting}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11.5px] font-semibold text-[#27180a] transition-colors hover:bg-amber-400 disabled:opacity-60"
                >
                  {extracting ? pick(STR.extractingLabel, lang) : pick(STR.extractBtn, lang)}
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {EXTRACTION.fields.slice(0, extractedCount).map((f) => (
                <motion.div
                  key={f.label.en}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">{pick(f.label, lang)}</p>
                  <p className="mt-0.5 text-[12px] font-medium text-zinc-200">{pick(f.value, lang)}</p>
                </motion.div>
              ))}
            </div>
            {allExtracted && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                data-demo-id="pipeline-add"
                onClick={addToPipeline}
                disabled={pipelineAdded}
                className={cn(
                  'mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors',
                  pipelineAdded
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-amber-500 text-[#27180a] hover:bg-amber-400',
                )}
              >
                {pipelineAdded ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> {pick(STR.pipelineAdded, lang)}
                  </>
                ) : (
                  pick(STR.pipelineBtn, lang)
                )}
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* 등록 완료 토스트 */}
      <AnimatePresence>
        {pipelineAdded && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-emerald-500/30 bg-[#0a1410]/95 px-4 py-3 shadow-xl backdrop-blur"
          >
            <p className="flex items-center gap-2 text-[12px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {pick(STR.toast, lang)}
            </p>
            <p className="mt-0.5 pl-6 text-[10.5px] text-zinc-500">{pick(STR.toastSub, lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
