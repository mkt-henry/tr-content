# 갱신 결과 보고서 — 파일 선택 화면 개선(연동 소스 로드 → 특정 파일 선택) 설계

작성일: 2026-06-18
대상: `src/demos/aria/renewal-report` 데모의 보고서 생성 전 "근거 자료 선택" 화면

## 배경 / 목적

현재 `SourcePicker`는 고정 5개 항목을 기본 선택(defaultOn)된 채 토글하는 단순 목록이다.
"여러 곳에서 자료가 모이고, 그중 필요한 파일을 직접 고른다"는 재보험 중개 실무 감각이
드러나지 않는다.

이를 **연동된 여러 소스에서 자료를 불러오고(로딩 연출) → 사용자가 특정 파일을 선택하는**
플로우로 개선해, 데모 시청자가 "흩어진 근거 자료를 한곳에 모아 선별한다"는 가치를
직관적으로 보게 한다.

## 확정된 결정 (브레인스토밍)

- 구조: **연동 소스별 그룹** (사내 드라이브 / 출재사 포털 / 메일함)
- 선택 시작 상태: **전부 미선택** → 데모에서 커서가 특정 파일을 콕 집어 선택
- 로딩: 파일이 그룹 순서로 점진적으로 등장(스켈레톤 → 실제 행)

## 설계

### 1. 데이터 모델 — `src/demos/aria/renewal-report/data.ts`

기존 `SOURCES`/`SourceDoc`를 제거하고 그룹 + 파일 구조로 교체.

```ts
export type SourceGroupId = 'drive' | 'portal' | 'mail';
export type SourceExt = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'eml';

export interface SourceGroup {
  id: SourceGroupId;
  label: L;
}

export interface SourceFile {
  id: string;        // generate()/시나리오 타깃과 호환되는 안정 id
  group: SourceGroupId;
  name: L;           // 파일명 — 행 제목 + 보고서 칩에 사용
  desc: L;           // 한 줄 설명 — 행 보조 텍스트
  ext: SourceExt;    // 확장자별 아이콘 매핑
}

export const SOURCE_GROUPS: SourceGroup[] = [
  { id: 'drive', label: { ko: '사내 드라이브', en: 'Internal drive' } },
  { id: 'portal', label: { ko: '출재사 포털', en: 'Cedent portal' } },
  { id: 'mail', label: { ko: '메일함', en: 'Mailbox' } },
];

export const SOURCE_FILES: SourceFile[] = [
  { id: 'slip', group: 'drive', name: { ko: 'Term Life XL 슬립.pdf', en: 'TermLifeXL_Slip_2026.pdf' }, desc: { ko: '인수 조건·프로그램 구조', en: 'Cover terms & structure' }, ext: 'pdf' },
  { id: 'prior', group: 'drive', name: { ko: '2025 갱신 특약.pdf', en: '2025_Placement_Treaty.pdf' }, desc: { ko: '전년 갱신 조건', en: 'Prior-year terms' }, ext: 'pdf' },
  { id: 'guideline', group: 'drive', name: { ko: '인수지침.docx', en: 'Underwriting_Guideline.docx' }, desc: { ko: '사내 인수 가이드', en: 'Internal UW guideline' }, ext: 'docx' },
  { id: 'quotes', group: 'portal', name: { ko: '4사 견적시트.xlsx', en: '4_Reinsurer_Quotes.xlsx' }, desc: { ko: '재보험사 견적', en: 'Reinsurer quotes' }, ext: 'xlsx' },
  { id: 'lossrun', group: 'portal', name: { ko: '손해실적 3년.csv', en: '2023-2025_LossRun.csv' }, desc: { ko: '2023–2025 손해율', en: '2023–2025 loss ratio' }, ext: 'csv' },
  { id: 'notes', group: 'mail', name: { ko: '브로커 노트(스레드).eml', en: 'Broker_Notes_Thread.eml' }, desc: { ko: '메일 스레드 요약', en: 'Email thread summary' }, ext: 'eml' },
];
```

총 6개 파일(드라이브 3 · 포털 2 · 메일 1). id는 기존(`slip/lossrun/quotes/prior/notes`)을
유지하고 `guideline`만 신규 — 시나리오 타깃·`generate()` 로직과 호환.

### 2. 상태 — `src/demos/aria/renewal-report/state.ts`

로딩 상태와 로드 진행을 추가한다.

```ts
export type SourcesStatus = 'idle' | 'loading' | 'ready';
```

`ReportEmailState`에 추가:
```ts
  sourcesStatus: SourcesStatus;
  /** 현재까지 로드되어 화면에 등장한 파일 id */
  loadedSourceIds: string[];
  /** 연동 소스에서 자료를 점진적으로 불러온다 (idle일 때만 동작) */
  loadSources: () => void;
```

initial 변경:
- `selectedSources: []` (전부 미선택)
- `sourcesStatus: 'idle'`, `loadedSourceIds: []`
- `import`에서 `SOURCES` 제거, `SOURCE_FILES` 추가. `defaultSources` 상수 제거.

`loadSources()` 구현 (generate()와 같은 runId 가드 패턴):
```ts
  loadSources: () => {
    if (get().sourcesStatus !== 'idle') return;
    const id = ++runId;
    set({ sourcesStatus: 'loading', loadedSourceIds: [] });
    void (async () => {
      for (const f of SOURCE_FILES) {
        await sleep(280);
        if (id !== runId) return;
        set((s) => ({ loadedSourceIds: [...s.loadedSourceIds, f.id] }));
      }
      await sleep(200);
      if (id !== runId) return;
      set({ sourcesStatus: 'ready' });
    })();
  },
```

