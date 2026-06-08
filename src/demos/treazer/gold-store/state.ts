import { create } from 'zustand';
import {
  GOLD_GRAMS_PER_UNIT,
  INITIAL_AVG_COST,
  INITIAL_GOLD,
  INITIAL_GOLD_PRICE,
  PRODUCTS,
  spotPerGram,
  type Currency,
  type Period,
  type StoreProduct,
} from './data';

/** 시세 틱 방향 — 미니 티커 화살표 표시용 */
type Trend = 'up' | 'down' | 'flat';

interface GoldStoreState {
  gold: number;
  /** 골드 차감 직후 필 강조 애니메이션 */
  goldFlash: boolean;
  /** 현재 금 시세 (₩/g) */
  goldPrice: number;
  /** 직전 틱 대비 방향 */
  trend: Trend;
  /** 시세 틱마다 증가 — 가격 변동 강조 애니메이션 key */
  tick: number;
  /** 선택된 카테고리 id (null = 전체) */
  category: string | null;
  /** 상세 시트에 열려있는 상품 (null = 닫힘) */
  sheetProduct: StoreProduct | null;
  /** 교환 완료 오버레이 표시 */
  exchanged: boolean;
  /** 보유 쿠폰 수 */
  coupons: number;
  /** 현재 보고 있는 화면 */
  view: 'store' | 'price';
  /** 평균 매입 시세 (평가손익 기준) */
  avgCost: number;
  /** 차트 표시 모드 */
  chartMode: 'line' | 'candle';
  /** 선택된 차트 기간 */
  period: Period;

  /** 시세를 한 틱 미세 변동 (시나리오 do step에서 호출) */
  tickPrice: () => void;
  openPrice: () => void;
  closePrice: () => void;
  setChartMode: (m: 'line' | 'candle') => void;
  setPeriod: (p: Period) => void;
  selectCategory: (id: string | null) => void;
  openSheet: (product: StoreProduct) => void;
  closeSheet: () => void;
  exchange: () => void;
  closeExchanged: () => void;
  reset: () => void;
}

let runId = 0;

/** 상품의 현재 골드 가격 — 시세에 따라 출렁인다 */
export function priceInGold(product: StoreProduct, goldPrice: number): number {
  // 1 GOLD = GOLD_GRAMS_PER_UNIT g 이지만, 시세(goldPrice)가 오르면 같은 그램의 골드 환산값이 함께 움직이도록
  // 기준 시세 대비 비율을 곱해 "가격이 출렁이는" 연출을 만든다.
  const base = product.grams / GOLD_GRAMS_PER_UNIT;
  const ratio = goldPrice / INITIAL_GOLD_PRICE;
  return Math.round((base * ratio) / 10) * 10;
}

/** 보유 골드의 평가 결과 — 통화별 환산값과 매입 대비 수익률/평가이익을 한 번에 계산 */
export interface Valuation {
  /** 보유 골드의 금 그램 */
  grams: number;
  /** 현재 통화/g 시세 (시세 ratio 반영) */
  spot: number;
  /** 현재 평가액 (통화) */
  value: number;
  /** 매입 대비 수익률 (0.124 = +12.4%) */
  ret: number;
  /** 평가이익 (통화) */
  profit: number;
}

export function valuation(
  gold: number,
  goldPrice: number,
  avgCost: number,
  c: Currency,
): Valuation {
  const grams = gold * GOLD_GRAMS_PER_UNIT;
  const ratio = goldPrice / INITIAL_GOLD_PRICE;
  const spot = spotPerGram(c) * ratio;
  const value = grams * spot;
  const ret = goldPrice / avgCost - 1;
  const cost = value / (1 + ret);
  const profit = value - cost;
  return { grams, spot, value, ret, profit };
}

export const useGoldStore = create<GoldStoreState>((set, get) => ({
  gold: INITIAL_GOLD,
  goldFlash: false,
  goldPrice: INITIAL_GOLD_PRICE,
  trend: 'flat',
  tick: 0,
  category: null,
  sheetProduct: null,
  exchanged: false,
  coupons: 0,
  view: 'store',
  avgCost: INITIAL_AVG_COST,
  chartMode: 'candle',
  period: '1m',

  tickPrice: () => {
    const { goldPrice } = get();
    // 상승 편향을 키운 미세 변동 — "내 자산이 오르고 있다"가 또렷하게 보이도록
    const drift = (Math.random() - 0.32) * 0.0016;
    const next = Math.round(goldPrice * (1 + drift));
    set({
      goldPrice: next,
      trend: next > goldPrice ? 'up' : next < goldPrice ? 'down' : 'flat',
      tick: get().tick + 1,
    });
  },

  openPrice: () => set({ view: 'price' }),
  closePrice: () => set({ view: 'store' }),
  setChartMode: (m) => set({ chartMode: m }),
  setPeriod: (p) => set({ period: p }),

  selectCategory: (id) => set({ category: id }),

  openSheet: (product) => set({ sheetProduct: product }),

  closeSheet: () => set({ sheetProduct: null }),

  exchange: () => {
    const { sheetProduct, goldPrice, gold } = get();
    if (!sheetProduct) return;
    const cost = priceInGold(sheetProduct, goldPrice);
    if (cost > gold) return; // 잔액 부족 — 음수 잔액 방지
    const id = ++runId;
    set((s) => ({
      gold: s.gold - cost,
      goldFlash: true,
      coupons: s.coupons + 1,
      sheetProduct: null,
      exchanged: true,
    }));
    setTimeout(() => {
      if (id === runId) set({ goldFlash: false });
    }, 600);
  },

  closeExchanged: () => set({ exchanged: false }),

  reset: () => {
    runId++;
    set({
      gold: INITIAL_GOLD,
      goldFlash: false,
      goldPrice: INITIAL_GOLD_PRICE,
      trend: 'flat',
      tick: 0,
      category: null,
      sheetProduct: null,
      exchanged: false,
      coupons: 0,
      view: 'store',
      avgCost: INITIAL_AVG_COST,
      chartMode: 'candle',
      period: '1m',
    });
  },
}));

/** 현재 카테고리 필터가 적용된 상품 목록 */
export function visibleProducts(category: string | null): StoreProduct[] {
  if (!category) return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}
