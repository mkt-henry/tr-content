# Remotion Studio ↔ 기존 데모 재생 상태 격리 (iframe realm)

- 날짜: 2026-07-21
- 상태: 설계 승인 대기 → 구현 플랜 예정
- 방식: **A. 격리** — 그중 **iframe realm 격리** (사용자 확정)

## 배경 / 문제

앱에는 같은 findle 데모를 보여주는 **두 개의 재생 시스템**이 있다.

| | 기존 데모 재생 (Stage) | Remotion Studio-lite (현재) |
|---|---|---|
| 위치 | `src/shell/Stage.tsx` | `src/shell/StudioLite.tsx` → `DemoPlayer` → `DemoVideo` |
| 타임 모델 | 벽시계 명령형 (`usePlayback`/`runScenario`) | 프레임 결정론 (`DemoVideo`) |
| 실행 realm | 앱 realm | **앱 realm (인앱 `@remotion/player`)** |

두 시스템이 **동일한 모듈 싱글턴 store**(`useShellStore`, `usePlaybackStore`, 데모별 `useDailyQuiz` 등)를 공유한다. Studio-lite의 `DemoVideo`가 렌더 부수효과로 이 store들에 매 프레임 써넣어 Stage 상태를 오염시킨다. 그래서 `shellStore`에 이미 **`studioReturn` 스냅샷/복원 해킹**이 들어가 있다(오염의 증거).

근본 원인은 **Studio-lite가 iframe이 아니라 인앱 Player라서 앱과 같은 JS realm의 싱글턴을 공유**한다는 것.

## 핵심 사실 (조사 결과)

1. 앱 realm에서 `DemoVideo`가 실행되는 경로는 **`StudioLite → DemoPlayer → DemoVideo` 하나뿐**이다. (`grep` 확인)
2. **Stage는 `DemoVideo`를 쓰지 않는다** — `feature.Desktop`을 명령형 엔진으로 직접 렌더한다.
3. 데모 시나리오가 store를 **명령형 클로저로 직접 참조**한다: `const st = () => useDailyQuiz.getState()`, `run: () => st().selectOption(0)`, `resetState: () => useDailyQuiz.getState().reset()`. 이 클로저는 React 밖(엔진)에서 실행되므로 React Context로 격리할 수 없다 → 순수 Context 방식은 17+ 파일 대규모 리팩터가 필요.
4. **Stage와 Studio는 절대 동시에 마운트되지 않는다** (`App.tsx`가 `studioOpen`에서 early-return).
5. 프로덕션 `/studio`는 이미 **완전 격리된 Remotion Studio 번들**(`dist/studio`, `remotion bundle` 산출물, `__remotion-studio-container`)이며 자기 realm에 모든 store 사본을 통째로 가진다. `vercel.json`이 `/studio`를 서빙한다.

→ 오염원은 "인앱 Player 하나"뿐이다. **그것만 iframe으로 바꾸면 realm이 분리되어 오염이 구조적으로 불가능해진다.** 데모 파일은 손대지 않는다.

## 불변 조건 (반드시 지킬 것)

> **기존 데모 영상 재생(Stage)은 절대 사라지거나 깨지지 않는다.**

- `src/shell/Stage.tsx`, 재생 엔진(`src/engine/*`), 데모 17개 파일(`src/demos/findle/*`)은 **무수정**.
- `DemoPlayer` 삭제는 인앱 Studio 뷰어에만 영향 — Stage 재생과 무관.
- 변경 후에도 갤러리 → 데모 열기 → Play/Pause/Reset/Record가 이전과 동일하게 동작해야 한다.

## 설계

### 변경 대상

1. **`src/shell/StudioLite.tsx`** — 인앱 `<DemoPlayer>`를 `<iframe>`으로 교체.
   - 상단 바: `← 목록으로`(닫기) + `새 탭 ↗`(iframe src를 새 탭으로).
   - 본문: iframe이 영역을 꽉 채움. **데모 목록 · ko/en 전환 · 스크럽은 iframe 안 Remotion Studio가 담당**(우리 커스텀 사이드바/토글 제거).
   - 열 때 현재 보던 데모/언어로 **딥링크**한다(아래 src 규칙).

