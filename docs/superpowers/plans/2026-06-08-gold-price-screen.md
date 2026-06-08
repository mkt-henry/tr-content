# Gold Price 시세 화면 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `gold-store` 데모 v1에 전용 Gold Price 시세 화면을 추가해, 실시간 금 시세와 함께 "내가 모은 골드의 평가가치가 모은 시점보다 +12%대 올라가고 있다"를 평가손익 카드로 체감시킨다.

**Architecture:** 단일 데모 안에서 `view: 'store' | 'price'` 전환으로 2단 플로우 구성(라우팅 추가 없음). 평가손익은 보유 골드의 고정 그램 × 언어별 통화/g 시세(시세 ratio 연동)로 계산하고, 차트는 의존성 없는 인라인 SVG로 캔들/라인을 직접 그린다. 통화는 기존 `CURRENCY` 테이블에서 유도해 언어별 단일 기준으로 통일한다.

**Tech Stack:** React 18 + TypeScript, zustand, framer-motion, Tailwind v4, lucide-react. 차트는 인라인 SVG(라이브러리 미사용). 검증은 `npm run build`(tsc --noEmit) + 자동재생 시각 확인 — 이 프로젝트엔 테스트 러너가 없다(기존 데모 컨벤션 준수).

**검증 방식 안내:** 각 태스크는 (1) `npm run build`로 타입 통과를 확인하고, (2) 해당하는 경우 dev 서버에서 시각 확인한다. 단위 테스트는 작성하지 않는다 — 비주얼 데모 프로젝트이며 테스트 인프라가 없다.

---

### Task 1: data.ts — 평가/시세 모델, 차트 시계열, i18n 문자열

**Files:**
- Modify: `src/demos/treazer/gold-store/data.ts`

기존 `Currency`, `CURRENCY`, `GOLD_GRAMS_PER_UNIT`, `INITIAL_GOLD_PRICE`, `money()`, `STR`는 그대로 두고 아래를 **추가**한다.

- [ ] **Step 1: 평가 모델 상수 + spot 헬퍼 추가**

`data.ts` 맨 아래(파일 끝 `INITIAL_GOLD_PRICE` 선언 부근)에 추가:

```ts
/**
 * 평균 매입 시세 (추상 인덱스, INITIAL_GOLD_PRICE와 같은 축).
 * 현재 시세(152,400)보다 약 11% 낮게 잡아 "모은 시점 대비 +12.4%" 평가수익을 연출한다.
 * 수익률 = INITIAL_GOLD_PRICE / INITIAL_AVG_COST - 1 = 152400/135600 - 1 ≈ +12.4%
 */
export const INITIAL_AVG_COST = 135_600;

/**
 * 1 g당 통화 시세(ratio=1 기준) — 기존 cur.perGold에서 유도한다.
 * 1 GOLD = GOLD_GRAMS_PER_UNIT g, 1 GOLD ≈ cur.perGold 통화 이므로
 * 통화/g = perGold / GOLD_GRAMS_PER_UNIT. (별도 시세 테이블 없이 DRY하게 일관 유지)
 */
export function spotPerGram(c: Currency): number {
  return c.perGold / GOLD_GRAMS_PER_UNIT;
}
```

- [ ] **Step 2: 차트 타입 + 기간 정의 + 결정적 시계열 생성 추가**

`data.ts`에 추가:

