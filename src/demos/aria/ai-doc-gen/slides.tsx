import { motion } from 'framer-motion';
import type { SlideKind } from './data';

/** 슬라이드 썸네일의 종류별 미니 목업 (순수 div) */
function SlideBody({ kind }: { kind: SlideKind }) {
  switch (kind) {
    case 'cover':
      return (
        <div className="flex h-full flex-col items-start justify-center gap-1.5 px-3">
          <div className="h-[3px] w-8 rounded bg-brass-400/80" />
          <div className="h-2 w-3/4 rounded bg-white/30" />
          <div className="h-1.5 w-1/3 rounded bg-white/15" />
        </div>
      );
    case 'kpi':
      return (
        <div className="grid h-full grid-cols-2 gap-1.5 p-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded bg-white/[0.07] p-1.5">
              <div className="h-1 w-2/3 rounded bg-white/20" />
              <div className="mt-1 h-1.5 w-1/2 rounded bg-brass-400/60" />
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div className="flex h-full flex-col gap-1 p-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-1">
              <div className="h-1.5 flex-[2] rounded bg-white/15" />
              <div className="h-1.5 flex-1 rounded bg-white/10" />
              <div className="h-1.5 flex-1 rounded bg-white/10" />
            </div>
          ))}
        </div>
      );
    case 'chart':
      return (
        <div className="flex h-full items-end gap-1 p-2.5">
          {[35, 45, 40, 55, 62, 58, 74, 85].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brass-500/40 to-brass-300/70" style={{ height: `${h}%` }} />
          ))}
        </div>
      );
    case 'bars':
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-2.5">
          {[85, 60, 38].map((w, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-1 w-5 rounded bg-white/15" />
              <div className="h-2 rounded bg-emerald-400/50" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      );
  }
}

export function SlideCard({
  title,
  sub,
  kind,
  index,
}: {
  title: string;
  sub: string;
  kind: SlideKind;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#1c1b20] shadow-lg"
    >
      <div className="aspect-[16/9] border-b border-white/[0.06] bg-[#221f25]">
        <SlideBody kind={kind} />
      </div>
      <div className="px-2.5 py-2">
        <p className="truncate text-[11px] font-medium text-zinc-200">
          <span className="mr-1.5 font-mono text-[9px] text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
          {title}
        </p>
        <p className="truncate text-[10px] text-zinc-500">{sub}</p>
      </div>
    </motion.div>
  );
}

export function SlidePlaceholder() {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.05]">
      <div className="shimmer aspect-[16/9]" />
      <div className="space-y-1.5 px-2.5 py-2">
        <div className="shimmer h-2 w-2/3 rounded" />
        <div className="shimmer h-1.5 w-1/3 rounded" />
      </div>
    </div>
  );
}
