import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { CheckCircle2, Mail, Radar, Siren, Sparkles } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { ALERTS, EVENT, EXPOSURES, SEVERITY_META, STR, lossLabel, summary } from './data';
import { useWarroom } from './state';

/** 손해액 카운트업 — assessed 진입 시 1회 재생 */
function CountUp({ to, format }: { to: number; format: (n: number) => string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, { duration: 1.2, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [to]);
  return <>{format(val)}</>;
}

/** 속보 배너 — 지도 상단 오버레이 */
export function AlertBanner() {
  const phase = useWarroom((s) => s.phase);
  const lang = useLang();
  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          data-demo-id="alert-banner"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-[#190a0e]/95 px-3.5 py-2.5 shadow-xl backdrop-blur"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
            {pick(STR.liveBadge, lang)}
          </span>
          <p className="min-w-0 truncate text-[12px] font-semibold text-rose-100">{pick(EVENT.headline, lang)}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 이벤트 카드 — 사이드바 상단, 노출 분석 버튼 포함 */
export function EventCard() {
  const { phase, scanExposures } = useWarroom();
  const lang = useLang();

  if (phase === 'idle') {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3">
        <Radar className="h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-[12px] text-zinc-400">{pick(STR.monitoring, lang)}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-rose-500/25 bg-rose-500/[0.06] p-3.5"
    >
      <p className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-rose-400">
        <Siren className="h-3.5 w-3.5" /> {pick(STR.eventTitle, lang)}
      </p>
      <p className="mt-1.5 text-[13.5px] font-semibold text-zinc-100">{pick(EVENT.name, lang)}</p>
      <p className="mt-0.5 text-[11px] text-rose-200/80">{pick(EVENT.category, lang)}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{pick(EVENT.detail, lang)}</p>
      <button
        data-demo-id="scan-run"
        onClick={scanExposures}
        disabled={phase !== 'alert'}
        className={cn(
          'mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors',
          phase === 'alert' && 'bg-rose-500 text-white hover:bg-rose-400',
          phase === 'scanning' && 'bg-rose-500/20 text-rose-300',
          phase === 'assessed' && 'bg-emerald-500/15 text-emerald-300',
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {phase === 'alert' && pick(STR.scanBtn, lang)}
        {phase === 'scanning' && pick(STR.scanning, lang)}
        {phase === 'assessed' && pick(STR.scanDone, lang)}
      </button>
    </motion.div>
  );
}

/** 노출 특약 리스트 — 점등 순서대로 등장 */
export function ExposureList() {
  const { phase, revealedIds } = useWarroom();
  const lang = useLang();
  if (phase === 'idle') return null;
  const revealed = EXPOSURES.filter((e) => revealedIds.includes(e.id));

  return (
    <div>
      <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wider text-zinc-600">
        {pick(STR.exposureTitle, lang)}
      </p>
      {revealed.length === 0 && <p className="text-[11.5px] text-zinc-600">{pick(STR.awaitingScan, lang)}</p>}
      <div className="space-y-1.5">
        {revealed.map((e) => (
          <motion.div
            key={e.id}
            data-demo-id={`exposure-item-${e.id}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-[12px] font-semibold text-zinc-200">{pick(e.treaty, lang)}</p>
              <span className={cn('shrink-0 rounded-md border px-1.5 py-0.5 text-[9.5px] font-medium', SEVERITY_META[e.severity].badge)}>
                {pick(SEVERITY_META[e.severity].label, lang)}
              </span>
            </div>
            <p className="mt-0.5 text-[10.5px] text-zinc-500">
              {pick(e.cedent, lang)} · {pick(e.region, lang)} · TSI {pick(e.tsi, lang)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-rose-300/90">
              {pick(STR.estLoss, lang)} {lossLabel(e.loss, lang)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** 합계 카드 — assessed에서 카운트업 */
export function SummaryCard() {
  const phase = useWarroom((s) => s.phase);
  const lang = useLang();
  if (phase !== 'assessed') return null;
  const s = summary();

  return (
    <motion.div
      data-demo-id="summary-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-rose-500/25 bg-gradient-to-br from-rose-500/[0.12] to-transparent p-3.5"
    >
      <p className="text-[10.5px] font-medium uppercase tracking-wider text-rose-400">{pick(STR.sumTitle, lang)}</p>
      <p className="mt-2 text-[11px] text-zinc-400">{pick(STR.sumLossLabel, lang)}</p>
      <p className="text-[22px] font-bold tracking-tight text-rose-200">
        <CountUp to={s.totalLoss} format={(n) => lossLabel(n, lang)} />
      </p>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
        <span>{fmt(pick(STR.sumTreaties, lang), { n: s.count })}</span>
        <span className="text-zinc-700">·</span>
        <span>{fmt(pick(STR.sumCedents, lang), { n: s.cedents })}</span>
      </div>
    </motion.div>
  );
}

/** 출재사 알림 패널 — assessed에서 초안 생성 → 일괄 발송 */
export function AlertDraftsPanel() {
  const { phase, draftedCount, drafting, sent, draftAlerts, sendAll } = useWarroom();
  const lang = useLang();
  if (phase !== 'assessed') return null;
  const allDrafted = draftedCount === ALERTS.length;

  return (
    <div className="relative rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-zinc-500">
          <Mail className="h-3.5 w-3.5" /> {pick(STR.draftsTitle, lang)}
        </p>
        {draftedCount === 0 && (
          <button
            data-demo-id="draft-run"
            onClick={draftAlerts}
            disabled={drafting}
            className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-rose-400 disabled:opacity-60"
          >
            {drafting ? pick(STR.draftingLabel, lang) : pick(STR.draftBtn, lang)}
          </button>
        )}
      </div>
      <div className="mt-2.5 space-y-2">
        {ALERTS.slice(0, draftedCount).map((a) => (
          <motion.div
            key={a.cedent.en}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-zinc-300">{pick(a.cedent, lang)}</p>
              {sent && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> {pick(STR.sentLabel, lang)}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[11.5px] text-zinc-400">{pick(a.subject, lang)}</p>
            <p className="mt-1 line-clamp-2 whitespace-pre-line text-[10.5px] leading-relaxed text-zinc-600">
              {pick(a.body, lang)}
            </p>
          </motion.div>
        ))}
      </div>
      {allDrafted && !sent && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          data-demo-id="send-all"
          onClick={sendAll}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-500 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-rose-400"
        >
          {fmt(pick(STR.sendAllBtn, lang), { n: ALERTS.length })}
        </motion.button>
      )}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-2.5"
          >
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {fmt(pick(STR.toast, lang), { n: ALERTS.length })}
            </p>
            <p className="mt-0.5 pl-5 text-[10px] text-zinc-500">{pick(STR.toastSub, lang)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
