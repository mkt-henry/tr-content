import { Store } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { TZ_BACKGROUND } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useGoldStore } from './state';
import { exchangeScenario, realGoldScenario } from './scenario';

const goldStore: FeatureDefinition = {
  id: 'tz-gold-store',
  title: '골드 스토어',
  description: '금 시세에 실시간 연동되는 골드로 기프트카드를 교환하는 스토어입니다.',
  icon: Store,
  accent: '#f97316',
  Desktop,
  Mobile,
  resetState: () => useGoldStore.getState().reset(),
  variants: [
    {
      id: 'real-gold',
      label: '포인트가 아니라 진짜 금',
      version: 'v1',
      sellingPoint: '금 시세 연동',
      url: 'treazer.app/store',
      background: TZ_BACKGROUND,
      scenario: realGoldScenario,
    },
    {
      id: 'exchange',
      label: '30초 기프트카드 교환',
      version: 'v2',
      sellingPoint: '간편 교환',
      url: 'treazer.app/store',
      background: TZ_BACKGROUND,
      scenario: exchangeScenario,
    },
  ],
};

export default goldStore;
