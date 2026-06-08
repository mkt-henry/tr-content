# 클레임 보더로 처리 데모 — 설계

날짜: 2026-06-08
프로젝트: ARIA Demo Studio (`src/demos/aria/`)
상태: 승인됨

## 목적

출재사가 보낸 클레임 보더로(bordereaux) 스프레드시트를 AI가 행 단위로 검증해
오류(통화·합산·중복)를 잡고, 자동 수정 후 정산 금액까지 산출하는 백오피스 자동화 데모.
클라이맥스는 **행별 스캔이 내려가며 오류 셀에 플래그가 붙고 그리드가 정리되는 순간**.

기존 9종이 다루지 않은 '정산(accounting/settlement)' 단계를 채워,
접수(인박스)→검증(슬립체크)→대응(워룸)→정산(보더로)의 업무 사이클을 완성한다.

## 배치·등록

- 폴더: `src/demos/aria/claim-bordereaux/`
- 파일: `data.ts`, `state.ts`, `widgets.tsx`, `Desktop.tsx`, `Mobile.tsx`, `scenario.ts`, `index.ts`
- 등록: registry glob 자동 수집
- id: `claim-bordereaux` / title: "클레임 보더로 처리"
- description: "출재사 클레임 보더로(bordereaux)를 AI가 행 단위로 검증하고, 오류를 잡아 정산 금액까지 산출합니다."
- icon: lucide `Table2` / accent: `#6366f1` (인디고 — 기존 teal/amber/rose/violet과 구분)

## 데이터 (`data.ts`)

### 보더로 행 8건

컬럼: 클레임 ID / 손해일 / 보종(LoB) / 통화 / 총손해액(gross) / 출재 회수액(ceded) / 상태(status)

- 정상 5행, 오류 3건 (서로 다른 행·유형):
  - **통화 오류**: 한 행이 실제 USD 건인데 통화가 KRW로 입력 (자릿수/통화 불일치)
  - **합산 불일치**: ceded > gross (회수액이 총손해 초과 — 불가능)
  - **중복 클레임 ID**: 두 행이 동일 클레임 번호

표기:
- gross/ceded는 숫자(원 단위 억) + 통화. 금액 라벨은 헬퍼로 ko/en 포맷
- 각 셀 오류는 `cell error` 맵으로 표현: `{ rowId, col, type, note(L), fixValue }`
- 검증 시 해당 셀만 플래그, 자동수정 시 fixValue로 교체

### 계약 정산 조건 (v2 정산 산출용)

- 출재 수수료율(ceding commission), 분기, 정산 통화 — 정산 금액 = Σceded − 수수료 등 단순 모델
- 합계(행 수·정상·오류·정산액)는 데이터에서 계산 — 하드코딩 금지

### i18n

조항/클레임 ID 등 식별자는 영문·숫자 고정. 컬럼명·상태·오류 설명·UI 문자열은 `_shared/i18n`의 `L`로 ko/en 병기.

## 상태 (`state.ts`) — runId 가드 패턴 준수

- `phase: 'raw' | 'validating' | 'validated' | 'settled'`
  - raw: 검증 전 그리드
  - validating: 행을 위→아래 순차 스캔 (`scannedRows` 450ms/행), 통과 시 오류 셀 플래그
  - validated: 검증 요약 바 + 오류 카드 + 자동수정 버튼
  - settled: 정산 산출 완료 (청구 금액 표시)
- v2용: `fixed: boolean` (오류 일괄 수정 반영), `settling: boolean`
- actions: `validate()`, `seedValidated()`(v2 시드), `autoFix()`, `settle()`, `reset()`
- 비동기 체인 모두 runId 가드. autoFix/settle은 `phase==='validated'` 등 단계 가드

## 변형 (variants)

### v1 "행 단위 자동 검증" — 소구점: 데이터 품질

1. 보더로 그리드 (검증 전)
2. "AI 검증" 클릭 (`validate-run`) → 행별 스캔 하이라이트 하강, 오류 셀 3개에 로즈 플래그
3. 검증 요약 바 (`summary-bar`): "8행 · 정상 5 · 오류 3"
4. 우측 오류 카드 3건 — 통화/합산/중복 각 설명 + 수정안. 커서가 첫 오류 카드로 이동

### v2 "정산 대조 → 청구서" — 소구점: 정산 자동화

1. 검증 완료 상태에서 시작 (`seedValidated`)
2. "자동 수정" 클릭 (`fix-run`) → 오류 셀이 fixValue로 교체 (인디고 하이라이트), 그리드 클린
3. "정산 산출" 클릭 (`settle-run`) → 계약 조건 대조 → 정산 청구 금액 카운트업 + 분기 정산서 요약 카드 + 토스트 (`settle-card`)
4. 실제 파일/외부 연동 없음 — UI 연출만

각 변형은 `DemoVariant`(label, version, sellingPoint, 인디고 톤 그라디언트, scenario)로 정의.

## 레이아웃

- **Desktop**: 좌측 큰 그리드(가로/세로 스크롤) + 우측 320px 사이드 (검증 요약 → 오류 카드 → 정산 카드)
- **Mobile**: 그리드 가로 스크롤 단일 패널(상단 고정 비율) + 하단 오류/정산 카드 인라인.
  시나리오 타깃이 항상 존재하도록 시트 없이 인라인

## 시나리오 (`scenario.ts`)

기존 엔진 스텝 + `useBordereaux.getState()` 헬퍼. 엔진 scrollIntoView가 그리드/카드 타깃 스크롤 처리.
타깃: `validate-run`, `summary-bar`, `error-card-{rowId}`(또는 첫 오류), `fix-run`, `settle-run`, `settle-card`.

## 에러 처리·검증

- runId 가드 필수 (검증/수정/정산 중 리셋·변형 전환 시 고스트 타이머 방지)
- 검증: `npx tsc --noEmit` + dev 서버 구동 (양 변형 × 데스크톱/모바일 × ko/en, 재생 중 리셋)

## 비범위 (YAGNI)

- 실제 엑셀 업로드/파싱, 다양한 포맷 매핑(ETL)
- 손해율 대시보드 (finance-dashboard 영역)
- 이상건 조사 이메일 (aria-match/cat-warroom 영역)
- 셀 수동 편집
