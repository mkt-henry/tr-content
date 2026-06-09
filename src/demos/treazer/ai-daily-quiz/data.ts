import type { L, Lang } from '../_shared/i18n';

/** 데모 시작 시 보유 골드 */
export const INITIAL_GOLD = 8077;

export interface FeedArticle {
  id: string;
  title: L;
  category: L;
  reward: number;
  thumb: { from: string; to: string; emoji: string };
  solvable?: boolean;
}

export interface Quiz {
  question: L;
  options: L<string[]>; // length 4
  correctIndex: number; // 0~3
  explanation: L;       // 정답 후 1~2줄 해설
  reward: number;
}

export interface SolvableArticle {
  headline: L;
  summary: L;           // 2~3 paragraphs joined with \n\n
  source: string;
  time: L;
  thumb: { from: string; to: string; emoji: string };
  quizzes: Quiz[];      // 3 quizzes
  category: L;
  keyPoints: L<string[]>;  // 5 bullet strings, each starting with an emoji
  relatedNews: { title: L; source: L; thumb: { from: string; to: string; emoji: string } };
}

export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'en', label: 'EN', flag: '🇸🇬' },
  { id: 'ja', label: 'JA', flag: '🇯🇵' },
  { id: 'vi', label: 'VI', flag: '🇻🇳' },
  { id: 'th', label: 'TH', flag: '🇹🇭' },
];

// ---------------------------------------------------------------------------
// Feed Articles
// ---------------------------------------------------------------------------

export const FEED_ARTICLES: FeedArticle[] = [
  {
    // slot 0 — central-bank policy (SOLVABLE). id kept as 'fed-rate' for scenario targeting.
    id: 'fed-rate',
    solvable: true,
    title: {
      en: 'MAS keeps policy unchanged, holds S$NEER appreciation path',
      ja: '日銀、マイナス金利を解除 17年ぶりの利上げに踏み切る',
      vi: 'NHNN giữ nguyên lãi suất điều hành để hỗ trợ tăng trưởng',
      th: 'ธปท. คงอัตราดอกเบี้ยนโยบาย ท่ามกลางท่องเที่ยวฟื้นตัว',
    },
    category: {
      en: 'monetary_policy',
      ja: '金融政策',
      vi: 'chính_sách_tiền_tệ',
      th: 'นโยบายการเงิน',
    },
    reward: 14050,
    thumb: { from: '#1e3a5f', to: '#2563eb', emoji: '🏦' },
  },
  {
    // slot 1 — stock index
    id: 'oil-price',
    title: {
      en: 'STI hits record high, led by the three local banks',
      ja: '日経平均、史上初の4万円台に乗せる',
      vi: 'VN-Index vượt mốc 1.300 điểm nhờ dòng tiền ngoại',
      th: 'SET ปรับขึ้นรับแรงซื้อหุ้นกลุ่มพลังงาน',
    },
    category: {
      en: 'equities',
      ja: '株式市場',
      vi: 'chứng_khoán',
      th: 'ตลาดหุ้น',
    },
    reward: 10270,
    thumb: { from: '#1a1a2e', to: '#7c3aed', emoji: '📈' },
  },
  {
    // slot 2 — currency / FX
    id: 'nikkei-rally',
    title: {
      en: 'Singapore dollar near record high on strong S$NEER',
      ja: '円相場、1ドル160円台で介入警戒強まる',
      vi: 'Tỷ giá USD/VND lập đỉnh, NHNN bán ngoại tệ can thiệp',
      th: 'เงินบาทแข็งค่าตามค่าเงินภูมิภาค',
    },
    category: {
      en: 'fx',
      ja: '為替',
      vi: 'tỷ_giá',
      th: 'อัตราแลกเปลี่ยน',
    },
    reward: 49100,
    thumb: { from: '#0f766e', to: '#14b8a6', emoji: '💱' },
  },
  {
    // slot 3 — flagship company
    id: 'ev-japan',
    title: {
      en: 'DBS posts record quarterly profit on higher net interest income',
      ja: 'トヨタ、過去最高益を更新 円安が追い風に',
      vi: 'VinFast tăng tốc bàn giao xe điện ra thị trường quốc tế',
      th: 'ปตท. ลงทุนพลังงานสะอาดเพิ่ม รับเทรนด์เปลี่ยนผ่านพลังงาน',
    },
    category: {
      en: 'blue_chip',
      ja: '企業決算',
      vi: 'doanh_nghiệp',
      th: 'บริษัทจดทะเบียน',
    },
    reward: 47400,
    thumb: { from: '#1e1b4b', to: '#4f46e5', emoji: '🏢' },
  },
  {
    // slot 4 — property
    id: 'merger-pharma',
    title: {
      en: 'Private home prices rise as cooling measures bite',
      ja: '都心の新築マンション価格、最高値を更新',
      vi: 'Giá bất động sản TP.HCM phục hồi ở phân khúc căn hộ',
      th: 'ตลาดอสังหาฯ กรุงเทพฯ ฟื้นตัวในกลุ่มคอนโด',
    },
    category: {
      en: 'property',
      ja: '不動産',
      vi: 'bất_động_sản',
      th: 'อสังหาริมทรัพย์',
    },
    reward: 26950,
    thumb: { from: '#7c2d12', to: '#ea580c', emoji: '🏠' },
  },
  {
    // slot 5 — tourism / industry
    id: 'us-admissions',
    title: {
      en: 'Changi traffic recovers past pre-pandemic levels',
      ja: '訪日インバウンド消費、過去最高を記録',
      vi: 'Du lịch Việt Nam đón lượng khách quốc tế kỷ lục',
      th: 'นักท่องเที่ยวต่างชาติเที่ยวไทยทะลุเป้า',
    },
    category: {
      en: 'tourism',
      ja: '観光',
      vi: 'du_lịch',
      th: 'การท่องเที่ยว',
    },
    reward: 18600,
    thumb: { from: '#155e75', to: '#0891b2', emoji: '✈️' },
  },
];

