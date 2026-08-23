import type { Scenario } from '../../../engine/types';
import type { OriginalScreenId } from './original.generated';

/**
 * 화면은 갤러리에서 고른 변형이 결정하므로(screens.tsx) 시나리오는 훑기만 한다 —
 * 위에서 아래까지 한 번 내려갔다 올라온다.
 */
export function walkScenario(id: OriginalScreenId): Scenario {
  return {
    id: `original-home-${id}`,
    steps: [
      { kind: 'wait', ms: 1400 },
      { kind: 'scroll', target: 'screen-scroll', to: 'bottom', ms: 5200 },
      { kind: 'wait', ms: 1100 },
      { kind: 'scroll', target: 'screen-scroll', to: 'top', ms: 2000 },
      { kind: 'wait', ms: 800 },
    ],
  };
}
