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
    id: 'fed-rate',
    solvable: true,
    title: {
      en: 'Fed holds benchmark rate, signals possible cut later this year',
      ja: 'FRB、政策金利を据え置き 年内利下げの可能性を示唆',
      vi: 'Fed giữ nguyên lãi suất, phát tín hiệu có thể cắt giảm cuối năm nay',
      th: 'เฟดคงอัตราดอกเบี้ยนโยบาย ส่งสัญญาณอาจลดดอกเบี้ยภายในปีนี้',
    },
    category: {
      en: 'Monetary Policy',
      ja: '金融政策',
      vi: 'Chính sách tiền tệ',
      th: 'นโยบายการเงิน',
    },
    reward: 14050,
    thumb: { from: '#1e3a5f', to: '#2563eb', emoji: '📈' },
  },
  {
    id: 'oil-price',
    title: {
      en: 'Brent crude drops below $80 as OPEC+ hints at output increase',
      ja: 'OPEC+が増産示唆、ブレント原油が80ドルを割り込む',
      vi: 'Dầu Brent giảm xuống dưới 80 USD khi OPEC+ gợi ý tăng sản lượng',
      th: 'น้ำมันเบรนต์ร่วงต่ำกว่า 80 ดอลลาร์ หลัง OPEC+ ส่งสัญญาณเพิ่มกำลังผลิต',
    },
    category: {
      en: 'Commodities',
      ja: 'コモディティ',
      vi: 'Hàng hóa',
      th: 'สินค้าโภคภัณฑ์',
    },
    reward: 10270,
    thumb: { from: '#422006', to: '#ea580c', emoji: '🛢️' },
  },
  {
    id: 'nikkei-rally',
    title: {
      en: 'Nikkei surges 2.4% as yen weakens to 155 per dollar',
      ja: '円安で155円台、日経平均が2.4%急騰',
      vi: 'Nikkei tăng vọt 2.4% khi đồng yên yếu xuống mức 155 yen/đô la',
      th: 'นิกเคอิพุ่งขึ้น 2.4% ขณะเงินเยนอ่อนค่าแตะ 155 เยนต่อดอลลาร์',
    },
    category: {
      en: 'Stock Markets',
      ja: '株式市場',
      vi: 'Thị trường chứng khoán',
      th: 'ตลาดหุ้น',
    },
    reward: 49100,
    thumb: { from: '#1a1a2e', to: '#7c3aed', emoji: '💹' },
  },
  {
    id: 'ev-japan',
    title: {
      en: "BYD launches sub-$25k EV in Japan, targeting Toyota's home turf",
      ja: 'BYD、2万5千ドル以下のEVで日本市場参入 トヨタのホームを狙う',
      vi: 'BYD ra mắt xe điện dưới 25.000 USD tại Nhật Bản, nhắm vào sân nhà của Toyota',
      th: 'BYD เปิดตัว EV ราคาต่ำกว่า 25,000 ดอลลาร์ในญี่ปุ่น บุกถิ่นบ้านเกิดของโตโยตา',
    },
    category: {
      en: 'Auto Industry',
      ja: '自動車',
      vi: 'Ngành ô tô',
      th: 'อุตสาหกรรมยานยนต์',
    },
    reward: 47400,
    thumb: { from: '#064e3b', to: '#10b981', emoji: '🚗' },
  },
  {
    id: 'merger-pharma',
    title: {
      en: 'AstraZeneca acquires rare-disease biotech in $8.7bn deal',
      ja: 'アストラゼネカ、難病バイオ企業を87億ドルで買収',
      vi: 'AstraZeneca mua lại công ty công nghệ sinh học bệnh hiếm với giá 8.7 tỷ USD',
      th: 'AstraZeneca เข้าซื้อกิจการบริษัทไบโอเทคโรคหายากมูลค่า 8.7 พันล้านดอลลาร์',
    },
    category: {
      en: 'M&A',
      ja: 'M&A',
      vi: 'Mua bán & Sáp nhập',
      th: 'การควบรวมกิจการ',
    },
    reward: 26950,
    thumb: { from: '#1e1b4b', to: '#4f46e5', emoji: '🏭' },
  },
  {
    id: 'us-admissions',
    title: {
      en: 'Harvard acceptance rate hits all-time low of 3.6% for Class of 2029',
      ja: 'ハーバード大の合格率、2029年入学クラスで過去最低の3.6%に',
      vi: 'Tỷ lệ trúng tuyển Harvard chạm đáy lịch sử 3.6% cho khóa 2029',
      th: 'อัตรารับนักศึกษาฮาร์วาร์ดต่ำสุดเป็นประวัติการณ์ที่ 3.6% สำหรับรุ่นปี 2029',
    },
    category: {
      en: 'Education',
      ja: '教育',
      vi: 'Giáo dục',
      th: 'การศึกษา',
    },
    reward: 18600,
    thumb: { from: '#7f1d1d', to: '#dc2626', emoji: '🎓' },
  },
];

