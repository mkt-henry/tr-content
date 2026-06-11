import { create } from 'zustand';
import { OTHERS, STUDY_XP, USER, type Member } from './data';

interface State {
  userXp: number;
  earnedXp: number;
  flash: boolean;
  /** 순위 상승 배너 (from→to) */
  rankUp: { from: number; to: number } | null;
  /** Top 3 뱃지 언락 오버레이 */
  badgeOpen: boolean;
  badgeEarned: boolean;

  /** 정렬된 전체 리더보드 (동료 + 나) */
  ranked: () => (Member & { rank: number })[];
  /** 현재 내 순위 */
  myRank: () => number;
  /** 정답 → XP 획득 → 재정렬, 순위 상승·뱃지 트리거 */
  study: () => void;
  closeBadge: () => void;
  reset: () => void;
}

let flashId = 0;

function ranked(userXp: number): (Member & { rank: number })[] {
  const all: Member[] = [...OTHERS, { ...USER, xp: userXp, you: true }];
  return all.sort((a, b) => b.xp - a.xp).map((m, i) => ({ ...m, rank: i + 1 }));
}

const base = {
  userXp: USER.xp,
  earnedXp: 0,
  flash: false,
  rankUp: null as { from: number; to: number } | null,
  badgeOpen: false,
  badgeEarned: false,
};

export const useLeaderboard = create<State>((set, get) => ({
  ...base,

  ranked: () => ranked(get().userXp),
  myRank: () => ranked(get().userXp).find((m) => m.you)!.rank,

  study: () => {
    const prevRank = get().myRank();
    const userXp = get().userXp + STUDY_XP;
    const newRank = ranked(userXp).find((m) => m.you)!.rank;
    const id = ++flashId;
    set({
      userXp,
      earnedXp: get().earnedXp + STUDY_XP,
      flash: true,
      rankUp: newRank < prevRank ? { from: prevRank, to: newRank } : get().rankUp,
    });
    setTimeout(() => {
      if (id === flashId) set({ flash: false });
    }, 500);
    // Top 3 첫 진입 → 뱃지 언락
    if (newRank <= 3 && !get().badgeEarned) {
      setTimeout(() => {
        if (id === flashId) set({ badgeOpen: true, badgeEarned: true });
      }, 700);
    }
  },

  closeBadge: () => set({ badgeOpen: false }),

  reset: () => {
    flashId++;
    set(base);
  },
}));
