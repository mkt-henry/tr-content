# 데모 인트로/아웃트로 (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Treazer 브랜드 인트로/아웃트로를 제작하고, "인트로/아웃트로 포함" 토글이 켜지면 Play 시 인트로 → 데모 → 아웃트로가 끊김없이 자동 재생되게 한다.

**Architecture:** 브랜딩은 프로젝트별 자산이므로 `src/branding/` 레지스트리(projectId → {Intro, Outro, introMs, outroMs})로 분리한다. Treazer 인트로/아웃트로는 framer-motion 컴포넌트(`treazer/_shared/branding.tsx`). `BrandOverlay`가 풀스테이지로 phase 컴포넌트를 렌더하고 타이머/클릭으로 `onDone`. Stage가 시퀀스를 오케스트레이션(`await phase('intro') → await play(...) → await phase('outro')`)하고, ControlBar에 토글을 노출한다.

**Tech Stack:** React 18 + TS, zustand, framer-motion, Tailwind v4, lucide-react. 테스트 러너 없음 → 검증은 `npm run build`(tsc --noEmit) + 시각 확인(기존 데모 컨벤션).

**검증 방식:** 각 태스크는 `npx tsc --noEmit` 통과 확인 후 커밋. 마지막 태스크에서 dev 서버로 전체 흐름 시각 확인. 단위 테스트는 작성하지 않는다.

---

### Task 1: shellStore — includeBranding 토글 상태

**Files:**
- Modify: `src/store/shellStore.ts`

- [ ] **Step 1: 인터페이스에 필드/액션 추가**

`ShellState` 인터페이스의 `toggleBrowserChrome: () => void;` 다음 줄에 추가:

```ts
  /** 인트로/아웃트로 포함 여부 (브랜딩 정의된 프로젝트에서만 의미) */
  includeBranding: boolean;
  toggleBranding: () => void;
```

- [ ] **Step 2: 초기값/구현 추가**

`create<ShellState>` 객체에서 `browserChrome: true,` 다음 줄에 초기값 추가:

```ts
  includeBranding: false,
```

그리고 `toggleBrowserChrome: ...` 구현 다음 줄에 추가:

```ts
  toggleBranding: () => set((s) => ({ includeBranding: !s.includeBranding })),
```

- [ ] **Step 3: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

- [ ] **Step 4: Commit**

```bash
git add src/store/shellStore.ts
git commit -m "feat(shell): includeBranding 토글 상태 추가"
```

---

### Task 2: 브랜딩 레지스트리 (타입 + 매핑)

**Files:**
- Create: `src/branding/types.ts`
- Create: `src/branding/index.ts`

Treazer 컴포넌트는 Task 3에서 만든다. 이 태스크는 타입과 레지스트리 골격만 — 단, `index.ts`가 Task 3의 `treazerBranding`을 import하므로, Task 3 완료 전에는 빌드가 깨진다. 따라서 **이 태스크의 빌드 검증은 Task 3와 함께** 한다(아래 Step 3 참고).

- [ ] **Step 1: 타입 파일 생성**

`src/branding/types.ts`:

```ts
import type { ComponentType } from 'react';

/** 프로젝트별 영상 브랜딩 — 데모 앞뒤에 붙는 인트로/아웃트로 시퀀스 */
export interface ProjectBranding {
  /** 인트로 풀스테이지 컴포넌트 */
  Intro: ComponentType;
  /** 아웃트로 풀스테이지 컴포넌트 */
  Outro: ComponentType;
  /** 인트로 재생 시간(ms) — BrandOverlay 타이머 */
  introMs: number;
  /** 아웃트로 재생 시간(ms) */
  outroMs: number;
}
```

- [ ] **Step 2: 레지스트리 생성**

`src/branding/index.ts`:

