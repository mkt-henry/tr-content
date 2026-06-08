import { FileCheck, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useSlipCheck } from './state';
import { DocPanel, FindingsPanel, FindingsSummary } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const { phase, startScan } = useSlipCheck();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0e0b14] text-zinc-200">
      <header className="flex items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-violet-500/90 text-white">
          <FileCheck className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-semibold text-zinc-100">ARIA Verify</span>
        <button
          data-demo-id="check-run"
          onClick={startScan}
          disabled={phase !== 'ready'}
          className={cn(
            'ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
            phase === 'ready' && 'bg-violet-500 text-white',
            phase === 'scanning' && 'bg-violet-500/20 text-violet-300',
            phase === 'done' && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3 w-3" />
          {phase === 'ready' && pick(STR.checkBtn, lang)}
          {phase === 'scanning' && pick(STR.checking, lang)}
          {phase === 'done' && pick(STR.checkDone, lang)}
        </button>
      </header>

      {/* 워딩 문서 — 상단 고정 비율 */}
      <div className="flex min-h-0 flex-[3] flex-col border-b border-white/[0.06]">
        <DocPanel side="wording" />
        <FindingsSummary />
      </div>

      {/* 파인딩 리스트 — 하단 인라인 */}
      <div className="demo-scroll min-h-0 flex-[2] overflow-y-auto p-3.5">
        <FindingsPanel />
      </div>
    </div>
  );
}
