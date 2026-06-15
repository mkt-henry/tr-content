import { create } from 'zustand';
import { BASE_PANEL, QUOTES, TIGHT_PANEL, type Panel } from './data';

export type Phase = 'raw' | 'normalizing' | 'normalized' | 'optimizing' | 'optimized';
export type Constraint = 'base' | 'tight';

interface PanelState {
  phase: Phase;
  constraint: Constraint;
  /** 정규화 스캔 완료 견적 수 (하이라이트 진행) */
  scannedQuotes: number;
  /** raw → normalizing(순차 스캔) → normalized */
  normalize: () => void;
  /** normalized → optimizing → optimized (현재 제약 패널 표시) */
  optimize: () => void;
  /** optimized(base) → 제약 tight → 재최적화 */
  tighten: () => void;
  /** 현재 제약에 맞는 결과 패널 (optimized일 때만 의미) */
  currentPanel: () => Panel;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let runId = 0;

export const usePanelOptimizer = create<PanelState>((set, get) => ({
  phase: 'raw',
  constraint: 'base',
  scannedQuotes: 0,

  normalize: () => {
    if (get().phase !== 'raw') return;
    const id = ++runId;
    set({ phase: 'normalizing', scannedQuotes: 0 });
    void (async () => {
      for (let i = 1; i <= QUOTES.length; i++) {
        await sleep(420);
        if (id !== runId) return;
        set({ scannedQuotes: i });
      }
      await sleep(450);
      if (id !== runId) return;
      set({ phase: 'normalized' });
    })();
  },

  optimize: () => {
    if (get().phase !== 'normalized') return;
    const id = ++runId;
    set({ phase: 'optimizing' });
    void (async () => {
      await sleep(900);
      if (id !== runId) return;
      set({ phase: 'optimized' });
    })();
  },

  tighten: () => {
    if (get().phase !== 'optimized' || get().constraint !== 'base') return;
    const id = ++runId;
    set({ phase: 'optimizing', constraint: 'tight' });
    void (async () => {
      await sleep(900);
      if (id !== runId) return;
      set({ phase: 'optimized' });
    })();
  },

  currentPanel: () => (get().constraint === 'tight' ? TIGHT_PANEL : BASE_PANEL),

  reset: () => {
    runId++;
    set({ phase: 'raw', constraint: 'base', scannedQuotes: 0 });
  },
}));
