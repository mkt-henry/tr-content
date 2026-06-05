import type { Scenario } from '../../../engine/types';
import { PRODUCTS } from './data';
import { useGoldStore } from './state';

const st = () => useGoldStore.getState();

/** 교환 시나리오에서 사용할 상품 — Highlands 커피 (보유 골드 8,077로 교환 가능한 4,000 G) */
const TARGET = PRODUCTS.find((p) => p.id === 'highlands') ?? PRODUCTS[0];

/**
 * v1 — 금 시세 연동 소구: 시세 티커가 여러 번 틱하며 보유 골드의 ₫/그램 환산과
 * 상품 가격이 함께 출렁이는 걸 보여준다. 마지막에 커서로 골드 카드 환산 영역 강조.
 */
export const realGoldScenario: Scenario = {
  id: 'gold-store-real-gold',
  steps: [
    { kind: 'wait', ms: 1000 },
    // 골드 카드(₫/그램 환산)로 시선 유도
    { kind: 'cursor', target: 'gold-card', ms: 700 },
    { kind: 'wait', ms: 700 },

    // 시세 미니 티커가 여러 번 틱 — 가격이 살아 움직이는 연출
    { kind: 'cursor', target: 'price-ticker', ms: 600 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 900 },

    // 시세에 따라 상품 그리드 가격도 함께 출렁이는 걸 강조
    { kind: 'cursor', target: `product-${TARGET.id}`, ms: 700 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 900 },

    // 핵심: 골드의 ₫/그램 환산 강조 — "진짜 금"
    { kind: 'cursor', target: 'gold-converted', ms: 900 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 2400 },
  ],
};

/**
 * v2 — 간편 교환 소구: 카테고리 선택 → 상품 클릭 → 시트 → Exchange → 성공 → 골드 차감 확인.
 */
export const exchangeScenario: Scenario = {
  id: 'gold-store-exchange',
  steps: [
    { kind: 'wait', ms: 1000 },

    // 카테고리 선택 (Cafe & Beverage)
    { kind: 'click', target: 'cat-cafe', run: () => st().selectCategory('cafe') },
    { kind: 'wait', ms: 900 },

    // 상품 클릭 → 상세 시트
    { kind: 'cursor', target: `product-${TARGET.id}`, ms: 700 },
    { kind: 'wait', ms: 400 },
    { kind: 'click', target: `product-${TARGET.id}`, run: () => st().openSheet(TARGET) },
    { kind: 'wait', ms: 1200 },

    // Exchange
    { kind: 'cursor', target: 'exchange-btn', ms: 600 },
    { kind: 'wait', ms: 500 },
    { kind: 'click', target: 'exchange-btn', run: () => st().exchange() },
    { kind: 'wait', ms: 2200 },

    // 성공 오버레이 닫고 골드 차감 + 쿠폰 확인
    { kind: 'do', run: () => st().closeExchanged() },
    { kind: 'wait', ms: 700 },
    { kind: 'cursor', target: 'gold-pill', ms: 700 },
    { kind: 'wait', ms: 900 },
    { kind: 'cursor', target: 'my-coupon', ms: 700 },
    { kind: 'wait', ms: 2000 },
  ],
};
