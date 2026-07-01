# aria-matrix 업로드-우선 통합 플로우 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `aria-matrix` 데모를 "PDF 여러 개 업로드 → 즉시 자동 일괄 추출 → 원문 인용 검증"의 단일 통합 플로우로 재구성한다.

**Architecture:** zustand 스토어에 `phase`(idle→picking→uploading→analyzing→done) 상태 머신을 도입한다. 데스크탑은 Windows 탐색기 스타일 오버레이(`FileExplorer.tsx`)로, 모바일은 하단 시트로 다중 파일 선택을 재현한다. 업로드 완료 시 스토어가 스스로 6개 열을 추가하고 셀을 웨이브로 채운 뒤, 시나리오가 셀 클릭으로 원문 인용 패널을 연다. 기존 2개 variant는 단일 variant로 치환한다.

**Tech Stack:** React 18 + TypeScript(strict), zustand, framer-motion, lucide-react, Tailwind v4. 빌드/타입체크: `npm run build` (= `tsc --noEmit && vite build`).

## Global Constraints

- 이 저장소에는 단위 테스트 러너가 없다. **각 태스크의 검증 게이트는 `npm run build` 성공**이며, 추가로 자동 재생 시나리오·리셋 동작의 육안 확인으로 보완한다 (스펙의 "테스트/검증" 절).
- `tsconfig.json`에 `noUnusedLocals`/`noUnusedParameters`가 켜져 있다 → 미사용 **로컬/임포트**는 빌드 실패. 미사용 **export 프로퍼티/함수**는 통과한다. 따라서 제거는 소비처가 모두 사라진 뒤 마지막에 한다.
- 모든 목업 연출: 실제 파일 파싱/업로드 백엔드·실제 드래그드롭 없음.
- 커서 타깃 `data-demo-id`는 데스크탑·모바일 양쪽에서 동일해야 한다(공용 시나리오): `upload-btn`, `file-<docId>`, `explorer-open-btn`, `cell-<docId>-<colId>`.
- ko/en 카피는 직역이 아니라 언어별로 자연스럽게 작성한다.
- 다크 테마(`#111014` 계열) 유지. 단, 탐색기 오버레이만 OS 창임을 나타내는 밝은 크롬.
- 재보험 전문용어(LoB, Per Occurrence Limit 등)는 영어 원어를 양 언어 공통 유지.
- `_: DemoComponentProps`처럼 밑줄 접두 미사용 매개변수는 허용된다.

---

### Task 1: 데이터 — 탐색기 메타 + 신규 UI 문자열 추가

**Files:**
- Modify: `src/demos/aria/aria-matrix/data.ts`

**Interfaces:**
- Consumes: 기존 `L`, `Lang` 타입.
- Produces: `interface ExplorerMeta { modified: string; size: string }`, `FILE_META: Record<string, ExplorerMeta>`, 그리고 `STR`에 신규 키 추가 — `uploadCta`, `uploadHint`, `analyzing`, `explorerTitle`, `explorerFavorites`, `explorerFolder`, `explorerThisPc`, `explorerColName`, `explorerColModified`, `explorerColType`, `explorerColSize`, `explorerPdfType`, `explorerFileName`, `explorerOpen`, `sheetTitle`, `sheetUpload`.

- [ ] **Step 1: `data.ts`에 `ExplorerMeta` + `FILE_META` 추가**

`DOCUMENTS` 배열 정의 바로 아래에 추가:

```ts
/** 탐색기 표시용 더미 메타 (수정한 날짜·크기) */
export interface ExplorerMeta {
  modified: string;
  size: string;
}

export const FILE_META: Record<string, ExplorerMeta> = {
  propcat: { modified: '2026-06-28', size: '2.4 MB' },
  marine: { modified: '2026-06-27', size: '1.1 MB' },
  casualty: { modified: '2026-06-25', size: '3.8 MB' },
  energy: { modified: '2026-06-24', size: '1.7 MB' },
  aviation: { modified: '2026-06-22', size: '2.9 MB' },
};
```

- [ ] **Step 2: `STR` 객체에 신규 키 추가**

기존 `STR` 객체 안에, 기존 키(`appTitle`, `documents`, `extracting`, `extractProgress`, `addColumn`, `allColumnsAdded`, `emptyHint`, `byline`)는 **그대로 두고** 다음 키를 추가한다:

```ts
  // 업로드/분석 (신규 플로우)
  uploadCta: { ko: '문서 업로드', en: 'Upload documents' },
  uploadHint: { ko: 'PDF 슬립·특약을 끌어다 놓거나 선택하세요', en: 'Drop or select PDF slips & wordings' },
  analyzing: { ko: 'ARIA 분석 중…', en: 'ARIA analysing…' },
  // OS 파일 탐색기
  explorerTitle: { ko: '열기', en: 'Open' },
  explorerFavorites: { ko: '즐겨찾기', en: 'Favourites' },
  explorerFolder: { ko: 'Reinsurance', en: 'Reinsurance' },
  explorerThisPc: { ko: '내 PC', en: 'This PC' },
  explorerColName: { ko: '이름', en: 'Name' },
  explorerColModified: { ko: '수정한 날짜', en: 'Date modified' },
  explorerColType: { ko: '유형', en: 'Type' },
  explorerColSize: { ko: '크기', en: 'Size' },
  explorerPdfType: { ko: 'PDF 문서', en: 'PDF Document' },
  explorerFileName: { ko: '파일 이름', en: 'File name' },
  explorerOpen: { ko: '열기', en: 'Open' },
  // 모바일 하단 시트
  sheetTitle: { ko: '업로드할 문서 선택', en: 'Select documents to upload' },
  sheetUpload: { ko: '업로드', en: 'Upload' },
```

- [ ] **Step 3: 빌드 게이트**

Run: `npm run build`
Expected: 성공(타입 에러 없음). 신규 export는 아직 소비처가 없어도 통과한다.

- [ ] **Step 4: 커밋**

