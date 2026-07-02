# 멀티 에이전트 포커스 패널 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 알파렌즈 "멀티 에이전트 추론" 데모를 카메라 포커스 모델로 개선 — 좌측 그래프 모션을 고급화하고, 우측 확대 패널에 활성 에이전트의 thinking·tool call·중간 산출물·근거를 클로즈업한다.

**Architecture:** 좌측 `AgentGraph`(전체 협업 흐름 + 입자/리플/피사계 심도 모션) + 우측 `FocusPanel`(단계별로 클로즈업되는 에이전트의 4요소). 두 컴포넌트는 zustand `state.ts`의 `focus` 상태를 공유한다. 클로즈업 스크립트는 `data.ts`에 그룹당 대표 1개씩(5개) 고정 데이터로 둔다.

**Tech Stack:** React 18, TypeScript 5.7, framer-motion 11, zustand 5, Tailwind 4, lucide-react. 빌드/검증: `vite` + `tsc --noEmit`.

## Global Constraints

- **테스트 러너 없음.** 이 레포는 단위 테스트 인프라가 없다(`package.json`에 test 스크립트/vitest/jest 부재). 각 태스크 검증은 `npx tsc --noEmit`(타입 통과) + 최종 태스크의 dev 서버 시각 확인으로 한다. 가짜 테스트 파일을 만들지 않는다.
- **i18n 필수.** 사용자에게 보이는 모든 문자열은 `L<T> = Record<'ko'|'en', T>`로 작성하고 `pick(l, lang)`으로 렌더한다. `useLang()`으로 언어 구독. (`src/demos/alphalenz/_shared/i18n.ts`)
- **테마 토큰 고정.** 색은 `AL`(`_shared/theme.ts`)과 각 그룹 `color`(`data.ts`)만 사용. 팔레트 전면 개편 금지. 퍼플 액센트 `#a855f7`(ORCHESTRATOR_COLOR) / `AL.accent #7c5cff` 유지.
- **클래스 합성은 `cn`** (`src/lib/cn.ts`).
- **좌표계 규약 유지.** `AgentGraph`의 SVG는 `viewBox="0 0 100 100" preserveAspectRatio="none"`, 노드는 동일 % 좌표의 절대배치 div. 신규 모션도 이 0~100 정규화 좌표를 따른다.
- **커밋 메시지 꼬리말:** 모든 커밋 끝에 추가
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```

---

## 파일 구조

- `src/demos/alphalenz/multi-agent/data.ts` — **수정**. `FocusScript` 타입 + `FOCUS_SCRIPTS`(대표 5개) + `STAGE_FOCUS`(routing/verifying/synthesis 요약) + `groupById` 헬퍼 추가. 기존 GROUPS/로그/인사이트 유지.
- `src/demos/alphalenz/multi-agent/state.ts` — **수정**. `FocusTarget` 타입 + `focus` 상태 추가. working 루프를 "그룹 순회하며 대표 에이전트 클로즈업" 시퀀스로 재구성.
- `src/demos/alphalenz/multi-agent/FocusPanel.tsx` — **신규**. `focus`를 읽어 4요소(thinking 타이핑 / tool call / 미니 산출물 / 근거 체인) 또는 단계 요약을 렌더.
- `src/demos/alphalenz/multi-agent/AgentGraph.tsx` — **수정**. 엣지 입자(베지어 보간) + 노드 리플/호흡 글로우 + 피사계 심도(focus 노드 강조/나머지 디밍).
- `src/demos/alphalenz/multi-agent/Desktop.tsx` — **수정**. 레이아웃을 `좌 그래프(1fr) + 우 FocusPanel(440px)`로. 카운터/로그/인사이트를 패널로 흡수.
- `src/demos/alphalenz/multi-agent/Mobile.tsx` — **수정**. 그래프(compact) 아래 FocusPanel 세로 스택.
- `src/demos/alphalenz/multi-agent/scenario.ts` — **수정**. 늘어난 타임라인(≈13~14초)에 맞춰 `wait` 조정.

각 태스크는 `npx tsc --noEmit` 통과 + 커밋으로 끝난다(빌드 가능 상태 유지).

---

### Task 1: 데이터 모델 — FocusScript / FOCUS_SCRIPTS / STAGE_FOCUS

**Files:**
- Modify: `src/demos/alphalenz/multi-agent/data.ts`

**Interfaces:**
- Consumes: 기존 `L`(i18n), `GROUPS`, `WorkerGroup`.
- Produces:
  - `interface FocusScript { groupId: string; subIndex: number; thinking: L; tools: string[]; metric: { label: L; value: string; trend: 'up'|'down'|'flat' }; signal: L; spark: number[]; evidence: { sources: L[]; crossChecks: number } }`
  - `const FOCUS_SCRIPTS: FocusScript[]` — 5개(그룹당 1개).
  - `interface StageFocus { title: L; body: L }`
  - `const STAGE_FOCUS: Record<'routing'|'verifying'|'synthesis', StageFocus>`
  - `function groupById(id: string): WorkerGroup | undefined`

- [ ] **Step 1: `data.ts` 끝에 타입과 데이터 추가**

`src/demos/alphalenz/multi-agent/data.ts` 파일의 마지막(STR 정의 뒤)에 아래를 추가한다. 기존 내용은 건드리지 않는다.

```ts
/** id로 워커 그룹 조회 */
export function groupById(id: string): WorkerGroup | undefined {
  return GROUPS.find((g) => g.id === id);
}

