# 멀티 에이전트 Palantir그레이드 DAG 재설계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 멀티 에이전트 그래프를 곡선·무지개·발광 트리에서 Palantir그레이드 톱다운 DAG(사각 카드 + 1px 직교 커넥터 + 절제된 인디고 단색 + 데이터 밀도)로 재설계하고, 포커스 패널·셸을 동일 콘솔 팔레트로 통일한다.

**Architecture:** `_shared/theme.ts`에 `CONSOLE` 토큰을 추가하고, `AgentGraph.tsx`를 div 커넥터 기반 DAG로 전면 재작성, `FocusPanel.tsx`·`Desktop.tsx`·`Mobile.tsx`를 콘솔 팔레트로 리스타일한다. 상태머신(`state.ts`)·타이밍은 변경하지 않는다.

**Tech Stack:** React 18, TypeScript 5.7, framer-motion 11, zustand 5, Tailwind 4, lucide-react.

## Global Constraints

- **테스트 러너 없음.** 검증 게이트는 `npx tsc --noEmit`(타입) + 최종 `npm run build`(tsc + vite) + dev 서버 시각 확인. 테스트 파일 만들지 않는다. `noUnusedLocals` 켜짐 — 미사용 import/변수는 빌드 에러.
- **i18n 필수.** 사용자에게 보이는 문자열은 `L = Record<'ko'|'en', T>` + `pick(l, lang)`. `useLang()` 구독.
- **단일 팔레트.** 색은 `CONSOLE` 토큰 + 그룹색의 `mutedTick()` 탈채도 톤만. 무지개 5색·글로우(box-shadow blur)·호흡 펄스·곡선 베지어·입자 전면 금지.
- **액센트 = 몽환 인디고 `#6366f1`** (Tailwind indigo-500). Orchestrator·활성 흐름·포커스에만.
- **상태머신 불변.** `state.ts`의 `phase`/`focus`/`workers`/시퀀스/타이밍은 그대로. 시각만 바꾼다.
- `AgentGraph` 시그니처 `export function AgentGraph({ compact })` 유지.
- **커밋 꼬리말:** 모든 커밋 끝에
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```

---

## 파일 구조

- `src/demos/alphalenz/_shared/theme.ts` — **수정**. `CONSOLE` 토큰 묶음 추가(기존 `AL`·배경 export 유지).
- `src/demos/alphalenz/multi-agent/data.ts` — **수정**. `mutedTick()` 헬퍼 + `SUB_META` 맵 추가(기존 export 유지).
- `src/demos/alphalenz/multi-agent/AgentGraph.tsx` — **전면 재작성**. DAG 카드 + div 커넥터 + 절제 모션.
- `src/demos/alphalenz/multi-agent/FocusPanel.tsx` — **전면 재작성**(콘솔 팔레트 리스타일, 로직 동일).
- `src/demos/alphalenz/multi-agent/Desktop.tsx` — **전면 재작성**(콘솔 팔레트).
- `src/demos/alphalenz/multi-agent/Mobile.tsx` — **전면 재작성**(콘솔 팔레트).

각 태스크는 `npx tsc --noEmit` 통과 + 커밋으로 끝난다.

---

### Task 1: 콘솔 토큰 + 데이터 헬퍼

**Files:**
- Modify: `src/demos/alphalenz/_shared/theme.ts`
- Modify: `src/demos/alphalenz/multi-agent/data.ts`

**Interfaces:**
- Produces:
  - `CONSOLE` — `{ bg, panel, card, hair, line, accent, accentFill, accentBorder, done, down, text, textDim, textMicro }` (모두 string)
  - `function mutedTick(hex: string): string` — `#rrggbb`를 탈채도 `rgb(...)`로
  - `const SUB_META: Record<string, { latencyMs: number }>` — 키 `"groupId:subIndex"`, 16개 전부

- [ ] **Step 1: `theme.ts`에 CONSOLE 추가**

`src/demos/alphalenz/_shared/theme.ts`의 `export const AL = {...} as const;` 블록 **뒤**에 추가(기존 내용 유지):

```ts
/**
 * Palantir그레이드 콘솔 팔레트 — 멀티에이전트 데모 전용.
 * near-black 블루그레이 + 헤어라인 + 단일 인디고 액센트. 글로우/무지개 금지.
 */
export const CONSOLE = {
  bg: '#0a0c12',
  panel: '#11141c',
  card: 'rgba(255,255,255,0.022)',
  hair: 'rgba(255,255,255,0.07)',
  line: 'rgba(255,255,255,0.10)',
  accent: '#6366f1',
  accentFill: 'rgba(99,102,241,0.12)',
  accentBorder: 'rgba(99,102,241,0.55)',
  done: '#5e9c83',
  down: '#c2607a',
  text: '#e4e4e7',
  textDim: '#a1a1aa',
  textMicro: '#71717a',
} as const;
```

