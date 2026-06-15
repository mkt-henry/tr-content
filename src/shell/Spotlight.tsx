import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlaybackStore } from '../engine/playbackStore';

/** 강조 대상 rect (뷰포트 좌표, 패딩 포함) */
interface FocusRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PAD = 8; // 대상 주변 여백
const DIM = 0.45; // 주변 딤 강도

/**
 * 인터랙션 스포트라이트 — 재생 중 활성 컨트롤(spotlightId)을 주변 딤+포커스 링으로 강조한다.
 * rAF로 대상 요소 위치를 실시간 추적해 스크롤/레이아웃 변화를 따라가고, 요소가 사라지면 숨긴다.
 */
export function Spotlight() {
  const spotlightId = usePlaybackStore((s) => s.spotlightId);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const [rect, setRect] = useState<FocusRect | null>(null);

  const active = enabled && !!spotlightId;

  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    let raf = 0;
    const track = () => {
      raf = requestAnimationFrame(track);
      const el = document.querySelector(`[data-demo-id="${spotlightId}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        return;
      }
      setRect({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 });
    };
    raf = requestAnimationFrame(track);
    return () => cancelAnimationFrame(raf);
  }, [active, spotlightId]);

  return (
    <AnimatePresence>
      {rect && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[90] rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: rect.x, y: rect.y, width: rect.w, height: rect.h }}
          exit={{ opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 28,
            mass: 0.6,
            opacity: { duration: 0.25 },
          }}
          style={{
            boxShadow: `0 0 0 9999px rgba(0,0,0,${DIM})`,
            outline: '1.5px solid rgba(255,255,255,0.85)',
            outlineOffset: '-1.5px',
          }}
        >
          {/* 글로우 링 */}
          <span
            className="absolute -inset-px rounded-xl"
            style={{ boxShadow: '0 0 16px 2px rgba(255,255,255,0.35)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
