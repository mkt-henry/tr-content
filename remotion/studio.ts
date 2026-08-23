/**
 * Remotion Studio 연동 — 앱(Stage/Gallery/카드뉴스 뷰어)에서 임포트.
 * FINDLE_COMPOSITIONS를 단일 출처로 삼아 feature.id → 컴포지션 딥링크를 파생한다.
 * hasRemotion이 true인 데모에 스테이지의 "🎞 Remotion Studio" 버튼이 자동 노출된다.
 */
import { FINDLE_COMPOSITIONS } from './findleCompositions';

/** `npm run studio`가 고정하는 포트(3010)에 맞춘 dev Studio 베이스 URL.
    3000은 다른 로컬 앱이 쓰고 있어 3010으로 옮겼다 — package.json의 --port와 반드시 같이 바꾼다. */
export const REMOTION_STUDIO_URL = 'http://localhost:3010';

/**
 * Studio 링크를 만든다. route는 `<폴더>/<컴포지션id>` 또는 없으면 Studio 루트.
 *
 * dev: `npm run studio`가 origin 루트(:3010)에 Studio를 띄우므로 경로를 그대로 붙인다.
 * prod: 정적 번들이 /studio/ 하위에 배포된다. 번들은 자신이 origin 루트에 있다고 가정하므로
 *       라우트를 경로로 주면 매칭에 실패해 첫 컴포지션으로 떨어진다 → `?/`로 넘긴다.
 *       (자산 참조도 절대 경로여야 한다 — package.json build:studio의 --public-path=/studio/ 참고.)
 */
function studioHref(route?: string): string {
  if (import.meta.env.DEV) return route ? `${REMOTION_STUDIO_URL}/${route}` : REMOTION_STUDIO_URL;
  return route ? `/studio/?/${route}` : '/studio/';
}

/** 이 데모에 렌더 대상 컴포지션이 있는가 */
export function hasRemotion(featureId: string): boolean {
  return FINDLE_COMPOSITIONS.some((c) => c.featureId === featureId);
}

/**
 * 인앱 iframe에 임베드할 Studio URL.
 * featureId가 있으면 해당 컴포지션으로 딥링크(경로 포맷은 remotion/Root.tsx의 Folder+id와 일치),
 * 없으면(갤러리 진입 등) Studio 루트 — 사용자가 사이드바에서 고른다.
 */
export function studioEmbedSrc(featureId: string | null, lang: 'ko' | 'en' = 'ko'): string {
  const c = featureId ? FINDLE_COMPOSITIONS.find((x) => x.featureId === featureId) : undefined;
  return studioHref(c ? `${c.projectId}/${c.name}-${c.variantId}-${lang}` : undefined);
}

/**
 * 카드뉴스 릴스 컴포지션 Studio 딥링크.
 * 경로는 remotion/Root.tsx의 <Folder name="cardnews"> + 컴포지션 id `reels-<deckId>`와 일치한다.
 * Studio의 Render 버튼으로 브라우저에서 바로 mp4를 받을 수 있다
 * (remotion.config.ts의 setExperimentalClientSideRenderingEnabled 덕분).
 * dev에서는 `npm run studio`(:3010)가 떠 있어야 한다.
 */
export function reelsStudioUrl(deckId: string): string {
  return studioHref(`cardnews/reels-${deckId}`);
}
