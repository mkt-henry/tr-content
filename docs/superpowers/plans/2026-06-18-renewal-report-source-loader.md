# 갱신 결과 보고서 — 파일 선택 화면 개선(연동 소스 로드 → 선택) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 보고서 생성 전 "근거 자료 선택" 화면을, 연동된 여러 소스에서 자료가 점진적으로 로드되고 사용자가 그중 특정 파일을 선택하는 플로우로 개선한다.

**Architecture:** `data.ts`의 평면 `SOURCES`를 그룹(`SOURCE_GROUPS`) + 파일(`SOURCE_FILES`) 구조로 교체하고, 스토어에 점진 로딩 상태(`sourcesStatus`/`loadedSourceIds`/`loadSources()`)를 추가한다. `SourcePicker`는 마운트 시 자동 로드하여 그룹별로 스켈레톤→파일 행을 점진 노출하고, 전부 미선택으로 시작한다. 시나리오는 로드 완료를 기다린 뒤 줌인+캡션 상태로 특정 파일 3개를 선택한다.

**Tech Stack:** React + TypeScript, zustand, framer-motion, Tailwind, lucide-react, Vite. 테스트 러너 없음 — 검증은 `npx tsc --noEmit -p tsconfig.json` + dev 서버 육안.

## Global Constraints

- 검증 게이트: `npx tsc --noEmit -p tsconfig.json` 통과(에러 0). 테스트 프레임워크 없음 — 테스트 작성 금지.
- 데이터 모델 교체는 `SOURCES`/`SourceDoc`를 제거하므로, 컴파일이 깨지지 않도록 **Task 2에서 data·state·widgets 참조를 한 번에** 갱신한다(원자적).
- 파일 id는 다음으로 고정(시나리오 타깃·generate 로직 호환): `slip`, `prior`, `guideline`, `quotes`, `lossrun`, `notes`.
- 선택은 **빈 배열로 시작**(기본 선택 없음). 생성 버튼은 `sourcesStatus==='ready' && selectedSources.length>0`일 때만 활성.
- `toggleSource`는 `phase==='sources' && sourcesStatus==='ready'`이고 `loadedSourceIds.includes(id)`인 파일만 토글.
- 파일 행 `data-demo-id`는 `source-toggle-<id>` 형식 유지.
- 언어는 `getLang()`/`pick()`(`../_shared/i18n`)로 처리, ko/en 모두 채움.
- 커밋: `--no-gpg-sign`, 메시지 마지막 줄 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

## File Structure

- `src/demos/aria/renewal-report/data.ts` (수정) — `SOURCES`/`SourceDoc` 제거, `SOURCE_GROUPS`/`SOURCE_FILES`/타입 추가, `STR`에 로딩 문구 추가.
- `src/demos/aria/renewal-report/state.ts` (수정) — 로딩 상태/액션 추가, 선택 빈 시작, 참조 갱신.
- `src/demos/aria/renewal-report/widgets.tsx` (수정) — `SourcePicker` 재작성 + `SourceFileRow` 하위 컴포넌트, `ReportView` 칩 갱신.
- `src/demos/aria/renewal-report/scenario.ts` (수정) — 자료 선택 비트 교체.

---

### Task 1: 데이터 모델 + STR 문구 (data.ts)

**Files:**
- Modify: `src/demos/aria/renewal-report/data.ts`

**Interfaces:**
- Produces:
  - `type SourceGroupId = 'drive' | 'portal' | 'mail'`
  - `type SourceExt = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'eml'`
  - `interface SourceGroup { id: SourceGroupId; label: L }`
  - `interface SourceFile { id: string; group: SourceGroupId; name: L; desc: L; ext: SourceExt }`
  - `SOURCE_GROUPS: SourceGroup[]`, `SOURCE_FILES: SourceFile[]`
  - `STR.sourcesLoading: L`, `STR.sourcesSelected: L`
  - 제거: `interface SourceDoc`, `const SOURCES`

- [ ] **Step 1: `SourceDoc`/`SOURCES` 블록을 새 모델로 교체**

