import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import type { DemoComponentProps } from '../../registry/types';
import { useRenewals } from './state';
import { RENEWALS, STAGES } from './data';
import { RenewalCardItem, BriefingPanel } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const selectedCardId = useRenewals((s) => s.selectedCardId);

  return (
    <div className="flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <CalendarClock className="h-4 w-4" />
        </div>
        <h2 className="text-[13.5px] font-semibold text-zinc-100">
          갱신 파이프라인 <span className="ml-1 text-[10px] font-normal text-zinc-500">ARIA by Treasurer</span>
        </h2>
        <span className="ml-auto font-mono text-[10.5px] text-zinc-600">2026 1/1 갱신 시즌 · {RENEWALS.length}건 추적 중</span>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 칸반 */}
        <div className="demo-scroll min-w-0 flex-1 overflow-auto p-4">
          <div className="grid h-full min-w-[640px] grid-cols-4 gap-3">
            {STAGES.map((stage) => {
              const cards = RENEWALS.filter((c) => c.stage === stage.id);
              return (
                <div key={stage.id} className="flex min-h-0 flex-col rounded-xl bg-white/[0.02] p-2.5">
                  <div className="mb-2.5 flex items-center justify-between px-1">
                    <span className="text-[11px] font-medium text-zinc-400">{stage.label}</span>
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
        </div>

        {/* 브리핑 패널 */}
        <AnimatePresence>
          {selectedCardId && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 overflow-hidden border-l border-white/[0.06] bg-[#141318]"
            >
              <div className="h-full w-96">
                <BriefingPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
