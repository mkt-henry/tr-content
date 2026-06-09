import { create } from 'zustand';
import { getLang, type Lang } from '../_shared/i18n';
import { INITIAL_GOLD, SOLVABLE_ARTICLE } from './data';

type Screen = 'feed' | 'article' | 'result';

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
  combo: number;                // v2: 현재 연속 정답 수
  comboMode: boolean;           // v2 variant 여부(콤보/스트릭 연출)
  flash: boolean;               // 골드 필 플래시 트리거

  goToFeed: () => void;
  openArticle: () => void;
  selectAnswer: (quizIndex: number, optIndex: number) => void;
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

  goToFeed: () => set({ screen: 'feed' }),
  openArticle: () => set({ screen: 'article' }),

  selectAnswer: (quizIndex, optIndex) => {
    const s = get();
    if (s.answers[quizIndex]) return; // 이미 푼 문제
    const quiz = SOLVABLE_ARTICLE.quizzes[quizIndex];
    const correct = optIndex === quiz.correctIndex;
    const combo = correct ? s.combo + 1 : 0;
    const mult = s.comboMode && combo >= 2 ? combo : 1; // v2: 2연속부터 배수
    const gain = correct ? quiz.reward * mult : 0;
    set({
      answers: { ...s.answers, [quizIndex]: { selected: optIndex, correct } },
      combo,
      earnedGold: s.earnedGold + gain,
      gold: s.gold + gain,
      flash: gain > 0,
    });
    if (gain > 0) setTimeout(() => set({ flash: false }), 500);
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
      // comboMode는 variant가 scenario 첫 스텝에서 세팅하므로 reset에서 건드리지 않음
    });
  },
}));
