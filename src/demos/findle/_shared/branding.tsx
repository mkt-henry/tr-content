import { motion } from 'framer-motion';
import type { ProjectBranding } from '../../../branding/types';
import { FINDLE_GREEN } from './ui';

/** Findle 그린 브랜드 무대 — 인트로/아웃트로 풀스테이지 배경 */
const FINDLE_BRAND_BG =
  'radial-gradient(ellipse 70% 55% at 50% 16%, rgba(21,160,106,0.40), transparent 60%),' +
  'radial-gradient(ellipse 60% 50% at 82% 100%, rgba(16,120,80,0.34), transparent 62%),' +
  'linear-gradient(160deg,#06140e 0%,#040a07 100%)';

/** Findle 워드마크 — 그린 "F" 마크 + 흰 Findle. (size = 마크 한 변 px) */
function Wordmark({ size }: { size: number }) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.28 }}>
      <span
        className="flex items-center justify-center font-extrabold text-white"
        style={{ background: FINDLE_GREEN, width: size, height: size, borderRadius: size * 0.26, fontSize: size * 0.52 }}
      >
        F
      </span>
      <span className="font-extrabold leading-none text-white" style={{ fontSize: size * 0.66, letterSpacing: '-0.02em' }}>
        Findle
        <span style={{ color: FINDLE_GREEN }}>.</span>
      </span>
    </div>
  );
}

/** 인트로(~2.5s): 그린 무대 + 로고 페이드/스케일인 → 태그라인 슬라이드업 */
function FindleIntro({ portrait }: { portrait?: boolean }) {
  const size = portrait ? 80 : 62;
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: FINDLE_BRAND_BG }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center"
      >
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Wordmark size={size} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-5 text-[12px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: 'rgba(110,231,168,0.92)' }}
        >
          Today&apos;s news becomes today&apos;s lesson
        </motion.p>
      </motion.div>
    </div>
  );
}

/** 아웃트로(~3s): 로고+태그라인 → findle.io 페이드업 */
function FindleOutro({ portrait }: { portrait?: boolean }) {
  const size = portrait ? 80 : 62;
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ background: FINDLE_BRAND_BG }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        <Wordmark size={size} />
        <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(110,231,168,0.92)' }}>
          Master Finance. Shape Your Future.
        </p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-7 text-[12px] font-medium tracking-[0.06em] text-white/55"
        >
          findle.io
        </motion.p>
      </motion.div>
    </div>
  );
}

export const findleBranding: ProjectBranding = {
  Intro: FindleIntro,
  Outro: FindleOutro,
  introMs: 2500,
  outroMs: 3000,
};
