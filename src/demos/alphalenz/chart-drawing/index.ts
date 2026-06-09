import { PenLine } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { purpleBg, cyanBg } from '../_shared/theme';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useChart } from './state';
import { analysisScenario, setupScenario } from './scenario';

const chartDrawing: FeatureDefinition = {
  id: 'chart-drawing',
  title: 'AI 차트 드로잉',
  description: 'AI가 지지·저항·추세선과 패턴을 차트 위에 자동으로 그려 보여줍니다.',
  icon: PenLine,
  accent: '#22d3ee',
  Desktop,
  Mobile,
  resetState: () => useChart.getState().reset(),
  variants: [
    {
      id: 'analysis',
      label: '종목 기술 분석',
      version: 'v1',
      sellingPoint: '자동 차트 분석',
      url: 'alpha-lenz.com/chart',
      background: purpleBg,
      scenario: analysisScenario,
    },
    {
      id: 'setup',
      label: '스윙 셋업 탐지',
      version: 'v2',
      sellingPoint: '트레이딩 시그널',
      url: 'alpha-lenz.com/chart',
      background: cyanBg,
      scenario: setupScenario,
    },
  ],
};

export default chartDrawing;
