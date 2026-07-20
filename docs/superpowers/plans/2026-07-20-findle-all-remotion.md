# findle 전 데모 Remotion화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** daily-quiz 외 4개 findle 데모(quiz-gen/leaderboard/rewards/teacher-report)를 대표 variant 1개씩 한/영 프레임 컴포지션으로 Remotion 영상화한다.

**Architecture:** `DemoVideo`를 `{featureId, variantId, lang}`로 파라미터화하고, webpack 번들러 제약(Vite `import.meta.glob` 불가) 때문에 `remotion/findleCompositions.ts`에서 5개 feature를 직접 import해 컴포지션 목록·duration·해석을 단일 출처로 제공한다. async `sleep` 스트리밍에 의존하던 데모는 스토어에 동기 setter를 추가하고 시나리오를 `do`/`stream` 스텝으로 재작성해 프레임 결정론을 확보한다(라이브·프레임 공용).

**Tech Stack:** React 18, Remotion 4(webpack), @remotion/player, zustand, framer-motion, Tailwind v4, Vite(앱)/webpack(Remotion), TypeScript.

## Global Constraints

- 컴포지션 id 규칙: `{feature.id에서 findle- 제거}-{variantId}-{lang}`. daily-quiz는 `daily-quiz-narrated-ko`/`-en`로 **불변**(기존 딥링크·CLI 하위호환).
- 대표 variant: quiz-gen=`adaptive`, leaderboard=`badge`, rewards=`redeem`, teacher-report=`full`, daily-quiz=`narrated`.
- 언어: `ko`/`en` 두 컴포지션. 총 10개.
- 프레임 결정론 원칙: 콘텐츠를 만드는 상태 전환은 **동기 setter** 또는 시나리오 스텝으로만. 스토어 내부 `setTimeout`/`sleep`로 흘리는 콘텐츠는 프레임 F에서 재현 불가.
- 기존 async 메서드(`generate`/`study`/`redeem`/`startDispatch` 등)는 screens `onClick` 수동용으로 **남긴다**(엔진은 `step.run()`만 호출하고 실제 DOM 클릭을 디스패치하지 않으므로 자동재생과 무관, 이중 실행 없음).
- webpack 경계: `remotion/findleCompositions.ts`는 registry(`import.meta.glob`) 미사용, 5개 feature 직접 import만. remotion 패키지/player를 끌어오지 않는다.
- `stream`/`type` 진행형 스텝의 store setter는 **누적(append) 방식**으로 구현한다. 프레임 모드는 매 프레임 `resetState()`로 대상을 비운 뒤 누적 접두사를 1회 apply하므로 누적 setter가 양쪽(라이브 delta 누적 / 프레임 접두사 1회)에서 모두 맞다.

## 검증 방식(중요)

이 저장소에는 자동 테스트 러너가 없다(`package.json`에 test 스크립트·테스트 파일 없음). Remotion 출력은 시각적이라 단위 테스트가 부적합하다. 각 태스크의 검증 사이클은:

1. `npx tsc --noEmit` — 타입 게이트(반드시 통과).
2. `npm run studio`(webpack, 포트 3000) — 대상 컴포지션을 findle 폴더에서 열어 타임라인을 **스크럽**하며 콘텐츠가 프레임별로 재현되는지 눈으로 확인.
3. (인프라 이후) `npm run dev` → 해당 데모 Stage → "🎞 Remotion Studio" 진입 → 앱 내 Player 재생 확인.

`npm run dev`/`npm run studio`가 이미 떠 있으면 재사용한다.

## File Structure

- **Create** `remotion/findleCompositions.ts` — 5개 feature 직접 import, 컴포지션 메타(`FINDLE_COMPOSITIONS`)와 `resolveFindle()` 단일 출처.
- **Modify** `remotion/meta.ts` — `FPS`/`WIDTH`/`HEIGHT` 상수만 남김(데모 의존 duration 제거).
- **Modify** `remotion/DemoVideo.tsx` — props `{featureId, variantId, lang?}`로 파라미터화 + buildTimeline 전 lang 동기 반영.
- **Modify** `remotion/Root.tsx` — `FINDLE_COMPOSITIONS × [ko,en]`로 `<Composition>` 자동 생성.
- **Modify** `src/shell/DemoPlayer.tsx` — props `{featureId, variantId, lang?, durationInFrames}`.
- **Modify** `src/shell/StudioLite.tsx` — 5개 데모 사이드바 + ko/en 토글 + 직전 데모 자동선택.
- **Modify** `remotion/studio.ts` — `REMOTION_COMPOSITIONS`를 `FINDLE_COMPOSITIONS`에서 파생(5개 등록).
- **Modify** `src/demos/findle/leaderboard/{state,scenario}.ts` — `openBadge()` 동기 setter + badgeScenario에 명시 오픈 스텝.
- **Modify** `src/demos/findle/quiz-gen/{state,scenario}.ts` — 생성 동기 setter 4종 + adaptiveScenario 재작성.
- **Modify** `src/demos/findle/teacher-report/{state,scenario}.ts` — 리포트/코칭/발송/토스트 동기 setter + fullScenario 재작성(`waitFor` 제거).

---

### Task 1: `remotion/findleCompositions.ts` 생성 (컴포지션 단일 출처)

**Files:**
- Create: `remotion/findleCompositions.ts`

