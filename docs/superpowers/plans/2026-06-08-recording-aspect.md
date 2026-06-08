# 녹화 영상 비율 제어 (모바일 9:16 / PC 16:9) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 녹화 다운로드 영상을 디바이스에 맞춰 모바일 9:16(1080×1920) / PC 16:9(1920×1080)로 저장한다.

**Architecture:** `getDisplayMedia` 캡처(가로) 스트림을 목표 비율 캔버스로 cover-크롭(중앙)해 `canvas.captureStream()`으로 만든 스트림을 MediaRecorder에 넣는다. 목표 비율은 effective device로 결정한다.

**Tech Stack:** React 18 + TS, 브라우저 `getDisplayMedia`/`MediaRecorder`/`canvas.captureStream`. 테스트 러너 없음 → 검증은 `npm run build`(tsc --noEmit) + 수동 녹화 확인(권한 프롬프트라 자동 불가).

**검증 방식:** 각 태스크 `npx tsc --noEmit` 통과 후 커밋. 녹화 자체는 사용자 제스처+권한 필요 → 마지막에 코드 정합 + 빌드로 검증, 실제 webm 치수는 수동 확인.

---

### Task 1: lib/recorder.ts — cropToAspect

**Files:**
- Modify: `src/lib/recorder.ts`

- [ ] **Step 1: cropToAspect 추가**

`src/lib/recorder.ts` 끝에 추가:

```ts
/**
 * 캡처 스트림을 목표 비율 캔버스로 cover-크롭(중앙)해 새 스트림으로 반환한다.
 * 가로 캡처를 9:16/16:9 등 목표 비율로 잘라 정확한 해상도의 영상을 만든다.
 * stop()으로 rAF·video를 정리한다(원본 source 트랙 정지는 호출자가 담당).
 */
export function cropToAspect(
  source: MediaStream,
  targetW: number,
  targetH: number,
): { stream: MediaStream; stop: () => void } {
  const video = document.createElement('video');
  video.srcObject = source;
  video.muted = true;
  video.playsInline = true;
  void video.play();

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  const targetAspect = targetW / targetH;

  let raf = 0;
  const draw = () => {
    raf = requestAnimationFrame(draw);
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!ctx || vw === 0 || vh === 0) return; // 메타데이터 미수신 프레임 스킵
    const srcAspect = vw / vh;
    let sw: number;
    let sh: number;
    let sx: number;
    let sy: number;
    if (srcAspect > targetAspect) {
      // 소스가 더 넓음 → 높이 맞추고 좌우 크롭
      sh = vh;
      sw = sh * targetAspect;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      // 소스가 더 좁음 → 너비 맞추고 상하 크롭
      sw = vw;
      sh = sw / targetAspect;
      sx = 0;
      sy = (vh - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
  };
  raf = requestAnimationFrame(draw);

  const stream = canvas.captureStream(30);
  const stop = () => {
    cancelAnimationFrame(raf);
    video.pause();
    video.srcObject = null;
  };
  return { stream, stop };
}
```

