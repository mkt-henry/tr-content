# 인앱 Remotion Studio-lite 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로덕션 `tr-content.vercel.app`에서 daily-quiz Remotion 영상 데모를 재생·스크럽 관람할 수 있는 `@remotion/player` 기반 정적 Studio-lite 페이지를 추가하고, 깨지는 localhost iframe `StudioView`를 대체한다.

**Architecture:** 공유 `DemoPlayer` 컴포넌트(Player + 자동재생 unstick 로직)를 추출해 기존 `RemotionPreview` 모달과 신규 `StudioLite` 전용 페이지가 함께 쓴다. `shellStore`의 `studioUrl`(로컬 iframe URL)을 `studioOpen: boolean`으로 바꾸고, 갤러리·스테이지 진입 버튼의 dev 게이팅을 제거한다. 스펙: `docs/superpowers/specs/2026-07-08-remotion-studio-lite-design.md`

**Tech Stack:** React 18 + TypeScript + zustand 5 + `@remotion/player` 4 + Tailwind 4 + lucide-react. 테스트 러너 없음 — 검증은 `npx tsc --noEmit` + dev 서버 수동 확인.

## Global Constraints

- 대상은 **daily-quiz(ko/en)만**. 범용 컴포지션 레지스트리·`Root.tsx` 재구조화·MP4 서버 렌더는 범위 밖.
- 검증 공통: 각 태스크 ① `npx tsc --noEmit` 통과, 마지막 태스크에서 추가로 `npm run build`.
- **커밋은 태스크당 1회, 해당 태스크가 만진 파일만.** 작업 트리에 무관한 미커밋 변경이 다수 있다(`remotion/DemoVideo.tsx`, `remotion/Root.tsx`, `remotion/studio.ts`, `src/lib/cameraGeom.ts`, `src/shell/SpotlightCaption.tsx`) — 절대 같이 커밋 금지.
- `Lang` 타입은 `src/demos/findle/_shared/i18n`의 `'ko' | 'en'`. `src/shell/`에서 import 경로는 `../demos/findle/_shared/i18n`.

---

### Task 1: 공유 `DemoPlayer` 추출 + `RemotionPreview` 정리

**Files:**
- Create: `src/shell/DemoPlayer.tsx`
- Modify: `src/shell/RemotionPreview.tsx` (전체 교체)

**Interfaces:**
- Produces: `DemoPlayer` 컴포넌트 — props `{ lang?: Lang; autoPlay?: boolean; className?: string }`. `lang` 미지정 시 앱 현재 언어를 따르고, 지정 시 해당 언어 컴포지션으로 고정. Task 2가 소비한다.
- Consumes: `remotion/DemoVideo`의 `DemoVideo`, `remotion/meta`의 `DURATION_IN_FRAMES/FPS/WIDTH/HEIGHT`.

- [ ] **Step 1: `DemoPlayer.tsx` 작성**

```tsx
import { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { DemoVideo } from '../../remotion/DemoVideo';
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from '../../remotion/meta';
import type { Lang } from '../demos/findle/_shared/i18n';

/**
 * Remotion daily-quiz 데모를 브라우저에서 재생하는 공유 Player 래퍼.
 * 자동재생 unstick 로직(프레임 0 초기 버퍼링 정지 → seekTo(1)로 깨운 뒤 play, 3초 후 포기)을 포함.
 * RemotionPreview(모달)와 StudioLite(전용 페이지)가 공통 사용한다.
 * lang 지정 시 해당 언어 컴포지션으로 고정, 미지정 시 앱 현재 언어 토글을 따른다.
 */
export function DemoPlayer({
  lang,
  autoPlay = true,
  className,
}: {
  lang?: Lang;
  autoPlay?: boolean;
  className?: string;
}) {
  const playerRef = useRef<PlayerRef>(null);
  useEffect(() => {
    if (!autoPlay) return;
    // Player는 프레임 0에서 초기 버퍼링으로 정지하는 경우가 있어, seek(1)로 한 번 unstick한 뒤 재생한다.
    // 프레임이 실제 전진할 때까지 재시도, 3초 후 포기(수동 재생 가능).
    const iv = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      if (p.getCurrentFrame() > 1) {
        clearInterval(iv);
        return;
      }
      p.seekTo(1);
      p.play();
    }, 200);
    const stop = setTimeout(() => clearInterval(iv), 3000);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
    };
  }, [autoPlay]);
  return (
    <Player
      ref={playerRef}
      component={DemoVideo}
      inputProps={lang ? { lang } : {}}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      compositionWidth={WIDTH}
      compositionHeight={HEIGHT}
      style={{ width: '100%' }}
      className={className}
      controls
      autoPlay={autoPlay}
      loop
      acknowledgeRemotionLicense
    />
  );
}
```

- [ ] **Step 2: `RemotionPreview.tsx` 전체 교체 (Player·자동재생 로직을 DemoPlayer로 이관)**

