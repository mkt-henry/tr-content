# 견적 비교 + AI 패널 최적화 데모 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ARIA에 "견적 비교 + AI 패널 최적화" 데모(국내 재산 Cat XoL 트리티 배치)를 추가한다.

**Architecture:** 기존 ARIA 데모 패턴을 그대로 따른다 — `src/demos/aria/panel-optimizer/` 폴더에 `data/state/scenario/widgets/Desktop/Mobile/index` 7파일. 결과는 `data.ts`에 사전 계산, zustand 스토어가 phase/constraint를 들고 시나리오가 액션을 호출, 컴포넌트가 렌더. glob 자동 등록(`registry/index.ts`)으로 갤러리에 등장. `data-demo-id`에 시나리오 `zoom:true`로 핵심 순간 줌인.

**Tech Stack:** React 18, zustand, framer-motion, Tailwind v4, lucide-react. 테스트 프레임워크 없음 → `npx tsc --noEmit` + dev 서버(5173) 수동 확인.

---

## File Structure

전부 신규, `src/demos/aria/panel-optimizer/` 아래:
- `data.ts` — 타입(Quote/Panel), PLACEMENT/QUOTES/BASE_PANEL/TIGHT_PANEL, STR(ko/en).
- `state.ts` — zustand 스토어(phase, constraint, scannedQuotes, 액션, reset).
- `scenario.ts` — v1/v2 시나리오.
- `widgets.tsx` — QuoteTable, PanelAllocation, SummaryMetrics, RationaleList.
- `Desktop.tsx` — 데스크탑 레이아웃.
- `Mobile.tsx` — 모바일(세로) 레이아웃.
- `index.ts` — FeatureDefinition default export(2 variants).

공통 검증: 각 태스크 후 `npx tsc --noEmit` (exit 0). dev 서버는 이미 5173에서 실행 중.

---

### Task 1: data.ts — 타입·데이터·문자열

**Files:** Create `src/demos/aria/panel-optimizer/data.ts`

- [ ] **Step 1: 파일 작성**

