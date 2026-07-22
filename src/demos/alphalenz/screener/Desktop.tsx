import type { DemoComponentProps } from '../../../registry/types';
import { TopBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { STR } from './data';
import { StrategyChips, FilterSidebar, ResultsTable } from './widgets';
import { usePlaybackStore } from '../../../engine/playbackStore';

export function Desktop(_: DemoComponentProps) {
  const spotlightId = usePlaybackStore((s) => s.spotlightId);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  // 전략 칩을 확대(spotlight가 strategy-*)할 때: 화면 전체를 블러하고 칩 그룹만 선명하게 남긴다.
  // (StrategyChips 내부의 칩 그룹이 z-50으로 이 오버레이 위에 떠서 선명 + 테두리를 갖는다.)
  const focusChips = enabled && !!spotlightId && spotlightId.startsWith('strategy-');

  return (
    <div className="relative flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      {/* 전략 칩 확대용 원점 앵커 — 화면 좌상단(0,0). 여기를 origin으로 확대하면 좌상단 영역이 확대된다. */}
      <span data-demo-id="strategy-anchor" aria-hidden className="pointer-events-none absolute left-0 top-0" />
      <TopBar activeTab={3} search={STR.search} />
      <StrategyChips />
      <div className="flex min-h-0 flex-1">
        <FilterSidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <ResultsTable />
        </main>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-300"
        style={{
          opacity: focusChips ? 1 : 0,
          backdropFilter: 'blur(3px) brightness(0.92)',
          WebkitBackdropFilter: 'blur(3px) brightness(0.92)',
        }}
      />
    </div>
  );
}
