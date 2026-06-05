import { Grid3X3 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useMatrix } from './state';
import { batchScenario, citedScenario } from './scenario';

const ariaMatrix: FeatureDefinition = {
  id: 'aria-matrix',
  title: '문서 비교 Matrix',
  description: '여러 슬립·특약 문서에서 핵심 조건을 한 화면에 자동 추출·비교합니다.',
  icon: Grid3X3,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useMatrix.getState().reset(),
  variants: [
    {
      id: 'batch',
      label: '다수 문서 일괄 추출',
      version: 'v1',
      sellingPoint: '5개 슬립을 한 화면에서',
      url: 'insightre.ai/matrix',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(70,72,82,0.35), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 95%, rgba(154,108,58,0.2), transparent 60%), linear-gradient(175deg, #0c0c0f 0%, #0a0908 100%)',
        blobs: [
          'absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brass-500/10 blur-[130px]',
        ],
      },
      scenario: batchScenario,
    },
    {
      id: 'cited',
      label: '원문 인용 검증',
      version: 'v2',
      sellingPoint: '클릭 한 번에 원문 확인',
      url: 'insightre.ai/matrix/cited',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 15% 10%, rgba(192,141,82,0.24), transparent 58%), radial-gradient(ellipse 60% 50% at 90% 85%, rgba(58,60,72,0.35), transparent 60%), linear-gradient(150deg, #12100c 0%, #0a0a0d 100%)',
        blobs: [
          'absolute -left-28 top-1/4 h-[24rem] w-[24rem] rounded-full bg-brass-500/12 blur-[140px]',
        ],
      },
      scenario: citedScenario,
    },
  ],
};

export default ariaMatrix;
