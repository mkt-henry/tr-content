import { create } from 'zustand';

interface ScreenerState {
  /** 현재 선택된 전략 id (null = 미선택 빈 상태) */
  selected: string | null;
  /** 전략 선택 — 결과 테이블이 채워진다 */
  select: (id: string) => void;
  reset: () => void;
}

export const useScreener = create<ScreenerState>((set) => ({
  selected: null,
  select: (id) => set({ selected: id }),
  reset: () => set({ selected: null }),
}));