`data.ts`에서 기존 블록(주석 헤더 포함):
```ts
export interface SourceDoc {
  id: string;
  label: L;
  meta: L;
  defaultOn: boolean;
}

export const SOURCES: SourceDoc[] = [
  { id: 'slip', label: { ko: 'Term Life XL 슬립', en: 'Term Life XL slip' }, meta: { ko: 'HW_TermLife_XL_Slip_2026.pdf', en: 'HW_TermLife_XL_Slip_2026.pdf' }, defaultOn: true },
  { id: 'lossrun', label: { ko: '손해실적 3년', en: '3-year loss run' }, meta: { ko: '2023–2025 Loss run', en: '2023–2025 loss run' }, defaultOn: true },
  { id: 'quotes', label: { ko: '재보험사 견적 시트', en: 'Reinsurer quote sheets' }, meta: { ko: '4사 Quote sheets', en: '4 reinsurer quotes' }, defaultOn: true },
  { id: 'prior', label: { ko: '전년 갱신 특약', en: 'Prior-year treaty' }, meta: { ko: '2025 Placement', en: '2025 placement' }, defaultOn: false },
  { id: 'notes', label: { ko: '브로커 노트', en: 'Broker notes' }, meta: { ko: '메일 스레드 요약', en: 'email thread summary' }, defaultOn: false },
];
```
를 다음으로 교체:
```ts
export type SourceGroupId = 'drive' | 'portal' | 'mail';
export type SourceExt = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'eml';

export interface SourceGroup {
  id: SourceGroupId;
  label: L;
}

export interface SourceFile {
  id: string;
  group: SourceGroupId;
  name: L; // 파일명 — 행 제목 + 보고서 칩
  desc: L; // 한 줄 설명 — 행 보조
  ext: SourceExt;
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

- [ ] **Step 2: `STR`에 로딩 문구 추가**

`STR` 객체에서 `sourceSummary` 줄 바로 아래에 추가:
```ts
  sourceSummary: { ko: '근거 자료 {n}건', en: '{n} source materials' },
  sourcesLoading: { ko: '근거 자료 불러오는 중…', en: 'Loading source materials…' },
  sourcesSelected: { ko: '{n}건 선택', en: '{n} selected' },
```
(`sourceSummary` 줄은 기존 그대로 두고 그 아래 두 줄을 삽입한다.)

- [ ] **Step 3: 타입체크 (다른 파일 참조가 깨지는지 확인)**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: `state.ts`와 `widgets.tsx`가 아직 `SOURCES`를 참조하므로 **에러가 난다**(예: `Module '"./data"' has no exported member 'SOURCES'`). 이는 Task 2에서 해소된다. 이 Task는 여기서 커밋하지 않고 Task 2까지 한 커밋으로 묶는다.

- [ ] **Step 4: (커밋하지 않음)** 이 Task는 컴파일이 깨진 상태이므로 Task 2 완료 후 함께 커밋한다.

---

### Task 2: 스토어 로딩 상태 + 참조 갱신 (state.ts, widgets.tsx ReportView 칩) — 컴파일 복구 후 커밋

**Files:**
- Modify: `src/demos/aria/renewal-report/state.ts`
- Modify: `src/demos/aria/renewal-report/widgets.tsx` (import 및 `ReportView`의 `selectedLabels`만)

**Interfaces:**
- Consumes: Task 1의 `SOURCE_FILES`.
- Produces:
  - `type SourcesStatus = 'idle' | 'loading' | 'ready'`
  - 스토어 추가: `sourcesStatus: SourcesStatus`, `loadedSourceIds: string[]`, `loadSources: () => void`
  - `selectedSources` 초기값 `[]`

- [ ] **Step 1: state.ts — import 교체**

```ts
import { REPORT_SECTIONS, SOURCE_FILES, getRecipient, STR, type ReportSectionId } from './data';
```
(`SOURCES` 제거, `SOURCE_FILES` 추가.)

- [ ] **Step 2: state.ts — 타입/인터페이스 확장**

`EmailStatus` 선언 아래에 추가:
```ts
export type SourcesStatus = 'idle' | 'loading' | 'ready';
```

`ReportEmailState` 인터페이스에서 `selectedSources: string[];` 아래에 추가:
```ts
  /** 연동 소스 로딩 상태 */
  sourcesStatus: SourcesStatus;
  /** 현재까지 로드되어 화면에 등장한 파일 id */
  loadedSourceIds: string[];
