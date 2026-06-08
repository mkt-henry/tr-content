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

/** 앱스토어 다운로드 뱃지 (공식 스타일 — 다크 필 + 애플 글리프) */
function AppStoreBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-black px-2.5 py-1.5 ring-1 ring-white/20">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
        <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.24 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.29-1.27 3.15-2.53.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.72-1.04-2.75-4.13zM14.6 4.7c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
      </svg>
      <span className="text-left leading-none text-white">
        <span className="block text-[7px] tracking-wide">Download on the</span>
        <span className="mt-0.5 block text-[13px] font-semibold">App Store</span>
      </span>
    </span>
  );
}

/** 구글 플레이 다운로드 뱃지 (다크 필 + 컬러 플레이 글리프) */
function PlayStoreBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-black px-2.5 py-1.5 ring-1 ring-white/20">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <defs>
          <linearGradient id="tz-gplay" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="40%" stopColor="#00F076" />
            <stop offset="72%" stopColor="#FFCE00" />
            <stop offset="100%" stopColor="#FF3A44" />
          </linearGradient>
        </defs>
        <path d="M4 3 L20 12 L4 21 Z" fill="url(#tz-gplay)" />
      </svg>
      <span className="text-left leading-none text-white">
        <span className="block text-[7px] tracking-wide">GET IT ON</span>
        <span className="mt-0.5 block text-[13px] font-semibold">Google Play</span>
      </span>
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

/** 아웃트로(~3s): 그라디언트 배경 + 로고·태그 + 앱스토어/구글플레이 뱃지 */
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-6 flex items-center gap-2.5"
        >
          <AppStoreBadge />
          <PlayStoreBadge />
        </motion.div>
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
