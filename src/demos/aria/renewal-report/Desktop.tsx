import { FileText } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { pick, useLang } from '../_shared/i18n';
import { AriaWordmark } from '../_shared/AriaWordmark';
import { STR } from './data';
import { ReportColumn, EmailModal } from './widgets';

export function Desktop(_: DemoComponentProps) {
  const lang = useLang();
  return (
    <div className="relative flex h-full flex-col bg-[#111014] text-zinc-200">
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

      {/* 단일 페이지 보고서 */}
      <div className="min-h-0 flex-1">
        <ReportColumn />
      </div>

      {/* CTA → 전달 이메일 모달 (중앙) */}
      <EmailModal variant="center" />
    </div>
  );
}