```
그리고 `toggleSource` 선언 위에 액션 선언 추가:
```ts
  /** 연동 소스에서 자료를 점진적으로 불러온다 (idle일 때만 동작) */
  loadSources: () => void;
```

- [ ] **Step 3: state.ts — 기본값 교체**

`const defaultSources = SOURCES.filter((s) => s.defaultOn).map((s) => s.id);` 줄을 **삭제**.

`initial` 객체에서 `selectedSources: defaultSources,`를 교체하고 두 필드 추가:
```ts
  selectedSources: [] as string[],
  sourcesStatus: 'idle' as SourcesStatus,
  loadedSourceIds: [] as string[],
```

- [ ] **Step 4: state.ts — `toggleSource` 가드 강화 + `loadSources` 추가**

기존 `toggleSource`를 교체:
```ts
  toggleSource: (id) => {
    if (get().phase !== 'sources' || get().sourcesStatus !== 'ready') return;
    if (!get().loadedSourceIds.includes(id)) return;
    set((s) => ({
      selectedSources: s.selectedSources.includes(id)
        ? s.selectedSources.filter((x) => x !== id)
        : [...s.selectedSources, id],
    }));
  },

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
(`runId`, `sleep`는 파일 상단에 이미 존재.)

- [ ] **Step 5: widgets.tsx — import 및 ReportView 칩 참조 갱신**

import 블록에서 `SOURCES,`를 `SOURCE_FILES,`로 교체(이 Step에서는 `SOURCE_GROUPS`는 아직 미사용이므로 추가하지 않는다 — Task 3에서 추가).

`ReportView` 안의:
```ts
  const selectedLabels = SOURCES.filter((s) => selectedSources.includes(s.id));
```
를 교체:
```ts
  const selectedLabels = SOURCE_FILES.filter((f) => selectedSources.includes(f.id));
```
그리고 칩 렌더에서 라벨 텍스트를 파일명으로:
```tsx
          {selectedLabels.map((s) => (
            <span key={s.id} className="max-w-[140px] truncate rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-400">
              {pick(s.name, lang)}
            </span>
          ))}
```
(`s.label` → `s.name`, `max-w-[140px] truncate` 추가.)

- [ ] **Step 6: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: `SourcePicker`가 여전히 `SOURCES`를 참조하므로 **에러가 남는다**(Task 3에서 해소). state.ts와 ReportView 관련 에러는 사라진다.

> 주의: 이 Task만으로는 컴파일이 완전히 통과하지 않는다(SourcePicker 미수정). Task 3까지 한 흐름으로 진행하고, **Task 3 Step 종료 시 통합 커밋**한다. Task 1·2·3은 하나의 원자적 변경으로 커밋된다.

---

### Task 3: SourcePicker 재작성 + SourceFileRow (widgets.tsx) — 통합 커밋

**Files:**
- Modify: `src/demos/aria/renewal-report/widgets.tsx`

**Interfaces:**
- Consumes: Task 1의 `SOURCE_GROUPS`/`SOURCE_FILES`/`SourceFile`/`SourceExt`, Task 2의 `sourcesStatus`/`loadedSourceIds`/`loadSources`.
- Produces: 재작성된 `SourcePicker`, 신규 `SourceFileRow`, `EXT_ICON` 매핑.

- [ ] **Step 1: import 보강**

widgets.tsx import 블록에서 lucide 아이콘에 `FileSpreadsheet`, `HardDrive`를 추가(이미 있는 `Building2`, `Mail`, `FileText`, `Loader2`, `CheckCircle2`, `Sparkles`는 재사용). data import에 `SOURCE_GROUPS`, `type SourceFile`, `type SourceExt`를 추가:
```ts
import {
  ATTACHMENT,
  CHANGES,
  CONCLUSION,
  DEAL,
  EXEC_SUMMARY,
  LOSS_RUN,
  OVERVIEW,
  PANEL,
  PANEL_SECURITY,
  RECIPIENTS,
  SOURCE_FILES,
  SOURCE_GROUPS,
  SOURCES_BY_GROUP_REMOVED, // (존재하지 않음 — 추가 금지, 아래 설명 참조)
  SOURCES,
  STR,
  STRUCTURE,
  getRecipient,
  type ReportSectionId,
  type SourceExt,
  type SourceFile,
} from './data';
```
> 위 블록은 예시가 아니라 주의용이다. 실제로는 기존 import에서 `SOURCES`(Task 2에서 이미 `SOURCE_FILES`로 바뀜)를 두고, **`SOURCE_GROUPS`, `type SourceExt`, `type SourceFile`만 추가**한다. `SOURCES_BY_GROUP_REMOVED`/`SOURCES` 같은 존재하지 않는/제거된 식별자는 import 하지 않는다. 최종 import에 `SOURCES`가 남아 있으면 안 된다.