// ---------------------------------------------------------------------------
// Solvable Article (Fed rate — same topic as FEED_ARTICLES[0])
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
    en: 'The U.S. Federal Reserve voted unanimously to hold its benchmark federal funds rate at 5.25–5.50% at its June meeting, marking the seventh consecutive pause since the last hike in July 2023. Chair Jerome Powell cited persistent but easing price pressures and a resilient labor market as the primary reasons for the hold.\n\nRecent data shows the Consumer Price Index (CPI) rising just 3.1% year-on-year, down from a peak of 9.1% in mid-2022. Core PCE — the Fed\'s preferred inflation gauge — has also slowed meaningfully, giving policymakers room to observe conditions before moving.\n\nMarket participants are now pricing in at least one 25-basis-point cut by December, with futures implying a roughly 70% probability of an easing move at the September meeting. Analysts caution that any upside surprise in employment or inflation data could delay the pivot.',

    ja: '米連邦準備制度理事会（FRB）は6月の会合で政策金利（フェデラルファンド金利）を5.25–5.50%に据え置くことを全会一致で決定した。これは2023年7月の最後の利上げ以来、7回連続の据え置きとなる。ジェローム・パウエル議長は、価格上昇圧力が根強いながらも和らいでいること、そして労働市場の堅調さが主な理由だと述べた。\n\n最近のデータによると、消費者物価指数（CPI）は前年比3.1%上昇にとどまり、2022年半ばの9.1%のピークから大幅に低下した。FRBが重視するインフレ指標であるコアPCEデフレーターも明確に鈍化しており、政策当局者が動く前に状況を見極める余地が生まれている。\n\n市場参加者は12月までに少なくとも25ベーシスポイントの利下げを織り込んでおり、先物市場は9月会合での緩和措置の確率を約70%と示している。アナリストたちは、雇用や物価データが上振れした場合、政策転換が遅れる可能性があると警告している。',

    vi: 'Cục Dự trữ Liên bang Mỹ (Fed) đã nhất trí bỏ phiếu giữ nguyên lãi suất quỹ liên bang mục tiêu ở mức 5,25–5,50% trong cuộc họp tháng 6, đánh dấu lần dừng thứ bảy liên tiếp kể từ đợt tăng lãi suất cuối cùng vào tháng 7 năm 2023. Chủ tịch Jerome Powell cho biết áp lực giá dai dẳng nhưng đang giảm dần cùng với thị trường lao động vẫn ổn định là lý do chính để giữ nguyên.\n\nDữ liệu gần đây cho thấy Chỉ số Giá tiêu dùng (CPI) chỉ tăng 3,1% so với cùng kỳ năm ngoái, giảm mạnh so với mức đỉnh 9,1% vào giữa năm 2022. Chỉ số PCE lõi — thước đo lạm phát ưa thích của Fed — cũng đã chậm lại đáng kể, tạo không gian để các nhà hoạch định chính sách quan sát điều kiện trước khi hành động.\n\nCác thành viên thị trường hiện đang định giá ít nhất một đợt cắt giảm 25 điểm cơ bản trước tháng 12, với hợp đồng tương lai ngụ ý xác suất khoảng 70% cho động thái nới lỏng tại cuộc họp tháng 9. Các nhà phân tích cảnh báo rằng bất kỳ sự bất ngờ nào về việc làm hoặc dữ liệu lạm phát có thể trì hoãn việc chuyển hướng.',

    th: 'ธนาคารกลางสหรัฐฯ (เฟด) ลงมติเป็นเอกฉันท์คงอัตราดอกเบี้ยเงินกองทุนเฟดเดอรัลไว้ที่ 5.25–5.50% ในการประชุมเดือนมิถุนายน นับเป็นการหยุดพักครั้งที่เจ็ดติดต่อกันนับตั้งแต่การขึ้นดอกเบี้ยครั้งสุดท้ายในเดือนกรกฎาคม 2566 ประธาน Jerome Powell อ้างถึงแรงกดดันด้านราคาที่ยังคงอยู่แต่ผ่อนคลายลง และตลาดแรงงานที่ยืดหยุ่นเป็นเหตุผลหลักในการคงอัตราดอกเบี้ย\n\nข้อมูลล่าสุดแสดงให้เห็นว่าดัชนีราคาผู้บริโภค (CPI) เพิ่มขึ้นเพียง 3.1% เมื่อเทียบกับปีก่อน ลดลงจากจุดสูงสุด 9.1% ในกลางปี 2565 PCE พื้นฐาน ซึ่งเป็นมาตรวัดเงินเฟ้อที่เฟดชื่นชอบ ก็ชะลอตัวลงอย่างมีนัยสำคัญ เปิดโอกาสให้ผู้กำหนดนโยบายสังเกตสภาวะก่อนดำเนินการ\n\nผู้เข้าร่วมตลาดกำลังตั้งราคาการปรับลดอย่างน้อย 25 จุดพื้นฐานภายในเดือนธันวาคม โดยสัญญาซื้อขายล่วงหน้าบ่งชี้ความน่าจะเป็นประมาณ 70% สำหรับการผ่อนคลายในการประชุมเดือนกันยายน นักวิเคราะห์เตือนว่าการเซอร์ไพรส์เชิงบวกในข้อมูลการจ้างงานหรือเงินเฟ้ออาจทำให้การเปลี่ยนทิศทางล่าช้าออกไป',
  },
  quizzes: [
    // Q1: What did the Fed do with the rate? correctIndex = 2 (held steady)
    {
      question: {
        en: 'What action did the Federal Reserve take on its benchmark rate at the June meeting?',
        ja: '6月の会合でFRBは政策金利をどう扱いましたか？',
        vi: 'Fed đã thực hiện hành động nào đối với lãi suất cơ bản tại cuộc họp tháng 6?',
        th: 'เฟดดำเนินการอย่างไรกับอัตราดอกเบี้ยนโยบายในการประชุมเดือนมิถุนายน?',
      },
      options: {
        en: [
          'Raised it by 25 basis points',
          'Cut it by 50 basis points',
          'Held it steady at 5.25–5.50%',
          'Raised it by 50 basis points',
        ],
        ja: [
          '25ベーシスポイント引き上げた',
          '50ベーシスポイント引き下げた',
          '5.25–5.50%に据え置いた',
          '50ベーシスポイント引き上げた',
        ],
        vi: [
          'Tăng thêm 25 điểm cơ bản',
          'Giảm 50 điểm cơ bản',
          'Giữ nguyên ở mức 5.25–5.50%',
          'Tăng thêm 50 điểm cơ bản',
        ],
        th: [
          'ปรับขึ้น 25 จุดพื้นฐาน',
          'ปรับลด 50 จุดพื้นฐาน',
          'คงไว้ที่ 5.25–5.50%',
          'ปรับขึ้น 50 จุดพื้นฐาน',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'The Fed voted unanimously to hold the rate at 5.25–5.50%, its seventh consecutive pause since the last hike in July 2023.',
        ja: 'FRBは2023年7月の最後の利上げ以来7回連続で、全会一致で5.25–5.50%への据え置きを決定しました。',
        vi: 'Fed đã nhất trí bỏ phiếu giữ nguyên lãi suất ở mức 5,25–5,50%, là lần dừng thứ bảy liên tiếp kể từ đợt tăng lãi suất cuối cùng vào tháng 7 năm 2023.',
        th: 'เฟดลงมติเป็นเอกฉันท์คงอัตราดอกเบี้ยที่ 5.25–5.50% นับเป็นการหยุดพักครั้งที่เจ็ดติดต่อกันนับตั้งแต่การขึ้นดอกเบี้ยครั้งสุดท้ายในเดือนกรกฎาคม 2566',
      },
      reward: 50,
    },
    // Q2: What signal was behind the hold? correctIndex = 0 (cooling inflation)
    {
      question: {
        en: 'Which economic signal primarily supported the Fed\'s decision to keep rates unchanged?',
        ja: '金利据え置き決定を主に後押しした経済シグナルはどれですか？',
        vi: 'Tín hiệu kinh tế nào chủ yếu hỗ trợ quyết định giữ nguyên lãi suất của Fed?',
        th: 'สัญญาณเศรษฐกิจใดที่สนับสนุนการตัดสินใจคงอัตราดอกเบี้ยของเฟดเป็นหลัก?',
      },
      options: {
        en: [
          'Cooling inflation (CPI at 3.1%)',
          'Rising unemployment above 6%',
          'Sharp contraction in GDP',
          'Surging consumer spending',
        ],
        ja: [
          'インフレ鈍化（CPI3.1%）',
          '失業率が6%超に上昇',
          'GDPの急激な落ち込み',
          '消費支出の急増',
        ],
        vi: [
          'Lạm phát hạ nhiệt (CPI ở mức 3,1%)',
          'Tỷ lệ thất nghiệp tăng vượt 6%',
          'GDP suy giảm mạnh',
          'Chi tiêu người tiêu dùng tăng vọt',
        ],
        th: [
          'เงินเฟ้อชะลอตัว (CPI อยู่ที่ 3.1%)',
          'การว่างงานพุ่งเกิน 6%',
          'GDP หดตัวรุนแรง',
          'การใช้จ่ายของผู้บริโภคพุ่งสูง',
        ],
      },
      correctIndex: 0,
      explanation: {
        en: 'CPI has fallen to 3.1% year-on-year — down from a 9.1% peak — signalling that inflation is cooling and giving the Fed confidence to hold.',
        ja: 'CPIは前年比3.1%まで低下し、ピーク時の9.1%から大幅に鈍化。これがFRBに据え置きの自信を与えました。',
        vi: 'CPI đã giảm xuống 3,1% so với cùng kỳ năm ngoái, giảm từ mức đỉnh 9,1%, cho thấy lạm phát đang hạ nhiệt và tạo cho Fed sự tự tin để giữ nguyên lãi suất.',
        th: 'CPI ลดลงเหลือ 3.1% เมื่อเทียบกับปีก่อน จากจุดสูงสุด 9.1% บ่งชี้ว่าเงินเฟ้อกำลังชะลอตัวและทำให้เฟดมั่นใจในการคงอัตราดอกเบี้ย',
      },
      reward: 40,
    },
    // Q3: What does the market expect later this year? correctIndex = 1 (a rate cut)
    {
      question: {
        en: 'What monetary policy move are markets pricing in for later this year?',
        ja: '市場が年内に織り込んでいる金融政策の動きは何ですか？',
        vi: 'Thị trường đang định giá động thái chính sách tiền tệ nào cho cuối năm nay?',
        th: 'ตลาดกำลังตั้งราคาการเคลื่อนไหวนโยบายการเงินใดสำหรับช่วงปลายปีนี้?',
      },
      options: {
        en: [
          'Another rate hike of 50 basis points',
          'At least one 25 bp rate cut',
          'Quantitative tightening acceleration',
          'No change through year-end',
        ],
        ja: [
          'さらに50ベーシスポイントの利上げ',
          '少なくとも25ベーシスポイントの利下げ',
          '量的引き締めの加速',
          '年末まで変更なし',
        ],
        vi: [
          'Tăng lãi suất thêm 50 điểm cơ bản',
          'Ít nhất một lần cắt giảm 25 điểm cơ bản',
          'Đẩy nhanh thắt chặt định lượng',
          'Không thay đổi đến cuối năm',
        ],
        th: [
          'ขึ้นดอกเบี้ยอีก 50 จุดพื้นฐาน',
          'ปรับลดอย่างน้อย 25 จุดพื้นฐานหนึ่งครั้ง',
          'เร่งการลดสภาพคล่อง (QT)',
          'ไม่มีการเปลี่ยนแปลงจนถึงสิ้นปี',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Futures markets imply a ~70% probability of a rate cut at the September meeting, with most analysts expecting at least one 25 bp cut by December.',
        ja: '先物市場は9月会合での利下げ確率を約70%と示しており、多くのアナリストは12月までに少なくとも25ベーシスポイントの利下げを予想しています。',
        vi: 'Thị trường hợp đồng tương lai ngụ ý xác suất khoảng 70% về việc cắt giảm lãi suất tại cuộc họp tháng 9, với hầu hết các nhà phân tích kỳ vọng ít nhất một lần cắt giảm 25 điểm cơ bản trước tháng 12.',
        th: 'ตลาดสัญญาซื้อขายล่วงหน้าบ่งชี้ความน่าจะเป็นประมาณ 70% สำหรับการปรับลดดอกเบี้ยในการประชุมเดือนกันยายน โดยนักวิเคราะห์ส่วนใหญ่คาดว่าจะมีการปรับลดอย่างน้อย 25 จุดพื้นฐานภายในเดือนธันวาคม',
      },
      reward: 30,
    },
  ],
  category: {
    en: 'financial_markets',
    ja: '金融市場',
    vi: 'thị_trường_tài_chính',
    th: 'ตลาดการเงิน',
  },
  keyPoints: {
    en: [
      '📈 Fed held benchmark rate at 5.25–5.50% for the 7th consecutive meeting',
      '💵 CPI cooled to 3.1% YoY, down sharply from the 9.1% peak in mid-2022',
      '🏦 Core PCE — the Fed\'s preferred inflation gauge — continues to slow meaningfully',
      '📉 Markets pricing ~70% probability of a 25 bp rate cut at the September meeting',
      '⚠️ Upside surprises in employment or inflation could delay the policy pivot',
    ],
    ja: [
      '📈 FRBは政策金利5.25–5.50%を7回連続で据え置き',
      '💵 CPIは前年比3.1%に低下、2022年半ばの9.1%ピークから大幅に鈍化',
      '🏦 FRBが重視するコアPCEデフレーターも継続的に鈍化',
      '📉 市場は9月会合での25bp利下げ確率を約70%と織り込む',
      '⚠️ 雇用・物価データが上振れすれば政策転換が遅れる可能性',
    ],
    vi: [
      '📈 Fed giữ nguyên lãi suất 5,25–5,50% lần thứ bảy liên tiếp',
      '💵 CPI hạ nhiệt xuống 3,1% so với năm ngoái, giảm mạnh từ đỉnh 9,1% giữa năm 2022',
      '🏦 PCE lõi — thước đo lạm phát ưa thích của Fed — tiếp tục chậm lại đáng kể',
      '📉 Thị trường định giá ~70% xác suất cắt giảm 25 bp tại cuộc họp tháng 9',
      '⚠️ Dữ liệu việc làm hay lạm phát tăng bất ngờ có thể trì hoãn việc chuyển hướng chính sách',
    ],
    th: [
      '📈 เฟดคงอัตราดอกเบี้ย 5.25–5.50% เป็นครั้งที่เจ็ดติดต่อกัน',
      '💵 CPI ชะลอตัวเหลือ 3.1% เมื่อเทียบปีก่อน ลดลงจากจุดสูงสุด 9.1% กลางปี 2565',
      '🏦 PCE พื้นฐาน มาตรวัดเงินเฟ้อที่เฟดชื่นชอบ ยังคงชะลอตัวต่อเนื่อง',
      '📉 ตลาดตั้งราคาความน่าจะเป็น ~70% สำหรับการลดดอกเบี้ย 25 bp ในการประชุมเดือนกันยายน',
      '⚠️ ข้อมูลการจ้างงานหรือเงินเฟ้อที่สูงกว่าคาดอาจทำให้การเปลี่ยนนโยบายล่าช้าออกไป',
    ],
  },
  relatedNews: {
    title: {
      en: 'U.S. Treasury yields slip as bond traders bet on Fed pivot',
      ja: '米国債利回り低下、債券市場がFRBの政策転換を織り込む',
      vi: 'Lợi suất trái phiếu Mỹ giảm khi nhà giao dịch cược vào việc Fed chuyển hướng',
      th: 'อัตราผลตอบแทนพันธบัตรสหรัฐฯ ลดลง นักลงทุนพันธบัตรเดิมพันเฟดเปลี่ยนทิศ',
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
} satisfies Record<string, L>;
