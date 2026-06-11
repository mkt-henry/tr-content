import type { Scenario } from '../../../engine/types';
import { PRODUCTS } from './data';
import { useGoldStore } from './state';

const st = () => useGoldStore.getState();

/** 교환 시나리오에서 사용할 상품 — Highlands 커피 (보유 골드 8,077로 교환 가능한 4,000 G) */
const TARGET = PRODUCTS.find((p) => p.id === 'highlands') ?? PRODUCTS[0];

/**
 * v1 — "포인트가 아니라 진짜 금": 스토어 골드 카드 → Gold Price 화면 진입.
 * 'Now' 기간을 켜면 캔들이 위아래로 소폭 형성·스크롤되고(라이브 틱 인터벌),
 * 시세 변동에 따라 내 골드 평가액·수익률이 실시간으로 흔들리는 걸 클로즈업한다.
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

    // 내 골드 평가 카드 강조 (보유 평가액)
    { kind: 'cursor', target: 'my-valuation', ms: 800 },
    { kind: 'wait', ms: 700 },

    // 'Now' 기간 선택 → 라이브 캔들·평가액 변동 시작 (인터벌 구동)
    { kind: 'cursor', target: 'period-now', ms: 600 },
    { kind: 'click', target: 'period-now', run: () => st().setPeriod('now') },
    { kind: 'wait', ms: 1500 },

    // 차트에서 캔들이 위아래로 움직이는 것을 관찰
    { kind: 'cursor', target: 'gold-chart', ms: 700 },
    { kind: 'wait', ms: 2800 },

    // 평가액·수익률이 실시간으로 변동하는 것 클로즈업
    { kind: 'cursor', target: 'valuation-return', ms: 900 },
    { kind: 'wait', ms: 3200 },
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
