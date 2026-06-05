import { create } from 'zustand';
import { ALERTS, EXPOSURES } from './data';

export type Phase = 'idle' | 'alert' | 'scanning' | 'assessed';

interface WarroomState {
  phase: Phase;
  /** 점등된 노출 특약 id — 순차 채움 */
  revealedIds: number[];
  /** 작성 완료된 알림 초안 수 (스트리밍 연출) */
  draftedCount: number;
  drafting: boolean;
  sent: boolean;
  /** idle → alert: 속보 배너 + 태풍 경로 등장 */
  triggerEvent: () => void;
  /** alert → scanning → assessed: 노출 특약 순차 점등 */
  scanExposures: () => void;
  /** v2 시작 상태 — 애니메이션 없이 분석 완료로 세팅 */
  seedAssessed: () => void;
  /** 알림 초안 순차 작성 */
  draftAlerts: () => void;
  sendAll: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useWarroom = create<WarroomState>((set, get) => ({
  phase: 'idle',
  revealedIds: [],
  draftedCount: 0,
  drafting: false,
  sent: false,

  triggerEvent: () => {
    if (get().phase !== 'idle') return;
    set({ phase: 'alert' });
  },

  scanExposures: () => {
    if (get().phase !== 'alert') return;
    const id = ++runId;
    set({ phase: 'scanning' });
    void (async () => {
      for (const exposure of EXPOSURES) {
        await sleep(400);
        if (id !== runId) return;
        set((s) => ({ revealedIds: [...s.revealedIds, exposure.id] }));
      }
      await sleep(600);
      if (id !== runId) return;
      set({ phase: 'assessed' });
    })();
  },

  seedAssessed: () => {
    runId++;
    set({ phase: 'assessed', revealedIds: EXPOSURES.map((e) => e.id) });
  },

  draftAlerts: () => {
    const { phase, drafting, draftedCount } = get();
    if (phase !== 'assessed' || drafting || draftedCount > 0) return;
    const id = ++runId;
    set({ drafting: true });
    void (async () => {
      for (let i = 1; i <= ALERTS.length; i++) {
        await sleep(700);
        if (id !== runId) return;
        set({ draftedCount: i });
      }
      if (id !== runId) return;
      set({ drafting: false });
    })();
  },

  sendAll: () => {
    if (get().draftedCount === ALERTS.length && !get().sent) set({ sent: true });
  },

  reset: () => {
    runId++;
    set({ phase: 'idle', revealedIds: [], draftedCount: 0, drafting: false, sent: false });
  },
}));
