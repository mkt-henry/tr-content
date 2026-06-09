import { create } from 'zustand';
import { getLang, type Lang } from '../_shared/i18n';
import { INITIAL_GOLD, SOLVABLE_ARTICLE } from './data';

type Screen = 'feed' | 'article' | 'quiz' | 'result';

interface AnswerState {
  selected: number;   // 선택한 보기 index
  correct: boolean;
}

interface State {
  screen: Screen;
  lang: Lang;
  gold: number;                 // 헤더 보유 골드(적립 시 증가 → CountUp)
  earnedGold: number;           // 이번 세션 획득 합계
  answers: Record<number, AnswerState>; // quizIndex → 결과
  combo: number;                // 현재 연속 정답 수
  comboMode: boolean;           // v2 variant 여부(콤보/스트릭 연출)
  flash: boolean;               // 골드 필 플래시 트리거

  // quiz-runner state
  currentQuiz: number;          // 현재 표시 중인 quiz index (0-based)
  selectedOption: number | null; // 현재 quiz에서 고른 보기, submit 전
  submitted: boolean;           // 현재 quiz가 제출(정답 공개)됐는지 여부

  goToFeed: () => void;
  openArticle: () => void;
  startQuiz: () => void;
  selectOption: (optIndex: number) => void;
  submitAnswer: () => void;
  nextQuiz: () => void;
  finish: () => void;
  setLang: (lang: Lang) => void;
  setComboMode: (on: boolean) => void;
  reset: () => void;
}

let runId = 0;

export const useAiDailyQuiz = create<State>((set, get) => ({
  screen: 'feed',
  lang: getLang(),
  gold: INITIAL_GOLD,
  earnedGold: 0,
  answers: {},
  combo: 0,
  comboMode: false,
  flash: false,

  currentQuiz: 0,
  selectedOption: null,
  submitted: false,

  goToFeed: () => set({ screen: 'feed' }),
  openArticle: () => set({ screen: 'article' }),

  startQuiz: () => set({ screen: 'quiz', currentQuiz: 0, selectedOption: null, submitted: false }),

  selectOption: (optIndex) => {
    if (!get().submitted) {
      set({ selectedOption: optIndex });
    }
  },

  submitAnswer: () => {
    const s = get();
    if (s.selectedOption === null || s.submitted) return;
    const idx = s.currentQuiz;
    const quiz = SOLVABLE_ARTICLE.quizzes[idx];
    const optIndex = s.selectedOption;
    const correct = optIndex === quiz.correctIndex;
    const combo = correct ? s.combo + 1 : 0;
    const mult = s.comboMode && combo >= 2 ? combo : 1;
    const gain = correct ? quiz.reward * mult : 0;
    set({
      submitted: true,
      answers: { ...s.answers, [idx]: { selected: optIndex, correct } },
      combo,
      earnedGold: s.earnedGold + gain,
      gold: s.gold + gain,
      flash: gain > 0,
    });
    if (gain > 0) setTimeout(() => set({ flash: false }), 500);
  },

  nextQuiz: () => {
    const s = get();
    const last = SOLVABLE_ARTICLE.quizzes.length - 1;
    if (s.currentQuiz < last) {
      set({ currentQuiz: s.currentQuiz + 1, selectedOption: null, submitted: false });
    } else {
      set({ screen: 'result' });
    }
  },

  finish: () => set({ screen: 'result' }),
  setLang: (lang) => set({ lang }),
  setComboMode: (on) => set({ comboMode: on }),

  reset: () => {
    runId++;
    set({
      screen: 'feed',
      lang: getLang(),
      gold: INITIAL_GOLD,
      earnedGold: 0,
      answers: {},
      combo: 0,
      flash: false,
      currentQuiz: 0,
      selectedOption: null,
      submitted: false,
      // comboMode는 variant가 scenario 첫 스텝에서 세팅하므로 reset에서 건드리지 않음
    });
  },
}));
