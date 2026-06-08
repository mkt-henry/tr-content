import type { L, Lang } from '../_shared/i18n';

/** 데모 시작 시 보유 골드 */
export const INITIAL_GOLD = 8077;

/** 오늘의 뉴스 기사 — AI가 퀴즈로 변환할 소스 */
export interface NewsArticle {
  headline: L;
  summary: L;
  source: string;
  time: L;
}

export const TODAY_ARTICLE: NewsArticle = {
  headline: {
    en: 'Fed holds benchmark rate, signals possible cut later this year',
    ja: 'FRB、政策金利を据え置き 年内利下げの可能性を示唆',
    vi: 'Fed giữ nguyên lãi suất, phát tín hiệu có thể cắt giảm cuối năm nay',
    th: 'เฟดคงอัตราดอกเบี้ยนโยบาย ส่งสัญญาณอาจลดดอกเบี้ยภายในปีนี้',
  },
  summary: {
    en: 'The U.S. Federal Reserve held its benchmark rate at 5.50%. With inflation continuing to cool, markets are growing more hopeful about a rate cut before year-end.',
    ja: '米連邦準備制度理事会（FRB）は政策金利を5.50%に据え置きました。インフレ鈍化の兆候が続く中、市場では年内の利下げ期待が高まっています。',
    vi: 'Cục Dự trữ Liên bang Mỹ giữ lãi suất cơ bản ở mức 5,50%. Khi lạm phát tiếp tục hạ nhiệt, thị trường ngày càng kỳ vọng vào một đợt cắt giảm lãi suất trước cuối năm.',
    th: 'ธนาคารกลางสหรัฐฯ (เฟด) คงอัตราดอกเบี้ยนโยบายไว้ที่ 5.50% ขณะที่เงินเฟ้อยังคงชะลอตัวต่อเนื่อง ตลาดจึงคาดหวังมากขึ้นว่าจะมีการลดดอกเบี้ยก่อนสิ้นปี',
  },
  source: 'Treazer News',
  time: {
    en: 'Today 08:12 AM',
    ja: '今日 午前08:12',
    vi: 'Hôm nay 08:12 sáng',
    th: 'วันนี้ 08:12 น.',
  },
};

/** 언어 칩 — 글로벌 i18n과 동일한 4종(EN/JA/VI/TH) */
export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'en', label: 'EN', flag: '🇸🇬' },
  { id: 'ja', label: 'JA', flag: '🇯🇵' },
  { id: 'vi', label: 'VI', flag: '🇻🇳' },
  { id: 'th', label: 'TH', flag: '🇹🇭' },
];

/** AI가 생성한 퀴즈 카드. 텍스트는 나라별 언어로 현지화됨 */
export interface GeneratedQuiz {
  /** 보상 상한 (G) */
  reward: number;
  /** 언어별 문제 텍스트 */
  question: L;
  /** 언어별 보기 2개 (참/거짓 등 간단 형식) */
  options: L<[string, string]>;
}

/**
 * 오늘 기사에서 AI가 뽑아낸 퀴즈 3개.
 * EN/JA/VI/TH 모두 실제 현지화 텍스트(진짜 문자·성조 사용).
 */
export const GENERATED_QUIZZES: GeneratedQuiz[] = [
  {
    reward: 50,
    question: {
      en: 'What did the Fed do with its benchmark rate this time?',
      ja: '今回、FRBは政策金利をどうしましたか？',
      vi: 'Lần này Fed đã làm gì với lãi suất cơ bản?',
      th: 'ครั้งนี้เฟดทำอย่างไรกับอัตราดอกเบี้ยนโยบาย?',
    },
    options: {
      en: ['Held it steady', 'Raised it'],
      ja: ['据え置いた', '引き上げた'],
      vi: ['Giữ nguyên', 'Tăng lên'],
      th: ['คงไว้เท่าเดิม', 'ปรับขึ้น'],
    },
  },
  {
    reward: 40,
    question: {
      en: 'What signal was behind the decision to hold rates?',
      ja: '金利据え置きの決定の背景にあったシグナルは何ですか？',
      vi: 'Tín hiệu nào đứng sau quyết định giữ nguyên lãi suất?',
      th: 'สัญญาณใดอยู่เบื้องหลังการตัดสินใจคงอัตราดอกเบี้ย?',
    },
    options: {
      en: ['Cooling inflation', 'Surging unemployment'],
      ja: ['インフレの鈍化', '失業率の急上昇'],
      vi: ['Lạm phát hạ nhiệt', 'Thất nghiệp tăng vọt'],
      th: ['เงินเฟ้อชะลอตัว', 'การว่างงานพุ่งสูง'],
    },
  },
  {
    reward: 30,
    question: {
      en: 'What policy move does the market expect later this year?',
      ja: '市場が年内に期待している政策の方向性は？',
      vi: 'Thị trường kỳ vọng động thái chính sách nào cuối năm nay?',
      th: 'ตลาดคาดหวังการเปลี่ยนนโยบายแบบใดในปีนี้?',
    },
    options: {
      en: ['A rate cut', 'Another hike'],
      ja: ['利下げ', 'さらなる利上げ'],
      vi: ['Cắt giảm lãi suất', 'Tăng thêm một lần nữa'],
      th: ['การลดดอกเบี้ย', 'การขึ้นดอกเบี้ยอีกครั้ง'],
    },
  },
];

/** 앱 UI 문자열 — '{n}' 플레이스홀더는 fmt()로 치환 */
export const STR = {
  todaysNews: {
    en: "Today's News",
    ja: '今日のニュース',
    vi: 'Tin tức hôm nay',
    th: 'ข่าววันนี้',
  },
  dailyQuizTitle: {
    en: 'Daily Quiz',
    ja: 'デイリークイズ',
    vi: 'Quiz hằng ngày',
    th: 'ควิซประจำวัน',
  },
  dailyQuizSubtitle: {
    en: "AI turns today's news into today's quiz.",
    ja: 'AIが今日のニュースを今日のクイズに変えます。',
    vi: 'AI biến tin tức hôm nay thành quiz hôm nay.',
    th: 'AI เปลี่ยนข่าววันนี้ให้เป็นควิซวันนี้',
  },
  generateQuiz: {
    en: "Generate Today's Quiz",
    ja: '今日のクイズを生成',
    vi: 'Tạo quiz hôm nay',
    th: 'สร้างควิซวันนี้',
  },
  analyzing: {
    en: "AI is turning today's article into a quiz",
    ja: 'AIが今日の記事をクイズに変換中',
    vi: 'AI đang biến bài báo hôm nay thành quiz',
    th: 'AI กำลังแปลงบทความวันนี้เป็นควิซ',
  },
  chooseLanguage: {
    en: 'Choose language',
    ja: '言語を選択',
    vi: 'Chọn ngôn ngữ',
    th: 'เลือกภาษา',
  },
  upTo: {
    en: 'up to {n} G',
    ja: '最大{n}G',
    vi: 'tới {n} G',
    th: 'สูงสุด {n} G',
  },
} satisfies Record<string, L>;
