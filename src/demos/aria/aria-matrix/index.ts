import { Grid3X3 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useMatrix } from './state';
import { uploadFlowScenario } from './scenario';
import { POSTS } from './posts';

const ariaMatrix: FeatureDefinition = {
  id: 'aria-matrix',
  title: '문서 비교 Matrix',
  description: '여러 슬립·특약 문서를 업로드하면 핵심 조건을 한 화면 비교표로 자동 추출하고 원문까지 검증합니다.',
  icon: Grid3X3,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useMatrix.getState().reset(),
  posts: POSTS,
  variants: [
    {
      id: 'upload-flow',
      label: '업로드 → 자동 추출 → 원문 검증',
      version: 'v1',
      sellingPoint: 'PDF 올리면 비교표 자동 완성',
      url: 'insightre.ai/matrix',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(70,72,82,0.35), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 95%, rgba(154,108,58,0.2), transparent 60%), linear-gradient(175deg, #0c0c0f 0%, #0a0908 100%)',
        blobs: ['absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brass-500/10 blur-[130px]'],
      },
      scenario: uploadFlowScenario,
    },
  ],
};

export default ariaMatrix;
