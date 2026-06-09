import { Database } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { usePipe } from './state';
import { KPIS, STR } from './data';
import { KpiCard, SourcePanel, PipelineWidget, BenchmarkCard } from './widgets';
import { TopBar } from '../_shared/Chrome';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

export function Desktop(_: DemoComponentProps) {
  const { loaded, load } = usePipe();
  const lang = useLang();

  return (
    <div className="flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      <TopBar activeTab={0} search={STR.search} />

      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3 border-b px-6 py-3" style={{ borderColor: AL.border }}>
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-100">{pick(STR.pageTitle, lang)}</h2>
          <p className="text-[11px] text-zinc-500">{pick(STR.pageSubtitle, lang)}</p>
        </div>
      </div>

      {/* 본문 */}
      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-6">
        {!loaded && (
          <button
            data-demo-id="load-btn"
            onClick={load}
            className="mx-auto mt-24 flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-[13px] font-medium text-violet-200 hover:bg-violet-500/20"
          >
            <Database className="h-4 w-4" /> {pick(STR.loadData, lang)}
          </button>
        )}
        <div className={cn('transition-opacity duration-500', !loaded && 'pointer-events-none opacity-40')}>
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k, i) => (
              <KpiCard key={k.id} kpi={k} index={i} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-4">
              <BenchmarkCard />
              <PipelineWidget />
            </div>
            <div>
              <SourcePanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
