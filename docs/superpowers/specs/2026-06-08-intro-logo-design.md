# 인트로 디자인 단순화 (배경 + 중앙 로고) — 설계

날짜: 2026-06-08
프로젝트: Treasurer Content Inbox 데모 스튜디오 (`src/`)
상태: 승인됨

## 목적

Treazer 인트로를 화려한 "금 시세 라인 → 코인 → 워드마크 → 태그라인" 시퀀스에서,
**무난한 "그라디언트 배경 + 중앙 로고 페이드인"**으로 단순화한다.

## 변경

### `src/demos/treazer/_shared/branding.tsx` — `TreazerIntro`만

- **금 시세 라인 SVG 애니메이션 제거.**
- 배경: 기존 `TZ_BACKGROUND` 웜 다크 그라디언트 유지.
- 중앙 스택(부드러운 등장 후 유지):
  - 골드 코인(`Coin`) — 스케일·페이드 인
  - `Treazer.` 워드마크(`DarkWordmark`) — 페이드업
  - `LEARN & EARN GOLD` 태그라인 — 페이드
- `introMs`(2500) 유지. 모바일/PC 양쪽 중앙 정렬(라인이 없어 `portrait` 방향 분기 불필요 → `TreazerIntro`는 `portrait` 미사용, prop 없는 컴포넌트로 단순화. `ProjectBranding.Intro` 타입 `ComponentType<{ portrait?: boolean }>`에 prop 없는 컴포넌트도 할당 가능하므로 타입 변경 불필요).
- `TreazerOutro`·`treazerBranding`·`LINE_PORTRAIT/LANDSCAPE`(아웃트로가 계속 사용)·`DarkWordmark`는 그대로.

## 검증

- 인트로 재생 시 라인 없이 배경 + 중앙 로고가 부드럽게 등장.
- 데스크탑 16:9 / 모바일 9:16(BrandOverlay 레터박스) 양쪽에서 중앙 정렬.
- 아웃트로·시퀀스·녹화 회귀 없음.
- `npm run build`(tsc --noEmit) 통과.

## 비목표

- 아웃트로 변경(요청은 인트로만 — 추후 필요 시 별도).
