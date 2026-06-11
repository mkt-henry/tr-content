import { useCallback, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';

/**
 * 풀스테이지 브랜딩 오버레이. 주어진 phase 컴포넌트를 렌더하고
 * durationMs 타이머 만료 또는 클릭 시 onDone을 정확히 1회 호출한다.
 * z-40 — ControlBar(z-50)보다 아래라 데모 재생 단계에서 컨트롤이 가려지지 않는다.
 * 인트로/아웃트로 단계에서는 오버레이 클릭으로 스킵, Space로 정지할 수 있다.
 * portrait=true(모바일)면 스테이지 높이를 꽉 채우는 9:16 세로 패널로 감싸 릴스/숏츠 비율로 렌더한다.
 * 패널이 스테이지(=녹화 9:16 크롭) 높이를 가득 채우므로 배경이 프레임 전체를 덮는다(레터박스 없음).
 * 불투명 배경(bg-ink-950)이 패널 양옆 잔여 영역을 덮어 뒤의 폰 프레임이 비치지 않게 한다.
 * 데스크탑은 Phase가 inset-0를 꽉 채운다.
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
        // 세로 9:16 패널을 스테이지(=녹화 크롭) 높이에 꽉 채워 풀블리드로 렌더.
        // (예전 min(82vh,780px)는 녹화 시 크롭 영역보다 작아 사방에 검은 레터박스가 생겼음)
        <div className="relative h-full overflow-hidden" style={{ aspectRatio: '9 / 16' }}>
          <Phase portrait />
        </div>
      ) : (
        <Phase portrait={false} />
      )}
    </motion.div>
  );
}
