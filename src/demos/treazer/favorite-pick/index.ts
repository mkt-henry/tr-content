import { Trophy } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { TZ_BACKGROUND } from '../_shared/ui';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useFavoritePick } from './state';
import { statsScenario, tournamentScenario } from './scenario';

const favoritePick: FeatureDefinition = {
  id: 'tz-favorite-pick',
  title: '이상형 월드컵',
  description:
    '가볍게 고르다 보면 어느새 출석 — 베트남 시장을 부스팅하는 토너먼트 콘텐츠입니다.',
  icon: Trophy,
  accent: '#f97316',
  Desktop,
  Mobile,
  resetState: () => useFavoritePick.getState().reset(),
  variants: [
    {
      id: 'tournament',
      label: '고르다 보면 어느새 출석',
      version: 'v1',
      sellingPoint: '부스팅',
      url: 'treazer.app/tournament',
      background: TZ_BACKGROUND,
      scenario: tournamentScenario,
    },
    {
      id: 'stats',
      label: '모두의 선택은?',
      version: 'v2',
      sellingPoint: '소셜',
      url: 'treazer.app/tournament',
      background: TZ_BACKGROUND,
      scenario: statsScenario,
    },
  ],
};

export default favoritePick;