```ts
/** 차트 한 봉의 시가/고가/저가/종가 — 정규화(0~1) 스케일 */
export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

export type Period = 'now' | '1m' | '5m' | '1y' | 'all';

/** 기간 토글 — 라벨은 실제 앱과 동일하게 영어 공통 */
export const PERIODS: { id: Period; label: string }[] = [
  { id: 'now', label: 'Now' },
  { id: '1m', label: '1M' },
  { id: '5m', label: '5M' },
  { id: '1y', label: '1Y' },
  { id: 'all', label: 'ALL' },
];

/** 결정적 의사난수(mulberry32) — 시드 고정으로 매 렌더마다 같은 차트를 보장(자동재생 안정성) */
function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 기간별 우상향 추세 + 노이즈의 정규화 OHLC 시계열.
 * 값은 0~1 스케일(차트 형태 전용); 실제 시세 라벨은 spotPerGram으로 별도 매핑한다.
 * 기간이 길수록 점 개수·변동폭·누적 상승폭이 커진다.
 */
export function makeSeries(period: Period): Candle[] {
  const cfg: Record<Period, { n: number; vol: number; drift: number; seed: number }> = {
    now: { n: 24, vol: 0.016, drift: 0.004, seed: 11 },
    '1m': { n: 30, vol: 0.02, drift: 0.006, seed: 22 },
    '5m': { n: 40, vol: 0.024, drift: 0.008, seed: 33 },
    '1y': { n: 48, vol: 0.03, drift: 0.011, seed: 44 },
    all: { n: 60, vol: 0.045, drift: 0.018, seed: 55 },
  };
  const { n, vol, drift, seed } = cfg[period];
  const rnd = mulberry32(seed);
  const out: Candle[] = [];
  let prev = 0.32; // 낮게 시작 → 전체 우상향
  for (let i = 0; i < n; i++) {
    const o = prev;
    const c = Math.min(0.97, Math.max(0.05, o + drift + (rnd() - 0.5) * vol * 2));
    const h = Math.min(1, Math.max(o, c) + rnd() * vol);
    const l = Math.max(0, Math.min(o, c) - rnd() * vol);
    out.push({ o, h, l, c });
    prev = c;
  }
  return out;
}
```

- [ ] **Step 3: Gold Price 화면 신규 i18n 문자열 추가**

기존 `STR` 객체(`} satisfies Record<string, L>;` 로 끝나는) 안에, `exchangedSavedLine2` 항목 뒤에 콤마로 이어서 추가:

```ts
  goldPrice: { en: 'Gold Price', ja: 'ゴールド価格', vi: 'Giá vàng', th: 'ราคาทอง' },
  myValuation: {
    en: 'My Gold Value',
    ja: '保有ゴールド評価額',
    vi: 'Giá trị vàng của tôi',
    th: 'มูลค่าทองของฉัน',
  },
  sinceBought: {
    en: 'Since you started collecting',
    ja: '貯め始めてから',
    vi: 'Kể từ khi bắt đầu tích lũy',
    th: 'นับตั้งแต่เริ่มสะสม',
  },
  perGram: { en: '/g', ja: '/g', vi: '/g', th: '/g' },
  todaysOpen: { en: "Today's Open", ja: '始値', vi: 'Giá mở cửa', th: 'ราคาเปิด' },
  todaysHigh: { en: "Today's High", ja: '高値', vi: 'Giá cao nhất', th: 'ราคาสูงสุด' },
  todaysLow: { en: "Today's Low", ja: '安値', vi: 'Giá thấp nhất', th: 'ราคาต่ำสุด' },
  todaysClose: { en: "Today's Close", ja: '終値', vi: 'Giá đóng cửa', th: 'ราคาปิด' },
  aboutTitle: {
    en: 'About Gold Pricing',
    ja: 'ゴールド価格について',
    vi: 'Về giá vàng',
    th: 'เกี่ยวกับราคาทอง',
  },
  aboutBody: {
    en: 'Your GOLD rewards are linked to international gold prices. As the gold market moves, the value of the GOLD you have collected moves with it.',
    ja: 'あなたのGOLDは国際的な金相場に連動します。相場が動けば、貯めてきたGOLDの価値も一緒に動きます。',
    vi: 'Phần thưởng GOLD của bạn được liên kết với giá vàng quốc tế. Khi thị trường vàng biến động, giá trị số GOLD bạn đã tích lũy cũng thay đổi theo.',
    th: 'รางวัล GOLD ของคุณเชื่อมโยงกับราคาทองสากล เมื่อตลาดทองเคลื่อนไหว มูลค่า GOLD ที่คุณสะสมไว้ก็เปลี่ยนตามไปด้วย',
  },
  conversionRate: {
    en: 'Current Conversion Rate',
    ja: '現在の換算レート',
    vi: 'Tỷ giá quy đổi hiện tại',
    th: 'อัตราแปลงปัจจุบัน',
  },
```

- [ ] **Step 4: 타입 통과 확인**

Run: `npm run build`
Expected: 타입 에러 없이 완료 (이 시점에 신규 export는 아직 사용처가 없어도 통과).

