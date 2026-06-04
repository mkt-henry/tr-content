import { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';

/** 숫자 카운트업 — loaded 트리거 시 0부터 목표값까지 */
export function CountUp({
  value,
  decimals = 0,
  duration = 1.3,
  play = true,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  play?: boolean;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const controls = animate(mv, play ? value : 0, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })),
    });
    return () => controls.stop();
  }, [value, play, duration, decimals, mv]);

  return <span>{display}</span>;
}
