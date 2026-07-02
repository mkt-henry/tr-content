# 설계: `aria-matrix` 업로드-우선 통합 플로우

- 날짜: 2026-07-01
- 대상 데모: `src/demos/aria/aria-matrix` (문서 비교 Matrix)
- 브랜치: `feat/interaction-spotlight` (또는 신규 브랜치)

## 배경 / 목적

현재 `aria-matrix` 데모는 문서 5건이 **이미 로드된 상태**에서 시작하고, 사용자가 "열 추가"
버튼을 하나씩 눌러 항목별로 추출하는 흐름이다. variant는 두 개(v1 일괄 추출, v2 원문 인용 검증).

목표는 실제 사용자 여정을 앞단부터 보여주는 것이다:

1. 파일 탐색기에서 PDF 여러 개 선택 → 업로드
2. AI가 즉시 전체 자동 분석·일괄 추출
3. 원문(소스) 확인

즉 **업로드 단계를 앞에 신설**하고, 추출 방식을 "수동 열 추가"에서 "업로드 완료 즉시 자동
일괄 분석"으로 전환한다. 확정된 3대 결정:

- 파일 선택 표현: **OS 파일 탐색기(Windows 탐색기) 오버레이 재현**
- 분석 방식: **업로드 즉시 전체 자동 분석** (버튼 클릭 없이 매트릭스가 스스로 채워짐)
- variant 구조: **단일 통합 플로우로 치환** (기존 2개 variant → 1개)

## 전체 플로우 (단일 variant, 4단계)

```
[Phase 0] idle        빈 매트릭스 + 중앙 "문서 업로드" 드롭 영역/버튼
   ↓ (커서가 업로드 버튼 클릭)
[Phase 1] picking     Windows 탐색기 스타일 오버레이 → PDF 5개 다중선택 → "열기"
   ↓ (오버레이 닫힘, 파일이 앱으로 유입)
[Phase 2] uploading   5개 문서가 행으로 등장 + 문서별 짧은 업로드 진행(~0.6s)
   ↓ (완료 즉시 자동 진입)
[Phase 3] analyzing   6개 항목(열)이 자동 순차 추가되며 셀이 extracting→done 로 채워짐
   ↓ (전 셀 done)
[Phase 4] done        셀 2~3개 자동 클릭 → 원문 인용 팝오버 하이라이트 (소스 확인)
```

## 상태 설계 (`state.ts`)

기존 `activeColumns` / `cellStatus` / `popover` 구조는 유지하고 phase 개념을 추가한다.

```ts
type MatrixPhase = 'idle' | 'picking' | 'uploading' | 'analyzing' | 'done';
```

신규 상태 필드:

- `phase: MatrixPhase` — 현재 단계 (렌더 분기용)
- `explorerOpen: boolean` — 탐색기 오버레이 표시 여부
- `selectedFiles: string[]` — 탐색기에서 선택된 파일 id (다중선택 하이라이트)
- `uploadedDocs: string[]` — 앱으로 유입 완료된 문서 id. **매트릭스 행은 이 배열만 렌더**
- `uploadProgress: Record<string, number>` — 문서별 업로드 진행률(0~1), uploading 단계 연출용

신규/변경 액션:

- `openExplorer()` — `phase='picking'`, `explorerOpen=true`
- `toggleFileSelect(id)` — `selectedFiles` 토글 (탐색기 내 다중선택)
- `confirmUpload()` — 탐색기 닫고 `phase='uploading'`, 선택 파일을 `uploadedDocs`로 순차
  유입 + `uploadProgress` 애니메이션, 완료 후 자동으로 `analyzeAll()` 호출
- `analyzeAll()` — `phase='analyzing'`, 6개 열을 자동 순차 추가(기존 `addColumn`의 셀 추출
  루프 재사용). 전 셀 done 시 `phase='done'`
- `openPopover` / `closePopover` — 기존 유지 (소스 확인)
- `reset()` — 모든 신규 상태를 초기값으로 되돌림 (`phase='idle'`, 배열/맵 비움).
  기존 `resetId` 무효화 메커니즘 유지

기존 `addColumn`(수동)은 제거하거나 `analyzeAll` 내부 헬퍼로 흡수한다. 자동 트리거만 사용하므로
"열 추가" 버튼 및 관련 UI는 제거한다.

## 컴포넌트

### `FileExplorer.tsx` (신규)

Windows 탐색기 "열기" 다이얼로그 재현. 앱 위에 오버레이로 마운트되며 `explorerOpen`으로 표시 제어.

- 제목표시줄: "열기" + 창 컨트롤(장식)
- 좌측 사이드바: 즐겨찾기/폴더 트리 (장식, 비인터랙티브)
- 파일 리스트: `DOCUMENTS` 5건을 행으로. 각 행에 PDF 아이콘, 파일명, 수정한 날짜(더미),
  유형("PDF 문서"), 크기(더미). 다중선택된 행은 파란 하이라이트.
