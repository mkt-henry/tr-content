# findle 전 데모 Remotion화 — 설계

날짜: 2026-07-20
관련: `2026-07-08-remotion-studio-lite-design.md` (daily-quiz 프레임 파이프라인 원형)

## 목표

현재 Remotion(프레임 기반 영상)으로 렌더 가능한 findle 데모는 `daily-quiz` 하나뿐이다.
나머지 4개 데모(`quiz-gen`, `leaderboard`, `rewards`, `teacher-report`)도 동일한 프레임
파이프라인으로 영상화한다. 각 데모는 **대표 variant 1개**를 **한국어/영어 2개 컴포지션**으로
만든다 (총 10개 컴포지션).

## 스코프

| 데모 | feature.id | 대표 variant | 컴포지션 id (ko / en) |
|---|---|---|---|
| daily-quiz | `findle-daily-quiz` | `narrated` | `daily-quiz-narrated-ko` / `-en` (기존 유지) |
| quiz-gen | `findle-quiz-gen` | `adaptive` | `quiz-gen-adaptive-ko` / `-en` |
| leaderboard | `findle-leaderboard` | `badge` | `leaderboard-badge-ko` / `-en` |
| rewards | `findle-rewards` | `redeem` | `rewards-redeem-ko` / `-en` |
| teacher-report | `findle-teacher-report` | `full` | `teacher-report-full-ko` / `-en` |

컴포지션 id 규칙: `{feature.id에서 findle- 제거}-{variantId}-{lang}`. 기존 daily-quiz id는
그대로라 CLI 렌더/딥링크 하위호환 유지.

## 핵심 제약: 프레임 결정론

프레임 드라이버(`remotion/DemoVideo.tsx`)는 매 프레임 `feature.resetState()` 후 타임라인의
동기 `run`/진행형 스텝만 재생해 프레임 F의 상태를 순수 계산한다. 따라서 **콘텐츠를 만드는 모든
상태 전환은 동기 setter이거나 시나리오 스텝으로 표현돼야** 한다. 스토어 내부 `setTimeout`/
`sleep`으로 흘리는 콘텐츠는 프레임 F에서 재현되지 않는다.

조사 결과 데모별 상태:

- **rewards(redeem)** — `redeemed` 성공 오버레이는 동기. `flash` 해제만 setTimeout(장식). → 프레임 재현 OK, **등록만**.
- **leaderboard(badge)** — `rankUp`은 동기지만 **뱃지 언락 오버레이(`badgeOpen`)가 setTimeout(700ms)** 로 열림 → 프레임에서 안 열림. 리팩터 필요.
- **quiz-gen(adaptive)** — `generate()`가 `sleep` 루프로 phase(reading→generating→done)와 문항을 순차 스트리밍(핵심 콘텐츠) → 프레임에서 빈 결과. 리팩터 필요.
- **teacher-report(full)** — `generate`/`openStudent`/`startDispatch`/`notify` 4개 async 스트리밍 + 시나리오 `waitFor` → 최대 리팩터.

엔진 확인: `src/engine/run.ts`는 클릭 시 `step.run()`만 호출하고 실제 DOM 클릭
(`el.click()`/`dispatchEvent`)을 디스패치하지 않는다. 따라서 screens의 `onClick` 핸들러는
스크립트 자동재생 중엔 호출되지 않는다(수동 상호작용 전용). → 기존 async 메서드를 그대로 두고
시나리오를 granular 스텝으로 바꿔도 이중 실행이 없다.

## 접근: 시나리오 주도(Option A)

스토어 내부 `sleep` 기반 콘텐츠 전환을 걷어내고 **명시적 시나리오 스텝**(`do`/`stream`)으로
옮긴다. 스토어에는 동기 granular setter를 추가한다. 그러면 라이브 스크립트 재생과 프레임 재생이
**같은 결정론적 시나리오**로 구동된다. 기존 async 메서드(`generate` 등)는 screens의 onClick
수동용으로 그대로 남긴다(자동재생 경로와 무관).

타임라인 엔진이 이미 지원하는 스텝을 활용:
- `stream` — 진행형 텍스트 누적(리포트/코칭 스트리밍).
- `do` — 즉시 동기 상태 전환(phase 전환, 뱃지 오픈, 문항 push, 발송 카운터).
- `type`/`wait`/`cursor`/`click` — 기존 그대로.

## 인프라 일반화 (기계적)

### 신규: `remotion/findleCompositions.ts`

webpack 번들러(`Config.overrideWebpackConfig`, `remotion bundle/studio`)는 Vite 전용
`import.meta.glob`을 못 쓴다. 그래서 registry를 안 거치고 5개 feature를 **직접 import**한다.

