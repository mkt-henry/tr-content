import { Table2 } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useBordereaux } from './state';
import { settleScenario, validateScenario } from './scenario';

const claimBordereaux: FeatureDefinition = {
  id: 'claim-bordereaux',
  title: '클레임 보더로 처리',
  description: '출재사 클레임 보더로(bordereaux)를 AI가 행 단위로 검증하고, 오류를 잡아 정산 금액까지 산출합니다.',
  icon: Table2,
  accent: '#6366f1',
  Desktop,
  Mobile,
  resetState: () => useBordereaux.getState().reset(),
  variants: [
    {
      id: 'validate',
      label: '행 단위 자동 검증',
      version: 'v1',
      sellingPoint: '데이터 품질',
      url: 'insightre.ai/bordereaux',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(99,102,241,0.24), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(40,40,110,0.32), transparent 60%), linear-gradient(160deg, #0c0d1a 0%, #07070e 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-indigo-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-blue-900/25 blur-[120px]',
        ],
      },
      scenario: validateScenario,
    },
    {
      id: 'settle',
      label: '정산 대조 → 청구서',
      version: 'v2',
      sellingPoint: '정산 자동화',
      url: 'insightre.ai/bordereaux',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(79,70,229,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(30,30,90,0.32), transparent 60%), linear-gradient(165deg, #0b0c17 0%, #06060c 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-600/10 blur-[140px]'],
      },
      scenario: settleScenario,
    },
  ],
};

export default claimBordereaux;
