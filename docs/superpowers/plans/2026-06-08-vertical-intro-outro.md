# 인트로/아웃트로 세로(9:16) 대응 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 디바이스 모드일 때 인트로/아웃트로를 세로 9:16 풀블리드로 렌더(데스크탑은 16:9 유지)해 릴스/숏츠 콘텐츠에 맞춘다.

**Architecture:** 브랜딩 컴포넌트(`TreazerIntro`/`Outro`)에 `portrait` prop을 추가해 시세 라인 기하를 가로/세로로 분기하고, `BrandOverlay`가 portrait일 때 phase를 중앙 9:16 패널로 감싼다. `Stage`가 `device === 'mobile'`을 `portrait`로 전달한다. 시퀀스/토글/녹화 로직은 불변.

**Tech Stack:** React 18 + TS, framer-motion, Tailwind v4. 테스트 러너 없음 → 검증은 `npm run build`(tsc --noEmit) + 시각 확인.

**검증 방식:** 각 태스크 `npx tsc --noEmit` 통과 후 커밋. 마지막에 dev 서버에서 디바이스 토글로 세로/가로 확인. `portrait`는 **optional**(`portrait?: boolean`)이라 각 태스크가 독립적으로 빌드 green.

---

### Task 1: branding 타입 + Treazer 컴포넌트 portrait 대응

**Files:**
- Modify: `src/branding/types.ts`
- Modify: `src/demos/treazer/_shared/branding.tsx`

- [ ] **Step 1: ProjectBranding 타입에 portrait prop 반영**

`src/branding/types.ts`의 `Intro`/`Outro` 타입을 교체:

```ts
import type { ComponentType } from 'react';

/** 프로젝트별 영상 브랜딩 — 데모 앞뒤에 붙는 인트로/아웃트로 시퀀스 */
export interface ProjectBranding {
  /** 인트로 풀스테이지 컴포넌트 (portrait=true면 세로 9:16 구성) */
  Intro: ComponentType<{ portrait?: boolean }>;
  /** 아웃트로 풀스테이지 컴포넌트 (portrait=true면 세로 9:16 구성) */
  Outro: ComponentType<{ portrait?: boolean }>;
  /** 인트로 재생 시간(ms) — BrandOverlay 타이머 */
  introMs: number;
  /** 아웃트로 재생 시간(ms) */
  outroMs: number;
}
```

- [ ] **Step 2: branding.tsx를 portrait 대응으로 교체**

`src/demos/treazer/_shared/branding.tsx` 전체를 아래로 교체(라인 기하 가로/세로 분기 + 컴포넌트가 `portrait` prop 수신):

