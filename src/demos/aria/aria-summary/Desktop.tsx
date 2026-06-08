import { Sparkles, Upload } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { SourcePanel, SummaryPanel } from './panels';
import { STR } from './data';
import { pick, useLang } from '../_shared/i18n';

export function Desktop(_: DemoComponentProps) {
  const lang = useLang();
  return (
    <div className="flex h-full flex-col bg-[#121114] text-zinc-200">
      {/* 헤더 */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-[13.5px] font-semibold text-zinc-100">
            {pick(STR.headerTitle, lang)} <span className="ml-1 text-[10px] font-normal text-zinc-500">ARIA by Treasurer</span>
          </h2>
        </div>
        <button className="ml-auto flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[12px] text-zinc-300 hover:bg-white/[0.08]">
          <Upload className="h-3.5 w-3.5" /> {pick(STR.uploadDoc, lang)}
        </button>
      </header>

      {/* 2분할: 좌 원문 / 우 요약 */}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 border-r border-white/[0.06]">
          <SourcePanel />
        </div>
        <div className="min-w-0 flex-1">
          <SummaryPanel />
        </div>
      </div>
    </div>
  );
}
