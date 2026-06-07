# 슬립-워딩 정합성 검사 데모 — 설계

날짜: 2026-06-07
프로젝트: ARIA Demo Studio (`src/demos/aria/`)
상태: 승인됨

## 목적

체결 전 슬립(slip)과 워딩(treaty wording)을 AI가 조항 단위로 대조해
불일치·누락을 잡아내고 수정안 반영까지 이어지는 데모.
클라이맥스는 **양 문서를 동시에 훑는 스캔 하이라이트가 불일치를 로즈 플래그로 잡아내는 순간**.

기존 데모 중 aria-matrix(다문서 조건 추출)·aria-summary(요약·번역)와 구분되는
'검증(validation)' 단계를 채운다. V7 스타일 문서 검증 벤치마크.

## 배치·등록

- 폴더: `src/demos/aria/slip-check/`
- 파일: `data.ts`, `state.ts`, `widgets.tsx`, `Desktop.tsx`, `Mobile.tsx`, `scenario.ts`, `index.ts`
- 등록: registry glob 자동 수집
- id: `slip-check` / title: "슬립-워딩 정합성 검사"
- description: "체결 전 슬립과 워딩을 AI가 조항 단위로 대조 — 불일치·누락을 잡고 수정안까지 제안합니다."
- icon: lucide `FileCheck` / accent: `#8b5cf6` (바이올렛)

## 데이터 (`data.ts`)

검사 항목 7개 조항. 각 항목:

| 필드 | 내용 |
|---|---|
| key/제목 | Limit / Retention / Reinstatement / Hours Clause / Premium / Period / Exclusions |
| slipText | 슬립 구절 — 영문 원문 그대로 (실무 리얼리티, i18n 없음) |
| wordingText | 워딩 구절 — 영문 원문 (누락 항목은 워딩 쪽 부재 표시) |
| verdict | `match` \| `mismatch` \| `missing` |
| note | 판정 설명 — ko/en 병기 |
| fix | AI 수정안 (문제 3건만) — 교체/삽입할 영문 문구 + ko/en 설명 |

판정 분포 (고정):
- **match 4**: Limit, Retention, Premium, Period
- **mismatch 2**: Hours Clause (슬립 168hrs ↔ 워딩 72hrs), Reinstatement (슬립 2회 @100% A.P. ↔ 워딩 1회 @100% A.P.)
- **missing 1**: Cyber Exclusion — 슬립에 명시, 워딩 Exclusions 조항에 부재

요약 카운트(조항 수·일치·불일치·누락)는 데이터에서 계산 — 하드코딩 금지.
조항 원문은 영문 고정, 제목·판정·설명·UI 문자열만 `_shared/i18n`의 `L`로 ko/en 병기.

## 상태 (`state.ts`) — runId 가드 패턴 준수

- `phase: 'ready' | 'scanning' | 'done'`
- `scannedCount: number` — 판정 칩이 부착된 조항 수 (700ms/조항).
  스캔 하이라이트는 인덱스 `scannedCount`(지금 통과 중인 조항)에 표시 — 별도 인덱스 필드 불필요
- v2용: `appliedIds: string[]` (수정안 반영된 조항 key — 워딩에 redline), `applying: boolean`, `reportReady: boolean` (3건 모두 반영 시)
- actions: `startScan()`, `seedDone()`, `applyAll()`(순차 반영, 600ms/건), `reset()`
- 비동기 체인은 모두 runId 가드. `applyAll`은 `phase === 'done'`에서만, scanning 중 차단

## 변형 (variants)

### v1 "불일치 자동 검출" — 소구점: 리스크 차단

1. 좌 슬립 · 우 워딩 나란히, "정합성 검사" 버튼 (`data-demo-id="check-run"`)
2. 클릭 → 조항별 스캔 하이라이트가 양 문서를 동시에 훑고 내려감
3. 일치 4건 초록 체크, 불일치 2건·누락 1건 로즈 플래그
4. 하단 파인딩 요약 바 (`summary-bar`): "7개 조항 · 일치 4 · 불일치 2 · 누락 1"
5. 커서가 Hours Clause 불일치 플래그로 이동 (`finding-hours`) — 양쪽 구절 대비 강조

### v2 "수정안 반영 30초" — 소구점: 해결까지 자동화

1. 검사 완료 상태에서 시작 (`seedDone`)
2. 파인딩 카드 3건에 AI 수정안 표시 → "전체 반영" 클릭 (`apply-all`)
3. 워딩 본문에 redline 순차 적용 — 기존 문구 취소선 + 제안 문구 삽입 (바이올렛 하이라이트)
4. "검토 완료 — 체결 가능" 배지 + 토스트 (`report-badge`)
5. 실제 문서 편집/외부 연동 없음 — UI 연출만

## 레이아웃

- **Desktop**: 좌우 문서 패널 50:50 (각 `demo-scroll` 스크롤) + 하단 고정 파인딩 바.
  v2 수정안 카드는 파인딩 바에서 확장
- **Mobile**: 워딩 문서 중심 단일 패널 (슬립 구절은 파인딩 카드 안 인용으로 표시) +
  하단 파인딩 리스트 — 시나리오 타깃이 항상 존재하도록 시트 없이 인라인

## 시나리오 (`scenario.ts`)

기존 엔진 스텝 + `useSlipCheck.getState()` 헬퍼 패턴.
타깃: `check-run`, `summary-bar`, `finding-hours`, `apply-all`, `report-badge`.
엔진의 scrollIntoView(2026-06-05 추가)가 문서 패널 내 조항·파인딩 타깃 스크롤을 처리.

## 에러 처리·검증

- runId 가드 필수 (스캔/반영 중 리셋·변형 전환 시 고스트 타이머 방지)
- 검증: `npx tsc --noEmit` + dev 서버 구동 검증 (양 변형 × 데스크톱/모바일 × ko/en, 재생 중 리셋)

## 비범위 (YAGNI)

- 실제 문서 파싱/업로드, 다수 워딩 버전 일괄 검사 (aria-matrix 영역)
- 수정안 수동 편집 UI
- 체결 전 리포트 문서 생성 (ai-doc-gen 영역)
