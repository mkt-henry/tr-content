import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { SUMMARY_ITEMS } from './data';

export type CardStatus = 'pending' | 'streaming' | 'done';

interface SummaryState {
  phase: 'idle' | 'generating' | 'done';
  /** 카드별 누적 텍스트 */
  cardText: Record<string, string>;
  cardStatus: Record<string, CardStatus>;
  highlightedClauseId: string | null;
  /** 요약 생성 시뮬레이션 — 자동/수동 공용 */
  generate: () => void;
  highlight: (clauseId: string | null) => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

const initialStatus = () =>
  Object.fromEntries(SUMMARY_ITEMS.map((c) => [c.id, 'pending' as CardStatus]));

export const useSummary = create<SummaryState>((set, get) => ({
  phase: 'idle',
  cardText: {},
  cardStatus: initialStatus(),
  highlightedClauseId: null,
  generate: () => {
    if (get().phase === 'generating') return;
    const id = ++runId;
    void (async () => {
      set({ phase: 'generating', cardText: {}, cardStatus: initialStatus(), highlightedClauseId: null });
      await sleep(600);
      // 생성 시점의 프로젝트 언어로 요약 출력 결정
      const lang = getLang();
      for (const item of SUMMARY_ITEMS) {
        if (id !== runId) return;
        // 카드 스트리밍 시작 + 대응 원문 구절 동기 하이라이트
        set((s) => ({
          cardStatus: { ...s.cardStatus, [item.id]: 'streaming' },
          highlightedClauseId: item.clauseId,
        }));
        let acc = '';
        for (const ch of item.fullText[lang]) {
          if (id !== runId) return;
          acc += ch;
          set((s) => ({ cardText: { ...s.cardText, [item.id]: acc } }));
          await sleep(22);
        }
        if (id !== runId) return;
        set((s) => ({ cardStatus: { ...s.cardStatus, [item.id]: 'done' } }));
        await sleep(250);
      }
      if (id !== runId) return;
      set({ phase: 'done', highlightedClauseId: null });
    })();
  },
  highlight: (highlightedClauseId) => set({ highlightedClauseId }),
  reset: () => {
    runId++;
    set({ phase: 'idle', cardText: {}, cardStatus: initialStatus(), highlightedClauseId: null });
  },
}));
