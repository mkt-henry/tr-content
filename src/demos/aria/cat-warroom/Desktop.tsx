import { Radar } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { EVENT, STR } from './data';
import { useWarroom } from './state';
import { WarroomMap } from './map';
import { AlertBanner, AlertDraftsPanel, EventCard, ExposureList, SummaryCard } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const { phase, revealedIds } = useWarroom();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/90 text-white">
          <Radar className="h-4 w-4" />
        </div>
        <span className="text-[14px] font-semibold text-zinc-100">
          ARIA Warroom <span className="text-[10px] font-normal text-zinc-500">by Treasurer</span>
        </span>
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-[10.5px] font-medium',
            phase === 'idle' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/15 text-rose-300',
          )}
        >
          {phase === 'idle' ? pick(STR.monitoring, lang) : pick(EVENT.name, lang)}
        </span>
      </header>

      {/* 지도 + 사이드 */}
      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1 bg-[#0a0e14]">
          <AlertBanner />
          <WarroomMap phase={phase} revealedIds={revealedIds} />
        </main>
        <aside className="demo-scroll flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-white/[0.06] bg-[#0c1014] p-3.5">
          <EventCard />
          <ExposureList />
          <SummaryCard />
          <AlertDraftsPanel />
        </aside>
      </div>
    </div>
  );
}