- [ ] **Step 5: Commit**

```bash
git add src/demos/treazer/gold-store/data.ts
git commit -m "feat(gold-store): 평가 모델·차트 시계열·Gold Price i18n 추가"
```

---

### Task 2: state.ts — view 전환, 평가 셀렉터, 차트 상태

**Files:**
- Modify: `src/demos/treazer/gold-store/state.ts`

- [ ] **Step 1: import에 신규 심볼 추가**

기존 import 블록을 아래로 교체:

```ts
import { create } from 'zustand';
import {
  GOLD_GRAMS_PER_UNIT,
  INITIAL_AVG_COST,
  INITIAL_GOLD,
  INITIAL_GOLD_PRICE,
  PRODUCTS,
  spotPerGram,
  type Currency,
  type Period,
  type StoreProduct,
} from './data';
```

- [ ] **Step 2: 평가 셀렉터 함수 추가**

`priceInGold` 함수 바로 아래에 추가:

```ts
/** 보유 골드의 평가 결과 — 통화별 환산값과 매입 대비 수익률/평가이익을 한 번에 계산 */
export interface Valuation {
  /** 보유 골드의 금 그램 */
  grams: number;
  /** 현재 통화/g 시세 (시세 ratio 반영) */
  spot: number;
  /** 현재 평가액 (통화) */
  value: number;
  /** 매입 대비 수익률 (0.124 = +12.4%) */
  ret: number;
  /** 평가이익 (통화) */
  profit: number;
}

export function valuation(
  gold: number,
  goldPrice: number,
  avgCost: number,
  c: Currency,
): Valuation {
  const grams = gold * GOLD_GRAMS_PER_UNIT;
  const ratio = goldPrice / INITIAL_GOLD_PRICE;
  const spot = spotPerGram(c) * ratio;
  const value = grams * spot;
  const ret = goldPrice / avgCost - 1;
  const cost = value / (1 + ret);
  const profit = value - cost;
  return { grams, spot, value, ret, profit };
}
```

- [ ] **Step 3: 스토어 인터페이스에 신규 필드/액션 추가**

`interface GoldStoreState` 안에 기존 필드들 뒤(`coupons: number;` 다음)에 추가:

```ts
  /** 현재 보고 있는 화면 */
  view: 'store' | 'price';
  /** 평균 매입 시세 (평가손익 기준) */
  avgCost: number;
  /** 차트 표시 모드 */
  chartMode: 'line' | 'candle';
  /** 선택된 차트 기간 */
  period: Period;
```

그리고 액션 선언부(`tickPrice: () => void;` 부근)에 추가:

```ts
  openPrice: () => void;
  closePrice: () => void;
  setChartMode: (m: 'line' | 'candle') => void;
  setPeriod: (p: Period) => void;
```

- [ ] **Step 4: 초기값과 액션 구현 추가**

`create<GoldStoreState>((set, get) => ({ ... }))` 안에서 기존 초기값 블록(`coupons: 0,` 다음)에 추가:

```ts
  view: 'store',
  avgCost: INITIAL_AVG_COST,
  chartMode: 'candle',
  period: '1m',
```

그리고 액션 구현부에 추가(예: `selectCategory` 위 또는 `tickPrice` 아래):

```ts
  openPrice: () => set({ view: 'price' }),
  closePrice: () => set({ view: 'store' }),
  setChartMode: (m) => set({ chartMode: m }),
  setPeriod: (p) => set({ period: p }),
```

- [ ] **Step 5: tickPrice 상승 편향 강화**

기존 `tickPrice` 내부의 drift 라인을 교체 — 상승 편향을 키워 데모 중 우상향이 더 또렷하게:

```ts
    // 상승 편향을 키운 미세 변동 — "내 자산이 오르고 있다"가 또렷하게 보이도록
    const drift = (Math.random() - 0.32) * 0.0016;
```

- [ ] **Step 6: reset에 신규 상태 포함**

기존 `reset`의 `set({ ... })`에 추가(기존 필드 유지하고 아래 4줄 더):

```ts
      view: 'store',
      avgCost: INITIAL_AVG_COST,
      chartMode: 'candle',
      period: '1m',
```

