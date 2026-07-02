import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 스포트라이트 마스크 — 대상(data-demo-id) 요소를 사각형으로 남기고 나머지를 살짝 어둡게 해
 * 핵심 소구 영역을 강조한다. 줌(카메라 배율) 대신 쓰는 정적 강조 연출.
 *
 * demo 루트(position: relative) 안에 absolute inset-0 로 마운트되고, 대상 요소의 위치를
 * 루트 기준 좌표로 매 프레임 측정해 따라간다. box-shadow spread로 사각형 밖을 어둡게 칠한다.
 */
export function SpotlightMask({ targetId, caption }: { targetId: string | null; caption?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!targetId) {
      setRect(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const root = wrapRef.current?.parentElement;
      const el = root?.querySelector<HTMLElement>(`[data-demo-id="${targetId}"]`);
      if (!root || !el) return;
      const rr = root.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const pad = 8;
      setRect({
        left: er.left - rr.left - pad,
        top: er.top - rr.top - pad,
        width: er.width + pad * 2,
        height: er.height + pad * 2,
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetId]);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {targetId && rect && (
          <motion.div
            key="spotlight-rect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              borderRadius: 12,
              // 안쪽 브래스 링 + 바깥 전체를 살짝 어둡게
              boxShadow: '0 0 0 1.5px rgba(217,173,120,0.9), 0 0 0 9999px rgba(0,0,0,0.42)',
            }}
          >
            {caption && (
              <span
                className="absolute right-full top-1/2 mr-6 -translate-y-1/2 whitespace-nowrap rounded-full bg-brass-500 px-5 py-2.5 text-[19px] font-semibold text-ink-950 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8)]"
              >
                {caption}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
