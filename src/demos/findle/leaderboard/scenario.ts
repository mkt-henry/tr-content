import type { Scenario, Step } from '../../../engine/types';
import { useLeaderboard } from './state';

const st = () => useLeaderboard.getState();

/** 정답 → XP 획득 (재정렬) */
function studyStep(waitMs: number): Step[] {
  return [
    { kind: 'click', target: 'study-btn', run: () => st().study() },
    { kind: 'wait', ms: waitMs },
  ];
}

const CLIMB: Step[] = [
  { kind: 'wait', ms: 900 },
  { kind: 'cursor', target: 'my-rank-row', ms: 800 },
  { kind: 'wait', ms: 700 },
  ...studyStep(1100),
  ...studyStep(1100),
  ...studyStep(1300), // 3번째에서 Sam 추월 → 순위 상승 + 뱃지
  { kind: 'cursor', target: 'rankup-banner', ms: 700 },
  { kind: 'wait', ms: 900 },
];

/** v1 — 또래 경쟁 동기부여: XP 쌓아 순위 상승 */
export const competeScenario: Scenario = {
  id: 'findle-leaderboard-compete',
  steps: [
    ...CLIMB,
    { kind: 'cursor', target: 'badge-modal', ms: 700 },
    { kind: 'wait', ms: 1600 },
    { kind: 'click', target: 'badge-cta', run: () => st().closeBadge() },
    { kind: 'wait', ms: 1400 },
  ],
};

/** v2 — 뱃지 컬렉션: 순위 상승 → Top 3 뱃지 언락 클로즈업 */
export const badgeScenario: Scenario = {
  id: 'findle-leaderboard-badge',
  steps: [
    ...CLIMB,
    { kind: 'cursor', target: 'badge-modal', ms: 800 },
    { kind: 'wait', ms: 2600 }, // 뱃지 연출 길게
    { kind: 'click', target: 'badge-cta', run: () => st().closeBadge() },
    { kind: 'wait', ms: 1400 },
  ],
};