- [ ] **Step 2: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0). (아직 사용처 없어도 통과.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/recorder.ts
git commit -m "feat(recording): cropToAspect — 캡처를 목표 비율로 cover 크롭"
```

---

### Task 2: useRecorder + Stage — 목표 비율 녹화 배선

**Files:**
- Modify: `src/shell/useRecorder.ts`
- Modify: `src/shell/Stage.tsx`

useRecorder와 Stage는 새 필수 인자(`targetWidth`/`targetHeight`)로 연결되므로 한 태스크에서 함께 적용한다.

- [ ] **Step 1: useRecorder — import + RecordOpts + 크롭 파이프라인**

`src/shell/useRecorder.ts`의 recorder import에 `cropToAspect`를 추가:

```ts
import { cropToAspect, downloadBlob, pickMimeType, recordingSupported, requestDisplayStream } from '../lib/recorder';
```

`RecordOpts`에 두 필드 추가:

```ts
interface RecordOpts {
  /** 전체화면 대상 (스테이지 루트) */
  stageEl: HTMLElement | null;
  /** 저장 파일명 (확장자 포함) */
  filename: string;
  /** 녹화할 재생 시퀀스 — 완료 시 resolve (Stage의 handlePlay 재사용) */
  runSequence: () => Promise<void>;
  /** 출력 가로 픽셀 (예: 1080 또는 1920) */
  targetWidth: number;
  /** 출력 세로 픽셀 (예: 1920 또는 1080) */
  targetHeight: number;
  /** 녹화 시작 전 카운트다운 숫자 (기본 3) */
  countdownFrom?: number;
}
```

`recordSequence` 본문을 아래로 교체(원본 스트림을 cropToAspect로 감싸 크롭 스트림을 녹화, finally에서 크롭·원본 모두 정리):

```ts
  const recordSequence = useCallback(
    async ({ stageEl, filename, runSequence, targetWidth, targetHeight, countdownFrom = 3 }: RecordOpts) => {
      if (busyRef.current || !supported) return;
      const stream = await requestDisplayStream();
      if (!stream) return; // 사용자가 취소/거부 → 조용히 종료

      busyRef.current = true;
      setRecording(true);
      const mime = pickMimeType();
      const chunks: Blob[] = [];
      let crop: { stream: MediaStream; stop: () => void } | null = null;
      try {
        if (stageEl) await enterFullscreen(stageEl);

        // 캡처를 목표 비율로 크롭 — video 메타데이터가 카운트다운 동안 준비됨
        crop = cropToAspect(stream, targetWidth, targetHeight);

        // 카운트다운 — 녹화 시작 전이라 영상에 포함되지 않음
        for (let n = countdownFrom; n >= 1; n--) {
          setCountdown(n);
          await sleep(700);
        }
        setCountdown(null);

        const rec = new MediaRecorder(crop.stream, { mimeType: mime });
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
        crop?.stop();
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setCountdown(null);
        exitFullscreen();
        busyRef.current = false;
      }
    },
    [supported],
  );
```

- [ ] **Step 2: Stage — effective device로 목표 해상도 전달**

`src/shell/Stage.tsx`의 `handleRecord`를 아래로 교체(목표 해상도를 핸들러 안에서 계산, deps에 `device` 추가):

```tsx
  const handleRecord = useCallback(() => {
    if (runningRef.current) return; // 진행 중 시퀀스가 있으면 빈 녹화 방지
    const [targetWidth, targetHeight] = device === 'mobile' ? [1080, 1920] : [1920, 1080];
    void recordSequence({
      stageEl: stageRef.current,
      filename: recFilename,
      runSequence: () => handlePlay(),
      targetWidth,
      targetHeight,
    });
  }, [recordSequence, recFilename, handlePlay, device]);
```

(`device`는 Stage의 effective device 파생값 — `mobileOnly ? 'mobile' : rawDevice`. 모바일/Treazer면 1080×1920, 데스크탑이면 1920×1080.)

- [ ] **Step 3: 타입 통과 + 전체 빌드**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

Run: `npm run build`
Expected: vite 빌드 성공(`✓ built`).

- [ ] **Step 4: 시각/수동 확인**

dev 서버에서:
- (코드 정합) 녹화 버튼 → picker → 카운트다운 → 시퀀스 녹화 → webm 다운로드 흐름이 그대로 동작하는지(빌드/타입).
- **(수동, 권한 필요)** Treazer(모바일)에서 녹화 → 받은 webm이 **1080×1920(9:16)**, 중앙 폰/인트로가 꽉 차게. ARIA(데스크탑)에서 녹화 → **1920×1080(16:9)**. (브라우저 권한 프롬프트라 자동 검증 불가 — 사용자 확인 권장.)

- [ ] **Step 5: Commit**

```bash
git add src/shell/useRecorder.ts src/shell/Stage.tsx
git commit -m "feat(recording): effective device 기준 9:16/16:9 크롭 녹화"
```

---

## 변경 파일 요약

| 파일 | 역할 |
|------|------|
| `lib/recorder.ts` (수정) | `cropToAspect(source, targetW, targetH)` — cover 크롭 스트림 |
| `shell/useRecorder.ts` (수정) | `RecordOpts`에 targetWidth/Height, 크롭 스트림 녹화 + 정리 |
| `shell/Stage.tsx` (수정) | effective device → 1080×1920 / 1920×1080 전달 |
