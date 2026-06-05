import { Inbox, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { fmt, pick, useLang } from '../_shared/i18n';
import { EMAILS, STR } from './data';
import { useInbox } from './state';
import { DetailPane, EmailList, SummaryBar } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const { phase, startTriage } = useInbox();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#12100b] text-zinc-200">
      {/* 툴바 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/90 text-[#27180a]">
          <Inbox className="h-4 w-4" />
        </div>
        <span className="text-[14px] font-semibold text-zinc-100">
          ARIA Inbox <span className="text-[10px] font-normal text-zinc-500">by Treasurer</span>
        </span>
        <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-zinc-500">
          {fmt(pick(STR.unread, lang), { n: EMAILS.length })}
        </span>
        <button
          data-demo-id="triage-run"
          onClick={startTriage}
          disabled={phase !== 'raw'}
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors',
            phase === 'raw' && 'bg-amber-500 text-[#27180a] hover:bg-amber-400',
            phase === 'scanning' && 'bg-amber-500/20 text-amber-300',
            phase === 'sorted' && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {phase === 'raw' && pick(STR.triageBtn, lang)}
          {phase === 'scanning' && pick(STR.triaging, lang)}
          {phase === 'sorted' && pick(STR.triageDone, lang)}
        </button>
      </header>

      <SummaryBar />

      {/* 2-pane */}
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[340px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0e0c08]">
          <EmailList />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <DetailPane />
        </main>
      </div>
    </div>
  );
}
