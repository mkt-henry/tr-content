# 데모 영상 녹화·다운로드 — 설계 (Phase 2)

날짜: 2026-06-08
프로젝트: Treasurer Content Inbox 데모 스튜디오 (`src/`)
상태: 승인됨

## 목적

스튜디오 안에서 데모를 **녹화해 webm 파일로 다운로드**하는 기능. 원클릭으로 전체화면 자동 녹화한다.
인트로/아웃트로 포함 여부는 Phase 1에서 만든 `인트로/아웃트로` 토글을 그대로 사용한다(별도 옵션 없음).

브라우저에서 DOM(React 스테이지)을 영상으로 만드는 유일한 현실적 방법인
`getDisplayMedia()`(화면/탭 캡처) + `MediaRecorder`를 사용한다. 권한 프롬프트·캡처 대상 선택은
보안상 우회 불가하므로 `preferCurrentTab`으로 마찰을 최소화한다.

## 녹화 플로우 (원클릭 자동)

```
[녹화] 클릭
  → getDisplayMedia (탭/화면 선택, preferCurrentTab=현재 탭 기본)   ※ 취소 시 조용히 원상복귀
  → 스테이지 전체화면 진입
  → 카운트다운 3·2·1 (녹화 시작 전 — 영상에 미포함, 전환 jank 차단)
  → MediaRecorder.start()
  → 시퀀스 자동 재생: [인트로] → 데모 → [아웃트로]   (토글이 인트로/아웃트로 포함 결정)
  → 시퀀스 종료 → MediaRecorder.stop()
  → 전체화면 해제 → webm 자동 다운로드
```

- **인트로/아웃트로 포함 옵션 = 기존 `includeBranding` 토글 재사용**(DRY). 녹화 전에 토글로 선택.
- **녹화 중 상태**: 빨간 점 + "REC" 인디케이터(컨트롤바 영역). 녹화 중 다른 컨트롤 비활성.
- **정지**: 녹화 중 Stop → 시퀀스 취소 → `handlePlay` resolve → 그때까지 분량으로 정지·다운로드.
- **파일명**: `<project>-<variant>-<lang>.webm` (예: `treazer-real-gold-en.webm`). lang 없으면 생략.
- **포맷**: `video/webm` (vp9 우선, vp8, webm 순 폴백). 무음(데모는 오디오 없음).
- **미지원 브라우저**: `getDisplayMedia`/`MediaRecorder` 없으면 녹화 버튼 비활성 + 툴팁 안내.

## 아키텍처 & 파일

녹화 메커니즘(순수 유틸 + 훅)과 오케스트레이션(Stage)을 분리한다.

### 신규

- `src/lib/recorder.ts` — 순수 유틸(React 무관):
  - `recordingSupported(): boolean` — `navigator.mediaDevices.getDisplayMedia` && `MediaRecorder` 존재.
  - `requestDisplayStream(): Promise<MediaStream | null>` — `getDisplayMedia({ video: { frameRate: 30 }, audio: false, preferCurrentTab: true })`, 취소/거부 시 `null`.
  - `pickMimeType(): string` — `['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']` 중 `MediaRecorder.isTypeSupported`로 선택.
  - `downloadBlob(blob: Blob, filename: string): void` — `a[download]` 클릭 + objectURL 해제.
- `src/shell/useRecorder.ts` — 녹화 라이프사이클 훅. 반환 `{ recording, countdown, supported, recordSequence }`.
  - `recordSequence({ stageEl, filename, runSequence, countdownFrom=3 })`:
    스트림 요청(null이면 중단) → `recording=true` → 전체화면 진입 → 카운트다운(700ms 간격, `countdown` 상태) →
    `MediaRecorder.start()` → `await runSequence()` → `recorder.stop()`(+onstop 대기) → `downloadBlob` →
    `finally`: 트랙 정지·`recording=false`·`countdown=null`·전체화면 해제.

### 수정

- `src/lib/fullscreen.ts` — 기존 `toggleFullscreen` 유지 + `enterFullscreen(el)`/`exitFullscreen()` 추가(이미 전체화면이면 no-op).
- `src/shell/ControlBar.tsx` — `녹화` 버튼(lucide `Video`/`Circle`, `supported`일 때만 노출, `recording`/`playing` 중 비활성). 녹화 중에는 빨간 점 + "REC" 인디케이터. 신규 props: `recording`, `onRecord`, `canRecord`.
- `src/shell/Stage.tsx` — `useRecorder()` 사용. `handleRecord()` = `recordSequence({ stageEl: stageRef.current, filename, runSequence: () => handlePlay() })`. `countdown`이 있으면 풀스테이지 카운트다운 오버레이 렌더. ControlBar에 `recording`/`onRecord`/`canRecord` 전달.

### 오케스트레이션 재사용

- `runSequence`는 Phase 1의 `handlePlay`(인트로→데모→아웃트로, 토글 반영, 세대 토큰 취소 처리) 그대로 사용 — 시퀀스 로직 중복 없음.
- 녹화 중 Stop은 기존 `handleStop`이 처리 → `handlePlay` resolve → `recordSequence` 마무리.

## 엣지/에러

- picker 취소/거부 → `requestDisplayStream` null → 전체화면 진입 없이 조용히 종료.
- 네이티브 "공유 중지" → 트랙 `ended` → 녹화 truncate(시퀀스 자연 종료 후 다운로드). 드문 케이스, 허용.
- `preferCurrentTab`은 Chrome 전용 → 타입 캐스팅(`as`), 미지원 브라우저는 일반 picker로 폴백(동작 동일).
- 녹화 중 재진입 방지(`recording` 가드).

## 검증

- 녹화 버튼 클릭 → picker → 전체화면 → 카운트다운 → 시퀀스 녹화 → webm 다운로드.
- 토글 ON/OFF에 따라 인트로/아웃트로 포함/제외 반영.
- picker 취소 시 원상복귀(전체화면 안 들어감).
- 미지원 환경에서 버튼 비활성.
- `npm run build`(tsc --noEmit) 통과.

## 비목표 (Phase 2)

- mp4 트랜스코딩/서버 인코딩(webm만).
- 영상 편집·트리밍 UI.
- 오디오/내레이션.