- [ ] **Step 2: 확장자 아이콘 매핑 추가**

`RECIPIENT_ICON` 상수 부근(파일 상단 상수 영역)에 추가:
```ts
const EXT_ICON: Record<SourceExt, typeof FileText> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  eml: Mail,
};

const GROUP_ICON: Record<string, typeof FileText> = {
  drive: HardDrive,
  portal: Building2,
  mail: Mail,
};
```

- [ ] **Step 3: `SourceFileRow` 하위 컴포넌트 추가**

`SourcePicker` 함수 정의 바로 위에 추가:
```tsx
/** 파일 한 줄 — 로드 전 스켈레톤, 로드되면 등장 + 선택 토글 */
function SourceFileRow({
  file,
  loaded,
  selected,
  onToggle,
  compact,
}: {
  file: SourceFile;
  loaded: boolean;
  selected: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const lang = useLang();
  if (!loaded) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5">
        <span className="h-4.5 w-4.5 shrink-0 animate-pulse rounded-[5px] bg-white/[0.06]" />
        <span className="h-4 w-4 shrink-0 animate-pulse rounded bg-white/[0.06]" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="h-2.5 w-32 animate-pulse rounded bg-white/[0.06]" />
          <span className="h-2 w-20 animate-pulse rounded bg-white/[0.04]" />
        </span>
      </div>
    );
  }
  const Icon = EXT_ICON[file.ext];
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      data-demo-id={`source-toggle-${file.id}`}
      onClick={onToggle}
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
        selected
          ? 'border-brass-500/40 bg-brass-500/[0.08]'
          : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]',
      )}
    >
      <span
        className={cn(
          'flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-[5px] border',
          selected ? 'border-brass-400 bg-brass-500 text-ink-950' : 'border-white/20 text-transparent',
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
      </span>
      <Icon className={cn('h-4 w-4 shrink-0', selected ? 'text-brass-300' : 'text-zinc-600')} />
      <span className="min-w-0">
        <span className={cn('block truncate font-medium text-zinc-200', compact ? 'text-[12px]' : 'text-[12.5px]')}>
          {pick(file.name, lang)}
        </span>
        <span className="block truncate text-[10.5px] text-zinc-500">{pick(file.desc, lang)}</span>
      </span>
    </motion.button>
  );
}
```

- [ ] **Step 4: `SourcePicker` 재작성**

