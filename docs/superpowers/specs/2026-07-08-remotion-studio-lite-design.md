# 인앱 Remotion Studio-lite 페이지 설계

- 날짜: 2026-07-08
- 상태: 설계 승인 대기

## 목적

프로덕션 `tr-content.vercel.app`에서 Remotion 영상 데모(daily-quiz)를 **재생·스크럽 관람**할 수 있게 한다.
현재 프로덕션에는 Remotion 관람 진입점이 사실상 없다:

- 갤러리·데모 페이지의 "Remotion Studio" 진입 버튼은 `import.meta.env.DEV`로 막혀 있어 프로덕션에 노출되지 않는다.
- 노출되더라도 `StudioView`는 `http://localhost:3000`(로컬 `remotion studio` 개발 서버)을 iframe으로 띄우므로 프로덕션에선 깨진다.
- 유일하게 프로덕션에서 작동하는 건 데모 페이지의 "🎞 Remotion 미리보기" 모달(`@remotion/player`)뿐이다.

Remotion Studio(`remotion studio`)는 Node 개발 서버라 정적 배포 불가하다. 따라서 프로덕션에서는
`@remotion/player` 기반의 **정적 "Studio-lite" 페이지**로 관람 경험을 제공한다.

## 범위

**대상**: daily-quiz 데모만 (한국어/영어 두 언어).

**범위 밖 (하지 않음)**:

- 범용 컴포지션 레지스트리 도입 / `remotion/Root.tsx` 재구조화
- MP4 서버 사이드 렌더링·다운로드
- daily-quiz 외 다른 데모의 Studio-lite 등록

## 아키텍처

### 신규 컴포넌트

#### `src/shell/DemoPlayer.tsx`

`@remotion/player`의 `<Player>`와 자동재생 "unstick" 로직을 감싼 공유 컴포넌트.
현재 `RemotionPreview`에만 있는 로직(프레임 0에서 초기 버퍼링으로 정지 → `seekTo(1)`로 한 번
깨운 뒤 `play()`, 프레임이 전진할 때까지 재시도, 3초 후 포기)을 이곳으로 추출한다.

- Props: `lang?: 'ko' | 'en'` (미지정 시 앱 현재 언어), `autoPlay?: boolean`, `className?: string`.
- 내부: `DemoVideo`를 `component`로, `DURATION_IN_FRAMES`/`FPS`/`WIDTH`/`HEIGHT`(`remotion/meta`)로 구성.
  `controls loop acknowledgeRemotionLicense`. `lang`이 주어지면 `inputProps={{ lang }}`로 전달.
- `RemotionPreview`와 `StudioLite`가 공통으로 사용한다.

#### `src/shell/StudioLite.tsx`

풀스크린 정적 페이지. 로컬·프로덕션 어디서든 동일하게 작동한다. 기존 `StudioView`(iframe)를 대체한다.

- **좌측 사이드바**: `findle` 폴더 아래 `daily-quiz · 한국어`, `daily-quiz · English` 두 항목.
  클릭으로 선택. 선택 언어를 로컬 state로 보관.
- **메인 영역**: 선택 언어를 `lang`으로 넘긴 `<DemoPlayer>` (큰 화면). 언어 전환 시 `key={lang}`로
  remount하여 `DemoVideo`의 전역 store 재구성이 깨끗하게 일어나도록 한다.
- **상단 바**: `← 목록으로`(갤러리로 복귀, `closeStudio`) · 제목("Remotion Studio") ·
  (dev 전용) `실제 Studio 새 탭 ↗` → `http://localhost:3000` 링크.

### 상태 (`src/store/shellStore.ts`)

`studioUrl: string | null` + `openStudio(url)` / `closeStudio()` 를 다음으로 변경:

- `studioOpen: boolean`
- `openStudio()` → `set({ studioOpen: true })`
- `closeStudio()` → `set({ studioOpen: false })`

더 이상 localhost URL을 상태로 들고 다니지 않는다.

### 진입점 변경

- **`src/App.tsx`**: `if (studioUrl) return <StudioView url={studioUrl}/>` →
  `if (studioOpen) return <StudioLite/>`.
- **`src/shell/Gallery.tsx`**: "Remotion Studio" 버튼의 `import.meta.env.DEV` 게이팅 제거.
  `onClick`을 `openStudio()`(인자 없음)로 변경 → 프로덕션에서도 노출.
- **`src/shell/Stage.tsx`**: "Studio ↗" 버튼의 `import.meta.env.DEV` 게이팅 제거,
  `openStudio()` 호출로 변경. 기존 "🎞 Remotion 미리보기" 모달 버튼은 유지.

### 정리

- **`src/shell/RemotionPreview.tsx`**: 인라인 `<Player>` + 자동재생 로직을 `<DemoPlayer>` 사용으로 교체.
- **`src/shell/StudioView.tsx`**: 삭제. `StudioLite`가 완전히 대체하며 iframe 경로는 더 이상 쓰지 않는다.

## 데이터 흐름

1. 사용자가 갤러리/데모에서 "Remotion Studio" 클릭 → `openStudio()` → `studioOpen = true`.
2. `App`이 `<StudioLite/>` 렌더.
3. 사이드바에서 언어 선택 → `<DemoPlayer lang={선택}/>`가 `key={lang}`로 remount.
4. `DemoPlayer`가 `<Player>`를 자동재생. `DemoVideo`가 프레임별로 전역 store를 재구성해 영상 재생.
5. `← 목록으로` → `closeStudio()` → `studioOpen = false` → 갤러리 복귀.

## 오류/엣지 케이스

- **자동재생 정지**: `DemoPlayer`의 unstick 로직(seekTo(1) 재시도, 3초 후 수동 재생 폴백)으로 처리.
  기존 `RemotionPreview` 동작 그대로 이관.
- **폰트 로드**: `DemoVideo`가 이미 처리(앱 임베드 시 delayRender 없음). Studio-lite도 동일 경로.
- **언어 전환 중 store 잔상**: `key={lang}` remount로 방지.
- **dev의 실제 Studio 링크**: `import.meta.env.DEV`일 때만 노출하여 프로덕션에서 죽은 링크 방지.

## 테스트/검증

- 로컬 `npm run dev`에서: 갤러리 "Remotion Studio" → Studio-lite 진입, ko/en 전환·재생·스크럽 확인.
- `npm run build` 성공(타입 체크 포함).
- 프로덕션 배포 후 tr-content.vercel.app에서 진입 버튼 노출·재생 확인.
