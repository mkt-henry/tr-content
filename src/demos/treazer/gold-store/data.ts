import type { L } from '../_shared/i18n';

/** 스토어 상품 카테고리 */
export interface StoreCategory {
  id: string;
  /** 카테고리 라벨 — 실제 앱이 영어 카테고리를 사용하므로 영어 공통 */
  label: string;
}

/** eGIFT 카드 상품. 가격은 "그램(g)" 기준으로 고정되어 있고, 표시 골드 가격은 시세에 따라 실시간 환산된다. */
export interface StoreProduct {
  id: string;
  /** 브랜드명 (브랜드는 언어와 무관하게 그대로 노출) */
  brand: string;
  /** 상품명 — 언어별 자연스러운 표기 (브랜드는 유지, 설명만 번역) */
  name: L;
  /**
   * 카드 권면가 — 통화 중립 "단위" 값.
   * 표시 권면가 = faceUnits × CURRENCY.perFaceUnit (언어별 통화로 환산).
   */
  faceUnits: number;
  /** 이 상품의 고정 금 가치 (g) — 골드 가격은 goldPrice로 환산 */
  grams: number;
  /** 카테고리 id */
  category: string;
}

/**
 * 언어별 통화.
 * 실제 Treazer는 국가별 스토어가 달라(예: JP은 giftee) 통화도 다르다.
 * 데모에서는 통화를 언어에 연동한다.
 * - perGold: 1 GOLD당 통화 가치 (골드 카드 환산 라인에 사용)
 * - perFaceUnit: 권면가 1 단위당 통화 가치 (상품 face value 표기에 사용)
 * - fractionDigits: 표시 소수 자릿수 (보통 0, S$는 소수 둘째 자리)
 */
export interface Currency {
  symbol: string;
  perGold: number;
  perFaceUnit: number;
  locale: string;
  fractionDigits: number;
}

/**
 * 통화 환산 단가.
 * - vi(₫): 기존 비율 유지 — 1 GOLD ≈ ₫0.190 (8,077 G ≈ ₫1,535), 권면 1단위 = ₫1
 * - en(SG, S$): 1 GOLD ≈ S$0.000037, 권면 1단위 ≈ S$0.0000193 (₫200K ≈ S$3.86 수준)
 * - ja(¥): 1 GOLD ≈ ¥0.583, 권면 1단위 = ¥0.00609 (₫200K ≈ ¥1,218 수준)
 * - th(฿): 1 GOLD ≈ ฿0.00723, 권면 1단위 = ฿0.0000755 (₫200K ≈ ฿15.1 수준)
 */
export const CURRENCY: L<Currency> = {
  en: { symbol: 'S$', perGold: 0.000037, perFaceUnit: 0.0000193, locale: 'en-US', fractionDigits: 2 },
  ja: { symbol: '¥', perGold: 0.583, perFaceUnit: 0.00609, locale: 'ja-JP', fractionDigits: 0 },
  vi: { symbol: '₫', perGold: 1535 / 8077, perFaceUnit: 1, locale: 'vi-VN', fractionDigits: 0 },
  th: { symbol: '฿', perGold: 0.00723, perFaceUnit: 0.0000755, locale: 'th-TH', fractionDigits: 0 },
};

export const CATEGORIES: StoreCategory[] = [
  { id: 'beauty', label: 'Beauty & Health' },
  { id: 'cafe', label: 'Cafe & Beverage' },
  { id: 'ent', label: 'Entertainment' },
];

/**
 * 데모용 eGIFT 상품.
 * grams는 권면가(faceUnits)에 비례하도록 잡았고, 표시 골드 가격 = round(grams / GOLD_GRAMS_PER_UNIT) 로 환산한다.
 * (시세가 변해도 grams는 그대로지만, 골드 단가가 바뀌므로 환산 골드 가격이 출렁인다)
 * faceUnits는 통화 중립 단위로, 표시 권면가는 언어별 통화로 환산한다.
 */