```ts
import type { L } from '../_shared/i18n';

/** 견적 1건 */
export interface Quote {
  id: string;
  /** 재보험사명 (고유명사 — 번역 안 함) */
  name: string;
  /** 신용등급 표기 (S&P) */
  rating: string;
  /** 등급 정렬/임계용 수치 (AA−=7, A+=6, A=5, A−=4) */
  ratingTier: number;
  /** 제공 라인 % */
  offered: number;
  /** 견적 ROL % */
  rol: number;
  /** 핵심 조건 요약 */
  terms: L;
  /** false = 비동시(워딩 정합성 플래그) */
  concurrent: boolean;
  /** 플래그 사유 (비동시 등) — 있으면 정규화 후 경고 표시 */
  flag?: L;
}

/** 패널 1라인 (서명 라인 배분) */
export interface PanelLine {
  quoteId: string;
  /** 서명 라인 % */
  line: number;
}

/** 최적화 결과 패널 */
export interface Panel {
  /** 합 100 */
  lines: PanelLine[];
  /** 블렌디드 ROL % */
  blendedRol: number;
  /** 가중평균등급 표기 */
  avgRating: string;
  /** 총보험료 (억원) */
  premiumEok: number;
  /** 만기 대비 절감 (억원) */
  savingEok: number;
  /** 절감률 % */
  savingPct: number;
  /** 적용 제약 라벨 */
  constraintLabel: L;
  /** 근거 불릿 */
  rationale: L[];
}

/** 배치 헤더 */
export const PLACEMENT = {
  treaty: { ko: 'ABC손해보험 재산 Cat XoL — Layer 2', en: 'ABC P&C — Property Cat XoL, Layer 2' } as L,
  cover: { ko: '₩300억 xs ₩200억', en: 'KRW 30bn xs 20bn' } as L,
  /** 만기 요율 % */
  expiringRol: 18.0,
  /** 커버 한도 (억원) — 보험료 = ROL% × limitEok */
  limitEok: 300,
};

/** 최소 적격 등급 (A−) */
export const MIN_RATING: { label: L; tier: number } = {
  label: { ko: '최소등급 A−', en: 'Min rating A−' },
  tier: 4,
};

export const QUOTES: Quote[] = [
  { id: 'munich', name: 'Munich Re', rating: 'AA−', ratingTier: 7, offered: 35, rol: 17.2,
    terms: { ko: '1 부활 @100%, 표준', en: '1 reinstatement @100%, standard' }, concurrent: true },
  { id: 'swiss', name: 'Swiss Re', rating: 'AA−', ratingTier: 7, offered: 30, rol: 17.5,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'scor', name: 'SCOR', rating: 'A+', ratingTier: 6, offered: 25, rol: 16.8,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'hannover', name: 'Hannover Re', rating: 'AA−', ratingTier: 7, offered: 20, rol: 17.8,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'koreanre', name: 'Korean Re', rating: 'A', ratingTier: 5, offered: 25, rol: 16.5,
    terms: { ko: '표준', en: 'Standard' }, concurrent: true },
  { id: 'lloyds', name: "Lloyd's Synd 2001", rating: 'A', ratingTier: 5, offered: 15, rol: 19.5,
    terms: { ko: '비동시 · 사이버 면책', en: 'Non-concurrent · cyber exclusion' }, concurrent: false,
    flag: { ko: '비동시 조건(사이버 면책) — 정합성 미달', en: 'Non-concurrent (cyber exclusion) — fails alignment' } },
];

/** v1 — 1사 최대 25% */
export const BASE_PANEL: Panel = {
  lines: [
    { quoteId: 'koreanre', line: 25 },
    { quoteId: 'scor', line: 25 },
    { quoteId: 'munich', line: 25 },
    { quoteId: 'swiss', line: 25 },
  ],
  blendedRol: 17.0,
  avgRating: 'A+',
  premiumEok: 51,
  savingEok: 3,
  savingPct: 5.6,
  constraintLabel: { ko: '1사 최대 25%', en: 'Max 25% per reinsurer' },
  rationale: [
    { ko: "Lloyd's 제외 — ROL 최고(19.5%) + 비동시(사이버 면책)로 워딩 정합성 미달",
      en: "Lloyd's excluded — highest ROL (19.5%) + non-concurrent (cyber exclusion)" },
    { ko: 'Munich Re 35%→25% 캡 — 1사 집중 한도 적용해 분산',
      en: 'Munich Re capped 35%→25% — single-reinsurer limit for diversification' },
    { ko: 'Korean Re·SCOR 우선 — 최저 ROL(16.5/16.8%) + 적격 등급',
      en: 'Korean Re & SCOR first — lowest ROL (16.5/16.8%), eligible rating' },
    { ko: '결과 — 블렌디드 17.0%, 만기 −1.0pt, 보험료 5.6% 절감, 평균등급 A+',
      en: 'Result — blended 17.0%, −1.0pt vs expiring, 5.6% premium saving, avg A+' },
  ],
};

/** v2 — 1사 최대 20% (분산 강화) */
export const TIGHT_PANEL: Panel = {
  lines: [
    { quoteId: 'koreanre', line: 20 },
    { quoteId: 'scor', line: 20 },
    { quoteId: 'munich', line: 20 },
    { quoteId: 'swiss', line: 20 },
    { quoteId: 'hannover', line: 20 },
  ],
  blendedRol: 17.16,
  avgRating: 'A+',
  premiumEok: 51.5,
  savingEok: 2.5,
  savingPct: 4.6,
  constraintLabel: { ko: '1사 최대 20%', en: 'Max 20% per reinsurer' },
  rationale: [
    { ko: '1사 한도 25%→20%로 강화 — Hannover Re 추가해 5사로 분산',
      en: 'Single-line limit tightened 25%→20% — Hannover Re added, 5-way spread' },
    { ko: '트레이드오프 — 블렌디드 17.16% (+0.16pt) 대신 집중도↓·안정성↑',
      en: 'Trade-off — blended 17.16% (+0.16pt) for lower concentration, higher resilience' },
    { ko: 'Lloyd\'s 여전히 제외 — 비동시 조건 유지',
      en: "Lloyd's still excluded — non-concurrent terms remain" },
  ],
};

export const STR = {
  brand: { ko: 'Panel Optimizer', en: 'Panel Optimizer' } as L,
  required: { ko: '필요 capacity', en: 'Required capacity' } as L,
  expiring: { ko: '만기 요율', en: 'Expiring ROL' } as L,
  quotesHeader: { ko: '재보험사 견적', en: 'Reinsurer quotes' } as L,
  colReinsurer: { ko: '재보험사', en: 'Reinsurer' } as L,
  colRating: { ko: '등급', en: 'Rating' } as L,
  colOffered: { ko: '제공 라인', en: 'Offered' } as L,
  colRol: { ko: 'ROL', en: 'ROL' } as L,
  colTerms: { ko: '조건', en: 'Terms' } as L,
  normalizeBtn: { ko: '견적 정규화', en: 'Normalize quotes' } as L,
  normalizing: { ko: '정규화 중…', en: 'Normalizing…' } as L,
  normalized: { ko: '정규화 완료', en: 'Normalized' } as L,
  optimizeBtn: { ko: 'AI 최적 패널 생성', en: 'Build optimal panel' } as L,
  optimizing: { ko: '최적화 중…', en: 'Optimizing…' } as L,
  optimized: { ko: '최적 패널', en: 'Optimal panel' } as L,
  tightenBtn: { ko: '1사 한도 20%로 강화', en: 'Tighten to 20% max' } as L,
  panelHeader: { ko: 'AI 최적 인수 패널', en: 'AI optimal panel' } as L,
  blendedRol: { ko: '블렌디드 ROL', en: 'Blended ROL' } as L,
  avgRating: { ko: '가중평균등급', en: 'Weighted avg rating' } as L,
  premium: { ko: '총보험료', en: 'Total premium' } as L,
  saving: { ko: '만기 대비 절감', en: 'Saving vs expiring' } as L,
  rationaleHeader: { ko: '구성 근거', en: 'Rationale' } as L,
  excluded: { ko: '제외', en: 'Excluded' } as L,
  capped: { ko: '한도 캡', en: 'Capped' } as L,
  signed: { ko: '서명 라인', en: 'Signed line' } as L,
};
```

