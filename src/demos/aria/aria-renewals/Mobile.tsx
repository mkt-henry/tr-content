import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, X } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useRenewals } from './state';
import { RENEWALS, STAGES, STR } from './data';
import { fmt, pick, useLang } from '../_shared/i18n';
import { RenewalCardItem, BriefingPanel } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const { selectedCardId, selectCard } = useRenewals();
  const lang = useLang();

  return (
    <div className="relative flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <CalendarClock className="h-3.5 w-3.5" />
        </div>
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-100">{pick(STR.appTitle, lang)}</h2>
          <p className="text-[9.5px] text-zinc-500">{fmt(pick(STR.seasonMobile, lang), { n: RENEWALS.length })}</p>
        </div>
      </header>

      {/* 세로 그룹 리스트 */}
      <div className="demo-scroll min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {STAGES.map((stage) => {
          const cards = RENEWALS.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-medium text-zinc-400">{pick(stage.label, lang)}</span>
                <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-500">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {cards.map((c, i) => (
                  <RenewalCardItem key={c.id} card={c} index={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 브리핑 풀스크린 시트 */}
      <AnimatePresence>
        {selectedCardId && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 top-12 z-20 flex flex-col rounded-t-3xl border-t border-white/10 bg-[#141318] shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
          >
            <button
              onClick={() => selectCard(null)}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="min-h-0 flex-1">
              <BriefingPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