```tsx
import { DemoPlayer } from './DemoPlayer';

/**
 * 앱 내 Remotion 미리보기 모달 — daily-quiz 영상을 재생/스크럽한다. 렌더/다운로드 없이
 * tr-content 안에서 최종 결과와 동일한 구도를 확인. 앱의 현재 언어 토글을 그대로 따른다.
 */
export function RemotionPreview({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-[1120px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-wide text-white/70">
            Remotion 미리보기 · daily-quiz (프레임 기반)
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3 py-1 text-[13px] font-medium text-white transition-colors hover:bg-white/20"
          >
            닫기 ✕
          </button>
        </div>
        <div className="overflow-hidden rounded-xl ring-1 ring-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
          <DemoPlayer />
        </div>
        <p className="mt-2 text-center text-[11.5px] text-white/40">
          브라우저 실시간 재생 — 최종 mp4와 동일한 프레임 기반 타이밍. 스페이스바 재생/일시정지, 타임라인 드래그로 스크럽.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: dev 서버에서 미리보기 동작 확인**

`npm run dev`가 이미 실행 중이면 그대로, 아니면 실행. 브라우저에서 findle 프로젝트 → daily-quiz 데모 진입 → 우상단 "🎞 Remotion 미리보기" 클릭 → 모달에서 영상이 자동재생되고 타임라인 스크럽이 되는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/shell/DemoPlayer.tsx src/shell/RemotionPreview.tsx
git commit -m "refactor(remotion): Player+자동재생 로직을 공유 DemoPlayer로 추출"
```

---

### Task 2: `StudioLite` 전용 페이지 컴포넌트

**Files:**
- Create: `src/shell/StudioLite.tsx`

**Interfaces:**
- Consumes: Task 1의 `DemoPlayer`, `shellStore`의 `closeStudio()`(기존 존재), `../lib/cn`의 `cn`.
- Produces: `StudioLite` 컴포넌트(props 없음). Task 3의 `App.tsx`가 렌더한다.

- [ ] **Step 1: `StudioLite.tsx` 작성**

```tsx
import { useState } from 'react';
import { useShellStore } from '../store/shellStore';
import { cn } from '../lib/cn';
import { DemoPlayer } from './DemoPlayer';
import type { Lang } from '../demos/findle/_shared/i18n';

/** Studio-lite 사이드바 항목 — 현재 daily-quiz(ko/en)만. */
const COMPOSITIONS: { id: string; title: string; lang: Lang }[] = [
  { id: 'daily-quiz-narrated-ko', title: 'daily-quiz · 한국어', lang: 'ko' },
  { id: 'daily-quiz-narrated-en', title: 'daily-quiz · English', lang: 'en' },
];

/**
 * 인앱 Remotion Studio-lite — 프로덕션·로컬 모두에서 @remotion/player로 데모 영상을
 * 재생·스크럽 관람한다. 좌측 컴포지션 목록 + 우측 큰 Player. localhost:3000 iframe(StudioView) 대체.
 */
export function StudioLite() {
  const closeStudio = useShellStore((s) => s.closeStudio);
  const [selected, setSelected] = useState<Lang>('ko');
  const active = COMPOSITIONS.find((c) => c.lang === selected) ?? COMPOSITIONS[0];
  return (
    <div className="flex h-full w-full flex-col bg-ink-950">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-ink-900 px-4 py-2.5">
        <button
          onClick={closeStudio}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          ← 목록으로
        </button>
        <span className="text-[13px] font-medium text-white/60">Remotion Studio</span>
        {import.meta.env.DEV && (
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            title="실제 Remotion Studio (npm run studio 실행 중)"
          >
            실제 Studio 새 탭 ↗
          </a>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-white/10 bg-ink-900/50 p-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/30">
            findle
          </p>
          <ul className="space-y-0.5">
            {COMPOSITIONS.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c.lang)}
                  className={cn(
                    'w-full rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                    c.lang === selected
                      ? 'bg-brass-500/20 text-brass-200'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                  )}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex min-w-0 flex-1 items-center justify-center p-6">
          <div className="w-full max-w-[1120px] overflow-hidden rounded-xl ring-1 ring-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
            {/* 언어 전환 시 key로 remount → DemoVideo의 전역 store 재구성이 깨끗하게 일어난다 */}
            <DemoPlayer key={active.lang} lang={active.lang} />
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음(아직 어디서도 import 안 하므로 미사용 경고는 tsc에서 발생하지 않음).

- [ ] **Step 3: 커밋**

```bash
git add src/shell/StudioLite.tsx
git commit -m "feat(remotion): 인앱 Studio-lite 페이지 컴포넌트 (daily-quiz ko/en)"
```

---

### Task 3: 진입점·상태 연결 + iframe StudioView 제거

**Files:**
- Modify: `src/store/shellStore.ts` (studioUrl → studioOpen)
- Modify: `src/App.tsx` (StudioView → StudioLite)
- Modify: `src/shell/Gallery.tsx` (dev 게이팅 제거, openStudio() 호출)
- Modify: `src/shell/Stage.tsx` (dev 게이팅 제거, openStudio() 호출)
- Delete: `src/shell/StudioView.tsx`

**Interfaces:**
- Consumes: Task 2의 `StudioLite`.
- Produces: `shellStore`의 `studioOpen: boolean` / `openStudio(): void` / `closeStudio(): void`.

- [ ] **Step 1: `shellStore.ts` — 인터페이스의 studioUrl 3줄 교체**

기존:
```ts
  /** null이 아니면 Remotion Studio를 iframe으로 띄운 화면 (기존 화면 위에 오버레이) */
  studioUrl: string | null;
  openStudio: (url: string) => void;
  closeStudio: () => void;
