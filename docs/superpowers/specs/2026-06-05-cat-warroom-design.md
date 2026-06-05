# Cat 이벤트 워룸 데모 — 설계

날짜: 2026-06-05
프로젝트: ARIA Demo Studio (`src/demos/aria/`)
상태: 승인됨

## 목적

태풍 등 자연재해 발생 순간의 재보험 브로커 대응을 보여주는 데모.
재해 속보 → 노출 특약 즉시 식별 → 예상 손해 산정 → 출재사 알림 초안·발송까지.
클라이맥스는 **지도 위에 태풍 경로가 그려지고 노출 특약이 순차 점등되는 순간**.

인박스 Triage(접수)와 짝을 이루는 '이벤트 대응' 단계를 채우고,
aria-match의 이메일 자동화 서사를 재해 커뮤니케이션으로 확장한다.

## 배치·등록

- 폴더: `src/demos/aria/cat-warroom/`
- 파일: `data.ts`, `state.ts`, `map.tsx`, `widgets.tsx`, `Desktop.tsx`, `Mobile.tsx`, `scenario.ts`, `index.ts`
  - 기존 데모 대비 `map.tsx` 1개 추가 — SVG 지도가 충분히 커서 파일 분리
- 등록: registry glob 자동 수집
- id: `cat-warroom` / title: "Cat 이벤트 워룸"
- description: "태풍 상륙 순간, 노출 특약 식별부터 예상 손해 산정·출재사 알림까지 — 재해 대응을 한 화면에서."
- icon: lucide `Radar` / accent: `#f43f5e` (로즈 — 경보 테마)

## 데이터 (`data.ts`)

### 재해 이벤트 (1건)

- 태풍 12호 나리(NARI), 카테고리 3등급, 중심기압 945hPa
- 남해안 상륙 시나리오 — SVG 좌표 경로 포인트 5개 + 영향권 반경
- 속보 텍스트: "태풍 12호 나리, 금일 14시 남해안 상륙 — 최대풍속 45m/s"

### 노출 특약 (7건)

| 필드 | 내용 |
|---|---|
| 출재사 | 한화손해보험, 삼성화재, DB손해보험, 현대해상, KB손해보험 (5곳) |
| 특약 | Property Cat XoL, 풍수해 QS, Marine Cargo 등 보종 다양화 |
| 지역 | 부산, 여수, 창원, 통영, 목포 등 남해안 (SVG 좌표 포함) |
| TSI / 예상 손해액 | 특약별 개별 값 — 총 예상 손해 합계는 데이터에서 계산 (~₩214억) |
| 심각도 | high 2 · medium 3 · low 2 |

- 합계(노출 특약 수, 총 예상 손해, 영향 출재사 수)는 헬퍼 함수로 계산 — 하드코딩 금지

### 알림 초안 (3통)

- 예상 손해액 합계 상위 3개 출재사 대상 — 제목 + 본문(특약명·예상 손해액·후속 절차 인용)
- ko/en 병기 (`_shared/i18n`의 `L` 타입)

## 상태 (`state.ts`) — runId 가드 패턴 준수

- `phase: 'idle' | 'alert' | 'scanning' | 'assessed'`
  - idle: 평시 모니터링 (지도 깨끗, "모니터링 중" 표시)
  - alert: 속보 배너 + 태풍 경로 애니메이션
  - scanning: 노출 특약이 지도 마커·리스트에 400ms 간격 순차 점등 (`revealedIds`)
  - assessed: 합계 카드 등장 + 손해액 카운트업
- v2용: `draftedCount` (초안 순차 생성, 600ms 간격), `sent` (일괄 발송 완료)
- actions: `triggerEvent()`, `scanExposures()`, `seedAssessed()`, `draftAlerts()`, `sendAll()`, `reset()`
- 비동기 체인은 모두 runId 가드로 리셋/전환 시 중단

## 지도 (`map.tsx`)

- 단순화된 한반도 윤곽 SVG path (디자인용 근사 — 실측 좌표 불필요)
- 다크 테마: 어두운 채움 + 은은한 외곽선, 항구 도시 라벨 3~4개
- 태풍 연출: 점선 경로(pathLength 진행 애니메이션), 회전 태풍 마커, 영향권 펄스 원
- 노출 마커: 심각도 색(high=rose, medium=amber, low=zinc), 점등 시 ring 펄스
- props로 상태(phase, revealedIds)를 받는 표현 전용 컴포넌트 — 스토어 직접 구독은 widgets/레이아웃에서

## 변형 (variants)

### v1 "실시간 워룸" — 소구점: 대응 속도

1. 평시 모니터링 화면
2. 속보 배너 등장 + 지도에 태풍 경로·영향권 애니메이션 (`triggerEvent`)
3. "노출 분석" 클릭 (`scanExposures`) → 마커 + 리스트 순차 점등
4. 합계 카드: 노출 특약 7건 · 총 예상 손해 카운트업 · 영향 출재사 5곳

### v2 "출재사 알림 30초" — 소구점: 대응 자동화

1. 분석 완료 상태에서 시작 (`seedAssessed`)
2. "알림 초안 생성" 클릭 (`draftAlerts`) → 출재사별 이메일 카드 순차 작성
3. "일괄 발송" 클릭 (`sendAll`) → 카드 발송 완료 체크 + 토스트
4. 실제 발송/연동 없음 — UI 연출만

각 변형은 `DemoVariant`(label, version, sellingPoint, background 로즈 톤 그라디언트, scenario)로 정의.

## 레이아웃

- **Desktop**: 좌측 2/3 지도 패널(속보 배너 오버레이) + 우측 1/3 사이드
  (이벤트 카드 → 노출 리스트 → 합계 카드, v2에서는 알림 초안 패널로 전환)
- **Mobile**: 상단 지도(고정 높이) + 하단 스크롤 피드, 알림 초안 패널은 피드 하단에 인라인
  (시트로 분리하면 시나리오 타깃 `draft-run`이 시트 열기 전 존재하지 않아 자동 재생이 깨짐)

## 시나리오 (`scenario.ts`)

기존 엔진 스텝(wait/cursor/click/do) 조합, `useWarroom.getState()` 헬퍼 패턴.
주요 데모 타깃: `event-trigger`(또는 do 스텝), `scan-run`, `draft-run`, `send-all`, `exposure-item-{id}`.

## 에러 처리·검증

- 외부 I/O 없음. runId 가드 필수 (스캔/초안 생성 중 리셋·변형 전환 시 고스트 타이머 방지)
- 검증: `npx tsc --noEmit` + dev 서버 수동 재생 (양 변형 × 데스크톱/모바일 × ko/en, 재생 중 리셋)

## 비범위 (YAGNI)

- 실제 지도 라이브러리/정확한 지리 좌표
- 다중 재해 이벤트, 이벤트 히스토리
- Hours Clause 분석 (별도 데모 후보로 보류)
- 실제 이메일 발송·외부 연동
