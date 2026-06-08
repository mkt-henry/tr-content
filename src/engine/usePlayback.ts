import { useCallback, useEffect, useRef } from 'react';
import type { Scenario } from './types';
import { runScenario } from './run';
import { startAutoFollow } from './autoScroll';
import { usePlaybackStore } from './playbackStore';

/**
 * 자동 재생 컨트롤러.
 * - play: store 리셋 후 시나리오 실행
 * - stop: AbortController abort → 현재 상태 그대로 수동 모드 전환
 */
export function usePlayback() {
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const s = usePlaybackStore.getState();
    s.setStatus('idle');
    s.setCursor({ visible: false, pressed: false });
  }, []);

  const play = useCallback(
    async (scenario: Scenario, reset: () => void) => {
      abortRef.current?.abort();
      reset();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const s = usePlaybackStore.getState();
      s.setStatus('playing');
      s.setCursor({ x: window.innerWidth / 2, y: window.innerHeight * 0.7, visible: true, pressed: false });
      startAutoFollow(ctrl.signal);
      await runScenario(scenario, ctrl.signal);
      if (!ctrl.signal.aborted) {
        const st = usePlaybackStore.getState();
        st.setStatus('done');
        st.setCursor({ visible: false });
        abortRef.current = null;
      }
    },
    [],
  );

  // 언마운트 시 정리
  useEffect(() => stop, [stop]);

  return { play, stop };
}