```tsx
import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import type { ProjectBranding } from '../../../branding/types';
import { Coin, TZ_BACKGROUND } from './ui';

/** 다크 배경용 Treazer 워드마크 (ui.tsx Wordmark는 다크 텍스트라 별도) */
function DarkWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-bold tracking-tight text-white', className)}>
      Treazer<span className="text-orange-500">.</span>
    </span>
  );
}

/** 우상향 금 시세 라인 — 가로/세로 프레임에 맞는 기하 */
const LINE_LANDSCAPE = {
  viewBox: '0 0 320 180',
  d: 'M0 158 L60 135 L110 142 L160 98 L210 106 L260 60 L320 22',
};
const LINE_PORTRAIT = {
  viewBox: '0 0 180 320',
  d: 'M12 300 L45 250 L75 262 L100 175 L125 192 L155 92 L170 28',
};

/** 인트로(~2.5s): 시세 라인 → 코인 → 워드마크 → 태그라인 */
function TreazerIntro({ portrait = false }: { portrait?: boolean }) {
  const line = portrait ? LINE_PORTRAIT : LINE_LANDSCAPE;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={line.viewBox} preserveAspectRatio="none">
        <motion.path
          d={line.d}
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
function TreazerOutro({ portrait = false }: { portrait?: boolean }) {
  const line = portrait ? LINE_PORTRAIT : LINE_LANDSCAPE;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: TZ_BACKGROUND.css }}
    >
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox={line.viewBox} preserveAspectRatio="none">
        <motion.path
          d={line.d}
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

(가로 모드 콘텐츠는 기존과 동일 — `LINE_LANDSCAPE` + 동일 폰트. portrait일 때만 `LINE_PORTRAIT`로 라인이 세로로 가파르게 상승.)

- [ ] **Step 3: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0). `portrait?`가 optional이라 BrandOverlay의 기존 `<Phase />`(portrait 미전달)도 그대로 통과.

- [ ] **Step 4: Commit**

```bash
git add src/branding/types.ts src/demos/treazer/_shared/branding.tsx
git commit -m "feat(branding): 인트로/아웃트로 portrait prop — 세로 시세 라인 분기"
```

---

### Task 2: BrandOverlay 9:16 래핑 + Stage portrait 전달

**Files:**
- Modify: `src/shell/BrandOverlay.tsx`
- Modify: `src/shell/Stage.tsx`

- [ ] **Step 1: BrandOverlay에 portrait prop + 9:16 래핑**

`src/shell/BrandOverlay.tsx` 전체를 아래로 교체:

```tsx
import { useCallback, useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { motion } from 'framer-motion';

/**
 * 풀스테이지 브랜딩 오버레이. 주어진 phase 컴포넌트를 렌더하고
 * durationMs 타이머 만료 또는 클릭 시 onDone을 정확히 1회 호출한다.
 * z-40 — ControlBar(z-50)보다 아래라 데모 재생 단계에서 컨트롤이 가려지지 않는다.
 * 인트로/아웃트로 단계에서는 오버레이 클릭으로 스킵, Space로 정지할 수 있다.
 * portrait=true(모바일)면 중앙 9:16 세로 패널로 감싸 릴스/숏츠 비율로 렌더한다.
 */
export function BrandOverlay({
  Phase,
  durationMs,
  onDone,
  portrait,
}: {
  Phase: ComponentType<{ portrait?: boolean }>;
  durationMs: number;
  onDone: () => void;
  portrait: boolean;
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
      className="absolute inset-0 z-40 flex cursor-pointer items-center justify-center"
    >
      {portrait ? (
        <div
          className="relative overflow-hidden rounded-[2rem]"
          style={{ height: 'min(82vh, 780px)', aspectRatio: '9 / 16' }}
        >
          <Phase portrait />
        </div>
      ) : (
        <Phase portrait={false} />
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Stage에서 portrait 전달**

`src/shell/Stage.tsx`의 `<BrandOverlay .../>` 블록에 `portrait` prop을 추가. 기존:

```tsx
          <BrandOverlay
            key={seqPhase}
            Phase={seqPhase === 'intro' ? branding.Intro : branding.Outro}
            durationMs={seqPhase === 'intro' ? branding.introMs : branding.outroMs}
            onDone={onPhaseDone}
          />
```

아래로 교체(`portrait={device === 'mobile'}` 추가):

```tsx
          <BrandOverlay
            key={seqPhase}
            Phase={seqPhase === 'intro' ? branding.Intro : branding.Outro}
            durationMs={seqPhase === 'intro' ? branding.introMs : branding.outroMs}
            onDone={onPhaseDone}
            portrait={device === 'mobile'}
          />
```

(`device`는 Stage 상단에서 이미 `const { device, phoneFrame, browserChrome } = useShellStore();`로 구조분해되어 있다.)

- [ ] **Step 3: 타입 통과 + 전체 빌드**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

Run: `npm run build`
Expected: vite 빌드 성공(`✓ built`).

- [ ] **Step 4: 시각 확인 (dev 서버)**

`npm run dev` 후 Treazer → "포인트가 아니라 진짜 금" 진입:
- 인트로/아웃트로 토글 ON.
- **데스크탑 모드**에서 Play → 인트로/아웃트로가 기존처럼 16:9 풀스테이지(회귀 없음).
- **모바일 모드(D 토글)**에서 Play → 인트로/아웃트로가 화면 중앙 세로 9:16 패널로 풀블리드, 시세 라인이 세로로 자연스럽게 상승, 폰 데모와 수직 중앙 정렬.
- 인트로→데모→아웃트로 시퀀스·스킵·정지 정상.

- [ ] **Step 5: Commit**

```bash
git add src/shell/BrandOverlay.tsx src/shell/Stage.tsx
git commit -m "feat(branding): 모바일 모드 인트로/아웃트로 세로 9:16 래핑"
```

---

## 변경 파일 요약

| 파일 | 역할 |
|------|------|
| `branding/types.ts` (수정) | `Intro`/`Outro` 타입에 `portrait?: boolean` |
| `demos/treazer/_shared/branding.tsx` (수정) | 컴포넌트가 `portrait` 수신, 시세 라인 가로/세로 분기 |
| `shell/BrandOverlay.tsx` (수정) | `portrait` prop, mobile일 때 중앙 9:16 패널 래핑 + phase에 전달 |
| `shell/Stage.tsx` (수정) | `portrait={device === 'mobile'}` 전달 |
