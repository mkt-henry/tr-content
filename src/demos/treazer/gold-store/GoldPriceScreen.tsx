import { useMemo } from 'react';
import { ArrowLeft, ArrowUpRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { Coin } from '../_shared/ui';
import { pick, useLang } from '../_shared/i18n';
import {
  CURRENCY,
  PERIODS,
  STR,
  makeSeries,
  money,
  type Candle,
} from './data';
import { useGoldStore, valuation } from './state';

/** 정규화(0~1) series를 폰 폭에 맞춰 그리는 라인(area) 차트 */
function LineChartSvg({ series }: { series: Candle[] }) {
  const W = 320;
  const H = 150;
  const step = W / (series.length - 1);
  const y = (v: number) => H - v * H;
  const line = series.map((d, i) => `${i * step},${y(d.c)}`).join(' ');
  const area = `0,${H} ${line} ${W},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#goldArea)" />
      <polyline points={line} fill="none" stroke="#f97316" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

/** 정규화(0~1) series를 캔들로 그리는 차트 — 상승봉 emerald / 하락봉 red */
function CandleChartSvg({ series }: { series: Candle[] }) {
  const W = 320;
  const H = 150;
  const slot = W / series.length;
  const bw = slot * 0.55;
  const y = (v: number) => H - v * H;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full" preserveAspectRatio="none">
      {series.map((d, i) => {
        const cx = i * slot + slot / 2;
        const up = d.c >= d.o;
        const color = up ? '#10b981' : '#ef4444';
        const top = y(Math.max(d.o, d.c));
        const bot = y(Math.min(d.o, d.c));
        return (
          <g key={i}>
            <line x1={cx} y1={y(d.h)} x2={cx} y2={y(d.l)} stroke={color} strokeWidth={1} />
            <rect
              x={cx - bw / 2}
              y={top}
              width={bw}
              height={Math.max(1, bot - top)}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function GoldPriceScreen() {
  const { gold, goldPrice, avgCost, chartMode, period, closePrice, setChartMode, setPeriod } =
    useGoldStore();
  const lang = useLang();
  const cur = CURRENCY[lang];

  const v = valuation(gold, goldPrice, avgCost, cur);
  const series = useMemo(() => makeSeries(period), [period]);

  // 차트 등락(%) — 첫 시가 대비 마지막 종가
  const change = series.length
    ? (series[series.length - 1].c - series[0].o) / series[0].o
    : 0;

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
        <span className="text-[17px] font-bold text-zinc-900">{pick(STR.goldPrice, lang)}</span>
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
            key={Math.round(v.value * 100)}
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
            className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/12 px-3.5 py-2.5"
          >
            <span className="text-[11px] text-emerald-300/90">{pick(STR.sinceBought, lang)}</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              <motion.span
                key={Math.round(v.ret * 1000)}
                initial={{ y: 4, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[18px] font-bold tabular-nums"
              >
                +{(v.ret * 100).toFixed(1)}%
              </motion.span>
              <span className="text-[12px] font-semibold tabular-nums">
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
              <LineChartSvg series={series} />
            ) : (
              <CandleChartSvg series={series} />
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
              1 GOLD = {money(cur.perGold, cur)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
