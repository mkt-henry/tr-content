import { Handshake } from 'lucide-react';
import type { FeatureDefinition } from '../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useMatch } from './state';
import { rankingScenario, outreachScenario } from './scenario';

const ariaMatch: FeatureDefinition = {
  id: 'aria-match',
  title: '재보험사 매칭 + 영업 이메일',
  description: '리스크에 맞는 재보험사를 데이터로 추천하고, 담당자 맞춤 영업 이메일까지 작성합니다.',
  icon: Handshake,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useMatch.getState().reset(),
  variants: [
    {
      id: 'ranking',
      label: '데이터 기반 추천',
      version: 'v1',
      sellingPoint: '인수 이력·선호 라인 근거',
      url: 'insightre.ai/match',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 82% 18%, rgba(94,158,143,0.24), transparent 58%), radial-gradient(ellipse 60% 50% at 10% 88%, rgba(154,108,58,0.22), transparent 60%), linear-gradient(150deg, #0b0f0e 0%, #0d0a08 100%)',
        blobs: [
          'absolute -right-24 top-1/4 h-[24rem] w-[24rem] rounded-full bg-teal-700/15 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-brass-500/10 blur-[120px]',
        ],
      },
      scenario: rankingScenario,
    },
    {
      id: 'outreach',
      label: '맞춤 영업 이메일 자동화',
      version: 'v2',
      sellingPoint: '추천부터 발송 직전까지',
      url: 'insightre.ai/match/outreach',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 20% 15%, rgba(192,141,82,0.26), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(70,72,82,0.32), transparent 60%), linear-gradient(160deg, #13100b 0%, #0a0a0c 100%)',
        blobs: [
          'absolute -left-28 top-1/3 h-[24rem] w-[24rem] rounded-full bg-brass-500/12 blur-[140px]',
        ],
      },
      scenario: outreachScenario,
    },
  ],
};

export default ariaMatch;
