import { useCallback, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';

/**
 * 풀스테이지 브랜딩 오버레이. 주어진 phase 컴포넌트를 렌더하고
 * durationMs 타이머 만료 또는 클릭 시 onDone을 정확히 1회 호출한다.
 * z-40 — ControlBar(z-50)보다 아래라 재생 중에도 컨트롤은 클릭 가능.
 */
export function BrandOverlay({
  Phase,
  durationMs,
  onDone,
}: {
  Phase: ComponentType;
  durationMs: number;
  onDone: () => void;
}) {
  const fired = useRef(false);
  const fire = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(fire, durationMs);
    return () => clearTimeout(t);
  }, [fire, durationMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={fire}
      className="absolute inset-0 z-40 cursor-pointer"
    >
      <Phase />
    </motion.div>
  );
}
