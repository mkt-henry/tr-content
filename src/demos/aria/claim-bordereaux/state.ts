import { create } from 'zustand';
import { ROWS } from './data';

export type Phase = 'raw' | 'validating' | 'validated' | 'settled';

interface BordereauxState {
  phase: Phase;
  /** 검증 완료된 행 수 — 스캔 하이라이트는 인덱스 scannedRows에 표시 */
  scannedRows: number;
  /** 오류 자동 수정 반영 여부 */
  fixed: boolean;
  settling: boolean;
  /** 정산 청구 금액 산출 완료 시 표시 트리거 */
  settledShown: boolean;
  /** raw → validating → validated: 행 순차 검증 */
  validate: () => void;
  /** v2 시작 상태 — 검증 완료로 세팅 */
  seedValidated: () => void;
  /** 오류 셀 일괄 수정 */
  autoFix: () => void;
  /** 정산 산출 → settled */
  settle: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let runId = 0;

export const useBordereaux = create<BordereauxState>((set, get) => ({
  phase: 'raw',
  scannedRows: 0,
  fixed: false,
  settling: false,
  settledShown: false,

  validate: () => {
    if (get().phase !== 'raw') return;
    const id = ++runId;
    set({ phase: 'validating' });
    void (async () => {
      for (let i = 1; i <= ROWS.length; i++) {
        await sleep(450);
        if (id !== runId) return;
        set({ scannedRows: i });
      }
      await sleep(500);
      if (id !== runId) return;
      set({ phase: 'validated' });
    })();
  },

  seedValidated: () => {
    runId++;
    set({ phase: 'validated', scannedRows: ROWS.length, fixed: false, settling: false, settledShown: false });
  },

  autoFix: () => {
    if (get().phase !== 'validated' || get().fixed) return;
    set({ fixed: true });
  },

  settle: () => {
    const { phase, fixed, settling } = get();
    if (phase !== 'validated' || !fixed || settling) return;
    const id = ++runId;
    set({ settling: true });
    void (async () => {
      await sleep(900);
      if (id !== runId) return;
      set({ phase: 'settled', settling: false, settledShown: true });
    })();
  },

  reset: () => {
    runId++;
    set({ phase: 'raw', scannedRows: 0, fixed: false, settling: false, settledShown: false });
  },
}));
