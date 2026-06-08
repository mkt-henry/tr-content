import type { L } from '../_shared/i18n';

export interface QuizQuestion {
  question: L;
  options: L<string[]>;
  /** 정답 인덱스 */
  answer: number;
  explanation: L;
}

/** 데모용 경제 퀴즈 — 프로젝트 언어(EN/JA/VI/TH)에 따라 전환 */
export const QUESTIONS: QuizQuestion[] = [
  {
    question: {
      en: 'When interest rates rise, what generally happens to bond prices?',
      ja: '金利が上がると、一般的に債券価格はどうなりますか？',
      vi: 'Khi lãi suất tăng, giá trái phiếu thường thay đổi thế nào?',
      th: 'เมื่ออัตราดอกเบี้ยสูงขึ้น ราคาพันธบัตรมักจะเป็นอย่างไร?',
    },
    options: {
      en: ['They rise', 'They fall', 'No change', 'Unrelated to rates'],
      ja: ['上がる', '下がる', '変わらない', '金利とは無関係'],
      vi: ['Tăng lên', 'Giảm xuống', 'Không đổi', 'Không liên quan đến lãi suất'],
      th: ['สูงขึ้น', 'ลดลง', 'ไม่เปลี่ยนแปลง', 'ไม่เกี่ยวกับดอกเบี้ย'],
    },
    answer: 1,
    explanation: {
      en: 'When rates rise, newly issued bonds offer higher yields, making existing lower-rate bonds less attractive — so their prices fall.',
      ja: '金利が上がると新発債の利回りが高くなり、低い金利で発行された既存債券の魅力が下がるため、価格は下落します。',
      vi: 'Khi lãi suất tăng, trái phiếu mới phát hành có lợi suất cao hơn khiến trái phiếu cũ lãi suất thấp kém hấp dẫn — nên giá của chúng giảm.',
      th: 'เมื่อดอกเบี้ยสูงขึ้น พันธบัตรออกใหม่ให้ผลตอบแทนสูงกว่า ทำให้พันธบัตรเดิมที่ดอกเบี้ยต่ำน่าสนใจน้อยลง ราคาจึงลดลง',
    },
  },
  {
    question: {
      en: 'Which asset is favored as a store of value during inflation?',
      ja: 'インフレ期に価値保存手段として注目される資産は？',
      vi: 'Tài sản nào được ưa chuộng để giữ giá trị trong thời kỳ lạm phát?',
      th: 'สินทรัพย์ใดได้รับความนิยมในการรักษามูลค่าช่วงเงินเฟ้อ?',
    },
    options: {
      en: ['Cash', 'Gold', 'Short-term deposits', 'Gift certificates'],
      ja: ['現金', '金（ゴールド）', '短期預金', '商品券'],
      vi: ['Tiền mặt', 'Vàng', 'Tiền gửi ngắn hạn', 'Phiếu quà tặng'],
      th: ['เงินสด', 'ทองคำ', 'เงินฝากระยะสั้น', 'บัตรกำนัล'],
    },
    answer: 1,
    explanation: {
      en: 'Gold preserves real value when currency loses purchasing power, making it a classic safe-haven asset. Treazer gold points are pegged to the real gold price.',
      ja: '金は通貨の購買力が下がるインフレ期にも実物価値を保つ代表的な安全資産です。Treazerのゴールドポイントも実際の金相場に連動しています。',
      vi: 'Vàng giữ được giá trị thực khi tiền tệ mất sức mua, là tài sản trú ẩn an toàn kinh điển. Điểm vàng của Treazer cũng neo theo giá vàng thực tế.',
      th: 'ทองคำรักษามูลค่าที่แท้จริงเมื่อเงินเสื่อมค่า จึงเป็นสินทรัพย์ปลอดภัยแบบคลาสสิก แต้มทองของ Treazer ก็อิงราคาทองจริงเช่นกัน',
    },
  },
];

/** 홈 화면 경제 퀴즈 미리보기 카드 */
export const PREVIEW_QUESTIONS: L<string>[] = [
  {
    en: 'Does a weaker currency help exporters?',
    ja: '為替が上がると輸出企業に有利？',
    vi: 'Tỷ giá tăng có lợi cho doanh nghiệp xuất khẩu?',
    th: 'ค่าเงินอ่อนช่วยผู้ส่งออกหรือไม่?',
  },
  {
    en: "What's the biggest difference between ETFs and funds?",
    ja: 'ETFと投資信託の最大の違いは？',
    vi: 'Khác biệt lớn nhất giữa ETF và quỹ là gì?',
    th: 'ETF กับกองทุนต่างกันอย่างไรมากที่สุด?',
  },
];

/** 앱 UI 문자열 — '{n}' 플레이스홀더는 fmt()로 치환 */
export const STR = {
  streakTitle: {
    en: '{n} Day Streak',
    ja: '{n}日連続出席',
    vi: 'Chuỗi {n} ngày',
    th: 'เช็คอินต่อเนื่อง {n} วัน',
  },
  checkInDaily: {
    en: 'Check in daily to earn gold',
    ja: '毎日チェックインしてゴールドを獲得',
    vi: 'Điểm danh mỗi ngày để nhận vàng',
    th: 'เช็คอินทุกวันเพื่อรับทอง',
  },
  day: { en: 'Day {n}', ja: '{n}日目', vi: 'Ngày {n}', th: 'วันที่ {n}' },
  todaysQuiz: {
    en: "Today's Check-In Quiz",
    ja: '今日の出席クイズ',
    vi: 'Quiz điểm danh hôm nay',
    th: 'ควิซเช็คอินวันนี้',
  },
  earnMore: {
    en: 'Earn More Gold',
    ja: 'もっとゴールドを稼ぐ',
    vi: 'Kiếm thêm vàng',
    th: 'รับทองเพิ่ม',
  },
  autoCheckIn: {
    en: 'Completing the Daily Quiz automatically checks you in.',
    ja: 'デイリークイズを解くと自動で出席チェックされます。',
    vi: 'Hoàn thành Quiz hằng ngày sẽ tự động điểm danh.',
    th: 'ทำควิซประจำวันเสร็จจะเช็คอินให้อัตโนมัติ',
  },
  econQuiz: { en: 'Economic Quiz', ja: '経済クイズ', vi: 'Quiz kinh tế', th: 'ควิซเศรษฐกิจ' },
  upTo: { en: 'up to {n}', ja: '最大{n}', vi: 'tới {n}', th: 'สูงสุด {n}' },
  quiz: { en: 'Quiz', ja: 'クイズ', vi: 'Quiz', th: 'ควิซ' },
  submit: { en: 'Submit Answer', ja: '回答する', vi: 'Gửi câu trả lời', th: 'ส่งคำตอบ' },
  next: { en: 'Next', ja: '次へ', vi: 'Tiếp theo', th: 'ถัดไป' },
  done: { en: 'Done', ja: '完了', vi: 'Hoàn tất', th: 'เสร็จสิ้น' },
  correctAnswerIs: {
    en: 'The correct answer is {n}.',
    ja: '正解は{n}です。',
    vi: 'Đáp án đúng là {n}.',
    th: 'คำตอบที่ถูกต้องคือ {n}',
  },
  explanation: { en: 'Explanation', ja: '解説', vi: 'Giải thích', th: 'คำอธิบาย' },
} satisfies Record<string, L>;

/** 1문제 정답 보상 */
export const GOLD_PER_CORRECT = 10;

/** 데모 시작 시 보유 골드 */
export const INITIAL_GOLD = 8077;

/** 출석 스트릭 — 데모 시작 시 2일차까지 완료 */
export const INITIAL_STREAK = 2;