**Interfaces:**
- Consumes: `remotion/timeline`의 `buildTimeline`, `remotion/meta`의 `FPS`, 5개 feature default export, `src/registry/types`의 `FeatureDefinition`.
- Produces:
  - `FINDLE_COMPOSITIONS: FindleComposition[]` — `{ name, featureId, variantId, title, durationInFrames }`.
  - `resolveFindle(featureId: string, variantId: string): { feature: FeatureDefinition; variant: DemoVariant } | null`.

- [ ] **Step 1: 파일 작성**

```ts
import type { FeatureDefinition } from '../src/registry/types';
import dailyQuiz from '../src/demos/findle/daily-quiz';
import quizGen from '../src/demos/findle/quiz-gen';
import leaderboard from '../src/demos/findle/leaderboard';
import rewards from '../src/demos/findle/rewards';
import teacherReport from '../src/demos/findle/teacher-report';
import { buildTimeline } from './timeline';
import { FPS } from './meta';

/**
 * findle 데모 → Remotion 컴포지션 매핑 단일 출처.
 * webpack 번들러는 Vite 전용 import.meta.glob(registry)을 못 쓰므로 feature를 직접 import한다.
 * 새 데모/variant를 렌더 대상에 추가하려면 SPECS에 한 줄 추가.
 */
interface Spec {
  feature: FeatureDefinition;
  /** 렌더 대상 대표 variant id */
  variantId: string;
  /** 컴포지션 id 접두 (feature.id에서 findle- 제거) */
  name: string;
}

const SPECS: Spec[] = [
  { feature: dailyQuiz, variantId: 'narrated', name: 'daily-quiz' },
  { feature: quizGen, variantId: 'adaptive', name: 'quiz-gen' },
  { feature: leaderboard, variantId: 'badge', name: 'leaderboard' },
  { feature: rewards, variantId: 'redeem', name: 'rewards' },
  { feature: teacherReport, variantId: 'full', name: 'teacher-report' },
];

/** 타임라인 총길이 뒤에 붙이는 마무리 여운 */
const TAIL_FRAMES = Math.round(1.5 * FPS);

export interface FindleComposition {
  name: string;
  featureId: string;
  variantId: string;
  title: string;
  durationInFrames: number;
}

function variantOf(s: Spec) {
  return s.feature.variants.find((v) => v.id === s.variantId) ?? s.feature.variants[0];
}

export const FINDLE_COMPOSITIONS: FindleComposition[] = SPECS.map((s) => {
  const variant = variantOf(s);
  return {
    name: s.name,
    featureId: s.feature.id,
    variantId: variant.id,
    title: s.feature.title,
    durationInFrames: buildTimeline(variant.scenario, FPS).total + TAIL_FRAMES,
  };
});

/** 컴포지션 props(문자열 id)를 실제 feature/variant로 해석. props는 JSON 직렬화 가능해야 하므로 객체는 여기서만. */
export function resolveFindle(featureId: string, variantId: string) {
  const s = SPECS.find((x) => x.feature.id === featureId);
  if (!s) return null;
  const variant =
    s.feature.variants.find((v) => v.id === variantId) ??
    s.feature.variants.find((v) => v.id === s.variantId) ??
    s.feature.variants[0];
  return { feature: s.feature, variant };
}
```

- [ ] **Step 2: 타입 게이트**

Run: `npx tsc --noEmit`
Expected: PASS (신규 파일이 아직 소비되지 않아도 컴파일 통과. `DemoVariant`는 `feature.variants[number]`로 추론됨.)

- [ ] **Step 3: 커밋**

```bash
git add remotion/findleCompositions.ts
git commit -m "feat(remotion): findle 컴포지션 단일 출처(findleCompositions) 추가"
```

---

### Task 2: 렌더/플레이어 체인 일반화 (인프라)

daily-quiz 하드코딩 제거 후 10개 컴포지션이 뜨도록 하는 원자적 인프라 변경. tsc가 부분 상태에서 통과하지 못하므로 파일들을 한 태스크로 묶어 마지막에 한 번 검증·커밋한다. 완료 시 daily-quiz·rewards는 즉시 정상 렌더(프레임 호환), leaderboard(badge 오버레이 제외)·quiz-gen·teacher-report는 콘텐츠 일부가 비어 보일 수 있음(Task 3~5에서 해결).

**Files:**
- Modify: `remotion/meta.ts`
- Modify: `remotion/DemoVideo.tsx`
- Modify: `remotion/Root.tsx`
- Modify: `src/shell/DemoPlayer.tsx`
- Modify: `src/shell/StudioLite.tsx`
- Modify: `remotion/studio.ts`

**Interfaces:**
- Consumes: Task 1의 `FINDLE_COMPOSITIONS`, `resolveFindle`.
- Produces:
  - `DemoVideo: React.FC<{ featureId: string; variantId: string; lang?: Lang }>`.
  - `DemoPlayer(props: { featureId: string; variantId: string; lang?: Lang; durationInFrames: number; autoPlay?: boolean; className?: string })`.
  - `remotion/meta`: `FPS`, `WIDTH`, `HEIGHT`만 export.
  - `remotion/studio`: `REMOTION_COMPOSITIONS`(5개), `hasRemotion`, `studioUrlFor`, `REMOTION_STUDIO_URL`.

- [ ] **Step 1: `remotion/meta.ts` 슬림화 — 전체 교체**

```ts
/** 컴포지션 공통 메타 — Root(CLI 렌더)와 앱 내 Player가 공유한다. */
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
```