```ts
import type { ProjectBranding } from './types';
import { treazerBranding } from '../demos/treazer/_shared/branding';

/** projectId → 브랜딩. 새 서비스는 여기에 한 줄 추가 + 자기 branding 컴포넌트만 만들면 된다. */
const BRANDING: Record<string, ProjectBranding> = {
  treazer: treazerBranding,
};

/** 프로젝트의 인트로/아웃트로 브랜딩 (없으면 undefined → 토글 미노출) */
export function getBranding(projectId: string | undefined): ProjectBranding | undefined {
  return projectId ? BRANDING[projectId] : undefined;
}

export type { ProjectBranding };
```

- [ ] **Step 3: 빌드 검증은 Task 3에서**

이 시점엔 `treazer/_shared/branding`가 없어 `tsc`가 실패한다(정상). Task 3 완료 후 함께 검증한다. 지금은 커밋만 분리해 둔다.

- [ ] **Step 4: Commit**

```bash
git add src/branding/types.ts src/branding/index.ts
git commit -m "feat(branding): 프로젝트별 브랜딩 레지스트리 골격"
```

---

### Task 3: Treazer 인트로/아웃트로 컴포넌트

**Files:**
- Create: `src/demos/treazer/_shared/branding.tsx`

워드마크는 `ui.tsx`의 `Wordmark`가 기본 `text-zinc-900`(다크 배경에서 안 보임)이므로, 다크 배경용으로 흰색 텍스트를 직접 렌더한다. `Coin`과 `TZ_BACKGROUND`는 재사용한다.

- [ ] **Step 1: 컴포넌트 파일 생성**

`src/demos/treazer/_shared/branding.tsx`:

```tsx
import { motion } from 'framer-motion';
import type { ProjectBranding } from '../../../branding/types';
import { Coin, TZ_BACKGROUND } from './ui';

/** 다크 배경용 Treazer 워드마크 (ui.tsx Wordmark는 다크 텍스트라 별도) */
function DarkWordmark({ className }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight text-white ${className ?? ''}`}>
      Treazer<span className="text-orange-500">.</span>
    </span>
  );
}

/** 우상향 금 시세 라인 path (인트로/아웃트로 공용 모양) */
const LINE_D = 'M0 158 L60 135 L110 142 L160 98 L210 106 L260 60 L320 22';

/** 인트로(~2.5s): 시세 라인 → 코인 → 워드마크 → 태그라인 */
function TreazerIntro() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 180" preserveAspectRatio="none">
        <motion.path
          d={LINE_D}
          fill="none"
          stroke="#f97316"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.95, type: 'spring', stiffness: 220, damping: 14 }}
        >
          <Coin className="h-14 w-14 text-[28px]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.5 }}
          className="mt-4"
        >
          <DarkWordmark className="text-[40px]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.75, duration: 0.5 }}
          className="mt-2 text-[13px] font-medium tracking-[0.15em] text-amber-300/80"
        >
          LEARN &amp; EARN GOLD
        </motion.p>
      </div>
    </div>
  );
}

/** 아웃트로(~3s): 시세 라인 배경 + 코인·로고·태그 + treazer.app CTA */
function TreazerOutro() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
    >
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 320 180" preserveAspectRatio="none">
        <motion.path
          d={LINE_D}
          fill="none"
          stroke="#f97316"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
        />
      </svg>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <Coin className="h-16 w-16 text-[32px]" />
        <div className="mt-4">
          <DarkWordmark className="text-[44px]" />
        </div>
        <p className="mt-2 text-[13px] font-medium tracking-[0.15em] text-amber-300/80">LEARN &amp; EARN GOLD</p>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-5 rounded-full bg-orange-500 px-5 py-2 text-[14px] font-bold text-white"
        >
          treazer.app
        </motion.span>
      </motion.div>
    </div>
  );
}

