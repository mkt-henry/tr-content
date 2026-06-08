# 데모 영상 녹화·다운로드 (Phase 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스튜디오에서 '녹화' 버튼 한 번으로 전체화면 자동 녹화(인트로→데모→아웃트로, 토글 반영)를 webm 파일로 다운로드한다.

**Architecture:** 녹화 메커니즘은 순수 유틸(`lib/recorder.ts`) + 라이프사이클 훅(`shell/useRecorder.ts`)으로 분리하고, 오케스트레이션은 Stage가 기존 `handlePlay`(Phase 1 시퀀스)를 `runSequence`로 재사용한다. `getDisplayMedia`로 탭/화면을 캡처하고 `MediaRecorder`로 webm을 만든다. 녹화 중에는 컨트롤 바를 숨겨 영상에 UI가 들어가지 않게 한다.

**Tech Stack:** React 18 + TS, zustand, framer-motion, lucide-react, 브라우저 `getDisplayMedia`/`MediaRecorder`. 테스트 러너 없음 → 검증은 `npm run build`(tsc --noEmit) + 수동 시각 확인.

**검증 방식:** 각 태스크는 `npx tsc --noEmit` 통과 후 커밋. 녹화는 사용자 제스처+권한이 필요해 자동 테스트 불가 → 마지막에 dev 서버 수동 확인. 단위 테스트는 작성하지 않는다.

---

### Task 1: lib/recorder.ts — 녹화 순수 유틸

**Files:**
- Create: `src/lib/recorder.ts`

- [ ] **Step 1: 파일 생성**

```ts
/** 브라우저가 화면 캡처 + MediaRecorder를 지원하는가 */
export function recordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  );
}

/** 화면/탭 캡처 스트림 요청 — 사용자가 취소/거부하면 null */
export async function requestDisplayStream(): Promise<MediaStream | null> {
  try {
    // preferCurrentTab은 Chromium 전용으로 lib.dom 타입에 없다.
    // 객체 리터럴이 아닌 변수로 전달하면 초과 프로퍼티 검사를 피하면서 구조적으로 호환된다.
    const opts = { video: { frameRate: 30 }, audio: false, preferCurrentTab: true };
    return await navigator.mediaDevices.getDisplayMedia(opts);
  } catch {
    return null;
  }
}

/** 지원되는 webm 코덱 선택 (vp9 → vp8 → webm) */
export function pickMimeType(): string {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';
}

/** Blob을 파일로 다운로드 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

- [ ] **Step 2: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0). (아직 사용처 없어도 자체 통과.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/recorder.ts
git commit -m "feat(recording): getDisplayMedia/MediaRecorder 순수 유틸"
```

---

### Task 2: lib/fullscreen.ts — enter/exit 추가

**Files:**
- Modify: `src/lib/fullscreen.ts`

기존 `toggleFullscreen`은 그대로 두고 아래 두 함수를 추가한다.

- [ ] **Step 1: 함수 추가**

`src/lib/fullscreen.ts` 끝에 추가:

```ts
/** 전체화면 진입 (이미 전체화면이면 no-op). 거부/미지원은 무시하고 진행한다. */
export async function enterFullscreen(el: HTMLElement): Promise<void> {
  if (document.fullscreenElement) return;
  try {
    await el.requestFullscreen();
  } catch {
    /* 사용자가 거부했거나 미지원 — 녹화는 계속 진행 */
  }
}

/** 전체화면 해제 (전체화면이 아니면 no-op) */
export function exitFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
}
```

- [ ] **Step 2: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

- [ ] **Step 3: Commit**

```bash
git add src/lib/fullscreen.ts
git commit -m "feat(recording): fullscreen enter/exit 헬퍼"
```

---

### Task 3: shell/useRecorder.ts — 녹화 라이프사이클 훅

**Files:**
- Create: `src/shell/useRecorder.ts`

- [ ] **Step 1: 훅 생성**

