import { create } from 'zustand';
import { GENERATED_QUIZZES, INITIAL_GOLD, type Lang } from './data';

/** 생성 흐름 단계 */
type Phase =
  /** 기사만 보이고 생성 버튼 대기 */
  | 'idle'
  /** AI 분석 중 (shimmer) */
  | 'analyzing'
  /** 퀴즈 카드가 순차 등장/완료 */
  | 'done';

interface AiDailyQuizState {
  gold: number;
  phase: Phase;
  /** 현재 화면에 노출된 퀴즈 카드 개수 (순차 등장용) */
  visibleCount: number;
  /** 현재 표시 언어 */
  lang: Lang;

  /** 생성 버튼 클릭 → 분석 시작 */
  startGenerate: () => void;
  /** 분석 완료 → done 전환 (카드는 0개부터 시작) */
  finishAnalyze: () => void;
  /** 퀴즈 카드 1개 더 노출 */
  revealNext: () => void;
  /** 표시 언어 전환 */
  setLang: (lang: Lang) => void;
  /** v2용 — 분석 단계 건너뛰고 생성 완료 상태로 세팅 */
  presetDone: () => void;
  reset: () => void;
}

let runId = 0;

export const useAiDailyQuiz = create<AiDailyQuizState>((set, get) => ({
  gold: INITIAL_GOLD,
  phase: 'idle',
  visibleCount: 0,
  lang: 'KO',

  startGenerate: () => {
    if (get().phase !== 'idle') return;
    set({ phase: 'analyzing' });
  },

  finishAnalyze: () => set({ phase: 'done', visibleCount: 0 }),

  revealNext: () =>
    set((s) => ({ visibleCount: Math.min(s.visibleCount + 1, GENERATED_QUIZZES.length) })),

  setLang: (lang) => set({ lang }),

  presetDone: () =>
    set({ phase: 'done', visibleCount: GENERATED_QUIZZES.length, lang: 'KO' }),

  reset: () => {
    runId++;
    set({
      gold: INITIAL_GOLD,
      phase: 'idle',
      visibleCount: 0,
      lang: 'KO',
    });
  },
}));