- [ ] **Step 2: `data.ts`에 mutedTick + SUB_META 추가**

`src/demos/alphalenz/multi-agent/data.ts` 파일 **끝**에 추가(기존 내용 유지):

```ts
/** 그룹 원색을 탈채도 톤으로 — 카드 좌측 2px 틱 전용 (55% 색 + 45% 중간회색) */
export function mutedTick(hex: string): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c * 0.55 + 128 * 0.45);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** 서브 에이전트별 경량 메타 — 완료 시 지연시간(ms) 표기용. 키 "groupId:subIndex" */
export const SUB_META: Record<string, { latencyMs: number }> = {
  'fundamentals:0': { latencyMs: 920 },
  'fundamentals:1': { latencyMs: 780 },
  'fundamentals:2': { latencyMs: 1240 },
  'fundamentals:3': { latencyMs: 660 },
  'technical:0': { latencyMs: 840 },
  'technical:1': { latencyMs: 590 },
  'technical:2': { latencyMs: 1020 },
  'market:0': { latencyMs: 1130 },
  'market:1': { latencyMs: 700 },
  'market:2': { latencyMs: 1480 },
  'strategy:0': { latencyMs: 1310 },
  'strategy:1': { latencyMs: 880 },
  'strategy:2': { latencyMs: 540 },
  'intelligence:0': { latencyMs: 960 },
  'intelligence:1': { latencyMs: 720 },
  'intelligence:2': { latencyMs: 1390 },
};
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과(추가만, 소비처는 다음 태스크).

- [ ] **Step 4: 커밋**

```bash
git add src/demos/alphalenz/_shared/theme.ts src/demos/alphalenz/multi-agent/data.ts
git commit -m "feat(multi-agent): 콘솔 팔레트 토큰 + mutedTick/SUB_META

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: AgentGraph DAG 전면 재작성

**Files:**
- Modify (overwrite): `src/demos/alphalenz/multi-agent/AgentGraph.tsx`

**Interfaces:**
- Consumes: `CONSOLE`(Task 1), `mutedTick`/`SUB_META`/`GROUPS`(Task 1·기존), `useAgents`(`phase`/`workers`/`focus`).
- Produces: `export function AgentGraph({ compact = false }: { compact?: boolean })` (시그니처 불변).

- [ ] **Step 1: 파일 전체를 아래로 교체**

`src/demos/alphalenz/multi-agent/AgentGraph.tsx`의 **전체 내용**을 다음으로 덮어쓴다:

```tsx
import { motion } from 'framer-motion';
import { Check, Cpu } from 'lucide-react';
import { useAgents, type Phase, type WorkerStatus } from './state';
import { GROUPS, SUB_META, mutedTick } from './data';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang, type L } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/**
 * 멀티에이전트 DAG — Palantir그레이드 콘솔.
 * - 톱다운 DAG: Orchestrator → 5 그룹 → 서브 에이전트.
 * - 커넥터는 1px div(직교). 곡선/글로우/입자 없음.
 * - 상태(대기/실행/완료)로만 색 부여, 단일 인디고 액센트.
 */

const ORCH = { x: 50, y: 9 };
const BUS_Y = 22;
const GROUP_Y = 32;
const SUB_Y0 = 49;
const SUB_DY = 14;

/** 그룹 열의 가로 위치(%) — data.x(0~1)를 8~92로 매핑 */
function groupX(x: number): number {
  return 8 + x * 84;
}

/** Orchestrator 단계 서브라벨 */
const ORCH_SUB: Record<Phase, L> = {
  idle: { ko: '대기', en: 'STANDBY' },
  routing: { ko: '라우팅', en: 'ROUTING' },
  working: { ko: '실행 · 16 에이전트', en: 'RUNNING · 16 AGENTS' },
  verifying: { ko: '교차검증', en: 'CROSS-VERIFY' },
  done: { ko: '합성 완료', en: 'SYNTHESIZED' },
};

function statusOf(workers: Record<string, WorkerStatus>, groupId: string, n: number): WorkerStatus {
  let working = 0;
  let done = 0;
  for (let i = 0; i < n; i++) {
    const s = workers[`${groupId}:${i}`];
    if (s === 'working') working++;
    else if (s === 'done') done++;
  }
  if (done === n) return 'done';
  if (working > 0 || done > 0) return 'working';
  return 'idle';
}

/** 1px 수직 커넥터 */
function VLine({ x, y1, y2, active }: { x: number; y1: number; y2: number; active: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y1}%`,
        height: `${y2 - y1}%`,
        width: 1,
        transform: 'translateX(-0.5px)',
        background: active ? CONSOLE.accent : CONSOLE.line,
        opacity: active ? 0.7 : 1,
        transition: 'background-color 0.35s, opacity 0.35s',
      }}
    />
  );
}

