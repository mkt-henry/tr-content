import { motion, AnimatePresence } from 'framer-motion';
import { usePlaybackStore } from '../engine/playbackStore';

const CURSOR_PATH = 'M5.5 3.2L19 11.5l-6.2 1.3-3.1 5.7L5.5 3.2z';

/** 자동 재생 중 화면 위를 움직이는 가짜 커서 + 클릭 펄스.
    영상 렌더 중(frameLock 있음)에는 스프링을 끄고 프레임 F에서 계산된 위치·펄스를 그대로 그린다. */
export function FakeCursor() {
  const cursor = usePlaybackStore((s) => s.cursor);
  const frameLock = usePlaybackStore((s) => s.frameLock);

  if (frameLock) {
    if (!cursor.visible) return null;
    const p = frameLock.pulse;
    // 링: 0.3 → 1.4로 퍼지며 사라진다. ease-out cubic으로 인앱 transition과 곡선을 맞춘다.
    const ring = p == null ? null : { e: 1 - Math.pow(1 - p, 3) };
    return (
      <div
        className="pointer-events-none fixed left-0 top-0 z-[100]"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
      >
        {ring && (
          <span
            className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-2 border-white/80"
            style={{ transform: `scale(${0.3 + 1.1 * ring.e})`, opacity: 0.9 * (1 - ring.e) }}
          />
        )}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
          style={{ transform: `scale(${cursor.pressed ? 0.82 : 1})` }}
        >
          <path d={CURSOR_PATH} fill="#fff" stroke="#1c1c1e" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {cursor.visible && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: cursor.x, y: cursor.y }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 22, mass: 0.6, opacity: { duration: 0.25 } }}
        >
          {/* 클릭 펄스 링 */}
          <AnimatePresence>
            {cursor.pressed && (
              <motion.span
                className="absolute -left-4 -top-4 h-8 w-8 rounded-full border-2 border-white/80"
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
          <motion.svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            animate={{ scale: cursor.pressed ? 0.82 : 1 }}
            transition={{ duration: 0.12 }}
          >
            <path d={CURSOR_PATH} fill="#fff" stroke="#1c1c1e" strokeWidth="1.4" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
