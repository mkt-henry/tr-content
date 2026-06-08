# Treazer 모바일 전용 — 설계

날짜: 2026-06-08
프로젝트: Treasurer Content Inbox 데모 스튜디오 (`src/`)
상태: 승인됨

## 목적

Treazer는 모바일 서비스이므로 데모도 **모바일(세로 폰) UI만** 제공한다. Treazer 데모는 항상 폰
화면으로 진입·재생되고 데스크탑 뷰로 전환할 수 없게 한다. ARIA 등 다른 프로젝트는 기존대로
데스크탑/모바일 전환을 유지한다.

선택된 스코프(최소): 모바일 강제 + 데스크탑 토글 숨김. 기존 Treazer `Desktop.tsx`는 그대로 두되
Treazer에선 렌더되지 않는다(무해).

## 접근: mobileOnly 플래그 + 파생 effective device

스토어의 `device` 상태를 강제로 바꾸지 않고, 프로젝트 플래그로 **effective device를 파생**한다.
→ 다른 프로젝트(ARIA 등)의 device 선택에 영향을 주지 않는다(Treazer를 보고 와도 데스크탑 유지).

## 변경

### `src/registry/projects.ts`
- `ProjectDefinition`에 `mobileOnly?: boolean` 추가(주석: "true면 모바일 UI만 제공 — 데스크탑 전환 불가").
- `treazer` 항목에 `mobileOnly: true` 추가. 다른 프로젝트는 미설정(기존 동작).

### `src/shell/Stage.tsx`
- `mobileOnly = !!getProject(getProjectIdOfFeature(feature.id))?.mobileOnly` 계산(`getProject` import 추가).
- 스토어 device를 `rawDevice`로 받고, **`const device = mobileOnly ? 'mobile' : rawDevice`** 파생.
  이 파생 `device`를 기존 로직(Comp 선택, `BrandOverlay portrait={device === 'mobile'}`, 리셋 effect deps)에 그대로 사용.
- 키보드 `D` 단축키: `mobileOnly`면 `toggleDevice` 무시.

### `src/shell/ControlBar.tsx`
- `mobileOnly = !!getProject(projectId)?.mobileOnly` 계산(`projectId`·`getProject`는 이미 사용 중).
- 스토어 device를 받아 effective device 파생(`mobileOnly ? 'mobile' : device`)해 폰프레임/브라우저프레임 조건부에 사용.
- **데스크탑/모바일 토글 버튼(Smartphone/Monitor)을 `mobileOnly`면 숨김**(`{!mobileOnly && ...}`).
- 폰프레임 토글은 모바일 옵션이라 유지(effective device가 mobile일 때 표시). 브라우저프레임 토글은 데스크탑 전용이라 effective device가 mobile이면 자동 비표시.

## 검증

- Treazer 데모 진입 시 항상 폰(세로) UI로 렌더. ControlBar에 데스크탑 토글 없음. `D` 키 무반응.
- Treazer 인트로/아웃트로가 자동으로 세로 9:16(effective device=mobile → portrait).
- ARIA 데모는 기존대로 데스크탑 기본 + 데스크탑/모바일 토글 동작(회귀 없음).
- Treazer를 본 뒤 ARIA로 가도 ARIA는 데스크탑(스토어 device 미오염).
- `npm run build`(tsc --noEmit) 통과.

## 비목표

- `FeatureDefinition.Desktop` optional화 / Treazer `Desktop.tsx` 삭제(전체 정리 안). 이번엔 동작만 모바일 전용.
- 다른 프로젝트의 mobileOnly 지정(Treasurer 등은 추후 한 줄로 가능).
