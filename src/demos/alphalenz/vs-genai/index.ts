import { Columns2 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, AL } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useVs } from './state';

// TODO(Task 4): import { vsScenario } from './scenario' — 시나리오 파일 생성 후 교체
// 임시 빈 시나리오 — Task 4에서 scenario.ts로 추출
const vsScenarioPlaceholder = {
  id: 'vs-genai-samsung',
  steps: [] as import('../../../engine/types').Step[],
} satisfies import('../../../engine/types').Scenario;

const vsGenai: FeatureDefinition = {
  id: 'vs-genai',
  title: 'AlphaLenz vs 범용 AI',
  description: '범용 AI의 환각·출처 없음 vs AlphaLenz의 근거 기반 실시간 분석 — 한눈에 비교.',
  icon: Columns2,
  accent: AL.accent,
  Desktop,
  Mobile,
  resetState: () => useVs.getState().reset(),
  variants: [
    {
      id: 'samsung',
      label: '삼성전자 실적',
      version: 'v1',
      sellingPoint: '근거 vs 환각',
      url: 'alpha-lenz.com',
      background: purpleBg,
      // TODO(Task 4): scenario: vsScenario — 아래를 교체하세요
      scenario: vsScenarioPlaceholder,
    },
  ],
};

export default vsGenai;