- [ ] **Step 7: 타입 통과 확인**

Run: `npm run build`
Expected: 타입 에러 없이 완료.

- [ ] **Step 8: Commit**

```bash
git add src/demos/treazer/gold-store/state.ts
git commit -m "feat(gold-store): view 전환·평가 셀렉터·차트 상태 추가"
```

---

### Task 3: GoldPriceScreen.tsx — 평가 카드 + SVG 차트 + 통계 + About

**Files:**
- Create: `src/demos/treazer/gold-store/GoldPriceScreen.tsx`

차트 형태 정규화 series는 `makeSeries(period)`로 받고, 시세/통계 라벨은 `valuation().spot` 기준으로 매핑한다. 파일 전체를 아래 내용으로 생성:

- [ ] **Step 1: 파일 생성**

```tsx
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
  spotPerGram,
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
```

- [ ] **Step 2: 타입 통과 확인**

Run: `npm run build`
Expected: 타입 에러 없이 완료(아직 어디서도 import 안 했지만 자체 타입은 통과).

- [ ] **Step 3: Commit**

```bash
git add src/demos/treazer/gold-store/GoldPriceScreen.tsx
git commit -m "feat(gold-store): Gold Price 화면 — 평가 카드·SVG 차트·통계·About"
```

---

### Task 4: screens.tsx — 카드 탭 진입 + view 분기 + 통화 통일

**Files:**
- Modify: `src/demos/treazer/gold-store/screens.tsx`

- [ ] **Step 1: import에 화면/심볼 추가**

상단 import에서 state import 줄을 교체하고 GoldPriceScreen import를 추가:

```tsx
import { priceInGold, useGoldStore, valuation } from './state';
import { GoldPriceScreen } from './GoldPriceScreen';
```

그리고 `data` import에 `spotPerGram`을 추가(기존 import 구문에 병합):

```tsx
import { CATEGORIES, CURRENCY, GOLD_GRAMS_PER_UNIT, STR, money, spotPerGram, type StoreProduct } from './data';
```

- [ ] **Step 2: PriceTicker 통화 통일 (₩ 하드코딩 제거)**

기존 `PriceTicker` 컴포넌트 본문을 교체 — 언어별 통화/g 시세를 표시:

```tsx
function PriceTicker() {
  const { goldPrice, trend, tick } = useGoldStore();
  const lang = useLang();
  const cur = CURRENCY[lang];
  const up = trend === 'up';
  const down = trend === 'down';
  const Arrow = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  const color = up ? 'text-emerald-400' : down ? 'text-red-400' : 'text-zinc-400';
  const spot = spotPerGram(cur) * (goldPrice / 152_400);

  return (
    <div data-demo-id="price-ticker" className="flex items-center gap-1.5">
      <span className="text-[10px] text-zinc-400">Gold</span>
      <motion.span
        key={tick}
        initial={{ y: down ? -6 : 6, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn('text-[12px] font-bold tabular-nums', color)}
      >
        {money(Math.round(spot), cur)}/g
      </motion.span>
      <Arrow className={cn('h-3.5 w-3.5', color)} strokeWidth={2.5} />
    </div>
  );
}
```

(이 파일 상단에 `useLang`이 이미 import되어 있다 — `import { fmt, pick, useLang } from '../_shared/i18n';` 확인. `152_400`은 `INITIAL_GOLD_PRICE`와 같은 값이지만, 정확성을 위해 `data`에서 import해 쓰는 것이 낫다 → 다음 스텝.)

- [ ] **Step 3: INITIAL_GOLD_PRICE import로 매직넘버 제거**

Step 1에서 수정한 `data` import에 `INITIAL_GOLD_PRICE`를 추가하고, Step 2의 `goldPrice / 152_400`을 `goldPrice / INITIAL_GOLD_PRICE`로 교체:

```tsx
import { CATEGORIES, CURRENCY, GOLD_GRAMS_PER_UNIT, INITIAL_GOLD_PRICE, STR, money, spotPerGram, type StoreProduct } from './data';
```

```tsx
  const spot = spotPerGram(cur) * (goldPrice / INITIAL_GOLD_PRICE);
```

- [ ] **Step 4: GoldCard를 탭 가능한 버튼으로 — Gold Price 진입**

