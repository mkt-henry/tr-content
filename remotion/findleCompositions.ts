import type { FeatureDefinition } from '../src/registry/types';
import dailyQuiz from '../src/demos/findle/daily-quiz';
import quizGen from '../src/demos/findle/quiz-gen';
import leaderboard from '../src/demos/findle/leaderboard';
import rewards from '../src/demos/findle/rewards';
import teacherReport from '../src/demos/findle/teacher-report';
import screener from '../src/demos/alphalenz/screener';
import { buildTimeline } from './timeline';
import { FPS } from './meta';
import { useShellStore } from '../src/store/shellStore';

/**
 * 데모 → Remotion 컴포지션 매핑 단일 출처.
 * webpack 번들러는 Vite 전용 import.meta.glob(registry)을 못 쓰므로 feature를 직접 import한다.
 * 새 데모/variant를 렌더 대상에 추가하려면 SPECS에 한 줄 추가.
 */
interface Spec {
  feature: FeatureDefinition;
  /** 렌더 대상 대표 variant id */
  variantId: string;
  /** 컴포지션 id 접두 (feature.id에서 findle- 제거) */
  name: string;
  /**
   * 데모가 속한 프로젝트 id (= projectLang 키, Studio 폴더명).
   * i18n·언어 전환이 projectLang[projectId]로 이뤄지므로 렌더 시 이 키로 언어를 세팅한다.
   * registry.getProjectIdOfFeature는 import.meta.glob 의존이라 번들에서 못 쓰므로 명시한다.
   */
  projectId: string;
  /** 브라우저 프레임(주소창) 기본 표시 여부 — Studio에서 토글 가능. 웹앱 데모(screener)는 ON. */
  chrome: boolean;
}

const SPECS: Spec[] = [
  { feature: dailyQuiz, variantId: 'narrated', name: 'daily-quiz', projectId: 'findle', chrome: false },
  { feature: quizGen, variantId: 'adaptive', name: 'quiz-gen', projectId: 'findle', chrome: false },
  { feature: leaderboard, variantId: 'badge', name: 'leaderboard', projectId: 'findle', chrome: false },
  { feature: rewards, variantId: 'redeem', name: 'rewards', projectId: 'findle', chrome: false },
  { feature: teacherReport, variantId: 'full', name: 'teacher-report', projectId: 'findle', chrome: false },
  { feature: screener, variantId: 'six', name: 'screener', projectId: 'alphalenz', chrome: true },
];

/** 타임라인 총길이 뒤에 붙이는 마무리 여운 */
const TAIL_FRAMES = Math.round(1.5 * FPS);

export interface FindleComposition {
  name: string;
  featureId: string;
  variantId: string;
  title: string;
  durationInFrames: number;
  /** 프로젝트 id — Studio 폴더 그룹 + 딥링크 경로 조각으로 쓰인다 */
  projectId: string;
  /** 브라우저 프레임 기본 표시 여부 (defaultProps 초기값) */
  chrome: boolean;
}

function variantOf(s: Spec) {
  return s.feature.variants.find((v) => v.id === s.variantId) ?? s.feature.variants[0];
}

/**
 * 컴포지션 길이(프레임) — ko/en 중 더 긴 타임라인 기준(+여운).
 * buildTimeline은 스텝 텍스트를 getLang()(store)로 1회 캡처하므로, 언어별로 store lang을
 * 잠시 바꿔 각 언어의 total을 재고 max를 취한다(모듈 로드 시 1회, 이전 값 정확 복원).
 */
function durationOf(spec: Spec): number {
  const variant = variantOf(spec);
  const key = spec.projectId; // 언어 캡처는 이 데모 프로젝트의 projectLang 키로 이뤄진다
  const prev = useShellStore.getState().projectLang[key];
  let maxTotal = 0;
  for (const lang of ['ko', 'en'] as const) {
    useShellStore.setState((s) => ({ projectLang: { ...s.projectLang, [key]: lang } }));
    maxTotal = Math.max(maxTotal, buildTimeline(variant.scenario, FPS).total);
  }
  useShellStore.setState((s) => {
    const pl = { ...s.projectLang };
    if (prev === undefined) delete pl[key];
    else pl[key] = prev;
    return { projectLang: pl };
  });
  return maxTotal + TAIL_FRAMES;
}

export const FINDLE_COMPOSITIONS: FindleComposition[] = SPECS.map((s) => {
  const variant = variantOf(s);
  return {
    name: s.name,
    featureId: s.feature.id,
    variantId: variant.id,
    title: s.feature.title,
    durationInFrames: durationOf(s),
    projectId: s.projectId,
    chrome: s.chrome,
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
  // projectId — DemoVideo가 이 키로 projectLang[projectId]=lang을 세팅해 데모 i18n에 언어를 전달한다.
  return { feature: s.feature, variant, projectId: s.projectId };
}
