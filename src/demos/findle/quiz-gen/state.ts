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

  /** 프레임 결정론용 동기 생성 단계 setter — 시나리오가 타이밍을 구동 */
  beginReading: () => void;
  beginGenerating: () => void;
  /** GENERATED 앞에서 index+1개까지 노출(멱등 — 프레임 재생 안전) */
  pushQuestion: (index: number) => void;
  finishGenerate: () => void;

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

  beginReading: () => set({ phase: 'reading', questions: [] }),
  beginGenerating: () => set({ phase: 'generating' }),
  pushQuestion: (index) =>
    set({ questions: GENERATED.slice(0, Math.min(index + 1, GENERATED.length)) }),
  finishGenerate: () => set({ phase: 'done' }),

  reset: () => {
    runId++;
    set(base);
  },
}));
