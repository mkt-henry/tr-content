export interface QuizQuestion {
  question: string;
  options: string[];
  /** 정답 인덱스 */
  answer: number;
  explanation: string;
}

/** 데모용 경제 퀴즈 — 한국어 더미 데이터 */
export const QUESTIONS: QuizQuestion[] = [
  {
    question: '금리가 오르면 일반적으로 채권 가격은 어떻게 될까요?',
    options: ['오른다', '내린다', '변동 없다', '금리와 무관하다'],
    answer: 1,
    explanation:
      '금리가 오르면 새로 발행되는 채권의 수익률이 높아져, 기존에 낮은 금리로 발행된 채권의 매력이 떨어집니다. 그래서 기존 채권 가격은 내려갑니다.',
  },
  {
    question: '인플레이션 시기에 가치 저장 수단으로 주목받는 자산은?',
    options: ['현금', '금(Gold)', '단기 예금', '상품권'],
    answer: 1,
    explanation:
      '금은 화폐 가치가 떨어지는 인플레이션 시기에 실물 가치를 유지하는 대표적인 안전자산입니다. Treazer의 골드 포인트도 실제 금 시세에 연동됩니다.',
  },
];

/** 1문제 정답 보상 */
export const GOLD_PER_CORRECT = 10;

/** 데모 시작 시 보유 골드 */
export const INITIAL_GOLD = 8077;

/** 출석 스트릭 — 데모 시작 시 2일차까지 완료 */
export const INITIAL_STREAK = 2;
