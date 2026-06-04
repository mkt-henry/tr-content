import { create } from 'zustand';

export type Period = 'quarter' | 'year';

interface DashState {
  /** false면 빈 로딩 상태 → load()로 카드/차트 등장 애니메이션 */
  loaded: boolean;
  period: Period;
  /** 호버/포커스 강조 중인 KPI id */
  highlight: string | null;
  /** 선택된 부문 (null = 전체) */
  segment: string | null;
  load: () => void;
  setPeriod: (p: Period) => void;
  setHighlight: (id: string | null) => void;
  setSegment: (id: string | null) => void;
  reset: () => void;
}

export const useDash = create<DashState>((set, get) => ({
  loaded: false,
  period: 'quarter',
  highlight: null,
  segment: null,
  load: () => set({ loaded: true }),
  setPeriod: (period) => set({ period }),
  setHighlight: (highlight) => set({ highlight }),
  setSegment: (id) => set({ segment: get().segment === id ? null : id }),
  reset: () => set({ loaded: false, period: 'quarter', highlight: null, segment: null }),
}));
