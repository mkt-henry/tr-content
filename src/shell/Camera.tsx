import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { usePlaybackStore } from '../engine/playbackStore';
import { CAMERA_LAYER_ATTR, localCenter } from '../lib/cameraGeom';

const ZOOM = 1.4; // 활성 컨트롤 줌인 배율

/**
 * 인터랙션 카메라 — 액션마다 "줌인 → 원래대로 줌아웃 → 다음 액션으로 줌인"하는 다이나믹 연출.
 *
 * 대상이 바뀌면 먼저 배율 1로 빠르게 빠졌다가 다음 대상으로 다시 줌인한다(팬이 아니라 펀치).
 * transform-origin을 대상 중심에 두므로 그 점은 배율과 무관하게 본래 위치에 고정되고,
 * 가짜 커서는 cameraNaturalCenter(본래 위치)를 가리켜 어떤 줌 상태에서도 정렬을 유지한다.
 */
export function Camera({ children }: { children: ReactNode }) {
  const spotlightId = usePlaybackStore((s) => s.spotlightId);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  const active = enabled && !!spotlightId;

  // 현재 "보여주는" 대상 id — 줌아웃 구간에서는 직전 대상을 유지하다 줌인 직전 전환한다.
  // (대상이 바뀌자마자 origin을 옮기면 줌이 걸린 채 점프하므로 분리한다)
  const shownIdRef = useRef<string | null>(null);
  // 줌인 완료 상태 — 다음 대상 전환 시 먼저 줌아웃할지 판단
  const zoomedRef = useRef(false);
  // 진행 중 시퀀스 세대 — 빠른 대상 변경 시 stale 연출 차단
  const seqRef = useRef(0);

  // origin 추적: 매 프레임 shownIdRef의 요소 중심으로 transform-origin 갱신 (스크롤/레이아웃 추종)
  useEffect(() => {
    let raf = 0;
    const track = () => {
      const layer = ref.current;
      const id = shownIdRef.current;
      if (layer && id) {
        const el = layer.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
        if (el) {
          const c = localCenter(el, layer);
          layer.style.transformOrigin = `${c.x}px ${c.y}px`;
        }
      }
      raf = requestAnimationFrame(track);
    };
    raf = requestAnimationFrame(track);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 줌 연출: 대상/활성 변화에 따라 줌아웃→줌인 시퀀스 실행
  useEffect(() => {
    const mySeq = ++seqRef.current;
    const stale = () => seqRef.current !== mySeq;

    const setOriginNow = () => {
      const layer = ref.current;
      const id = spotlightId;
      if (!layer || !id) return;
      const el = layer.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
      if (el) {
        const c = localCenter(el, layer);
        layer.style.transformOrigin = `${c.x}px ${c.y}px`;
      }
    };

    const run = async () => {
      if (!active) {
        shownIdRef.current = null;
        await controls.start({ scale: 1 }, { type: 'spring', stiffness: 170, damping: 24 });
        if (!stale()) zoomedRef.current = false;
        return;
      }
      // 직전 대상에서 줌인 상태면 먼저 배율 1로 빠르게 복귀 (origin은 직전 대상 유지)
      if (zoomedRef.current) {
        await controls.start({ scale: 1 }, { duration: 0.2, ease: [0.4, 0, 1, 1] });
        if (stale()) return;
      }
      // 배율 1 시점에 새 대상으로 origin 전환 후 줌인
      shownIdRef.current = spotlightId;
      setOriginNow();
      await controls.start(
        { scale: ZOOM },
        { type: 'spring', stiffness: 160, damping: 18, mass: 0.7 },
      );
      if (!stale()) zoomedRef.current = true;
    };
    void run();
  }, [active, spotlightId, controls]);

  return (
    <motion.div
      ref={ref}
      {...{ [CAMERA_LAYER_ATTR]: true }}
      className="h-full w-full"
      initial={{ scale: 1 }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}
