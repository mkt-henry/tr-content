import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Scale, Sparkles, ArrowLeftRight } from 'lucide-react';
import { usePair } from './state';
import {
  SECTORS,
  STR,
  CONTEXT,
  LIMITS,
  computeExposure,
  fmtSigned,
  type PairSeed,
  type Exposure,
} from './data';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ─────────────────────────── 섹터 칩 ─────────────────────────── */

export function SectorChips({ compact }: { compact?: boolean }) {
  const { sector, loadSector } = usePair();
  const lang = useLang();
  return (
    <div
      className={cn('flex items-center gap-2 border-b px-4 py-2.5', compact && 'overflow-x-auto demo-scroll')}
      style={{ borderColor: AL.border, background: AL.panelBg }}
    >
      {!compact && (
        <span className="mr-1 text-[11px] font-medium text-zinc-500">{pick(STR.sectorRow, lang)}</span>
      )}
      {SECTORS.map((s) => {
        const active = sector === s.id;
        return (
          <button
            key={s.id}
            data-demo-id={`sector-${s.id}`}
            onClick={() => loadSector(s.id)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all',
              active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200',
            )}
            style={
              active
                ? { background: AL.accent, boxShadow: `0 0 24px -6px ${AL.accentRing}` }
                : { background: 'rgba(255,255,255,0.04)', border: `1px solid ${AL.border}` }
            }
          >
            {pick(s.label, lang)}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── 페어 북 ─────────────────────────── */

export function PairBook({ compact }: { compact?: boolean }) {
  const { sector, pairs, autoBalance } = usePair();
  const lang = useLang();

  if (!sector) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: AL.accentSoft, border: `1px solid ${AL.border}` }}
        >
          <Scale className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-[15px] font-semibold text-zinc-200">{pick(STR.emptyTitle, lang)}</p>
        <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-zinc-500">{pick(STR.emptyHint, lang)}</p>
      </div>
    );
  }

  return (
    <div className="demo-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
      {/* 헤더 + 자동 밸런싱 버튼 */}
      <div className="mb-3 flex items-center gap-2.5">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h2 className="text-[14px] font-semibold text-zinc-100">{pick(STR.bookTitle, lang)}</h2>
        <button
          data-demo-id="auto-balance"
          onClick={autoBalance}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white transition-all"
          style={{ background: AL.accent, boxShadow: `0 0 20px -8px ${AL.accentRing}` }}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {pick(STR.autoBalance, lang)}
        </button>
      </div>

      <div className="space-y-3">
        {pairs.map((p, i) => (
          <PairCard key={p.id} pair={p} index={i} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function PairCard({ pair, index, compact }: { pair: PairSeed; index: number; compact?: boolean }) {
  const lang = useLang();
  return (
    <motion.div
      data-demo-id={`pair-${index}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl p-3.5"
      style={{ background: AL.cardBg, border: `1px solid ${AL.border}` }}
    >
      <LegRow leg={pair.long} side="long" w={pair.longW} demoId={`weight-${index}`} />
      <div className="my-2 h-px" style={{ background: AL.border }} />
      <LegRow leg={pair.short} side="short" w={pair.shortW} />

      {!compact && (
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="truncate">{pick(pair.thesis, lang)}</span>
          <span className="ml-auto shrink-0 font-mono text-zinc-400">
            {pick(STR.edgeLabel, lang)} <span className="text-violet-300">+{pair.edge.toFixed(1)}%p</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

function LegRow({
  leg,
  side,
  w,
  demoId,
}: {
  leg: { name: { ko: string; en: string }; ticker: string };
  side: 'long' | 'short';
  w: number;
  demoId?: string;
}) {
  const lang = useLang();
  const long = side === 'long';
  const color = long ? AL.up : AL.down;
  const over = w > LIMITS.single; // 단일종목 초과
  const fill = clamp((w / LIMITS.single) * 100, 0, 100);
  return (
    <div data-demo-id={demoId} className="flex items-center gap-3">
      <span
        className="flex w-11 shrink-0 items-center justify-center gap-0.5 rounded-md py-0.5 text-[10px] font-bold"
        style={{ color, background: long ? 'rgba(52,211,153,0.12)' : 'rgba(244,63,94,0.12)' }}
      >
        {long ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {pick(long ? STR.longLabel : STR.shortLabel, lang)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <p className="truncate text-[12.5px] font-medium text-zinc-100">{pick(leg.name, lang)}</p>
          <p className="shrink-0 font-mono text-[10px] text-zinc-500">{leg.ticker}</p>
        </div>
        {/* 비중 바 */}
        <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${fill}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ background: over ? AL.down : color, boxShadow: over ? `0 0 12px -2px ${AL.down}` : undefined }}
          />
        </div>
      </div>

      <span className="w-12 shrink-0 text-right font-mono text-[12.5px] font-semibold" style={{ color: over ? AL.down : '#e4e4e7' }}>
        {w.toFixed(1)}%
      </span>
    </div>
  );
}

/* ─────────────────────────── 리스크 게이지 ─────────────────────────── */

/** 순노출 — 중앙 0 기준 양방향 게이지 */
function NetGauge({ e }: { e: Exposure }) {
  const lang = useLang();
  const breach = Math.abs(e.net) > LIMITS.net;
  const balanced = Math.abs(e.net) <= 2;
  const color = breach ? AL.down : balanced ? AL.up : AL.accent;
  // -20..+20 → 3..97%, 중앙 50%
  const pos = clamp(50 + (e.net / LIMITS.net) * 50, 3, 97);
  const left = Math.min(50, pos);
  const width = Math.abs(pos - 50);
  return (
    <GaugeShell
      demoId="net-gauge"
      label={pick(STR.netLabel, lang)}
      value={fmtSigned(e.net)}
      valueColor={color}
      tag={breach ? { text: pick(STR.breachTag, lang), color: AL.down } : balanced ? { text: pick(STR.neutralTag, lang), color: AL.up } : undefined}
      limit={`${pick(STR.limitTag, lang)} ±${LIMITS.net}%`}
    >
      <div className="relative h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {/* 중앙선 */}
        <div className="absolute top-[-2px] bottom-[-2px] left-1/2 w-px -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.25)' }} />
        <motion.div
          className="absolute top-0 h-full rounded-full"
          animate={{ left: `${left}%`, width: `${width}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ background: color, boxShadow: breach ? `0 0 12px -2px ${AL.down}` : undefined }}
        />
      </div>
    </GaugeShell>
  );
}

/** 단방향 미터 (총노출 / 단일종목) */
function Meter({
  demoId,
  label,
  value,
  scaleMax,
  limit,
  breach,
}: {
  demoId?: string;
  label: string;
  value: number;
  scaleMax: number;
  limit: number;
  breach: boolean;
}) {
  const lang = useLang();
  const color = breach ? AL.down : AL.cyan;
  const fill = clamp((value / scaleMax) * 100, 0, 100);
  const limitPos = clamp((limit / scaleMax) * 100, 0, 100);
  return (
    <GaugeShell
      demoId={demoId}
      label={label}
      value={`${value.toFixed(value < 100 ? 1 : 0)}%`}
      valueColor={breach ? AL.down : '#e4e4e7'}
      tag={breach ? { text: pick(STR.breachTag, lang), color: AL.down } : { text: pick(STR.roomTag, lang), color: AL.up }}
      limit={`${pick(STR.limitTag, lang)} ${limit}%`}
    >
      <div className="relative h-2 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="absolute top-[-2px] bottom-[-2px] w-px" style={{ left: `${limitPos}%`, background: 'rgba(255,255,255,0.35)' }} />
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          animate={{ width: `${fill}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ background: color, boxShadow: breach ? `0 0 12px -2px ${AL.down}` : undefined }}
        />
      </div>
    </GaugeShell>
  );
}

function GaugeShell({
  demoId,
  label,
  value,
  valueColor,
  tag,
  limit,
  children,
}: {
  demoId?: string;
  label: string;
  value: string;
  valueColor: string;
  tag?: { text: string; color: string };
  limit: string;
  children: React.ReactNode;
}) {
  return (
    <div data-demo-id={demoId}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[11.5px] text-zinc-400">{label}</span>
        {tag && (
          <span
            className="rounded px-1.5 py-0.5 text-[9.5px] font-bold"
            style={{ color: tag.color, background: `${tag.color}22` }}
          >
            {tag.text}
          </span>
        )}
        <span className="ml-auto font-mono text-[13px] font-semibold" style={{ color: valueColor }}>
          {value}
        </span>
      </div>
      {children}
      <div className="mt-1 text-right text-[10px] text-zinc-600">{limit}</div>
    </div>
  );
}

/** Sharpe 히어로 스탯 */
function SharpeStat({ e, compact }: { e: Exposure; compact?: boolean }) {
  const lang = useLang();
  return (
    <div
      data-demo-id="sharpe"
      className={cn('rounded-xl p-3', compact && 'flex items-center gap-2')}
      style={{ background: AL.accentSoft, border: `1px solid ${AL.border}` }}
    >
      <div className={cn('flex items-baseline gap-1.5', compact && 'flex-col items-start gap-0')}>
        <span className="truncate text-[10px] text-zinc-400 lg:text-[11px]">
          {pick(compact ? STR.sharpeShort : STR.sharpeLabel, lang)}
        </span>
        {!compact && <span className="ml-auto text-[10px] text-zinc-500">{pick(STR.sharpeSub, lang)}</span>}
      </div>
      <div className={cn('font-mono font-bold text-violet-200', compact ? 'text-[17px] leading-tight' : 'mt-0.5 text-[26px] leading-none')}>
        {e.sharpe.toFixed(1)}
      </div>
    </div>
  );
}

/* ─────────────────────────── 리스크 패널 (데스크탑 우측) ─────────────────────────── */

export function RiskRail() {
  const pairs = usePair((s) => s.pairs);
  const lang = useLang();
  const e = computeExposure(pairs);
  const hasBook = pairs.length > 0;
  return (
    <aside
      className="hidden w-72 shrink-0 flex-col gap-4 border-l px-4 py-4 lg:flex"
      style={{ borderColor: AL.border, background: AL.panelBg }}
    >
      <div>
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-200">
          <Scale className="h-3.5 w-3.5 text-violet-400" /> {pick(STR.riskTitle, lang)}
        </div>
        <p className="mt-0.5 text-[10.5px] text-zinc-500">{pick(STR.riskSub, lang)}</p>
      </div>

      {hasBook ? (
        <>
          <NetGauge e={e} />
          <Meter demoId="gross-gauge" label={pick(STR.grossLabel, lang)} value={e.gross} scaleMax={LIMITS.gross} limit={LIMITS.gross} breach={e.gross > LIMITS.gross} />
          <Meter demoId="concentration" label={pick(STR.singleLabel, lang)} value={e.maxSingle} scaleMax={LIMITS.single * 1.5} limit={LIMITS.single} breach={e.maxSingle > LIMITS.single} />
          <div className="mt-auto">
            <SharpeStat e={e} />
          </div>
        </>
      ) : (
        <p className="text-[11.5px] leading-relaxed text-zinc-600">{pick(CONTEXT, lang)}</p>
      )}
    </aside>
  );
}

/* ─────────────────────────── 리스크 바 (모바일 하단) ─────────────────────────── */

/** 모바일 하단 컴팩트 스탯 — 한 줄 라벨 + 값 + 얇은 바 */
function MiniStat({
  demoId,
  label,
  value,
  valueColor,
  fill,
  limitPos,
  barColor,
  center,
}: {
  demoId?: string;
  label: string;
  value: string;
  valueColor: string;
  fill: number;
  limitPos?: number;
  barColor: string;
  center?: boolean;
}) {
  return (
    <div data-demo-id={demoId} className="rounded-lg px-2 py-1.5" style={{ background: AL.cardBg, border: `1px solid ${AL.border}` }}>
      <div className="flex items-baseline justify-between gap-1">
        <span className="truncate text-[10px] text-zinc-500">{label}</span>
        <span className="shrink-0 font-mono text-[12.5px] font-semibold" style={{ color: valueColor }}>{value}</span>
      </div>
      <div className="relative mt-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {center && <div className="absolute top-[-2px] bottom-[-2px] left-1/2 w-px -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.25)' }} />}
        {limitPos != null && <div className="absolute top-[-2px] bottom-[-2px] w-px" style={{ left: `${limitPos}%`, background: 'rgba(255,255,255,0.35)' }} />}
        <motion.div
          className="absolute top-0 h-full rounded-full"
          animate={{ left: center ? `${Math.min(50, 50 + (fill / 2))}%` : '0%', width: center ? `${Math.abs(fill / 2)}%` : `${clamp(fill, 0, 100)}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ background: barColor }}
        />
      </div>
    </div>
  );
}

export function RiskBar() {
  const pairs = usePair((s) => s.pairs);
  const lang = useLang();
  if (pairs.length === 0) return null;
  const e = computeExposure(pairs);
  const netBreach = Math.abs(e.net) > LIMITS.net;
  const netBalanced = Math.abs(e.net) <= 2;
  const netColor = netBreach ? AL.down : netBalanced ? AL.up : AL.accent;
  const singleBreach = e.maxSingle > LIMITS.single;
  return (
    <div className="border-t px-3 py-2.5" style={{ borderColor: AL.border, background: AL.panelBg }}>
      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          demoId="net-gauge"
          label={pick(STR.netShort, lang)}
          value={fmtSigned(e.net)}
          valueColor={netColor}
          fill={clamp((e.net / LIMITS.net) * 100, -100, 100)}
          barColor={netColor}
          center
        />
        <MiniStat
          demoId="concentration"
          label={pick(STR.singleShort, lang)}
          value={`${e.maxSingle.toFixed(1)}%`}
          valueColor={singleBreach ? AL.down : '#e4e4e7'}
          fill={(e.maxSingle / (LIMITS.single * 1.5)) * 100}
          limitPos={(LIMITS.single / (LIMITS.single * 1.5)) * 100}
          barColor={singleBreach ? AL.down : AL.cyan}
        />
        <SharpeStat e={e} compact />
      </div>
    </div>
  );
}