export const treazerBranding: ProjectBranding = {
  Intro: TreazerIntro,
  Outro: TreazerOutro,
  introMs: 2500,
  outroMs: 3000,
};
```

- [ ] **Step 2: 타입 통과 확인 (Task 2 포함)**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0). 이제 `branding/index.ts`의 import가 해소된다.

- [ ] **Step 3: Commit**

```bash
git add src/demos/treazer/_shared/branding.tsx
git commit -m "feat(branding): Treazer 인트로/아웃트로 컴포넌트 + treazerBranding"
```

---

### Task 4: BrandOverlay — 풀스테이지 오버레이

**Files:**
- Create: `src/shell/BrandOverlay.tsx`

- [ ] **Step 1: 컴포넌트 생성**

`src/shell/BrandOverlay.tsx`:

```tsx
import { useCallback, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';

/**
 * 풀스테이지 브랜딩 오버레이. 주어진 phase 컴포넌트를 렌더하고
 * durationMs 타이머 만료 또는 클릭 시 onDone을 정확히 1회 호출한다.
 * z-40 — ControlBar(z-50)보다 아래라 재생 중에도 컨트롤은 클릭 가능.
 */
export function BrandOverlay({
  Phase,
  durationMs,
  onDone,
}: {
  Phase: ComponentType;
  durationMs: number;
  onDone: () => void;
}) {
  const fired = useRef(false);
  const fire = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(fire, durationMs);
    return () => clearTimeout(t);
  }, [fire, durationMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={fire}
      className="absolute inset-0 z-40 cursor-pointer"
    >
      <Phase />
    </motion.div>
  );
}
```

- [ ] **Step 2: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

- [ ] **Step 3: Commit**

```bash
git add src/shell/BrandOverlay.tsx
git commit -m "feat(shell): BrandOverlay — 풀스테이지 인트로/아웃트로 오버레이"
```

---

### Task 5: ControlBar — 인트로/아웃트로 토글 버튼

**Files:**
- Modify: `src/shell/ControlBar.tsx`

- [ ] **Step 1: import 추가**

상단 lucide import에 `Clapperboard`를 추가(기존 import 객체에 병합):

```tsx
import {
  ArrowLeft,
  Clapperboard,
  Frame,
  Maximize,
  Monitor,
  Play,
  RotateCcw,
  Smartphone,
  PanelTop,
  Square,
} from 'lucide-react';
```

그리고 registry import에 `getBranding`을 추가:

```tsx
import { getProjectIdOfFeature, getProject } from '../registry';
import { getBranding } from '../branding';
```

- [ ] **Step 2: 토글 상태 구독**

`const playing = status === 'playing';` 다음 줄에 추가:

```tsx
  const includeBranding = useShellStore((s) => s.includeBranding);
  const toggleBranding = useShellStore((s) => s.toggleBranding);
  const hasBranding = !!getBranding(projectId);
```

(주의: `projectId`는 이미 `const projectId = getProjectIdOfFeature(feature.id);`로 아래에 선언돼 있다. 이 두 줄은 `projectId` 선언 **다음**에 와야 하므로, 실제로는 `const lang = ...` 줄 다음에 배치하라.)

정확한 배치 — 기존:
```tsx
  const projectId = getProjectIdOfFeature(feature.id);
  const languages = projectId ? getProject(projectId)?.languages : undefined;
  const lang = projectId ? (projectLang[projectId] ?? languages?.[0]?.id) : undefined;
```
이 블록 바로 다음에 추가:
```tsx
  const includeBranding = useShellStore((s) => s.includeBranding);
  const toggleBranding = useShellStore((s) => s.toggleBranding);
  const hasBranding = !!getBranding(projectId);
```

- [ ] **Step 3: 토글 버튼 렌더**

리셋 버튼(`<BarButton onClick={onReset} label="리셋 (R)">...</BarButton>`) 다음에 토글 버튼 블록을 추가:

```tsx
        <BarButton onClick={onReset} label="리셋 (R)">
          <RotateCcw className="h-4 w-4" />
        </BarButton>

        {hasBranding && (
          <BarButton onClick={toggleBranding} label="인트로/아웃트로" active={includeBranding}>
            <Clapperboard className="h-4 w-4" />
          </BarButton>
        )}