/** 1px 수평 커넥터 (pulse=교차검증 점멸) */
function HLine({ x1, x2, y, active, pulse }: { x1: number; x2: number; y: number; active: boolean; pulse?: boolean }) {
  const common = {
    left: `${Math.min(x1, x2)}%`,
    top: `${y}%`,
    width: `${Math.abs(x2 - x1)}%`,
    height: 1,
    transform: 'translateY(-0.5px)',
  } as const;
  if (pulse) {
    return (
      <motion.div
        className="absolute"
        style={{ ...common, background: CONSOLE.accent }}
        initial={{ opacity: 0.15 }}
        animate={{ opacity: [0.15, 0.7, 0.25] }}
        transition={{ duration: 1.3, repeat: Infinity }}
      />
    );
  }
  return (
    <div
      className="absolute"
      style={{
        ...common,
        background: active ? CONSOLE.accent : CONSOLE.line,
        opacity: active ? 0.7 : 1,
        transition: 'background-color 0.35s, opacity 0.35s',
      }}
    />
  );
}

type CardKind = 'orch' | 'group' | 'sub';

interface CardProps {
  x: number;
  y: number;
  kind: CardKind;
  title: string;
  meta?: string;
  status: WorkerStatus;
  tick: string;
  focused?: boolean;
  dimmed?: boolean;
}

function StatusGlyph({ status }: { status: WorkerStatus }) {
  if (status === 'done') return <Check className="h-3 w-3" strokeWidth={2.5} style={{ color: CONSOLE.done }} />;
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ background: status === 'working' ? CONSOLE.accent : '#52525b' }}
    />
  );
}

