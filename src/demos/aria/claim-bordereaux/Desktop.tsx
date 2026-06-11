import { Table2, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useBordereaux } from './state';
import { BordereauxGrid, SidePanel, ValidationSummary } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Desktop(_: DemoComponentProps) {
  const { phase, validate } = useBordereaux();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/90 text-white">
          <Table2 className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <AriaWordmark className="h-3.5" />
          <span className="text-[14px] font-semibold text-zinc-100">Bordereaux</span>
          <span className="text-[10px] font-normal text-zinc-500">by AlphaLenz</span>
        </div>
        <button
          data-demo-id="validate-run"
          onClick={validate}
          disabled={phase !== 'raw'}
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors',
            phase === 'raw' && 'bg-indigo-500 text-white hover:bg-indigo-400',
            phase === 'validating' && 'bg-indigo-500/20 text-indigo-300',
            (phase === 'validated' || phase === 'settled') && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {phase === 'raw' && pick(STR.validateBtn, lang)}
          {phase === 'validating' && pick(STR.validating, lang)}
          {(phase === 'validated' || phase === 'settled') && pick(STR.validated, lang)}
        </button>
      </header>

      {/* 본문: 그리드 + 사이드 */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col border-r border-white/[0.06]">
          <BordereauxGrid />
          <ValidationSummary />
        </div>
        <aside className="demo-scroll demo-scroll-follow w-[320px] shrink-0 overflow-y-auto bg-[#0b0c14] p-3.5">
          <SidePanel />
        </aside>
      </div>
    </div>
  );
}