/** 포커스 패널이 클로즈업하는 개별 에이전트 스크립트 */
export interface FocusScript {
  /** 소속 그룹 id (GROUPS와 매칭) */
  groupId: string;
  /** 그룹 내 대표 서브 에이전트 인덱스 */
  subIndex: number;
  /** ① 추론 토큰 스트림 (타이핑 재생) */
  thinking: L;
  /** ② tool call / 데이터 소스 라벨 (함수호출 형태) */
  tools: string[];
  /** ③ 중간 산출물 메트릭 */
  metric: { label: L; value: string; trend: 'up' | 'down' | 'flat' };
  /** ③ 시그널 태그 */
  signal: L;
  /** ③ 스파크라인용 숫자 시계열 */
  spark: number[];
  /** ④ 근거 체인 */
  evidence: { sources: L[]; crossChecks: number };
}

/** 그룹당 대표 1개 — 클로즈업 대상 (총 5개) */
export const FOCUS_SCRIPTS: FocusScript[] = [
  {
    groupId: 'fundamentals',
    subIndex: 0, // 재무제표
    thinking: {
      ko: '24Q3 영업이익과 매출총이익률 추세를 확인합니다. 컨센서스 대비 서프라이즈 여부 점검.',
      en: 'Checking 24Q3 operating profit and gross-margin trend; testing for surprise vs consensus.',
    },
    tools: ['retrieve_filings(24Q3)', 'fetch_consensus()', 'calc_margins()'],
    metric: { label: { ko: 'PER', en: 'P/E' }, value: '11.2x', trend: 'down' },
    signal: { ko: '밸류 매력', en: 'Cheap vs peers' },
    spark: [8, 9, 11, 10, 13, 15, 14],
    evidence: {
      sources: [
        { ko: 'DART 24Q3', en: 'DART 24Q3' },
        { ko: '컨센서스', en: 'Consensus' },
      ],
      crossChecks: 3,
    },
  },
  {
    groupId: 'technical',
    subIndex: 0, // 추세·모멘텀
    thinking: {
      ko: '20·60일 이평 정배열과 RSI를 점검합니다. 단기 모멘텀이 과열 구간인지 확인.',
      en: 'Checking 20/60-day MA alignment and RSI; is short-term momentum overbought?',
    },
    tools: ['fetch_ohlcv(1Y)', 'calc_rsi(14)', 'detect_trend()'],
    metric: { label: { ko: 'RSI', en: 'RSI' }, value: '71', trend: 'up' },
    signal: { ko: '단기 과열', en: 'Overbought' },
    spark: [40, 48, 55, 60, 66, 72, 71],
    evidence: {
      sources: [
        { ko: '가격 시계열', en: 'Price series' },
        { ko: '거래량', en: 'Volume' },
      ],
      crossChecks: 2,
    },
  },
  {
    groupId: 'market',
    subIndex: 2, // 매크로
    thinking: {
      ko: '환율·금리와 반도체 업황 사이클을 매핑합니다. 외국인 수급 방향성 확인.',
      en: 'Mapping FX/rates and the semiconductor cycle; checking foreign-flow direction.',
    },
    tools: ['fetch_macro()', 'fetch_flows(foreign)', 'map_cycle()'],
    metric: { label: { ko: '외국인 순매수', en: 'Foreign net buy' }, value: '+1.2T', trend: 'up' },
    signal: { ko: '수급 우호', en: 'Flows supportive' },
    spark: [-5, -2, 3, 6, 4, 9, 12],
    evidence: {
      sources: [
        { ko: '매크로 지표', en: 'Macro' },
        { ko: '수급 데이터', en: 'Flow data' },
      ],
      crossChecks: 2,
    },
  },
  {
    groupId: 'strategy',
    subIndex: 0, // 밸류에이션
    thinking: {
      ko: 'DCF와 상대가치를 교차해 적정주가 밴드를 산출합니다. 하방 리스크 측정.',
      en: 'Cross-checking DCF and relative value for a fair-price band; sizing downside risk.',
    },
    tools: ['run_dcf()', 'peer_multiples()', 'calc_downside()'],
    metric: { label: { ko: '상승여력', en: 'Upside' }, value: '+18%', trend: 'up' },
    signal: { ko: '비중확대', en: 'Overweight' },
    spark: [100, 104, 108, 112, 115, 118, 118],
    evidence: {
      sources: [
        { ko: 'DCF 모델', en: 'DCF model' },
        { ko: '동종업계 멀티플', en: 'Peer multiples' },
      ],
      crossChecks: 3,
    },
  },
  {
    groupId: 'intelligence',
    subIndex: 0, // 뉴스·공시
    thinking: {
      ko: '최근 공시와 뉴스 감성을 스캔합니다. HBM 관련 모멘텀과 리스크 이벤트 식별.',
      en: 'Scanning recent filings and news sentiment; flagging HBM momentum and risk events.',
    },
    tools: ['news_search(30d)', 'score_sentiment()', 'scan_filings()'],
    metric: { label: { ko: '뉴스 감성', en: 'Sentiment' }, value: '+0.62', trend: 'up' },
    signal: { ko: '긍정 우위', en: 'Net positive' },
    spark: [0.2, 0.3, 0.25, 0.45, 0.5, 0.58, 0.62],
    evidence: {
      sources: [
        { ko: '뉴스 30일', en: 'News 30d' },
        { ko: '전자공시', en: 'Filings' },
      ],
      crossChecks: 4,
    },
  },
];