```
교체 후:
```ts
  /** true면 인앱 Remotion Studio-lite 페이지를 오버레이로 띄운다 */
  studioOpen: boolean;
  openStudio: () => void;
  closeStudio: () => void;
```

- [ ] **Step 2: `shellStore.ts` — 구현부 3줄 교체**

기존:
```ts
  studioUrl: null,
  openStudio: (studioUrl) => set({ studioUrl }),
  closeStudio: () => set({ studioUrl: null }),
```
교체 후:
```ts
  studioOpen: false,
  openStudio: () => set({ studioOpen: true }),
  closeStudio: () => set({ studioOpen: false }),
```

- [ ] **Step 3: `App.tsx` — import·셀렉터·분기 교체**

`import { StudioView } from './shell/StudioView';` →
```ts
import { StudioLite } from './shell/StudioLite';
```

`const studioUrl = useShellStore((s) => s.studioUrl);` →
```ts
const studioOpen = useShellStore((s) => s.studioOpen);
```

분기 블록:
```tsx
  // Studio 오버레이 — 최상위. 닫으면 아래의 갤러리/데모 화면이 그대로 유지된다.
  if (studioOpen) {
    return (
      <div className="h-full w-full">
        <StudioLite />
      </div>
    );
  }
```

- [ ] **Step 4: `Gallery.tsx` — 미사용 import 제거 + 버튼 dev 게이팅 제거**

line 12 `import { REMOTION_STUDIO_URL } from '../../remotion/studio';` 삭제.

기존 버튼 블록(`{import.meta.env.DEV && ( ... )}` 로 감싼 "Remotion Studio" 버튼)을 다음으로 교체:
```tsx
              {/* Remotion Studio-lite 진입 — 프로덕션·로컬 모두 (정적 Player 페이지) */}
              <button
                type="button"
                onClick={() => openStudio()}
                title="Remotion Studio 열기 — 데모 영상 재생·스크럽"
                className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-zinc-300 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
              >
                <Film className="h-4 w-4" />
                Remotion Studio
              </button>
```
(`Film`, `openStudio`는 이미 import/선언되어 있음)

- [ ] **Step 5: `Stage.tsx` — 미사용 import 제거 + Studio 버튼 dev 게이팅 제거**

line 15 `import { hasRemotion, studioUrlFor } from '../../remotion/studio';` →
```ts
import { hasRemotion } from '../../remotion/studio';
```

기존 Studio 버튼 블록(`{import.meta.env.DEV && studioUrlFor(feature.id) && ( ... )}`)을 다음으로 교체:
```tsx
          <button
            onClick={() => useShellStore.getState().openStudio()}
            title="Remotion Studio에서 열기 — 데모 영상 재생·스크럽"
            className="rounded-lg bg-white/5 px-3 py-1.5 text-[12px] font-medium text-white/80 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/15 hover:text-white"
          >
            Studio ↗
          </button>
```
(`useShellStore`는 Stage에 이미 import되어 있음)

- [ ] **Step 6: `StudioView.tsx` 삭제**

```bash
git rm src/shell/StudioView.tsx
```

- [ ] **Step 7: 타입체크 + 빌드**

Run: `npx tsc --noEmit`
Expected: 에러 없음(`studioUrlFor`/`REMOTION_STUDIO_URL`/`StudioView` 잔여 참조 없음).

Run: `npm run build`
Expected: 성공(`tsc --noEmit && vite build`).

- [ ] **Step 8: dev 서버에서 엔드투엔드 확인**

`npm run dev` → 갤러리 상단 "Remotion Studio" 버튼 클릭 → Studio-lite 페이지 진입 → 좌측에서 `daily-quiz · 한국어`/`English` 전환 시 영상이 각 언어로 재생·스크럽되는지 확인 → "← 목록으로" 로 갤러리 복귀 → daily-quiz 데모 진입 후 "Studio ↗" 버튼도 Studio-lite를 여는지 확인.

- [ ] **Step 9: 커밋**

```bash
git add src/store/shellStore.ts src/App.tsx src/shell/Gallery.tsx src/shell/Stage.tsx src/shell/StudioView.tsx
git commit -m "feat(remotion): 프로덕션에서 Studio-lite 진입 — iframe StudioView 대체"
```

---

## 완료 기준

- 프로덕션 빌드(`npm run build`) 성공.
- 갤러리·데모 페이지의 "Remotion Studio"/"Studio ↗" 버튼이 dev·프로덕션 모두에서 노출되고, 클릭 시 인앱 Studio-lite 페이지로 이동.
- Studio-lite에서 daily-quiz ko/en 전환·재생·스크럽·목록 복귀 동작.
- `localhost:3000` iframe 의존(`StudioView`) 완전 제거.
