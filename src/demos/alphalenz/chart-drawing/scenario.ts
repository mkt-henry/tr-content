import type { Scenario } from '../../../engine/types';
import { useChart } from './state';

const st = () => useChart.getState();

/**
 * 드로잉 자동 진행 타이밍(state.ts):
 *  start() 후 0.7s → step1, 이후 1.2s 간격으로 step5까지 → +0.6s done.
 *  총 약 0.7 + 1.2*4 + 0.6 = 6.1s. wait를 그에 맞춰 잡는다.
 */

/** v1 — 종목 기술 분석: 분석 실행 → 5단계 드로잉 → 패턴 라벨 확인 */
export const analysisScenario: Scenario = {
  id: 'chart-analysis',
  steps: [
    { kind: 'do', run: () => st().setMode('analysis') },
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'analyze-btn', run: () => st().start() },
    // 5단계 드로잉이 그려지는 동안 대기 (≈6.2s)
    { kind: 'wait', ms: 6400 },
    // 완성된 패턴 라벨 근처로 커서 이동
    { kind: 'cursor', target: 'pattern-anchor', ms: 900 },
    { kind: 'wait', ms: 1800 },
  ],
};

/** v2 — 스윙 셋업 탐지: 같은 차트, 셋업/시그널 톤 */
export const setupScenario: Scenario = {
  id: 'chart-setup',
  steps: [
    { kind: 'do', run: () => st().setMode('setup') },
    { kind: 'wait', ms: 900 },
    { kind: 'click', target: 'analyze-btn', run: () => st().start() },
    { kind: 'wait', ms: 6400 },
    { kind: 'cursor', target: 'pattern-anchor', ms: 900 },
    { kind: 'wait', ms: 1800 },
  ],
};