```

- [ ] **Step 4: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

- [ ] **Step 5: Commit**

```bash
git add src/shell/ControlBar.tsx
git commit -m "feat(shell): ControlBar 인트로/아웃트로 토글 (브랜딩 프로젝트만)"
```

---

### Task 6: Stage — 시퀀스 오케스트레이션 + 오버레이 렌더

**Files:**
- Modify: `src/shell/Stage.tsx`

- [ ] **Step 1: import 보강**

상단 import 수정:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
```

그리고 registry/branding/overlay import 추가(기존 import 블록 부근):

```tsx
import { getProjectIdOfFeature } from '../registry';
import { getBranding } from '../branding';
import { BrandOverlay } from './BrandOverlay';
```

- [ ] **Step 2: 시퀀스 상태/헬퍼 추가**

`export function Stage(...)` 본문에서 기존 `const { play, stop } = usePlayback();` 다음에 추가:

```tsx
  const includeBranding = useShellStore((s) => s.includeBranding);
  const projectId = getProjectIdOfFeature(feature.id);
  const branding = getBranding(projectId);

  // 인트로/아웃트로 시퀀스 상태
  const [seqPhase, setSeqPhase] = useState<'intro' | 'outro' | null>(null);
  const phaseResolve = useRef<(() => void) | null>(null);
  const runningRef = useRef(false);

  /** seqPhase를 설정하고 BrandOverlay onDone에서 resolve되는 Promise */
  const phase = useCallback(
    (p: 'intro' | 'outro') =>
      new Promise<void>((resolve) => {
        phaseResolve.current = resolve;
        setSeqPhase(p);
      }),
    [],
  );

  const onPhaseDone = useCallback(() => {
    setSeqPhase(null);
    const r = phaseResolve.current;
    phaseResolve.current = null;
    r?.();
  }, []);

  /** 진행 중 시퀀스 취소 — pending phase resolver 정리 + 오버레이 제거 */
  const cancelSequence = useCallback(() => {
    runningRef.current = false;
    if (phaseResolve.current) {
      const r = phaseResolve.current;
      phaseResolve.current = null;
      r();
    }
    setSeqPhase(null);
  }, []);
```

- [ ] **Step 3: handlePlay / handleReset 교체 + handleStop 추가**

기존:
```tsx
  const handlePlay = useCallback(() => {
    void play(variant.scenario, feature.resetState);
  }, [play, variant, feature]);

  const handleReset = useCallback(() => {
    stop();
    feature.resetState();
  }, [stop, feature]);
```

아래로 교체:
```tsx
  const handlePlay = useCallback(async () => {
    if (runningRef.current) return; // 시퀀스 진행 중 재진입 방지
    runningRef.current = true;
    const useBranding = includeBranding && !!branding;
    try {
      if (useBranding && branding) {
        await phase('intro');
        if (!runningRef.current) return; // 중단됨
      }
      await play(variant.scenario, feature.resetState);
      if (!runningRef.current) return; // 데모 중 중단됨
      if (useBranding && branding) {
        await phase('outro');
      }
    } finally {
      runningRef.current = false;
    }
  }, [play, variant, feature, includeBranding, branding, phase]);

  const handleStop = useCallback(() => {
    cancelSequence();
    stop();
  }, [cancelSequence, stop]);

  const handleReset = useCallback(() => {
    cancelSequence();
    stop();
    feature.resetState();
  }, [cancelSequence, stop, feature]);
```

- [ ] **Step 4: 전환 시 리셋 effect에 cancelSequence 반영**

기존:
```tsx
  useEffect(() => {
    stop();
    feature.resetState();
  }, [variant.id, device, langKey, stop, feature]);
```

