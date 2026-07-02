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
  /** 스포트라이트 마스크로 강조할 대상(data-demo-id) + 캡션. null이면 마스크 없음 */
  focus: { id: string; caption?: string } | null;

  openExplorer: () => void;
  toggleFileSelect: (id: string) => void;
  confirmUpload: () => void;
  analyzeAll: () => void;
  openPopover: (docId: string, colId: string) => void;
  closePopover: () => void;
  setFocus: (id: string | null, caption?: string) => void;
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
  focus: null,

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
    // 모든 문서를 한 번에 유입 + 진행 바는 각자 병렬로 채워진다
    set({
      phase: 'uploading',
      explorerOpen: false,
      uploadedDocs: files,
      uploadProgress: Object.fromEntries(files.map((f) => [f, 0])),
    });
    void (async () => {
      // 각 파일이 서로 다른 속도로 동시에 진행(멈칫하다 확 오르기도)
      const uploadOne = async (docId: string) => {
        let p = 0;
        while (p < 1) {
          await sleep(200 + Math.random() * 320);
          if (id !== runId) return;
          p = Math.min(1, p + 0.12 + Math.random() * 0.22);
          set((s) => ({ uploadProgress: { ...s.uploadProgress, [docId]: p } }));
        }
      };
      await Promise.all(files.map(uploadOne));
      if (id !== runId) return;
      await sleep(300);
      if (id !== runId) return;
      get().analyzeAll();
    })();
  },

  analyzeAll: () => {
    const id = runId; // confirmUpload과 같은 세대(직접 호출 시 현재 세대)
    set({ phase: 'analyzing' });
    void (async () => {
      // "ARIA 분석 중" 비트를 잠깐 보여준 뒤(열 등장 전) 결과가 흐르기 시작
      await sleep(700 + Math.random() * 500);
      if (id !== runId) return;
      // 6개 열을 약간 불규칙한 간격으로 추가(등장 stagger)
      for (const col of COLUMNS) {
        if (id !== runId) return;
        set((s) => ({ activeColumns: [...s.activeColumns, col.id] }));
        await sleep(90 + Math.random() * 110);
      }
      // 문서별로 "분석 중"에서 하나씩 빠져나오며 결과가 채워진다.
      // 각 문서의 시작 시점(stagger) + 셀 채우는 속도를 불규칙하게 → 동시 완료·등속 느낌 제거.
      for (const doc of get().uploadedDocs) {
        // 이 문서가 "분석 중"에 머무는 시간 — 문서마다 다르게(랜덤 stagger)
        await sleep(220 + Math.random() * 500);
        if (id !== runId) return;
        // 이 문서의 셀들을 먼저 "추출 중"으로 (행이 "분석 중"에서 빠져나옴)
        const extracting: Record<string, CellStatus> = {};
        for (const col of COLUMNS) extracting[key(doc, col.id)] = 'extracting';
        set((s) => ({ cellStatus: { ...s.cellStatus, ...extracting } }));
        await sleep(120 + Math.random() * 180);
        if (id !== runId) return;
        // 셀마다 지터 + 가끔 오래 걸리는 필드("추론 중")
        for (const col of COLUMNS) {
          let d = 80 + Math.random() * 160; // 80–240ms 기본 지터
          if (Math.random() < 0.15) d += 180 + Math.random() * 280; // 가끔 조금 더
          await sleep(d);
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
  setFocus: (id, caption) => set({ focus: id ? { id, caption } : null }),

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
      focus: null,
    });
  },
}));