- 하단: "파일 이름" 텍스트(선택 개수 반영) + "열기"/"취소" 버튼
- `data-demo-id`: 파일 행 `file-<id>`, 열기 버튼 `explorer-open-btn`

시각 톤은 데모 전체의 다크 테마와 충돌하지 않게, OS 창임을 알 수 있는 밝은 크롬 + 앱 위 어둡게
깔리는 백드롭으로 처리한다.

### `Desktop.tsx` (수정)

- Phase 0(`idle`): 매트릭스 대신 중앙 업로드 영역 — 점선 드롭존 + 아이콘 + "문서 업로드" 버튼
  (`data-demo-id="upload-btn"`) + 보조 문구("PDF 슬립·특약을 끌어다 놓거나 선택").
- Phase 2+(`uploading`/`analyzing`/`done`): 기존 매트릭스 렌더. 행은 `uploadedDocs` 기반.
  `uploading` 단계에서는 각 행에 업로드 진행 바 표시, 완료 후 매트릭스 셀 영역으로 전환.
- `FileExplorer`를 오버레이로 마운트.
- 헤더의 "열 추가" 버튼 제거. 대신 진행 상태(추출 N/총 M, 완료 배지)는 유지.
- 원문 인용 `CitationPopover`는 그대로 유지.

### `Mobile.tsx` (수정)

- OS 탐색기 대신 **하단 시트형 문서 선택**(iOS/안드로이드 파일 앱 느낌)으로 적응.
  "문서 업로드" 버튼 → 하단 시트에서 5개 PDF 다중선택 → "업로드".
- 이후 기존 아코디언 카드가 `uploadedDocs` 기반으로 자동 채워짐.
- 모바일에는 데스크탑 탐색기 창을 그대로 재현하지 않는다.

## 시나리오 (`scenario.ts`)

단일 `Scenario`(예: `uploadFlowScenario`)로 재작성. 대략적 스텝:

1. `wait` (초기 여백)
2. `cursor` → `upload-btn` (zoom, caption "문서 업로드")
3. `click` → `upload-btn`, run `openExplorer()`
4. 탐색기 열림 대기(`wait`)
5. 파일 행 다중선택: `click` `file-propcat` … `file-aviation` (각 run `toggleFileSelect`)
6. `click` → `explorer-open-btn`, run `confirmUpload()`
7. `waitFor` 업로드 완료(`phase !== 'uploading'`) — `confirmUpload`가 자동으로 `analyzeAll` 진입
8. `waitFor` 분석 완료(`phase === 'done'`) 또는 충분한 `wait`로 매트릭스 채워짐 관찰
9. 소스 확인: `click` 셀 2~3개(run `openPopover`) → 원문 인용 팝오버, 사이 `wait`
10. `do` `closePopover()` + 마무리 `wait`

zoom/spotlight/caption을 업로드·분석·소스확인 핵심 순간에 배치한다.

## `index.ts` / `posts.ts`

- `index.ts`: `variants`를 단일 항목으로 축소. label 예 "업로드 → 자동 추출 → 원문 검증",
  `url: 'insightre.ai/matrix'`, `background`는 기존 중 하나 채택, `scenario`는 신규 단일 시나리오.
  기존 `batchScenario`/`citedScenario` import 제거.
- `posts.ts`: 현재 카피가 이미 "여러 재보험 문서를 올리고…" 서사라 대규모 수정 불필요. 실제
  업로드 장면이 첫 화면이 된 점을 반영해 도입부 한두 문장만 소폭 다듬는다(ko/en 각각 자연스럽게).

## 데이터 (`data.ts`)

- `DOCUMENTS`/`COLUMNS`/`CELLS` 값은 그대로 재사용.
- 탐색기 표시용 더미 메타(수정일·크기)와 신규 UI 문자열(업로드/드롭존/시트 등)을 `STR`에 추가.
- 사용되지 않게 되는 문자열(`addColumn`, `emptyHint`, `allColumnsAdded`)은 정리.

## 테스트 / 검증

이 저장소는 시연 앱으로 자동화 테스트 스위트가 얇다. 검증은 다음으로 한다:

- 타입체크/빌드 통과 (`tsc` / vite build)
- 데스크탑·모바일 각각에서 시나리오 자동 재생이 4단계를 끊김 없이 진행하는지 육안 확인
- reset(변형/언어/디바이스 전환) 시 `idle`로 완전히 되돌아가는지 확인
- 커서 타깃(`data-demo-id`)이 모두 실제 렌더 요소와 매칭되는지 확인

## 범위 밖 (YAGNI)

- 실제 파일 파싱/업로드 백엔드 — 전부 목업 연출
- 드래그-앤-드롭 실제 인터랙션 — 시나리오는 클릭 기반, 드롭존은 시각 요소
- 탐색기 폴더 탐색/정렬 등 실제 기능 — 장식만
```