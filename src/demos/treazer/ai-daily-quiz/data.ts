/** 데모 시작 시 보유 골드 */
export const INITIAL_GOLD = 8077;

/** 오늘의 뉴스 기사 — AI가 퀴즈로 변환할 소스 (한국어 더미 데이터) */
export interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  time: string;
}

export const TODAY_ARTICLE: NewsArticle = {
  headline: '미 연준, 기준금리 동결… 연내 인하 가능성 시사',
  summary:
    '미국 연방준비제도가 기준금리를 5.50%로 동결했습니다. 인플레이션 둔화 신호가 이어지면서 시장은 연내 금리 인하 기대감을 키우고 있습니다.',
  source: 'Treazer News',
  time: '오늘 오전 08:12',
};

/** 지원 언어 칩 */
export type Lang = 'KO' | 'EN' | 'TH' | 'VN';

export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'EN', label: 'EN', flag: '🇬🇧' },
  { id: 'TH', label: 'TH', flag: '🇹🇭' },
  { id: 'VN', label: 'VN', flag: '🇻🇳' },
];

/** AI가 생성한 퀴즈 카드. 텍스트는 나라별 언어로 현지화됨 */
export interface GeneratedQuiz {
  /** 보상 상한 (G) */
  reward: number;
  /** 언어별 문제 텍스트 */
  question: Record<Lang, string>;
  /** 언어별 보기 2개 (참/거짓 등 간단 형식) */
  options: Record<Lang, [string, string]>;
}

/**
 * 오늘 기사에서 AI가 뽑아낸 퀴즈 3개.
 * KO = 콘텐츠 원문(한국어). EN/TH/VN = 실제 현지화 텍스트(진짜 문자·성조 사용).
 */
export const GENERATED_QUIZZES: GeneratedQuiz[] = [
  {
    reward: 50,
    question: {
      KO: '연준이 이번에 기준금리를 어떻게 했나요?',
      EN: 'What did the Fed do with its benchmark rate this time?',
      TH: 'ครั้งนี้เฟดทำอย่างไรกับอัตราดอกเบี้ยนโยบาย?',
      VN: 'Lần này Fed đã làm gì với lãi suất cơ bản?',
    },
    options: {
      KO: ['동결했다', '인상했다'],
      EN: ['Held it steady', 'Raised it'],
      TH: ['คงไว้เท่าเดิม', 'ปรับขึ้น'],
      VN: ['Giữ nguyên', 'Tăng lên'],
    },
  },
  {
    reward: 40,
    question: {
      KO: '기준금리 동결의 배경이 된 신호는 무엇인가요?',
      EN: 'What signal was behind the decision to hold rates?',
      TH: 'สัญญาณใดอยู่เบื้องหลังการตัดสินใจคงอัตราดอกเบี้ย?',
      VN: 'Tín hiệu nào đứng sau quyết định giữ nguyên lãi suất?',
    },
    options: {
      KO: ['인플레이션 둔화', '실업률 급등'],
      EN: ['Cooling inflation', 'Surging unemployment'],
      TH: ['เงินเฟ้อชะลอตัว', 'การว่างงานพุ่งสูง'],
      VN: ['Lạm phát hạ nhiệt', 'Thất nghiệp tăng vọt'],
    },
  },
  {
    reward: 30,
    question: {
      KO: '시장이 연내 기대하는 통화정책 방향은?',
      EN: 'What policy move does the market expect later this year?',
      TH: 'ตลาดคาดหวังการเปลี่ยนนโยบายแบบใดในปีนี้?',
      VN: 'Thị trường kỳ vọng động thái chính sách nào cuối năm nay?',
    },
    options: {
      KO: ['금리 인하', '추가 인상'],
      EN: ['A rate cut', 'Another hike'],
      TH: ['การลดดอกเบี้ย', 'การขึ้นดอกเบี้ยอีกครั้ง'],
      VN: ['Cắt giảm lãi suất', 'Tăng thêm một lần nữa'],
    },
  },
];
