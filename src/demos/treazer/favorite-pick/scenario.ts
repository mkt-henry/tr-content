import type { Scenario, Step } from '../../../engine/types';
import { BRACKET, WINNERS } from './data';
import { useFavoritePick } from './state';

const st = () => useFavoritePick.getState();

/**
 * 매치 한 개 진행 스텝 묶음 생성:
 * 승자 카드로 커서 → 클릭(pick) → 확대+체크 잠깐 보여주고 → next()로 다음 매치 슬라이드.
 * pauseAfter: 카드 선택 후 다음 매치로 넘어가기 전 머무는 시간(연출 속도 조절).
 */
function playMatch(index: number, pauseAfter = 850): Step[] {
  const winnerId = WINNERS[index];
  return [
    // 라운드를 건너뛰는 시나리오 대비 — 해당 매치로 점프 (연속 진행이면 no-op)
    { kind: 'do', run: () => st().setMatch(index) },
    { kind: 'cursor', target: `pick-${winnerId}`, ms: 600 },
    { kind: 'wait', ms: 350 },
    { kind: 'click', target: `pick-${winnerId}`, run: () => st().pick(winnerId) },
    { kind: 'wait', ms: pauseAfter },
    { kind: 'do', run: () => st().next() },
    { kind: 'wait', ms: 650 },
  ];
}

/** 마지막 매치 인덱스 (결승) */
const FINAL = BRACKET.length - 1;

/**
 * v1 — '부스팅' 소구: 매치 3~4개를 연속으로 빠르게 진행.
 * 16강 2매치 → 8강 1매치 → 결승 → 우승자 + 골드 보상.
 */
export const tournamentScenario: Scenario = {
  id: 'favorite-pick-tournament',
  steps: [
    { kind: 'wait', ms: 1100 },

    // 16강 — 2매치 빠르게
    ...playMatch(0),
    ...playMatch(1),

    // 8강 — 라운드 라벨 'Round of 8'로 전환되는 1매치
    ...playMatch(4),

    // 결승 — 우승자 확정 + 골드 보상 연출
    ...playMatch(FINAL),

    // 결과 화면 — 우승자 카드 + 골드 적립 + 통계 막대
    { kind: 'wait', ms: 800 },
    { kind: 'do', run: () => st().revealStats() },
    { kind: 'cursor', target: 'gold-pill', ms: 700 },
    { kind: 'wait', ms: 2400 },
  ],
};

/**
 * v2 — '소셜' 소구: 도입부에 do로 결승까지 스킵 → 결승 한 매치만 보여주고
 * 결과 화면의 "다른 유저들의 선택" 투표 통계 막대가 차오르는 연출을 강조.
 */
export const statsScenario: Scenario = {
  id: 'favorite-pick-stats',
  steps: [
    { kind: 'wait', ms: 900 },

    // 빠르게 결승까지 스킵
    { kind: 'do', run: () => st().skipToFinal() },
    { kind: 'wait', ms: 1000 },

    // 결승 한 매치만 진행
    ...playMatch(FINAL, 950),

    // 결과 화면 — 통계 막대 차오름을 천천히 강조
    { kind: 'wait', ms: 900 },
    { kind: 'do', run: () => st().revealStats() },
    { kind: 'cursor', target: 'vote-winter', ms: 700 },
    { kind: 'wait', ms: 1400 },
    { kind: 'cursor', target: 'vote-wonyoung', ms: 700 },
    { kind: 'wait', ms: 2200 },
  ],
};