```ts
import { useCallback, useRef, useState } from 'react';
import { downloadBlob, pickMimeType, recordingSupported, requestDisplayStream } from '../lib/recorder';
import { enterFullscreen, exitFullscreen } from '../lib/fullscreen';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RecordOpts {
  /** 전체화면 대상 (스테이지 루트) */
  stageEl: HTMLElement | null;
  /** 저장 파일명 (확장자 포함) */
  filename: string;
  /** 녹화할 재생 시퀀스 — 완료 시 resolve (Stage의 handlePlay 재사용) */
  runSequence: () => Promise<void>;
  /** 녹화 시작 전 카운트다운 숫자 (기본 3) */
  countdownFrom?: number;
}

/**
 * getDisplayMedia + MediaRecorder 녹화 라이프사이클.
 * recordSequence: 스트림 요청 → 전체화면 → 카운트다운(녹화 전, 영상 미포함)
 *   → 녹화 시작 → runSequence 대기 → 정지 → webm 다운로드 → 정리.
 */
export function useRecorder() {
  const supported = recordingSupported();
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const busyRef = useRef(false);

  const recordSequence = useCallback(
    async ({ stageEl, filename, runSequence, countdownFrom = 3 }: RecordOpts) => {
      if (busyRef.current || !supported) return;
      const stream = await requestDisplayStream();
      if (!stream) return; // 사용자가 취소/거부 → 조용히 종료

      busyRef.current = true;
      setRecording(true);
      const mime = pickMimeType();
      const chunks: Blob[] = [];
      try {
        if (stageEl) await enterFullscreen(stageEl);

        // 카운트다운 — 녹화 시작 전이라 영상에 포함되지 않음
        for (let n = countdownFrom; n >= 1; n--) {
          setCountdown(n);
          await sleep(700);
        }
        setCountdown(null);

        const rec = new MediaRecorder(stream, { mimeType: mime });
        rec.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        const stopped = new Promise<void>((resolve) => {
          rec.onstop = () => resolve();
        });
        rec.start();

        await runSequence();

        if (rec.state !== 'inactive') rec.stop();
        await stopped;
        downloadBlob(new Blob(chunks, { type: mime }), filename);
      } finally {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setCountdown(null);
        exitFullscreen();
        busyRef.current = false;
      }
    },
    [supported],
  );

  return { recording, countdown, supported, recordSequence };
}
```

- [ ] **Step 2: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

- [ ] **Step 3: Commit**

```bash
git add src/shell/useRecorder.ts
git commit -m "feat(recording): useRecorder 녹화 라이프사이클 훅"
```

---

### Task 4: ControlBar.tsx — 녹화 버튼 + BarButton disabled

**Files:**
- Modify: `src/shell/ControlBar.tsx`

- [ ] **Step 1: lucide import에 Video 추가**

기존 lucide import 객체에 `Video`를 알파벳 순서로 병합:

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
  Video,
} from 'lucide-react';
```

- [ ] **Step 2: Props에 녹화 관련 추가**

`interface ControlBarProps`에 두 필드 추가:

```tsx
  onFullscreen: () => void;
  onRecord: () => void;
  canRecord: boolean;
