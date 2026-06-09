import type { DemoBackground } from '../../../registry/types';

/**
 * AlphaLenz 공용 디자인 토큰.
 * 실제 제품 톤: 다크 인디고/네이비 배경 + 퍼플·바이올렛 액센트 + 시안 보조.
 * 모든 데모가 같은 팔레트를 써서 갤러리 안에서 한 브랜드로 보이게 한다.
 */
export const AL = {
  /** 앱 셸 배경 (가장 어두운 베이스) */
  appBg: '#0a0b14',
  /** 패널/사이드바 배경 */
  panelBg: '#0d0f1c',
  /** 카드 배경 (반투명 위에 올림) */
  cardBg: 'rgba(255,255,255,0.03)',
  /** 보더 */
  border: 'rgba(255,255,255,0.07)',
  /** 메인 퍼플 액센트 */
  accent: '#7c5cff',
  accentSoft: 'rgba(124,92,255,0.14)',
  accentRing: 'rgba(124,92,255,0.45)',
  /** 보조 시안 */
  cyan: '#22d3ee',
  /** 상승/하락 (글로벌 톤: 녹=상승, 적=하락) */
  up: '#34d399',
  down: '#f43f5e',
} as const;

/** 데모 variant용 배경 그라디언트 (퍼플 소구) */
export const purpleBg: DemoBackground = {
  kind: 'gradient',
  css: 'radial-gradient(ellipse 72% 58% at 80% 10%, rgba(124,92,255,0.28), transparent 58%), radial-gradient(ellipse 58% 52% at 8% 92%, rgba(56,40,140,0.32), transparent 60%), linear-gradient(160deg, #0c0d1c 0%, #07070f 100%)',
  blobs: [
    'absolute -right-28 top-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-500/12 blur-[140px]',
    'absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-indigo-800/20 blur-[120px]',
  ],
};

/** 데모 variant용 배경 그라디언트 (시안/블루 소구) */
export const cyanBg: DemoBackground = {
  kind: 'gradient',
  css: 'radial-gradient(ellipse 70% 55% at 16% 14%, rgba(34,211,238,0.22), transparent 58%), radial-gradient(ellipse 60% 52% at 88% 88%, rgba(80,60,200,0.3), transparent 60%), linear-gradient(165deg, #0a0e1c 0%, #06070f 100%)',
  blobs: [
    'absolute -left-28 top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-[140px]',
    'absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-violet-700/18 blur-[120px]',
  ],
};