```bash
git add src/demos/aria/aria-matrix/data.ts
git commit -m "feat(aria-matrix): 탐색기 메타·업로드 UI 문자열 데이터 추가"
```

---

### Task 2: 스토어 — phase 상태 머신 + 업로드/자동분석 액션

**Files:**
- Modify: `src/demos/aria/aria-matrix/state.ts` (전면 재작성)

**Interfaces:**
- Consumes: `COLUMNS`, `DOCUMENTS` (from `./data`).
- Produces:
  - `type MatrixPhase = 'idle' | 'picking' | 'uploading' | 'analyzing' | 'done'`
  - `type CellStatus = 'empty' | 'extracting' | 'done'` (유지)
  - `key(docId, colId): string` (유지)
  - `useMatrix` 스토어 상태: `phase`, `explorerOpen`, `selectedFiles: string[]`, `uploadedDocs: string[]`, `uploadProgress: Record<string, number>`, `activeColumns: string[]`, `cellStatus: Record<string, CellStatus>`, `popover: { docId: string; colId: string } | null`.
  - 액션: `openExplorer()`, `toggleFileSelect(id: string)`, `confirmUpload()`, `analyzeAll()`, `openPopover(docId, colId)`, `closePopover()`, `reset()`.
  - **전이 유지용 임시 액션**: `nextColumn(): string | null`, `addColumn(): void` — 아직 옛 `scenario.ts`가 참조하므로 Task 6까지 유지, Task 7에서 제거.

- [ ] **Step 1: `state.ts` 전면 재작성**

```ts
import { create } from 'zustand';
import { COLUMNS, DOCUMENTS } from './data';

export type CellStatus = 'empty' | 'extracting' | 'done';
export type MatrixPhase = 'idle' | 'picking' | 'uploading' | 'analyzing' | 'done';

interface MatrixState {
  phase: MatrixPhase;
  explorerOpen: boolean;
  /** 탐색기/시트에서 선택된 파일 id */
  selectedFiles: string[];
  /** 앱으로 유입 완료된 문서 id — 매트릭스 행은 이 배열만 렌더 */
  uploadedDocs: string[];
  /** docId → 업로드 진행률(0~1) */
  uploadProgress: Record<string, number>;
  activeColumns: string[];
  cellStatus: Record<string, CellStatus>;
  popover: { docId: string; colId: string } | null;

  openExplorer: () => void;
  toggleFileSelect: (id: string) => void;
  confirmUpload: () => void;
  analyzeAll: () => void;
  openPopover: (docId: string, colId: string) => void;
  closePopover: () => void;
  reset: () => void;

  // --- 전이 유지용 (Task 6까지 옛 시나리오가 참조; Task 7에서 제거) ---
  nextColumn: () => string | null;
  addColumn: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** reset 시 증가 — 진행 중인 모든 async 루프를 무효화한다 */
let runId = 0;

export const key = (docId: string, colId: string) => `${docId}:${colId}`;

export const useMatrix = create<MatrixState>((set, get) => ({
  phase: 'idle',
  explorerOpen: false,
  selectedFiles: [],
  uploadedDocs: [],
  uploadProgress: {},
  activeColumns: [],
  cellStatus: {},
  popover: null,

  openExplorer: () => set({ phase: 'picking', explorerOpen: true }),

  toggleFileSelect: (id) =>
    set((s) => ({
      selectedFiles: s.selectedFiles.includes(id)
        ? s.selectedFiles.filter((f) => f !== id)
        : [...s.selectedFiles, id],
    })),

  confirmUpload: () => {
    const id = ++runId;
    const files = get().selectedFiles.length ? get().selectedFiles : DOCUMENTS.map((d) => d.id);
    set({ phase: 'uploading', explorerOpen: false });
    void (async () => {
      // 문서 순차 유입 + 진행률 애니메이션
      for (const docId of files) {
        if (id !== runId) return;
        set((s) => ({
          uploadedDocs: [...s.uploadedDocs, docId],
          uploadProgress: { ...s.uploadProgress, [docId]: 0 },
        }));
        for (let p = 0.25; p <= 1.0001; p += 0.25) {
          await sleep(90);
          if (id !== runId) return;
          set((s) => ({ uploadProgress: { ...s.uploadProgress, [docId]: Math.min(1, p) } }));
        }
      }
      await sleep(250);
      if (id !== runId) return;
      get().analyzeAll();
    })();
  },

  analyzeAll: () => {
    const id = runId; // confirmUpload과 같은 세대(직접 호출 시 현재 세대)
    set({ phase: 'analyzing' });
    void (async () => {
      // 6개 열을 빠르게 추가(열 등장 애니메이션 stagger)
      for (const col of COLUMNS) {
        if (id !== runId) return;
        set((s) => ({ activeColumns: [...s.activeColumns, col.id] }));
        await sleep(140);
      }
      // 모든 셀을 추출 중으로
      if (id !== runId) return;
      const extracting: Record<string, CellStatus> = {};
      for (const doc of get().uploadedDocs) for (const col of COLUMNS) extracting[key(doc, col.id)] = 'extracting';
      set((s) => ({ cellStatus: { ...s.cellStatus, ...extracting } }));
      // 셀을 웨이브(문서×열)로 채움
      for (const doc of get().uploadedDocs) {
        for (const col of COLUMNS) {
          await sleep(110 + Math.random() * 120);
          if (id !== runId) return;
          set((s) => ({ cellStatus: { ...s.cellStatus, [key(doc, col.id)]: 'done' } }));
        }
      }
      if (id !== runId) return;
      set({ phase: 'done' });
    })();
  },

  openPopover: (docId, colId) => set({ popover: { docId, colId } }),
  closePopover: () => set({ popover: null }),

  reset: () => {
    runId++;
    set({
      phase: 'idle',
      explorerOpen: false,
      selectedFiles: [],
      uploadedDocs: [],
      uploadProgress: {},
      activeColumns: [],
      cellStatus: {},
      popover: null,
    });
  },

  // --- 전이 유지용 (Task 7에서 제거) ---
  nextColumn: () => {
    const active = get().activeColumns;
    return COLUMNS.find((c) => !active.includes(c.id))?.id ?? null;
  },
  addColumn: () => {
    const colId = get().nextColumn();
    if (!colId) return;
    const id = runId;
    const docs = get().uploadedDocs.length ? get().uploadedDocs : DOCUMENTS.map((d) => d.id);
    set((s) => ({ activeColumns: [...s.activeColumns, colId] }));
    void (async () => {
      await sleep(300);
      for (const doc of docs) {
        if (id !== runId) return;
        set((s) => ({ cellStatus: { ...s.cellStatus, [key(doc, colId)]: 'extracting' } }));
      }
      for (const doc of docs) {
        await sleep(300);
        if (id !== runId) return;
        set((s) => ({ cellStatus: { ...s.cellStatus, [key(doc, colId)]: 'done' } }));
      }
    })();
  },
}));
```

