import { useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePlaybackStore } from '../engine/playbackStore';
import { CAMERA_LAYER_ATTR } from '../lib/cameraGeom';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** 데모 프레임(카메라 레이어의 부모) 화면 사각형을 구한다. 없으면 null. */
function frameRect(): Rect | null {
  const layer = document.querySelector<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`);
  const frame = layer?.parentElement;
  if (!frame) return null;
  const r = frame.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/**
 * 기능 설명 액션 캡션 — 데모 프레임 "하단 중앙"에 자막처럼 고정한다.
 * 줌 대상을 추종하지 않으므로 UI/카메라가 움직여도 캡션은 제자리에 머물러 가독성이 높다.
 * 카메라 변환 밖(Stage 레벨)에서 렌더되어 줌 배율과 무관하게 항상 같은 크기.
 * 위치는 프레임 크기 변화(리사이즈/전체화면)에만 갱신 — 매 프레임 추적하지 않는다.
 */
export function SpotlightCaption() {
  const id = usePlaybackStore((s) => s.spotlightId);
  const caption = usePlaybackStore((s) => s.spotlightCaption);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const [rect, setRect] = useState<Rect | null>(null);

  const active = enabled && !!id && !!caption;

  // 활성화 시 프레임 사각형을 한 번 측정. 매 프레임 추적하지 않아 캡션이 흔들리지 않는다.
  useLayoutEffect(() => {
    if (!active) return;
    setRect(frameRect());
  }, [active]);

  // 창 리사이즈/전체화면 전환 때만 위치 재측정
  useEffect(() => {
    if (!active) return;
    const onResize = () => setRect(frameRect());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  return (
    <AnimatePresence>
      {active && rect && (
        <motion.div
          className="pointer-events-none fixed z-[90] flex items-end justify-center px-6 pb-6"
          style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="flex items-center gap-2.5 rounded-full border border-brass-400/50 bg-ink-950/95 px-5 py-3 text-[15px] font-semibold leading-none text-zinc-50 shadow-[0_10px_36px_-6px_rgba(192,141,82,0.55)] ring-1 ring-brass-500/20">
            <Sparkles className="h-4.5 w-4.5 shrink-0 text-brass-300" />
            {caption}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
