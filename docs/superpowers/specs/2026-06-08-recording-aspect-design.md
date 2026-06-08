# 녹화 영상 비율 제어 (모바일 9:16 / PC 16:9) — 설계

날짜: 2026-06-08
프로젝트: Treasurer Content Inbox 데모 스튜디오 (`src/`)
상태: 승인됨

## 목적

데모 영상을 다운로드할 때 **디바이스에 맞는 비율**로 저장한다: 모바일(세로) → **9:16**, PC(가로) → **16:9**.
현재는 `getDisplayMedia`가 캡처한 탭(가로)을 그대로 저장해 항상 가로다. 출력 비율을 제어하려면
캡처 스트림을 목표 비율 캔버스로 크롭한 뒤 녹화해야 한다.

## 접근: 캔버스 크롭 파이프라인

```
getDisplayMedia(탭 캡처, 가로)
  → 숨김 <video>에 스트림 연결(muted, autoplay)
  → 목표 비율 캔버스(모바일 1080×1920 / PC 1920×1080)
  → requestAnimationFrame 루프: video 프레임을 캔버스에 cover-크롭(중앙) drawImage
  → canvas.captureStream(30) → MediaRecorder → webm (정확히 목표 해상도)
```

- **목표 비율 = effective device**: 모바일 → 9:16(`1080×1920`), PC → 16:9(`1920×1080`). Treazer(mobileOnly)는 항상 9:16.
- **크롭 = cover, 중앙 정렬**: 데모(폰/인트로 9:16 패널)가 화면 중앙에 있으므로 가로 캡처의 중앙을 목표 비율로 잘라낸다.
  - cover 크롭 계산: 소스(video) 비율과 목표 비율을 비교해, 목표 비율을 채우도록 소스에서 잘라낼 영역(sx,sy,sw,sh)을 중앙 기준으로 산출 → 캔버스 전체(0,0,targetW,targetH)에 그림.
- 캡처 해상도가 목표보다 작으면 업스케일(화질 약간 손해) — 일반 모니터에선 문제 없음.

## 변경

### `src/lib/recorder.ts`
- `cropToAspect(source: MediaStream, targetW: number, targetH: number): { stream: MediaStream; stop: () => void }` 추가.
  - 숨김 `<video>`(srcObject=source, muted, playsInline, autoplay) 생성 후 재생.
  - `<canvas>`(targetW×targetH) 생성, 2D ctx.
  - rAF 루프: 매 프레임 cover-크롭으로 `ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH)`.
    - 소스 비율 `sa = video.videoWidth/videoHeight`, 목표 비율 `ta = targetW/targetH`.
    - `sa > ta`(소스가 더 넓음)면 높이 맞추고 좌우 크롭: `sh = videoHeight; sw = sh*ta; sx=(videoWidth-sw)/2; sy=0`.
    - 아니면 너비 맞추고 상하 크롭: `sw = videoWidth; sh = sw/ta; sx=0; sy=(videoHeight-sh)/2`.
    - video가 아직 메타데이터 미수신(videoWidth=0)이면 그 프레임 스킵.
  - `stream = canvas.captureStream(30)` 반환.
  - `stop()`: rAF 취소, video 일시정지·srcObject 해제. (원본 source 트랙 정지는 호출자가 담당.)

### `src/shell/useRecorder.ts`
- `RecordOpts`에 `targetWidth: number; targetHeight: number` 추가.
- `recordSequence`: `requestDisplayStream()`(원본) → `cropToAspect(원본, targetWidth, targetHeight)` → MediaRecorder에 **크롭 stream** 사용.
- 정리(`finally`): 크롭 `stop()` + 원본 트랙 stop + 기존 상태 초기화.
- 카운트다운/시퀀스/다운로드 로직은 그대로. (크롭 캔버스는 카운트다운 동안 미리 돌려도 무방하나, 기존처럼 MediaRecorder는 카운트다운 후 start.)

### `src/shell/Stage.tsx`
- effective `device`로 목표 해상도 결정: `const [recW, recH] = device === 'mobile' ? [1080, 1920] : [1920, 1080];`
- `handleRecord`의 `recordSequence({ ..., targetWidth: recW, targetHeight: recH })`.

## 검증

- 모바일(또는 Treazer) 녹화 → 다운로드 webm이 **1080×1920(9:16)**, 중앙 폰/인트로 패널이 꽉 차게.
- PC 녹화 → **1920×1080(16:9)**.
- 인트로/아웃트로·시퀀스·카운트다운·정리 회귀 없음. picker 취소 시 원상복귀.
- `npm run build`(tsc --noEmit) 통과.

## 비목표

- mp4 트랜스코딩(webm 유지).
- 사용자 지정 해상도/비율 UI(고정 1080×1920 / 1920×1080).
- 오디오.