- [ ] **Step 2: 빌드 게이트**

Run: `npm run build`
Expected: 성공. (옛 `scenario.ts`/`Desktop.tsx`/`Mobile.tsx`가 `addColumn`/`nextColumn`을 계속 참조하지만 여전히 존재하므로 통과.)

- [ ] **Step 3: 커밋**

```bash
git add src/demos/aria/aria-matrix/state.ts
git commit -m "feat(aria-matrix): phase 상태 머신·업로드/자동분석 스토어 액션"
```

---

### Task 3: `FileExplorer.tsx` — Windows 탐색기 오버레이

**Files:**
- Create: `src/demos/aria/aria-matrix/FileExplorer.tsx`

**Interfaces:**
- Consumes: `useMatrix`(`selectedFiles`, `toggleFileSelect`, `confirmUpload`), `DOCUMENTS`, `FILE_META`, `STR`, `pick`, `useLang`, `cn`.
- Produces: `export function FileExplorer(): JSX.Element` — 앱 위 절대배치 오버레이. `data-demo-id`: 파일 행 `file-<docId>`, 열기 버튼 `explorer-open-btn`.

- [ ] **Step 1: `FileExplorer.tsx` 작성**

```tsx
import { motion } from 'framer-motion';
import { FileText, Folder, HardDrive, Star } from 'lucide-react';
import { useMatrix } from './state';
import { DOCUMENTS, FILE_META, STR } from './data';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/** Windows 탐색기 "열기" 다이얼로그 재현 — explorerOpen일 때 오버레이로 마운트 */
export function FileExplorer() {
  const m = useMatrix();
  const lang = useLang();
  const selected = DOCUMENTS.filter((d) => m.selectedFiles.includes(d.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-[76%] w-[74%] flex-col overflow-hidden rounded-lg border border-black/20 bg-[#f3f3f3] text-[#1f1f1f] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      >
        {/* 제목표시줄 */}
        <div className="flex items-center gap-2 border-b border-black/10 bg-[#e7e7e7] px-3 py-2">
          <Folder className="h-3.5 w-3.5 text-[#c8a24a]" />
          <span className="text-[12px] font-medium">{pick(STR.explorerTitle, lang)}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* 사이드바 (장식) */}
          <div className="w-40 shrink-0 space-y-1 border-r border-black/10 bg-[#eaeaea] p-2 text-[11px] text-[#444]">
            <div className="flex items-center gap-1.5 rounded px-2 py-1">
              <Star className="h-3 w-3" /> {pick(STR.explorerFavorites, lang)}
            </div>
            <div className="flex items-center gap-1.5 rounded bg-[#d7e6fb] px-2 py-1 text-[#1f1f1f]">
              <Folder className="h-3 w-3" /> {pick(STR.explorerFolder, lang)}
            </div>
            <div className="flex items-center gap-1.5 rounded px-2 py-1">
              <HardDrive className="h-3 w-3" /> {pick(STR.explorerThisPc, lang)}
            </div>
          </div>

          {/* 파일 리스트 */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center border-b border-black/10 bg-[#f7f7f7] px-3 py-1.5 text-[10.5px] font-medium text-[#666]">
              <span className="flex-1">{pick(STR.explorerColName, lang)}</span>
              <span className="w-28 shrink-0">{pick(STR.explorerColModified, lang)}</span>
              <span className="w-24 shrink-0">{pick(STR.explorerColType, lang)}</span>
              <span className="w-16 shrink-0 text-right">{pick(STR.explorerColSize, lang)}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {DOCUMENTS.map((doc) => {
                const sel = m.selectedFiles.includes(doc.id);
                const meta = FILE_META[doc.id];
                return (
                  <button
                    key={doc.id}
                    data-demo-id={`file-${doc.id}`}
                    onClick={() => m.toggleFileSelect(doc.id)}
                    className={cn(
                      'flex w-full items-center px-3 py-1.5 text-left text-[11.5px]',
                      sel ? 'bg-[#cfe4fb]' : 'hover:bg-[#eef2f7]',
                    )}
                  >
                    <span className="flex flex-1 items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#c0392b]" />
                      <span className="truncate">{doc.fileName}</span>
                    </span>
                    <span className="w-28 shrink-0 text-[#666]">{meta.modified}</span>
                    <span className="w-24 shrink-0 text-[#666]">{pick(STR.explorerPdfType, lang)}</span>
                    <span className="w-16 shrink-0 text-right text-[#666]">{meta.size}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하단: 파일 이름 + 열기 */}
        <div className="flex items-center gap-2 border-t border-black/10 bg-[#efefef] px-3 py-2.5">
          <span className="text-[11px] text-[#555]">{pick(STR.explorerFileName, lang)}</span>
          <div className="min-w-0 flex-1 truncate rounded border border-black/15 bg-white px-2 py-1 text-[11px] text-[#333]">
            {selected.map((d) => `"${d.fileName}"`).join(' ')}
          </div>
          <button
            data-demo-id="explorer-open-btn"
            onClick={() => m.confirmUpload()}
            disabled={selected.length === 0}
            className={cn(
              'shrink-0 rounded px-4 py-1.5 text-[11.5px] font-medium',
              selected.length > 0 ? 'bg-[#0b6bcb] text-white hover:bg-[#0a5fb3]' : 'bg-[#dcdcdc] text-[#999]',
            )}
          >
            {pick(STR.explorerOpen, lang)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: 빌드 게이트**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/demos/aria/aria-matrix/FileExplorer.tsx
git commit -m "feat(aria-matrix): Windows 탐색기 스타일 파일 선택 오버레이"
```

