import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Filter, Search } from 'lucide-react';
import { CountUp } from '../../../ui/CountUp';
import { useScreener } from './state';
import {
  STRATEGIES,
  MARKETS,
  SECTORS,
  STR,
  getStrategy,
  resultLabel,
  fmtTurnover,
  fmtMktCap,
  type ScreenRow,
} from './data';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

/** 상단 전략 칩 행 */
export function StrategyChips({ compact }: { compact?: boolean }) {
  const { selected, select } = useScreener();
  const lang = useLang();
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b px-4 py-2.5',
        compact && 'overflow-x-auto demo-scroll',
      )}
      style={{ borderColor: AL.border, background: AL.panelBg }}
    >
      {!compact && (
        <span className="mr-1 text-[11px] font-medium text-zinc-500">{pick(STR.strategyRow, lang)}</span>
      )}
      {STRATEGIES.map((s) => {
        const active = selected === s.id;
        return (
          <button
            key={s.id}
            data-demo-id={`strategy-${s.id}`}
            onClick={() => select(s.id)}
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
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

/** 좌측 얇은 필터 사이드바 (장식용) */
export function FilterSidebar() {
  const lang = useLang();
  return (
    <aside
      className="hidden w-48 shrink-0 flex-col gap-5 border-r px-4 py-4 lg:flex"
      style={{ borderColor: AL.border, background: AL.panelBg }}
    >
      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-300">
        <Filter className="h-3.5 w-3.5 text-violet-400" /> {pick(STR.filterTitle, lang)}
      </div>

      <FilterGroup label={pick(STR.marketLabel, lang)}>
        {MARKETS.map((m) => (
          <CheckRow key={m.id} label={m.label} checked={m.checked} />
        ))}
      </FilterGroup>

      <FilterGroup label={pick(STR.sectorLabel, lang)}>
        {SECTORS.map((s) => (
          <CheckRow key={s.id} label={pick(s.label, lang)} checked={s.checked} />
        ))}
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wide text-zinc-600">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-zinc-400">
      <span
        className={cn('flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border')}
        style={
          checked
            ? { background: AL.accent, borderColor: AL.accent }
            : { borderColor: 'rgba(255,255,255,0.18)' }
        }
      >
        {checked && (
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </div>
  );
}

/** 결과 영역 — 헤더 카운트 + 테이블 (또는 빈 상태) */
export function ResultsTable({ compact }: { compact?: boolean }) {
  const { selected } = useScreener();
  const lang = useLang();
  const strategy = getStrategy(selected);

  if (!strategy) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: AL.accentSoft, border: `1px solid ${AL.border}` }}
        >
          <Search className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-[15px] font-semibold text-zinc-200">{pick(STR.emptyTitle, lang)}</p>
        <p className="mt-1.5 max-w-xs text-[12px] leading-relaxed text-zinc-500">{pick(STR.emptyHint, lang)}</p>
      </div>
    );
  }

  const rows = strategy.rows;
  const label = resultLabel(lang);

  return (
    <div className="demo-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6">
      {/* 결과 헤더 */}
      <div className="mb-3 flex items-baseline gap-2.5">
        <h2 className="text-[15px] font-semibold text-zinc-100">{strategy.name}</h2>
        <span className="text-[12px] text-zinc-500">{pick(strategy.sub, lang)}</span>
        <span className="ml-auto text-[12px] text-zinc-400">
          {label.pre}
          <span className="font-mono font-semibold text-violet-300">
            <CountUp key={strategy.id} value={rows.length} duration={0.8} />
          </span>
          {label.post}
        </span>
      </div>

      {/* 테이블 헤더 */}
      <div
        className="grid items-center gap-2 rounded-t-lg px-3 py-2 text-[11px] font-medium text-zinc-500"
        style={{
          gridTemplateColumns: compact ? '2.2rem 1fr 3rem 3.4rem' : '2.6rem 1fr 4.5rem 4.5rem 6rem 5rem',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: `1px solid ${AL.border}`,
        }}
      >
        <span>{pick(STR.colRank, lang)}</span>
        <span>{pick(STR.colName, lang)}</span>
        <span className="text-right">{pick(STR.colScore, lang)}</span>
        <span className="text-right">{pick(STR.colChange, lang)}</span>
        {!compact && <span className="text-right">{pick(STR.colTurnover, lang)}</span>}
        {!compact && <span className="text-right">{pick(STR.colMktCap, lang)}</span>}
      </div>

      {/* 행 — stagger 등장 */}
      <div>
        {rows.map((row, i) => (
          <Row key={`${strategy.id}-${row.ticker}`} row={row} index={i} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function Row({ row, index, compact }: { row: ScreenRow; index: number; compact?: boolean }) {
  const lang = useLang();
  const up = row.changePct >= 0;
  return (
    <motion.div
      data-demo-id={`row-${index}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="grid items-center gap-2 px-3 py-2.5 text-[12.5px]"
      style={{
        gridTemplateColumns: compact ? '2.2rem 1fr 3rem 3.4rem' : '2.6rem 1fr 4.5rem 4.5rem 6rem 5rem',
        borderBottom: `1px solid ${AL.border}`,
      }}
    >
      <span className="font-mono text-[12px] text-zinc-500">{index + 1}</span>

      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-100">{pick(row.name, lang)}</p>
        <p className="font-mono text-[10.5px] text-zinc-500">{row.ticker}</p>
      </div>

      {/* 점수 — CountUp + 미니 게이지 */}
      <div className="text-right">
        <span className="font-mono font-semibold text-violet-300">
          <CountUp value={row.score} duration={1.0} />
        </span>
      </div>

      {/* 등락률 — CountUp */}
      <div
        className="flex items-center justify-end gap-0.5 font-mono font-semibold"
        style={{ color: up ? AL.up : AL.down }}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? '+' : '−'}
        <CountUp value={Math.abs(row.changePct)} decimals={1} duration={1.0} />%
      </div>

      {!compact && (
        <span className="text-right font-mono text-zinc-400">{fmtTurnover(row.turnover, lang)}</span>
      )}
      {!compact && (
        <span className="text-right font-mono text-zinc-400">{fmtMktCap(row.mktCap, lang)}</span>
      )}
    </motion.div>
  );
}
