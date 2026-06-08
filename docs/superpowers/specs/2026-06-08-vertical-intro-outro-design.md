# 인트로/아웃트로 세로(9:16) 대응 — 설계

날짜: 2026-06-08
프로젝트: Treasurer Content Inbox 데모 스튜디오 (`src/`)
상태: 승인됨

## 목적

현재 인트로/아웃트로(Phase 1)는 가로 16:9로만 렌더된다. Treazer·Treasurer는 모바일 서비스라
릴스/숏츠(세로 9:16)로 콘텐츠를 만들므로, **디바이스 모드가 모바일일 때 인트로/아웃트로를 세로 9:16
풀블리드로 구성**한다(데스크탑 모드는 기존 16:9 유지).

선택된 방향: 인트로/아웃트로가 세로 9:16 캔버스를 꽉 채우고(폰 베젤 없음), 그 다음 폰 데모가 등장하는
"풀블리드 → 디바이스" 흐름(브레인스토밍 A안).

## 동작

- **모바일 모드**: 인트로/아웃트로가 화면 중앙의 **세로 9:16 패널**(높이 ≈ 폰과 동일 `min(82vh, 780px)`,
  둥근 모서리)을 풀블리드로 채움. 양옆은 기존 스테이지 배경. 인트로(9:16) → 폰 데모(중앙, 9:16 안에 들어옴)
  → 아웃트로(9:16)로 일관된 세로 컬럼.
- **데스크탑 모드**: 지금처럼 16:9 풀스테이지(`inset-0`). 변경 없음.
- 시퀀스/토글/녹화 연동 로직은 불변 — 레이아웃(프레임 모양 + 라인 방향)만 디바이스에 반응.

## 변경

### `src/branding/types.ts`
- `ProjectBranding.Intro`/`Outro` 타입을 `ComponentType` → `ComponentType<{ portrait: boolean }>`로 변경.
  (인트로/아웃트로가 세로/가로에 따라 시세 라인 기하·여백을 다르게 그리도록.)

### `src/shell/BrandOverlay.tsx`
- props에 `portrait: boolean` 추가(또는 `device`).
- `portrait`이면 phase 컴포넌트를 **중앙 정렬 9:16 패널**(height `min(82vh, 780px)`, `aspect-ratio: 9/16`,
  `overflow-hidden`, 둥근 모서리)로 감싼다. 아니면 기존처럼 `inset-0` 풀스테이지.
- phase에 `portrait`를 전달.
- 외곽 `motion.div`는 그대로 `absolute inset-0 z-40`(클릭 스킵). 모바일 패널 중앙 정렬 위해 `flex items-center justify-center` 추가.

### `src/demos/treazer/_shared/branding.tsx`
- `TreazerIntro`/`TreazerOutro`가 `{ portrait }` prop을 받는다.
- 시세 라인 path를 방향별로: 가로(기존 `0..320 x 0..180`, 좌하→우상) / 세로(예: `0..140 x 0..250`, 더 가파른 상승)로 분기.
- 중앙 스택(코인·워드마크·태그라인·CTA)은 그대로 중앙 정렬(두 방향 모두 OK). 세로 패널에서 과하지 않게 폰트는
  필요 시 소폭 축소(clamp/vmin) — 시각 확인 후 조정.
- `treazerBranding`(introMs/outroMs) 불변.

### `src/shell/Stage.tsx`
- `<BrandOverlay>`에 `portrait={device === 'mobile'}`(또는 `device={device}`) 전달.

## 검증

- 데스크탑 모드: 인트로/아웃트로가 기존과 동일하게 16:9 풀스테이지.
- 모바일 모드: 인트로/아웃트로가 중앙 세로 9:16 패널로 풀블리드, 폰 데모와 수직 중앙·높이 정렬, 라인이 세로에서 자연스러움.
- 디바이스 토글(D)로 가로↔세로 전환 시 인트로/아웃트로도 따라 바뀐다.
- 시퀀스(인트로→데모→아웃트로)·스킵·녹화 연동 회귀 없음.
- `npm run build`(tsc --noEmit) 통과.

## 비목표

- 녹화를 실제 9:16 파일로 출력/크롭(Phase 2 녹화 영역). 이번엔 인트로/아웃트로 세로 구성만.
- 데스크탑 인트로/아웃트로 디자인 변경.
