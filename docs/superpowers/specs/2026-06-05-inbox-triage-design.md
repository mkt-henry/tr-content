# 인박스 AI Triage 데모 — 설계

날짜: 2026-06-05
프로젝트: ARIA Demo Studio (`src/demos/aria/`)
상태: 승인됨

## 목적

재보험 중개 워크플로의 '입구'인 이메일 인박스를 다루는 데모.
쏟아지는 출재 의뢰 메일을 AI가 자동 분류·우선순위화하고, 핵심 정보 추출부터
갱신 파이프라인 등록까지 이어지는 모습을 보여준다.
클라이맥스는 **지저분한 인박스가 실시간으로 정리되는 순간**.

기존 7개 데모(요약·비교·Q&A·갱신·제안서·매칭·대시보드)가 커버하지 못한
인수 전 접수(intake) 단계를 채워, 데모 전체가 브로커 업무 사이클을 이루게 한다.

## 배치·등록

- 폴더: `src/demos/aria/inbox-triage/`
- 파일: `index.ts`, `data.ts`, `state.ts`, `scenario.ts`, `Desktop.tsx`, `Mobile.tsx`
- 등록: registry가 `demos/*/*/index.ts` glob으로 자동 수집 — 별도 등록 코드 없음
- id: `inbox-triage`
- title: "인박스 AI Triage"
- description: "쏟아지는 출재 의뢰 메일을 AI가 분류·우선순위화하고, 핵심 정보 추출부터 파이프라인 등록까지."
- icon: lucide `Inbox`
- accent: `#f59e0b` (앰버 — 기존 teal/blue 계열과 구분)

## 데이터 (`data.ts`)

이메일 더미 9통 — 안읽음 카운트 등 모든 표기는 실데이터(9통) 기준. 각 메일:

| 필드 | 내용 |
|---|---|
| 발신자 | 출재사 담당자명 + 회사 (예: 김민서 · 한화손해보험) |
| 제목 / 미리보기 | 2줄 미리보기 |
| 수신 시각 | 상대 시각 표기 (예: 09:12, 어제) |
| 첨부 | 슬립 PDF 여부 |
| AI 분석 결과 | category: 신규 의뢰 / 갱신 / 클레임 통지 / 정산 / 일반 · priority: 긴급 / 높음 / 보통 · 마감일 |

- 신규 의뢰 메일 1통은 상세 추출 필드 보유: 보종, TSI, 보험기간, 출재사, 희망 조건, 마감일
- i18n: 기존 `_shared/i18n` 패턴으로 ko/en 병기

## 상태 (`state.ts`)

zustand 스토어. ai-chat의 `runId` 가드 패턴 준수(리셋/재생 중복 방지).

- `phase: 'raw' | 'scanning' | 'sorted'`
- `emails[]` — 각 메일 `analyzed: boolean`. 스캔 애니메이션이 리스트를 위→아래 순차 통과하며 배지 부착
- `selectedId`, `extracting`, `extractedFields[]` — 필드가 하나씩 채워지는 스트리밍 연출
- `pipelineAdded` — 등록 완료 토스트
- actions: `startTriage()`, `selectEmail()`, `extract()`, `addToPipeline()`, `reset()`

## 변형 (variants)

### v1 "인박스 자동 정리" — 소구점: 시간 절약

1. 시간순으로 뒤섞인 안읽음 인박스에서 시작
2. "AI 분류" 클릭 → 메일별 순차 스캔 글로우 + 카테고리·우선순위 배지 부착
3. 우선순위 그룹별 재정렬 (긴급 → 마감 임박 → 보통)
4. 상단 요약 바 등장: "신규 의뢰 3 · 갱신 2 · 클레임 1 · 오늘 마감 2"
5. 커서가 긴급 메일에 호버 → AI 한줄 요약 카드

### v2 "메일에서 파이프라인까지 30초" — 소구점: 엔드투엔드

1. 정리된 인박스에서 긴급 신규 의뢰 클릭
2. 우측 패널: 메일 본문 + 첨부 슬립 칩 → "핵심 추출" → 필드 카드가 하나씩 채워짐
3. "갱신 파이프라인에 등록" 클릭 → 카드가 파이프라인 항목으로 변환 + 성공 토스트
4. aria-renewals와 이어지는 스토리를 UI 카피로 암시 — 실제 데모 간 상태 연동은 하지 않음

각 변형은 기존 패턴대로 `DemoVariant`(label, version, sellingPoint, background 그라디언트, scenario)로 정의.
배경은 앰버 톤 radial-gradient + blur blob.

## 레이아웃

- **Desktop**: 이메일 클라이언트 2-pane — 좌측 메일 리스트, 우측 상세/추출 패널
- **Mobile**: 리스트 단일 컬럼, 메일 선택 시 상세가 풀스크린 시트로

## 시나리오 (`scenario.ts`)

기존 엔진(`engine/types`의 `Scenario`) 스텝(wait / type / click / cursor) 조합.
상태 변이는 `useInbox.getState()` 액션 호출로 수행 — ai-chat의 `st()` 헬퍼 패턴.

## 에러 처리·테스트

- 데모 앱 특성상 외부 I/O 없음. 시나리오 재생 중 리셋 시 진행 중 setTimeout 체인이
  이전 상태를 덮어쓰지 않도록 `runId` 가드 필수.
- 검증은 기존 데모와 동일하게 수동 재생 확인(두 변형 각각 데스크톱/모바일).

## 비범위 (YAGNI)

- aria-renewals와의 실제 상태 연동 (UI 카피로만 암시)
- 메일 검색/필터 등 실제 이메일 클라이언트 기능
- 분류 카테고리 편집 UI