---

### Task 4: `Desktop.tsx` — 업로드 히어로 + 매트릭스 + 탐색기 마운트

**Files:**
- Modify: `src/demos/aria/aria-matrix/Desktop.tsx` (전면 재작성)

**Interfaces:**
- Consumes: `useMatrix`, `key`, `DOCUMENTS`, `COLUMNS`, `CELLS`, `MODEL_CHIP`, `STR`, `extractedSummary`, `CitationBadge`, `CitationPopover`, `FileExplorer`, `pick`, `useLang`, `cn`, `AriaWordmark`.
- Produces: `export function Desktop(_: DemoComponentProps)`. `data-demo-id`: `upload-btn`, `cell-<docId>-<colId>`. (탐색기 관련 id는 `FileExplorer`가 제공.)

- [ ] **Step 1: `Desktop.tsx` 전면 재작성**

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Grid3X3, Loader2, CheckCircle2, Cpu, UploadCloud } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useMatrix, key } from './state';
import { DOCUMENTS, COLUMNS, CELLS, MODEL_CHIP, STR, extractedSummary } from './data';
import { CitationBadge, CitationPopover } from '../../../ui/Citation';
import { FileExplorer } from './FileExplorer';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';
import { AriaWordmark } from '../_shared/AriaWordmark';

