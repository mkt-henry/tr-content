import { ShieldCheck } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, cyanBg } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { usePipe } from './state';
import { ingestScenario, benchmarkScenario } from './scenario';

const dataPipeline: FeatureDefinition = {
  id: 'data-pipeline',
  title: '데이터 정확성 파이프라인',
  description: '공시·리포트·뉴스를 실시간 수집하고 다단계로 교차 검증합니다.',
  icon: ShieldCheck,
  accent: '#22d3ee',
  Desktop,
  Mobile,
  resetState: () => usePipe.getState().reset(),
  variants: [
    {
      id: 'ingest',
      label: '실시간 데이터 검증',
      version: 'v1',
      sellingPoint: '데이터 정확성',
      url: 'alpha-lenz.com/data',
      background: purpleBg,
      scenario: ingestScenario,
    },
    {
      id: 'benchmark',
      label: 'Fin-RATE 벤치마크',
      version: 'v2',
      sellingPoint: '정확도 우위',
      url: 'alpha-lenz.com/data',
      background: cyanBg,
      scenario: benchmarkScenario,
    },
  ],
};

export default dataPipeline;
