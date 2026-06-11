import { create } from 'zustand';
import { INITIAL_FINS, type GiftCard } from './data';

interface State {
  fins: number;
  flash: boolean;
  /** 상세 시트에 열린 카드 (null = 닫힘) */
  sheet: GiftCard | null;
  /** 교환 성공 오버레이의 카드 (null = 닫힘) */
  redeemed: GiftCard | null;
  wallet: number;

  openSheet: (c: GiftCard) => void;
  closeSheet: () => void;
  redeem: () => void;
  closeRedeemed: () => void;
  reset: () => void;
}

let flashId = 0;

const base = {
  fins: INITIAL_FINS,
  flash: false,
  sheet: null as GiftCard | null,
  redeemed: null as GiftCard | null,
  wallet: 0,
};

export const useRewards = create<State>((set, get) => ({
  ...base,

  openSheet: (sheet) => set({ sheet }),
  closeSheet: () => set({ sheet: null }),

  redeem: () => {
    const card = get().sheet;
    if (!card || card.fins > get().fins) return;
    const id = ++flashId;
    set((s) => ({ fins: s.fins - card.fins, wallet: s.wallet + 1, sheet: null, redeemed: card, flash: true }));
    setTimeout(() => {
      if (id === flashId) set({ flash: false });
    }, 600);
  },

  closeRedeemed: () => set({ redeemed: null }),

  reset: () => {
    flashId++;
    set(base);
  },
}));
