import { FileText } from 'lucide-react';
import type { FeatureDefinition } from '../../../registry/types';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { useRenewalReport } from './state';
import { renewalReportScenario } from './scenario';

const BACKGROUND = {
  kind: 'gradient' as const,
  css: 'radial-gradient(ellipse 75% 60% at 78% 12%, rgba(216,173,120,0.22), transparent 58%), radial-gradient(ellipse 60% 55% at 12% 94%, rgba(154,108,58,0.26), transparent 60%), linear-gradient(160deg, #14110b 0%, #08070a 100%)',
  blobs: [
    'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-brass-500/10 blur-[140px]',
    'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-amber-800/15 blur-[120px]',
  ],
};

const renewalReport: FeatureDefinition = {
  id: 'renewal-report',
  title: '갱신 결과 보고서 + 전달 이메일',
  description: '갱신 플레이스먼트 완료 후 결과 보고서를 생성하고, 출재사에 전달할 이메일 초안까지 자동 작성합니다.',
  icon: FileText,
  accent: '#d9ad78',
  Desktop,
  Mobile,
  resetState: () => useRenewalReport.getState().reset(),
  variants: [
    {
      id: 'flow',
      label: '자료 선택 → 보고서 → 맞춤 전달 이메일',
      version: 'v1',
      sellingPoint: '근거 자료 + 수신자별 AI 의도 분석',
      url: 'insightre.ai/report',
      background: BACKGROUND,
      scenario: renewalReportScenario,
    },
  ],
};

export default renewalReport;
