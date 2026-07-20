import type { FeatureDefinition } from '../src/registry/types';
import dailyQuiz from '../src/demos/findle/daily-quiz';
import quizGen from '../src/demos/findle/quiz-gen';
import leaderboard from '../src/demos/findle/leaderboard';
import rewards from '../src/demos/findle/rewards';
import teacherReport from '../src/demos/findle/teacher-report';
import { buildTimeline } from './timeline';
import { FPS } from './meta';

/**
 * findle 데모 → Remotion 컴포지션 매핑 단일 출처.
 * webpack 번들러는 Vite 전용 import.meta.glob(registry)을 못 쓰므로 feature를 직접 import한다.
 * 새 데모/variant를 렌더 대상에 추가하려면 SPECS에 한 줄 추가.
 */
interface Spec {
  feature: FeatureDefinition;
  /** 렌더 대상 대표 variant id */
  variantId: string;
  /** 컴포지션 id 접두 (feature.id에서 findle- 제거) */
  name: string;
}

const SPECS: Spec[] = [
  { feature: dailyQuiz, variantId: 'narrated', name: 'daily-quiz' },
  { feature: quizGen, variantId: 'adaptive', name: 'quiz-gen' },
  { feature: leaderboard, variantId: 'badge', name: 'leaderboard' },
  { feature: rewards, variantId: 'redeem', name: 'rewards' },
  { feature: teacherReport, variantId: 'full', name: 'teacher-report' },
];

/** 타임라인 총길이 뒤에 붙이는 마무리 여운 */
const TAIL_FRAMES = Math.round(1.5 * FPS);

export interface FindleComposition {
  name: string;
  featureId: string;
  variantId: string;
  title: string;
  durationInFrames: number;
}

function variantOf(s: Spec) {
  return s.feature.variants.find((v) => v.id === s.variantId) ?? s.feature.variants[0];
}

export const FINDLE_COMPOSITIONS: FindleComposition[] = SPECS.map((s) => {
  const variant = variantOf(s);
  return {
    name: s.name,
    featureId: s.feature.id,
    variantId: variant.id,
    title: s.feature.title,
    durationInFrames: buildTimeline(variant.scenario, FPS).total + TAIL_FRAMES,
  };
});

/** 컴포지션 props(문자열 id)를 실제 feature/variant로 해석. props는 JSON 직렬화 가능해야 하므로 객체는 여기서만. */
export function resolveFindle(featureId: string, variantId: string) {
  const s = SPECS.find((x) => x.feature.id === featureId);
  if (!s) return null;
  const variant =
    s.feature.variants.find((v) => v.id === variantId) ??
    s.feature.variants.find((v) => v.id === s.variantId) ??
    s.feature.variants[0];
  return { feature: s.feature, variant };
}