// ---------------------------------------------------------------------------
// Solvable Article (central-bank policy — same slot as FEED_ARTICLES[0])
// ---------------------------------------------------------------------------

export const SOLVABLE_ARTICLE: SolvableArticle = {
  headline: FEED_ARTICLES[0].title,
  thumb: FEED_ARTICLES[0].thumb,
  source: 'Treazer News',
  time: {
    en: 'Today 08:12 AM',
    ja: '今日 午前08:12',
    vi: 'Hôm nay 08:12',
    th: 'วันนี้ 08:12 น.',
  },
  summary: {
    en: 'The Monetary Authority of Singapore (MAS) kept monetary policy unchanged at its latest review, maintaining the prevailing rate of appreciation of the Singapore dollar nominal effective exchange rate (S$NEER) policy band. The width of the band and the level at which it is centred were also left unchanged.\n\nUnlike most central banks, MAS does not set an interest rate. Because Singapore is a small, highly open and trade-dependent economy, it manages monetary policy through the EXCHANGE RATE — the S$NEER measured against a trade-weighted basket of currencies — which is a more effective tool for managing imported inflation.\n\nMAS noted that core inflation has continued to ease towards its long-term average, and reaffirmed that the current appreciating policy stance remains appropriate. The authority now reviews policy on a quarterly basis, giving it more frequent opportunities to respond to shifts in the outlook.',

    ja: '日本銀行は2024年3月の金融政策決定会合で、マイナス金利政策の解除を決定し、17年ぶりの利上げに踏み切った。政策金利は0〜0.1%程度に誘導される。これにより、世界で最後まで残っていたマイナス金利政策に終止符が打たれた。\n\n背景には、春闘（春季労使交渉）での力強い賃上げと、2%の物価安定目標の持続的・安定的な達成が見通せる状況になったとの判断がある。植田和男総裁は、賃金と物価の好循環が確認できたと説明した。\n\n日銀は同時に、長短金利操作（イールドカーブ・コントロール、YCC）の枠組みも終了。今後は短期金利の操作を主たる政策手段とする、正常化への一歩を踏み出した。',

    vi: 'Ngân hàng Nhà nước Việt Nam (NHNN) quyết định giữ nguyên các mức lãi suất điều hành trong kỳ điều hành lần này, nhằm tiếp tục hỗ trợ tăng trưởng kinh tế trong bối cảnh lạm phát vẫn được kiểm soát ổn định.\n\nQuyết định được đưa ra khi NHNN cân bằng giữa mục tiêu thúc đẩy tăng trưởng và áp lực lên tỷ giá USD/VND. Việc duy trì mặt bằng lãi suất thấp nhằm giảm chi phí vốn cho doanh nghiệp và người dân.\n\nNHNN cho biết sẽ tiếp tục điều hành linh hoạt, đồng bộ các công cụ chính sách tiền tệ, hướng tới mục tiêu tăng trưởng tín dụng và GDP quanh mức 6–6,5% cho cả năm, đồng thời sẵn sàng can thiệp để ổn định thị trường ngoại hối khi cần thiết.',

    th: 'คณะกรรมการนโยบายการเงิน (กนง.) ของธนาคารแห่งประเทศไทย (ธปท.) มีมติคงอัตราดอกเบี้ยนโยบายไว้ในการประชุมล่าสุด โดยประเมินว่าเศรษฐกิจไทยยังอยู่ในทิศทางฟื้นตัว\n\nธปท. มองว่าการฟื้นตัวของเศรษฐกิจได้แรงหนุนหลักจากภาคการท่องเที่ยวที่กลับมาคึกคัก ขณะที่การส่งออกและการบริโภคในประเทศยังฟื้นตัวอย่างค่อยเป็นค่อยไป\n\nอย่างไรก็ตาม ธปท. ยังคงกังวลต่อระดับหนี้ครัวเรือนที่อยู่ในระดับสูง ส่วนอัตราเงินเฟ้อทั่วไปอยู่ในกรอบเป้าหมาย ทำให้ยังมีพื้นที่ในการดำเนินนโยบายแบบระมัดระวังเพื่อรักษาเสถียรภาพในระยะยาว',
  },
  quizzes: [
    // Q1 — main policy tool / action. correctIndex = 2
    {
      question: {
        en: "What is the MAS's main tool for conducting monetary policy?",
        ja: '日本銀行が2024年3月に解除した政策はどれですか？',
        vi: 'Công cụ điều hành chính của NHNN trong đợt này là gì?',
        th: 'ธปท. ดำเนินการอย่างไรกับอัตราดอกเบี้ยนโยบายในรอบนี้?',
      },
      options: {
        en: [
          'A benchmark interest rate',
          'The reserve requirement ratio',
          'The exchange rate (S$NEER)',
          'Government bond purchases',
        ],
        ja: [
          '量的緩和の全廃',
          '預金準備率の引き上げ',
          'マイナス金利政策の解除',
          '消費税率の変更',
        ],
        vi: [
          'Tăng mạnh lãi suất điều hành',
          'Nâng tỷ lệ dự trữ bắt buộc',
          'Giữ nguyên lãi suất điều hành',
          'Bán toàn bộ dự trữ ngoại hối',
        ],
        th: [
          'ปรับขึ้นอัตราดอกเบี้ย',
          'ปรับลดอัตราดอกเบี้ย',
          'คงอัตราดอกเบี้ยไว้',
          'ยกเลิกกรอบเป้าหมายเงินเฟ้อ',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'MAS manages policy through the exchange rate — the S$NEER policy band — rather than an interest rate, because Singapore is a small, trade-dependent open economy.',
        ja: '日銀は2024年3月にマイナス金利政策を解除し、17年ぶりの利上げに踏み切りました。同時にYCC（イールドカーブ・コントロール）も終了しました。',
        vi: 'NHNN giữ nguyên các mức lãi suất điều hành để hỗ trợ tăng trưởng, trong bối cảnh lạm phát vẫn được kiểm soát.',
        th: 'กนง. มีมติคงอัตราดอกเบี้ยนโยบายไว้ โดยประเมินว่าเศรษฐกิจยังฟื้นตัวต่อเนื่องและเงินเฟ้ออยู่ในกรอบเป้าหมาย',
      },
      reward: 50,
    },
    // Q2 — the driver / why. correctIndex = 0
    {
      question: {
        en: 'Which factor primarily supported the MAS decision?',
        ja: '今回の日銀の決定を主に後押しした要因はどれですか？',
        vi: 'Yếu tố nào chủ yếu hỗ trợ quyết định lần này của NHNN?',
        th: 'ปัจจัยใดที่สนับสนุนการตัดสินใจของ ธปท. เป็นหลัก?',
      },
      options: {
        en: [
          'Core inflation has eased',
          'A sudden surge in unemployment',
          'A sharp contraction in GDP',
          'A domestic banking crisis',
        ],
        ja: [
          '春闘での力強い賃上げと2%物価目標の達成見通し',
          '失業率の急上昇',
          'GDPの急激な落ち込み',
          '国内銀行の経営危機',
        ],
        vi: [
          'Hỗ trợ tăng trưởng kinh tế trong khi lạm phát được kiểm soát',
          'Thất nghiệp tăng đột biến',
          'GDP suy giảm mạnh',
          'Khủng hoảng hệ thống ngân hàng',
        ],
        th: [
          'การฟื้นตัวของเศรษฐกิจจากภาคการท่องเที่ยว',
          'การว่างงานพุ่งสูงขึ้นอย่างฉับพลัน',
          'GDP หดตัวอย่างรุนแรง',
          'วิกฤตธนาคารในประเทศ',
        ],
      },
      correctIndex: 0,
      explanation: {
        en: 'Core inflation has continued to ease towards its long-term average, allowing MAS to keep its appreciating S$NEER stance unchanged.',
        ja: '春闘での力強い賃上げと、2%の物価安定目標の持続的な達成見通しが、マイナス金利解除の決め手となりました。',
        vi: 'NHNN giữ lãi suất nhằm hỗ trợ tăng trưởng kinh tế, trong khi lạm phát vẫn được kiểm soát ổn định.',
        th: 'การฟื้นตัวของเศรษฐกิจได้แรงหนุนหลักจากภาคการท่องเที่ยวที่กลับมาคึกคัก ทำให้ ธปท. คงนโยบายไว้',
      },
      reward: 40,
    },
    // Q3 — a distinctive local fact. correctIndex = 1
    {
      question: {
        en: 'Why does Singapore manage policy via the exchange rate?',
        ja: '今回の日銀の利上げは何年ぶりのものですか？',
        vi: 'NHNN đặt mục tiêu tăng trưởng GDP cả năm quanh mức nào?',
        th: 'แรงขับเคลื่อนหลักของการฟื้นตัวทางเศรษฐกิจไทยคืออะไร?',
      },
      options: {
        en: [
          'Because it has very low public debt',
          'Because it is a small, trade-dependent open economy',
          'Because the central bank sets fiscal policy',
          'Because it has a floating free-market currency',
        ],
        ja: [
          '約5年ぶり',
          '17年ぶり',
          '約30年ぶり',
          '初めての利上げ',
        ],
        vi: [
          'Khoảng 3–3,5%',
          'Khoảng 6–6,5%',
          'Khoảng 9–10%',
          'Khoảng 12–13%',
        ],
        th: [
          'ภาคการส่งออก',
          'ภาคการท่องเที่ยว',
          'ภาคเกษตรกรรม',
          'การลงทุนภาครัฐ',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'As a small, highly open and trade-dependent economy, the exchange rate is a more effective tool than interest rates for managing imported inflation.',
        ja: '今回の利上げは2007年以来、実に17年ぶりとなり、世界で最後のマイナス金利政策にも終止符が打たれました。',
        vi: 'NHNN hướng tới mục tiêu tăng trưởng tín dụng và GDP cả năm quanh mức 6–6,5%.',
        th: 'ธปท. ประเมินว่าการฟื้นตัวของเศรษฐกิจได้แรงหนุนหลักจากภาคการท่องเที่ยวที่กลับมาคึกคัก',
      },
      reward: 30,
    },
  ],
  category: {
    en: 'monetary_policy',
    ja: '日本銀行',
    vi: 'ngân_hàng_nhà_nước',
    th: 'ธนาคารแห่งประเทศไทย',
  },
  keyPoints: {
    en: [
      '🏦 MAS kept policy unchanged, holding the S$NEER appreciation path',
      '💱 Policy is run through the exchange rate (S$NEER), not an interest rate',
      '🌏 Singapore is a small, highly open, trade-dependent economy',
      '📉 Core inflation has continued to ease towards its long-term average',
      '🗓️ MAS now reviews monetary policy on a quarterly basis',
    ],
    ja: [
      '🏦 日銀がマイナス金利政策を解除（2024年3月）',
      '⏳ 17年ぶりの利上げで、世界最後のマイナス金利が終了',
      '💪 春闘での力強い賃上げが決定の背景',
      '🎯 2%物価目標の持続的な達成見通しを確認',
      '📐 イールドカーブ・コントロール（YCC）も終了',
    ],
    vi: [
      '🏦 NHNN giữ nguyên các mức lãi suất điều hành',
      '📈 Mục tiêu chính là hỗ trợ tăng trưởng kinh tế',
      '🧮 Lạm phát vẫn đang được kiểm soát ổn định',
      '💱 Cân bằng với áp lực lên tỷ giá USD/VND',
      '🎯 Hướng tới tăng trưởng tín dụng và GDP quanh mức 6–6,5%',
    ],
    th: [
      '🏦 กนง. มีมติคงอัตราดอกเบี้ยนโยบาย',
      '✈️ การฟื้นตัวได้แรงหนุนหลักจากภาคการท่องเที่ยว',
      '⚠️ ยังกังวลระดับหนี้ครัวเรือนที่อยู่ในระดับสูง',
      '🧮 อัตราเงินเฟ้อทั่วไปอยู่ในกรอบเป้าหมาย',
      '💱 ติดตามทิศทางค่าเงินบาทอย่างใกล้ชิด',
    ],
  },
  relatedNews: {
    title: {
      en: 'Singapore government bond yields slip as SGD holds firm',
      ja: '円安進行で国債利回り上昇、日銀の追加利上げ観測も',
      vi: 'Lợi suất trái phiếu chính phủ giảm khi tỷ giá USD/VND hạ nhiệt',
      th: 'อัตราผลตอบแทนพันธบัตรไทยทรงตัว ค่าเงินบาทเคลื่อนไหวในกรอบ',
    },
    source: {
      en: 'Treazer Markets',
      ja: 'Treazer マーケット',
      vi: 'Treazer Thị trường',
      th: 'Treazer มาร์เก็ต',
    },
    thumb: { from: '#1e3a5f', to: '#2563eb', emoji: '🏦' },
  },
};

// ---------------------------------------------------------------------------
// UI Strings
// ---------------------------------------------------------------------------

export const STR = {
  dailyQuizTitle: {
    en: 'AI Daily Quiz',
    ja: 'AIデイリークイズ',
    vi: 'AI Quiz Hằng Ngày',
    th: 'AI ควิซประจำวัน',
  },
  feedSubtitle: {
    en: "Tap an article to earn G with today's AI quiz",
    ja: '記事をタップして今日のAIクイズでGを獲得しよう',
    vi: 'Nhấn vào bài viết để kiếm G với quiz AI hôm nay',
    th: 'แตะบทความเพื่อรับ G จากควิซ AI วันนี้',
  },
  upTo: {
    en: 'up to {n} G',
    ja: '最大{n}G',
    vi: 'tới {n} G',
    th: 'สูงสุด {n} G',
  },
  aiQuizHeader: {
    en: 'AI Quiz',
    ja: 'AIクイズ',
    vi: 'Quiz AI',
    th: 'ควิซ AI',
  },
  correct: {
    en: 'Correct!',
    ja: '正解！',
    vi: 'Đúng rồi!',
    th: 'ถูกต้อง!',
  },
  wrong: {
    en: 'Wrong!',
    ja: '不正解！',
    vi: 'Sai rồi!',
    th: 'ผิด!',
  },
  earned: {
    en: '+{n} G',
    ja: '+{n}G',
    vi: '+{n} G',
    th: '+{n} G',
  },
  combo: {
    en: 'Combo x{n}!',
    ja: 'コンボ x{n}！',
    vi: 'Combo x{n}!',
    th: 'คอมโบ x{n}!',
  },
  resultTitle: {
    en: 'Quiz Complete!',
    ja: 'クイズ完了！',
    vi: 'Hoàn thành Quiz!',
    th: 'ควิซเสร็จสิ้น!',
  },
  resultGold: {
    en: 'You earned {n} G',
    ja: '{n}G を獲得しました',
    vi: 'Bạn đã kiếm được {n} G',
    th: 'คุณได้รับ {n} G',
  },
  resultScore: {
    en: '{c}/{t} correct',
    ja: '{c}/{t} 問正解',
    vi: '{c}/{t} câu đúng',
    th: 'ถูก {c}/{t} ข้อ',
  },
  streakTitle: {
    en: '{n}-day streak 🔥',
    ja: '{n}日連続達成 🔥',
    vi: '{n} ngày liên tiếp 🔥',
    th: 'เล่นต่อเนื่อง {n} วัน 🔥',
  },
  tomorrow: {
    en: 'Come back tomorrow for more!',
    ja: '明日もお楽しみに！',
    vi: 'Quay lại vào ngày mai nhé!',
    th: 'กลับมาใหม่พรุ่งนี้นะ!',
  },
  playAgain: {
    en: 'Play Again',
    ja: 'もう一度プレイ',
    vi: 'Chơi lại',
    th: 'เล่นอีกครั้ง',
  },
  backToFeed: {
    en: 'Back to Feed',
    ja: 'フィードに戻る',
    vi: 'Về trang tin',
    th: 'กลับไปที่ฟีด',
  },
  newsSummary: {
    en: 'News Summary',
    ja: 'ニュース要約',
    vi: 'Tóm tắt tin tức',
    th: 'สรุปข่าว',
  },
  keyPoints: {
    en: 'Key Points 💡',
    ja: 'キーポイント 💡',
    vi: 'Điểm chính 💡',
    th: 'ประเด็นสำคัญ 💡',
  },
  relatedNews: {
    en: 'Related News',
    ja: '関連ニュース',
    vi: 'Tin liên quan',
    th: 'ข่าวที่เกี่ยวข้อง',
  },
  letsStart: {
    en: "Let's Start",
    ja: 'スタート',
    vi: 'Bắt đầu',
    th: 'เริ่มเลย',
  },
  quizHeader: {
    en: 'Quiz',
    ja: 'クイズ',
    vi: 'Quiz',
    th: 'ควิซ',
  },
  questionLabel: {
    en: 'Q.{n}',
    ja: 'Q.{n}',
    vi: 'Q.{n}',
    th: 'Q.{n}',
  },
  submitAnswer: {
    en: 'Submit Answer',
    ja: '回答する',
    vi: 'Trả lời',
    th: 'ส่งคำตอบ',
  },
  next: {
    en: 'Next',
    ja: '次へ',
    vi: 'Tiếp theo',
    th: 'ถัดไป',
  },
  correctAnswerIs: {
    en: 'The correct answer is {n}.',
    ja: '正解は {n} です。',
    vi: 'Đáp án đúng là {n}.',
    th: 'คำตอบที่ถูกคือ {n}',
  },
  explanationLabel: {
    en: 'Explanation',
    ja: '解説',
    vi: 'Giải thích',
    th: 'คำอธิบาย',
  },
  myGoldValue: {
    en: 'My Gold Value',
    ja: '保有ゴールド評価額',
    vi: 'Giá trị vàng của tôi',
    th: 'มูลค่าทองของฉัน',
  },
  sinceCollecting: {
    en: 'Since you started collecting',
    ja: '貯め始めてから',
    vi: 'Kể từ khi bắt đầu tích lũy',
    th: 'นับตั้งแต่เริ่มสะสม',
  },
  goldPriceLabel: {
    en: 'Gold price',
    ja: 'ゴールド価格',
    vi: 'Giá vàng',
    th: 'ราคาทอง',
  },
  perGram: { en: '/g', ja: '/g', vi: '/g', th: '/g' },
  todayChange: { en: 'today', ja: '本日', vi: 'hôm nay', th: 'วันนี้' },
  goldPeggedNote: {
    en: 'Your GOLD is pegged to the real gold price.',
    ja: 'あなたのGOLDは実際の金相場に連動します。',
    vi: 'GOLD của bạn được neo theo giá vàng thực tế.',
    th: 'GOLD ของคุณอิงราคาทองจริง',
  },
} satisfies Record<string, L>;

// ---------------------------------------------------------------------------
// Gold pricing (mirrors gold-store values; GOLD rewards are pegged to real gold)
// ---------------------------------------------------------------------------

export interface Currency {
  symbol: string;
  perGold: number;
  locale: string;
  fractionDigits: number;
}

export const CURRENCY: L<Currency> = {
  en: { symbol: 'S$', perGold: 0.000037, locale: 'en-US', fractionDigits: 2 },
  ja: { symbol: '¥', perGold: 0.583, locale: 'ja-JP', fractionDigits: 0 },
  vi: { symbol: '₫', perGold: 1535 / 8077, locale: 'vi-VN', fractionDigits: 0 },
  th: { symbol: '฿', perGold: 0.00723, locale: 'th-TH', fractionDigits: 0 },
};

export const GOLD_GRAMS_PER_UNIT = 0.00040385 / 8077;
export const INITIAL_GOLD_PRICE = 152_400;
export const INITIAL_AVG_COST = 135_600; // ~+12.4% since collecting
export const GOLD_DAILY_CHANGE = 0.0072; // today's spot move (+0.72%)

export function spotPerGram(c: Currency): number {
  return c.perGold / GOLD_GRAMS_PER_UNIT;
}

export function money(amount: number, c: Currency): string {
  return `${c.symbol}${amount.toLocaleString(c.locale, {
    minimumFractionDigits: c.fractionDigits,
    maximumFractionDigits: c.fractionDigits,
  })}`;
}

export interface Valuation { grams: number; spot: number; value: number; ret: number; profit: number; }

export function valuation(gold: number, goldPrice: number, avgCost: number, c: Currency): Valuation {
  const grams = gold * GOLD_GRAMS_PER_UNIT;
  const ratio = goldPrice / INITIAL_GOLD_PRICE;
  const spot = spotPerGram(c) * ratio;
  const value = grams * spot;
  const ret = goldPrice / avgCost - 1;
  const cost = value / (1 + ret);
  const profit = value - cost;
  return { grams, spot, value, ret, profit };
}
