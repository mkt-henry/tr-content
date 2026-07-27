import { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { entranceProgress, useVideoClock } from '../engine/videoClock';

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
  const clock = useVideoClock();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState('0');
  const fmt = (v: number) =>
    v.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useEffect(() => {
    // 영상 렌더(clock)에서는 프레임으로 값을 정하므로 벽시계 애니메이션을 돌리지 않는다.
    if (clock) return;
    const controls = animate(mv, play ? value : 0, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(fmt(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, play, duration, decimals, mv, clock]);

  // 영상: 상태가 바뀐 프레임(sinceFrame)부터 duration 동안 0 → value. 인앱과 같은 이징.
  if (clock) return <span>{fmt((play ? value : 0) * entranceProgress(clock, duration))}</span>;

  return <span>{display}</span>;
}