`toggleSource(id)`: 가드를 `phase==='sources' && sourcesStatus==='ready'`로 강화하고,
`loadedSourceIds.includes(id)`인 파일만 토글(아직 안 뜬 파일 무시).

`reset()`은 `initial`로 되돌리므로 `sourcesStatus`가 다시 `idle` → 재생 시 재로딩.

### 3. 위젯 — `src/demos/aria/renewal-report/widgets.tsx`

#### SourcePicker (재작성)
- `loadSources`, `sourcesStatus`, `loadedSourceIds` 구독.
- **자동 로드 트리거:** `useEffect(() => { loadSources(); }, [sourcesStatus])` — `idle`일 때
  `loadSources()`가 동작(가드로 중복 방지). reset이 `idle`로 바꾸면 재생 때 다시 로드.
- 상단 상태줄:
  - `loading`: `pick(STR.sourcesLoading)` + 진행 `({loadedSourceIds.length}/{SOURCE_FILES.length})`
  - `ready`: `pick(STR.sourcesTitle)` + 보조에 선택 수 `fmt(STR.sourcesSelected, { n: selectedSources.length })`
- 그룹 렌더: `SOURCE_GROUPS.map` → 각 그룹 헤더(소스 아이콘 + 라벨 + 그룹 파일 수) + 파일 행들.
  - 그룹 헤더 아이콘: drive→`HardDrive`, portal→`Building2`, mail→`Mail` (lucide).
- 파일 행(`SourceFileRow`, 하위 컴포넌트로 분리):
  - 해당 파일이 `loadedSourceIds`에 없으면 **스켈레톤 행**(shimmer) 렌더.
  - 있으면 실제 행을 `motion`(opacity+y) 등장: 확장자 아이콘 + `name`(제목) + `desc`(보조) + 체크 표시.
  - `data-demo-id={`source-toggle-${file.id}`}`, `onClick={() => toggleSource(file.id)}`.
  - 선택 시 brass 보더/배경 하이라이트(기존 토글 스타일 계승).
- 확장자 아이콘 매핑 헬퍼 `EXT_ICON: Record<SourceExt, LucideIcon>`:
  pdf/docx→`FileText`, xlsx/csv→`FileSpreadsheet`, eml→`Mail`.
- 생성 버튼: `disabled = sourcesStatus !== 'ready' || selectedSources.length === 0`.

#### ReportView (선택 자료 칩)
- `import` `SOURCES` → `SOURCE_FILES`.
- `selectedLabels = SOURCE_FILES.filter((f) => selectedSources.includes(f.id))`,
  칩 텍스트는 `pick(f.name, lang)` (필요 시 `max-w` + `truncate`).

### 4. UI 문자열 — `STR` (`data.ts`)

추가:
```ts
  sourcesLoading: { ko: '근거 자료 불러오는 중…', en: 'Loading source materials…' },
  sourcesSelected: { ko: '{n}건 선택', en: '{n} selected' },
```
기존 `sourcesTitle`, `sourcesHint`, `sourceSummary`, `generateBtn`은 유지.

### 5. 시나리오 — `src/demos/aria/renewal-report/scenario.ts`

자료 선택 비트를 "로드 대기 → 특정 파일 3개 선택"으로 교체. 로드는 SourcePicker가
자동 트리거하므로 시나리오는 대기만 한다.

```ts
    { kind: 'wait', ms: 2400 }, // 연동 소스에서 자료 로드 완료 대기 (로드 ~1.9s + 버퍼)
    // [줌1] 그중 특정 파일을 직접 선택
    { kind: 'cursor', target: 'source-toggle-slip', ms: 700, zoom: true, caption: () => pick(SPOTLIGHT.select, getLang()) },
    { kind: 'click', target: 'source-toggle-slip', run: () => st().toggleSource('slip'), zoom: true, caption: () => pick(SPOTLIGHT.select, getLang()) },
    { kind: 'cursor', target: 'source-toggle-lossrun', ms: 600, zoom: true, caption: () => pick(SPOTLIGHT.select, getLang()) },
    { kind: 'click', target: 'source-toggle-lossrun', run: () => st().toggleSource('lossrun'), zoom: true, caption: () => pick(SPOTLIGHT.select, getLang()) },
    { kind: 'cursor', target: 'source-toggle-quotes', ms: 600, zoom: true, caption: () => pick(SPOTLIGHT.select, getLang()) },
    { kind: 'click', target: 'source-toggle-quotes', run: () => st().toggleSource('quotes'), zoom: true, caption: () => pick(SPOTLIGHT.select, getLang()) },
    { kind: 'wait', ms: 900 },
    // [줌아웃] 보고서 생성
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
```
이후(보고서 스트리밍·검토·이메일·발송)는 현행 유지.

## 영향 범위 / 비고

- `SOURCES`/`SourceDoc`를 제거하므로 모든 참조(state.ts, widgets.tsx)를 함께 갱신해야 한다.
- 기본 선택이 사라져 데모는 반드시 파일을 선택해야 생성 버튼이 활성화된다(시나리오가 선택함).
- 로딩은 데모 자동재생·수동 열람 모두에서 `useEffect`로 자동 동작.
- 다른 데모/엔진(spotlight, camera)에는 영향 없음.

## 검증

- `npx tsc --noEmit -p tsconfig.json` 통과.
- dev 재생: 자료가 그룹별로 점진 로드 → 줌인+캡션 상태로 커서가 슬립·손해실적·견적 3개를
  선택 → 생성. 로드 중 스켈레톤, 완료 후 선택/생성 동작, 보고서 헤더 칩이 선택 파일명으로 표시.
- ko/en 토글로 그룹·파일명·상태 문구 전환 확인.
