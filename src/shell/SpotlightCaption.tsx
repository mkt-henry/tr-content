import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlaybackStore } from '../engine/playbackStore';
import { CAMERA_LAYER_ATTR, localRect } from '../lib/cameraGeom';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 데모 프레임(카메라 레이어의 부모) 사각형을 구한다. 없으면 null.
 * root가 주어지면(Remotion 컴포지션) offset 기준의 컴포지션 로컬 좌표 — 프리뷰 축소 배율과 무관.
 * 없으면(라이브 앱) 뷰포트 기준 getBoundingClientRect — 캡션이 뷰포트에 fixed되므로 그대로 맞다.
 */
function frameRect(root: HTMLElement | null): Rect | null {
  const layer = document.querySelector<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`);
  const frame = layer?.parentElement;
  if (!frame) return null;
  if (root) return localRect(frame, root);
  const r = frame.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/**
 * 기능 설명 액션 캡션 — 데모 프레임 "하단 중앙"에 자막처럼 고정한다.
 * 줌 대상을 추종하지 않으므로 UI/카메라가 움직여도 캡션은 제자리에 머물러 가독성이 높다.
 * 카메라 변환 밖(Stage 레벨)에서 렌더되어 줌 배율과 무관하게 항상 같은 크기.
 * 위치는 프레임 크기 변화(리사이즈/전체화면)에만 갱신 — 매 프레임 추적하지 않는다.
 */
export function SpotlightCaption({ rootRef }: { rootRef?: RefObject<HTMLElement | null> }) {
  const id = usePlaybackStore((s) => s.spotlightId);
  const caption = usePlaybackStore((s) => s.spotlightCaption);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const frameLock = usePlaybackStore((s) => s.frameLock);
  const [rect, setRect] = useState<Rect | null>(null);

  const active = enabled && !!id && !!caption;

  // 활성화 시 프레임 사각형을 한 번 측정. 매 프레임 추적하지 않아 캡션이 흔들리지 않는다.
  useLayoutEffect(() => {
    if (!active) return;
    setRect(frameRect(rootRef?.current ?? null));
  }, [active, rootRef]);

  // 창 리사이즈/전체화면 전환 때만 위치 재측정
  useEffect(() => {
    if (!active) return;
    const onResize = () => setRect(frameRect(rootRef?.current ?? null));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, rootRef]);

  // 영상 렌더: 등장 진행도를 프레임에서 받아 그대로 그린다(벽시계 fade 금지 — 결과물이 흔들린다).
  if (frameLock) {
    if (!active || !rect) return null;
    const e = frameLock.caption;
    return (
      <div
        className="pointer-events-none fixed z-[90] flex items-end justify-center px-6 pb-6"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          opacity: e,
          transform: `translateY(${10 * (1 - e)}px)`,
        }}
      >
        <span className="rounded-2xl bg-black px-7 py-4 text-[24px] font-bold leading-none text-white shadow-[0_14px_48px_-6px_rgba(0,0,0,0.6)]">
          {caption}
        </span>
      </div>
    );
  }

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
          <span className="rounded-2xl bg-black px-7 py-4 text-[24px] font-bold leading-none text-white shadow-[0_14px_48px_-6px_rgba(0,0,0,0.6)]">
            {caption}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