```

그리고 함수 시그니처 구조분해에 추가:

```tsx
export function ControlBar({ feature, variant, status, onPlay, onStop, onReset, onFullscreen, onRecord, canRecord }: ControlBarProps) {
```

- [ ] **Step 3: 녹화 버튼 렌더**

브랜딩 토글 블록(`{hasBranding && (...)}`) 다음에 녹화 버튼을 추가:

```tsx
        {hasBranding && (
          <BarButton onClick={toggleBranding} label="인트로/아웃트로" active={includeBranding}>
            <Clapperboard className="h-4 w-4" />
          </BarButton>
        )}

        {canRecord && (
          <BarButton onClick={onRecord} label="녹화 (전체화면)" disabled={playing}>
            <Video className="h-4 w-4 text-red-400" />
          </BarButton>
        )}
```

- [ ] **Step 4: BarButton에 disabled 지원 추가**

`BarButton` 컴포넌트를 아래로 교체(기존 props에 `disabled` 추가):

```tsx
function BarButton({
  children,
  onClick,
  label,
  active,
  highlight,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-zinc-100',
        active && 'bg-white/[0.08] text-brass-300',
        highlight && 'bg-brass-500/20 text-brass-300 hover:bg-brass-500/30',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 5: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0). (Stage가 아직 onRecord/canRecord를 안 넘기면 에러가 날 수 있으나, ControlBar는 Stage에서만 사용되므로 Task 5에서 함께 통과. 이 시점에 ControlBar 단독 타입은 맞다 — 호출부 누락 에러가 나면 Task 5에서 해소된다.)

- [ ] **Step 6: Commit**

```bash
git add src/shell/ControlBar.tsx
git commit -m "feat(recording): ControlBar 녹화 버튼 + BarButton disabled"
```

(주의: Step 5에서 `onRecord`/`canRecord` 필수 prop 추가로 Stage 호출부가 깨질 수 있다. 그 경우 tsc 에러는 Task 5 완료 후 해소된다. 이 태스크 커밋은 그대로 진행하고, 전체 빌드 검증은 Task 5에서 한다.)

---

### Task 5: Stage.tsx — 녹화 오케스트레이션 연결

**Files:**
- Modify: `src/shell/Stage.tsx`

- [ ] **Step 1: import 추가**

기존 import 블록에 추가:

```tsx
import { useRecorder } from './useRecorder';
```

- [ ] **Step 2: useRecorder 사용 + 파일명/handleRecord**

`const branding = getBranding(projectId);` 다음에 추가:

```tsx
  const { recording, countdown, supported: canRecord, recordSequence } = useRecorder();
  const lang = projectId ? projectLang[projectId] : undefined;
  const recFilename = [projectId, variant.id, lang].filter(Boolean).join('-') + '.webm';
```

그리고 `handleReset` 정의 다음에 `handleRecord` 추가:

```tsx
  const handleRecord = useCallback(() => {
    void recordSequence({
      stageEl: stageRef.current,
      filename: recFilename,
      runSequence: () => handlePlay(),
    });
  }, [recordSequence, recFilename, handlePlay]);
```

- [ ] **Step 3: ControlBar 호출부 — props 전달 + 녹화 중 숨김**

기존 `<ControlBar .../>` 블록을 아래로 교체(녹화 중에는 깨끗한 영상을 위해 컨트롤 바를 렌더하지 않음 — 정지는 Space 키로):

```tsx
      {!recording && (
        <ControlBar
          feature={feature}
          variant={variant}
          status={status}
          onPlay={handlePlay}
          onStop={handleStop}
          onReset={handleReset}
          onFullscreen={() => stageRef.current && toggleFullscreen(stageRef.current)}
          onRecord={handleRecord}
          canRecord={canRecord}
        />
      )}
```

- [ ] **Step 4: 카운트다운 오버레이 렌더**

`<FakeCursor />` 바로 위에 카운트다운 오버레이 추가:

```tsx
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key="rec-countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[120px] font-bold tabular-nums text-white"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <FakeCursor />
```

- [ ] **Step 5: 타입 통과 + 전체 빌드**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

Run: `npm run build`
Expected: vite 빌드 성공(`✓ built`).

- [ ] **Step 6: 시각 확인 (dev 서버)**

`npm run dev` 후 Treazer → "포인트가 아니라 진짜 금" 진입. 확인:
- 컨트롤 바에 빨간 비디오(녹화) 버튼이 보인다(`getDisplayMedia` 지원 브라우저).
- 녹화 클릭 → 탭/화면 선택 프롬프트 → (선택 시) 전체화면 + 3·2·1 카운트다운 → 시퀀스 재생 → 종료 시 webm 다운로드.
- 인트로/아웃트로 토글 ON이면 인트로·아웃트로 포함, OFF면 데모만 녹화.
- picker 취소 시 전체화면 진입 없이 원상복귀.
- 녹화 중 컨트롤 바가 사라져 영상에 UI가 안 들어간다(정지는 Space).

- [ ] **Step 7: Commit**

```bash
git add src/shell/Stage.tsx
git commit -m "feat(recording): Stage 녹화 오케스트레이션 + 카운트다운 오버레이"
```

---

## 변경 파일 요약

| 파일 | 역할 |
|------|------|
| `lib/recorder.ts` (신규) | `recordingSupported`/`requestDisplayStream`/`pickMimeType`/`downloadBlob` 순수 유틸 |
| `lib/fullscreen.ts` (수정) | `enterFullscreen`/`exitFullscreen` 추가 |
| `shell/useRecorder.ts` (신규) | 녹화 라이프사이클 훅 (`recording`/`countdown`/`supported`/`recordSequence`) |
| `shell/ControlBar.tsx` (수정) | 녹화 버튼 + `BarButton` disabled 지원 |
| `shell/Stage.tsx` (수정) | `handleRecord`(handlePlay 재사용) 연결, 녹화 중 컨트롤바 숨김, 카운트다운 오버레이 |
