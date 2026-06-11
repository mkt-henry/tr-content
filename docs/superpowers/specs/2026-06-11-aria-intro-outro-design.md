# ARIA 인트로 · 아웃트로 브랜딩 설계

날짜: 2026-06-11

## 목적

ARIA 데모 녹화 영상의 앞뒤에 붙는 브랜드 인트로/아웃트로 시퀀스를 만든다.
`treazer`와 동일한 `ProjectBranding` 메커니즘을 따르며, `BrandOverlay`가 재생한다.

## 결정 사항 (브레인스토밍 합의)

- **색감/무드**: 시그니처 블루 (로고 본래 색과 일관, 재보험 B2B 신뢰 톤)
- **로고**: 기존 화이트 워드마크(`Logo1_White.png`) 재사용 — `AriaWordmark` 컴포넌트 활용
- **태그라인**: `REINSURANCE INTELLIGENCE` (영문 대문자, letter-spacing 넓게)
- **아웃트로 마무리**: 로고 + 태그라인 + `by AlphaLenz`
  - 참고: 현재 데모 헤더들은 `by Treasurer`로 표기됨. 인트로/아웃트로만 `by AlphaLenz` (사용자 명시 요청).
- **재생 시간**: 인트로 2500ms, 아웃트로 3000ms (treazer와 동일)

## 구조

### 파일
- 신규: `src/demos/aria/_shared/branding.tsx`
- 수정: `src/branding/index.ts` — `aria: ariaBranding` 한 줄 등록

### 컴포넌트
- `AriaIntro({ portrait? })` — 풀스테이지 인트로
- `AriaOutro({ portrait? })` — 풀스테이지 아웃트로
- 두 컴포넌트 모두 `absolute inset-0` 풀스테이지. `portrait=true`(모바일 9:16)일 때
  `BrandOverlay`가 세로 패널로 감싸므로, 패널 폭에 맞게 로고 크기만 조정한다.
- export: `export const ariaBranding: ProjectBranding = { Intro, Outro, introMs, outroMs }`

### 배경 상수
```
ARIA_INTRO_BG = 
  radial-gradient(ellipse 70% 55% at 50% 18%, rgba(86,128,208,0.40), transparent 60%),
  radial-gradient(ellipse 60% 50% at 80% 100%, rgba(40,70,140,0.35), transparent 62%),
  linear-gradient(160deg,#0b1020 0%,#070a14 100%)
```

### 애니메이션 (framer-motion, treazer 패턴 차용)
- **인트로**: 컨테이너 `opacity 0→1, scale 0.96→1` (0.8s, ease `[0.22,1,0.36,1]`)
  → 로고 `opacity/y` 등장 → 태그라인 delay 0.2/0.55s 페이드/슬라이드업
- **아웃트로**: 컨테이너 `opacity 0, y 12→0` (delay 0.3, 0.6s)
  → 로고+태그라인 등장 → `by AlphaLenz` delay 0.9s 페이드업

### 스타일 토큰
- 태그라인: `text-[12~13px] font-semibold tracking-[0.22em] uppercase`, 색 `rgba(150,178,240,0.92)`
- 바이라인: `text-[11~12px]`, "by"는 `text-white/45`, "AlphaLenz"는 `text-white/80 font-semibold`
- 로고: 데스크탑 높이 약 `h-14~16`, 모바일(portrait) 패널 폭에 맞춰 약간 조정

## 의존성
- `framer-motion` (기존 사용 중)
- `AriaWordmark` (`src/demos/aria/_shared/AriaWordmark.tsx`)
- `ProjectBranding` 타입 (`src/branding/types.ts`)
- `BrandOverlay` (`src/shell/BrandOverlay.tsx`) — 변경 없음, 등록만으로 동작

## 검증
- `tsc --noEmit` 통과
- dev 서버에서 ARIA 데모 선택 시 인트로/아웃트로 토글이 노출되는지 확인
- 데스크탑/모바일(portrait) 양쪽 렌더 확인

## 범위 밖 (YAGNI)
- 데모 헤더의 `by Treasurer` → `by AlphaLenz` 일괄 변경 (별도 요청 시)
- 블랙/블루 로고 variant 사용 (이번엔 화이트만)
- 사운드/추가 모션 효과
