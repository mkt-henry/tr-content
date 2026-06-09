import { create } from 'zustand';

/** 어떤 variant 콘텐츠(스텝/종목)를 쓸지 — 시나리오가 시작 전에 설정 */
export type ChartMode = 'analysis' | 'setup';

/**
 * AI 차트 드로잉 상태.
 * step: 0=시작 전, 1~5=드로잉 단계 진행 (각 단계가 차트 위 요소 1종 + 코멘트 1줄을 켠다).
 * start()가 analyzing=true로 두고 1.2초 간격으로 step을 5까지 자동 진행시킨다(advance 누적).
 * 시나리오의 wait는 이 타이밍 합(시작 1.2s 후 첫 단계 ~ 5단계까지 약 6.0s + 마무리)에 맞춰 둔다.
 */
interface ChartState {
  /** 0=시작 전, 1~5=드로잉 단계 */
  step: number;
  /** AI 드로잉 진행/완료 여부 (인디케이터) */
  analyzing: boolean;
  /** 모든 단계 완료 */
  done: boolean;
  /** 활성 variant 콘텐츠 */
  mode: ChartMode;
  setMode: (m: ChartMode) => void;
  start: () => void;
  reset: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 재생/리셋 충돌 방지용 런 토큰 */
let runId = 0;

const TOTAL_STEPS = 5;
/** 단계 간 간격 */
const STEP_GAP = 1200;

export const useChart = create<ChartState>((set, get) => ({
  step: 0,
  analyzing: false,
  done: false,
  mode: 'analysis',
  setMode: (mode) => set({ mode }),
  start: () => {
    if (get().analyzing) return;
    const id = ++runId;
    set({ analyzing: true, done: false, step: 0 });

    void (async () => {
      for (let s = 1; s <= TOTAL_STEPS; s++) {
        await sleep(s === 1 ? 700 : STEP_GAP);
        if (id !== runId) return;
        set({ step: s });
      }
      await sleep(600);
      if (id !== runId) return;
      set({ done: true });
    })();
  },
  reset: () => {
    runId++;
    // mode는 시나리오 첫 스텝에서 다시 설정되므로 건드리지 않는다(전환 시 깜빡임 방지)
    set({ step: 0, analyzing: false, done: false });
  },
}));
