# 갱신 결과 보고서 — 줌인 + 액션 캡션(spotlight caption) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `renewal-report` 데모의 4개 핵심 순간에 카메라 줌인과 동기화된 한 줄 "AI 액션 캡션"을 띄워, 영상 시청자가 무슨 액션이 일어났는지 즉시 알 수 있게 한다.

**Architecture:** 기존 spotlight(카메라 줌) 인프라에 의미 레이어(캡션)를 더한다. 시나리오 step의 `zoom: true`에 옵셔널 `caption`을 동반시키면, 러너가 재생 스토어에 캡션 텍스트를 싣고, Stage 레벨(카메라 변환 밖)의 신규 `SpotlightCaption` 오버레이가 줌 대상에 적응형으로 앵커해 표시한다.

**Tech Stack:** React + TypeScript, zustand(재생 스토어), framer-motion(애니메이션), Tailwind, Vite. 테스트 러너 없음 — 검증은 `npx tsc --noEmit`(타입) + dev 서버 육안 확인.

## Global Constraints

- 검증 게이트: `npx tsc --noEmit -p tsconfig.json` 통과(에러 0). 테스트 프레임워크 없음.
- 캡션 카피는 정확히 다음 값(ko/en)을 사용한다:
  - generate: `흩어진 근거 자료 5건 → 단일 보고서 초안 자동 생성` / `5 scattered sources → one report draft, auto-generated`
  - structure: `손해율·프로그램 구조·패널 등급까지 자동 구조화` / `Loss ratios, program structure, panel ratings — auto-structured`
  - intent: `수신자별 목적·맥락·톤 — AI가 전달 의도 분석` / `Per-recipient purpose, context & tone — AI infers the intent`
  - email: `맥락 맞춤 이메일 초안 + 보고서 첨부 자동 구성` / `Context-fit email draft + report attached, automatically`
- 언어(ko/en)는 `getLang()`(`src/demos/aria/_shared/i18n.ts`)로 비리액티브 조회, 캡션은 `StepText`의 `() => string` 형태로 지연 평가.
- 캡션은 줌(`zoom: true`)과만 함께 표시된다. `caption`은 옵셔널 — 기존 줌 동작에 영향 없음.
- `spotlightEnabled`가 false면 줌과 캡션 모두 비표시.
- 커밋 메시지 마지막 줄: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. 커밋 시 `--no-gpg-sign` 사용(이 저장소 관행).

## File Structure

- `src/engine/types.ts` (수정) — `cursor`/`click` step에 `caption?: StepText` 추가.
- `src/engine/playbackStore.ts` (수정) — `spotlightCaption` 상태 + `setSpotlight(id, caption?)` 시그니처 확장.
- `src/engine/run.ts` (수정) — `moveCursorTo`에 `caption` 인자 전달, `cursor`/`click`에서 `step.caption` 사용.
- `src/shell/SpotlightCaption.tsx` (신규) — 줌 대상에 적응형 앵커되는 캡션 오버레이.
- `src/shell/Stage.tsx` (수정) — `SpotlightCaption`을 `FakeCursor` 옆에 렌더.
- `src/demos/aria/renewal-report/data.ts` (수정) — `SPOTLIGHT` 카피 상수.
- `src/demos/aria/renewal-report/scenario.ts` (수정) — 4개 비트에 `zoom`+`caption` 부여.

---

### Task 1: Step 타입에 `caption` 추가 + 재생 스토어 캡션 상태

**Files:**
- Modify: `src/engine/types.ts` (cursor/click step 유니온)
- Modify: `src/engine/playbackStore.ts`

**Interfaces:**
- Produces:
  - `Step`의 `cursor`/`click` 변형에 `caption?: StepText`.
  - 스토어: `spotlightCaption: string | null`, `setSpotlight: (id: string | null, caption?: string | null) => void`.

- [ ] **Step 1: `types.ts`의 cursor/click step에 `caption` 추가**

`src/engine/types.ts`에서 두 줄을 교체:

```ts
  /** data-demo-id 요소로 가짜 커서 이동. zoom:true면 카메라가 이 대상으로 줌인(핵심 강조). caption은 zoom 시 함께 표시할 액션 라벨. */
  | { kind: 'cursor'; target: string; ms?: number; zoom?: boolean; caption?: StepText }
  /** 커서 이동 + 클릭 펄스 + store action 실행. zoom:true면 줌인. caption은 zoom 시 함께 표시할 액션 라벨. */
  | { kind: 'click'; target: string; run?: () => void; zoom?: boolean; caption?: StepText }
```

- [ ] **Step 2: `playbackStore.ts`에 캡션 상태 추가**

`PlaybackState` 인터페이스에서 spotlight 관련 블록을 교체:

```ts
  /** 현재 강조 중인 data-demo-id (없으면 null) */
  spotlightId: string | null;
  /** 현재 표시할 액션 캡션 (없으면 null) */
  spotlightCaption: string | null;
  /** 인터랙션 강조 토글. 기본 켬 */
  spotlightEnabled: boolean;
  setSpotlight: (id: string | null, caption?: string | null) => void;
  toggleSpotlight: () => void;
```

스토어 구현부에서 spotlight 초기값/세터를 교체:

```ts
  spotlightId: null,
  spotlightCaption: null,
  spotlightEnabled: true,
  setSpotlight: (spotlightId, spotlightCaption = null) => set({ spotlightId, spotlightCaption }),
  toggleSpotlight: () => set((s) => ({ spotlightEnabled: !s.spotlightEnabled })),
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS (에러 0). `setSpotlight` 호출부(`run.ts`)는 인자 1개라도 caption 기본값 `null`이라 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/engine/types.ts src/engine/playbackStore.ts
git commit --no-gpg-sign -m "$(cat <<'EOF'
feat(engine): spotlight step에 caption 필드 + 재생 스토어 캡션 상태

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 러너가 캡션을 스토어에 싣도록 연결

**Files:**
- Modify: `src/engine/run.ts`

**Interfaces:**
- Consumes: Task 1의 `setSpotlight(id, caption?)`, `Step.caption`.
- Produces: 동작 변경만 — `cursor`/`click` 줌 시 캡션이 스토어에 반영됨.

- [ ] **Step 1: `moveCursorTo`에 caption 인자 추가**

`src/engine/run.ts`의 `moveCursorTo` 시그니처와 spotlight 설정부를 교체. 기존:

```ts
async function moveCursorTo(target: string, signal: AbortSignal, ms = 650, zoom = false) {
```
→
```ts
async function moveCursorTo(target: string, signal: AbortSignal, ms = 650, zoom = false, caption?: StepText) {
```

그리고 함수 내부의 `setSpotlight(zoom ? target : null);` 줄을 교체:

```ts
  const { setCursor, setSpotlight } = usePlaybackStore.getState();
  setCursor({ x: point.x, y: point.y, visible: true });
  setSpotlight(zoom ? target : null, zoom && caption ? resolveText(caption) : null);
```

(`resolveText`는 이미 이 파일 상단에 정의되어 있음.)

- [ ] **Step 2: `cursor`/`click` 케이스에서 `step.caption` 전달**

`runScenario`의 switch에서 두 케이스를 교체:

```ts
      case 'cursor':
        await moveCursorTo(step.target, signal, step.ms, step.zoom, step.caption);
        break;
      case 'click':
        await moveCursorTo(step.target, signal, 650, step.zoom, step.caption);
        await clickPulse(signal);
        if (signal.aborted) return;
        step.run?.();
        break;
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS. `stream`/`scroll` 케이스의 `setSpotlight(null)`은 caption 기본값 `null`이라 캡션도 함께 해제됨(의도된 동작).

- [ ] **Step 4: 커밋**

```bash
git add src/engine/run.ts
git commit --no-gpg-sign -m "$(cat <<'EOF'
feat(engine): 러너가 zoom step의 caption을 spotlight 캡션으로 반영

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `SpotlightCaption` 오버레이 컴포넌트

**Files:**
- Create: `src/shell/SpotlightCaption.tsx`

**Interfaces:**
- Consumes: `usePlaybackStore`(`spotlightId`, `spotlightCaption`, `spotlightEnabled`), `CAMERA_LAYER_ATTR`(`src/lib/cameraGeom.ts`), `Sparkles`(lucide-react), `motion`/`AnimatePresence`(framer-motion).
- Produces: `export function SpotlightCaption(): JSX.Element` — props 없음.

**적응형 배치 규칙(스펙):** 줌 반영된 대상 박스(`el.getBoundingClientRect()`) 기준, 프레임 경계는 카메라 레이어 부모 rect. 가로는 대상 중심 정렬 후 프레임 안 클램프, 세로는 아래 우선 → 공간 부족 시 위로 플립 → 둘 다 불가 시 프레임 하단 핀. 카메라 변환 밖(Stage 레벨)에서 렌더해 항상 같은 크기.

- [ ] **Step 1: 컴포넌트 작성**

`src/shell/SpotlightCaption.tsx` 신규 생성:

```tsx
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePlaybackStore } from '../engine/playbackStore';
import { CAMERA_LAYER_ATTR } from '../lib/cameraGeom';

const GAP = 12; // 대상과 캡션 사이 간격(px)
const PAD = 12; // 프레임 안쪽 여백(px)
const EST_H = 40; // 캡션 추정 높이(배치 판단용, px)

interface Pos {
  left: number;
  top: number;
}

/**
 * 줌 대상에 적응형으로 앵커되는 액션 캡션 오버레이.
 * 카메라 변환 밖(Stage 레벨)에서 렌더되어 줌 배율과 무관하게 항상 같은 크기로 보인다.
 * rAF로 대상의 현재 화면 박스를 추종하며, 대상/프레임/인접 영역을 최소 침범하도록
 * 아래 우선 → 위로 플립 → 프레임 하단 핀 순으로 위치를 정한다.
 */
export function SpotlightCaption() {
  const id = usePlaybackStore((s) => s.spotlightId);
  const caption = usePlaybackStore((s) => s.spotlightCaption);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);

  const active = enabled && !!id && !!caption;

  useEffect(() => {
    if (!active || !id) {
      setPos(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = document.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
      const layer = el?.closest<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`);
      const frame = layer?.parentElement;
      if (!el || !frame) return;
      const r = el.getBoundingClientRect(); // 줌 반영된 화면 박스
      const f = frame.getBoundingClientRect();
      const w = boxRef.current?.offsetWidth ?? 0;
      const h = boxRef.current?.offsetHeight ?? EST_H;

      // 세로: 아래 우선 → 위로 플립 → 프레임 하단 핀
      let top = r.bottom + GAP;
      if (top + h + PAD > f.bottom) {
        const above = r.top - GAP - h;
        top = above >= f.top + PAD ? above : f.bottom - h - PAD;
      }
      // 가로: 대상 중심 정렬 후 프레임 안 클램프
      let left = r.left + r.width / 2 - w / 2;
      left = Math.max(f.left + PAD, Math.min(left, f.right - w - PAD));

      setPos({ left, top });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, id]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          ref={boxRef}
          className="pointer-events-none fixed z-[90] max-w-[80%]"
          style={{ left: pos?.left ?? 0, top: pos?.top ?? 0 }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: pos ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="flex items-center gap-2 rounded-full border border-brass-500/30 bg-ink-950/80 px-3.5 py-2 text-[12.5px] font-medium text-zinc-100 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-brass-300" />
            {caption}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS. (아직 미사용 컴포넌트지만 export라 unused 에러 없음.)

- [ ] **Step 3: 커밋**

```bash
git add src/shell/SpotlightCaption.tsx
git commit --no-gpg-sign -m "$(cat <<'EOF'
feat(shell): 줌 대상 적응형 앵커 SpotlightCaption 오버레이

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Stage에 캡션 오버레이 마운트

**Files:**
- Modify: `src/shell/Stage.tsx`

**Interfaces:**
- Consumes: Task 3의 `SpotlightCaption`.
- Produces: 데모 재생 중 캡션이 화면에 렌더됨.

- [ ] **Step 1: import 추가**

`src/shell/Stage.tsx`의 import 블록에 추가(`FakeCursor` import 부근):

```ts
import { SpotlightCaption } from './SpotlightCaption';
```

- [ ] **Step 2: `FakeCursor` 옆에 렌더**

`Stage` 반환부 끝의 `<FakeCursor />`를 다음으로 교체:

```tsx
      <FakeCursor />
      <SpotlightCaption />
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS.

- [ ] **Step 4: 커밋**

```bash
git add src/shell/Stage.tsx
git commit --no-gpg-sign -m "$(cat <<'EOF'
feat(shell): Stage에 SpotlightCaption 마운트

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 캡션 카피 상수 + 시나리오 4개 비트 연결

**Files:**
- Modify: `src/demos/aria/renewal-report/data.ts`
- Modify: `src/demos/aria/renewal-report/scenario.ts`

**Interfaces:**
- Consumes: `pick`/`getLang`(`src/demos/aria/_shared/i18n.ts`), `L` 타입.
- Produces: `export const SPOTLIGHT` (data.ts). 시나리오 4개 비트에 `zoom`+`caption`.

- [ ] **Step 1: `data.ts`에 `SPOTLIGHT` 상수 추가**

`src/demos/aria/renewal-report/data.ts` 맨 끝(파일 마지막 `}` 뒤, 새 줄)에 추가:

```ts
// ---------------------------------------------------------------------------
// 데모 영상 — 핵심 소구점 줌인 캡션 (4개 비트)
// ---------------------------------------------------------------------------

export const SPOTLIGHT = {
  generate: {
    ko: '흩어진 근거 자료 5건 → 단일 보고서 초안 자동 생성',
    en: '5 scattered sources → one report draft, auto-generated',
  },
  structure: {
    ko: '손해율·프로그램 구조·패널 등급까지 자동 구조화',
    en: 'Loss ratios, program structure, panel ratings — auto-structured',
  },
  intent: {
    ko: '수신자별 목적·맥락·톤 — AI가 전달 의도 분석',
    en: 'Per-recipient purpose, context & tone — AI infers the intent',
  },
  email: {
    ko: '맥락 맞춤 이메일 초안 + 보고서 첨부 자동 구성',
    en: 'Context-fit email draft + report attached, automatically',
  },
} satisfies Record<string, L>;
```

- [ ] **Step 2: `scenario.ts` import 교체**

`src/demos/aria/renewal-report/scenario.ts` 상단 import를 교체:

```ts
import type { Scenario } from '../../../engine/types';
import { getLang, pick } from '../_shared/i18n';
import { useRenewalReport } from './state';
import { SPOTLIGHT } from './data';

const st = () => useRenewalReport.getState();
```

- [ ] **Step 3: 비트 1 — `generate-btn` 클릭에 zoom+caption**

`generate-btn` click step을 교체:

```ts
    // 보고서 생성
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    {
      kind: 'click',
      target: 'generate-btn',
      run: () => st().generate(),
      zoom: true,
      caption: () => pick(SPOTLIGHT.generate, getLang()),
    },
    { kind: 'wait', ms: 5200 }, // 분석 + 섹션 8개 스트리밍
```

- [ ] **Step 4: 비트 2 — 구조 섹션 스크롤 직후 zoom+caption cursor 추가**

구조 섹션 스크롤+wait 블록을 교체(스크롤 후 `cursor` step 추가):

```ts
    { kind: 'scroll', target: 'report-panel', toId: 'section-structure', ms: 1100 },
    {
      kind: 'cursor',
      target: 'section-structure',
      ms: 700,
      zoom: true,
      caption: () => pick(SPOTLIGHT.structure, getLang()),
    },
    { kind: 'wait', ms: 1500 }, // 프로그램 구조도
```

- [ ] **Step 5: 비트 3 — `analysis-card` cursor에 zoom+caption**

`analysis-card` cursor step을 교체:

```ts
    { kind: 'cursor', target: 'analysis-card', ms: 700, zoom: true, caption: () => pick(SPOTLIGHT.intent, getLang()) },
    { kind: 'wait', ms: 1200 },
```

- [ ] **Step 6: 비트 4 — `attachment-chip` cursor에 zoom+caption**

`attachment-chip` cursor step을 교체:

```ts
    { kind: 'cursor', target: 'attachment-chip', ms: 700, zoom: true, caption: () => pick(SPOTLIGHT.email, getLang()) },
    { kind: 'wait', ms: 1600 },
```

- [ ] **Step 7: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS.

- [ ] **Step 8: 커밋**

```bash
git add src/demos/aria/renewal-report/data.ts src/demos/aria/renewal-report/scenario.ts
git commit --no-gpg-sign -m "$(cat <<'EOF'
feat(renewal-report): 4개 핵심 소구점에 줌인+액션 캡션 부여

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 육안 검증

**Files:** 없음(실행 검증만).

- [ ] **Step 1: dev 서버 확인**

dev 서버가 떠 있지 않으면 `npm run dev`. 브라우저에서 갤러리 → ARIA → `갱신 결과 보고서 + 전달 이메일` 데모 열기.

- [ ] **Step 2: 재생 후 4개 비트 확인**

재생(Space)하고 다음을 확인:
- 비트 1: 보고서 생성 클릭 시 버튼으로 줌인 + "흩어진 근거 자료 5건 → …" 캡션.
- 비트 2: 프로그램 구조 카드로 줌인 + "손해율·프로그램 구조·…" 캡션.
- 비트 3: 의도 분석 카드로 줌인 + "수신자별 목적·맥락·톤 …" 캡션.
- 비트 4: 첨부 칩으로 줌인 + "맥락 맞춤 이메일 초안 …" 캡션.
- 각 캡션이 **강조 요소 자신·프레임 밖·인접 콘텐츠를 가리지 않는지** 확인.
- 캡션이 다음 스크롤/스트리밍/줌 해제 시 사라지는지 확인.

- [ ] **Step 3: 언어 토글 확인**

컨트롤 바/헤더에서 ko↔en 전환 후 재생 → 캡션 텍스트가 해당 언어로 표시되는지 확인.

- [ ] **Step 4: spotlight 토글 확인**

spotlight(줌) 토글 OFF → 재생 시 줌과 캡션 모두 안 뜨는지 확인.

- [ ] **Step 5: 빌드 타입체크 최종 확인**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS (에러 0).

---

## Self-Review

**1. Spec coverage:**
- Step API 확장 → Task 1. 재생 스토어 → Task 1. 러너 → Task 2. 캡션 오버레이(적응형 배치) → Task 3. Stage 마운트 → Task 4. 카피 상수 → Task 5. 시나리오 4개 비트 → Task 5. 검증(타입/육안/언어/토글) → Task 6. 모든 스펙 섹션이 태스크에 매핑됨.

**2. Placeholder scan:** 모든 코드 step에 실제 코드 포함. "TBD/TODO/적절히 처리" 없음.

**3. Type consistency:**
- `setSpotlight(id, caption?)` — Task 1 정의, Task 2에서 동일 시그니처로 호출.
- `spotlightCaption: string | null` — Task 1 정의, Task 3에서 동일 이름 구독.
- `caption?: StepText` — Task 1 정의, Task 2에서 `resolveText(caption)`로 평가, Task 5에서 `() => pick(SPOTLIGHT.x, getLang())` 형태로 주입(StepText의 함수 변형과 일치).
- `CAMERA_LAYER_ATTR` — `cameraGeom.ts` export, Task 3에서 동일 사용.