기존 `GoldCard`의 `valuation`을 활용해 환산 라인을 시세 연동값으로 바꾸고, 카드를 탭하면 `openPrice()`. 컴포넌트 전체 교체:

```tsx
function GoldCard() {
  const { gold, goldFlash, goldPrice, avgCost, openPrice } = useGoldStore();
  const lang = useLang();
  const cur = CURRENCY[lang];
  const v = valuation(gold, goldPrice, avgCost, cur);

  return (
    <motion.button
      type="button"
      data-demo-id="gold-card"
      onClick={openPrice}
      animate={goldFlash ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      className="w-full rounded-2xl bg-zinc-900 p-4 text-left text-white"
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-300">{pick(STR.myGoldPoints, lang)}</span>
        <PriceTicker />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Coin className="h-6 w-6 text-[12px]" />
        <motion.span
          key={gold}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          className="text-[26px] font-bold tabular-nums"
        >
          {gold.toLocaleString('en-US')}
        </motion.span>
      </div>
      {/* 시세 연동 환산값 + 모은 시점 대비 수익률 미리보기 */}
      <p data-demo-id="gold-converted" className="mt-1 flex items-center gap-2 text-[12px] text-zinc-400">
        = {money(v.value, cur)}{' '}
        <span className="text-amber-400/90">({v.grams.toFixed(8)} g)</span>
        <span className="ml-auto flex items-center gap-0.5 font-semibold text-emerald-400">
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          +{(v.ret * 100).toFixed(1)}%
        </span>
      </p>
    </motion.button>
  );
}
```

(주의: `motion.button`으로 바뀌므로 `data-demo-id="gold-card"`가 버튼에 그대로 유지된다. 시나리오 cursor 타깃 호환.)

- [ ] **Step 5: AppScreens에 view 분기 추가**

파일 맨 아래 `AppScreens`를 교체:

```tsx
/** 화면 래퍼 — view에 따라 스토어/시세 화면 전환 */
export function AppScreens() {
  const view = useGoldStore((s) => s.view);
  return view === 'price' ? <GoldPriceScreen /> : <StoreScreen />;
}
```

- [ ] **Step 6: 타입 통과 + 시각 확인**

Run: `npm run build`
Expected: 타입 에러 없이 완료.

dev 서버에서 `tz-gold-store` 데모를 열어 스토어의 My Gold Points 카드를 클릭 → Gold Price 화면 진입, 평가 카드/차트/통계/About 표시, ← 로 복귀 확인. Line/Candle·기간 토글 동작 확인. 4개 언어 전환 시 통화/문자열 정상 확인.

- [ ] **Step 7: Commit**

```bash
git add src/demos/treazer/gold-store/screens.tsx
git commit -m "feat(gold-store): 카드 탭 → Gold Price 진입·view 분기·미니티커 통화 통일"
```

---

### Task 5: scenario.ts — v1 시나리오를 화면 진입 흐름으로 재구성

**Files:**
- Modify: `src/demos/treazer/gold-store/scenario.ts`

- [ ] **Step 1: realGoldScenario 교체**

기존 `realGoldScenario` 전체를 아래로 교체(주석 포함). `exchangeScenario`는 그대로 둔다:

```ts
/**
 * v1 — "포인트가 아니라 진짜 금": 스토어 골드 카드 → Gold Price 화면 진입.
 * 시세가 틱할 때마다 내 골드 평가액·수익률이 함께 오르는 걸 보여주고,
 * "모은 시점 대비 +X%" 평가손익을 클로즈업하며 마무리한다.
 */
export const realGoldScenario: Scenario = {
  id: 'gold-store-real-gold',
  steps: [
    { kind: 'wait', ms: 900 },
    // 스토어의 골드 카드로 시선 유도
    { kind: 'cursor', target: 'gold-card', ms: 700 },
    { kind: 'wait', ms: 600 },

    // 카드 탭 → Gold Price 화면 진입
    { kind: 'click', target: 'gold-card', run: () => st().openPrice() },
    { kind: 'wait', ms: 1100 },

    // 내 골드 평가 카드 강조
    { kind: 'cursor', target: 'my-valuation', ms: 800 },
    { kind: 'wait', ms: 700 },

    // 시세 틱 — 평가액·수익률이 함께 상승
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },

    // 차트로 시선 이동 + 기간 전환으로 우상향 추세 확인
    { kind: 'cursor', target: 'gold-chart', ms: 700 },
    { kind: 'click', target: 'period-1y', run: () => st().setPeriod('1y') },
    { kind: 'wait', ms: 1000 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },

    // 핵심: 모은 시점 대비 평가손익 클로즈업
    { kind: 'cursor', target: 'valuation-return', ms: 900 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 2400 },
  ],
};
```