2. **`src/store/shellStore.ts`** — `studioReturn` 스냅샷/복원 로직 **완전 삭제**.
   - `openStudio: () => set({ studioOpen: true })`
   - `closeStudio: () => set({ studioOpen: false })`
   - `studioReturn` 필드/타입 제거. (iframe realm의 DemoVideo는 부모 store를 절대 안 건드리므로 복원 불필요)

3. **`src/shell/DemoPlayer.tsx` 삭제** — 유일 사용처가 StudioLite였음(확인). 앱 realm에서 `DemoVideo` 진입점 제거.

4. **iframe src 헬퍼** (`remotion/studio.ts`에 추가 또는 StudioLite 내 로컬)
   - `base = import.meta.env.DEV ? 'http://localhost:3000' : '/studio'`
   - featureId가 컴포지션으로 resolve되면: `${base}/findle/${name}-${variantId}-${lang}`
   - 아니면(갤러리 등 featureId 없음): `${base}` (Studio 루트 — 사용자가 사이드바에서 선택)
   - `lang`은 현재 `projectLang.findle` 또는 기본 `'ko'`.
   - 컴포지션 id 포맷은 `remotion/Root.tsx`와 일치: `${name}-${variantId}-${lang}`, Folder `findle` → 경로 `/findle/${name}-${variantId}-${lang}`.

### 변경하지 않는 것

- `remotion/DemoVideo.tsx`, `remotion/Root.tsx`, `remotion/*` — iframe 안 번들이 렌더하는 대상. 무수정.
- `src/demos/findle/*` 전체 — 무수정.
- `Stage.tsx`, `src/engine/*` — 무수정. (Studio 진입 버튼의 `handleReset(); openStudio()`는 그대로 둔다 — featureId를 지우지 않아 딥링크에 쓰인다.)

### 진입 흐름

- **갤러리에서**: `openStudio()` → featureId 없음 → iframe = Studio 루트.
- **데모(Stage)에서**: `handleReset(); openStudio()` → featureId 유지 → iframe = 해당 컴포지션 딥링크(현재 언어).
- **닫기**: `closeStudio()` → `studioOpen=false` → `App.tsx`가 이전 화면(갤러리 또는 Stage) 그대로 복귀. iframe이 부모 store를 안 건드렸으므로 복원 로직 불필요.

### 개발 워크플로

- 인앱 Studio를 dev에서 보려면 `npm run dev`(앱)와 `npm run studio`(:3000)를 함께 실행한다.
- 이는 기존 코드가 이미 가정하던 방식(`studio.ts`의 `REMOTION_STUDIO_URL`, StudioLite의 "실제 Studio ↗" 링크)과 일치한다.
- prod는 `vercel.json`이 `/studio`를 서빙하므로 추가 서버 불필요.

## 리스크 / 구현 중 검증 항목

1. **prod 딥링크 base-path** — 번들이 `/studio/` 하위에 서빙될 때 Studio 라우터가 `/studio/findle/<comp>` 경로에서 컴포지션을 제대로 선택하는지 불확실.
   - **검증**: `npm run build` 후 `vercel dev`/배포에서 `/studio/findle/daily-quiz-fast-ko` 직접 접근 확인.
   - **폴백**: 딥링크가 prod에서 안 잡히면 prod src를 `/studio` 루트로 낮춘다(격리는 그대로, 사용자가 사이드바에서 1클릭). dev(:3000) 딥링크는 known-good.
2. **dev에서 `:3000` 미실행** — iframe이 연결 오류 표시. dev 전용 안내 문구(예: "`npm run studio` 실행 필요")를 iframe 위/대체로 얹어 완화(선택 사항, YAGNI 여지).

## 성공 기준

- [ ] Studio를 열고 스크럽/재생해도 닫은 뒤 Stage(기존 데모 영상)가 이전 상태 그대로 동작한다.
- [ ] `shellStore`에서 `studioReturn` 관련 코드가 사라졌고 앱이 정상 빌드된다(`tsc --noEmit`).
- [ ] 갤러리·데모 양쪽 진입점에서 Studio가 열리고 `← 목록으로`로 정확히 이전 화면에 복귀한다.
- [ ] 데모 재생/녹화 UX(Play/Pause/Reset/Record)가 변경 전과 동일하다.
- [ ] dev에서 `:3000` 딥링크로 해당 데모가 열린다.