/** 단계(비-에이전트) 포커스 요약 */
export interface StageFocus {
  title: L;
  body: L;
}

export const STAGE_FOCUS: Record<'routing' | 'verifying' | 'synthesis', StageFocus> = {
  routing: {
    title: { ko: '질문 분해', en: 'Decompose' },
    body: {
      ko: '질문을 5개 도메인으로 분해하고 16개 전문 에이전트에 라우팅합니다.',
      en: 'Decomposing the query into 5 domains, routing to 16 specialist agents.',
    },
  },
  verifying: {
    title: { ko: '교차 검증', en: 'Cross-verify' },
    body: {
      ko: '에이전트 결과를 교차 검증 — 상충 신호 1건을 근거 재확인으로 해소.',
      en: 'Cross-verifying agent results — 1 conflicting signal resolved by re-grounding.',
    },
  },
  synthesis: {
    title: { ko: '인사이트 합성', en: 'Synthesize' },
    body: {
      ko: '검증된 근거를 단일 인사이트로 합성합니다.',
      en: 'Synthesizing verified evidence into a single insight.',
    },
  },
};
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음(통과). data.ts만 추가됐고 아직 소비처가 없으므로 미사용 경고도 없음(`noUnusedLocals`는 export된 심볼엔 적용 안 됨).

- [ ] **Step 3: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/data.ts
git commit -m "feat(multi-agent): 포커스 스크립트 데이터 모델 — FocusScript/FOCUS_SCRIPTS/STAGE_FOCUS

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 상태머신 — focus 상태 + 포커스 시퀀스

**Files:**
- Modify: `src/demos/alphalenz/multi-agent/state.ts`

**Interfaces:**
- Consumes: `FOCUS_SCRIPTS`(Task 1), 기존 `GROUPS`, `LOGS_ORCHESTRATE`, `LOGS_PARALLEL`.
- Produces:
  - `type FocusTarget = { kind: 'agent'; groupId: string; subIndex: number } | { kind: 'stage'; stage: 'routing' | 'verifying' | 'synthesis' }`
  - `AgentState`에 `focus: FocusTarget | null` 추가. (FocusPanel/AgentGraph가 구독)
  - 기존 `phase`, `workers`, `countActive`, `logs`, `variant`, `start`, `reset` 시그니처 유지.

- [ ] **Step 1: import에 FOCUS_SCRIPTS 추가**

`src/demos/alphalenz/multi-agent/state.ts:3` 의 import를 교체:

```ts
import { GROUPS, LOGS_ORCHESTRATE, LOGS_PARALLEL, FOCUS_SCRIPTS } from './data';
```

- [ ] **Step 2: FocusTarget 타입과 state 필드 추가**

`Phase`/`WorkerStatus` 타입 정의 아래(현재 `state.ts:9` 부근)에 추가:

```ts
/** 포커스 패널/그래프 카메라가 비추는 대상 */
export type FocusTarget =
  | { kind: 'agent'; groupId: string; subIndex: number }
  | { kind: 'stage'; stage: 'routing' | 'verifying' | 'synthesis' };
```

`interface AgentState`에 `phase` 줄 아래로 필드 추가:

```ts
  /** 카메라가 지금 비추는 대상 (그래프 하이라이트 + 포커스 패널 공유) */
  focus: FocusTarget | null;
```

- [ ] **Step 3: 초기 state와 reset에 focus 반영**

`useAgents` 생성자 초기값(현재 `phase: 'idle',` 줄 뒤)에 추가:

```ts
  focus: null,
```

`reset`의 `set({ ... })`에 `focus: null` 추가:

```ts
  reset: () => {
    runId++;
    set({ phase: 'idle', workers: idleWorkers(), countActive: false, logs: [], variant: 'orchestrate', focus: null });
  },
```

- [ ] **Step 4: start 루프를 포커스 시퀀스로 재구성**

`start`의 `void (async () => { ... })()` 본문 전체를 아래로 교체한다. (기존 `set({ phase: 'routing', ... })` 직후부터 async IIFE 끝까지)

`set({ phase: 'routing', variant, logs: [], workers: idleWorkers(), countActive: false });` 줄은 아래처럼 `focus`를 포함하도록 교체:

```ts
    set({ phase: 'routing', variant, logs: [], workers: idleWorkers(), countActive: false, focus: { kind: 'stage', stage: 'routing' } });

    void (async () => {
      // 1) routing — 질문 분해 + 라우팅
      await sleep(500);
      if (id !== runId) return;
      log(0);
      await sleep(900);
      if (id !== runId) return;
      log(1);
      await sleep(700);
      if (id !== runId) return;

      // 2) working — 그룹 순회: 그룹 전체 병렬 점등 + 대표 에이전트 클로즈업
      set({ phase: 'working', countActive: true });
      log(2);
      // parallel variant는 클로즈업을 짧게 스킵(처리 규모 강조), orchestrate는 충분히 읽힘
      const dwell = variant === 'parallel' ? 900 : 1400;
      for (const g of GROUPS) {
        if (id !== runId) return;
        const script = FOCUS_SCRIPTS.find((s) => s.groupId === g.id);
        // 그룹 전체를 동시에 working으로 (병렬성 강조)
        set((s) => ({
          workers: { ...s.workers, ...Object.fromEntries(g.subs.map((_, i) => [workerKey(g.id, i), 'working'])) },
          focus: script ? { kind: 'agent', groupId: g.id, subIndex: script.subIndex } : s.focus,
        }));
        await sleep(dwell);
        if (id !== runId) return;
        // 그룹 전체 완료
        set((s) => ({
          workers: { ...s.workers, ...Object.fromEntries(g.subs.map((_, i) => [workerKey(g.id, i), 'done'])) },
        }));
        await sleep(160);
      }
      if (id !== runId) return;
      log(3);
      await sleep(400);
      if (id !== runId) return;

      // 3) verifying — 크로스 검증
      set({ phase: 'verifying', focus: { kind: 'stage', stage: 'verifying' } });
      log(4);
      await sleep(950);
      if (id !== runId) return;
      log(5);
      await sleep(1000);
      if (id !== runId) return;

      // 4) done — 합성 → 인사이트 카드
      set({ phase: 'done', focus: { kind: 'stage', stage: 'synthesis' } });
      log(6);
    })();
```

- [ ] **Step 5: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과. (FocusPanel은 아직 없지만 state는 독립적으로 컴파일됨)

- [ ] **Step 6: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/state.ts
git commit -m "feat(multi-agent): focus 상태 + 그룹 순회 클로즈업 시퀀스

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: FocusPanel 컴포넌트 (4요소 + 타이핑)

**Files:**
- Create: `src/demos/alphalenz/multi-agent/FocusPanel.tsx`

**Interfaces:**
- Consumes: `useAgents`(`focus`, `phase` — Task 2), `FOCUS_SCRIPTS`/`STAGE_FOCUS`/`groupById`(Task 1), `pick`/`useLang`, `AL`, `cn`.
- Produces: `export function FocusPanel({ className }: { className?: string })`

- [ ] **Step 1: FocusPanel.tsx 작성**

`src/demos/alphalenz/multi-agent/FocusPanel.tsx` 신규 생성:

```tsx
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, Cpu } from 'lucide-react';
import { useAgents } from './state';
import { FOCUS_SCRIPTS, STAGE_FOCUS, groupById, type FocusScript } from './data';
import { AL } from '../_shared/theme';
import { pick, useLang, type L } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/**
 * 포커스(클로즈업) 패널.
 * - state.focus가 agent면 해당 FocusScript의 4요소를 카메라처럼 보여준다:
 *   ① thinking 토큰 스트림(타이핑) ② tool call ③ 미니 산출물 ④ 근거 체인.
 * - focus가 stage면 Orchestrator 단계 요약(분해/검증/합성)을 보여준다.
 */

/** 한 글자씩 타이핑 — key가 바뀌면(=포커스 전환) 처음부터 재생 */
function useTypewriter(text: string, cps = 48): string {
  const [out, setOut] = useState('');
  useEffect(() => {
    setOut('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 1000 / cps);
    return () => clearInterval(id);
  }, [text, cps]);
  return out;
}

/** 미니 스파크라인 (0~100 정규화, non-scaling stroke) */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${26 - ((v - min) / range) * 22 - 2}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="h-6 w-full">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function TrendIcon({ trend, color }: { trend: 'up' | 'down' | 'flat'; color: string }) {
  const C = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  return <C className="h-3.5 w-3.5" style={{ color }} />;
}

/** agent 포커스 — 4요소 */
function AgentFocus({ script }: { script: FocusScript }) {
  const lang = useLang();
  const group = groupById(script.groupId);
  const color = group?.color ?? AL.accent;
  // focus 키를 thinking 타이핑 재생 트리거로 사용
  const typed = useTypewriter(pick(script.thinking, lang));

  return (
    <div className="flex h-full flex-col gap-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        <p className="text-[13px] font-semibold text-zinc-100">
          {group ? pick(group.label, lang) : ''}
          <span className="text-zinc-500"> › </span>
          {group ? pick(group.subs[script.subIndex], lang) : ''}
        </p>
        <span
          className="ml-auto rounded-md px-2 py-0.5 text-[10px] font-medium"
          style={{ background: `${color}22`, color }}
        >
          {pick({ ko: '분석중', en: 'Working' }, lang)}
        </span>
      </div>

      {/* ① thinking 토큰 스트림 */}
      <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <p className="min-h-[2.6em] text-[12.5px] leading-relaxed text-zinc-300">
          {typed}
          <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse" style={{ background: color }} />
        </p>
      </div>

      {/* ② tool call / 데이터 소스 */}
      <div className="rounded-lg border p-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
          <Terminal className="h-3 w-3" /> {pick({ ko: '데이터 호출', en: 'Tool calls' }, lang)}
        </p>
        <div className="space-y-1">
          {script.tools.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.32 }}
              className="flex items-center gap-1.5 font-mono text-[11.5px] text-zinc-300"
            >
              <span style={{ color }}>▸</span>
              <span className="truncate">{t}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ③ 중간 산출물 */}
      <div className="rounded-lg border p-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{pick(script.metric.label, lang)}</p>
            <p className="flex items-center gap-1 font-mono text-[18px] font-semibold leading-tight text-zinc-100">
              {script.metric.value}
              <TrendIcon trend={script.metric.trend} color={script.metric.trend === 'down' ? AL.down : AL.up} />
            </p>
          </div>
          <div className="w-24">
            <Spark data={script.spark} color={color} />
          </div>
        </div>
        <span
          className="mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10.5px] font-medium"
          style={{ background: `${color}1f`, color }}
        >
          {pick(script.signal, lang)}
        </span>
      </div>

      {/* ④ 근거 체인 */}
      <div className="mt-auto rounded-lg border p-2.5" style={{ borderColor: AL.border, background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex flex-wrap items-center gap-1.5">
          {script.evidence.sources.map((s) => (
            <span key={pick(s, 'en')} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-zinc-300">
              {pick(s, lang)}
            </span>
          ))}
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-medium text-emerald-300">
          <ShieldCheck className="h-3 w-3" />
          {pick(
            { ko: `${script.evidence.crossChecks}개 소스 교차확인`, en: `Cross-checked across ${script.evidence.crossChecks} sources` },
            lang,
          )}
        </p>
      </div>
    </div>
  );
}

/** stage 포커스 — Orchestrator 단계 요약 */
function StageFocusView({ stage }: { stage: 'routing' | 'verifying' | 'synthesis' }) {
  const lang = useLang();
  const s = STAGE_FOCUS[stage];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: AL.accentSoft, color: AL.accent }}
      >
        <Cpu className="h-6 w-6" />
      </motion.div>
      <p className="text-[14px] font-semibold text-zinc-100">{pick(s.title, lang)}</p>
      <p className="max-w-[280px] text-[12px] leading-relaxed text-zinc-400">{pick(s.body, lang)}</p>
    </div>
  );
}

/** idle 안내 */
function IdleView() {
  const lang = useLang();
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-[12px] leading-relaxed text-zinc-600">
      {pick(
        { ko: '분석 시작을 누르면 각 에이전트의 사고 과정이 여기에 표시됩니다.', en: 'Press Run to stream each agent’s reasoning here.' },
        lang,
      )}
    </div>
  );
}

/** focus 키 문자열 — AnimatePresence 전환 트리거 */
function focusKey(focus: ReturnType<typeof useAgents.getState>['focus']): string {
  if (!focus) return 'idle';
  return focus.kind === 'agent' ? `agent:${focus.groupId}:${focus.subIndex}` : `stage:${focus.stage}`;
}

export function FocusPanel({ className }: { className?: string }) {
  const focus = useAgents((s) => s.focus);
  const lang = useLang();
  const key = focusKey(focus);

  let body: React.ReactNode;
  if (!focus) body = <IdleView />;
  else if (focus.kind === 'stage') body = <StageFocusView stage={focus.stage} />;
  else {
    const script = FOCUS_SCRIPTS.find((s) => s.groupId === focus.groupId && s.subIndex === focus.subIndex);
    body = script ? <AgentFocus script={script} /> : <IdleView />;
  }

  return (
    <div
      className={cn('flex min-h-0 flex-col rounded-xl border p-3.5', className)}
      style={{ borderColor: AL.border, background: AL.cardBg }}
    >
      <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        <Cpu className="h-3.5 w-3.5 text-violet-400" /> {pick({ ko: '에이전트 포커스', en: 'Agent focus' }, lang)}
      </p>
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

참고: `lang` 미사용 경고가 나면 헤더의 `pick(..., lang)`에서 이미 사용되므로 문제 없다. `key`로 `pick(s,'en')`을 사용하는 것은 React key 안정성을 위한 의도(언어와 무관한 안정 키).

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과. (아직 Desktop/Mobile이 사용하지 않지만 컴포넌트 자체는 컴파일됨)

- [ ] **Step 3: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/FocusPanel.tsx
git commit -m "feat(multi-agent): FocusPanel — thinking 타이핑/tool call/산출물/근거 4요소

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 그래프 모션 업그레이드 (입자 + 리플/글로우 + 피사계 심도)

**Files:**
- Modify: `src/demos/alphalenz/multi-agent/AgentGraph.tsx`

**Interfaces:**
- Consumes: `useAgents`(`phase`, `workers`, `focus` — Task 2).
- Produces: 기존 `export function AgentGraph({ compact })` 시그니처 유지. 내부 모션만 강화.

- [ ] **Step 1: import에 focus 사용 준비**

`src/demos/alphalenz/multi-agent/AgentGraph.tsx:3` 의 state import에 `FocusTarget` 타입을 추가:

```ts
import { useAgents, type Phase, type WorkerStatus, type FocusTarget } from './state';
```

- [ ] **Step 2: 베지어 입자 헬퍼 + FlowParticles 컴포넌트 추가**

`AgentGraph.tsx`에서 `Edge` 컴포넌트 정의 **위**에 추가:

```ts
/** 3차 베지어 한 축 보간 */
function bez(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

const PARTICLE_SAMPLES = 14;

/** 엣지 곡선을 따라 흐르는 발광 입자 (Edge의 d와 동일한 제어점 사용) */
function FlowParticles({
  x1, y1, x2, y2, color, count = 2, reverse = false,
}: {
  x1: number; y1: number; x2: number; y2: number; color: string; count?: number; reverse?: boolean;
}) {
  const my = (y1 + y2) / 2;
  const ts = Array.from({ length: PARTICLE_SAMPLES }, (_, i) => i / (PARTICLE_SAMPLES - 1));
  const order = reverse ? [...ts].reverse() : ts;
  // 제어점: c1=(x1,my), c2=(x2,my) — Edge의 path와 동일
  const xs = order.map((t) => bez(x1, x1, x2, x2, t));
  const ys = order.map((t) => bez(y1, my, my, y2, t));
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.circle
          key={i}
          r={0.8}
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ cx: xs, cy: ys, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear', delay: i * (1.1 / count) }}
          style={{ filter: `drop-shadow(0 0 1.2px ${color})` }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 3: Edge 컴포넌트에 입자 통합**

`Edge` 컴포넌트의 `flow &&` 블록(현재 dash path) **뒤**, 닫는 `</g>` 직전에 입자를 추가:

```tsx
      {/* 데이터 흐름 입자 */}
      {flow && <FlowParticles x1={x1} y1={y1} x2={x2} y2={y2} color={color} count={2} />}
```

(기존 dash `<motion.path>`는 그대로 두고 입자를 더한다 — dash는 경로 강조, 입자는 패킷 감각.)

- [ ] **Step 4: focus 읽기 + 피사계 심도 키 계산**

`AgentGraph` 함수 본문 상단(현재 `const { phase, workers } = useAgents();`)을 교체:

```tsx
  const { phase, workers, focus } = useAgents();
  const lang = useLang();
  const { route, flow } = edgesActive(phase);
  // 카메라가 비추는 agent 키 (없으면 null → 디밍 비활성)
  const focusKey: string | null = focus?.kind === 'agent' ? `${focus.groupId}:${focus.subIndex}` : null;
```

- [ ] **Step 5: Node에 focused/dimmed 전달**

서브 노드 렌더(현재 `g.subs.map((sub, i) => (<Node ... />))`)의 `<Node>`에 props 추가:

```tsx
              <Node
                key={i}
                x={groupX(g.x)}
                y={SUB_Y0 + i * SUB_DY}
                color={g.color}
                label={pick(sub, lang)}
                status={workers[`${g.id}:${i}`] ?? 'idle'}
                small
                focused={focusKey === `${g.id}:${i}`}
                dimmed={focusKey !== null && focusKey !== `${g.id}:${i}`}
              />
```

그룹 노드(`<Node x={groupX(g.x)} y={GROUP_Y} ... />`)와 Orchestrator 노드에도 `dimmed` 추가(focus가 agent면 흐리게):

그룹 노드:
```tsx
            <Node x={groupX(g.x)} y={GROUP_Y} color={g.color} label={pick(g.label, lang)} status={gStatus} dimmed={focusKey !== null} />
```

Orchestrator 노드:
```tsx
      <Node
        x={ORCH.x}
        y={ORCH.y}
        color={ORCHESTRATOR_COLOR}
        label={pick(STR.orchestrator, lang)}
        status={phase === 'idle' ? 'idle' : phase === 'done' ? 'done' : 'working'}
        big
        icon={<Cpu className="h-3.5 w-3.5" />}
        dimmed={focusKey !== null}
      />
```

- [ ] **Step 6: NodeProps와 Node에 focused/dimmed + 리플/글로우 구현**

`interface NodeProps`에 추가:

```ts
  focused?: boolean;
  dimmed?: boolean;
```

`Node` 컴포넌트 본문을 교체(리플 + 호흡 글로우 + 피사계 심도):

```tsx
function Node({ x, y, color, label, status, big, small, icon, focused, dimmed }: NodeProps) {
  const active = status !== 'idle';
  const working = status === 'working';
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: focused ? 20 : 1 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: dimmed ? 0.32 : 1,
        scale: focused ? 1.16 : 1,
        filter: dimmed ? 'blur(0.7px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 점등 리플 — 활성 진입 시 한 번 퍼짐 */}
      {active && (
        <motion.span
          className="absolute left-1/2 top-1/2 -z-10 rounded-full"
          style={{ border: `1px solid ${color}`, x: '-50%', y: '-50%' }}
          initial={{ width: 8, height: 8, opacity: 0.6 }}
          animate={{ width: 56, height: 56, opacity: 0 }}
          transition={{ duration: 1.1, repeat: working ? Infinity : 0, ease: 'easeOut' }}
        />
      )}
      <motion.div
        className={cn(
          'flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium backdrop-blur-sm',
          big ? 'px-3 py-1.5 text-[12px]' : small ? 'px-2 py-0.5 text-[9.5px]' : 'px-2.5 py-1 text-[10.5px]',
        )}
        style={{
          borderColor: active ? color : 'rgba(255,255,255,0.12)',
          background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
          color: active ? '#f4f4f5' : '#a1a1aa',
        }}
        animate={{
          boxShadow: focused
            ? `0 0 26px -2px ${color}`
            : working
              ? [`0 0 8px -4px ${color}`, `0 0 20px -2px ${color}`, `0 0 8px -4px ${color}`]
              : active
                ? `0 0 16px -4px ${color}`
                : '0 0 0px transparent',
        }}
        transition={working && !focused ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        {icon ?? (
          <span className="flex h-3 w-3 items-center justify-center">
            {status === 'working' && <Loader2 className="h-3 w-3 animate-spin" style={{ color }} />}
            {status === 'done' && <Check className="h-3 w-3" style={{ color }} />}
            {status === 'idle' && <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />}
          </span>
        )}
        <span className="truncate">{label}</span>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 7: done 단계 수렴 입자 (그룹→Orchestrator 역류)**

`AgentGraph`의 SVG 안, "Orchestrator → 각 그룹" Edge 맵 **뒤**에 done 수렴 입자를 추가:

```tsx
        {/* done — 결과가 Orchestrator로 역류·수렴 */}
        {phase === 'done' &&
          GROUPS.map((g) => (
            <FlowParticles
              key={`conv-${g.id}`}
              x1={ORCH.x}
              y1={ORCH.y + 6}
              x2={groupX(g.x)}
              y2={GROUP_Y - 5}
              color={ORCHESTRATOR_COLOR}
              count={2}
              reverse
            />
          ))}
```

- [ ] **Step 8: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과.

- [ ] **Step 9: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/AgentGraph.tsx
git commit -m "feat(multi-agent): 그래프 모션 고급화 — 입자 흐름/리플/호흡 글로우/피사계 심도

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Desktop 레이아웃 재배치 (좌 그래프 + 우 FocusPanel 440px)

**Files:**
- Modify: `src/demos/alphalenz/multi-agent/Desktop.tsx`

**Interfaces:**
- Consumes: `FocusPanel`(Task 3), 기존 `QuestionBar`/`CountBadge`/`InsightCard`(파일 내 정의), `AgentGraph`.
- Produces: 기존 `export function Desktop` 시그니처 유지.

- [ ] **Step 1: import에 FocusPanel 추가, LogPanel 제거**

`Desktop.tsx:10` 부근 import에 추가:

```ts
import { FocusPanel } from './FocusPanel';
```

`Sparkles`가 LogPanel에서만 쓰였으면 `lucide-react` import에서 제거(미사용 시 `noUnusedLocals` 에러). 현재 import 라인:
```ts
import { Play, Loader2, ShieldCheck, Sparkles, Users, MessageCircleQuestion } from 'lucide-react';
```
→ `Sparkles` 제거:
```ts
import { Play, Loader2, ShieldCheck, Users, MessageCircleQuestion } from 'lucide-react';
```

- [ ] **Step 2: LogPanel 컴포넌트 정의 삭제**

`Desktop.tsx`의 `/** 추론 진행 로그 */ function LogPanel() { ... }` 전체(현재 67~97행)를 삭제한다. 로그는 더 이상 데스크톱에 표시하지 않는다(포커스 패널이 대체).

- [ ] **Step 3: Desktop 본문 레이아웃 교체**

`export function Desktop` 본문을 교체:

```tsx
export function Desktop(_: DemoComponentProps) {
  return (
    <div className="flex h-full flex-col" style={{ background: AL.appBg, color: '#e4e4e7' }}>
      <TopBar activeTab={1} search={STR.search} />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_440px] gap-3 p-3">
        {/* 좌: 질문 + 그래프 */}
        <div className="flex min-h-0 flex-col gap-3">
          <QuestionBar />
          <div className="min-h-0 flex-1">
            <AgentGraph />
          </div>
        </div>
        {/* 우: 카운터 + 포커스 패널 + 인사이트 */}
        <div className="flex min-h-0 flex-col gap-3">
          <CountBadge />
          <FocusPanel className="flex-1" />
          <InsightCard />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과. (`Sparkles`/`LogPanel`/`useAgents`의 `logs` 미사용 잔재가 없는지 확인 — LogPanel 삭제로 `logs` 구독도 사라짐. `AnimatePresence`/`motion`은 InsightCard에서 계속 사용되므로 유지)

- [ ] **Step 5: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/Desktop.tsx
git commit -m "feat(multi-agent): 데스크톱 레이아웃 — 좌 그래프 + 우 FocusPanel(440px)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Mobile 세로 스택에 FocusPanel 삽입

**Files:**
- Modify: `src/demos/alphalenz/multi-agent/Mobile.tsx`

**Interfaces:**
- Consumes: `FocusPanel`(Task 3), 기존 `AgentGraph`/`useAgents`.
- Produces: 기존 `export function Mobile` 시그니처 유지.

- [ ] **Step 1: import에 FocusPanel 추가**

`Mobile.tsx:11` 부근에 추가:

```ts
import { FocusPanel } from './FocusPanel';
```

- [ ] **Step 2: 그래프 아래 FocusPanel 삽입**

`<AgentGraph compact />` 줄(현재 58행) 바로 아래에 추가:

```tsx
        {/* 그래프 (compact) */}
        <AgentGraph compact />

        {/* 포커스 패널 — 활성 에이전트 클로즈업 */}
        <FocusPanel className="min-h-[280px]" />
```

(기존 로그 블록은 모바일 맥락 보조로 유지한다 — 모바일은 세로 스크롤이라 공간 여유가 있음.)

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/Mobile.tsx
git commit -m "feat(multi-agent): 모바일 세로 스택에 FocusPanel 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: 시나리오 타이밍 조정 + 통합 빌드/시각 검증

**Files:**
- Modify: `src/demos/alphalenz/multi-agent/scenario.ts`

**Interfaces:**
- Consumes: `useAgents`(`start`). 기존 `Scenario` 타입.
- Produces: 기존 `orchestrateScenario`/`parallelScenario` export 유지.

새 타임라인 계산:
- orchestrate: routing(500+900+700=2.1s) + working(5×(1400+160)=7.8s) + working 후(400) + verifying(950+1000=1.95s) ≈ **12.25s** → 카드 등장 여유 포함 클릭 후 `wait 12800`.
- parallel: working dwell 900 → working(5×(900+160)=5.3s) → 합계 ≈ **9.75s** → 클릭 후 `wait 10300`.

- [ ] **Step 1: scenario.ts의 wait 값 조정**

`orchestrateScenario`의 `{ kind: 'wait', ms: 8800 }` → `{ kind: 'wait', ms: 12800 }`:

```ts
export const orchestrateScenario: Scenario = {
  id: 'multi-agent-orchestrate',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'run-btn', ms: 600 },
    { kind: 'wait', ms: 250 },
    { kind: 'click', target: 'run-btn', run: () => st().start('orchestrate') },
    // routing(≈2.1s) + working(5×1.56≈7.8s) + verifying(≈2s) ≈ 12.2s
    { kind: 'wait', ms: 12800 },
    { kind: 'cursor', target: 'result-card', ms: 800 },
    { kind: 'wait', ms: 1600 },
  ],
};
```

`parallelScenario`의 `{ kind: 'wait', ms: 8800 }` → `{ kind: 'wait', ms: 10300 }`:

```ts
export const parallelScenario: Scenario = {
  id: 'multi-agent-parallel',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'run-btn', ms: 600 },
    { kind: 'wait', ms: 250 },
    { kind: 'click', target: 'run-btn', run: () => st().start('parallel') },
    // routing(≈2.1s) + working(5×1.06≈5.3s) + verifying(≈2s) ≈ 9.4s
    { kind: 'wait', ms: 10300 },
    { kind: 'cursor', target: 'result-card', ms: 800 },
    { kind: 'wait', ms: 1600 },
  ],
};
```

- [ ] **Step 2: 전체 빌드 (타입 + 번들)**

Run: `npm run build`
Expected: `tsc --noEmit` 통과 + `vite build` 성공(에러 없이 `dist/` 생성).

- [ ] **Step 3: dev 서버 시각 확인**

Run: `npm run dev` (백그라운드) → 브라우저에서 멀티 에이전트 데모(`multi-agent`)를 연다.
확인 항목:
1. **분석 시작** 클릭 → routing에서 포커스 패널이 "질문 분해" 요약 표시, 그래프에서 Orchestrator→그룹 입자 흐름.
2. working: 그룹이 순서대로 점등될 때마다 포커스 패널이 해당 그룹 대표 에이전트로 클로즈업 — thinking 문장이 타이핑되고, tool call 3줄이 순차 등장, 메트릭+스파크라인+시그널, 근거 칩+교차확인.
3. 클로즈업 중인 노드가 그래프에서 확대+강조되고 나머지 노드는 흐려지는지(피사계 심도).
4. verifying: 그룹 간 크로스 검증 점선 + 패널 "교차 검증" 요약.
5. done: Orchestrator로 역류하는 수렴 입자 + 인사이트 카드 등장.
6. 언어 토글(ko/en) 시 thinking/시그널/근거가 번역되는지.
7. 모바일 뷰: 그래프 아래 포커스 패널이 세로로 정상 렌더되는지.

- [ ] **Step 4: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/scenario.ts
git commit -m "feat(multi-agent): 포커스 시퀀스에 맞춰 시나리오 타임라인 조정(≈12s/9s)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage (설계 5개 섹션 대조):**
- 섹션 1(그래프 모션: 입자/리플·글로우/피사계 심도/단계 모션) → Task 4 ✓ (단계 모션: routing 입자 flow는 기존 edgesActive 규칙으로 working/routing flow on, done 수렴 입자 Step 7 ✓, verifying 크로스 라인은 기존 코드 유지 ✓)
- 섹션 2(포커스 패널 4요소) → Task 3 ✓
- 섹션 3(데이터 모델, 대표 5개) → Task 1 ✓
- 섹션 4(상태머신 focus + 타이밍) → Task 2 + Task 7 ✓
- 섹션 5(모바일 + variant) → Task 6 + Task 2(dwell 분기) ✓

**2. Placeholder scan:** "TBD/TODO/적절히 처리" 없음. 모든 코드 블록은 실제 구현. ✓

**3. Type consistency:**
- `FocusTarget`: state.ts(Task 2) 정의 ↔ FocusPanel(Task 3)·AgentGraph(Task 4)에서 `focus?.kind === 'agent'`로 동일하게 소비 ✓
- `FocusScript`: data.ts(Task 1) 정의 ↔ FocusPanel `FOCUS_SCRIPTS.find(...)` ✓
- `metric.label`/`signal`/`evidence.sources`는 `L` 타입 → 모두 `pick(..., lang)` ✓
- `groupById` 반환 `WorkerGroup | undefined` → FocusPanel에서 옵셔널 처리(`group?.`) ✓
- `FlowParticles` props ↔ Edge/Task7 호출 시 동일 ✓

**참고(설계 대비 의도된 보강):** 설계 문서는 metric.label/signal을 "언어 무관"으로 적었으나, 자연스러운 한/영 표기를 위해 `L`로 승격했다(Global Constraints의 i18n 원칙과 일치). 기능·범위 변화 없음.