- [ ] **Step 2: 타입 통과 + 자동재생 확인**

Run: `npm run build`
Expected: 타입 에러 없이 완료.

dev 서버에서 v1 variant("포인트가 아니라 진짜 금") 자동재생 → 카드 탭으로 화면 진입, 평가액/수익률 상승, 기간 전환, 평가손익 클로즈업까지 흐름 확인.

- [ ] **Step 3: Commit**

```bash
git add src/demos/treazer/gold-store/scenario.ts
git commit -m "feat(gold-store): v1 시나리오 — Gold Price 화면 진입·평가손익 클로즈업"
```

---

### Task 6: Desktop.tsx — 현재 시세 통화 통일 + 최종 빌드 검증

**Files:**
- Modify: `src/demos/treazer/gold-store/Desktop.tsx`

- [ ] **Step 1: import에 spotPerGram, INITIAL_GOLD_PRICE 추가**

기존 `import { CURRENCY, money } from './data';` 를 교체:

```tsx
import { CURRENCY, INITIAL_GOLD_PRICE, money, spotPerGram } from './data';
```

- [ ] **Step 2: 현재 시세 스탯의 ₩ 하드코딩 제거**

라이브 시세 스탯에서 `cur`로 spot 계산 후 표시. 컴포넌트 본문 상단의 `const cur = CURRENCY[lang];` 다음에 추가:

```tsx
  const spot = spotPerGram(cur) * (goldPrice / INITIAL_GOLD_PRICE);
```

그리고 `<p className="mt-1.5 flex items-center gap-1 text-[20px] ...">` 안의 시세 표기 줄을 교체:

```tsx
              {money(Math.round(spot), cur)}/g
              <Arrow className={`h-4 w-4 ${arrowColor}`} strokeWidth={2.5} />
```

(즉 기존 `₩{goldPrice.toLocaleString('en-US')}` 부분을 `{money(Math.round(spot), cur)}/g` 로 교체.)

- [ ] **Step 3: 최종 빌드 + 전체 시각 검증**

Run: `npm run build`
Expected: 타입 에러 없이 완료.

dev 서버 최종 확인:
- 데스크탑 좌측 패널 "현재 시세"가 언어별 통화로 표시.
- 4개 언어(en/ja/vi/th) 전환 시 스토어·Gold Price 화면의 모든 통화/문자열 정상.
- v1 자동재생 전체 흐름 정상, `reset` 후 스토어 화면으로 복귀(view='store').

- [ ] **Step 4: Commit**

```bash
git add src/demos/treazer/gold-store/Desktop.tsx
git commit -m "feat(gold-store): 데스크탑 현재 시세 통화 통일"
```

---

## 변경 파일 요약

| 파일 | 역할 |
|------|------|
| `data.ts` (수정) | `INITIAL_AVG_COST`, `spotPerGram`, 차트 타입/기간/`makeSeries`, Gold Price i18n 추가 |
| `state.ts` (수정) | `view`/`avgCost`/`chartMode`/`period`, `openPrice`/`closePrice`/`setChartMode`/`setPeriod`, `valuation()` 셀렉터, tickPrice 상승편향, reset 갱신 |
| `GoldPriceScreen.tsx` (신규) | 평가 카드 + SVG 라인/캔들 차트 + Today's OHLC + About/Conversion |
| `screens.tsx` (수정) | GoldCard 탭 → `openPrice`, AppScreens view 분기, 미니티커 통화 통일 |
| `scenario.ts` (수정) | v1 `realGoldScenario`를 화면 진입·평가손익 클로즈업 흐름으로 재구성 |
| `Desktop.tsx` (수정) | 좌측 패널 현재 시세 통화 통일 |
