import { FileText } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { pick, useLang } from '../_shared/i18n';
import { AriaWordmark } from '../_shared/AriaWordmark';
import { STR } from './data';
import { ReportColumn, DeliveryPanel } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const lang = useLang();
  return (
    <div className="flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <FileText className="h-4 w-4" />
        </div>
        <h2 className="flex items-baseline text-[13.5px] font-semibold text-zinc-100">
          {pick(STR.appTitle, lang)}
          <span className="ml-1.5 flex items-center gap-1 text-[10px] font-normal text-zinc-500">
            <AriaWordmark className="h-2.5" /> by AlphaLenz
          </span>
        </h2>
        <span className="ml-auto font-mono text-[10.5px] text-zinc-600">{pick(STR.panelMeta, lang)}</span>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 좌: 보고서 */}
        <div className="min-w-0 flex-1 border-r border-white/[0.06]">
          <ReportColumn />
        </div>
        {/* 우: 수신자 → 분석 → 전달 이메일 */}
        <div className="w-[384px] shrink-0 bg-[#141318]">
          <DeliveryPanel />
        </div>
      </div>
    </div>
  );
}
