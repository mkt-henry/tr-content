import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Inbox, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useInbox } from './state';
import { DetailPane, EmailList, SummaryBar } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const { phase, startTriage, selectedId, selectEmail } = useInbox();
  const lang = useLang();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#12100b] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-amber-500/90 text-[#27180a]">
          <Inbox className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-semibold text-zinc-100">ARIA Inbox</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            data-demo-id="triage-run"
            onClick={startTriage}
            disabled={phase !== 'raw'}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
              phase === 'raw' && 'bg-amber-500 text-[#27180a]',
              phase === 'scanning' && 'bg-amber-500/20 text-amber-300',
              phase === 'sorted' && 'bg-emerald-500/15 text-emerald-300',
            )}
          >
            <Sparkles className="h-3 w-3" />
            {phase === 'raw' && pick(STR.triageBtn, lang)}
            {phase === 'scanning' && pick(STR.triaging, lang)}
            {phase === 'sorted' && pick(STR.triageDone, lang)}
          </button>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-[9px] font-bold text-[#27180a]">
            SK
          </div>
        </div>
      </header>

      <SummaryBar />
      <EmailList compact />

      {/* 상세 풀스크린 시트 */}
      <AnimatePresence>
        {selectedId !== null && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            className="absolute inset-0 z-10 flex flex-col bg-[#12100b]"
          >
            <header className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
              <button onClick={() => selectEmail(null)} className="flex items-center gap-0.5 text-[12px] text-zinc-400">
                <ChevronLeft className="h-4 w-4" /> {pick(STR.inboxTitle, lang)}
              </button>
            </header>
            <DetailPane compact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
