import { create } from 'zustand';
import { GOLD_PER_CORRECT, INITIAL_GOLD, INITIAL_STREAK, QUESTIONS } from './data';

type Screen = 'home' | 'quiz';

interface QuizGoldState {
  screen: Screen;
  gold: number;
  /** 골드 획득 직후 필 강조 애니메이션 */
  goldFlash: boolean;
  /** 출석 완료된 일수 (1~7) */
  streak: number;
  /** 오늘 출석퀴즈 완료 여부 */
  checkedToday: boolean;
  /** 현재 문제 인덱스 */
  qIndex: number;
  /** 선택한 보기 (제출 전) */
  selected: number | null;
  /** 정답 공개 여부 */
  revealed: boolean;
  /** 이번 세션 누적 획득 골드 */
  earned: number;

  startQuiz: () => void;
  selectOption: (i: number) => void;
  submit: () => void;
  next: () => void;
  reset: () => void;
}

let runId = 0;

export const useQuizGold = create<QuizGoldState>((set, get) => ({
  screen: 'home',
  gold: INITIAL_GOLD,
  goldFlash: false,
  streak: INITIAL_STREAK,
  checkedToday: false,
  qIndex: 0,
  selected: null,
  revealed: false,
  earned: 0,

  startQuiz: () =>
    set({ screen: 'quiz', qIndex: 0, selected: null, revealed: false, earned: 0 }),

  selectOption: (i) => {
    if (get().revealed) return;
    set({ selected: i });
  },

  submit: () => {
    const { selected, revealed, qIndex } = get();
    if (selected === null || revealed) return;
    const correct = selected === QUESTIONS[qIndex].answer;
    const id = ++runId;
    set({ revealed: true });
    if (correct) {
      set((s) => ({
        gold: s.gold + GOLD_PER_CORRECT,
        earned: s.earned + GOLD_PER_CORRECT,
        goldFlash: true,
      }));
      setTimeout(() => {
        if (id === runId) set({ goldFlash: false });
      }, 600);
    }
  },

  next: () => {
    const { qIndex } = get();
    if (qIndex + 1 < QUESTIONS.length) {
      set({ qIndex: qIndex + 1, selected: null, revealed: false });
    } else {
      // 마지막 문제 완료 → 출석 체크 처리 후 홈 복귀
      set((s) => ({
        screen: 'home',
        checkedToday: true,
        streak: Math.min(s.streak + 1, 7),
      }));
    }
  },

  reset: () => {
    runId++;
    set({
      screen: 'home',
      gold: INITIAL_GOLD,
      goldFlash: false,
      streak: INITIAL_STREAK,
      checkedToday: false,
      qIndex: 0,
      selected: null,
      revealed: false,
      earned: 0,
    });
  },
}));
