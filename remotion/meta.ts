import dailyQuiz from '../src/demos/findle/daily-quiz';
import { buildTimeline } from './timeline';

/** 컴포지션 공통 메타 — Root(CLI 렌더)와 앱 내 Player가 공유한다. */
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const variant = dailyQuiz.variants.find((v) => v.id === 'narrated') ?? dailyQuiz.variants[0];

/** 프레임 타임라인 실제 총길이 + 1.5초 여운 */
export const DURATION_IN_FRAMES = buildTimeline(variant.scenario, FPS).total + Math.round(1.5 * FPS);
