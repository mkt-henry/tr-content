import { Languages } from 'lucide-react';
import type { FeatureDefinition } from '../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useSummary } from './state';
import { speedScenario, traceScenario } from './scenario';

const ariaSummary: FeatureDefinition = {
  id: 'aria-summary',
  title: '리스크 요약·번역',
  description: '영문 슬립을 한국어 구조화 요약으로 — 모든 항목이 원문 구절과 연결됩니다.',
  icon: Languages,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useSummary.getState().reset(),
  variants: [
    {
      id: 'speed',
      label: '영문 슬립 30초 한글 요약',
      version: 'v1',
      sellingPoint: '언어 장벽 제거',
      url: 'insightre.ai/summary',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 18% 20%, rgba(82,96,128,0.28), transparent 58%), radial-gradient(ellipse 65% 55% at 85% 85%, rgba(154,108,58,0.22), transparent 60%), linear-gradient(140deg, #0c0d11 0%, #100c08 100%)',
        blobs: [
          'absolute -right-28 bottom-10 h-[24rem] w-[24rem] rounded-full bg-brass-500/10 blur-[140px]',
          'absolute -left-24 top-10 h-72 w-72 rounded-full bg-slate-700/25 blur-[120px]',
        ],
      },
      scenario: speedScenario,
    },
    {
      id: 'trace',
      label: '원문 인용 추적',
      version: 'v2',
      sellingPoint: 'citation-first 신뢰성',
      url: 'insightre.ai/summary/trace',
      background: {
        kind: 'gradient',
        css: 'radial-gradient(ellipse 70% 55% at 80% 15%, rgba(192,141,82,0.26), transparent 58%), radial-gradient(ellipse 60% 50% at 12% 90%, rgba(60,50,36,0.35), transparent 60%), linear-gradient(160deg, #14100b 0%, #0a0907 100%)',
        blobs: [
          'absolute -left-28 top-1/3 h-[24rem] w-[24rem] rounded-full bg-brass-500/12 blur-[140px]',
        ],
      },
      scenario: traceScenario,
    },
  ],
};

export default ariaSummary;
