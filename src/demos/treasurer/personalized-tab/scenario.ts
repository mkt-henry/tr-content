import type { Scenario, Step } from '../../../engine/types';
import type { SegmentId } from './data';
import { usePersonalizedTab } from './state';

const st = () => usePersonalizedTab.getState();

/** 화면 본문을 아래까지 훑고 다시 위로 — 모듈 순서를 보여주는 공통 마무리 */
function walkThrough(downMs = 3400, upMs = 1500): Step[] {
  return [
    { kind: 'scroll', target: 'screen-scroll', to: 'bottom', ms: downMs },
    { kind: 'wait', ms: 900 },
    { kind: 'scroll', target: 'screen-scroll', to: 'top', ms: upMs },
    { kind: 'wait', ms: 700 },
  ];
}

/** 기준 변경 시트를 열고 다른 유저군을 골라 화면이 다시 조립되는 것까지 */
function switchSegment(to: SegmentId): Step[] {
  return [
    { kind: 'click', target: 'segment-change', run: () => st().openPicker() },
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: `segment-${to}`, run: () => st().setSegment(to) },
    { kind: 'wait', ms: 1200 },
  ];
}

/** v1 — 원자재 투자자: 손익과 주문 버튼이 첫 화면에 올라온다 */
export const commodityScenario: Scenario = {
  id: 'personalized-tab-commodity',
  steps: [
    { kind: 'do', run: () => st().setSegment('commodity') },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'portfolio-card', ms: 700, zoom: true, caption: '손익을 첫 화면으로' },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'buy-button', ms: 650, caption: '재매수까지 2탭' },
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'quote-card', ms: 700, zoom: true, caption: '보유 자산 빠른 매수' },
    { kind: 'wait', ms: 1500 },
    ...walkThrough(3000),
  ],
};

/** v2 — 앱테크 유저: 흩어진 적립 모듈을 하나의 진행률로 */
export const apptechScenario: Scenario = {
  id: 'personalized-tab-apptech',
  steps: [
    { kind: 'do', run: () => st().setSegment('apptech') },
    { kind: 'wait', ms: 1100 },
    { kind: 'cursor', target: 'progress-card', ms: 700, zoom: true, caption: '오늘 할 일을 하나의 진행률로' },
    { kind: 'wait', ms: 1800 },
    { kind: 'scroll', target: 'screen-scroll', to: 'bottom', ms: 3600 },
    { kind: 'wait', ms: 800 },
    { kind: 'cursor', target: 'next-step', ms: 700, caption: '전환 훅은 한 번만' },
    { kind: 'wait', ms: 1600 },
    { kind: 'scroll', target: 'screen-scroll', to: 'top', ms: 1500 },
    { kind: 'wait', ms: 700 },
  ],
};

/** v3 — 시세·뉴스 관심층: 읽으러 온 유저에게는 읽는 화면 (이 유저군만 다크) */
export const briefingScenario: Scenario = {
  id: 'personalized-tab-briefing',
  steps: [
    { kind: 'do', run: () => st().setSegment('briefing') },
    { kind: 'wait', ms: 1200 },
    { kind: 'scroll', target: 'screen-scroll', to: 'bottom', ms: 3600 },
    { kind: 'wait', ms: 700 },
    { kind: 'scroll', target: 'screen-scroll', toId: 'moved-assets', ms: 1200 },
    { kind: 'wait', ms: 600 },
    { kind: 'cursor', target: 'moved-assets', ms: 700, zoom: true, caption: '뉴스에서 바로 매수' },
    { kind: 'wait', ms: 1800 },
    { kind: 'scroll', target: 'screen-scroll', to: 'top', ms: 1500 },
    { kind: 'wait', ms: 700 },
  ],
};

/** v4 — 같은 탭, 다른 조립: 기준을 바꾸면 맞춤 탭 전체가 재구성된다 */
export const switchScenario: Scenario = {
  id: 'personalized-tab-switch',
  steps: [
    { kind: 'do', run: () => st().setSegment('commodity') },
    { kind: 'wait', ms: 1200 },
    { kind: 'cursor', target: 'portfolio-card', ms: 650 },
    { kind: 'wait', ms: 900 },

    ...switchSegment('apptech'),
    { kind: 'cursor', target: 'progress-card', ms: 650 },
    { kind: 'wait', ms: 1400 },

    ...switchSegment('briefing'),
    { kind: 'wait', ms: 1800 },
    { kind: 'scroll', target: 'screen-scroll', to: 'bottom', ms: 2600 },
    { kind: 'wait', ms: 900 },
    { kind: 'scroll', target: 'screen-scroll', to: 'top', ms: 1400 },
    { kind: 'wait', ms: 800 },
  ],
};
