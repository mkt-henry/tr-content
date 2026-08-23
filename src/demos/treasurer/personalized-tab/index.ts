import { LayoutPanelTop } from 'lucide-react';
import type { DemoBackground, FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { usePersonalizedTab } from './state';
import {
  apptechScenario,
  briefingScenario,
  commodityScenario,
  switchScenario,
} from './scenario';

/** 트레져러 데모 배경 — 디자인 시스템 네이비/트러스트 블루 */
const TR_BACKGROUND: DemoBackground = {
  kind: 'gradient',
  css: 'radial-gradient(ellipse 80% 60% at 75% 8%, rgba(77,127,208,0.22), transparent 58%), radial-gradient(ellipse 65% 55% at 10% 95%, rgba(17,32,58,0.5), transparent 62%), linear-gradient(160deg, #101a2c 0%, #070d1a 100%)',
  blobs: [
    'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-[#4d7fd0]/10 blur-[140px]',
    'absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-[#2b4f8a]/20 blur-[120px]',
  ],
};

const personalizedTab: FeatureDefinition = {
  id: 'tr-personalized-tab',
  title: '맞춤 탭',
  description:
    '홈에 쌓여 있던 개인화 모듈을 별도 탭으로 분리 — 같은 모듈을 유저군별로 다시 조립합니다.',
  icon: LayoutPanelTop,
  accent: '#4d7fd0',
  Desktop,
  Mobile,
  resetState: () => usePersonalizedTab.getState().reset(),
  variants: [
    {
      id: 'commodity',
      label: '손익과 주문을 첫 화면으로',
      version: 'v1',
      sellingPoint: '원자재 투자자',
      url: 'treasurer.co.kr/app',
      background: TR_BACKGROUND,
      scenario: commodityScenario,
    },
    {
      id: 'apptech',
      label: '오늘 할 일을 하나의 진행률로',
      version: 'v2',
      sellingPoint: '앱테크 유저',
      url: 'treasurer.co.kr/app',
      background: TR_BACKGROUND,
      scenario: apptechScenario,
    },
    {
      id: 'briefing',
      label: '읽으러 온 유저에게는 읽는 화면',
      version: 'v3',
      sellingPoint: '시세·뉴스 관심층',
      url: 'treasurer.co.kr/app',
      background: TR_BACKGROUND,
      scenario: briefingScenario,
    },
    {
      id: 'switch',
      label: '같은 탭, 다른 조립',
      version: 'v4',
      sellingPoint: '기준 변경',
      url: 'treasurer.co.kr/app',
      background: TR_BACKGROUND,
      scenario: switchScenario,
    },
  ],
};

export default personalizedTab;
