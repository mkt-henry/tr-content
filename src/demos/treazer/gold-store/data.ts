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
} satisfies Record<string, L>;

/** 통화 금액 포맷 — 심볼 + 로케일 천 단위 구분 + 소수 자릿수 */
export function money(amount: number, c: Currency): string {
  return `${c.symbol}${amount.toLocaleString(c.locale, {
    minimumFractionDigits: c.fractionDigits,
    maximumFractionDigits: c.fractionDigits,
  })}`;
}

/** 데모 시작 시 보유 골드 */
export const INITIAL_GOLD = 8077;

/**
 * 1 GOLD당 금 그램 — 실제 앱 기준 (8,077 G ≈ 0.00040385 g).
 * grams / GOLD_GRAMS_PER_UNIT = 골드 가격.
 */
export const GOLD_GRAMS_PER_UNIT = 0.00040385 / 8077;

/** 데모 시작 시 금 시세 (₩/g) — 미니 티커가 이 값을 중심으로 미세 변동 */
export const INITIAL_GOLD_PRICE = 152_400;
