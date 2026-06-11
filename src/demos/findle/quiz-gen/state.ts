import { create } from 'zustand';
import { GENERATED, type Difficulty, type GenQuestion } from './data';

export type Phase = 'idle' | 'reading' | 'generating' | 'done';

interface State {
  url: string;
  count: number;
  difficulty: Difficulty;
  phase: Phase;
  /** 우측 패널에 순차 등장하는 생성 문항 */
  questions: GenQuestion[];

  setUrl: (v: string) => void;
  setCount: (n: number) => void;
  setDifficulty: (d: Difficulty) => void;
  generate: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let runId = 0;

const base = {
  url: '',
  count: 3,
  difficulty: 'mixed' as Difficulty,
  phase: 'idle' as Phase,
  questions: [] as GenQuestion[],
};

export const useQuizGen = create<State>((set, get) => ({
  ...base,

  setUrl: (url) => set({ url }),
  setCount: (count) => set({ count }),
  setDifficulty: (difficulty) => set({ difficulty }),

  generate: () => {
    if (get().phase === 'reading' || get().phase === 'generating') return;
    if (!get().url.trim()) return;
    const id = ++runId;
    const n = Math.min(get().count, GENERATED.length);
    set({ phase: 'reading', questions: [] });
    void (async () => {
      await sleep(1300); // 기사 분석
      if (id !== runId) return;
      set({ phase: 'generating' });
      for (let i = 0; i < n; i++) {
        await sleep(900);
        if (id !== runId) return;
        set((s) => ({ questions: [...s.questions, GENERATED[i]] }));
      }
      await sleep(400);
      if (id !== runId) return;
      set({ phase: 'done' });
    })();
  },

  reset: () => {
    runId++;
    set(base);
  },
}));
