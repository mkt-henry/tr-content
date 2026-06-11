import { FileText } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { pick, useLang } from '../_shared/i18n';
import { STR } from './data';
import { ReportColumn, DeliveryPanel } from './widgets';

export function Mobile(_: DemoComponentProps) {
  const lang = useLang();
  return (
    <div className="flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <FileText className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-[13px] font-semibold text-zinc-100">{pick(STR.appTitle, lang)}</h2>
      </header>

      {/* 위: 보고서 / 아래: 전달 이메일 (각자 스크롤) */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 border-b border-white/[0.06]">
          <ReportColumn compact />
        </div>
        <div className="min-h-0 flex-1 bg-[#141318]">
          <DeliveryPanel />
        </div>
      </div>
    </div>
  );
}
