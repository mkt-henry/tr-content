import { Columns2 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, AL } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useVs } from './state';
import { vsScenario } from './scenario';

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
      scenario: vsScenario,
    },
  ],
};

export default vsGenai;
