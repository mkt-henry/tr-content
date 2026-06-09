import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { Coin } from '../_shared/ui';

// ---------------------------------------------------------------------------
// Thumbnail
// ---------------------------------------------------------------------------

export function Thumbnail({
  thumb,
  className,
}: {
  thumb: { from: string; to: string; emoji: string };
  className?: string;
}) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-xl', className ?? 'h-14 w-14')}
      style={{ background: `linear-gradient(135deg, ${thumb.from}, ${thumb.to})` }}
    >
      <span className="text-2xl leading-none">{thumb.emoji}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GoldFloat
// ---------------------------------------------------------------------------

export function GoldFloat({ show, amount }: { show: boolean; amount: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="gold-float"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -28 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[13px] font-bold tabular-nums text-amber-700 ring-1 ring-amber-300"
        >
          <Coin className="h-4 w-4 text-[9px]" />
          <span>+{amount.toLocaleString('en-US')} G</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// ComboBadge
// ---------------------------------------------------------------------------

export function ComboBadge({ combo }: { combo: number }) {
  return (
    <AnimatePresence>
      {combo >= 2 && (
        <motion.div
          key={`combo-${combo}`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 text-[12px] font-bold text-white shadow-sm"
        >
          🔥 콤보 x{combo}!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
