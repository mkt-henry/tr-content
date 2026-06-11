import type { L } from '../_shared/i18n';

/** 보상 */
export const REWARD_XP = 40;
export const REWARD_FINS = 15;

export const INITIAL = {
  level: 7,
  xp: 660, // 다음 레벨까지 남은 XP 표기용
  xpInLevel: 0.78, // 현재 레벨 진행률
  fins: 850,
  streak: 12,
  rankInClass: 4,
};

/** 오늘의 뉴스 — 퀴즈의 출처 */
export const NEWS = {
  source: { ko: 'Findle 뉴스', en: 'Findle News' } as L,
  time: { ko: '오늘 08:30', en: 'Today 08:30 AM' } as L,
  headline: {
    ko: '한국은행, 기준금리 3.50%로 동결',
    en: 'Bank of Korea holds its policy rate at 3.50%',
  } as L,
  summary: {
    ko: '한국은행 금융통화위원회가 기준금리를 현 수준에서 동결했습니다. 물가 상승세가 둔화되는 가운데 경기와 가계부채를 함께 고려한 결정입니다.',
    en: 'The Bank of Korea kept its base rate unchanged, balancing easing inflation against growth and household debt.',
  } as L,
  topic: { ko: '금리 · 통화정책', en: 'Rates · Monetary policy' } as L,
};

export interface QuizItem {
  id: string;
  question: L;
  options: L<string[]>;
  correctIndex: number;
  explanation: L;
}

/** 기본 2문항 */
export const QUIZZES: QuizItem[] = [
  {
    id: 'q1',
    question: {
      ko: "'기준금리'는 무엇을 뜻할까요?",
      en: "What does the 'base (policy) rate' mean?",
    },
    options: {
      ko: ['중앙은행이 정하는 기준이 되는 금리', '은행 예금에만 붙는 세금', '주식 가격의 평균', '환율을 정하는 비율'],
      en: ["The central bank's benchmark interest rate", 'A tax only on bank deposits', 'The average of stock prices', 'The rate that sets the exchange rate'],
    },
    correctIndex: 0,
    explanation: {
      ko: '기준금리는 중앙은행(한국은행)이 정하는 기준 금리로, 시중의 예금·대출 금리에 두루 영향을 줍니다.',
      en: "The base rate is the central bank's benchmark, which influences deposit and loan rates across the market.",
    },
  },
  {
    id: 'q2',
    question: {
      ko: '기준금리가 오르면 보통 어떤 일이 일어날까요?',
      en: 'When the base rate rises, what usually happens?',
    },
    options: {
      ko: ['대출 이자 부담이 커진다', '대출 이자가 무료가 된다', '물가가 항상 급등한다', '주가가 반드시 오른다'],
      en: ['Borrowing costs go up', 'Loans become free', 'Prices always spike', 'Stocks must go up'],
    },
    correctIndex: 0,
    explanation: {
      ko: '금리가 오르면 돈을 빌리는 비용(대출 이자)이 커져 소비·투자가 둔화되는 경향이 있습니다.',
      en: 'Higher rates raise the cost of borrowing, which tends to cool spending and investment.',
    },
  },
];

/** 오답 시 AI가 약점 개념으로 추가하는 복습 문항 (v2 학습 깊이) */
export const FOLLOW_UP: QuizItem = {
  id: 'fu',
  question: {
    ko: '[복습] 금리가 오르면 예금 이자는 어떻게 될까요?',
    en: '[Review] When rates rise, what happens to deposit interest?',
  },
  options: {
    ko: ['보통 함께 오른다', '항상 0이 된다', '변하지 않는다', '주가와 같아진다'],
    en: ['It usually rises too', 'It always becomes zero', 'It never changes', 'It equals the stock price'],
  },
  correctIndex: 0,
  explanation: {
    ko: '기준금리가 오르면 예금 금리도 함께 오르는 경향이 있어, 저축에 붙는 이자가 늘어납니다.',
    en: 'As the base rate rises, deposit rates tend to rise too, so savers earn more interest.',
  },
};

export const STR = {
  appTitle: { ko: '데일리 퀴즈', en: 'Daily Quiz' },
  greeting: { ko: '안녕하세요,', en: 'Good afternoon,' },
  userName: { ko: 'Alex', en: 'Alex' },
  toLevel: { ko: 'Level {n}까지 {xp} XP', en: '{xp} XP to Level {n}' },
  dayStreak: { ko: '연속 출석', en: 'day streak' },
  finsLabel: { ko: 'fins', en: 'fins' },
  inClass: { ko: '반 순위', en: 'in class' },
  todaysQuizTag: { ko: '오늘의 뉴스 퀴즈', en: "Today's news quiz" },
  startQuiz: { ko: '퀴즈 시작', en: 'Start quiz' },
  newsToLesson: { ko: '오늘의 뉴스가 오늘의 수업', en: "Today's news becomes today's lesson" },
  quizHeader: { ko: '퀴즈', en: 'Quiz' },
  questionLabel: { ko: 'Q.{n}', en: 'Q.{n}' },
  submit: { ko: '제출', en: 'Submit' },
  next: { ko: '다음', en: 'Next' },
  correct: { ko: '정답!', en: 'Correct!' },
  wrong: { ko: '오답', en: 'Wrong' },
  explanationLabel: { ko: '해설', en: 'Explanation' },
  followUpAdded: { ko: 'AI가 약점 개념으로 복습 문항을 추가했어요', en: 'AI added a review question on your weak concept' },
  resultTitle: { ko: '퀴즈 완료!', en: 'Quiz complete!' },
  earnedXp: { ko: '+{n} XP', en: '+{n} XP' },
  earnedFins: { ko: '+{n} Fins', en: '+{n} Fins' },
  scoreLine: { ko: '{c}/{t} 정답', en: '{c}/{t} correct' },
  levelUpNote: { ko: 'Level {n} 진행 중 · 내일도 풀어보세요!', en: 'Level {n} in progress · come back tomorrow!' },
  backHome: { ko: '홈으로', en: 'Back to Home' },
} satisfies Record<string, L>;
