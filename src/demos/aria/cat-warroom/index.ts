import { Radar } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useWarroom } from './state';
import { alertsScenario, liveScenario } from './scenario';

const catWarroom: FeatureDefinition = {
  id: 'cat-warroom',
  title: 'Cat 이벤트 워룸',
  description: '태풍 상륙 순간, 노출 특약 식별부터 예상 손해 산정·출재사 알림까지 — 재해 대응을 한 화면에서.',
  icon: Radar,
  accent: '#f43f5e',
  Desktop,
  Mobile,
  resetState: () => useWarroom.getState().reset(),
  variants: [
    {
      id: 'live',
      label: '실시간 워룸',
      version: 'v1',
      sellingPoint: '대응 속도',
      url: 'insightre.ai/warroom',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 75% 60% at 80% 12%, rgba(244,63,94,0.24), transparent 58%), radial-gradient(ellipse 60% 55% at 10% 90%, rgba(120,20,40,0.3), transparent 60%), linear-gradient(160deg, #170a0f 0%, #0a0507 100%)',
        blobs: [
          'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-rose-500/10 blur-[140px]',
          'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-red-900/25 blur-[120px]',
        ],
      },
      scenario: liveScenario,
    },
    {
      id: 'alerts',
      label: '출재사 알림 30초',
      version: 'v2',
      sellingPoint: '대응 자동화',
      url: 'insightre.ai/warroom',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 15%, rgba(225,29,72,0.22), transparent 58%), radial-gradient(ellipse 60% 50% at 88% 88%, rgba(90,15,35,0.3), transparent 60%), linear-gradient(165deg, #150810 0%, #090408 100%)',
        blobs: ['absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-rose-600/10 blur-[140px]'],
      },
      scenario: alertsScenario,
    },
  ],
};

export default catWarroom;
