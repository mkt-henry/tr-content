import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePlaybackStore } from '../engine/playbackStore';
import { CAMERA_LAYER_ATTR } from '../lib/cameraGeom';

const GAP = 12; // 대상과 캡션 사이 간격(px)
const PAD = 12; // 프레임 안쪽 여백(px)
const EST_H = 40; // 캡션 추정 높이(배치 판단용, px)

interface Pos {
  left: number;
  top: number;
}

/**
 * 줌 대상에 적응형으로 앵커되는 액션 캡션 오버레이.
 * 카메라 변환 밖(Stage 레벨)에서 렌더되어 줌 배율과 무관하게 항상 같은 크기로 보인다.
 * rAF로 대상의 현재 화면 박스를 추종하며, 대상/프레임/인접 영역을 최소 침범하도록
 * 아래 우선 → 위로 플립 → 프레임 하단 핀 순으로 위치를 정한다.
 */
export function SpotlightCaption() {
  const id = usePlaybackStore((s) => s.spotlightId);
  const caption = usePlaybackStore((s) => s.spotlightCaption);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);

  const active = enabled && !!id && !!caption;

  useEffect(() => {
    if (!active || !id) {
      setPos(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = document.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
      const layer = el?.closest<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`);
      const frame = layer?.parentElement;
      if (el && frame) {
        const r = el.getBoundingClientRect(); // 줌 반영된 화면 박스
        const f = frame.getBoundingClientRect();
        const w = boxRef.current?.offsetWidth ?? 0;
        const h = boxRef.current?.offsetHeight ?? EST_H;

        // 세로: 아래 우선 → 위로 플립 → 프레임 하단 핀
        let top = r.bottom + GAP;
        if (top + h + PAD > f.bottom) {
          const above = r.top - GAP - h;
          top = above >= f.top + PAD ? above : f.bottom - h - PAD;
        }
        // 가로: 대상 중심 정렬 후 프레임 안 클램프
        let left = r.left + r.width / 2 - w / 2;
        left = Math.max(f.left + PAD, Math.min(left, f.right - w - PAD));

        setPos({ left, top });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, id]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          ref={boxRef}
          className="pointer-events-none fixed z-[90] max-w-[80%]"
          style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? 'visible' : 'hidden' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: pos ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="flex items-center gap-2 rounded-full border border-brass-500/30 bg-ink-950/80 px-3.5 py-2 text-[12.5px] font-medium text-zinc-100 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-brass-300" />
            {caption}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
