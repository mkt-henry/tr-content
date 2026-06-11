import { motion } from 'framer-motion';
import type { ProjectBranding } from '../../../branding/types';
import logoWhite from '../../../assets/aria/Logo1_White.png';

/** ARIA 시그니처 블루 배경 — 로고 본래 색과 일관된 인트로/아웃트로 무대 */
const ARIA_BACKGROUND =
  'radial-gradient(ellipse 70% 55% at 50% 18%, rgba(86,128,208,0.40), transparent 60%),' +
  'radial-gradient(ellipse 60% 50% at 80% 100%, rgba(40,70,140,0.35), transparent 62%),' +
  'linear-gradient(160deg,#0b1020 0%,#070a14 100%)';

/** 풀스테이지 워드마크 — 데스크탑/세로(9:16)에서 폭만 달리한다 */
function HeroWordmark({ portrait }: { portrait?: boolean }) {
  return (
    <img
      src={logoWhite}
      alt="ARIA"
      draggable={false}
      className="h-auto select-none"
      style={{ width: portrait ? '58%' : 'min(34%, 420px)' }}
    />
  );
}

/** 인트로(~2.5s): 블루 무대 + 로고 페이드/스케일인 → 태그라인 슬라이드업 */
function AriaIntro({ portrait }: { portrait?: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: ARIA_BACKGROUND }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex w-full justify-center"
        >
          <HeroWordmark portrait={portrait} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-5 text-[12px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'rgba(150,178,240,0.92)' }}
        >
          Reinsurance Intelligence
        </motion.p>
      </motion.div>
    </div>
  );
}

/** 아웃트로(~3s): 로고+태그라인 → "by AlphaLenz" 페이드업 */
function AriaOutro({ portrait }: { portrait?: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: ARIA_BACKGROUND }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        <HeroWordmark portrait={portrait} />
        <p
          className="mt-5 text-[12px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'rgba(150,178,240,0.92)' }}
        >
          Reinsurance Intelligence
        </p>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-7 text-[12px] font-medium tracking-[0.04em] text-white/45"
        >
          by <span className="font-semibold text-white/80">AlphaLenz</span>
        </motion.p>
      </motion.div>
    </div>
  );
}

export const ariaBranding: ProjectBranding = {
  Intro: AriaIntro,
  Outro: AriaOutro,
  introMs: 2500,
  outroMs: 3000,
};
