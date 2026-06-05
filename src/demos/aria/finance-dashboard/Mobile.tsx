import { Bell, LayoutDashboard, Menu } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useDash } from './state';
import { KPIS } from './data';
import { KpiCard, RevenueChart, SegmentBars, EventsList, PipelineWidget } from './widgets';
import { cn } from '../../../lib/cn';

export function Mobile(_: DemoComponentProps) {
  const { loaded, period, setPeriod, load } = useDash();

  return (
    <div className="flex h-full flex-col bg-[#0e1117] text-zinc-200">
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <Menu className="h-4.5 w-4.5 text-zinc-500" />
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-100">수재 매출 포캐스트</h2>
          <p className="text-[10px] text-zinc-500">ARIA · 2026 갱신 시즌</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Bell className="h-4 w-4 text-zinc-600" />
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700" />
        </div>
      </header>

      {/* 기간 토글 */}
      <div className="flex gap-1 border-b border-white/[0.06] px-4 py-2.5">
        <PeriodBtn id="period-quarter" active={period === 'quarter'} onClick={() => setPeriod('quarter')} label="분기" />
        <PeriodBtn id="period-year" active={period === 'year'} onClick={() => setPeriod('year')} label="연간" />
      </div>

      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {!loaded && (
          <button
            data-demo-id="load-btn"
            onClick={load}
            className="mx-auto mt-20 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-[13px] font-medium text-emerald-300"
          >
            <LayoutDashboard className="h-4 w-4" /> 갱신 시즌 데이터 불러오기
          </button>
        )}
        <div className={cn('space-y-4', !loaded && 'pointer-events-none')}>
          <div className="grid grid-cols-2 gap-3">
            {KPIS.map((k, i) => (
              <KpiCard key={k.id} kpi={k} index={i} compact />
            ))}
          </div>
          <RevenueChart compact />
          <SegmentBars compact />
          <PipelineWidget />
          <EventsList />
        </div>
      </div>
    </div>
  );
}

function PeriodBtn({ id, active, onClick, label }: { id: string; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      data-demo-id={id}
      onClick={onClick}
      className={cn(
        'rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-all',
        active ? 'bg-white/[0.1] text-zinc-100' : 'text-zinc-500',
      )}
    >
      {label}
    </button>
  );
}
