import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePlaybackStore } from '../engine/playbackStore';
import { CAMERA_LAYER_ATTR } from '../lib/cameraGeom';

const GAP = 12; // 대상과 캡션 사이 간격(px)
const PAD = 12; // 프레임 안쪽 여백(px)
const EST_H = 40; // 캡션 추정 높이(배치 판단용, px)

/**
 * 줌 대상에 적응형으로 앵커되는 액션 캡션 오버레이.
 * 카메라 변환 밖(Stage 레벨)에서 렌더되어 줌 배율과 무관하게 항상 같은 크기로 보인다.
 * rAF로 대상의 현재 화면 박스를 추종하며, 대상/프레임/인접 영역을 최소 침범하도록
 * 아래 우선 → 위로 플립 → 프레임 하단 핀 순으로 위치를 정한다.
 *
 * 위치는 매 프레임 DOM에 직접 기록한다(Camera의 origin 추종과 동일 패턴) — React state로
 * 갱신하면 스포트라이트 내내 60fps 리렌더가 발생해 카메라 줌 애니메이션과 메인스레드를
 * 경쟁하며 프레임이 끊긴다. 리렌더는 "위치 확정 1회"(ready)로 페이드인만 트리거한다.
 */
export function SpotlightCaption() {
  const id = usePlaybackStore((s) => s.spotlightId);
  const caption = usePlaybackStore((s) => s.spotlightCaption);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const boxRef = useRef<HTMLDivElement>(null);
  // 위치 확정 여부 — 첫 프레임 이전엔 숨겨 0,0 깜빡임/잘못된 위치 노출을 막는다. 비트당 1회만 토글.
  const [ready, setReady] = useState(false);

  const active = enabled && !!id && !!caption;

  useEffect(() => {
    if (!active || !id) return;
    setReady(false);
    let raf = 0;
    let placed = false;
    const tick = () => {
      const box = boxRef.current;
      const el = document.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
      const layer = el?.closest<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`);
      const frame = layer?.parentElement;
      if (box && el && frame) {
        const r = el.getBoundingClientRect(); // 줌 반영된 화면 박스
        const f = frame.getBoundingClientRect();
        const w = box.offsetWidth;
        const h = box.offsetHeight || EST_H;

        // 세로: 아래 우선 → 위로 플립 → 프레임 하단 핀
        let top = r.bottom + GAP;
        if (top + h + PAD > f.bottom) {
          const above = r.top - GAP - h;
          top = above >= f.top + PAD ? above : f.bottom - h - PAD;
        }
        // 가로: 대상 중심 정렬 후 프레임 안 클램프
        let left = r.left + r.width / 2 - w / 2;
        left = Math.max(f.left + PAD, Math.min(left, f.right - w - PAD));

        // 리렌더 없이 매 프레임 DOM에 직접 기록
        box.style.left = `${left}px`;
        box.style.top = `${top}px`;
        if (!placed) {
          placed = true;
          setReady(true); // 위치 확정 시 한 번만 — opacity 페이드인 트리거
        }
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
          className="pointer-events-none fixed left-0 top-0 z-[90] max-w-[80%]"
          style={{ visibility: ready ? 'visible' : 'hidden' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: ready ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="flex items-center gap-2 rounded-full border border-brass-500/30 bg-ink-950/90 px-3.5 py-2 text-[12.5px] font-medium text-zinc-100 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-brass-300" />
            {caption}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
