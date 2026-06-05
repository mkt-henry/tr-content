import { create } from 'zustand';
import { EMAILS, EXTRACTION } from './data';

export type Phase = 'raw' | 'scanning' | 'sorted';

interface InboxState {
  phase: Phase;
  /** 분석 완료된 메일 id — 스캔 애니메이션이 순차로 채움 */
  scannedIds: number[];
  selectedId: number | null;
  /** 정리 후 호버 요약 카드 대상 — 시나리오/마우스 공용 */
  hoveredId: number | null;
  extracting: boolean;
  /** 추출되어 표시할 필드 수 (스트리밍 연출) */
  extractedCount: number;
  pipelineAdded: boolean;
  /** v1 — 메일을 위→아래 순차 스캔 후 우선순위 정렬 */
  startTriage: () => void;
  /** v2 시작 상태 — 애니메이션 없이 분류 완료 상태로 세팅 */
  seedSorted: () => void;
  selectEmail: (id: number | null) => void;
  /** 선택 메일에서 핵심 필드를 하나씩 추출 */
  extract: () => void;
  addToPipeline: () => void;
  setHovered: (id: number | null) => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useInbox = create<InboxState>((set, get) => ({
  phase: 'raw',
  scannedIds: [],
  selectedId: null,
  hoveredId: null,
  extracting: false,
  extractedCount: 0,
  pipelineAdded: false,

  startTriage: () => {
    if (get().phase !== 'raw') return;
    const id = ++runId;
    set({ phase: 'scanning' });
    void (async () => {
      for (const email of EMAILS) {
        await sleep(320);
        if (id !== runId) return;
        set((s) => ({ scannedIds: [...s.scannedIds, email.id] }));
      }
      await sleep(550);
      if (id !== runId) return;
      set({ phase: 'sorted' });
    })();
  },

  seedSorted: () => {
    runId++;
    set({ phase: 'sorted', scannedIds: EMAILS.map((e) => e.id) });
  },

  selectEmail: (selectedId) => set({ selectedId, hoveredId: null, extracting: false, extractedCount: 0, pipelineAdded: false }),

  extract: () => {
    const { selectedId, extracting } = get();
    if (extracting || selectedId !== EXTRACTION.emailId) return;
    const id = ++runId;
    set({ extracting: true, extractedCount: 0 });
    void (async () => {
      for (let i = 1; i <= EXTRACTION.fields.length; i++) {
        await sleep(380);
        if (id !== runId) return;
        set({ extractedCount: i });
      }
      if (id !== runId) return;
      set({ extracting: false });
    })();
  },

  addToPipeline: () => {
    if (get().extractedCount === EXTRACTION.fields.length) set({ pipelineAdded: true });
  },

  setHovered: (hoveredId) => set({ hoveredId }),

  reset: () => {
    runId++;
    set({
      phase: 'raw',
      scannedIds: [],
      selectedId: null,
      hoveredId: null,
      extracting: false,
      extractedCount: 0,
      pipelineAdded: false,
    });
  },
}));
