import type { Scenario } from '../../../engine/types';
import { usePlaybackStore } from '../../../engine/playbackStore';
import { useScreener } from './state';

const st = () => useScreener.getState();

/** v1 — 6대 전략: VCP 선별(줌 연출) → CANSLIM 전환 → 상위 종목 훑기 */
export const sixScenario: Scenario = {
  id: 'screener-six',
  steps: [
    { kind: 'wait', ms: 900 },
    // VCP 줌 연출 — 확대 원점을 화면 좌상단(strategy-anchor)으로 두어 좌상단 영역을 확대한다.
    // 커서는 VCP 칩으로(cameraZoomedCenter로 확대된 위치 계산) 정확히 이동하고, blur는 spotlight가 'strategy-*'라 켜진다.
    { kind: 'click', target: 'strategy-vcp', run: () => st().select('vcp'), zoom: true, spotlight: 'strategy-anchor', zoomScale: 1.3 },
    { kind: 'wait', ms: 1500 }, // 확대 유지(4) — 채워진 VCP 결과가 확대 상태에서 보이도록 조금 길게
    // 줌아웃(5) — 커서를 VCP에 둔 채 원래 배율로 복귀. 시선(커서)=수축 원점이라 줌인의 자연스러운 역재생이 된다.
    // (줌아웃과 결과 이동을 한 스텝에 겹치면 화면은 VCP로 수축하는데 시선은 결과로 떠나 방향이 꺾여 보인다.)
    { kind: 'cursor', target: 'strategy-vcp', ms: 550 },
    { kind: 'wait', ms: 250 }, // 배율이 완전히 1로 돌아올 때까지 잠깐 유지
    // 결과 화면으로 전환(6) — 배율 1 상태에서 결과 첫 행으로 이동하므로 줌 왜곡이 없다.
    { kind: 'cursor', target: 'row-0', ms: 550 },
    { kind: 'wait', ms: 1400 },
    // CANSLIM — (1) 칩 확대 + 주변 블러로 전략 선택 강조 → (2) 줌아웃 → (3) 결과 재확대 → (4) 스크롤.
    { kind: 'scroll', target: 'results-scroll', to: 'top', ms: 1 }, // 리스트 맨 위로 (배율 1)
    // (1) 칩 확대 + 블러 — 확대 원점=좌상단(strategy-anchor)이라 좌상단이 확대되고, 커서는 CANSLIM 칩으로 정확히 이동.
    { kind: 'click', target: 'strategy-canslim', run: () => st().select('canslim'), zoom: true, spotlight: 'strategy-anchor', zoomScale: 1.3 },
    { kind: 'wait', ms: 1200 }, // 확대+블러 유지 — CANSLIM 선택 강조
    // (2) 줌아웃 — 커서를 칩에 둔 채 복귀(역재생). spotlight 해제로 블러도 함께 사라진다.
    { kind: 'cursor', target: 'strategy-canslim', ms: 500 },
    { kind: 'wait', ms: 300 },
    // (3) 결과 영역(컨테이너)을 원점으로 재확대. origin=results-scroll는 내용이 스크롤돼도 위치가 안 변해 카메라가 고정된다.
    { kind: 'cursor', target: 'results-scroll', zoom: true, zoomScale: 1.2, ms: 600 },
    { kind: 'wait', ms: 600 },
    // 확대·카메라 고정 상태에서 리스트(22종목)를 위→아래로 천천히 스크롤 — scrollOver가 scrollTop을 직접 움직인다.
    { kind: 'scroll', target: 'results-scroll', to: 'bottom', ms: 3200, keepZoom: true },
    { kind: 'wait', ms: 700 },
    // 줌아웃 — 커서 이동 없이 spotlight만 해제한다. (커서를 큰 스크롤 컨테이너로 옮기면
    //  moveCursorTo의 scrollIntoView가 스크롤을 튕겨 끊김이 생기므로 회피.)
    // origin은 결과 중앙에 고정된 채 배율만 1로 스프링 → 중앙 수축, 끊김 없음.
    { kind: 'do', run: () => usePlaybackStore.getState().setSpotlight(null) },
    { kind: 'wait', ms: 1000 },
  ],
};

/** v2 — 실시간 급등 포착: Surge → PEAD 전환 */
export const surgeScenario: Scenario = {
  id: 'screener-surge',
  steps: [
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'strategy-surge', run: () => st().select('surge') },
    { kind: 'wait', ms: 2600 },
    { kind: 'click', target: 'strategy-pead', run: () => st().select('pead') },
    { kind: 'wait', ms: 2400 },
    { kind: 'cursor', target: 'row-0' },
    { kind: 'wait', ms: 1000 },
  ],
};
