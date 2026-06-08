import { useCallback, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';

/**
 * 풀스테이지 브랜딩 오버레이. 주어진 phase 컴포넌트를 렌더하고
 * durationMs 타이머 만료 또는 클릭 시 onDone을 정확히 1회 호출한다.
 * z-40 — ControlBar(z-50)보다 아래라 데모 재생 단계에서 컨트롤이 가려지지 않는다.
 * 인트로/아웃트로 단계에서는 오버레이 클릭으로 스킵, Space로 정지할 수 있다.
 * portrait=true(모바일)면 중앙 9:16 세로 패널로 감싸 릴스/숏츠 비율로 렌더한다.
 * 불투명 배경(bg-ink-950)으로 스테이지 전체를 덮어, 세로 패널 양옆으로 뒤의 폰 프레임이
 * 비치지 않게 한다(레터박스). 데스크탑은 Phase가 inset-0를 꽉 채운다.
 */
export function BrandOverlay({
  Phase,
  durationMs,
  onDone,
  portrait,
}: {
  Phase: ComponentType<{ portrait?: boolean }>;
  durationMs: number;
  onDone: () => void;
  portrait: boolean;
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
      className="absolute inset-0 z-40 flex cursor-pointer items-center justify-center bg-ink-950"
    >
      {portrait ? (
        <div
          className="relative overflow-hidden rounded-[2rem]"
          style={{ height: 'min(82vh, 780px)', aspectRatio: '9 / 16' }}
        >
          <Phase portrait />
        </div>
      ) : (
        <Phase portrait={false} />
      )}
    </motion.div>
  );
}
