import { FileCheck } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useSlipCheck } from './state';
import { applyScenario, checkScenario } from './scenario';

const slipCheck: FeatureDefinition = {
  id: 'slip-check',
  title: '슬립-워딩 정합성 검사',
  description: '체결 전 슬립과 워딩을 AI가 조항 단위로 대조 — 불일치·누락을 잡고 수정안까지 제안합니다.',
  icon: FileCheck,
  accent: '#8b5cf6',
  Desktop,
  Mobile,
  resetState: () => useSlipCheck.getState().reset(),
  variants: [
    {
      id: 'scan',
      label: '불일치 자동 검출',
      version: 'v1',
      sellingPoint: '리스크 차단',
      url: 'insightre.ai/verify',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(139,92,246,0.24), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(67,30,120,0.3), transparent 60%), linear-gradient(160deg, #120d1c 0%, #08060e 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-purple-900/25 blur-[120px]',
        ],
      },
      scenario: checkScenario,
    },
    {
      id: 'apply',
      label: '수정안 반영 30초',
      version: 'v2',
      sellingPoint: '해결 자동화',
      url: 'insightre.ai/verify',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(124,58,237,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(50,20,90,0.3), transparent 60%), linear-gradient(165deg, #100b1a 0%, #07050d 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-purple-600/10 blur-[140px]'],
      },
      scenario: applyScenario,
    },
  ],
};

export default slipCheck;
