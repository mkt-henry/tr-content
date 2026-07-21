/**
 * Remotion 미리보기/Studio 연동 설정 — 앱(Stage)에서 임포트.
 * FINDLE_COMPOSITIONS를 단일 출처로 삼아 feature.id → { folder, id } 매핑을 파생한다.
 * hasRemotion이 true인 데모에 카드/스테이지의 "🎞 Remotion Studio" 버튼이 자동 노출된다.
 */
import { FINDLE_COMPOSITIONS } from './findleCompositions';

/** `npm run studio`가 고정하는 포트(3000)에 맞춘 Studio 베이스 URL */
export const REMOTION_STUDIO_URL = 'http://localhost:3000';

/** feature.id → 한국어 컴포지션 딥링크 경로 조각. Studio 좌측에서 -en으로 전환 가능. */
export const REMOTION_COMPOSITIONS: Record<string, { folder: string; id: string }> =
  Object.fromEntries(
    FINDLE_COMPOSITIONS.map((c) => [
      c.featureId,
      { folder: 'findle', id: `${c.name}-${c.variantId}-ko` },
    ]),
  );

export function hasRemotion(featureId: string): boolean {
  return featureId in REMOTION_COMPOSITIONS;
}

/** 해당 데모의 Studio 딥링크 (컴포지션 없으면 null) */
export function studioUrlFor(featureId: string): string | null {
  const c = REMOTION_COMPOSITIONS[featureId];
  return c ? `${REMOTION_STUDIO_URL}/${c.folder}/${c.id}` : null;
}

/**
 * 인앱 iframe에 임베드할 Remotion Studio URL.
 * dev는 `npm run studio`(:3000), prod는 vercel.json이 서빙하는 정적 번들(/studio).
 * featureId가 있으면 해당 컴포지션으로 딥링크(경로 포맷은 remotion/Root.tsx의 Folder+id와 일치),
 * 없으면(갤러리 진입 등) Studio 루트 — 사용자가 사이드바에서 선택한다.
 */
const STUDIO_EMBED_BASE = import.meta.env.DEV ? REMOTION_STUDIO_URL : '/studio';

export function studioEmbedSrc(featureId: string | null, lang: 'ko' | 'en' = 'ko'): string {
  const c = featureId ? FINDLE_COMPOSITIONS.find((x) => x.featureId === featureId) : undefined;
  if (!c) return STUDIO_EMBED_BASE;
  return `${STUDIO_EMBED_BASE}/findle/${c.name}-${c.variantId}-${lang}`;
}
