import { useCallback, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';

/**
 * 풀스테이지 브랜딩 오버레이. 주어진 phase 컴포넌트를 렌더하고
 * durationMs 타이머 만료 또는 클릭 시 onDone을 정확히 1회 호출한다.
 * z-40 — ControlBar(z-50)보다 아래라 데모 재생 단계에서 컨트롤이 가려지지 않는다.
 * 인트로/아웃트로 단계에서는 오버레이 클릭으로 스킵, Space로 정지할 수 있다.
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
