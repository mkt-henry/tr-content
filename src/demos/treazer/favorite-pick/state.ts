import { create } from 'zustand';
import { BRACKET, GOLD_REWARD, INITIAL_GOLD, WINNERS } from './data';

type Screen = 'tournament' | 'result';

interface FavoritePickState {
  screen: Screen;
  gold: number;
  /** 골드 획득 직후 필 강조 애니메이션 */
  goldFlash: boolean;
  /** 현재 매치 인덱스 (0~BRACKET.length-1) */
  matchIndex: number;
  /** 이번 매치에서 고른 출전자 id — 선택 카드 확대+체크용 (null=미선택) */
  picked: string | null;
  /** 결과 화면에서 투표 통계 막대를 채울지 여부 */
  statsRevealed: boolean;
  /** 우승 출전자 id */
  championId: string | null;

  /** 카드 한 장 선택 → 확대+체크 → 잠시 후 next()로 진행 (시나리오가 직접 호출) */
  pick: (contestantId: string) => void;
  /** 다음 매치로 슬라이드, 마지막이면 결과 화면 + 골드 보상 */
  next: () => void;
  /** 결과 화면 "다른 유저들의 선택" 막대 채우기 */
  revealStats: () => void;
  /** 특정 매치로 점프 — 시나리오가 라운드를 건너뛸 때 사용 */
  setMatch: (index: number) => void;
  /** 결승까지 한 번에 스킵 (v2 stats 시나리오 도입부) */
  skipToFinal: () => void;
  reset: () => void;
}

let runId = 0;

export const useFavoritePick = create<FavoritePickState>((set, get) => ({
  screen: 'tournament',
  gold: INITIAL_GOLD,
  goldFlash: false,
  matchIndex: 0,
  picked: null,
  statsRevealed: false,
  championId: null,

  pick: (contestantId) => {
    if (get().picked) return;
    set({ picked: contestantId });
  },

  next: () => {
    const { matchIndex } = get();
    if (matchIndex + 1 < BRACKET.length) {
      // 다음 매치로 — picked 초기화하면 screens가 새 카드를 슬라이드 인
      set({ matchIndex: matchIndex + 1, picked: null });
      return;
    }
    // 결승 종료 → 우승자 확정 + 결과 화면 + 골드 보상
    const id = ++runId;
    set((s) => ({
      screen: 'result',
      championId: WINNERS[BRACKET.length - 1],
      gold: s.gold + GOLD_REWARD,
      goldFlash: true,
    }));
    setTimeout(() => {
      if (id === runId) set({ goldFlash: false });
    }, 700);
  },

  revealStats: () => set({ statsRevealed: true }),

  setMatch: (index) => {
    if (index !== get().matchIndex) set({ matchIndex: index, picked: null });
  },

  skipToFinal: () =>
    set({ matchIndex: BRACKET.length - 1, picked: null, screen: 'tournament' }),

  reset: () => {
    runId++;
    set({
      screen: 'tournament',
      gold: INITIAL_GOLD,
      goldFlash: false,
      matchIndex: 0,
      picked: null,
      statsRevealed: false,
      championId: null,
    });
  },
}));