기존 `SourcePicker` 함수 전체를 교체:
```tsx
function SourcePicker({ compact }: { compact?: boolean }) {
  const { selectedSources, toggleSource, generate, sourcesStatus, loadedSourceIds, loadSources } = useRenewalReport();
  const lang = useLang();
  const ready = sourcesStatus === 'ready';
  const canGenerate = ready && selectedSources.length > 0;

  // 마운트/리셋(idle) 시 연동 소스 자동 로드
  useEffect(() => {
    loadSources();
  }, [sourcesStatus, loadSources]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-3">
        <p className={cn('font-semibold text-zinc-100', compact ? 'text-[13px]' : 'text-[14px]')}>
          {ready ? pick(STR.sourcesTitle, lang) : pick(STR.sourcesLoading, lang)}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-500">
          {ready
            ? `${fmt(pick(STR.sourceSummary, lang), { n: SOURCE_FILES.length })} · ${fmt(pick(STR.sourcesSelected, lang), { n: selectedSources.length })}`
            : `${loadedSourceIds.length}/${SOURCE_FILES.length}`}
        </p>
      </div>

      <div className="demo-scroll min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          {SOURCE_GROUPS.map((g) => {
            const files = SOURCE_FILES.filter((f) => f.group === g.id);
            const GIcon = GROUP_ICON[g.id] ?? HardDrive;
            return (
              <div key={g.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 px-0.5">
                  <GIcon className="h-3.5 w-3.5 text-brass-300/70" />
                  <span className="text-[11px] font-semibold text-zinc-300">{pick(g.label, lang)}</span>
                  <span className="text-[10px] text-zinc-600">{files.length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {files.map((f) => (
                    <SourceFileRow
                      key={f.id}
                      file={f}
                      loaded={loadedSourceIds.includes(f.id)}
                      selected={selectedSources.includes(f.id)}
                      onToggle={() => toggleSource(f.id)}
                      compact={compact}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/[0.06] p-3.5">
        <button
          data-demo-id="generate-btn"
          onClick={() => generate()}
          disabled={!canGenerate}
          className={cn(
            'flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-all',
            canGenerate
              ? 'bg-brass-500 text-ink-950 shadow-[0_6px_20px_-6px_rgba(192,141,82,0.6)] hover:bg-brass-400'
              : 'bg-white/[0.05] text-zinc-600',
          )}
        >
          <Sparkles className="h-4 w-4" />
          {fmt(pick(STR.generateBtn, lang), {})} · {fmt(pick(STR.sourceSummary, lang), { n: selectedSources.length })}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `useEffect` import 확인**

widgets.tsx 최상단 import에 `useEffect`가 없으면 추가. 현재 `import type { ReactNode } from 'react';`만 있을 수 있으므로 다음으로 보강:
```ts
import { useEffect, type ReactNode } from 'react';
```

- [ ] **Step 6: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS (에러 0). `SOURCES`/`SourceDoc` 잔여 참조가 없어야 한다.

- [ ] **Step 7: 통합 커밋 (Task 1+2+3)**

```bash
git add src/demos/aria/renewal-report/data.ts src/demos/aria/renewal-report/state.ts src/demos/aria/renewal-report/widgets.tsx
git commit --no-gpg-sign -m "$(cat <<'EOF'
feat(renewal-report): 파일 선택 화면 — 연동 소스 그룹 로드 후 선택

- SOURCES(평면 5개) → SOURCE_GROUPS(드라이브/포털/메일) + SOURCE_FILES(6개)
- 스토어: sourcesStatus/loadedSourceIds/loadSources() 점진 로딩, 선택 빈 시작
- SourcePicker 재작성: 자동 로드 + 그룹별 스켈레톤→파일 행(SourceFileRow)
- 보고서 헤더 칩을 선택 파일명으로 갱신

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 시나리오 — 로드 대기 후 특정 파일 3개 선택

**Files:**
- Modify: `src/demos/aria/renewal-report/scenario.ts`

**Interfaces:**
- Consumes: `toggleSource`/`generate`(store), `SPOTLIGHT.select`(data), `getLang`/`pick`.

- [ ] **Step 1: 자료 선택 비트 교체**

`scenario.ts`의 다음 블록(현행):
```ts
    { kind: 'wait', ms: 800 },
    // [줌1] 근거 자료를 직접 선택할 수 있음을 강조
    {
      kind: 'cursor',
      target: 'source-toggle-notes',
      ms: 800,
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'click',
      target: 'source-toggle-notes',
      run: () => st().toggleSource('notes'),
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    { kind: 'wait', ms: 1300 }, // 캡션 읽기
    // [줌아웃] 보고서 생성 — 줌 없이 전체가 자동 생성되는 모습
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
```
를 다음으로 교체:
```ts
    { kind: 'wait', ms: 2400 }, // 연동 소스에서 자료 로드 완료 대기 (로드 ~1.9s + 버퍼)
    // [줌1] 로드된 자료 중 특정 파일을 직접 선택
    {
      kind: 'cursor',
      target: 'source-toggle-slip',
      ms: 700,
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'click',
      target: 'source-toggle-slip',
      run: () => st().toggleSource('slip'),
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'cursor',
      target: 'source-toggle-lossrun',
      ms: 600,
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'click',
      target: 'source-toggle-lossrun',
      run: () => st().toggleSource('lossrun'),
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'cursor',
      target: 'source-toggle-quotes',
      ms: 600,
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    {
      kind: 'click',
      target: 'source-toggle-quotes',
      run: () => st().toggleSource('quotes'),
      zoom: true,
      caption: () => pick(SPOTLIGHT.select, getLang()),
    },
    { kind: 'wait', ms: 900 }, // 선택 결과 보기
    // [줌아웃] 보고서 생성 — 줌 없이 전체가 자동 생성되는 모습
    { kind: 'cursor', target: 'generate-btn', ms: 600 },
    { kind: 'click', target: 'generate-btn', run: () => st().generate() },
```
(이후 `{ kind: 'wait', ms: 5200 }` 이하 보고서/이메일/발송 흐름은 그대로 둔다.)

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS.

