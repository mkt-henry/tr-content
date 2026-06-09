import { Database } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { usePipe } from './state';
import { KPIS, STR } from './data';
import { KpiCard, SourcePanel, PipelineWidget, BenchmarkCard } from './widgets';
import { MobileBar } from '../_shared/Chrome';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

export function Mobile(_: DemoComponentProps) {
  const { loaded, load } = usePipe();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      <MobileBar title={pick(STR.mobileSubtitle, lang)} />

      <div className="border-b px-4 py-2.5" style={{ borderColor: AL.border }}>
        <h2 className="text-[13px] font-semibold text-zinc-100">{pick(STR.pageTitle, lang)}</h2>
      </div>

      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {!loaded && (
          <button
            data-demo-id="load-btn"
            onClick={load}
            className="mx-auto mt-20 flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-[13px] font-medium text-violet-200"
          >
            <Database className="h-4 w-4" /> {pick(STR.loadData, lang)}
          </button>
        )}
        <div className={cn('space-y-4 transition-opacity duration-500', !loaded && 'pointer-events-none opacity-40')}>
          <div className="grid grid-cols-2 gap-3">
            {KPIS.map((k, i) => (
              <KpiCard key={k.id} kpi={k} index={i} compact />
            ))}
          </div>
          <SourcePanel compact />
          <PipelineWidget />
          <BenchmarkCard compact />
        </div>
      </div>
    </div>
  );
}
