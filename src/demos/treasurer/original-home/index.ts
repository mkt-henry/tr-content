import { LayoutList } from 'lucide-react';
import type { DemoBackground, FeatureDefinition } from '../../../registry/types';
import { ORIGINAL_META } from './data';
import { Desktop } from './Desktop';
import { Mobile } from './Mobile';
import { walkScenario } from './scenario';

/** 트레져러 데모 배경 — 디자인 시스템 네이비/트러스트 블루 */
const TR_BACKGROUND: DemoBackground = {
  kind: 'gradient',
  css: 'radial-gradient(ellipse 80% 60% at 75% 8%, rgba(77,127,208,0.22), transparent 58%), radial-gradient(ellipse 65% 55% at 10% 95%, rgba(17,32,58,0.5), transparent 62%), linear-gradient(160deg, #101a2c 0%, #070d1a 100%)',
  blobs: [
    'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-[#4d7fd0]/10 blur-[140px]',
    'absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-[#2b4f8a]/20 blur-[120px]',
  ],
};

const originalHome: FeatureDefinition = {
  id: 'tr-original-home',
  title: '개인화 홈 원안',
  description:
    '유저군별로 홈을 다시 조립한 원본 설계안 6개 — 설계 문서의 화면 마크업을 그대로 렌더합니다.',
  icon: LayoutList,
  accent: '#38629f',
  Desktop,
  Mobile,
  chromeless: true,
  // 화면은 선택된 변형이 결정하므로 초기화할 로컬 상태가 없다
  resetState: () => {},
  variants: ORIGINAL_META.map((meta) => ({
    id: meta.id,
    label: meta.caption,
    version: meta.id,
    sellingPoint: meta.segment,
    background: TR_BACKGROUND,
    scenario: walkScenario(meta.id),
  })),
};

export default originalHome;