- [ ] **Step 3: 커밋**

```bash
git add src/demos/aria/renewal-report/scenario.ts
git commit --no-gpg-sign -m "$(cat <<'EOF'
feat(renewal-report): 시나리오 — 자료 로드 대기 후 특정 파일 3개 선택

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 육안 검증

**Files:** 없음(실행 검증만).

- [ ] **Step 1: dev 서버에서 데모 열기**

dev 서버 미가동 시 `npm run dev`. 갤러리 → ARIA → `갱신 결과 보고서 + 전달 이메일`.

- [ ] **Step 2: 재생 후 파일 선택 플로우 확인**

- 자료가 그룹(사내 드라이브/출재사 포털/메일함)별로 **스켈레톤 → 점진 등장**하는지.
- 처음엔 전부 미선택이고, 줌인+"필요한 근거 자료를 직접 선택" 캡션 상태에서 커서가
  **슬립·손해실적·견적 3개**를 그룹을 오가며 선택하는지.
- 상태줄이 로딩 중 `(n/6)` → 완료 시 `근거 자료 6건 · 3건 선택`으로 바뀌는지.
- 생성 버튼이 선택 전 비활성 → 선택 후 활성 → 클릭 시 보고서 생성으로 이어지는지.
- 보고서 헤더 칩이 선택한 파일명으로 표시되는지.

- [ ] **Step 3: 언어 토글 확인**

ko↔en 전환 후 재생 → 그룹명·파일명·설명·상태 문구가 해당 언어로 표시.

- [ ] **Step 4: 최종 타입체크**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS (에러 0).

---

## Self-Review

**1. Spec coverage:**
- 데이터 모델(그룹/파일) → Task 1. STR 문구 → Task 1. 스토어 로딩 상태/액션 → Task 2. 선택 빈 시작 → Task 2. ReportView 칩 → Task 2. SourcePicker 재작성/SourceFileRow/스켈레톤/자동 로드/그룹 렌더/확장자 아이콘/생성 버튼 가드 → Task 3. 시나리오 3개 선택 → Task 4. 검증(타입/육안/언어) → Task 5. 모든 스펙 항목이 태스크에 매핑됨.

**2. Placeholder scan:** 모든 코드 step에 실제 코드 포함. Task 3 Step 1의 "예시용 주의 블록"은 의도적으로 존재하지 않는 식별자를 import하지 말라는 경고이며, 실제 적용 지침(SOURCE_GROUPS·type SourceExt·type SourceFile만 추가, SOURCES 잔존 금지)을 명시함.

**3. Type consistency:**
- `SourcesStatus` — Task 2 정의, Task 3에서 `sourcesStatus==='ready'`로 사용.
- `loadSources`/`loadedSourceIds`/`sourcesStatus` — Task 2 정의, Task 3에서 동일 이름 구독/호출.
- `SOURCE_FILES`/`SOURCE_GROUPS`/`SourceFile`/`SourceExt` — Task 1 정의, Task 2(SOURCE_FILES)·Task 3(전부) 사용.
- `STR.sourcesLoading`/`STR.sourcesSelected` — Task 1 추가, Task 3 사용.
- `data-demo-id` `source-toggle-<id>` — Task 3(SourceFileRow) 생성, Task 4 시나리오 타깃과 일치(`slip`/`lossrun`/`quotes`).
- 컴파일 원자성: Task 1·2는 의도적으로 중간 컴파일 에러 상태이며 Task 3 Step 7에서 단일 커밋으로 복구(Global Constraints에 명시).
