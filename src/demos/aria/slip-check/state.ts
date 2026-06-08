import { create } from 'zustand';
import { CLAUSES, FIX_CLAUSES } from './data';

export type Phase = 'ready' | 'scanning' | 'done';

interface SlipCheckState {
  phase: Phase;
  /** 판정 칩이 부착된 조항 수 — 스캔 하이라이트는 인덱스 scannedCount에 표시 */
  scannedCount: number;
  /** 수정안이 반영된 조항 key */
  appliedIds: string[];
  applying: boolean;
  reportReady: boolean;
  /** ready → scanning → done: 조항 순차 대조 */
  startScan: () => void;
  /** v2 시작 상태 — 애니메이션 없이 검사 완료로 세팅 */
  seedDone: () => void;
  /** 수정안 순차 반영 */
  applyAll: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useSlipCheck = create<SlipCheckState>((set, get) => ({
  phase: 'ready',
  scannedCount: 0,
  appliedIds: [],
  applying: false,
  reportReady: false,

  startScan: () => {
    if (get().phase !== 'ready') return;
    const id = ++runId;
    set({ phase: 'scanning' });
    void (async () => {
      for (let i = 1; i <= CLAUSES.length; i++) {
        await sleep(700);
        if (id !== runId) return;
        set({ scannedCount: i });
      }
      await sleep(500);
      if (id !== runId) return;
      set({ phase: 'done' });
    })();
  },

  seedDone: () => {
    runId++;
    set({ phase: 'done', scannedCount: CLAUSES.length, appliedIds: [], applying: false, reportReady: false });
  },

  applyAll: () => {
    const { phase, applying, appliedIds } = get();
    if (phase !== 'done' || applying || appliedIds.length > 0) return;
    const id = ++runId;
    set({ applying: true });
    void (async () => {
      for (let i = 0; i < FIX_CLAUSES.length; i++) {
        await sleep(600);
        if (id !== runId) return;
        set((s) => ({ appliedIds: [...s.appliedIds, FIX_CLAUSES[i].key] }));
      }
      await sleep(300);
      if (id !== runId) return;
      set({ applying: false, reportReady: true });
    })();
  },

  reset: () => {
    runId++;
    set({ phase: 'ready', scannedCount: 0, appliedIds: [], applying: false, reportReady: false });
  },
}));
