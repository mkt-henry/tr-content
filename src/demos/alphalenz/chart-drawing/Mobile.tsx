import type { DemoComponentProps } from '../../../registry/types';
import { useChart } from './state';
import { STEPS_ANALYSIS, STEPS_SETUP, TICKER_ANALYSIS, TICKER_SETUP } from './data';
import { ChartCanvas } from './ChartCanvas';
import { AnalysisPanel, AnalyzeButton, TickerHeader } from './Panel';
import { MobileBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';

export function Mobile(_: DemoComponentProps) {
  const { mode, start } = useChart();
  const steps = mode === 'setup' ? STEPS_SETUP : STEPS_ANALYSIS;
  const ticker = mode === 'setup' ? TICKER_SETUP : TICKER_ANALYSIS;

  return (
    <div className="flex h-full flex-col" style={{ background: AL.appBg, color: '#e4e4e7' }}>
      <MobileBar />

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <TickerHeader ticker={ticker} />

        {/* 차트 — 화면 상단 절반 */}
        <div className="h-[40%] min-h-0 shrink-0">
          <ChartCanvas steps={steps} />
        </div>

        <AnalyzeButton onStart={start} full />

        {/* AI 패널 — 나머지 */}
        <div className="min-h-0 flex-1">
          <AnalysisPanel steps={steps} compact />
        </div>
      </div>
    </div>
  );
}
