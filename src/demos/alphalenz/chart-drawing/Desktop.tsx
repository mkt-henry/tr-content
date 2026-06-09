import { BarChart3, Crosshair, TrendingUp } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useChart } from './state';
import { STR, STEPS_ANALYSIS, STEPS_SETUP, TICKER_ANALYSIS, TICKER_SETUP } from './data';
import { ChartCanvas } from './ChartCanvas';
import { AnalysisPanel, AnalyzeButton, TickerHeader } from './Panel';
import { TopBar } from '../_shared/Chrome';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';

export function Desktop(_: DemoComponentProps) {
  const { mode, start } = useChart();
  const lang = useLang();
  const steps = mode === 'setup' ? STEPS_SETUP : STEPS_ANALYSIS;
  const ticker = mode === 'setup' ? TICKER_SETUP : TICKER_ANALYSIS;

  return (
    <div className="flex h-full flex-col" style={{ background: AL.appBg, color: '#e4e4e7' }}>
      <TopBar activeTab={2} />

      <div className="flex min-h-0 flex-1 gap-4 p-4">
        {/* 메인: 차트 영역 */}
        <main className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            <TickerHeader ticker={ticker} />
            <div className="ml-auto">
              <AnalyzeButton onStart={start} />
            </div>
          </div>

          {/* 툴바 (장식) + 범례 */}
          <div className="flex items-center gap-2">
            <ToolChip icon={Crosshair} />
            <ToolChip icon={TrendingUp} />
            <ToolChip icon={BarChart3} />
            <div className="ml-auto flex items-center gap-3 text-[10.5px] text-zinc-500">
              <Legend color={AL.up} label={pick(STR.legendSupport, lang)} />
              <Legend color={AL.down} label={pick(STR.legendResistance, lang)} />
              <Legend color={AL.accent} label={pick(STR.legendTrend, lang)} />
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <ChartCanvas steps={steps} />
          </div>
        </main>

        {/* 우측 AI 패널 */}
        <aside className="flex w-72 shrink-0 flex-col">
          <AnalysisPanel steps={steps} />
        </aside>
      </div>
    </div>
  );
}

function ToolChip({ icon: Icon }: { icon: typeof Crosshair }) {
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-md border text-zinc-500"
      style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.03)' }}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-3 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