export const PRODUCTS: StoreProduct[] = [
  {
    id: 'grab',
    brand: 'Grab',
    name: {
      en: 'Grab Gift S$5',
      ja: 'Grab ギフト ¥1,500',
      vi: 'Quà tặng Grab ₫250K',
      th: 'บัตรของขวัญ Grab ฿200',
    },
    faceUnits: 250_000,
    grams: 0.0005,
    category: 'cafe',
  },
  {
    id: 'treazer',
    brand: 'Treazer',
    name: {
      en: 'Gold Gift Card S$5',
      ja: 'ゴールドギフトカード ¥1,500',
      vi: 'Thẻ quà Gold ₫250K',
      th: 'การ์ดของขวัญ Gold ฿200',
    },
    faceUnits: 250_000,
    grams: 0.0005,
    category: 'beauty',
  },
  {
    id: 'highlands',
    brand: 'Highlands',
    name: {
      en: 'Highlands Coffee S$2',
      ja: 'Highlands コーヒー ¥600',
      vi: 'Cà phê Highlands ₫100K',
      th: 'กาแฟ Highlands ฿80',
    },
    faceUnits: 100_000,
    grams: 0.0002,
    category: 'cafe',
  },
  {
    id: 'cgv',
    brand: 'CGV',
    name: {
      en: 'CGV 2 Movie Tickets',
      ja: 'CGV 映画チケット2枚',
      vi: 'CGV 2 vé xem phim',
      th: 'CGV ตั๋วหนัง 2 ใบ',
    },
    faceUnits: 180_000,
    grams: 0.00036,
    category: 'ent',
  },
  {
    id: 'watsons',
    brand: 'Watsons',
    name: {
      en: 'Watsons Beauty S$3',
      ja: 'Watsons ビューティー ¥900',
      vi: 'Watsons làm đẹp ₫150K',
      th: 'Watsons ความงาม ฿120',
    },
    faceUnits: 150_000,
    grams: 0.0003,
    category: 'beauty',
  },
  {
    id: 'shopee',
    brand: 'Shopee',
    name: {
      en: 'Shopee Voucher S$4',
      ja: 'Shopee バウチャー ¥1,200',
      vi: 'Voucher Shopee ₫200K',
      th: 'Shopee วอเชอร์ ฿160',
    },
    faceUnits: 200_000,
    grams: 0.0004,
    category: 'ent',
  },
];

