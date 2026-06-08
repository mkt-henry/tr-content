import type { Scenario } from '../../../engine/types';
import { PRODUCTS } from './data';
import { useGoldStore } from './state';

const st = () => useGoldStore.getState();

/** 교환 시나리오에서 사용할 상품 — Highlands 커피 (보유 골드 8,077로 교환 가능한 4,000 G) */
const TARGET = PRODUCTS.find((p) => p.id === 'highlands') ?? PRODUCTS[0];

/**
 * v1 — "포인트가 아니라 진짜 금": 스토어 골드 카드 → Gold Price 화면 진입.
 * 시세가 틱할 때마다 내 골드 평가액·수익률이 함께 오르는 걸 보여주고,
 * "모은 시점 대비 +X%" 평가손익을 클로즈업하며 마무리한다.
 */
export const realGoldScenario: Scenario = {
  id: 'gold-store-real-gold',
  steps: [
    { kind: 'wait', ms: 900 },
    // 스토어의 골드 카드로 시선 유도
    { kind: 'cursor', target: 'gold-card', ms: 700 },
    { kind: 'wait', ms: 600 },

    // 카드 탭 → Gold Price 화면 진입
    { kind: 'click', target: 'gold-card', run: () => st().openPrice() },
    { kind: 'wait', ms: 1100 },

    // 내 골드 평가 카드 강조
    { kind: 'cursor', target: 'my-valuation', ms: 800 },
    { kind: 'wait', ms: 700 },

    // 시세 틱 — 평가액·수익률이 함께 상승
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },

    // 차트로 시선 이동 + 기간 전환으로 우상향 추세 확인
    { kind: 'cursor', target: 'gold-chart', ms: 700 },
    { kind: 'click', target: 'period-1y', run: () => st().setPeriod('1y') },
    { kind: 'wait', ms: 1000 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },
    { kind: 'do', run: () => st().tickPrice() },
    { kind: 'wait', ms: 800 },

    // 핵심: 모은 시점 대비 평가손익 클로즈업
    { kind: 'cursor', target: 'valuation-return', ms: 900 },
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
