import { SlidersHorizontal, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { PLACEMENT, STR } from './data';
import { usePanelOptimizer } from './state';
import { PanelAllocation, QuoteTable, RationaleList, SummaryMetrics } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Desktop(_: DemoComponentProps) {
  const lang = useLang();
  const { phase, constraint, normalize, optimize, tighten } = usePanelOptimizer();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/90 text-white">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <AriaWordmark className="h-3.5" />
          <span className="text-[14px] font-semibold text-zinc-100">{pick(STR.brand, lang)}</span>
          <span className="text-[10px] font-normal text-zinc-500">by AlphaLenz</span>
        </div>
        {/* 액션 버튼 — phase에 따라 노출 */}
        <div className="ml-auto flex items-center gap-2">
          {phase === 'raw' && (
            <button
              data-demo-id="normalize-run"
              onClick={normalize}
              className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-sky-400"
            >
              <Sparkles className="h-3.5 w-3.5" /> {pick(STR.normalizeBtn, lang)}
            </button>
          )}
          {phase === 'normalizing' && (
            <span className="rounded-xl bg-sky-500/20 px-3.5 py-2 text-[12px] font-semibold text-sky-300">{pick(STR.normalizing, lang)}</span>
          )}
          {phase === 'normalized' && (
            <button
              data-demo-id="optimize-run"
              onClick={optimize}
              className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-3.5 py-2 text-[12px] font-semibold text-[#06211f] hover:bg-teal-400"
            >
              <Sparkles className="h-3.5 w-3.5" /> {pick(STR.optimizeBtn, lang)}
            </button>
          )}
          {phase === 'optimizing' && (
            <span className="rounded-xl bg-teal-500/20 px-3.5 py-2 text-[12px] font-semibold text-teal-300">{pick(STR.optimizing, lang)}</span>
          )}
          {phase === 'optimized' && constraint === 'base' && (
            <button
              data-demo-id="constraint-tighten"
              onClick={tighten}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[12px] font-semibold text-zinc-200 hover:bg-white/[0.09]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> {pick(STR.tightenBtn, lang)}
            </button>
          )}
        </div>
      </header>

      {/* 배치 헤더 */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] px-4 py-2.5">
        <div>
          <p className="text-[13px] font-semibold text-zinc-100">{pick(PLACEMENT.treaty, lang)}</p>
          <p className="text-[11px] text-zinc-500">{pick(PLACEMENT.cover, lang)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px]">
          <span className="rounded-md bg-white/[0.05] px-2 py-1 text-zinc-400">{pick(STR.required, lang)} <span className="font-mono font-semibold text-zinc-100">100%</span></span>
        </div>
      </div>

      {/* 본문: 견적표 + 결과 */}
      <div className="flex min-h-0 flex-1">
        <div className="demo-scroll min-w-0 flex-1 overflow-y-auto border-r border-white/[0.06] p-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{pick(STR.quotesHeader, lang)}</p>
          <QuoteTable />
        </div>
        <aside className={cn('demo-scroll w-[340px] shrink-0 overflow-y-auto bg-[#0b0c14] p-3.5', phase !== 'optimized' && 'flex items-center justify-center')}>
          {phase === 'optimized' ? (
            <div className="w-full">
              <PanelAllocation />
              <SummaryMetrics />
              <RationaleList />
            </div>
          ) : (
            <p className="text-center text-[12px] text-zinc-600">{pick(STR.panelHeader, lang)}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