```ts
import dailyQuiz from '../src/demos/findle/daily-quiz';
import quizGen from '../src/demos/findle/quiz-gen';
import leaderboard from '../src/demos/findle/leaderboard';
import rewards from '../src/demos/findle/rewards';
import teacherReport from '../src/demos/findle/teacher-report';
import { buildTimeline } from './timeline';
import { FPS } from './meta';
import type { FeatureDefinition } from '../src/registry/types';

interface Spec { feature: FeatureDefinition; variantId: string; name: string; }

const SPECS: Spec[] = [
  { feature: dailyQuiz,     variantId: 'narrated', name: 'daily-quiz' },
  { feature: quizGen,       variantId: 'adaptive', name: 'quiz-gen' },
  { feature: leaderboard,   variantId: 'badge',    name: 'leaderboard' },
  { feature: rewards,       variantId: 'redeem',   name: 'rewards' },
  { feature: teacherReport, variantId: 'full',     name: 'teacher-report' },
];

const TAIL_FRAMES = Math.round(1.5 * FPS); // 마무리 여운

export interface FindleComposition {
  name: string;            // 'quiz-gen'
  featureId: string;       // 'findle-quiz-gen'
  variantId: string;       // 'adaptive'
  title: string;           // feature.title (사이드바 라벨)
  durationInFrames: number;
}

export const FINDLE_COMPOSITIONS: FindleComposition[] = SPECS.map((s) => {
  const variant = s.feature.variants.find((v) => v.id === s.variantId) ?? s.feature.variants[0];
  return {
    name: s.name,
    featureId: s.feature.id,
    variantId: variant.id,
    title: s.feature.title,
    durationInFrames: buildTimeline(variant.scenario, FPS).total + TAIL_FRAMES,
  };
});

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

`resolveFindle`은 전달된 `variantId`를 우선 사용한다(향후 데모당 복수 variant 확장 대비).
현재는 각 데모의 대표 variant와 동일.

### `remotion/DemoVideo.tsx` — 파라미터화

- 하드코딩된 `dailyQuiz`/`narrated` 제거. props를 `{ featureId: string; variantId: string; lang?: Lang }`로.
- `resolveFindle(featureId, variantId)`로 feature/variant 해석 (컴포지션 props는 JSON 직렬화 가능해야 하므로 문자열 id만 전달, 객체는 내부 해석).
- 타임라인은 `variant.scenario`로 빌드. `feature.resetState()`/`feature.Desktop`/`feature.chromeless` 그대로 사용.
- `useLayoutEffect`의 store 세팅에서 `featureId`/`variantId`를 props 기반으로.

### `remotion/Root.tsx` — 컴포지션 자동 생성

```tsx
<Folder name="findle">
  {FINDLE_COMPOSITIONS.flatMap((c) =>
    (['ko', 'en'] as const).map((lang) => (
      <Composition
        key={`${c.name}-${c.variantId}-${lang}`}
        id={`${c.name}-${c.variantId}-${lang}`}
        component={DemoVideo}
        durationInFrames={c.durationInFrames}
        fps={FPS} width={WIDTH} height={HEIGHT}
        defaultProps={{ featureId: c.featureId, variantId: c.variantId, lang }}
      />
    )),
  )}