/** 앱 UI 문자열 — '{n}' 플레이스홀더는 fmt()로 치환 */
export const STR = {
  store: { en: 'Store', ja: 'ストア', vi: 'Cửa hàng', th: 'ร้านค้า' },
  myGoldPoints: {
    en: 'My Gold Points',
    ja: '保有ゴールド',
    vi: 'Điểm vàng của tôi',
    th: 'แต้มทองของฉัน',
  },
  myCoupon: { en: 'My Coupon', ja: 'クーポンボックス', vi: 'Phiếu của tôi', th: 'คูปองของฉัน' },
  faceValue: { en: 'Face value', ja: '額面', vi: 'Mệnh giá', th: 'มูลค่าหน้าบัตร' },
  priceLive: { en: 'Price (live)', ja: '価格（リアルタイム）', vi: 'Giá (trực tiếp)', th: 'ราคา (เรียลไทม์)' },
  pegNote: {
    en: 'Price is pegged to the live gold price. Balance {n} G',
    ja: '価格は金のリアルタイム相場に連動します。保有 {n} G',
    vi: 'Giá neo theo giá vàng thời gian thực. Số dư {n} G',
    th: 'ราคาอิงราคาทองแบบเรียลไทม์ ยอดคงเหลือ {n} G',
  },
  exchange: { en: 'Exchange', ja: '交換する', vi: 'Đổi quà', th: 'แลก' },
  exchangedTitle: {
    en: 'Exchange complete!',
    ja: '交換完了！',
    vi: 'Đổi quà thành công!',
    th: 'แลกสำเร็จ!',
  },
  exchangedSavedLine1: {
    en: 'The gift card has been saved to My Coupon.',
    ja: 'ギフトカードがクーポンボックスに保存されました。',
    vi: 'Thẻ quà đã được lưu vào Phiếu của tôi.',
    th: 'บันทึกการ์ดของขวัญไว้ในคูปองของฉันแล้ว',
  },
  exchangedSavedLine2: {
    en: 'Your gold has been deducted.',
    ja: 'ゴールドが差し引かれました。',
    vi: 'Vàng của bạn đã được trừ.',
    th: 'หักทองของคุณแล้ว',
  },
  goldPrice: { en: 'Gold Price', ja: 'ゴールド価格', vi: 'Giá vàng', th: 'ราคาทอง' },
  myValuation: {
    en: 'My Gold Value',
    ja: '保有ゴールド評価額',
    vi: 'Giá trị vàng của tôi',
    th: 'มูลค่าทองของฉัน',
  },
  sinceBought: {
    en: 'Since you started collecting',
    ja: '貯め始めてから',
    vi: 'Kể từ khi bắt đầu tích lũy',
    th: 'นับตั้งแต่เริ่มสะสม',
  },
  perGram: { en: '/g', ja: '/g', vi: '/g', th: '/g' },
  todaysOpen: { en: "Today's Open", ja: '始値', vi: 'Giá mở cửa', th: 'ราคาเปิด' },
  todaysHigh: { en: "Today's High", ja: '高値', vi: 'Giá cao nhất', th: 'ราคาสูงสุด' },
  todaysLow: { en: "Today's Low", ja: '安値', vi: 'Giá thấp nhất', th: 'ราคาต่ำสุด' },
  todaysClose: { en: "Today's Close", ja: '終値', vi: 'Giá đóng cửa', th: 'ราคาปิด' },
  aboutTitle: {
    en: 'About Gold Pricing',
    ja: 'ゴールド価格について',
    vi: 'Về giá vàng',
    th: 'เกี่ยวกับราคาทอง',
  },
  aboutBody: {
    en: 'Your GOLD rewards are linked to international gold prices. As the gold market moves, the value of the GOLD you have collected moves with it.',
    ja: 'あなたのGOLDは国際的な金相場に連動します。相場が動けば、貯めてきたGOLDの価値も一緒に動きます。',
    vi: 'Phần thưởng GOLD của bạn được liên kết với giá vàng quốc tế. Khi thị trường vàng biến động, giá trị số GOLD bạn đã tích lũy cũng thay đổi theo.',
    th: 'รางวัล GOLD ของคุณเชื่อมโยงกับราคาทองสากล เมื่อตลาดทองเคลื่อนไหว มูลค่า GOLD ที่คุณสะสมไว้ก็เปลี่ยนตามไปด้วย',
  },
  conversionRate: {
    en: 'Current Conversion Rate',
    ja: '現在の換算レート',
    vi: 'Tỷ giá quy đổi hiện tại',
    th: 'อัตราแปลงปัจจุบัน',
  },
} satisfies Record<string, L>;

/** 통화 금액 포맷 — 심볼 + 로케일 천 단위 구분 + 소수 자릿수 */
export function money(amount: number, c: Currency): string {
  return `${c.symbol}${amount.toLocaleString(c.locale, {
    minimumFractionDigits: c.fractionDigits,
    maximumFractionDigits: c.fractionDigits,
  })}`;
}

/** 데모 시작 시 보유 골드 — 꾸준히 모아온 잔액 (표시 평가액 ≈ GOLD × perGold × ratio ≈ S$48) */
export const INITIAL_GOLD = 1_284_000;

/**
 * 1 GOLD당 금 그램 — 실제 앱 기준 (8,077 G ≈ 0.00040385 g 환산비, 보유량과 독립).
 * grams / GOLD_GRAMS_PER_UNIT = 골드 가격.
 */
export const GOLD_GRAMS_PER_UNIT = 0.00040385 / 8077;

