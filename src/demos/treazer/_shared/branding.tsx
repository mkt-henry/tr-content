import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import type { ProjectBranding } from '../../../branding/types';
import { TZ_BACKGROUND } from './ui';

/** 다크 배경용 Treazer 워드마크 (ui.tsx Wordmark는 다크 텍스트라 별도) */
function DarkWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold tracking-tight text-white', className)}>
      Treazer<span className="text-orange-500">.</span>
    </span>
  );
}

/** 인트로(~2.5s): 그라디언트 배경 + 중앙 로고 페이드인 (무난한 브랜드 인트로) */
function TreazerIntro() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
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
        >
          <DarkWordmark className="text-[44px]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-2 text-[13px] font-medium tracking-[0.15em] text-amber-300/80"
        >
          LEARN &amp; EARN GOLD
        </motion.p>
      </motion.div>
    </div>
  );
}

/** 아웃트로(~3s): 그라디언트 배경 + 로고·태그 + treazer.app CTA */
function TreazerOutro() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <DarkWordmark className="text-[44px]" />
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