</Folder>
```

### `remotion/meta.ts` — 슬림화

`FPS`/`WIDTH`/`HEIGHT`만 남긴다. 데모 의존 `DURATION_IN_FRAMES` 계산은 `findleCompositions.ts`로
이관(순환 의존 방지: meta는 findleCompositions를 import하지 않음).

### `src/shell/DemoPlayer.tsx` — 파라미터화

- props `{ featureId: string; variantId: string; lang?: Lang; durationInFrames: number; autoPlay?: boolean }`.
- `<Player>`에 `durationInFrames`, `inputProps={{ featureId, variantId, lang }}` 전달.
- 자동재생 unstick 로직은 그대로.

### `src/shell/StudioLite.tsx` — 멀티 데모 사이드바

- `FINDLE_COMPOSITIONS`로 좌측 목록 구성(5개 데모). 상단/하단에 ko/en 토글 하나.
- 선택 상태 `{ name, lang }`. 우측 `<DemoPlayer key={name+lang} ... />`.
- Studio 진입 시 초기 선택 = 직전에 보던 데모(`shellStore.studioReturn?.featureId`)에 해당하는 항목, 없으면 첫 항목.

### `src/shell/studio.ts` — 5개 등록

`REMOTION_COMPOSITIONS`에 5개 findle feature.id → `{ folder: 'findle', id: '{name}-{variantId}-ko' }`
등록. `hasRemotion`이 true가 되어 Stage/Gallery의 "🎞 Remotion Studio" 버튼이 5개 데모 모두 노출.
`FINDLE_COMPOSITIONS`를 단일 출처로 삼아 여기서 파생(중복 방지).

## 데모별 프레임 결정론 리팩터

원칙: 콘텐츠 setter는 동기, 타이밍은 시나리오. 기존 async 메서드는 onClick용으로 유지.

### rewards (redeem) — 검증만

`redeem()`의 `redeemed` 오버레이는 이미 동기. `flash` 해제 타이머는 장식(가드됨). 프레임 재생
확인만 하고 리팩터 없음. (flash가 프레임에서 계속 켜져 보이면 daily-quiz와 동일한 허용 오차.)

### leaderboard (badge) — 뱃지 오픈 동기화

- 스토어에 동기 setter 추가: `openBadge()` (`badgeOpen: true, badgeEarned: true`).
- `badgeScenario`에서 XP 획득 `study()` 후, 뱃지 언락 시점에 `{ kind: 'do', run: () => st().openBadge() }` +
  적절한 `wait`로 오버레이 정독 구간을 명시.
- `study()` 내부의 뱃지 setTimeout은 onClick 수동용으로 유지(자동재생 경로에선 시나리오가 담당).

### quiz-gen (adaptive) — 생성 스트리밍 동기화

- 스토어에 동기 setter 추가: `beginReading()`(phase=reading, questions=[]), `beginGenerating()`
  (phase=generating), `pushQuestion(i)`(GENERATED[i] append), `finishGenerate()`(phase=done).
- `adaptiveScenario`에서 `click generate-btn`의 run을 `beginReading()`로 바꾸고, 이어서:
  `wait`(기사 분석) → `do beginGenerating` → 문항별 `do pushQuestion(i)` + `wait` → `do finishGenerate`.
- 기존 async `generate()`는 onClick용으로 유지.

### teacher-report (full) — 4개 async 흐름 동기화 + waitFor 제거

- 스토어에 동기 setter 추가(콘텐츠 전환용):
  - 반 리포트: `beginReport()`(flow=report, phase=analyzing, statusText), `setReportWriting()`,
    `setReportText(s)`(스트리밍 누적 대체), `setSectionsReady()`, `finishReport()`.
  - 코칭: `beginCoach(name)`, `setCoachWriting()`, `setCoachText(s)`, `finishCoach()`.
  - 발송: `beginDispatch()`(dispatchOpen, sending, sentCount=0), `setSentCount(n)`, `finishDispatch()`.
  - 토스트: `showNotice(msg)` (해제는 시나리오 흐름상 홀드로 대체하거나 유지).
- `fullScenario` 재작성:
  - 반 리포트: `do beginReport` → `wait` → `do setReportWriting` → `stream REPORT_SUMMARY (append: setReportText)` → `wait` → `do setSectionsReady` → `wait` → `do finishReport`.
  - 발송: `do beginDispatch` → 학생 수만큼 `do setSentCount(n)` + `wait` 루프 → `do finishDispatch`.
    **`waitFor`는 제거**(프레임 폴링 불가) — 명시적 카운터 스텝으로 대체해 결정론화.
  - 코칭: `click 학생 run: beginCoach` → `wait` → `do setCoachWriting` → `stream coaching (append: setCoachText)` → `do finishCoach`.
- 기존 async 메서드는 onClick용으로 유지.
- 스트리밍의 랜덤 청크(`Math.random`)는 프레임 경로에서 미사용(시나리오 `stream`이 char 단위 결정론). 라이브 onClick 경로에만 남음 — 프레임 렌더는 `Math.random` 미의존.

## 데이터 흐름

```
Composition(id, defaultProps{featureId,variantId,lang})
  → DemoVideo(featureId,variantId,lang)
      → resolveFindle(featureId) → {feature, variant}
      → buildTimeline(variant.scenario) → computeFrameState(frame)
      → feature.resetState(); runs; progressive  (프레임 F 상태 재구성)
      → <feature.Desktop/> 렌더
앱 내: StudioLite → DemoPlayer(featureId,variantId,lang,duration) → <Player component=DemoVideo/>
```

## 하위호환 / 회귀 방지

- daily-quiz 컴포지션 id 불변(`daily-quiz-narrated-ko/en`) → 기존 딥링크·CLI 렌더 무영향.
- 라이브 스크립트 재생(Stage)도 같은 시나리오를 쓰므로, 리팩터 후 각 데모의 라이브 자동재생이
  시각적으로 동일한지 검증 필요(특히 quiz-gen/teacher-report 스트리밍 타이밍).

## 리스크와 완화

1. **라이브 회귀** — 시나리오 재작성이 Stage 자동재생 모양을 바꿀 수 있음. → 리팩터 전후로 각 데모를 Stage에서 눈으로 비교.
2. **teacher-report 복잡도** — 4개 흐름 + 모달. → 데모별 독립 커밋, Studio에서 프레임 스크럽으로 각 구간 확인.
3. **duration 편차** — 시나리오별 길이 상이. → `findleCompositions`에서 타임라인 기반 개별 계산(고정값 금지).
4. **webpack/Vite 경계** — `findleCompositions`는 registry(`import.meta.glob`) 미사용, 직접 import만. StudioLite(Vite측)는 `FINDLE_COMPOSITIONS` 메타(가벼운 배열)만 import.

## 검증

- `npm run studio`(webpack) 로 10개 컴포지션이 findle 폴더에 모두 뜨고 각각 스크럽 시 콘텐츠가 프레임별로 재현되는지.
- `npm run dev` → 각 findle 데모 Stage에서 "🎞 Remotion Studio" 진입 → 해당 데모 자동 선택 + ko/en 전환.
- `tsc --noEmit` 통과.
- (선택) `remotion render`로 1~2개 컴포지션 mp4 스팟 렌더.

## 스코프 밖

- 비대표 variant 영상화(추후 SPECS에 추가하면 자동 확장).
- findle 외 프로젝트(aria/treazer) Remotion화.
- 오디오/내레이션 TTS.
