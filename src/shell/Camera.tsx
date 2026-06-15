import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePlaybackStore } from '../engine/playbackStore';

const ZOOM = 1.35; // 활성 컨트롤 줌인 배율

/**
 * 요소 el의 중심을 layer(카메라 레이어) 로컬 좌표로 계산한다.
 * offsetLeft/Top(레이아웃 좌표)을 누적하므로 현재 transform(scale)에 영향받지 않는다 —
 * 줌이 걸린 상태에서도 정확한 기준점을 얻는다. 중간 스크롤 컨테이너의 scroll은 보정한다.
 */
function localCenter(el: HTMLElement, layer: HTMLElement): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== layer) {
    x += node.offsetLeft;
    y += node.offsetTop;
    const op = node.offsetParent as HTMLElement | null;
    // node와 offsetParent 사이의 스크롤 컨테이너 스크롤량 보정
    let a: HTMLElement | null = node.parentElement;
    while (a && a !== op && a !== layer) {
      x -= a.scrollLeft;
      y -= a.scrollTop;
      a = a.parentElement;
    }
    node = op;
  }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}

/**
 * 인터랙션 카메라 — 재생 중 활성 컨트롤(spotlightId)을 중심으로 화면을 줌인했다가
 * 해제되면(stream/scroll/종료) 원래 배율로 돌아온다. 다이나믹한 "확대 → 원복" 연출.
 *
 * 줌 기준점(transform-origin)을 대상 중심에 두므로 그 점이 화면상 고정되어,
 * 가짜 커서(Stage 레벨 fixed 오버레이)가 별도 보정 없이 정렬을 유지한다.
 */
export function Camera({ children }: { children: ReactNode }) {
  const spotlightId = usePlaybackStore((s) => s.spotlightId);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const ref = useRef<HTMLDivElement>(null);

  const active = enabled && !!spotlightId;

  useLayoutEffect(() => {
    if (!active) return;
    const layer = ref.current;
    if (!layer) return;
    let raf = 0;
    const apply = () => {
      const el = layer.querySelector<HTMLElement>(`[data-demo-id="${spotlightId}"]`);
      if (el) {
        const c = localCenter(el, layer);
        layer.style.transformOrigin = `${c.x}px ${c.y}px`;
      }
    };
    apply(); // 첫 페인트 전 기준점 설정 → 줌이 중심에서 시작
    const track = () => {
      apply();
      raf = requestAnimationFrame(track);
    };
    raf = requestAnimationFrame(track);
    return () => cancelAnimationFrame(raf);
  }, [active, spotlightId]);

  return (
    <motion.div
      ref={ref}
      className="h-full w-full"
      animate={{ scale: active ? ZOOM : 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 0.7 }}
    >
      {children}
    </motion.div>
  );
}
