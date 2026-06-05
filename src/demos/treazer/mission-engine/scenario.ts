import type { Scenario, Step } from '../../../engine/types';
import { AD_DURATION_SEC } from './data';
import { useMissionEngine } from './state';

const st = () => useMissionEngine.getState();

/** 30초 광고를 ~3초로 압축 — tickAd를 AD_DURATION_SEC회 반복 (~100ms 간격) */
function adCountdownSteps(): Step[] {
  const steps: Step[] = [];
  for (let i = 0; i < AD_DURATION_SEC; i++) {
    steps.push({ kind: 'do', run: () => st().tickAd() });
    steps.push({ kind: 'wait', ms: 100 });
  }
  return steps;
}

/**
 * v1 — 시간제 미션(리텐션) 핵심 연출:
 * 시계 빨리감기 → 잠긴 점심 미션 OPEN → 진입 → 진행도 0/5→5/5 → 보상 받기
 * → 리워디드 광고(압축 카운트다운) → 골드 지급 + GoldPill 갱신
 */
export const timedScenario: Scenario = {
  id: 'mission-engine-timed',
  steps: [
    { kind: 'wait', ms: 1100 },

    // 잠겨있는 점심 미션을 한번 비춰준다 (11:58 AM, 아직 locked)
    { kind: 'cursor', target: 'timed-card-lunch', ms: 800 },
    { kind: 'wait', ms: 800 },

    // 가짜 시계 빨리감기 — 11:58 → 12:05 (점심 미션 오픈 시간 진입)
    { kind: 'cursor', target: 'clock', ms: 600 },
    { kind: 'do', run: () => st().advanceClock(2) }, // 12:00
    { kind: 'wait', ms: 350 },
    { kind: 'do', run: () => st().advanceClock(3) }, // 12:03
    { kind: 'wait', ms: 350 },
    { kind: 'do', run: () => st().advanceClock(2) }, // 12:05 → lunch 미션 OPEN
    { kind: 'wait', ms: 1200 }, // OPEN 펄스 강조

    // 오픈된 점심 미션 진입
    { kind: 'click', target: 'timed-open-lunch', run: () => st().enterTimed('lunch') },
    { kind: 'wait', ms: 900 },

    // 퀴즈 1유닛 진행도 0/5 → 5/5 (압축 연출)
    { kind: 'do', run: () => st().fillTimed('lunch') },
    { kind: 'wait', ms: 1400 },

    // '보상 받기' → 리워디드 광고 화면
    { kind: 'click', target: 'timed-reward-lunch', run: () => st().startAd('lunch') },
    { kind: 'wait', ms: 900 },

    // 30초 광고 압축 카운트다운
    ...adCountdownSteps(),
    { kind: 'wait', ms: 500 },

    // 광고 완료 → 골드 지급 + GoldPill 강조
    { kind: 'do', run: () => st().finishAd() },
    { kind: 'wait', ms: 700 },
    { kind: 'cursor', target: 'gold-pill', ms: 800 },
    { kind: 'wait', ms: 2200 },
  ],
};

/**
 * v2 — 데일리 미션(데일리 루프) 연출:
 * 데일리 미션 2개의 진행도가 차오르고 순서대로 보상 수령, 골드 누적 강조
 */
export const dailyScenario: Scenario = {
  id: 'mission-engine-daily',
  steps: [
    { kind: 'wait', ms: 1100 },

    // 데일리 미션 섹션 비추기
    { kind: 'cursor', target: 'daily-claim-streak', ms: 700 },
    { kind: 'wait', ms: 400 },

    // 미션 1 — 진행도가 단계적으로 차오름 (5단계)
    { kind: 'do', run: () => st().progressDaily('streak', 2) },
    { kind: 'wait', ms: 450 },
    { kind: 'do', run: () => st().progressDaily('streak', 2) },
    { kind: 'wait', ms: 450 },
    { kind: 'do', run: () => st().progressDaily('streak', 1) }, // 5/5 완료
    { kind: 'wait', ms: 900 },

    // 미션 1 보상 수령 → 골드 누적
    { kind: 'click', target: 'daily-claim-streak', run: () => st().claimDaily('streak') },
    { kind: 'wait', ms: 1400 },

    // 미션 2 — 진행도 차오름
    { kind: 'cursor', target: 'daily-claim-gold-day', ms: 700 },
    { kind: 'do', run: () => st().progressDaily('gold-day', 3) },
    { kind: 'wait', ms: 500 },
    { kind: 'do', run: () => st().progressDaily('gold-day', 2) }, // 5/5 완료
    { kind: 'wait', ms: 900 },

    // 미션 2 보상 수령
    { kind: 'click', target: 'daily-claim-gold-day', run: () => st().claimDaily('gold-day') },
    { kind: 'wait', ms: 1100 },

    // 누적 골드 강조
    { kind: 'cursor', target: 'gold-pill', ms: 800 },
    { kind: 'wait', ms: 2200 },
  ],
};
