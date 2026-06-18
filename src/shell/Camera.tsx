import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePlaybackStore } from '../engine/playbackStore';
import { CAMERA_LAYER_ATTR, CAMERA_ZOOM, localCenter } from '../lib/cameraGeom';

const ZOOM = CAMERA_ZOOM; // 활성 컨트롤 줌인 배율 (엔진과 공유)
const EASE = 0.2; // origin 추종 보간 계수 (클수록 빠르게 따라붙음)

/**
 * 인터랙션 카메라 — 한 턴(연속 액션) 동안 줌을 유지하고, 답변 스트리밍/스크롤/종료 등
 * 쉬는 지점(spotlightId=null)에서만 원래 배율로 줌아웃한다.
 *
 * 턴 안에서 대상이 바뀌면 줌을 풀지 않고 transform-origin을 부드럽게 글라이드시켜 따라간다
 * (대상마다 풀었다 당기면 분주하므로). 줌인 시작 시점에는 새 대상으로 스냅한다.
 *
 * origin을 대상 중심에 두므로 그 점은 배율과 무관하게 본래 위치에 고정되고,
 * 가짜 커서는 cameraNaturalCenter(본래 위치)를 가리켜 정렬을 유지한다.
 */
export function Camera({ children }: { children: ReactNode }) {
  const spotlightId = usePlaybackStore((s) => s.spotlightId);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const ref = useRef<HTMLDivElement>(null);

  const active = enabled && !!spotlightId;

  // 현재 적용 중인 origin(레이어 로컬). 비활성 구간엔 null로 두어 다음 줌인 때 새 대상으로 스냅.
  const originRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const layer = ref.current;
      if (!layer) return;
      const { spotlightId: id, spotlightEnabled: en } = usePlaybackStore.getState();
      if (!en || !id) {
        originRef.current = null; // 다음 활성화 때 스냅하도록 초기화 (배율 1이라 origin 무의미)
        return;
      }
      const el = layer.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
      if (!el) return;
      const c = localCenter(el, layer);
      const cur = originRef.current;
      // 첫 활성화는 스냅, 그 외(턴 내 대상 변경)는 부드럽게 글라이드
      const next = cur
        ? { x: cur.x + (c.x - cur.x) * EASE, y: cur.y + (c.y - cur.y) * EASE }
        : { x: c.x, y: c.y };
      originRef.current = next;
      layer.style.transformOrigin = `${next.x}px ${next.y}px`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      ref={ref}
      {...{ [CAMERA_LAYER_ATTR]: true }}
      className="relative h-full w-full"
      initial={{ scale: 1 }}
      animate={{ scale: active ? ZOOM : 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 22, mass: 0.7 }}
    >
      {children}
    </motion.div>
  );
}
