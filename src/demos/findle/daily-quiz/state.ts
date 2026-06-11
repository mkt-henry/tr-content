import { create } from 'zustand';
import { FOLLOW_UP, INITIAL, QUIZZES, REWARD_FINS, REWARD_XP, type QuizItem } from './data';

type Screen = 'home' | 'news' | 'quiz' | 'result';

interface AnswerState {
  selected: number;
  correct: boolean;
}

interface State {
  screen: Screen;
  /** 학습 깊이 모드 — 오답 시 AI 복습 문항 추가 (v2) */
  deepMode: boolean;
  fins: number;
  xp: number; // 이번 세션 누적 획득 XP (헤더 진행률 연출용)
  earnedXp: number;
  earnedFins: number;
  flash: boolean;

  /** 진행 중 문항 목록 (deepMode 오답 시 복습 문항이 append됨) */
  questions: QuizItem[];
  currentQuiz: number;
  selectedOption: number | null;
  submitted: boolean;
  answers: Record<number, AnswerState>;
  /** 직전 제출이 오답이고 복습 문항을 끼워야 하면 true */
  pendingFollowUp: boolean;
  /** 복습 문항이 추가되었음을 알리는 배너 */
  followUpAdded: boolean;

  openNews: () => void;
  startQuiz: () => void;
  selectOption: (i: number) => void;
  submitAnswer: () => void;
  nextQuiz: () => void;
  setDeepMode: (on: boolean) => void;
  reset: () => void;
}

let runId = 0;

const base = {
  screen: 'home' as Screen,
  deepMode: false,
  fins: INITIAL.fins,
  xp: 0,
  earnedXp: 0,
  earnedFins: 0,
  flash: false,
  questions: QUIZZES,
  currentQuiz: 0,
  selectedOption: null as number | null,
  submitted: false,
  answers: {} as Record<number, AnswerState>,
  pendingFollowUp: false,
  followUpAdded: false,
};

export const useDailyQuiz = create<State>((set, get) => ({
  ...base,

  openNews: () => set({ screen: 'news' }),
  startQuiz: () => set({ screen: 'quiz', currentQuiz: 0, selectedOption: null, submitted: false }),

  selectOption: (i) => {
    if (!get().submitted) set({ selectedOption: i });
  },

  submitAnswer: () => {
    const s = get();
    if (s.selectedOption === null || s.submitted) return;
    const quiz = s.questions[s.currentQuiz];
    const correct = s.selectedOption === quiz.correctIndex;
    const gainXp = correct ? REWARD_XP : 0;
    const gainFins = correct ? REWARD_FINS : 0;
    // deepMode + 오답 + 복습문항 아직 미추가 → 복습 문항 예약
    const queueFollowUp = s.deepMode && !correct && !s.questions.some((q) => q.id === FOLLOW_UP.id);
    set({
      submitted: true,
      answers: { ...s.answers, [s.currentQuiz]: { selected: s.selectedOption, correct } },
      xp: s.xp + gainXp,
      earnedXp: s.earnedXp + gainXp,
      fins: s.fins + gainFins,
      earnedFins: s.earnedFins + gainFins,
      flash: gainXp > 0,
      pendingFollowUp: queueFollowUp,
    });
    if (gainXp > 0) {
      const id = ++runId;
      setTimeout(() => {
        if (id === runId) set({ flash: false });
      }, 500);
    }
  },

  nextQuiz: () => {
    const s = get();
    if (s.pendingFollowUp) {
      // 약점 개념 복습 문항을 끼워넣고 그 문항으로 이동
      const questions = [...s.questions, FOLLOW_UP];
      set({
        questions,
        currentQuiz: questions.length - 1,
        selectedOption: null,
        submitted: false,
        pendingFollowUp: false,
        followUpAdded: true,
      });
      return;
    }
    if (s.currentQuiz < s.questions.length - 1) {
      set({ currentQuiz: s.currentQuiz + 1, selectedOption: null, submitted: false });
    } else {
      set({ screen: 'result' });
    }
  },

  setDeepMode: (on) => set({ deepMode: on }),

  reset: () => {
    runId++;
    set({ ...base, questions: QUIZZES });
  },
}));
