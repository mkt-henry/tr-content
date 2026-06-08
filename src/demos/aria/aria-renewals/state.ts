import { create } from 'zustand';
import { getLang } from '../_shared/i18n';
import { BRIEFING } from './data';

export type ItemStatus = 'pending' | 'streaming' | 'done';

interface RenewalsState {
  selectedCardId: string | null;
  briefPhase: 'idle' | 'generating' | 'done';
  itemText: Record<string, string>;
  itemStatus: Record<string, ItemStatus>;
  selectCard: (id: string | null) => void;
  /** 미팅 브리핑 생성 시뮬레이션 — 자동/수동 공용 */
  generateBriefing: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

const initialStatus = () => Object.fromEntries(BRIEFING.map((b) => [b.id, 'pending' as ItemStatus]));

export const useRenewals = create<RenewalsState>((set, get) => ({
  selectedCardId: null,
  briefPhase: 'idle',
  itemText: {},
  itemStatus: initialStatus(),
  selectCard: (selectedCardId) => {
    runId++; // 카드 전환 시 진행 중 브리핑 중단
    set({ selectedCardId, briefPhase: 'idle', itemText: {}, itemStatus: initialStatus() });
  },
  generateBriefing: () => {
    if (get().briefPhase === 'generating') return;
    const id = ++runId;
    void (async () => {
      set({ briefPhase: 'generating', itemText: {}, itemStatus: initialStatus() });
      await sleep(700);
      const lang = getLang();
      for (const item of BRIEFING) {
        if (id !== runId) return;
        set((s) => ({ itemStatus: { ...s.itemStatus, [item.id]: 'streaming' } }));
        let acc = '';
        for (const ch of item.fullText[lang]) {
          if (id !== runId) return;
          acc += ch;
          set((s) => ({ itemText: { ...s.itemText, [item.id]: acc } }));
          await sleep(16);
        }
        if (id !== runId) return;
        set((s) => ({ itemStatus: { ...s.itemStatus, [item.id]: 'done' } }));
        await sleep(300);
      }
      if (id !== runId) return;
      set({ briefPhase: 'done' });
    })();
  },
  reset: () => {
    runId++;
    set({ selectedCardId: null, briefPhase: 'idle', itemText: {}, itemStatus: initialStatus() });
  },
}));
