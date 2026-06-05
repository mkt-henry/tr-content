/** 스토어 상품 카테고리 */
export interface StoreCategory {
  id: string;
  label: string;
}

/** eGIFT 카드 상품. 가격은 "그램(g)" 기준으로 고정되어 있고, 표시 골드 가격은 시세에 따라 실시간 환산된다. */
export interface StoreProduct {
  id: string;
  /** 브랜드명 (더미 데이터 — 한국어 혼용) */
  brand: string;
  /** 상품명 */
  name: string;
  /** 카드 권면가 (₫) */
  faceValue: number;
  /** 이 상품의 고정 금 가치 (g) — 골드 가격은 goldPrice로 환산 */
  grams: number;
  /** 카테고리 id */
  category: string;
}

export const CATEGORIES: StoreCategory[] = [
  { id: 'beauty', label: 'Beauty & Health' },
  { id: 'cafe', label: 'Cafe & Beverage' },
  { id: 'ent', label: 'Entertainment' },
];

/**
 * 데모용 eGIFT 상품 — 한국어 더미 데이터.
 * grams는 권면가에 비례하도록 잡았고, 표시 골드 가격 = round(grams / GOLD_GRAMS_PER_UNIT) 로 환산한다.
 * (시세가 변해도 grams는 그대로지만, 골드 단가가 바뀌므로 환산 골드 가격이 출렁인다)
 */
export const PRODUCTS: StoreProduct[] = [
  { id: 'grab', brand: 'Grab', name: 'Grab 기프트 $10', faceValue: 250_000, grams: 0.0005, category: 'cafe' },
  { id: 'treazer', brand: 'Treazer', name: 'Gold 기프트 카드 $10', faceValue: 250_000, grams: 0.0005, category: 'beauty' },
  { id: 'highlands', brand: 'Highlands', name: 'Highlands 커피 ₫100K', faceValue: 100_000, grams: 0.0002, category: 'cafe' },
  { id: 'cgv', brand: 'CGV', name: 'CGV 영화 2매', faceValue: 180_000, grams: 0.00036, category: 'ent' },
  { id: 'watsons', brand: 'Watsons', name: 'Watsons 뷰티 ₫150K', faceValue: 150_000, grams: 0.0003, category: 'beauty' },
  { id: 'shopee', brand: 'Shopee', name: 'Shopee 바우처 ₫200K', faceValue: 200_000, grams: 0.0004, category: 'ent' },
];

/** 데모 시작 시 보유 골드 */
export const INITIAL_GOLD = 8077;

/**
 * 1 GOLD당 금 그램 — 실제 앱 기준 (8,077 G ≈ 0.00040385 g).
 * grams / GOLD_GRAMS_PER_UNIT = 골드 가격.
 */
export const GOLD_GRAMS_PER_UNIT = 0.00040385 / 8077;

/** 데모 시작 시 금 시세 (₩/g) — 미니 티커가 이 값을 중심으로 미세 변동 */
export const INITIAL_GOLD_PRICE = 152_400;

/** ₫(동) 환산 단가 — 1 GOLD ≈ ₫0.190 (8,077 G ≈ ₫1,535) */
export const DONG_PER_GOLD = 1535 / 8077;
