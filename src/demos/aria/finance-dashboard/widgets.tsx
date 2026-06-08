import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import { CountUp } from '../../../ui/CountUp';
import { useDash } from './state';
import { REVENUE_QUARTERLY, REVENUE_YEARLY, SEGMENTS, EVENTS, PIPELINE, STR, pipelineTotal, type Kpi } from './data';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

export function KpiCard({ kpi, index, compact }: { kpi: Kpi; index: number; compact?: boolean }) {
  const { loaded, highlight } = useDash();
  const lang = useLang();
  const active = highlight === kpi.id;
  return (
    <motion.div
      data-demo-id={`kpi-${kpi.id}`}
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-xl border bg-white/[0.03] p-4 transition-all duration-300',
        active ? 'border-emerald-400/50 bg-emerald-500/[0.07] shadow-[0_0_30px_-8px_rgba(52,211,153,0.4)]' : 'border-white/[0.07]',
        compact && 'p-3.5',
      )}
    >
      <p className="text-[11px] text-zinc-500">{pick(kpi.label, lang)}</p>
      <p className={cn('mt-1 font-mono font-semibold text-zinc-100', compact ? 'text-[19px]' : 'text-[23px]')}>
        {kpi.prefix}
        <CountUp value={kpi.value} decimals={kpi.decimals ?? 0} play={loaded} />
        <span className="ml-0.5 text-[12px] font-normal text-zinc-400">{pick(kpi.unit, lang)}</span>
      </p>
      <p
        className={cn(
          'mt-1 flex items-center gap-1 text-[11px] font-medium',
          kpi.positive ? 'text-emerald-400' : 'text-rose-400',
        )}
      >
        {kpi.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {pick(kpi.delta, lang)}
      </p>
    </motion.div>
  );
}

export function RevenueChart({ compact }: { compact?: boolean }) {
  const { loaded, period } = useDash();
  const lang = useLang();
  const data = period === 'quarter' ? REVENUE_QUARTERLY : REVENUE_YEARLY;
  return (
    <motion.div
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="flex min-h-0 flex-col rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[12.5px] font-medium text-zinc-300">{pick(STR.revenueTitle, lang)}</h4>
        <span className="font-mono text-[10px] text-zinc-500">{pick(STR.revenueNote, lang)}</span>
      </div>
      <div className={cn(compact ? 'h-40' : 'h-56')}>
        {loaded && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={period} data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1f',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(v: number, name: string) => [
                  lang === 'ko' ? `₩${v.toLocaleString()}억` : `₩${v.toLocaleString()} ×100M`,
                  name === 'value' ? pick(STR.seriesAssumed, lang) : pick(STR.seriesCeded, lang),
                ]}
              />
              <Area type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} fill="url(#rev)" animationDuration={1100} />
              <Area type="monotone" dataKey="op" stroke="#d9ad78" strokeWidth={1.5} fill="transparent" strokeDasharray="4 3" animationDuration={1100} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

export function SegmentBars({ compact }: { compact?: boolean }) {
  const { loaded, segment, setSegment } = useDash();
  const lang = useLang();
  return (
    <motion.div
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
    >
      <h4 className="mb-3 text-[12.5px] font-medium text-zinc-300">{pick(STR.segmentTitle, lang)}</h4>
      <div className="space-y-3">
        {SEGMENTS.map((sg) => {
          const dimmed = segment !== null && segment !== sg.id;
          return (
            <button
              key={sg.id}
              data-demo-id={`segment-${sg.id}`}
              onClick={() => setSegment(sg.id)}
              className={cn('block w-full text-left transition-opacity duration-300', dimmed && 'opacity-30')}
            >
              <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                <span className="text-zinc-300">{pick(sg.name, lang)}</span>
                <span className="font-mono text-zinc-400">
                  {lang === 'ko' ? `₩${sg.value}억` : `₩${sg.value} ×100M`} · {sg.share}%
                  <span className="ml-1.5 text-emerald-400">{pick(sg.delta, lang)}</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: sg.color }}
                  initial={false}
                  animate={{ width: loaded ? `${sg.share}%` : '0%' }}
                  transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </button>
          );
        })}
      </div>
      {!compact && (
        <p className="mt-3 text-[10.5px] text-zinc-600">{pick(STR.segmentHint, lang)}</p>
      )}
    </motion.div>
  );
}

/** 갱신 파이프라인 단계별 건수 미니 위젯 */
export function PipelineWidget() {
  const { loaded } = useDash();
  const lang = useLang();
  const total = PIPELINE.reduce((a, p) => a + p.count, 0);
  return (
    <motion.div
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
    >
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="text-[12.5px] font-medium text-zinc-300">{pick(STR.pipelineTitle, lang)}</h4>
        <span className="font-mono text-[10px] text-zinc-500">{pipelineTotal(total, lang)}</span>
      </div>
      {/* 누적 비율 바 */}
      <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
        {PIPELINE.map((p) => (
          <motion.div
            key={p.id}
            className="h-full"
            style={{ background: p.color }}
            initial={false}
            animate={{ width: loaded ? `${(p.count / total) * 100}%` : '0%' }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        {PIPELINE.map((p) => (
          <div key={p.id} className="text-center">
            <p className="font-mono text-[15px] font-semibold text-zinc-100">{p.count}</p>
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

export function EventsList() {
  const { loaded } = useDash();
  const lang = useLang();
  return (
    <motion.div
      initial={false}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
    >
      <h4 className="mb-3 flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-300">
        <CalendarDays className="h-3.5 w-3.5 text-zinc-500" /> {pick(STR.eventsTitle, lang)}
      </h4>
      <div className="space-y-2.5">
        {EVENTS.map((e, i) => (
          <div key={i} className="flex items-center gap-3 text-[12px]">
            <span className="font-mono text-[10.5px] text-zinc-500">{e.date}</span>
            <span className="flex-1 truncate text-zinc-300">{pick(e.title, lang)}</span>
            <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400">{pick(e.tag, lang)}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