export function Desktop(_: DemoComponentProps) {
  const m = useMatrix();
  const lang = useLang();
  const docs = DOCUMENTS.filter((d) => m.uploadedDocs.includes(d.id));
  const totalCells = docs.length * COLUMNS.length;
  const doneCells = Object.values(m.cellStatus).filter((s) => s === 'done').length;
  const allDone = m.phase === 'done';
  const popCell = m.popover ? CELLS[m.popover.docId]?.[m.popover.colId] : null;
  const popDoc = m.popover ? DOCUMENTS.find((d) => d.id === m.popover!.docId) : null;

  return (
    <div className="relative flex h-full bg-[#111014] text-zinc-200">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 툴바 */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
            <Grid3X3 className="h-4 w-4" />
          </div>
          <h2 className="flex items-baseline text-[13.5px] font-semibold text-zinc-100">
            {pick(STR.appTitle, lang)}
            <span className="ml-1.5 flex items-center gap-1 text-[10px] font-normal text-zinc-500">
              <AriaWordmark className="h-2.5" /> by AlphaLenz
            </span>
          </h2>
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-zinc-400">
            <Cpu className="h-3 w-3 text-brass-400" /> {pick(MODEL_CHIP, lang)}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <AnimatePresence>
              {allDone && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {extractedSummary(lang, docs.length, totalCells)}
                </motion.span>
              )}
            </AnimatePresence>
            {m.phase === 'analyzing' && (
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin text-brass-400" />
                {doneCells}/{totalCells} {pick(STR.extractProgress, lang)}
              </span>
            )}
          </div>
        </header>

        {/* 본문 */}
        {m.phase === 'idle' ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8">
            <button
              data-demo-id="upload-btn"
              onClick={() => m.openExplorer()}
              className="flex w-[70%] max-w-xl flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] px-8 py-14 transition-colors hover:border-brass-400/50 hover:bg-white/[0.04]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brass-500/15 text-brass-300">
                <UploadCloud className="h-8 w-8" />
              </div>
              <span className="text-[15px] font-semibold text-zinc-100">{pick(STR.uploadCta, lang)}</span>
              <span className="text-[12px] text-zinc-500">{pick(STR.uploadHint, lang)}</span>
            </button>
          </div>
        ) : (
          <div className="demo-scroll min-h-0 flex-1 overflow-auto p-5">
            <div className="min-w-fit overflow-hidden rounded-xl border border-white/[0.08]">
              {/* 헤더 행 */}
              <div className="flex border-b border-white/[0.08] bg-white/[0.03]">
                <div className="w-60 shrink-0 border-r border-white/[0.08] px-3.5 py-2.5 text-[11px] font-medium text-zinc-500">
                  {pick(STR.documents, lang)} ({docs.length})
                </div>
                <AnimatePresence>
                  {m.activeColumns.map((colId) => (
                    <motion.div
                      key={colId}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 188 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="shrink-0 overflow-hidden border-r border-white/[0.08] last:border-r-0"
                    >
                      <div className="w-[188px] px-3.5 py-2.5 text-[11px] font-medium text-brass-300">
                        {(() => {
                          const col = COLUMNS.find((c) => c.id === colId);
                          return col ? pick(col.label, lang) : null;
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* 문서 행들 */}
              {docs.map((doc) => {
                const prog = m.uploadProgress[doc.id] ?? 0;
                const uploading = m.phase === 'uploading' && prog < 1;
                return (
                  <div key={doc.id} className="flex border-b border-white/[0.06] last:border-b-0">
                    <div className="flex w-60 shrink-0 items-center gap-2 border-r border-white/[0.08] px-3.5 py-3">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[10.5px] text-zinc-300">{doc.fileName}</p>
                        <p className="text-[9.5px] text-zinc-600">{doc.type}</p>
                      </div>
                    </div>

                    {/* 업로드 중: 진행 바 */}
                    {uploading && (
                      <div className="flex flex-1 items-center gap-2 px-3.5 py-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            className="h-full rounded-full bg-brass-400"
                            animate={{ width: `${prog * 100}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">{Math.round(prog * 100)}%</span>
                      </div>
                    )}

                    {/* 업로드 완료 후: 셀 */}
                    {!uploading &&
                      m.activeColumns.map((colId) => {
                        const status = m.cellStatus[key(doc.id, colId)] ?? 'empty';
                        const cell = CELLS[doc.id]?.[colId];
                        const active = m.popover?.docId === doc.id && m.popover?.colId === colId;
                        return (
                          <div
                            key={colId}
                            className={cn(
                              'w-[188px] shrink-0 border-r border-white/[0.06] px-3.5 py-3 transition-colors last:border-r-0',
                              active && 'bg-brass-400/[0.08]',
                            )}
                          >
                            {status === 'empty' && <span className="text-[11px] text-zinc-700">—</span>}
                            {status === 'extracting' && (
                              <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                                <Loader2 className="h-3 w-3 animate-spin text-brass-400" /> {pick(STR.extracting, lang)}
                              </span>
                            )}
                            {status === 'done' && cell && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap items-center gap-1.5"
                              >
                                <button
                                  data-demo-id={`cell-${doc.id}-${colId}`}
                                  onClick={() => m.openPopover(doc.id, colId)}
                                  className="text-left text-[12px] font-medium text-zinc-100 hover:text-brass-200"
                                >
                                  {pick(cell.value, lang)}
                                </button>
                                <CitationBadge label={`[${cell.citation}]`} onClick={() => m.openPopover(doc.id, colId)} active={active} />
                              </motion.div>
                            )}
                          </div>
                        );
                      })}

                    {/* 분석 대기(열이 아직 없음) */}
                    {!uploading && m.activeColumns.length === 0 && (
                      <div className="flex flex-1 items-center px-4 text-[11px] text-zinc-600">
                        <Loader2 className="mr-2 h-3 w-3 animate-spin text-brass-400" /> {pick(STR.analyzing, lang)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 원문 인용 패널 */}
      <CitationPopover
        citation={
          popCell && popDoc
            ? { snippet: popCell.snippet, source: `${popCell.citation}, ${popDoc.fileName}`, highlightAt: popCell.highlightAt }
            : null
        }
        onClose={() => m.closePopover()}
        title={lang === 'ko' ? '원문 인용' : 'Source citation'}
      />

      {/* 파일 탐색기 오버레이 */}
      <AnimatePresence>{m.explorerOpen && <FileExplorer />}</AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 게이트**

Run: `npm run build`
Expected: 성공. (더 이상 `addColumn`/`nextColumn`/`addColumnLabel`을 Desktop에서 참조하지 않지만, 스토어와 data에 아직 존재하므로 문제없음.)

- [ ] **Step 3: 커밋**

```bash
git add src/demos/aria/aria-matrix/Desktop.tsx
git commit -m "feat(aria-matrix): 데스크탑 업로드 히어로·업로드 진행·탐색기 오버레이"
```

---

### Task 5: `Mobile.tsx` — 업로드 히어로 + 하단 시트 + 아코디언 자동 채움

**Files:**
- Modify: `src/demos/aria/aria-matrix/Mobile.tsx` (전면 재작성)

**Interfaces:**
- Consumes: `useState`, `useEffect`, `useMatrix`, `key`, `DOCUMENTS`, `COLUMNS`, `CELLS`, `STR`, `CitationBadge`, `SnippetText`, `pick`, `useLang`, `cn`.
- Produces: `export function Mobile(_: DemoComponentProps)`. `data-demo-id`: `upload-btn`, `file-<docId>`, `explorer-open-btn`, `cell-<docId>-<colId>` (데스크탑과 동일 — 공용 시나리오).

- [ ] **Step 1: `Mobile.tsx` 전면 재작성**

```tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, FileText, Grid3X3, Loader2, UploadCloud } from 'lucide-react';
import type { DemoComponentProps } from '../../../registry/types';
import { useMatrix, key } from './state';
import { DOCUMENTS, COLUMNS, CELLS, STR } from './data';
import { CitationBadge, SnippetText } from '../../../ui/Citation';
import { pick, useLang } from '../_shared/i18n';
import { cn } from '../../../lib/cn';

/** 모바일: OS 탐색기 대신 하단 시트로 파일 선택, 이후 아코디언 카드 자동 채움 */
export function Mobile(_: DemoComponentProps) {
  const m = useMatrix();
  const lang = useLang();
  const docs = DOCUMENTS.filter((d) => m.uploadedDocs.includes(d.id));
  const [openDoc, setOpenDoc] = useState<string | null>(null);

  // 첫 업로드 문서 자동 펼침
  useEffect(() => {
    if (docs.length && !openDoc) setOpenDoc(docs[0].id);
  }, [docs, openDoc]);

  return (
    <div className="relative flex h-full flex-col bg-[#111014] text-zinc-200">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-4 py-3">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-brass-500/90 text-ink-950">
          <Grid3X3 className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-[13px] font-semibold text-zinc-100">{pick(STR.appTitle, lang)}</h2>
        {m.phase === 'analyzing' && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-brass-400" />}
      </header>

      {m.phase === 'idle' ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <button
            data-demo-id="upload-btn"
            onClick={() => m.openExplorer()}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] px-6 py-12"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brass-500/15 text-brass-300">
              <UploadCloud className="h-7 w-7" />
            </div>
            <span className="text-[14px] font-semibold text-zinc-100">{pick(STR.uploadCta, lang)}</span>
            <span className="text-center text-[11px] text-zinc-500">{pick(STR.uploadHint, lang)}</span>
          </button>
        </div>
      ) : (
        <div className="demo-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {docs.map((doc) => {
            const open = openDoc === doc.id;
            const prog = m.uploadProgress[doc.id] ?? 0;
            const uploading = m.phase === 'uploading' && prog < 1;
            return (
              <div key={doc.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <button
                  onClick={() => setOpenDoc(open ? null : doc.id)}
                  className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
                >
                  <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[10.5px] text-zinc-300">{doc.fileName}</p>
                    <p className="text-[9.5px] text-zinc-600">{doc.type}</p>
                  </div>
                  {uploading ? (
                    <span className="font-mono text-[10px] text-zinc-500">{Math.round(prog * 100)}%</span>
                  ) : (
                    <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
                  )}
                </button>

                {uploading && (
                  <div className="px-3.5 pb-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div className="h-full rounded-full bg-brass-400" animate={{ width: `${prog * 100}%` }} />
                    </div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {!uploading && open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="space-y-2 border-t border-white/[0.06] px-3.5 py-3">
                        {m.activeColumns.length === 0 && (
                          <p className="flex items-center gap-2 text-[11px] text-zinc-600">
                            <Loader2 className="h-3 w-3 animate-spin text-brass-400" /> {pick(STR.analyzing, lang)}
                          </p>
                        )}
                        {m.activeColumns.map((colId) => {
                          const status = m.cellStatus[key(doc.id, colId)] ?? 'empty';
                          const cell = CELLS[doc.id]?.[colId];
                          const popped = m.popover?.docId === doc.id && m.popover?.colId === colId;
                          return (
                            <div key={colId}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10.5px] text-zinc-500">
                                  {(() => {
                                    const col = COLUMNS.find((c) => c.id === colId);
                                    return col ? pick(col.label, lang) : null;
                                  })()}
                                </span>
                                {status === 'extracting' && <Loader2 className="h-3 w-3 animate-spin text-brass-400" />}
                                {status === 'done' && cell && (
                                  <span className="flex items-center gap-1.5 text-right">
                                    <button
                                      data-demo-id={`cell-${doc.id}-${colId}`}
                                      onClick={() => (popped ? m.closePopover() : m.openPopover(doc.id, colId))}
                                      className="text-[12px] font-medium text-zinc-100"
                                    >
                                      {pick(cell.value, lang)}
                                    </button>
                                    <CitationBadge
                                      label={`[${cell.citation}]`}
                                      active={popped}
                                      onClick={() => (popped ? m.closePopover() : m.openPopover(doc.id, colId))}
                                    />
                                  </span>
                                )}
                                {status === 'empty' && <span className="text-[11px] text-zinc-700">—</span>}
                              </div>
                              <AnimatePresence>
                                {popped && cell && (
                                  <motion.p
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-1.5 overflow-hidden rounded-lg bg-black/30 px-3 py-2 font-mono text-[10px] leading-relaxed text-zinc-400"
                                  >
                                    &ldquo;<SnippetText snippet={cell.snippet} />&rdquo;
                                  </motion.p>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 시트 파일 선택 */}
      <AnimatePresence>
        {m.explorerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/10 bg-[#17161a] p-4"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
              <p className="mb-3 text-[13px] font-semibold text-zinc-100">{pick(STR.sheetTitle, lang)}</p>
              <div className="space-y-1.5">
                {DOCUMENTS.map((doc) => {
                  const sel = m.selectedFiles.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      data-demo-id={`file-${doc.id}`}
                      onClick={() => m.toggleFileSelect(doc.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-white/[0.04]"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-300">{doc.fileName}</span>
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-md border',
                          sel ? 'border-brass-400 bg-brass-400 text-ink-950' : 'border-white/20',
                        )}
                      >
                        {sel && <Check className="h-3 w-3" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                data-demo-id="explorer-open-btn"
                onClick={() => m.confirmUpload()}
                disabled={m.selectedFiles.length === 0}
                className={cn(
                  'mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-semibold',
                  m.selectedFiles.length ? 'bg-brass-500 text-ink-950' : 'bg-white/[0.05] text-zinc-600',
                )}
              >
                <UploadCloud className="h-4 w-4" /> {pick(STR.sheetUpload, lang)}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
```

주의: `h-6.5 w-6.5`는 기존 `Mobile.tsx`에서 이미 쓰던 클래스라 프로젝트에서 유효하다(그대로 유지). 체크박스는 `h-5 w-5`를 사용한다.

- [ ] **Step 2: 빌드 게이트**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/demos/aria/aria-matrix/Mobile.tsx
git commit -m "feat(aria-matrix): 모바일 업로드 히어로·하단 시트·아코디언 자동 채움"
```

---

### Task 6: 시나리오 + index — 단일 통합 플로우로 치환

**Files:**
- Modify: `src/demos/aria/aria-matrix/scenario.ts` (전면 재작성)
- Modify: `src/demos/aria/aria-matrix/index.ts` (단일 variant)

**Interfaces:**
- Consumes: `useMatrix` 액션(`openExplorer`, `toggleFileSelect`, `confirmUpload`, `openPopover`, `closePopover`), `getLang`.
- Produces: `export const uploadFlowScenario: Scenario`. `index.ts`의 `variants`는 이 시나리오를 쓰는 단일 항목.
- 참고 — zoom 동작(엔진 `run.ts` 확인 결과): zoom 없는 `cursor`/`click`은 `setSpotlight(null)`로 줌아웃하고, `wait`/`do`는 spotlight를 유지한다. 따라서 `upload-btn`은 `cursor(zoom)`으로 강조 → 이어지는 `click`(zoom 없음)에서 줌아웃되며 탐색기를 연다. 소스 확인 셀 클릭만 `zoom:true`로 강조한다.

- [ ] **Step 1: `scenario.ts` 전면 재작성**

```ts
import type { Scenario } from '../../../engine/types';
import { useMatrix } from './state';
import { getLang } from '../_shared/i18n';

const st = () => useMatrix.getState();
const cap = (ko: string, en: string) => () => (getLang() === 'ko' ? ko : en);

/** 업로드 → 자동 일괄 추출 → 원문 인용 검증 단일 통합 플로우 */
export const uploadFlowScenario: Scenario = {
  id: 'matrix-upload-flow',
  steps: [
    { kind: 'wait', ms: 700 },
    // 1) 업로드 버튼 강조 후 탐색기 열기 (click은 zoom 없음 → 줌아웃하며 오버레이 표시)
    { kind: 'cursor', target: 'upload-btn', zoom: true, caption: cap('문서 업로드', 'Upload documents'), ms: 800 },
    { kind: 'click', target: 'upload-btn', run: () => st().openExplorer() },
    { kind: 'wait', ms: 800 },
    // 2) PDF 5개 다중 선택
    { kind: 'click', target: 'file-propcat', run: () => st().toggleFileSelect('propcat') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-marine', run: () => st().toggleFileSelect('marine') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-casualty', run: () => st().toggleFileSelect('casualty') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-energy', run: () => st().toggleFileSelect('energy') },
    { kind: 'wait', ms: 320 },
    { kind: 'click', target: 'file-aviation', run: () => st().toggleFileSelect('aviation') },
    { kind: 'wait', ms: 500 },
    // 3) 열기 → 업로드 → (자동) 분석
    { kind: 'click', target: 'explorer-open-btn', run: () => st().confirmUpload() },
    { kind: 'waitFor', check: () => st().phase === 'analyzing' || st().phase === 'done', timeoutMs: 6000 },
    { kind: 'wait', ms: 500 },
    { kind: 'waitFor', check: () => st().phase === 'done', timeoutMs: 16000 },
    { kind: 'wait', ms: 700 },
    // 4) 소스 확인 — 셀 클릭 → 원문 인용 패널 (zoom으로 강조)
    { kind: 'click', target: 'cell-propcat-limit', run: () => st().openPopover('propcat', 'limit'), zoom: true, caption: cap('원문 인용 확인', 'Check source citation') },
    { kind: 'wait', ms: 3000 },
    { kind: 'click', target: 'cell-casualty-deductible', run: () => st().openPopover('casualty', 'deductible'), zoom: true, caption: cap('원문 인용 확인', 'Check source citation') },
    { kind: 'wait', ms: 3000 },
    { kind: 'do', run: () => st().closePopover() },
    { kind: 'wait', ms: 1200 },
  ],
};
```

- [ ] **Step 2: `index.ts`를 단일 variant로 재작성**

```ts
import { Grid3X3 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useMatrix } from './state';
import { uploadFlowScenario } from './scenario';
import { POSTS } from './posts';

const ariaMatrix: FeatureDefinition = {
  id: 'aria-matrix',
  title: '문서 비교 Matrix',
  description: '여러 슬립·특약 문서를 업로드하면 핵심 조건을 한 화면 비교표로 자동 추출하고 원문까지 검증합니다.',
  icon: Grid3X3,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useMatrix.getState().reset(),
  posts: POSTS,
  variants: [
    {
      id: 'upload-flow',
      label: '업로드 → 자동 추출 → 원문 검증',
      version: 'v1',
      sellingPoint: 'PDF 올리면 비교표 자동 완성',
      url: 'insightre.ai/matrix',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(70,72,82,0.35), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 95%, rgba(154,108,58,0.2), transparent 60%), linear-gradient(175deg, #0c0c0f 0%, #0a0908 100%)',
        blobs: ['absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brass-500/10 blur-[130px]'],
      },
      scenario: uploadFlowScenario,
    },
  ],
};

export default ariaMatrix;
```

- [ ] **Step 3: 빌드 게이트**

Run: `npm run build`
Expected: 성공. (옛 `batchScenario`/`citedScenario` export가 사라졌고 `index.ts`가 더 이상 참조하지 않는다. `state.ts`의 `addColumn`/`nextColumn`은 이제 미참조이나 스토어 프로퍼티라 빌드는 통과.)

- [ ] **Step 4: 커밋**

```bash
git add src/demos/aria/aria-matrix/scenario.ts src/demos/aria/aria-matrix/index.ts
git commit -m "feat(aria-matrix): 업로드-우선 단일 통합 시나리오·variant로 치환"
```

---

### Task 7: 정리 — 죽은 코드 제거 + 게시 카피 도입부 조정

**Files:**
- Modify: `src/demos/aria/aria-matrix/state.ts` (전이용 액션 제거)
- Modify: `src/demos/aria/aria-matrix/data.ts` (미사용 문자열·함수 제거)
- Modify: `src/demos/aria/aria-matrix/posts.ts` (도입부 소폭 수정)

**Interfaces:**
- Produces: 없음(제거/문구 정리). `MatrixState`에서 `nextColumn`/`addColumn` 삭제, `STR`에서 `addColumn`/`allColumnsAdded`/`emptyHint` 삭제, `data.ts`의 `addColumnLabel` 함수 삭제.

- [ ] **Step 1: `state.ts`에서 전이용 액션 제거**

`MatrixState` 인터페이스에서 다음 두 줄과 주석을 삭제:

```ts
  // --- 전이 유지용 (Task 6까지 옛 시나리오가 참조; Task 7에서 제거) ---
  nextColumn: () => string | null;
  addColumn: () => void;
```

그리고 스토어 구현부에서 `nextColumn: () => {...}`와 `addColumn: () => {...}` 블록(주석 `// --- 전이 유지용 ...` 포함)을 통째로 삭제한다.

- [ ] **Step 2: `data.ts`에서 미사용 문자열·함수 제거**

`STR` 객체에서 다음 키를 삭제한다(이제 어디서도 참조하지 않음):

```ts
  addColumn: { ko: '열 추가', en: 'Add column' },
  allColumnsAdded: { ko: '모든 열 추가됨', en: 'All columns added' },
  emptyHint: { ko: '열을 추가하면 ARIA가 자동 추출합니다', en: 'Add a column and ARIA extracts automatically' },
```

그리고 파일 맨 아래 `addColumnLabel` 함수 전체를 삭제한다:

```ts
/** "열 추가: <항목>" 버튼 라벨 */
export function addColumnLabel(lang: Lang, colLabel: string): string {
  return lang === 'ko' ? `열 추가: ${colLabel}` : `Add column: ${colLabel}`;
}
```

`extractedSummary`는 Desktop이 계속 쓰므로 **유지**한다. `byline`은 미사용이면 유지해도 무방(스토어 아닌 export 프로퍼티).

- [ ] **Step 3: `posts.ts` 도입부 소폭 조정 — 업로드가 첫 장면임을 반영**

`liBodyKo`의 첫 문단을, 업로드로 시작하는 흐름이 드러나게 다듬는다. 다음 문자열을

```ts
const liBodyKo = `슬립 하나를 읽는 건 어렵지 않습니다. 문제는 5개를 나란히 비교할 때죠.
```

아래로 교체:

```ts
const liBodyKo = `슬립 하나를 읽는 건 어렵지 않습니다. 문제는 5개를 나란히 비교할 때죠. 이제 PDF를 올리기만 하면 됩니다.
```

그리고 `liBodyEn`의 첫 줄

```ts
const liBodyEn = `Reading one slip is easy. The pain is comparing five side by side.
```

을 아래로 교체:

```ts
const liBodyEn = `Reading one slip is easy. The pain is comparing five side by side. Now you just upload the PDFs.
```

(유튜브 제목/설명은 이미 "업로드/올리고" 서사를 담고 있어 수정하지 않는다.)

- [ ] **Step 4: 빌드 게이트**

Run: `npm run build`
Expected: 성공. 이제 미사용 로컬/임포트가 없어야 한다. 만약 `data.ts`에서 `Lang` 임포트가 `addColumnLabel` 제거로 미사용이 되면(다른 곳에서 `Lang`을 쓰는지 확인 후) 임포트도 함께 정리한다. — 확인: `extractedSummary(lang: Lang, ...)`가 `Lang`을 계속 쓰므로 임포트는 유지된다.

- [ ] **Step 5: 커밋**

```bash
git add src/demos/aria/aria-matrix/state.ts src/demos/aria/aria-matrix/data.ts src/demos/aria/aria-matrix/posts.ts
git commit -m "chore(aria-matrix): 수동 열추가 죽은 코드 제거·게시 카피 도입부 조정"
```

---

### Task 8: 전체 검증 — 빌드 + 시나리오 육안 확인

**Files:** (변경 없음 — 검증 전용)

- [ ] **Step 1: 클린 빌드**

Run: `npm run build`
Expected: 타입 에러·빌드 에러 0.

- [ ] **Step 2: 개발 서버 실행 후 데스크탑 재생 확인**

Run: `npm run dev` 후 브라우저에서 `aria-matrix` 데모 선택 → 재생(스페이스바).
확인 항목:
- idle 화면(중앙 업로드 드롭존)에서 시작 → 커서가 `문서 업로드`로 줌인
- 탐색기 오버레이 등장(줌아웃 상태, 잘리지 않음) → 5개 PDF 순차 하이라이트 선택 → "열기"
- 5개 문서 행 등장 + 업로드 진행 바 → 자동으로 6개 열 추가되며 셀이 웨이브로 채워짐
- 완료 배지(`5개 문서 · 30개 항목 추출 완료`) 표시
- 셀 2개 클릭 → 우측 원문 인용 패널에 하이라이트된 원문 표시 → 닫힘

- [ ] **Step 3: 모바일 뷰 확인**

데모 재생 중 `d` 키로 모바일 전환(또는 컨트롤 바) → 재생.
확인 항목:
- idle 업로드 히어로 → 하단 시트 등장 → 체크박스 다중 선택 → "업로드"
- 아코디언 카드가 업로드 진행 → 자동 채움 → 셀 인라인 원문 인용 표시

- [ ] **Step 4: 언어·리셋 확인**

- 컨트롤 바에서 언어 ko↔en 전환 시 정지+리셋되어 idle로 돌아가는지
- `r` 키(리셋) 시 `phase='idle'`, 문서/열/셀/진행률/선택이 모두 초기화되는지
- 재생 중 진행 중인 async(업로드/분석)가 리셋 후 남아 잘못 채워지지 않는지(runId 무효화 확인)

- [ ] **Step 5: 최종 상태 확인 커밋(필요 시)**

검증 중 수정이 없으면 커밋 없음. 문구·타이밍 미세 조정이 있으면:

```bash
git add -A && git commit -m "fix(aria-matrix): 재생 타이밍·문구 미세 조정"
```

---

## Self-Review

**1. Spec coverage:**
- 업로드 단계 신설(OS 탐색기 오버레이) → Task 3(FileExplorer) + Task 4(마운트) + Task 5(모바일 시트). ✓
- 업로드 즉시 자동 일괄 분석 → Task 2(`confirmUpload`→`analyzeAll`). ✓
- 단일 통합 variant로 치환 → Task 6(index 단일 variant). ✓
- 소스 확인(원문 인용) → 기존 `CitationPopover` 재사용 + Task 6 시나리오 셀 클릭. ✓
- phase 상태(`idle/picking/uploading/analyzing/done`) → Task 2. ✓
- `uploadedDocs`만 렌더 → Task 4/5. ✓
- 데이터·인용 재사용, 신규 문자열/메타 → Task 1. ✓
- posts 도입부 조정 → Task 7. ✓
- 죽은 코드(수동 열추가) 제거 → Task 7. ✓
- 검증(빌드+육안+리셋) → Task 8. ✓

**2. Placeholder scan:** "TBD"/"TODO"/추상 지시 없음. 모든 코드 스텝에 완전한 코드 포함. ✓

**3. Type consistency:**
- `phase` 값 문자열이 스토어·컴포넌트·시나리오 전반에서 일치(`idle`/`uploading`/`analyzing`/`done`). ✓
- 액션 시그니처: `openExplorer()`, `toggleFileSelect(id)`, `confirmUpload()`, `analyzeAll()`, `openPopover(docId,colId)`, `closePopover()` — Task 2 정의와 Task 3/4/5/6 사용처 일치. ✓
- `data-demo-id` 규약(`upload-btn`/`file-<id>`/`explorer-open-btn`/`cell-<doc>-<col>`)이 데스크탑·모바일·시나리오에서 일치. ✓
- `key(docId,colId)`/`CellStatus` 유지, `CELLS` 셀 참조(`cell-propcat-limit`, `cell-casualty-deductible`)가 `data.ts`에 실재. ✓
