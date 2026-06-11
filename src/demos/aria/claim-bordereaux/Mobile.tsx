import { Table2, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useBordereaux } from './state';
import { BordereauxGrid, SidePanel, ValidationSummary } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Mobile(_: DemoComponentProps) {
  const { phase, validate } = useBordereaux();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-indigo-500/90 text-white">
          <Table2 className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <AriaWordmark className="h-3" />
          <span className="text-[13px] font-semibold text-zinc-100">Bordereaux</span>
        </div>
        <button
          data-demo-id="validate-run"
          onClick={validate}
          disabled={phase !== 'raw'}
          className={cn(
            'ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
            phase === 'raw' && 'bg-indigo-500 text-white',
            phase === 'validating' && 'bg-indigo-500/20 text-indigo-300',
            (phase === 'validated' || phase === 'settled') && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3 w-3" />
          {phase === 'raw' && pick(STR.validateBtn, lang)}
          {phase === 'validating' && pick(STR.validating, lang)}
          {(phase === 'validated' || phase === 'settled') && pick(STR.validated, lang)}
        </button>
      </header>

      {/* 그리드 — 상단 */}
      <div className="flex min-h-0 flex-[3] flex-col border-b border-white/[0.06]">
        <BordereauxGrid />
        <ValidationSummary />
      </div>

      {/* 사이드 패널 — 하단 인라인 */}
      <div className="demo-scroll demo-scroll-follow min-h-0 flex-[2] overflow-y-auto p-3.5">
        <SidePanel />
      </div>
    </div>
  );
}