- [ ] **Step 2: 타입 확인** — Run: `npx tsc --noEmit` → Expected: 에러 없음.
- [ ] **Step 3: 커밋**
```bash
git add src/demos/aria/panel-optimizer/data.ts
git commit -m "feat(aria): panel-optimizer 데이터·타입·문자열"
```

---

### Task 2: state.ts — zustand 스토어

**Files:** Create `src/demos/aria/panel-optimizer/state.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { create } from 'zustand';
import { BASE_PANEL, QUOTES, TIGHT_PANEL, type Panel } from './data';

export type Phase = 'raw' | 'normalizing' | 'normalized' | 'optimizing' | 'optimized';
export type Constraint = 'base' | 'tight';

interface PanelState {
  phase: Phase;
  constraint: Constraint;
  /** 정규화 스캔 완료 견적 수 (하이라이트 진행) */
  scannedQuotes: number;
  /** raw → normalizing(순차 스캔) → normalized */
  normalize: () => void;
  /** normalized → optimizing → optimized (현재 제약 패널 표시) */
  optimize: () => void;
  /** optimized(base) → 제약 tight → 재최적화 */
  tighten: () => void;
  /** 현재 제약에 맞는 결과 패널 (optimized일 때만 의미) */
  currentPanel: () => Panel;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let runId = 0;

export const usePanelOptimizer = create<PanelState>((set, get) => ({
  phase: 'raw',
  constraint: 'base',
  scannedQuotes: 0,

  normalize: () => {
    if (get().phase !== 'raw') return;
    const id = ++runId;
    set({ phase: 'normalizing', scannedQuotes: 0 });
    void (async () => {
      for (let i = 1; i <= QUOTES.length; i++) {
        await sleep(420);
        if (id !== runId) return;
        set({ scannedQuotes: i });
      }
      await sleep(450);
      if (id !== runId) return;
      set({ phase: 'normalized' });
    })();
  },

  optimize: () => {
    if (get().phase !== 'normalized') return;
    const id = ++runId;
    set({ phase: 'optimizing' });
    void (async () => {
      await sleep(900);
      if (id !== runId) return;
      set({ phase: 'optimized' });
    })();
  },

  tighten: () => {
    if (get().phase !== 'optimized' || get().constraint !== 'base') return;
    const id = ++runId;
    set({ phase: 'optimizing', constraint: 'tight' });
    void (async () => {
      await sleep(900);
      if (id !== runId) return;
      set({ phase: 'optimized' });
    })();
  },

  currentPanel: () => (get().constraint === 'tight' ? TIGHT_PANEL : BASE_PANEL),

  reset: () => {
    runId++;
    set({ phase: 'raw', constraint: 'base', scannedQuotes: 0 });
  },
}));
```