아래로 교체:
```tsx
  useEffect(() => {
    cancelSequence();
    stop();
    feature.resetState();
  }, [variant.id, device, langKey, cancelSequence, stop, feature]);
```

- [ ] **Step 5: 키보드 Space → 시퀀스 인지 토글**

기존 Space case:
```tsx
        case ' ':
          e.preventDefault();
          if (usePlaybackStore.getState().status === 'playing') stop();
          else handlePlay();
          break;
```

아래로 교체:
```tsx
        case ' ':
          e.preventDefault();
          if (runningRef.current || usePlaybackStore.getState().status === 'playing') handleStop();
          else handlePlay();
          break;
```

(같은 effect의 deps 배열 `[handlePlay, handleReset, stop]`를 `[handlePlay, handleReset, handleStop]`로 교체.)

- [ ] **Step 6: ControlBar onStop을 handleStop으로 + 오버레이 렌더**

ControlBar에 넘기는 `onStop={stop}`을 `onStop={handleStop}`으로 교체:

```tsx
      <ControlBar
        feature={feature}
        variant={variant}
        status={status}
        onPlay={handlePlay}
        onStop={handleStop}
        onReset={handleReset}
        onFullscreen={() => stageRef.current && toggleFullscreen(stageRef.current)}
      />
```

그리고 `<FakeCursor />` 바로 위(루트 div 안)에 오버레이 렌더 추가:

```tsx
      <AnimatePresence>
        {seqPhase && branding && (
          <BrandOverlay
            key={seqPhase}
            Phase={seqPhase === 'intro' ? branding.Intro : branding.Outro}
            durationMs={seqPhase === 'intro' ? branding.introMs : branding.outroMs}
            onDone={onPhaseDone}
          />
        )}
      </AnimatePresence>

      <FakeCursor />
```

- [ ] **Step 7: 타입 통과 + 전체 빌드**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

Run: `npm run build`
Expected: vite 빌드 성공(`✓ built`).

- [ ] **Step 8: 시각 확인 (dev 서버)**

`npm run dev` 후 Treazer → "포인트가 아니라 진짜 금" 진입. 다음을 확인:
- 컨트롤 바에 클래퍼보드(인트로/아웃트로) 토글이 보인다(Treazer만). 다른 프로젝트(ARIA)에선 안 보인다.
- 토글 OFF에서 Play → 데모만 재생(기존과 동일).
- 토글 ON에서 Play → 인트로(시세 라인 → 코인 → Treazer. → 태그라인) → 데모 자동 시작 → 데모 종료 후 아웃트로(로고 + treazer.app) 자동 재생.
- 오버레이 클릭 시 해당 단계 스킵. Stop/리셋 시 시퀀스 취소.
- 모바일/데스크탑 양쪽에서 풀스테이지로 표시.

- [ ] **Step 9: Commit**

```bash
git add src/shell/Stage.tsx
git commit -m "feat(shell): Stage 인트로→데모→아웃트로 시퀀스 오케스트레이션"
```

---

## 변경 파일 요약

| 파일 | 역할 |
|------|------|
| `store/shellStore.ts` (수정) | `includeBranding` 토글 상태 |
| `branding/types.ts` (신규) | `ProjectBranding` 타입 |
| `branding/index.ts` (신규) | projectId → 브랜딩 레지스트리, `getBranding` |
| `demos/treazer/_shared/branding.tsx` (신규) | Treazer 인트로/아웃트로 컴포넌트 + `treazerBranding` |
| `shell/BrandOverlay.tsx` (신규) | 풀스테이지 오버레이(타이머/클릭 onDone) |
| `shell/ControlBar.tsx` (수정) | 인트로/아웃트로 토글 버튼(브랜딩 프로젝트만) |
| `shell/Stage.tsx` (수정) | 시퀀스 오케스트레이션 + 오버레이 렌더 + 취소 처리 |