- [ ] **Step 2: `remotion/DemoVideo.tsx` 파라미터화 — 전체 교체**

```tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../src/shell/Background';
import { Camera } from '../src/shell/Camera';
import { FakeCursor } from '../src/shell/FakeCursor';
import { SpotlightCaption } from '../src/shell/SpotlightCaption';
import { usePlaybackStore } from '../src/engine/playbackStore';
import { useShellStore } from '../src/store/shellStore';
import type { Lang } from '../src/demos/findle/_shared/i18n';
import { localCenter } from '../src/lib/cameraGeom';
import { buildTimeline, computeFrameState } from './timeline';
import { resolveFindle } from './findleCompositions';

/**
 * 프레임 기반 데모 비디오 — 시나리오 진행(스텝·store·커서 타깃·클릭 펄스)을 프레임 F의
 * 순수 함수로 계산해 매 프레임 store를 재구성한다. featureId/variantId로 어떤 findle 데모든 렌더한다.
 * 벽시계(setTimeout/Date.now) 의존 없음 → 1프레임 = 정확히 1/fps.
 */
export const DemoVideo: React.FC<{ featureId: string; variantId: string; lang?: Lang }> = ({
  featureId,
  variantId,
  lang,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const resolved = resolveFindle(featureId, variantId);
  if (!resolved) throw new Error(`Unknown findle composition: ${featureId}/${variantId}`);
  const { feature, variant } = resolved;
  const Comp = feature.Desktop;

  // 언어를 buildTimeline 전에 동기 반영 — stream/type 스텝의 full 문자열이 올바른 언어로
  // 캡처되도록(timeline은 build 시점 textOf로 full을 1회 고정). getLang()은 store를 동기 조회하므로
  // 여기서 먼저 써두면 아래 useMemo가 정확한 언어로 빌드한다. 값이 다를 때만 써서(가드) 첫 마운트 외
  // 불필요한 store 알림을 막는다. (setState/getState는 훅이 아니라 조건 호출 안전)
  if (lang && useShellStore.getState().projectLang.findle !== lang) {
    useShellStore.setState((s) => ({ projectLang: { ...s.projectLang, findle: lang } }));
  }

  // 셸 스토어 구성 — feature/variant/device 반영. lang은 위에서 이미 동기 반영했으나 재확인.
  useLayoutEffect(() => {
    useShellStore.setState({
      featureId: feature.id,
      variantId: variant.id,
      device: 'desktop',
      ...(lang ? { projectLang: { ...useShellStore.getState().projectLang, findle: lang } } : {}),
    });
    usePlaybackStore.getState().setSpotlight(null);
  }, [feature.id, variant.id, lang]);

  const timeline = useMemo(() => buildTimeline(variant.scenario, fps), [variant.scenario, fps, lang]);
  const state = useMemo(() => computeFrameState(frame, timeline), [frame, timeline]);

  // Pretendard 폰트 로드 — CLI 렌더(폰트 없음)에선 완료까지 delayRender로 지연.
  // 앱 임베드(Player)에선 이미 로드돼 delayRender를 만들지 않는다(StrictMode 고아 핸들 방지).
  const [fontHandle] = useState(() =>
    typeof document !== 'undefined' && document.fonts?.check('16px "Pretendard Variable"')
      ? null
      : delayRender('Loading Pretendard'),
  );
  useEffect(() => {
    if (fontHandle == null) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      continueRender(fontHandle);
    };
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css';
    link.onload = () => document.fonts.ready.then(finish);
    link.onerror = finish;
    document.head.appendChild(link);
    const timer = setTimeout(finish, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: width / 2, y: height * 0.7 });
  useLayoutEffect(() => {
    // 1) 커서 타깃 측정 (store 적용 전, 현재 DOM 기준). offset 체인이라 카메라 줌에도 불변.
    let pos = lastPos.current;
    if (state.cursorTarget && rootRef.current) {
      const el = document.querySelector<HTMLElement>(`[data-demo-id="${state.cursorTarget}"]`);
      if (el) pos = localCenter(el, rootRef.current);
    }
    lastPos.current = pos;
    usePlaybackStore.getState().setCursor({ x: pos.x, y: pos.y, pressed: state.pressed, visible: true });

    // 2) 데모 store 스냅샷 재구성 (리셋 → 이 프레임까지 run/progressive 순서대로). 멱등.
    feature.resetState();
    state.runs.forEach((r) => r());
    state.progressive.forEach((p) => p.apply(p.text));
  }, [frame, state, feature]);

  return (
    <AbsoluteFill>
      <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-ink-950">
        <Background bg={variant.background} />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div
            className="relative flex flex-col overflow-hidden rounded-2xl bg-[#131216] ring-1 ring-white/10 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]"
            style={{ width: 'min(88vw, 138vh)', aspectRatio: '16 / 9.8' }}
          >
            <div className="relative min-h-0 flex-1">
              <Camera disabled={feature.chromeless}>
                <Comp device="desktop" />
              </Camera>
            </div>
          </div>
        </div>
        <FakeCursor />
        <SpotlightCaption rootRef={rootRef} />
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: `remotion/Root.tsx` — 전체 교체**

```tsx
import { Composition, Folder } from 'remotion';
import './styles.css';
import { DemoVideo } from './DemoVideo';
import { FPS, HEIGHT, WIDTH } from './meta';
import { FINDLE_COMPOSITIONS } from './findleCompositions';

