import type { DemoComponentProps } from '../../../registry/types';
import { MobileBar } from '../_shared/Chrome';
import { AL } from '../_shared/theme';
import { STR } from './data';
import { pick, useLang } from '../_shared/i18n';
import { StrategyChips, ResultsTable } from './widgets';
import { usePlaybackStore } from '../../../engine/playbackStore';

export function Mobile(_: DemoComponentProps) {
  const lang = useLang();
  const spotlightId = usePlaybackStore((s) => s.spotlightId);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  // 전략 칩 확대 시 화면 전체 블러 + 칩 그룹만 선명 (데스크탑과 동일)
  const focusChips = enabled && !!spotlightId && spotlightId.startsWith('strategy-');

  return (
    <div className="relative flex h-full flex-col text-zinc-200" style={{ background: AL.appBg }}>
      <span data-demo-id="strategy-anchor" aria-hidden className="pointer-events-none absolute left-0 top-0" />
      <MobileBar title={pick(STR.pageTitle, lang)} />
      <StrategyChips compact />
      <ResultsTable compact />
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
