import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { REPORT_SUMMARY, STR } from './data';

export type Phase = 'idle' | 'analyzing' | 'writing' | 'done';

interface State {
  phase: Phase;
  statusText: string;
  reportText: string; // 스트리밍 누적
  sectionsReady: boolean;
  generate: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let runId = 0;

const base = {
  phase: 'idle' as Phase,
  statusText: '',
  reportText: '',
  sectionsReady: false,
};

export const useTeacherReport = create<State>((set, get) => ({
  ...base,

  generate: () => {
    if (get().phase === 'analyzing' || get().phase === 'writing') return;
    const id = ++runId;
    const lang = getLang();
    set({ phase: 'analyzing', statusText: STR.statusAnalyzing[lang], reportText: '', sectionsReady: false });
    void (async () => {
      await sleep(1200);
      if (id !== runId) return;
      set({ phase: 'writing', statusText: STR.statusWriting[lang] });
      const body = REPORT_SUMMARY[lang];
      let i = 0;
      while (i < body.length) {
        if (id !== runId) return;
        const size = 2 + Math.floor(Math.random() * 3);
        set((s) => ({ reportText: s.reportText + body.slice(i, i + size) }));
        i += size;
        await sleep(20);
      }
      if (id !== runId) return;
      await sleep(300);
      set({ sectionsReady: true });
      await sleep(500);
      if (id !== runId) return;
      set({ phase: 'done' });
    })();
  },

  reset: () => {
    runId++;
    set(base);
  },
}));