/** 사각 노드 카드 — 좌측 틱 + 상태 글리프 + 모노 메타 */
function Card({ x, y, kind, title, meta, status, tick, focused, dimmed }: CardProps) {
  const active = status !== 'idle';
  const working = status === 'working';
  const isOrch = kind === 'orch';
  const width = isOrch ? 156 : kind === 'group' ? 120 : 108;
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width,
        zIndex: focused ? 20 : 2,
        borderRadius: 3,
        border: `1px solid ${focused || active ? CONSOLE.accentBorder : CONSOLE.hair}`,
        background: active ? CONSOLE.accentFill : CONSOLE.card,
        boxShadow: focused ? `0 0 0 1px ${CONSOLE.accent}` : 'none',
      }}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: dimmed ? 0.45 : 1, scale: focused ? 1.04 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 좌측 그룹 틱 */}
      <span className="absolute left-0 top-0 h-full" style={{ width: 2, background: tick }} />
      {/* 실행중 상단 프로그레스 */}
      {working && (
        <motion.span
          className="absolute left-0 top-0 h-[1.5px]"
          style={{ background: CONSOLE.accent }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
        />
      )}
      <div className="flex flex-col gap-0.5 py-1.5 pl-3 pr-2.5">
        <div className="flex items-center gap-1.5">
          {isOrch ? <Cpu className="h-3 w-3" style={{ color: CONSOLE.accent }} /> : <StatusGlyph status={status} />}
          <span
            className={cn(
              'truncate',
              isOrch ? 'text-[10px] font-semibold uppercase' : kind === 'group' ? 'text-[11px] font-medium' : 'text-[10px]',
            )}
            style={{ color: active || isOrch ? CONSOLE.text : CONSOLE.textDim, letterSpacing: isOrch ? '0.08em' : undefined }}
          >
            {title}
          </span>
          {meta && kind === 'group' && (
            <span className="ml-auto font-mono text-[9px]" style={{ color: CONSOLE.textMicro }}>
              {meta}
            </span>
          )}
        </div>
        {meta && kind !== 'group' && (
          <span className="font-mono text-[8.5px] uppercase tracking-wide" style={{ color: CONSOLE.textMicro }}>
            {meta}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function AgentGraph({ compact = false }: { compact?: boolean }) {
  const { phase, workers, focus } = useAgents();
  const lang = useLang();
  const focusKey: string | null = focus?.kind === 'agent' ? `${focus.groupId}:${focus.subIndex}` : null;
  const running = phase !== 'idle';
  const gx = GROUPS.map((g) => groupX(g.x));
  const busX1 = gx[0];
  const busX2 = gx[gx.length - 1];

  return (
    <div
      className={cn('relative w-full overflow-hidden', compact ? 'h-[300px]' : 'h-full min-h-[360px]')}
      style={{ borderRadius: 4, border: `1px solid ${CONSOLE.hair}`, background: CONSOLE.panel }}
    >
      {/* 커넥터: orch drop + bus */}
      <VLine x={ORCH.x} y1={ORCH.y + 4} y2={BUS_Y} active={running} />
      <HLine x1={busX1} x2={busX2} y={BUS_Y} active={running} />

      {/* 커넥터: 그룹 드롭 + 스파인 */}
      {GROUPS.map((g, gi) => {
        const gStatus = statusOf(workers, g.id, g.subs.length);
        const lastSubY = SUB_Y0 + (g.subs.length - 1) * SUB_DY;
        return (
          <div key={`conn-${g.id}`}>
            <VLine x={gx[gi]} y1={BUS_Y} y2={GROUP_Y - 4} active={running} />
            <VLine x={gx[gi]} y1={GROUP_Y + 4} y2={lastSubY} active={gStatus !== 'idle'} />
          </div>
        );
      })}

      {/* 교차검증 헤어라인 (인접 그룹 열 사이) */}
      {(phase === 'verifying' || phase === 'done') &&
        GROUPS.slice(0, -1).map((g, gi) => (
          <HLine key={`cv-${g.id}`} x1={gx[gi]} x2={gx[gi + 1]} y={SUB_Y0 - 7} active pulse={phase === 'verifying'} />
        ))}

      {/* Orchestrator */}
      <Card
        x={ORCH.x}
        y={ORCH.y}
        kind="orch"
        title={pick({ ko: '오케스트레이터', en: 'ORCHESTRATOR' }, lang)}
        meta={pick(ORCH_SUB[phase], lang)}
        status={phase === 'idle' ? 'idle' : phase === 'done' ? 'done' : 'working'}
        tick={CONSOLE.accent}
        dimmed={focusKey !== null}
      />

      {/* 그룹 + 서브 카드 */}
      {GROUPS.map((g, gi) => {
        const gStatus = statusOf(workers, g.id, g.subs.length);
        const dc = g.subs.reduce((n, _, i) => (workers[`${g.id}:${i}`] === 'done' ? n + 1 : n), 0);
        const tick = mutedTick(g.color);
        return (
          <div key={g.id}>
            <Card
              x={gx[gi]}
              y={GROUP_Y}
              kind="group"
              title={pick(g.label, lang)}
              meta={`${dc}/${g.subs.length}`}
              status={gStatus}
              tick={tick}
              dimmed={focusKey !== null}
            />
            {g.subs.map((sub, i) => {
              const st = workers[`${g.id}:${i}`] ?? 'idle';
              const lat = SUB_META[`${g.id}:${i}`]?.latencyMs;
              const meta =
                st === 'done' && lat
                  ? `lat ${(lat / 1000).toFixed(1)}s`
                  : st === 'working'
                    ? pick({ ko: '실행중', en: 'running' }, lang)
                    : '—';
              return (
                <Card
                  key={i}
                  x={gx[gi]}
                  y={SUB_Y0 + i * SUB_DY}
                  kind="sub"
                  title={pick(sub, lang)}
                  meta={meta}
                  status={st}
                  tick={tick}
                  focused={focusKey === `${g.id}:${i}`}
                  dimmed={focusKey !== null && focusKey !== `${g.id}:${i}`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과. 미사용 import 없음(`Loader2`/`ORCHESTRATOR_COLOR`/`STR`/`FlowParticles`/`Edge` 전부 제거됨).

- [ ] **Step 3: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/AgentGraph.tsx
git commit -m "feat(multi-agent): 그래프를 Palantir그레이드 DAG로 전면 재작성

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: FocusPanel 콘솔 팔레트 리스타일

**Files:**
- Modify (overwrite): `src/demos/alphalenz/multi-agent/FocusPanel.tsx`

**Interfaces:**
- Consumes: `CONSOLE`(Task 1), `mutedTick`(Task 1), `FOCUS_SCRIPTS`/`STAGE_FOCUS`/`groupById`/`FocusScript`(기존), `useAgents`.
- Produces: `export function FocusPanel({ className }: { className?: string })` (시그니처 불변). 로직(타이핑·분기·AnimatePresence) 동일, 시각만 콘솔 팔레트.

- [ ] **Step 1: 파일 전체를 아래로 교체**

`src/demos/alphalenz/multi-agent/FocusPanel.tsx`의 **전체 내용**을 다음으로 덮어쓴다:

```tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, ArrowUpRight, ArrowDownRight, Minus, Cpu } from 'lucide-react';
import { useAgents } from './state';
import { FOCUS_SCRIPTS, STAGE_FOCUS, groupById, mutedTick, type FocusScript } from './data';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/**
 * 포커스(클로즈업) 패널 — 콘솔 팔레트.
 * - agent 포커스: 4요소(thinking 타이핑 / tool call / 미니 산출물 / 근거 체인).
 * - stage 포커스: Orchestrator 단계 요약.
 */

/** 한 글자씩 타이핑 — key가 바뀌면 처음부터 재생. done은 완료 여부 */
function useTypewriter(text: string, cps = 48): { out: string; done: boolean } {
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
  return { out, done: out.length >= text.length };
}

/** 미니 스파크라인 */
function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const span = data.length - 1 || 1;
  const pts = data.map((v, i) => `${(i / span) * 100},${26 - ((v - min) / range) * 22 - 2}`).join(' ');
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

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  const C = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const color = trend === 'down' ? CONSOLE.down : CONSOLE.done;
  return <C className="h-3.5 w-3.5" style={{ color }} />;
}

/** 콘솔 카드 래퍼 */
function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-[3px] border', className)}
      style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}
    >
      {children}
    </div>
  );
}

/** 대문자 마이크로 라벨 */
function Micro({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>
      {children}
    </p>
  );
}

/** agent 포커스 — 4요소 */
function AgentFocus({ script }: { script: FocusScript }) {
  const lang = useLang();
  const group = groupById(script.groupId);
  const tick = mutedTick(group?.color ?? CONSOLE.accent);
  const { out: typed, done: typedDone } = useTypewriter(pick(script.thinking, lang));

  return (
    <div className="flex h-full flex-col gap-2.5">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <span className="h-3 w-[2px]" style={{ background: tick }} />
        <p className="text-[12.5px] font-semibold" style={{ color: CONSOLE.text }}>
          {group ? pick(group.label, lang) : ''}
          <span style={{ color: CONSOLE.textMicro }}> › </span>
          {group ? pick(group.subs[script.subIndex], lang) : ''}
        </p>
        <span
          className="ml-auto rounded-[3px] px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide"
          style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}
        >
          {pick({ ko: '실행중', en: 'Working' }, lang)}
        </span>
      </div>

      {/* ① thinking 토큰 스트림 */}
      <Panel className="px-3 py-2.5">
        <p className="min-h-[2.6em] text-[12px] leading-relaxed" style={{ color: CONSOLE.textDim }}>
          {typed}
          {!typedDone && (
            <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse" style={{ background: CONSOLE.accent }} />
          )}
        </p>
      </Panel>

      {/* ② tool call */}
      <Panel className="p-2.5">
        <Micro>
          <Terminal className="h-3 w-3" /> {pick({ ko: '데이터 호출', en: 'Tool calls' }, lang)}
        </Micro>
        <div className="mt-1.5 space-y-1">
          {script.tools.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.32 }}
              className="flex items-center gap-1.5 font-mono text-[11px]"
              style={{ color: CONSOLE.textDim }}
            >
              <span style={{ color: CONSOLE.accent }}>▸</span>
              <span className="truncate">{t}</span>
            </motion.div>
          ))}
        </div>
      </Panel>

      {/* ③ 중간 산출물 */}
      <Panel className="p-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Micro>{pick(script.metric.label, lang)}</Micro>
            <p className="flex items-center gap-1 font-mono text-[17px] font-semibold leading-tight" style={{ color: CONSOLE.text }}>
              {script.metric.value}
              <TrendIcon trend={script.metric.trend} />
            </p>
          </div>
          <div className="w-24">
            <Spark data={script.spark} color={CONSOLE.accent} />
          </div>
        </div>
        <span
          className="mt-1.5 inline-block rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium"
          style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}
        >
          {pick(script.signal, lang)}
        </span>
      </Panel>

      {/* ④ 근거 체인 */}
      <Panel className="mt-auto p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {script.evidence.sources.map((s) => (
            <span
              key={pick(s, 'en')}
              className="rounded-[3px] px-1.5 py-0.5 font-mono text-[10px]"
              style={{ background: 'rgba(255,255,255,0.04)', color: CONSOLE.textDim }}
            >
              {pick(s, lang)}
            </span>
          ))}
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium" style={{ color: CONSOLE.done }}>
          <ShieldCheck className="h-3 w-3" />
          {pick(
            { ko: `${script.evidence.crossChecks}개 소스 교차확인`, en: `Cross-checked across ${script.evidence.crossChecks} sources` },
            lang,
          )}
        </p>
      </Panel>
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-11 w-11 items-center justify-center rounded-[4px]"
        style={{ background: CONSOLE.accentFill, color: CONSOLE.accent, border: `1px solid ${CONSOLE.accentBorder}` }}
      >
        <Cpu className="h-5 w-5" />
      </motion.div>
      <p className="text-[13.5px] font-semibold" style={{ color: CONSOLE.text }}>{pick(s.title, lang)}</p>
      <p className="max-w-[280px] text-[12px] leading-relaxed" style={{ color: CONSOLE.textDim }}>{pick(s.body, lang)}</p>
    </div>
  );
}

/** idle 안내 */
function IdleView() {
  const lang = useLang();
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-[12px] leading-relaxed" style={{ color: CONSOLE.textMicro }}>
      {pick(
        { ko: '분석 시작을 누르면 각 에이전트의 사고 과정이 여기에 표시됩니다.', en: "Press Run to stream each agent's reasoning here." },
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
      className={cn('flex min-h-0 flex-col rounded-[4px] border p-3.5', className)}
      style={{ borderColor: CONSOLE.hair, background: CONSOLE.panel }}
    >
      <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>
        <Cpu className="h-3.5 w-3.5" style={{ color: CONSOLE.accent }} /> {pick({ ko: '에이전트 포커스', en: 'Agent focus' }, lang)}
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

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 통과. (`AL` import 제거, `CONSOLE`/`mutedTick` 사용. 미사용 없음)

- [ ] **Step 3: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/FocusPanel.tsx
git commit -m "feat(multi-agent): FocusPanel 콘솔 팔레트 리스타일

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Desktop/Mobile 셸 콘솔 팔레트 + 통합 검증

**Files:**
- Modify (overwrite): `src/demos/alphalenz/multi-agent/Desktop.tsx`
- Modify (overwrite): `src/demos/alphalenz/multi-agent/Mobile.tsx`

**Interfaces:**
- Consumes: `CONSOLE`(Task 1), `FocusPanel`/`AgentGraph`(Task 2·3), 기존 데이터/`useAgents`.
- Produces: `export function Desktop`/`export function Mobile` 시그니처 불변.

- [ ] **Step 1: `Desktop.tsx` 전체 교체**

`src/demos/alphalenz/multi-agent/Desktop.tsx`의 **전체 내용**을 다음으로 덮어쓴다(레이아웃 그리드 `[1fr_440px]` 유지, 팔레트만 콘솔로):

```tsx
import { motion } from 'framer-motion';
import { Play, Loader2, ShieldCheck, Users, MessageCircleQuestion } from 'lucide-react';
import { FocusPanel } from './FocusPanel';
import type { DemoComponentProps } from '../../../registry/types';
import { TopBar } from '../_shared/Chrome';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { CountUp } from '../../../ui/CountUp';
import { cn } from '../../../lib/cn';
import { useAgents } from './state';
import { AgentGraph } from './AgentGraph';
import { QUESTION, STR, AGENT_COUNT, CONFIDENCE, INSIGHT, INSIGHT_VERDICT } from './data';

/** 사용자 질문 + 분석 시작 버튼 */
function QuestionBar() {
  const { phase, start } = useAgents();
  const lang = useLang();
  const running = phase !== 'idle';
  const done = phase === 'done';
  return (
    <div className="flex items-center gap-3 rounded-[4px] border px-4 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
      <MessageCircleQuestion className="h-4 w-4 shrink-0" style={{ color: CONSOLE.accent }} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>{pick(STR.question, lang)}</p>
        <p className="truncate text-[14px] font-medium" style={{ color: CONSOLE.text }}>{pick(QUESTION, lang)}</p>
      </div>
      <button
        data-demo-id="run-btn"
        onClick={() => start('orchestrate')}
        disabled={running}
        className={cn(
          'flex items-center gap-1.5 rounded-[4px] px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
          running ? 'text-zinc-500' : 'text-white',
        )}
        style={{ background: running ? 'rgba(255,255,255,0.05)' : CONSOLE.accent }}
      >
        {running && !done ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
        {running ? pick(done ? STR.done : STR.running, lang) : pick(STR.run, lang)}
      </button>
    </div>
  );
}

/** 병렬 에이전트 카운터 */
function CountBadge() {
  const { countActive } = useAgents();
  const lang = useLang();
  return (
    <div className="flex items-center gap-3 rounded-[4px] border px-4 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
      <div className="flex h-9 w-9 items-center justify-center rounded-[4px]" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
        <Users className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="font-mono text-[22px] font-semibold leading-none" style={{ color: CONSOLE.text }}>
          <CountUp value={AGENT_COUNT} play={countActive} duration={1.6} />
        </p>
        <p className="mt-0.5 text-[10.5px]" style={{ color: CONSOLE.textMicro }}>{pick(STR.agentsActive, lang)}</p>
      </div>
      <p className="ml-auto max-w-[180px] text-right text-[10.5px] leading-snug" style={{ color: CONSOLE.textMicro }}>
        {pick(STR.tagline, lang)}
      </p>
    </div>
  );
}

/** 최종 인사이트 카드 */
function InsightCard() {
  const { phase } = useAgents();
  const lang = useLang();
  if (phase !== 'done') return null;
  return (
    <motion.div
      data-demo-id="result-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[4px] border p-4"
      style={{ borderColor: CONSOLE.accentBorder, background: CONSOLE.accentFill }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-[3px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
          {pick(STR.insightTitle, lang)}
        </span>
        <span className="flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(94,156,131,0.15)', color: CONSOLE.done }}>
          <ShieldCheck className="h-3 w-3" /> {pick(STR.verified, lang)}
        </span>
        <span className="ml-auto text-[10.5px]" style={{ color: CONSOLE.textDim }}>
          {pick(STR.confidence, lang)}{' '}
          <span className="font-mono font-semibold" style={{ color: CONSOLE.accent }}>
            <CountUp value={CONFIDENCE} play duration={1} />%
          </span>
        </span>
      </div>
      <p className="text-[15px] font-semibold" style={{ color: CONSOLE.text }}>{pick(INSIGHT_VERDICT, lang)}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: CONSOLE.textDim }}>{pick(INSIGHT, lang)}</p>
    </motion.div>
  );
}

export function Desktop(_: DemoComponentProps) {
  return (
    <div className="flex h-full flex-col" style={{ background: CONSOLE.bg, color: CONSOLE.text }}>
      <TopBar activeTab={1} search={STR.search} />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_440px] gap-3 p-3">
        <div className="flex min-h-0 flex-col gap-3">
          <QuestionBar />
          <div className="min-h-0 flex-1">
            <AgentGraph />
          </div>
        </div>
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

- [ ] **Step 2: `Mobile.tsx` 전체 교체**

`src/demos/alphalenz/multi-agent/Mobile.tsx`의 **전체 내용**을 다음으로 덮어쓴다(구조·FocusPanel 위치 유지, 팔레트만 콘솔로):

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, ShieldCheck, Users, MessageCircleQuestion } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { MobileBar } from '../_shared/Chrome';
import { CONSOLE } from '../_shared/theme';
import { pick, useLang } from '../_shared/i18n';
import { CountUp } from '../../../ui/CountUp';
import { cn } from '../../../lib/cn';
import { useAgents } from './state';
import { AgentGraph } from './AgentGraph';
import { FocusPanel } from './FocusPanel';
import { QUESTION, STR, AGENT_COUNT, CONFIDENCE, INSIGHT, INSIGHT_VERDICT } from './data';

export function Mobile(_: DemoComponentProps) {
  const { phase, countActive, logs, start } = useAgents();
  const lang = useLang();
  const running = phase !== 'idle';
  const done = phase === 'done';

  return (
    <div className="flex h-full flex-col" style={{ background: CONSOLE.bg, color: CONSOLE.text }}>
      <MobileBar title={pick(STR.logTitle, lang)} />
      <div className="demo-scroll flex-1 space-y-3 overflow-y-auto p-3">
        {/* 질문 + 버튼 */}
        <div className="rounded-[4px] border px-3.5 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: CONSOLE.textMicro }}>
            <MessageCircleQuestion className="h-3.5 w-3.5" style={{ color: CONSOLE.accent }} /> {pick(STR.question, lang)}
          </p>
          <p className="mt-1 text-[14px] font-medium" style={{ color: CONSOLE.text }}>{pick(QUESTION, lang)}</p>
          <button
            data-demo-id="run-btn"
            onClick={() => start('parallel')}
            disabled={running}
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-1.5 rounded-[4px] py-2.5 text-[13px] font-semibold transition-colors',
              running ? 'text-zinc-500' : 'text-white',
            )}
            style={{ background: running ? 'rgba(255,255,255,0.05)' : CONSOLE.accent }}
          >
            {running && !done ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? pick(done ? STR.done : STR.running, lang) : pick(STR.run, lang)}
          </button>
        </div>

        {/* 카운터 */}
        <div className="flex items-center gap-3 rounded-[4px] border px-3.5 py-3" style={{ borderColor: CONSOLE.hair, background: CONSOLE.card }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px]" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-mono text-[20px] font-semibold leading-none" style={{ color: CONSOLE.text }}>
              <CountUp value={AGENT_COUNT} play={countActive} duration={1.6} />
            </p>
            <p className="mt-0.5 text-[10px]" style={{ color: CONSOLE.textMicro }}>{pick(STR.agentsActive, lang)}</p>
          </div>
          <p className="ml-auto max-w-[140px] text-right text-[10px] leading-snug" style={{ color: CONSOLE.textMicro }}>{pick(STR.tagline, lang)}</p>
        </div>

        {/* 그래프 (compact) */}
        <AgentGraph compact />

        {/* 포커스 패널 */}
        <FocusPanel className="min-h-[280px]" />

        {/* 인사이트 카드 */}
        {phase === 'done' && (
          <motion.div
            data-demo-id="result-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[4px] border p-3.5"
            style={{ borderColor: CONSOLE.accentBorder, background: CONSOLE.accentFill }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-[3px] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ background: CONSOLE.accentFill, color: CONSOLE.accent }}>
                {pick(STR.insightTitle, lang)}
              </span>
              <span className="flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(94,156,131,0.15)', color: CONSOLE.done }}>
                <ShieldCheck className="h-3 w-3" /> {pick(STR.verified, lang)}
              </span>
              <span className="ml-auto text-[10px]" style={{ color: CONSOLE.textDim }}>
                {pick(STR.confidence, lang)}{' '}
                <span className="font-mono font-semibold" style={{ color: CONSOLE.accent }}>
                  <CountUp value={CONFIDENCE} play duration={1} />%
                </span>
              </span>
            </div>
            <p className="text-[14px] font-semibold" style={{ color: CONSOLE.text }}>{pick(INSIGHT_VERDICT, lang)}</p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: CONSOLE.textDim }}>{pick(INSIGHT, lang)}</p>
          </motion.div>
        )}

        {/* 로그 */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {logs.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-start gap-2 text-[12px]"
                style={{ color: CONSOLE.textDim }}
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CONSOLE.accent }} />
                <span className="leading-snug">{line}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 전체 빌드**

Run: `npm run build`
Expected: `tsc --noEmit` 통과 + `vite build` 성공(에러 없음).

- [ ] **Step 4: 커밋**

```bash
git add src/demos/alphalenz/multi-agent/Desktop.tsx src/demos/alphalenz/multi-agent/Mobile.tsx
git commit -m "feat(multi-agent): 셸(Desktop/Mobile) 콘솔 팔레트 통일

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: dev 서버 시각 확인 — 컨트롤러가 수행(implementer는 스킵)**

`npm run dev` → 멀티 에이전트 데모. 확인:
1. 무지개·글로우·곡선·발광 입자가 화면에서 **사라졌는지**.
2. 톱다운 DAG: Orchestrator 카드 → 1px 직교 버스/드롭 → 그룹/서브 사각 카드. 라인이 활성 시 인디고로 밝아짐.
3. working: 카드 idle→running(상단 1px 프로그레스 + 인디고 점)→done(에메랄드 체크 + `lat Xs`). 그룹 `n/n` 집계.
4. 포커스: 활성 서브 카드 링+미세확대(1.04), 나머지 0.45 디밍(블러 없음).
5. verifying: 인접 그룹 열 사이 헤어라인 점멸. done: 합성 상태.
6. 포커스 패널·카운터·인사이트가 동일 콘솔 팔레트로 일관.
7. 언어 토글 ko/en, 모바일 세로 스택 정상.

---

## Self-Review

**1. Spec coverage:**
- 디자인 토큰(CONSOLE) + mutedTick/SUB_META → Task 1 ✓
- 섹션 1(레이아웃·div 커넥터) → Task 2 (VLine/HLine, orch drop/bus/group drop/spine) ✓
- 섹션 2(노드 카드·데이터 밀도) → Task 2 (Card: orch/group/sub, 상태 글리프, 모노 메타, `n/n`, `lat Xs`) ✓
- 섹션 3(절제 모션) → Task 2 (입자·리플·호흡·곡선 제거, 라인 밝아짐, 프로그레스, 포커스 링+1.04) ✓
- 섹션 4(교차검증·합성) → Task 2 (무지개 점선 제거, verifying 헤어라인 pulse, done 상태) ✓
- 섹션 5(포커스 패널 동일 팔레트) → Task 3 ✓
- 섹션 6(셸 배경) → Task 4 ✓

**2. Placeholder scan:** "TBD/적절히" 없음. 모든 코드 블록 실제 구현. ✓

**3. Type consistency:**
- `CONSOLE` 토큰 키(bg/panel/card/hair/line/accent/accentFill/accentBorder/done/down/text/textDim/textMicro)는 Task 1 정의 ↔ Task 2·3·4 사용 일치 ✓
- `mutedTick(hex: string): string` 정의(Task 1) ↔ AgentGraph·FocusPanel 호출(`mutedTick(g.color)`) ✓
- `SUB_META[\`${g.id}:${i}\`]?.latencyMs` — 옵셔널 접근, 16키 전부 정의 ✓
- `WorkerStatus`/`Phase`/`focus` 등 state 타입 불변, 시그니처 유지 ✓
- `ORCH_SUB: Record<Phase, L>` — Phase 5개 키 전부 정의 ✓

**참고:** `lat`는 콘솔 인스트루먼트 단위 토큰으로 양 언어 공통 표기(모노). `STANDBY`/`ROUTING` 등 영문 대문자는 `en` 값이며 `ko`는 한글 단어로 분리해 i18n 제약 충족.
