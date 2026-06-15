import { SlidersHorizontal, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { pick, useLang } from '../_shared/i18n';
import { PLACEMENT, STR } from './data';
import { usePanelOptimizer } from './state';
import { PanelAllocation, QuoteTable, RationaleList, SummaryMetrics } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Mobile(_: DemoComponentProps) {
  const lang = useLang();
  const { phase, constraint, normalize, optimize, tighten } = usePanelOptimizer();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-sky-500/90 text-white">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </div>
        <AriaWordmark className="h-3" />
        <span className="text-[12px] font-semibold text-zinc-100">{pick(STR.brand, lang)}</span>
      </header>

      <div className="border-b border-white/[0.06] px-3 py-2">
        <p className="text-[12.5px] font-semibold text-zinc-100">{pick(PLACEMENT.treaty, lang)}</p>
        <p className="text-[10.5px] text-zinc-500">{pick(PLACEMENT.cover, lang)} · {pick(STR.required, lang)} 100%</p>
      </div>

      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <QuoteTable />
        <div className="mt-3">
          <PanelAllocation />
          <SummaryMetrics />
          <RationaleList />
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="border-t border-white/[0.06] p-3">
        {phase === 'raw' && (
          <button data-demo-id="normalize-run" onClick={normalize} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2.5 text-[13px] font-semibold text-white">
            <Sparkles className="h-4 w-4" /> {pick(STR.normalizeBtn, lang)}
          </button>
        )}
        {phase === 'normalizing' && <p className="py-2.5 text-center text-[13px] font-semibold text-sky-300">{pick(STR.normalizing, lang)}</p>}
        {phase === 'normalized' && (
          <button data-demo-id="optimize-run" onClick={optimize} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-500 py-2.5 text-[13px] font-semibold text-[#06211f]">
            <Sparkles className="h-4 w-4" /> {pick(STR.optimizeBtn, lang)}
          </button>
        )}
        {phase === 'optimizing' && <p className="py-2.5 text-center text-[13px] font-semibold text-teal-300">{pick(STR.optimizing, lang)}</p>}
        {phase === 'optimized' && constraint === 'base' && (
          <button data-demo-id="constraint-tighten" onClick={tighten} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-[13px] font-semibold text-zinc-200">
            <SlidersHorizontal className="h-4 w-4" /> {pick(STR.tightenBtn, lang)}
          </button>
        )}
      </div>
    </div>
  );
}
