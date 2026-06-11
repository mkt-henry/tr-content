import { Radar } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { EVENT, STR } from './data';
import { useWarroom } from './state';
import { WarroomMap } from './map';
import { AlertBanner, AlertDraftsPanel, EventCard, ExposureList, SummaryCard } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Mobile(_: DemoComponentProps) {
  const { phase, revealedIds } = useWarroom();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0d1117] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-rose-500/90 text-white">
          <Radar className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <AriaWordmark className="h-3" />
          <span className="text-[13px] font-semibold text-zinc-100">Warroom</span>
        </div>
        <span
          className={cn(
            'ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium',
            phase === 'idle' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/15 text-rose-300',
          )}
        >
          {phase === 'idle' ? pick(STR.liveBadge, lang) : pick(EVENT.name, lang)}
        </span>
      </header>

      {/* 지도 — 고정 높이 */}
      <div className="relative h-[240px] shrink-0 border-b border-white/[0.06] bg-[#0a0e14]">
        <AlertBanner />
        <WarroomMap phase={phase} revealedIds={revealedIds} />
      </div>

      {/* 피드 */}
      <div className="demo-scroll demo-scroll-follow flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5">
        <EventCard />
        <ExposureList />
        <SummaryCard />
        <AlertDraftsPanel />
      </div>
    </div>
  );
}
