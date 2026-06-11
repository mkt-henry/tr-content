import { Bell, ChevronDown, Download, LayoutDashboard, LineChart, PieChart, Search, Wallet } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useDash } from './state';
import { KPIS, STR } from './data';
import { KpiCard, RevenueChart, SegmentBars, EventsList, PipelineWidget } from './widgets';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Desktop(_: DemoComponentProps) {
  const { loaded, period, setPeriod, load } = useDash();
  const lang = useLang();

  return (
    <div className="flex h-full bg-[#0e1117] text-zinc-200">
      {/* 사이드 내비 */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0d12] py-4">
        <div className="flex items-center gap-2 px-4 pb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/90 text-[13px] font-bold text-[#04190f]">
            A
          </div>
          <div className="flex items-center gap-1.5">
            <AriaWordmark className="h-3" />
            <span className="text-[10px] font-normal text-zinc-500">by AlphaLenz</span>
          </div>
        </div>
        <nav className="space-y-0.5 px-2.5">
          <NavItem icon={LayoutDashboard} label={pick(STR.navForecast, lang)} active />
          <NavItem icon={LineChart} label={pick(STR.navPipeline, lang)} />
          <NavItem icon={PieChart} label={pick(STR.navLob, lang)} />
          <NavItem icon={Wallet} label={pick(STR.navSettlement, lang)} />
        </nav>
        <div className="mt-auto px-4">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-[11px] leading-relaxed text-zinc-500">
            {pick(STR.sidebarNote, lang)}
            <span className="mt-1 block font-medium text-emerald-400">{pick(STR.sidebarHighlight, lang)}</span>
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* 헤더 */}
        <header className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-3.5">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-100">{pick(STR.pageTitle, lang)}</h2>
            <p className="text-[11px] text-zinc-500">{pick(STR.pageSubtitle, lang)}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* 기간 토글 */}
            <div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
              <PeriodBtn id="period-quarter" active={period === 'quarter'} onClick={() => setPeriod('quarter')} label={pick(STR.periodQuarter, lang)} />
              <PeriodBtn id="period-year" active={period === 'year'} onClick={() => setPeriod('year')} label={pick(STR.periodYear, lang)} />
            </div>
            <button
              data-demo-id="export-btn"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[12px] text-zinc-300 hover:bg-white/[0.08]"
            >
              <Download className="h-3.5 w-3.5" /> {pick(STR.report, lang)}
            </button>
            <Search className="ml-1 h-4 w-4 text-zinc-600" />
            <Bell className="h-4 w-4 text-zinc-600" />
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700" />
              <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
            </div>
          </div>
        </header>

        {/* 본문 */}
        <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-6">
          {!loaded && (
            <button
              data-demo-id="load-btn"
              onClick={load}
              className="mx-auto mt-24 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-[13px] font-medium text-emerald-300 hover:bg-emerald-500/20"
            >
              <LayoutDashboard className="h-4 w-4" /> {pick(STR.loadData, lang)}
            </button>
          )}
          <div className={cn(!loaded && 'pointer-events-none')}>
            <div className="grid grid-cols-4 gap-4">
              {KPIS.map((k, i) => (
                <KpiCard key={k.id} kpi={k} index={i} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <RevenueChart />
              </div>
              <div className="flex flex-col gap-4">
                <SegmentBars />
                <PipelineWidget />
                <EventsList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: { icon: typeof LayoutDashboard; label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] transition-colors',
        active ? 'bg-emerald-500/10 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PeriodBtn({ id, active, onClick, label }: { id: string; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      data-demo-id={id}
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1 text-[12px] font-medium transition-all',
        active ? 'bg-white/[0.1] text-zinc-100' : 'text-zinc-500 hover:text-zinc-300',
      )}
    >
      {label}
    </button>
  );
}
