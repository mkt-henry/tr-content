import { create } from 'zustand';

interface PipeState {
  /** false면 빈 로딩 상태 → load()로 카운트업/위젯 등장 애니메이션 */
  loaded: boolean;
  /** 강조 중인 소스/단계 id (호버 하이라이트) */
  highlight: string | null;
  /** 벤치마크 카드 강조 여부 (v2 시나리오) */
  benchmark: boolean;
  load: () => void;
  setHighlight: (id: string | null) => void;
  setBenchmark: (v: boolean) => void;
  reset: () => void;
}

export const usePipe = create<PipeState>((set) => ({
  loaded: false,
  highlight: null,
  benchmark: false,
  load: () => set({ loaded: true }),
  setHighlight: (highlight) => set({ highlight }),
  setBenchmark: (benchmark) => set({ benchmark }),
  reset: () => set({ loaded: false, highlight: null, benchmark: false }),
}));