- [ ] **Step 2: 타입 확인** — Run: `npx tsc --noEmit` → Expected: 에러 없음.
- [ ] **Step 3: 커밋**
```bash
git add src/demos/aria/panel-optimizer/state.ts
git commit -m "feat(aria): panel-optimizer 스토어"
```

---

### Task 3: scenario.ts — v1/v2 시나리오

**Files:** Create `src/demos/aria/panel-optimizer/scenario.ts`

- [ ] **Step 1: 파일 작성**

```ts
import type { Scenario } from '../../../engine/types';
import { usePanelOptimizer } from './state';

const st = () => usePanelOptimizer.getState();

/** v1 — 견적 정규화 → 최적 패널 + 근거 */
export const normalizeOptimizeScenario: Scenario = {
  id: 'panel-base',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'normalize-run', run: () => st().normalize() },
    { kind: 'wait', ms: 3200 },
    // 비적격 견적(Lloyd's) 강조
    { kind: 'cursor', target: 'quote-lloyds', ms: 700, zoom: true },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'optimize-run', run: () => st().optimize(), zoom: true },
    { kind: 'wait', ms: 1300 },
    // 최적 패널 결과 강조
    { kind: 'cursor', target: 'panel-result', ms: 700, zoom: true },
    { kind: 'wait', ms: 2400 },
  ],
};

/** v2 — 제약 강화(1사 20%) → 재최적화 */
export const reoptimizeScenario: Scenario = {
  id: 'panel-tighten',
  steps: [
    { kind: 'wait', ms: 1000 },
    { kind: 'click', target: 'normalize-run', run: () => st().normalize() },
    { kind: 'wait', ms: 3200 },
    { kind: 'click', target: 'optimize-run', run: () => st().optimize(), zoom: true },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'panel-result', ms: 700, zoom: true },
    { kind: 'wait', ms: 2000 },
    // 제약 강화 → 재최적화
    { kind: 'click', target: 'constraint-tighten', run: () => st().tighten(), zoom: true },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'panel-result', ms: 700, zoom: true },
    { kind: 'wait', ms: 2400 },
  ],
};
```

- [ ] **Step 2: 타입 확인** — Run: `npx tsc --noEmit` → Expected: 에러 없음 (scenario는 아직 어디서도 import 안 되지만 파일 자체는 타입 통과).
- [ ] **Step 3: 커밋**
```bash
git add src/demos/aria/panel-optimizer/scenario.ts
git commit -m "feat(aria): panel-optimizer 시나리오(v1/v2)"
```

---

### Task 4: widgets.tsx — 표·패널·메트릭·근거

**Files:** Create `src/demos/aria/panel-optimizer/widgets.tsx`

- [ ] **Step 1: 파일 작성**

