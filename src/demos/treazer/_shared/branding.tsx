import { motion } from 'framer-motion';
import type { ProjectBranding } from '../../../branding/types';
import { Coin, TZ_BACKGROUND } from './ui';

/** 다크 배경용 Treazer 워드마크 (ui.tsx Wordmark는 다크 텍스트라 별도) */
function DarkWordmark({ className }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight text-white ${className ?? ''}`}>
      Treazer<span className="text-orange-500">.</span>
    </span>
  );
}

/** 우상향 금 시세 라인 path (인트로/아웃트로 공용 모양) */
const LINE_D = 'M0 158 L60 135 L110 142 L160 98 L210 106 L260 60 L320 22';

/** 인트로(~2.5s): 시세 라인 → 코인 → 워드마크 → 태그라인 */
function TreazerIntro() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 180" preserveAspectRatio="none">
        <motion.path
          d={LINE_D}
          fill="none"
          stroke="#f97316"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.95, type: 'spring', stiffness: 220, damping: 14 }}
        >
          <Coin className="h-14 w-14 text-[28px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.5 }}
          className="mt-4"
        >
          <DarkWordmark className="text-[40px]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.75, duration: 0.5 }}
          className="mt-2 text-[13px] font-medium tracking-[0.15em] text-amber-300/80"
        >
          LEARN &amp; EARN GOLD
        </motion.p>
      </div>
    </div>
  );
}

/** 아웃트로(~3s): 시세 라인 배경 + 코인·로고·태그 + treazer.app CTA */
function TreazerOutro() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
    >
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 320 180" preserveAspectRatio="none">
        <motion.path
          d={LINE_D}
          fill="none"
          stroke="#f97316"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <Coin className="h-16 w-16 text-[32px]" />
        <div className="mt-4">
          <DarkWordmark className="text-[44px]" />
        </div>
        <p className="mt-2 text-[13px] font-medium tracking-[0.15em] text-amber-300/80">LEARN &amp; EARN GOLD</p>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-5 rounded-full bg-orange-500 px-5 py-2 text-[14px] font-bold text-white"
        >
          treazer.app
        </motion.span>
      </motion.div>
    </div>
  );
}

export const treazerBranding: ProjectBranding = {
  Intro: TreazerIntro,
  Outro: TreazerOutro,
  introMs: 2500,
  outroMs: 3000,
};
