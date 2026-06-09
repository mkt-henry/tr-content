import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp, Activity, Database, ShieldCheck } from 'lucide-react';
import { CountUp } from '../../../ui/CountUp';
import { usePipe } from './state';
import {
  SOURCES,
  PIPELINE,
  BENCH_MODELS,
  BENCH_METRICS,
  STR,
  totalLabel,
  type Kpi,
} from './data';
import { pick, useLang } from '../_shared/i18n';
import { AL } from '../_shared/theme';
import { cn } from '../../../lib/cn';

/** 상단 KPI 카드 */
export function KpiCard({ kpi, index, compact }: { kpi: Kpi; index: number; compact?: boolean }) {
  const { loaded, highlight } = usePipe();
  const lang = useLang();
  const active = highlight === kpi.id;
  return (
    <motion.div
      data-demo-id={`kpi-${kpi.id}`}
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-xl border p-4 transition-all duration-300',
        active
          ? 'border-violet-400/50 bg-violet-500/[0.08] shadow-[0_0_30px_-8px_rgba(124,92,255,0.45)]'
          : 'border-white/[0.07] bg-white/[0.03]',
        compact && 'p-3.5',
      )}
    >
      <p className="text-[11px] text-zinc-500">{pick(kpi.label, lang)}</p>
      <p className={cn('mt-1 font-mono font-semibold text-zinc-100', compact ? 'text-[19px]' : 'text-[23px]')}>
        {kpi.prefix}
        <CountUp value={kpi.value} decimals={kpi.decimals ?? 0} play={loaded} />
        <span className="ml-0.5 text-[12px] font-normal text-zinc-400">{pick(kpi.unit, lang)}</span>
      </p>
      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-400">
        <TrendingUp className="h-3 w-3" />
        {pick(kpi.delta, lang)}
      </p>
    </motion.div>
  );
}

/** 소스별 실시간 수집 패널 */
export function SourcePanel({ compact }: { compact?: boolean }) {
  const { loaded, highlight } = usePipe();
  const lang = useLang();
  return (
    <motion.div
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
    >
      <h4 className="mb-3 flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-300">
        <Database className="h-3.5 w-3.5 text-zinc-500" /> {pick(STR.sourcesTitle, lang)}
      </h4>
      <div className={cn('space-y-3', compact && 'space-y-2.5')}>
        {SOURCES.map((s, i) => {
          const active = highlight === s.id;
          return (
            <div
              key={s.id}
              data-demo-id={`source-${s.id}`}
              className={cn('rounded-lg px-1 py-0.5 transition-colors', active && 'bg-white/[0.04]')}
            >
              <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {pick(s.name, lang)}
                  <span className="text-[10px] text-zinc-600">{pick(s.type, lang)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-zinc-200">
                    <CountUp value={s.volume} decimals={s.decimals ?? 0} play={loaded} />
                    <span className="ml-0.5 text-[10px] text-zinc-500">{pick(s.unit, lang)}</span>
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    {pick(STR.liveBadge, lang)}
                  </span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: s.color }}
                  initial={false}
                  animate={{ width: loaded ? `${s.fill}%` : '0%' }}
                  transition={{ duration: 0.9, delay: 0.45 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** 검증 파이프라인 단계 바 */
export function PipelineWidget() {
  const { loaded } = usePipe();
  const lang = useLang();
  const total = PIPELINE.reduce((a, p) => a + p.count, 0);
  return (
    <motion.div
      data-demo-id="pipeline-card"
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-300">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" /> {pick(STR.pipelineTitle, lang)}
        </h4>
        <span className="font-mono text-[10px] text-zinc-500">{pick(STR.pipelineNote, lang)}</span>
      </div>
      {/* 누적 비율 바 */}
      <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
        {PIPELINE.map((p, i) => (
          <motion.div
            key={p.id}
            className="h-full"
            style={{ background: p.color }}
            initial={false}
            animate={{ width: loaded ? `${(p.count / total) * 100}%` : '0%' }}
            transition={{ duration: 0.9, delay: 0.6 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        {PIPELINE.map((p) => (
          <div key={p.id} className="text-center">
            <p className="font-mono text-[14px] font-semibold text-zinc-100">
              <CountUp value={p.count} play={loaded} />
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
              {pick(p.label, lang)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** Fin-RATE 벤치마크 카드 — A7Z(퍼플) vs GPT/Gemini(회색) 그룹 막대 */
export function BenchmarkCard({ compact }: { compact?: boolean }) {
  const { loaded, benchmark } = usePipe();
  const lang = useLang();

  // recharts용 행 데이터: 각 항목별로 모델 점수
  const chartData = BENCH_METRICS.map((m, mi) => {
    const row: Record<string, string | number> = { metric: pick(m.label, lang) };
    BENCH_MODELS.forEach((mod) => {
      row[mod.id] = mod.scores[mi];
    });
    return row;
  });

  return (
    <motion.div
      data-demo-id="benchmark-card"
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className={cn(
        'rounded-xl border p-4 transition-all duration-300',
        benchmark
          ? 'border-violet-400/50 bg-violet-500/[0.06] shadow-[0_0_36px_-10px_rgba(124,92,255,0.5)]'
          : 'border-white/[0.07] bg-white/[0.03]',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-300">
          <Activity className="h-3.5 w-3.5 text-violet-400" /> {pick(STR.benchTitle, lang)}
        </h4>
        <span className="font-mono text-[10px] text-zinc-500">{pick(STR.benchNote, lang)}</span>
      </div>

      {/* 범례 */}
      <div className="mb-1 flex flex-wrap items-center gap-3">
        {BENCH_MODELS.map((mod) => (
          <span key={mod.id} className="flex items-center gap-1.5 text-[10.5px] text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: mod.color }} />
            <span className={cn(mod.primary && 'font-medium text-violet-300')}>{mod.name}</span>
          </span>
        ))}
      </div>

      <div className={cn(compact ? 'h-44' : 'h-52')}>
        {loaded && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 14, right: 4, left: -20, bottom: 0 }} barGap={3} barCategoryGap="28%">
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="metric" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              {BENCH_MODELS.map((mod) => (
                <Bar key={mod.id} dataKey={mod.id} radius={[3, 3, 0, 0]} animationDuration={1100} isAnimationActive>
                  {chartData.map((_, ci) => (
                    <Cell key={ci} fill={mod.color} />
                  ))}
                  {mod.primary && (
                    <LabelList dataKey={mod.id} position="top" fill="#c4b5fd" fontSize={10} className="font-mono" />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <p className="mt-1 text-[10.5px]" style={{ color: AL.accent }}>
        {pick(STR.benchCaption, lang)}
      </p>
    </motion.div>
  );
}

/** 일일 수집 총량 작은 표기 (모바일 등에서 재사용 가능) */
export function TotalChip() {
  const lang = useLang();
  const total = PIPELINE[0].count;
  return <span className="font-mono text-[10px] text-zinc-500">{totalLabel(total, lang)}</span>;
}
