import { useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { Coin } from '../_shared/ui';
import { pick, useLang } from '../_shared/i18n';
import {
  CURRENCY,
  PERIODS,
  PERIOD_CHANGE,
  STR,
  makeSeries,
  money,
  type Candle,
} from './data';
import { useGoldStore, valuation } from './state';

const CHART_W = 320;
const CHART_H = 150;

/** series의 실제 저점/고점에 맞춰 세로를 꽉 채우는 y 스케일러 (여백 12%) */
function makeScale(series: Candle[]) {
  let min = Math.min(...series.map((d) => d.l));
  let max = Math.max(...series.map((d) => d.h));
  const range = max - min || 1;
  min -= range * 0.12;
  max += range * 0.12;
  return (v: number) => CHART_H - ((v - min) / (max - min)) * CHART_H;
}

/** 마지막(최신) 가격 위에 얹는 라이브 점 — live면 펄스(ping) */
function LiveDot({ leftPct, topPct, color, live }: { leftPct: number; topPct: number; color: string; live?: boolean }) {
  return (
    <span
      className="pointer-events-none absolute flex h-2 w-2 items-center justify-center"
      style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: 'translate(-50%, -50%)' }}
    >
      {live && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: color }} />
      )}
      <span className="relative inline-flex h-2 w-2 rounded-full ring-2 ring-white" style={{ background: color }} />
    </span>
  );
}

/** 오토스케일 라인(area) 차트 + 현재가 점선 + 라이브 점 */
function LineChartSvg({ series, live }: { series: Candle[]; live?: boolean }) {
  const W = CHART_W;
  const H = CHART_H;
  const step = W / (series.length - 1);
  const y = makeScale(series);
  const line = series.map((d, i) => `${i * step},${y(d.c)}`).join(' ');
  const area = `0,${H} ${line} ${W},${H}`;
  const lastC = series[series.length - 1].c;
  const lastY = y(lastC);

  return (
    <div className="relative h-[150px] w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#goldArea)" />
        <line x1={0} y1={lastY} x2={W} y2={lastY} stroke="#f97316" strokeWidth={1} strokeDasharray="4 4" opacity={0.45} />
        <polyline points={line} fill="none" stroke="#f97316" strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <LiveDot leftPct={100} topPct={(lastY / H) * 100} color="#f97316" live={live} />
    </div>
  );
}

/** 오토스케일 캔들 차트 — 상승봉 emerald / 하락봉 red + 현재가 점선 + 라이브 점 */
function CandleChartSvg({ series, live }: { series: Candle[]; live?: boolean }) {
  const W = CHART_W;
  const H = CHART_H;
  const slot = W / series.length;
  const bw = slot * 0.6;
  const y = makeScale(series);
  const last = series[series.length - 1];
  const lastUp = last.c >= last.o;
  const lastColor = lastUp ? '#10b981' : '#ef4444';
  const lastX = (series.length - 1) * slot + slot / 2;
  const lastY = y(last.c);

  return (
    <div className="relative h-[150px] w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none">
        {/* 현재가 점선 */}
        <line x1={0} y1={lastY} x2={W} y2={lastY} stroke={lastColor} strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
        {series.map((d, i) => {
          const cx = i * slot + slot / 2;
          const up = d.c >= d.o;
          const color = up ? '#10b981' : '#ef4444';
          const top = y(Math.max(d.o, d.c));
          const bot = y(Math.min(d.o, d.c));
          return (
            <g key={i}>
              <line x1={cx} y1={y(d.h)} x2={cx} y2={y(d.l)} stroke={color} strokeWidth={1} />
              <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(1, bot - top)} fill={color} />
            </g>
          );
        })}
      </svg>
      <LiveDot leftPct={(lastX / W) * 100} topPct={(lastY / H) * 100} color={lastColor} live={live} />
    </div>
  );
}

