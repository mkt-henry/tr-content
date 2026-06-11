import { FileCheck, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { useSlipCheck } from './state';
import { DocPanel, FindingsPanel, FindingsSummary } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Desktop(_: DemoComponentProps) {
  const { phase, startScan } = useSlipCheck();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col bg-[#0e0b14] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/90 text-white">
          <FileCheck className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <AriaWordmark className="h-3.5" />
          <span className="text-[14px] font-semibold text-zinc-100">Verify</span>
          <span className="text-[10px] font-normal text-zinc-500">by AlphaLenz</span>
        </div>
        <button
          data-demo-id="check-run"
          onClick={startScan}
          disabled={phase !== 'ready'}
          className={cn(
            'ml-auto flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors',
            phase === 'ready' && 'bg-violet-500 text-white hover:bg-violet-400',
            phase === 'scanning' && 'bg-violet-500/20 text-violet-300',
            phase === 'done' && 'bg-emerald-500/15 text-emerald-300',
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {phase === 'ready' && pick(STR.checkBtn, lang)}
          {phase === 'scanning' && pick(STR.checking, lang)}
          {phase === 'done' && pick(STR.checkDone, lang)}
        </button>
      </header>

      {/* 본문: 좌우 문서 + 우측 파인딩 사이드 */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col border-r border-white/[0.06]">
              <DocPanel side="slip" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <DocPanel side="wording" />
            </div>
          </div>
          <FindingsSummary />
        </div>
        <aside className="demo-scroll demo-scroll-follow w-[300px] shrink-0 overflow-y-auto border-l border-white/[0.06] bg-[#0c0a12] p-3.5">
          <FindingsPanel />
        </aside>
      </div>
    </div>
  );
}