const LANGS = ['ko', 'en'] as const;

export const RemotionRoot: React.FC = () => {
  // 프로젝트 폴더로 그룹핑 → Studio URL이 /findle/<컴포지션id>. 언어별 컴포지션 분리(lang prop만 다름).
  return (
    <Folder name="findle">
      {FINDLE_COMPOSITIONS.flatMap((c) =>
        LANGS.map((lang) => (
          <Composition
            key={`${c.name}-${c.variantId}-${lang}`}
            id={`${c.name}-${c.variantId}-${lang}`}
            component={DemoVideo}
            durationInFrames={c.durationInFrames}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{ featureId: c.featureId, variantId: c.variantId, lang }}
          />
        )),
      )}
    </Folder>
  );
};
```

- [ ] **Step 4: `src/shell/DemoPlayer.tsx` — 전체 교체**

```tsx
import { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { DemoVideo } from '../../remotion/DemoVideo';
import { FPS, HEIGHT, WIDTH } from '../../remotion/meta';
import type { Lang } from '../demos/findle/_shared/i18n';

/**
 * Remotion findle 데모를 브라우저에서 재생하는 공유 Player 래퍼.
 * 자동재생 unstick 로직(프레임 0 초기 버퍼링 정지 → seekTo(1)로 깨운 뒤 play, 3초 후 포기)을 포함.
 * StudioLite(전용 페이지)에서 사용한다. featureId/variantId로 데모를, lang으로 언어를 고정.
 */
export function DemoPlayer({
  featureId,
  variantId,
  lang,
  durationInFrames,
  autoPlay = true,
  className,
}: {
  featureId: string;
  variantId: string;
  lang?: Lang;
  durationInFrames: number;
  autoPlay?: boolean;
  className?: string;
}) {
  const playerRef = useRef<PlayerRef>(null);
  useEffect(() => {
    if (!autoPlay) return;
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
      inputProps={{ featureId, variantId, ...(lang ? { lang } : {}) }}
      durationInFrames={durationInFrames}
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

- [ ] **Step 5: `src/shell/StudioLite.tsx` — 전체 교체**

```tsx
import { useState } from 'react';
import { useShellStore } from '../store/shellStore';
import { cn } from '../lib/cn';
import { DemoPlayer } from './DemoPlayer';
import type { Lang } from '../demos/findle/_shared/i18n';
import { FINDLE_COMPOSITIONS } from '../../remotion/findleCompositions';

/**
 * 인앱 Remotion Studio-lite — 프로덕션·로컬 모두에서 @remotion/player로 findle 데모 영상을
 * 재생·스크럽 관람한다. 좌측 데모 목록 + 상단 ko/en 토글 + 우측 큰 Player.
 */
export function StudioLite() {
  const closeStudio = useShellStore((s) => s.closeStudio);
  const returnFeatureId = useShellStore((s) => s.studioReturn?.featureId);

  const initialName =
    FINDLE_COMPOSITIONS.find((c) => c.featureId === returnFeatureId)?.name ??
    FINDLE_COMPOSITIONS[0].name;
  const [selectedName, setSelectedName] = useState(initialName);
  const [lang, setLang] = useState<Lang>('ko');

  const active = FINDLE_COMPOSITIONS.find((c) => c.name === selectedName) ?? FINDLE_COMPOSITIONS[0];

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
        <div className="ml-auto flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5 ring-1 ring-white/10">
          {(['ko', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[12px] font-semibold transition-colors',
                lang === l ? 'bg-brass-500/20 text-brass-200' : 'text-white/50 hover:text-white/80',
              )}
            >
              {l === 'ko' ? '한국어' : 'English'}
            </button>
          ))}
        </div>
        {import.meta.env.DEV && (
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="ml-3 text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
            title="실제 Remotion Studio (npm run studio 실행 중)"
          >
            실제 Studio ↗
          </a>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-white/10 bg-ink-900/50 p-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/30">
            findle
          </p>
          <ul className="space-y-0.5">
            {FINDLE_COMPOSITIONS.map((c) => (
              <li key={c.name}>
                <button
                  onClick={() => setSelectedName(c.name)}
                  className={cn(
                    'w-full rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                    c.name === selectedName
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
            {/* 데모/언어 전환 시 key로 remount → DemoVideo의 전역 store 재구성이 깨끗하게 일어난다 */}
            <DemoPlayer
              key={`${active.name}-${lang}`}
              featureId={active.featureId}
              variantId={active.variantId}
              lang={lang}
              durationInFrames={active.durationInFrames}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: `remotion/studio.ts` — 전체 교체**

```ts
/**
 * Remotion 미리보기/Studio 연동 설정 — 앱(Stage)에서 임포트.
 * FINDLE_COMPOSITIONS를 단일 출처로 삼아 feature.id → { folder, id } 매핑을 파생한다.
 * hasRemotion이 true인 데모에 카드/스테이지의 "🎞 Remotion Studio" 버튼이 자동 노출된다.
 */
import { FINDLE_COMPOSITIONS } from './findleCompositions';

/** `npm run studio`가 고정하는 포트(3000)에 맞춘 Studio 베이스 URL */
export const REMOTION_STUDIO_URL = 'http://localhost:3000';

/** feature.id → 한국어 컴포지션 딥링크 경로 조각. Studio 좌측에서 -en으로 전환 가능. */
export const REMOTION_COMPOSITIONS: Record<string, { folder: string; id: string }> =
  Object.fromEntries(
    FINDLE_COMPOSITIONS.map((c) => [
      c.featureId,
      { folder: 'findle', id: `${c.name}-${c.variantId}-ko` },
    ]),
  );

export function hasRemotion(featureId: string): boolean {
  return featureId in REMOTION_COMPOSITIONS;
}

/** 해당 데모의 Studio 딥링크 (컴포지션 없으면 null) */
export function studioUrlFor(featureId: string): string | null {
  const c = REMOTION_COMPOSITIONS[featureId];
  return c ? `${REMOTION_STUDIO_URL}/${c.folder}/${c.id}` : null;
}
```

- [ ] **Step 7: 타입 게이트**

Run: `npx tsc --noEmit`
Expected: PASS. (DemoVideo/DemoPlayer/Root/StudioLite/studio가 새 시그니처로 일관.)

- [ ] **Step 8: Studio 시각 검증**

Run: `npm run studio` (이미 떠 있으면 브라우저 새로고침)
Expected: 좌측 findle 폴더에 컴포지션 10개(`daily-quiz-narrated-ko/en`, `quiz-gen-adaptive-ko/en`, `leaderboard-badge-ko/en`, `rewards-redeem-ko/en`, `teacher-report-full-ko/en`).
- `daily-quiz-narrated-ko`/`-en`: 기존과 동일하게 전 구간 재현(회귀 없음).
- `rewards-redeem-ko`: 카드 선택 → 교환 → 성공 오버레이까지 재현.
- (미해결 예상) `leaderboard-badge`는 뱃지 오버레이가 안 열림, `quiz-gen-adaptive`는 결과 문항 비어 있음, `teacher-report-full`은 리포트/코칭 텍스트·발송 카운터 비어 있음 → Task 3~5에서 해결.

- [ ] **Step 9: 앱 진입점 검증**

Run: `npm run dev` (이미 떠 있으면 재사용). 브라우저에서 findle 프로젝트의 아무 데모 Stage 진입 → 우상단 "🎞 Remotion Studio" 클릭.
Expected: StudioLite가 열리고 좌측에 5개 데모, 상단 ko/en 토글, 진입한 데모가 자동 선택됨. Player 자동재생.

- [ ] **Step 10: 커밋**

```bash
git add remotion/meta.ts remotion/DemoVideo.tsx remotion/Root.tsx src/shell/DemoPlayer.tsx src/shell/StudioLite.tsx remotion/studio.ts
git commit -m "feat(remotion): DemoVideo/Root/Player/StudioLite/studio를 findle 전 데모용으로 일반화"
```

---

### Task 3: leaderboard(badge) 뱃지 오픈 프레임 동기화

`study()`의 뱃지 언락은 `setTimeout(700ms)`이라 프레임에서 안 열린다. 동기 `openBadge()`를 추가하고 badgeScenario에 명시 오픈 스텝을 넣는다. `study()`의 기존 setTimeout은 compete/badge 라이브용으로 유지(멱등).

**Files:**
- Modify: `src/demos/findle/leaderboard/state.ts`
- Modify: `src/demos/findle/leaderboard/scenario.ts`

**Interfaces:**
- Consumes: 기존 `useLeaderboard` store.
- Produces: `useLeaderboard`에 `openBadge(): void`.

- [ ] **Step 1: `state.ts`에 `openBadge` 추가**

인터페이스(`closeBadge: () => void;` 위 등 적당한 위치)에 선언 추가:

```ts
  /** 프레임 결정론용 동기 뱃지 오픈 (setTimeout 없이) */
  openBadge: () => void;
```

store 구현에 `closeBadge` 옆에 추가:

```ts
  openBadge: () => set({ badgeOpen: true, badgeEarned: true }),
```

- [ ] **Step 2: `scenario.ts`의 badgeScenario에 오픈 스텝 삽입 — badgeScenario 전체 교체**

```ts
/** v2 — 뱃지 컬렉션: 순위 상승 → Top 3 뱃지 언락 클로즈업 */
export const badgeScenario: Scenario = {
  id: 'findle-leaderboard-badge',
  steps: [
    ...CLIMB,
    // 프레임 결정론: study()의 setTimeout 대신 명시적 동기 오픈
    { kind: 'do', run: () => st().openBadge() },
    { kind: 'cursor', target: 'badge-modal', ms: 800 },
    { kind: 'wait', ms: 2600 }, // 뱃지 연출 길게
    { kind: 'click', target: 'badge-cta', run: () => st().closeBadge() },
    { kind: 'wait', ms: 1400 },
  ],
};
```

- [ ] **Step 3: 타입 게이트**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Studio 시각 검증**

Run: `npm run studio` → `leaderboard-badge-ko` 스크럽.
Expected: XP 상승 → 순위 상승 배너 → **뱃지 언락 오버레이가 열리고** 정독 후 닫힘. `-en`도 동일 흐름.
Also: `npm run dev`에서 leaderboard(badge) Stage 라이브 자동재생이 여전히 정상(뱃지 열림)인지 눈으로 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/demos/findle/leaderboard/state.ts src/demos/findle/leaderboard/scenario.ts
git commit -m "feat(findle): leaderboard 뱃지 오픈을 프레임 결정론 동기 setter로"
```

---

### Task 4: quiz-gen(adaptive) 생성 스트리밍 프레임 동기화

`generate()`의 `sleep` 루프(phase·문항 순차 등장)를 동기 setter 4종 + 시나리오 스텝으로 대체. `generate()`는 screens onClick용으로 유지. `fastScenario`(렌더 대상 아님)는 손대지 않는다.

**Files:**
- Modify: `src/demos/findle/quiz-gen/state.ts`
- Modify: `src/demos/findle/quiz-gen/scenario.ts`

**Interfaces:**
- Consumes: 기존 `useQuizGen` store, `GENERATED`(data.ts, 문항 3개).
- Produces: `useQuizGen`에 `beginReading()`, `beginGenerating()`, `pushQuestion(index)`, `finishGenerate()`.

- [ ] **Step 1: `state.ts`에 동기 setter 추가**

인터페이스(`generate: () => void;` 아래)에 선언 추가:

```ts
  /** 프레임 결정론용 동기 생성 단계 setter — 시나리오가 타이밍을 구동 */
  beginReading: () => void;
  beginGenerating: () => void;
  /** GENERATED 앞에서 index+1개까지 노출(멱등 — 프레임 재생 안전) */
  pushQuestion: (index: number) => void;
  finishGenerate: () => void;
```

store 구현에 `generate` 아래 추가:

```ts
  beginReading: () => set({ phase: 'reading', questions: [] }),
  beginGenerating: () => set({ phase: 'generating' }),
  pushQuestion: (index) =>
    set({ questions: GENERATED.slice(0, Math.min(index + 1, GENERATED.length)) }),
  finishGenerate: () => set({ phase: 'done' }),
```

- [ ] **Step 2: `scenario.ts`의 adaptiveScenario 재작성 — adaptiveScenario 전체 교체**

```ts
/** v2 — 난이도 적응(중→대학): 고급 선택 후 생성, 레벨 태그 강조 (프레임 결정론 스텝) */
export const adaptiveScenario: Scenario = {
  id: 'findle-quiz-gen-adaptive',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'url-input', ms: 600 },
    { kind: 'type', target: 'url-input', text: () => ARTICLE.url, cps: 22, set: (v) => st().setUrl(v) },
    { kind: 'wait', ms: 500 },
    { kind: 'cursor', target: 'difficulty-select', ms: 600 },
    { kind: 'do', run: () => st().setDifficulty('advanced') },
    { kind: 'wait', ms: 700 },
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().beginReading() },
    { kind: 'wait', ms: 1300 }, // 기사 분석
    { kind: 'do', run: () => st().beginGenerating() },
    { kind: 'cursor', target: 'result-panel', ms: 700 },
    { kind: 'do', run: () => st().pushQuestion(0) },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().pushQuestion(1) },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().pushQuestion(2) },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().finishGenerate() },
    { kind: 'wait', ms: 1600 },
  ],
};
```

- [ ] **Step 3: 타입 게이트**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Studio 시각 검증**

Run: `npm run studio` → `quiz-gen-adaptive-ko` 스크럽.
Expected: URL 타이핑 → 고급 난이도 → 생성 클릭 → "기사 분석 중" → "생성 중" → 문항 3개가 순차로 등장 → "생성 완료". `-en`은 문항/문구가 영어. (텍스트 캡처 언어 확인 — en 컴포지션에서 영어 문항인지.)

- [ ] **Step 5: 커밋**

```bash
git add src/demos/findle/quiz-gen/state.ts src/demos/findle/quiz-gen/scenario.ts
git commit -m "feat(findle): quiz-gen 생성 스트리밍을 프레임 결정론 스텝으로"
```

---

### Task 5: teacher-report(full) 4개 흐름 프레임 동기화 + waitFor 제거

`generate`/`openStudent`/`startDispatch`/`notify`의 async를 동기 setter로 분해하고, 스트리밍은 시나리오 `stream` 스텝(누적 append)으로, 발송은 명시 카운터 스텝으로 대체. `waitFor` 제거(프레임 폴링 불가). 기존 async 메서드는 screens onClick용으로 유지.

**Files:**
- Modify: `src/demos/findle/teacher-report/state.ts`
- Modify: `src/demos/findle/teacher-report/scenario.ts`

**Interfaces:**
- Consumes: 기존 `useTeacherReport`, `REPORT_SUMMARY`/`CLASS`/`STR`/`findStudent`/`slug`(data.ts), `getLang`/`pick`(i18n).
- Produces: `useTeacherReport`에 `beginReport()`, `reportWriting()`, `appendReport(chunk)`, `reportSectionsReady()`, `reportDone()`, `beginCoach(name)`, `coachWriting()`, `appendCoach(chunk)`, `coachDone()`, `beginDispatch()`, `setSentCount(n)`, `dispatchDone()`, `showNotice(msg)`.

- [ ] **Step 1: `state.ts`에 동기 setter 추가**

인터페이스(`notify: (msg: string) => void;` 아래)에 선언 추가:

```ts
  // 프레임 결정론용 동기 setter — 시나리오가 타이밍/스트리밍을 구동 (append는 누적)
  beginReport: () => void;
  reportWriting: () => void;
  appendReport: (chunk: string) => void;
  reportSectionsReady: () => void;
  reportDone: () => void;
  beginCoach: (name: string) => void;
  coachWriting: () => void;
  appendCoach: (chunk: string) => void;
  coachDone: () => void;
  beginDispatch: () => void;
  setSentCount: (n: number) => void;
  dispatchDone: () => void;
  showNotice: (msg: string) => void;
```

store 구현에 `notify` 아래 추가(`getLang`/`STR`/`ahead`는 이미 파일 상단에 존재):

```ts
  beginReport: () =>
    set((s) => ({
      flow: ahead(s.flow, 'report'),
      phase: 'analyzing',
      statusText: STR.statusAnalyzing[getLang()],
      reportText: '',
      sectionsReady: false,
    })),
  reportWriting: () => set({ phase: 'writing', statusText: STR.statusWriting[getLang()] }),
  appendReport: (chunk) => set((s) => ({ reportText: s.reportText + chunk })),
  reportSectionsReady: () => set({ sectionsReady: true }),
  reportDone: () => set({ phase: 'done' }),

  beginCoach: (name) =>
    set((s) => ({
      flow: ahead(s.flow, 'student'),
      selectedStudent: name,
      coachPhase: 'analyzing',
      coachStatus: STR.statusCoaching[getLang()],
      coachText: '',
    })),
  coachWriting: () => set({ coachPhase: 'writing' }),
  appendCoach: (chunk) => set((s) => ({ coachText: s.coachText + chunk })),
  coachDone: () => set({ coachPhase: 'done' }),

  beginDispatch: () =>
    set((s) => ({ flow: ahead(s.flow, 'send'), dispatchOpen: true, dispatchPhase: 'sending', sentCount: 0 })),
  setSentCount: (n) => set({ sentCount: n }),
  dispatchDone: () => set({ dispatchPhase: 'done' }),

  showNotice: (msg) => set({ notice: msg }),
```

- [ ] **Step 2: `scenario.ts`의 fullScenario 재작성 — 파일 전체 교체**

```ts
import type { Scenario } from '../../../engine/types';
import { getLang, pick } from '../_shared/i18n';
import { CLASS, findStudent, REPORT_SUMMARY, slug, STR } from './data';
import { useTeacherReport } from './state';

const st = () => useTeacherReport.getState();
const leo = `student-${slug('Leo Park')}`;

/**
 * 흐름 내레이션 워크스루 — 프레임 결정론 버전. async generate/openStudent/startDispatch/notify 대신
 * 동기 setter + stream/카운터 스텝으로 구동한다(라이브·프레임 공용). waitFor 제거.
 *  ① 개요 → ② AI 반 리포트 → ③ 전 학생 발송 → ④ 학생 리포트 심층.
 */
export const fullScenario: Scenario = {
  id: 'findle-teacher-report-full',
  steps: [
    // ① 개요
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'class-stats', ms: 800 },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'roster', ms: 800 },
    { kind: 'wait', ms: 1300 },

    // ② AI 반 리포트 생성
    { kind: 'cursor', target: 'generate-report', ms: 700 },
    { kind: 'click', target: 'generate-report', run: () => st().beginReport() },
    { kind: 'wait', ms: 1200 }, // 분석
    { kind: 'do', run: () => st().reportWriting() },
    { kind: 'stream', text: () => REPORT_SUMMARY[getLang()], cps: 60, append: (s) => st().appendReport(s) },
    { kind: 'wait', ms: 300 },
    { kind: 'do', run: () => st().reportSectionsReady() },
    { kind: 'wait', ms: 500 },
    { kind: 'do', run: () => st().reportDone() },

    // 강점 → 약점 → 도움 필요 → 권고 검토
    { kind: 'cursor', target: 'report-strong', ms: 700 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'report-weak', ms: 650 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'report-needhelp', ms: 650 },
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'report-reco', ms: 650 },
    { kind: 'wait', ms: 1400 },

    // ③ 전 학생 맞춤 리포트 자동 발송 (waitFor 제거 → 명시 카운터)
    { kind: 'cursor', target: 'send-all', ms: 700 },
    { kind: 'click', target: 'send-all', run: () => st().beginDispatch() },
    { kind: 'wait', ms: 700 }, // 모달 등장
    { kind: 'do', run: () => st().setSentCount(1) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(2) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(3) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(4) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(5) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().setSentCount(CLASS.students) },
    { kind: 'wait', ms: 420 },
    { kind: 'do', run: () => st().dispatchDone() },
    { kind: 'wait', ms: 1600 }, // 발송 완료 배너 정독
    { kind: 'cursor', target: 'dispatch-done', ms: 600 },
    { kind: 'click', target: 'dispatch-done', run: () => st().closeDispatch() },
    { kind: 'wait', ms: 800 },

    // ④ 개별 학생 리포트 모달
    { kind: 'cursor', target: leo, ms: 700 },
    { kind: 'click', target: leo, run: () => st().beginCoach('Leo Park') },
    { kind: 'wait', ms: 900 }, // 분석
    { kind: 'do', run: () => st().coachWriting() },
    {
      kind: 'stream',
      text: () => findStudent('Leo Park')?.coaching[getLang()] ?? '',
      cps: 55,
      append: (s) => st().appendCoach(s),
    },
    { kind: 'do', run: () => st().coachDone() },
    { kind: 'wait', ms: 800 },

    { kind: 'cursor', target: 'student-radar', ms: 800 },
    { kind: 'wait', ms: 1900 }, // 오각형 정독
    { kind: 'cursor', target: 'student-strengths', ms: 700 },
    { kind: 'wait', ms: 1300 },
    { kind: 'cursor', target: 'student-trend', ms: 700 },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'student-coaching', ms: 700 },
    { kind: 'wait', ms: 1800 }, // 코칭 정독

    // 보호자 발송
    { kind: 'cursor', target: 'modal-send-guardian', ms: 700 },
    { kind: 'click', target: 'modal-send-guardian', run: () => st().showNotice(pick(STR.noticeSentGuardian, getLang())) },
    { kind: 'wait', ms: 1700 }, // 발송 토스트

    // 마무리
    { kind: 'cursor', target: 'student-radar', ms: 900 },
    { kind: 'wait', ms: 3200 },
  ],
};
```

- [ ] **Step 3: 타입 게이트**

Run: `npx tsc --noEmit`
Expected: PASS. (`CLASS`/`slug` import 추가됨. 미사용 import 없도록 확인 — `pick`/`getLang`/`REPORT_SUMMARY`/`findStudent`/`STR`/`CLASS`/`slug` 모두 사용.)

- [ ] **Step 4: Studio 시각 검증**

Run: `npm run studio` → `teacher-report-full-ko` 스크럽.
Expected: ① 개요 커서 → ② 리포트 생성("분석 중" → "작성 중" + 요약 텍스트가 한 글자씩 스트리밍 → 섹션 등장 → 완료) → 강/약/도움/권고 커서 → ③ 발송 모달 카운터 1→6 → 완료 배너 → 닫기 → ④ Leo 리포트 모달(코칭 텍스트 스트리밍) → 레이더/추이/코칭 커서 → 보호자 발송 토스트 → 마무리 홀드.
`-en`: 요약·코칭 텍스트가 **영어**로 스트리밍되는지 확인(언어 캡처 검증).

- [ ] **Step 5: 커밋**

```bash
git add src/demos/findle/teacher-report/state.ts src/demos/findle/teacher-report/scenario.ts
git commit -m "feat(findle): teacher-report 4개 흐름을 프레임 결정론 스텝으로(+waitFor 제거)"
```

---

### Task 6: 전체 회귀·마감 검증

**Files:** (코드 변경 없음 — 검증·문서)

- [ ] **Step 1: 전체 타입·빌드 게이트**

Run: `npm run build`
Expected: PASS (`tsc --noEmit && vite build && remotion bundle`까지 전부 성공). 실패 시 로그의 파일·라인 기준으로 해당 Task로 돌아가 수정.

- [ ] **Step 2: 10개 컴포지션 스크럽 스팟체크**

Run: `npm run studio` → 다음을 각각 스크럽:
- `daily-quiz-narrated-ko/en` — 회귀 없음(기존과 동일).
- `quiz-gen-adaptive-ko/en` — 문항 순차 생성.
- `leaderboard-badge-ko/en` — 뱃지 오버레이 오픈.
- `rewards-redeem-ko/en` — 교환 성공 오버레이.
- `teacher-report-full-ko/en` — 4개 흐름 전부 콘텐츠 재현, en은 영어 텍스트.

- [ ] **Step 3: 앱 Stage 라이브 회귀 확인**

Run: `npm run dev` → findle 5개 데모를 각각 Stage에서 자동재생 관람.
Expected: 시나리오 재작성 후에도 라이브 자동재생이 시각적으로 자연스러움(특히 quiz-gen 생성·teacher-report 스트리밍/발송). 눈에 띄는 회귀 없으면 통과. (Stage에서 5개 데모 모두 우상단 "🎞 Remotion Studio" 버튼 노출 확인.)

- [ ] **Step 4: (선택) mp4 스팟 렌더**

Run: `npx remotion render remotion/index.ts quiz-gen-adaptive-ko out/quiz-gen-adaptive-ko.mp4`
Expected: 렌더 성공, 산출 mp4에서 문항 생성 흐름 확인. (`out/`은 커밋하지 않음.)

- [ ] **Step 5: 완료 확인**

모든 Task 커밋 완료. 브랜치 상태 `git status` 클린 확인.

---

## Self-Review (작성자 체크)

- **스펙 커버리지:** 인프라 일반화(findleCompositions/DemoVideo/Root/DemoPlayer/StudioLite/studio) = Task 1~2. rewards 검증 = Task 2 Step 8. leaderboard badge = Task 3. quiz-gen = Task 4. teacher-report + waitFor 제거 = Task 5. 컴포지션 id 하위호환·언어 캡처 = Task 2 Step 2/Step 8, Task 4/5 검증. 회귀 = Task 6. 누락 없음.
- **플레이스홀더:** 없음. 모든 코드 블록은 실제 최종 내용.
- **타입 일관성:** `resolveFindle(featureId, variantId)` 시그니처가 DemoVideo/스펙과 일치. `DemoPlayer` props(`featureId/variantId/lang?/durationInFrames`)가 StudioLite 호출과 일치. store 신규 메서드명(`openBadge`/`beginReading`/`beginGenerating`/`pushQuestion`/`finishGenerate`/`beginReport`/`reportWriting`/`appendReport`/`reportSectionsReady`/`reportDone`/`beginCoach`/`coachWriting`/`appendCoach`/`coachDone`/`beginDispatch`/`setSentCount`/`dispatchDone`/`showNotice`)이 인터페이스·구현·시나리오에서 동일.
- **stream 이중 동작:** `append*` setter는 누적(`+=`). 프레임 모드는 매 프레임 `resetState()`로 대상 텍스트를 비운 뒤 접두사 1회 apply → 누적이라도 결과는 접두사. 라이브는 delta 누적. 양쪽 정합.