export function GoldPriceScreen() {
  const { gold, goldPrice, avgCost, chartMode, period, view, nowSeries, closePrice, setChartMode, setPeriod, liveTick, tick } =
    useGoldStore();
  const lang = useLang();
  const cur = CURRENCY[lang];

  const v = valuation(gold, goldPrice, avgCost, cur);
  // 'Now'는 라이브 시계열(state), 그 외 기간은 정적 시계열
  const staticSeries = useMemo(() => makeSeries(period), [period]);
  const series = period === 'now' ? nowSeries : staticSeries;

  // 'Now' 기간 + 시세 화면일 때만 라이브 틱 — 캔들·평가액 실시간 변동
  useEffect(() => {
    if (view !== 'price' || period !== 'now') return;
    const id = setInterval(() => liveTick(), 750);
    return () => clearInterval(id);
  }, [view, period, liveTick]);

  // 차트 등락(%) — 기간별 현실적 우상향 수치(차트 형태와 분리, 신뢰감 유지)
  const change = PERIOD_CHANGE[period];

  // Today's OHLC — 현재 시세(spot) 기준 고정 배수로 근사 (정적 표시)
  const stats = [
    { label: STR.todaysOpen, value: v.spot * 0.992 },
    { label: STR.todaysHigh, value: v.spot * 1.006 },
    { label: STR.todaysLow, value: v.spot * 0.985 },
    { label: STR.todaysClose, value: v.spot * 0.998 },
  ];

  return (
    <div className="relative flex h-full flex-col bg-[#f4f4f6]">
      {/* 헤더 */}
      <header className="flex shrink-0 items-center gap-3 bg-[#f4f4f6] px-4 pb-2 pt-4">
        <button
          type="button"
          data-demo-id="price-back"
          onClick={closePrice}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </header>

      <div className="demo-scroll flex-1 overflow-y-auto px-4 pb-6">
        {/* 내 골드 평가 카드 — 주인공 */}
        <div
          data-demo-id="my-valuation"
          className="rounded-2xl bg-zinc-900 p-4 text-white ring-1 ring-orange-400/50"
        >
          <span className="text-[12px] font-medium text-zinc-300">{pick(STR.myValuation, lang)}</span>
          <div className="mt-1.5 flex items-center gap-2">
            <Coin className="h-5 w-5 text-[11px]" />
            <span className="text-[22px] font-bold tabular-nums">{gold.toLocaleString('en-US')}</span>
          </div>
          <motion.p
            key={tick}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="mt-0.5 text-[13px] text-zinc-400"
          >
            ≈ {money(v.value, cur)}{' '}
            <span className="text-amber-400/90">({v.grams.toFixed(8)} g)</span>
          </motion.p>

          {/* 평가손익 — 모은 시점 대비 */}
          <div
            data-demo-id="valuation-return"
            className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-emerald-500/12 px-3.5 py-2.5"
          >
            <span className="min-w-0 flex-1 text-[11px] leading-tight text-emerald-300/90">
              {pick(STR.sinceBought, lang)}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-emerald-400">
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              <motion.span
                key={tick}
                initial={{ y: 4, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[18px] font-bold tabular-nums"
              >
                +{(v.ret * 100).toFixed(1)}%
              </motion.span>
              <span className="whitespace-nowrap text-[12px] font-semibold tabular-nums">
                (+{money(v.profit, cur)})
              </span>
            </span>
          </div>
        </div>

        {/* 시세 차트 카드 */}
        <div data-demo-id="gold-chart" className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-bold text-zinc-900">{pick(STR.goldPrice, lang)}</p>
              <p className="mt-0.5 text-[20px] font-bold tabular-nums text-zinc-900">
                {money(v.spot, cur)}
                <span className="text-[12px] font-medium text-zinc-400">{pick(STR.perGram, lang)}</span>
              </p>
            </div>
            {/* Line / Candle 토글 */}
            <div className="flex rounded-lg bg-zinc-100 p-0.5">
              {(['line', 'candle'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  data-demo-id={`chart-${m}`}
                  onClick={() => setChartMode(m)}
                  className={cn(
                    'rounded-md px-3 py-1 text-[11px] font-semibold capitalize transition-colors',
                    chartMode === m ? 'bg-orange-500 text-white' : 'text-zinc-500',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 등락 배지 (우상향 → 항상 양수) */}
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">
            <ArrowUpRight className="h-3 w-3" strokeWidth={3} />
            {(change * 100).toFixed(2)}%
          </span>

          {/* 차트 */}
          <div className="mt-3">
            {chartMode === 'line' ? (
              <LineChartSvg series={series} live={period === 'now'} />
            ) : (
              <CandleChartSvg series={series} live={period === 'now'} />
            )}
          </div>

          {/* 보조지표 (정적 표시) */}
          <div className="mt-2 flex gap-4 text-[11px] font-semibold text-zinc-300">
            <span>MA</span>
            <span>BOLL</span>
            <span>EMA</span>
          </div>

          {/* 기간 토글 */}
          <div className="mt-3 flex gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                data-demo-id={`period-${p.id}`}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  'flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors',
                  period === p.id
                    ? 'bg-orange-500 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-500',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Today's OHLC 2×2 그리드 (정적) */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={pick(s.label, lang)} className="rounded-2xl bg-white p-3.5 shadow-sm">
              <p className="text-[11px] text-zinc-400">{pick(s.label, lang)}</p>
              <p className="mt-0.5 text-[14px] font-bold tabular-nums text-zinc-900">
                {money(s.value, cur)}
                <span className="text-[10px] font-medium text-zinc-400">{pick(STR.perGram, lang)}</span>
              </p>
            </div>
          ))}
        </div>

        {/* About Gold Pricing */}
        <div className="mt-3 rounded-2xl bg-zinc-100/80 p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-700">
            <Info className="h-4 w-4 text-orange-500" />
            {pick(STR.aboutTitle, lang)}
          </p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">
            {pick(STR.aboutBody, lang)}
          </p>
          <div className="mt-3 rounded-xl bg-white px-3.5 py-2.5">
            <p className="text-[11px] text-zinc-400">{pick(STR.conversionRate, lang)}</p>
            <p className="mt-0.5 text-[14px] font-bold text-orange-500">
              1,000 GOLD = {money(1000 * cur.perGold, cur)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