```tsx
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { MIN_RATING, PLACEMENT, QUOTES, STR, type Quote } from './data';
import { usePanelOptimizer } from './state';

/** 등급 칩 색 — 적격(A− 이상)/미달 구분은 안 하고 톤만 */
function RatingChip({ rating }: { rating: string }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
      {rating}
    </span>
  );
}

/** 견적 1행 — 정규화 진행에 따라 스캔 하이라이트, 완료 후 플래그/제외/캡 배지 */
function QuoteRow({ quote, idx }: { quote: Quote; idx: number }) {
  const lang = useLang();
  const { phase, scannedQuotes, currentPanel } = usePanelOptimizer();
  const scanned = scannedQuotes > idx || phase === 'normalized' || phase === 'optimizing' || phase === 'optimized';
  const optimized = phase === 'optimized';
  const panelLine = optimized ? currentPanel().lines.find((l) => l.quoteId === quote.id) : undefined;
  const excluded = optimized && !panelLine;
  const capped = !!panelLine && panelLine.line < quote.offered;

  return (
    <tr
      data-demo-id={quote.id === 'lloyds' ? 'quote-lloyds' : undefined}
      className={cn(
        'border-b border-white/[0.05] transition-colors',
        scanned ? 'opacity-100' : 'opacity-40',
        excluded && 'bg-rose-500/[0.05]',
        panelLine && 'bg-emerald-500/[0.05]',
      )}
    >
      <td className="px-3 py-2.5 text-[13px] font-medium text-zinc-100">{quote.name}</td>
      <td className="px-3 py-2.5"><RatingChip rating={quote.rating} /></td>
      <td className="px-3 py-2.5 text-right font-mono text-[13px] text-zinc-300">{quote.offered}%</td>
      <td className="px-3 py-2.5 text-right font-mono text-[13px] font-semibold text-zinc-100">{quote.rol.toFixed(1)}%</td>
      <td className="px-3 py-2.5 text-[11.5px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span>{pick(quote.terms, lang)}</span>
          {scanned && quote.flag && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
        </div>
      </td>
      <td className="px-3 py-2.5 text-right">
        {optimized && panelLine && (
          <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-emerald-300">
            {panelLine.line}%{capped && <span className="ml-1 text-[10px] font-normal text-amber-300">{pick(STR.capped, lang)}</span>}
          </span>
        )}
        {excluded && (
          <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-medium text-rose-300">
            {pick(STR.excluded, lang)}
          </span>
        )}
      </td>
    </tr>
  );
}

/** 견적 비교표 */
export function QuoteTable() {
  const lang = useLang();
  return (
    <div className="overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-left text-[10.5px] uppercase tracking-wider text-zinc-500">
            <th className="px-3 py-2 font-medium">{pick(STR.colReinsurer, lang)}</th>
            <th className="px-3 py-2 font-medium">{pick(STR.colRating, lang)}</th>
            <th className="px-3 py-2 text-right font-medium">{pick(STR.colOffered, lang)}</th>
            <th className="px-3 py-2 text-right font-medium">{pick(STR.colRol, lang)}</th>
            <th className="px-3 py-2 font-medium">{pick(STR.colTerms, lang)}</th>
            <th className="px-3 py-2 text-right font-medium">{pick(STR.signed, lang)}</th>
          </tr>
        </thead>
        <tbody>
          {QUOTES.map((q, i) => <QuoteRow key={q.id} quote={q} idx={i} />)}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[10.5px] text-zinc-600">{pick(MIN_RATING.label, lang)} · {pick(STR.expiring, lang)} {PLACEMENT.expiringRol.toFixed(1)}%</p>
    </div>
  );
}

/** 100% 스택 배분 바 + 라인 리스트 */
export function PanelAllocation() {
  const lang = useLang();
  const { phase, currentPanel } = usePanelOptimizer();
  if (phase !== 'optimized') return null;
  const panel = currentPanel();
  const colors = ['#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
  const nameOf = (id: string) => QUOTES.find((q) => q.id === id)?.name ?? id;

  return (
    <motion.div
      data-demo-id="panel-result"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-3.5"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-teal-300">
        <CheckCircle2 className="h-4 w-4" /> {pick(STR.panelHeader, lang)}
        <span className="ml-auto rounded-md bg-white/[0.06] px-2 py-0.5 text-[10.5px] font-normal text-zinc-400">
          {pick(panel.constraintLabel, lang)}
        </span>
      </div>
      {/* 스택 바 */}
      <div className="flex h-7 w-full overflow-hidden rounded-lg">
        {panel.lines.map((l, i) => (
          <motion.div
            key={l.quoteId}
            initial={{ width: 0 }}
            animate={{ width: `${l.line}%` }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center text-[10px] font-semibold text-black/70"
            style={{ background: colors[i % colors.length] }}
          >
            {l.line}%
          </motion.div>
        ))}
      </div>
      {/* 라인 리스트 */}
      <div className="mt-2.5 grid grid-cols-1 gap-1">
        {panel.lines.map((l, i) => (
          <div key={l.quoteId} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
            <span className="text-zinc-200">{nameOf(l.quoteId)}</span>
            <span className="ml-auto font-mono font-semibold text-zinc-100">{l.line}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** 요약 메트릭 */
export function SummaryMetrics() {
  const lang = useLang();
  const { phase, currentPanel } = usePanelOptimizer();
  if (phase !== 'optimized') return null;
  const p = currentPanel();
  const cell = (label: string, value: string, accent?: string) => (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <p className="text-[10.5px] text-zinc-500">{label}</p>
      <p className={cn('mt-0.5 font-mono text-[15px] font-semibold', accent ?? 'text-zinc-100')}>{value}</p>
    </div>
  );
  return (
    <div data-demo-id="summary-metrics" className="mt-2.5 grid grid-cols-2 gap-2">
      {cell(pick(STR.blendedRol, lang), `${p.blendedRol.toFixed(2)}%`)}
      {cell(pick(STR.avgRating, lang), p.avgRating)}
      {cell(pick(STR.premium, lang), `₩${p.premiumEok.toFixed(1)}억`)}
      {cell(pick(STR.saving, lang), `₩${p.savingEok.toFixed(1)}억 (${p.savingPct.toFixed(1)}%)`, 'text-emerald-400')}
    </div>
  );
}

/** 근거 불릿 */
export function RationaleList() {
  const lang = useLang();
  const { phase, currentPanel } = usePanelOptimizer();
  if (phase !== 'optimized') return null;
  const p = currentPanel();
  return (
    <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-zinc-300">
        <TrendingDown className="h-3.5 w-3.5 text-teal-400" /> {pick(STR.rationaleHeader, lang)}
      </div>
      <ul className="space-y-1.5">
        {p.rationale.map((r, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex gap-1.5 text-[12px] leading-snug text-zinc-400"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400" />
            {pick(r, lang)}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: 타입 확인** — Run: `npx tsc --noEmit` → Expected: 에러 없음.
- [ ] **Step 3: 커밋**
```bash
git add src/demos/aria/panel-optimizer/widgets.tsx
git commit -m "feat(aria): panel-optimizer 위젯(견적표·패널·메트릭·근거)"
```

---

### Task 5: Desktop.tsx

**Files:** Create `src/demos/aria/panel-optimizer/Desktop.tsx`

- [ ] **Step 1: 파일 작성**

```tsx
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { cn } from '../../../lib/cn';
import { pick, useLang } from '../_shared/i18n';
import { PLACEMENT, STR } from './data';
import { usePanelOptimizer } from './state';
import { PanelAllocation, QuoteTable, RationaleList, SummaryMetrics } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Desktop(_: DemoComponentProps) {
  const lang = useLang();
  const { phase, constraint, normalize, optimize, tighten } = usePanelOptimizer();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      {/* 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/90 text-white">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <AriaWordmark className="h-3.5" />
          <span className="text-[14px] font-semibold text-zinc-100">{pick(STR.brand, lang)}</span>
          <span className="text-[10px] font-normal text-zinc-500">by AlphaLenz</span>
        </div>
        {/* 액션 버튼 — phase에 따라 노출 */}
        <div className="ml-auto flex items-center gap-2">
          {phase === 'raw' && (
            <button
              data-demo-id="normalize-run"
              onClick={normalize}
              className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-sky-400"
            >
              <Sparkles className="h-3.5 w-3.5" /> {pick(STR.normalizeBtn, lang)}
            </button>
          )}
          {phase === 'normalizing' && (
            <span className="rounded-xl bg-sky-500/20 px-3.5 py-2 text-[12px] font-semibold text-sky-300">{pick(STR.normalizing, lang)}</span>
          )}
          {phase === 'normalized' && (
            <button
              data-demo-id="optimize-run"
              onClick={optimize}
              className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-3.5 py-2 text-[12px] font-semibold text-[#06211f] hover:bg-teal-400"
            >
              <Sparkles className="h-3.5 w-3.5" /> {pick(STR.optimizeBtn, lang)}
            </button>
          )}
          {phase === 'optimizing' && (
            <span className="rounded-xl bg-teal-500/20 px-3.5 py-2 text-[12px] font-semibold text-teal-300">{pick(STR.optimizing, lang)}</span>
          )}
          {phase === 'optimized' && constraint === 'base' && (
            <button
              data-demo-id="constraint-tighten"
              onClick={tighten}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-2 text-[12px] font-semibold text-zinc-200 hover:bg-white/[0.09]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> {pick(STR.tightenBtn, lang)}
            </button>
          )}
        </div>
      </header>

      {/* 배치 헤더 */}
      <div className="flex items-center gap-4 border-b border-white/[0.06] px-4 py-2.5">
        <div>
          <p className="text-[13px] font-semibold text-zinc-100">{pick(PLACEMENT.treaty, lang)}</p>
          <p className="text-[11px] text-zinc-500">{pick(PLACEMENT.cover, lang)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px]">
          <span className="rounded-md bg-white/[0.05] px-2 py-1 text-zinc-400">{pick(STR.required, lang)} <span className="font-mono font-semibold text-zinc-100">100%</span></span>
        </div>
      </div>

      {/* 본문: 견적표 + 결과 */}
      <div className="flex min-h-0 flex-1">
        <div className="demo-scroll min-w-0 flex-1 overflow-y-auto border-r border-white/[0.06] p-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{pick(STR.quotesHeader, lang)}</p>
          <QuoteTable />
        </div>
        <aside className={cn('demo-scroll w-[340px] shrink-0 overflow-y-auto bg-[#0b0c14] p-3.5', phase !== 'optimized' && 'flex items-center justify-center')}>
          {phase === 'optimized' ? (
            <div className="w-full">
              <PanelAllocation />
              <SummaryMetrics />
              <RationaleList />
            </div>
          ) : (
            <p className="text-center text-[12px] text-zinc-600">{pick(STR.panelHeader, lang)}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 확인** — Run: `npx tsc --noEmit` → Expected: 에러 없음.
- [ ] **Step 3: 커밋**
```bash
git add src/demos/aria/panel-optimizer/Desktop.tsx
git commit -m "feat(aria): panel-optimizer 데스크탑 레이아웃"
```

---

### Task 6: Mobile.tsx

**Files:** Create `src/demos/aria/panel-optimizer/Mobile.tsx`

- [ ] **Step 1: 파일 작성**

```tsx
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { pick, useLang } from '../_shared/i18n';
import { PLACEMENT, STR } from './data';
import { usePanelOptimizer } from './state';
import { PanelAllocation, QuoteTable, RationaleList, SummaryMetrics } from './widgets';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Mobile(_: DemoComponentProps) {
  const lang = useLang();
  const { phase, constraint, normalize, optimize, tighten } = usePanelOptimizer();

  return (
    <div className="flex h-full flex-col bg-[#0a0b12] text-zinc-200">
      <header className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-sky-500/90 text-white">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </div>
        <AriaWordmark className="h-3" />
        <span className="text-[12px] font-semibold text-zinc-100">{pick(STR.brand, lang)}</span>
      </header>

      <div className="border-b border-white/[0.06] px-3 py-2">
        <p className="text-[12.5px] font-semibold text-zinc-100">{pick(PLACEMENT.treaty, lang)}</p>
        <p className="text-[10.5px] text-zinc-500">{pick(PLACEMENT.cover, lang)} · {pick(STR.required, lang)} 100%</p>
      </div>

      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-3">
        <QuoteTable />
        <div className="mt-3">
          <PanelAllocation />
          <SummaryMetrics />
          <RationaleList />
        </div>
      </div>

      {/* 하단 액션 */}
      <div className="border-t border-white/[0.06] p-3">
        {phase === 'raw' && (
          <button data-demo-id="normalize-run" onClick={normalize} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2.5 text-[13px] font-semibold text-white">
            <Sparkles className="h-4 w-4" /> {pick(STR.normalizeBtn, lang)}
          </button>
        )}
        {phase === 'normalizing' && <p className="py-2.5 text-center text-[13px] font-semibold text-sky-300">{pick(STR.normalizing, lang)}</p>}
        {phase === 'normalized' && (
          <button data-demo-id="optimize-run" onClick={optimize} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-500 py-2.5 text-[13px] font-semibold text-[#06211f]">
            <Sparkles className="h-4 w-4" /> {pick(STR.optimizeBtn, lang)}
          </button>
        )}
        {phase === 'optimizing' && <p className="py-2.5 text-center text-[13px] font-semibold text-teal-300">{pick(STR.optimizing, lang)}</p>}
        {phase === 'optimized' && constraint === 'base' && (
          <button data-demo-id="constraint-tighten" onClick={tighten} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-[13px] font-semibold text-zinc-200">
            <SlidersHorizontal className="h-4 w-4" /> {pick(STR.tightenBtn, lang)}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 확인** — Run: `npx tsc --noEmit` → Expected: 에러 없음.
- [ ] **Step 3: 커밋**
```bash
git add src/demos/aria/panel-optimizer/Mobile.tsx
git commit -m "feat(aria): panel-optimizer 모바일 레이아웃"
```

---

### Task 7: index.ts — FeatureDefinition (등록)

**Files:** Create `src/demos/aria/panel-optimizer/index.ts`

- [ ] **Step 1: 파일 작성**

```ts
import { SlidersHorizontal } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { usePanelOptimizer } from './state';
import { normalizeOptimizeScenario, reoptimizeScenario } from './scenario';

const panelOptimizer: FeatureDefinition = {
  id: 'panel-optimizer',
  title: '견적 비교 + AI 패널 최적화',
  description: '여러 재보험사 견적을 정규화·비교하고, 제약(등급·한도·분산)을 지켜 100% 라인을 자동 최적 배분한 인수 패널을 근거와 함께 제시합니다.',
  icon: SlidersHorizontal,
  accent: '#0ea5e9',
  Desktop,
  Mobile,
  resetState: () => usePanelOptimizer.getState().reset(),
  variants: [
    {
      id: 'optimal-panel',
      label: '정규화 → 최적 패널',
      version: 'v1',
      sellingPoint: '패널 최적화',
      url: 'insightre.ai/placement',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(14,165,233,0.22), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(13,110,160,0.30), transparent 60%), linear-gradient(160deg, #0a0d16 0%, #06080e 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-sky-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-cyan-900/25 blur-[120px]',
        ],
      },
      scenario: normalizeOptimizeScenario,
    },
    {
      id: 'reoptimize',
      label: '제약 강화 → 재최적화',
      version: 'v2',
      sellingPoint: 'what-if 대응',
      url: 'insightre.ai/placement',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(13,148,180,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(20,80,120,0.30), transparent 60%), linear-gradient(165deg, #0a0d15 0%, #06080d 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-600/10 blur-[140px]'],
      },
      scenario: reoptimizeScenario,
    },
  ],
};

export default panelOptimizer;
```

- [ ] **Step 2: 타입 확인 + 빌드** — Run: `npx tsc --noEmit` → Expected: 에러 없음.
- [ ] **Step 3: 커밋**
```bash
git add src/demos/aria/panel-optimizer/index.ts
git commit -m "feat(aria): panel-optimizer 등록(FeatureDefinition)"
```

---

### Task 8: 통합 검증

**Files:** 없음 (검증만).

- [ ] **Step 1: 빌드** — Run: `npm run build` → Expected: tsc + Vite 빌드 성공.
- [ ] **Step 2: dev 수동 확인** (http://localhost:5173):
  1. ARIA 갤러리에 "견적 비교 + AI 패널 최적화" 카드 등장.
  2. v1 재생: 견적표 표시 → "견적 정규화"(순차 스캔 + Lloyd's 경고 삼각형, 줌인) → "AI 최적 패널 생성"(줌인) → 우측 패널(라인 합 100%: Korean/SCOR/Munich/Swiss 각 25%, Munich "한도 캡", Lloyd's "제외") → 메트릭(블렌디드 17.00%, 보험료 ₩51.0억, 절감 ₩3.0억 5.6%) + 근거 4줄, panel-result 줌인.
  3. v2 재생: 최적 패널 후 "1사 한도 20%로 강화" → 5사 20% 재배분(블렌디드 17.16%, Hannover 추가).
  4. 컨트롤바 언어 ko↔en 전환, 데스크탑/모바일(D) 모두 정상.
  5. 리셋(R) → raw로 복귀.

---

## Self-Review

**Spec coverage:**
- 소재 데이터(PLACEMENT/QUOTES/제약) → Task 1.
- BASE/TIGHT 패널 사전계산 → Task 1.
- phases·액션(normalize/optimize/tighten/reset) → Task 2.
- v1/v2 시나리오 + zoom 핵심 강조 → Task 3.
- 견적표·정규화 플래그·패널 배분·메트릭·근거 → Task 4.
- 데스크탑/모바일 레이아웃 + data-demo-id → Task 5/6.
- 등록(2 variants, 배경, 아이콘, accent) → Task 7.
- ko/en, 갤러리 등장, 빌드 → Task 8.

**Placeholder scan:** 모든 코드 스텝에 완전한 코드. TODO/TBD 없음.

**Type consistency:**
- 스토어명 `usePanelOptimizer`, 액션 `normalize/optimize/tighten/reset/currentPanel` — Task 2 정의와 Task 3/4/5/6/7 사용 일치.
- `currentPanel()`는 Task 2에서 메서드로 정의, Task 4에서 `currentPanel()` 호출로 사용 — 일치.
- `STR`/`PLACEMENT`/`QUOTES`/`MIN_RATING`/`BASE_PANEL`/`TIGHT_PANEL` (Task 1) ↔ Task 4/5/6/7 import 명칭 일치.
- data-demo-id `normalize-run`/`optimize-run`/`constraint-tighten`/`quote-lloyds`/`panel-result`/`summary-metrics` — Task 3 시나리오 ↔ Task 4/5/6 렌더 일치.
- `DemoComponentProps`/`FeatureDefinition`/`Scenario` import 경로(`../../../registry/types`, `../../../engine/types`) — 기존 데모와 동일.
