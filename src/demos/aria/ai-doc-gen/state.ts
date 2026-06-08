import { create } from 'zustand';
import { getLang, fmt } from '../_shared/i18n';
import { OUTLINE, SLIDES, STR, STATUS_SLIDES_PROGRESS } from './data';

export type DocType = 'document' | 'presentation';
export type GenPhase = 'idle' | 'outline' | 'slides' | 'done';

interface DocGenState {
  docType: DocType;
  prompt: string;
  templateId: string | null;
  phase: GenPhase;
  outline: string[];
  slideCount: number;
  statusText: string;
  setDocType: (t: DocType) => void;
  setPrompt: (v: string) => void;
  selectTemplate: (id: string | null) => void;
  /** 생성 시뮬레이션 — 자동/수동 양쪽에서 동일하게 호출 */
  generate: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** reset() 시 증가시켜 진행 중인 시뮬레이션을 무효화 */
let runId = 0;

const initial = {
  docType: 'presentation' as DocType,
  prompt: '',
  templateId: null,
  phase: 'idle' as GenPhase,
  outline: [] as string[],
  slideCount: 0,
  statusText: '',
};

export const useDocGen = create<DocGenState>((set, get) => ({
  ...initial,
  setDocType: (docType) => set({ docType }),
  setPrompt: (prompt) => set({ prompt }),
  selectTemplate: (templateId) => set({ templateId }),
  generate: () => {
    if (get().phase !== 'idle' && get().phase !== 'done') return;
    const id = ++runId;
    const lang = getLang();
    void (async () => {
      set({ phase: 'outline', outline: [], slideCount: 0, statusText: STR.statusAnalyzing[lang] });
      await sleep(700);
      for (const line of OUTLINE[lang]) {
        if (id !== runId) return;
        set((s) => ({ outline: [...s.outline, line] }));
        await sleep(240);
      }
      if (id !== runId) return;
      set({ phase: 'slides', statusText: STR.statusSlides[lang] });
      await sleep(500);
      for (let i = 1; i <= SLIDES.length; i++) {
        if (id !== runId) return;
        set({
          slideCount: i,
          statusText: fmt(STATUS_SLIDES_PROGRESS[lang], { n: i, total: SLIDES.length }),
        });
        await sleep(380);
      }
      if (id !== runId) return;
      set({ phase: 'done', statusText: STR.draftDone[lang] });
    })();
  },
  reset: () => {
    runId++;
    set(initial);
  },
}));