/** 데모 시작 시 금 시세 (₩/g) — 미니 티커가 이 값을 중심으로 미세 변동 */
export const INITIAL_GOLD_PRICE = 152_400;

/**
 * 평균 매입 시세 (추상 인덱스, INITIAL_GOLD_PRICE와 같은 축).
 * 현재 시세(152,400)보다 약 11% 낮게 잡아 "모은 시점 대비 +12.4%" 평가수익을 연출한다.
 * 수익률 = INITIAL_GOLD_PRICE / INITIAL_AVG_COST - 1 = 152400/135600 - 1 ≈ +12.4%
 */
export const INITIAL_AVG_COST = 135_600;

/**
 * 1 g당 통화 시세(ratio=1 기준) — 기존 cur.perGold에서 유도한다.
 * 1 GOLD = GOLD_GRAMS_PER_UNIT g, 1 GOLD ≈ cur.perGold 통화 이므로
 * 통화/g = perGold / GOLD_GRAMS_PER_UNIT. (별도 시세 테이블 없이 DRY하게 일관 유지)
 */
export function spotPerGram(c: Currency): number {
  return c.perGold / GOLD_GRAMS_PER_UNIT;
}

/** 차트 한 봉의 시가/고가/저가/종가 — 정규화(0~1) 스케일 */
export interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

export type Period = 'now' | '1m' | '5m' | '1y' | 'all';

/** 기간 토글 — 라벨은 실제 앱과 동일하게 영어 공통 */
export const PERIODS: { id: Period; label: string }[] = [
  { id: 'now', label: 'Now' },
  { id: '1m', label: '1M' },
  { id: '5m', label: '5M' },
  { id: '1y', label: '1Y' },
  { id: 'all', label: 'ALL' },
];

/**
 * 기간별 등락 표시값(%) — 차트 위 배지에 쓴다.
 * 차트 시각 형태는 정규화 시계열(makeSeries)로 그리지만, 배지 %는 별도로
 * 실제 금값에 가까운 현실적 우상향 수치를 보여준다(정규화 first→last를 그대로 쓰면 과장됨).
 */
export const PERIOD_CHANGE: Record<Period, number> = {
  now: 0.0072,
  '1m': 0.024,
  '5m': 0.068,
  '1y': 0.142,
  all: 0.381,
};

/** 결정적 의사난수(mulberry32) — 시드 고정으로 매 렌더마다 같은 차트를 보장(자동재생 안정성) */
function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 기간별 우상향 추세 + 노이즈의 정규화 OHLC 시계열.
 * 값은 0~1 스케일(차트 형태 전용); 실제 시세 라벨은 spotPerGram으로 별도 매핑한다.
 * 기간이 길수록 점 개수·변동폭·누적 상승폭이 커진다.
 */
export function makeSeries(period: Period): Candle[] {
  const cfg: Record<Period, { n: number; vol: number; drift: number; seed: number }> = {
    now: { n: 24, vol: 0.016, drift: 0.004, seed: 11 },
    '1m': { n: 30, vol: 0.02, drift: 0.006, seed: 22 },
    '5m': { n: 40, vol: 0.024, drift: 0.008, seed: 33 },
    '1y': { n: 48, vol: 0.03, drift: 0.011, seed: 44 },
    all: { n: 60, vol: 0.045, drift: 0.018, seed: 55 },
  };
  const { n, vol, drift, seed } = cfg[period];
  const rnd = mulberry32(seed);
  const out: Candle[] = [];
  let prev = 0.32; // 낮게 시작 → 전체 우상향
  for (let i = 0; i < n; i++) {
    const o = prev;
    const c = Math.min(0.97, Math.max(0.05, o + drift + (rnd() - 0.5) * vol * 2));
    const h = Math.min(1, Math.max(o, c) + rnd() * vol);
    const l = Math.max(0, Math.min(o, c) - rnd() * vol);
    out.push({ o, h, l, c });
    prev = c;
  }
  return out;
}
