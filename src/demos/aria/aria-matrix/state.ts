import { create } from 'zustand';
import { COLUMNS, DOCUMENTS } from './data';

export type CellStatus = 'empty' | 'extracting' | 'done';

interface MatrixState {
  /** 현재 그리드에 추가된 열 id 순서 */
  activeColumns: string[];
  /** `${docId}:${colId}` → 상태 */
  cellStatus: Record<string, CellStatus>;
  popover: { docId: string; colId: string } | null;
  /** 다음에 추가될 열 (열 추가 버튼 라벨용) */
  nextColumn: () => string | null;
  /** 열 추가 + 해당 열 셀을 순차 추출 — 자동/수동 공용 */
  addColumn: () => void;
  openPopover: (docId: string, colId: string) => void;
  closePopover: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** reset 시에만 증가 — 진행 중인 모든 열 추출을 무효화 (열끼리는 동시 진행 가능) */
let resetId = 0;

export const key = (docId: string, colId: string) => `${docId}:${colId}`;

export const useMatrix = create<MatrixState>((set, get) => ({
  activeColumns: [],
  cellStatus: {},
  popover: null,
  nextColumn: () => {
    const active = get().activeColumns;
    return COLUMNS.find((c) => !active.includes(c.id))?.id ?? null;
  },
  addColumn: () => {
    const colId = get().nextColumn();
    if (!colId) return;
    const id = resetId;
    set((s) => ({ activeColumns: [...s.activeColumns, colId] }));
    void (async () => {
      await sleep(350);
      // 셀들을 추출 중 상태로 → 순차 완료
      for (const doc of DOCUMENTS) {
        if (id !== resetId) return;
        set((s) => ({ cellStatus: { ...s.cellStatus, [key(doc.id, colId)]: 'extracting' } }));
      }
      for (const doc of DOCUMENTS) {
        await sleep(420 + Math.random() * 240);
        if (id !== resetId) return;
        set((s) => ({ cellStatus: { ...s.cellStatus, [key(doc.id, colId)]: 'done' } }));
      }
    })();
  },
  openPopover: (docId, colId) => set({ popover: { docId, colId } }),
  closePopover: () => set({ popover: null }),
  reset: () => {
    resetId++;
    set({ activeColumns: [], cellStatus: {}, popover: null });
  },
}));
