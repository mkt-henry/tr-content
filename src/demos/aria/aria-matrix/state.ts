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
}));
