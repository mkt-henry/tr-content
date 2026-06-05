import { Home, Star, Store, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';

/** Treazer 브랜드 오렌지 */
export const TZ_ORANGE = '#f97316';

/** 금화 아이콘 — 그라디언트 동전 + G */
export function Coin({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 font-bold text-amber-800 ring-1 ring-amber-600/50',
        className ?? 'h-4 w-4 text-[9px]',
      )}
    >
      G
    </span>
  );
}

/** 보유 골드 필 — 다크 캡슐 (실제 앱 Home 우상단과 동일) */
export function GoldPill({ amount, flash }: { amount: number; flash?: boolean }) {
  return (
    <motion.div
      data-demo-id="gold-pill"
      animate={flash ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      className="flex items-center gap-1.5 rounded-full bg-zinc-900 py-1 pl-1.5 pr-3 ring-1 ring-orange-400/60"
    >
      <Coin className="h-4.5 w-4.5 text-[9px]" />
      <span className="text-[13px] font-bold tabular-nums text-white">{amount.toLocaleString('en-US')}</span>
    </motion.div>
  );
}

/** 하단 탭바 — Home / Mission / Store / My */
export function BottomNav({ active }: { active: 'home' | 'mission' | 'store' | 'my' }) {
  const items = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'mission', label: 'Mission', Icon: Star },
    { id: 'store', label: 'Store', Icon: Store },
    { id: 'my', label: 'My', Icon: User },
  ] as const;

  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-zinc-200 bg-white px-2 pb-2 pt-1.5">
      {items.map(({ id, label, Icon }) => (
        <div key={id} className="flex w-14 flex-col items-center gap-0.5">
          <Icon className={cn('h-5 w-5', id === active ? 'text-orange-500' : 'text-zinc-400')} />
          <span className={cn('text-[10px] font-medium', id === active ? 'text-orange-500' : 'text-zinc-400')}>
            {label}
          </span>
        </div>
      ))}
    </nav>
  );
}

/** Treazer 워드마크 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold tracking-tight text-zinc-900', className)}>
      Treazer<span className="text-orange-500">.</span>
    </span>
  );
}

/** 데모 공용 배경 — 웜 오렌지 다크 (variants에서 사용) */
export const TZ_BACKGROUND = {
  kind: 'gradient' as const,
  css: 'radial-gradient(ellipse 80% 60% at 75% 8%, rgba(249,115,22,0.28), transparent 58%), radial-gradient(ellipse 65% 55% at 10% 95%, rgba(154,52,18,0.32), transparent 60%), linear-gradient(160deg, #181009 0%, #0b0705 100%)',
  blobs: [
    'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-orange-500/12 blur-[140px]',
    'absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-amber-700/20 blur-[120px]',
  ],
};
