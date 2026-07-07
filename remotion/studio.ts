/**
 * Remotion 미리보기/Studio 연동 설정 — 앱(Stage)에서 가볍게 임포트 (무거운 의존 없음).
 * feature.id → { folder, id } 매핑. 프레임 기반 드라이버가 준비된 데모만 등록한다.
 * 데모를 확장할 때 여기에 추가하면 카드/스테이지에 미리보기·Studio 버튼이 자동 노출된다.
 *
 * folder는 Remotion <Folder>와 일치시켜야 Studio 딥링크 경로(/{folder}/{id})가 맞는다.
 */

/** `npm run studio`가 고정하는 포트(3000)에 맞춘 Studio 베이스 URL */
export const REMOTION_STUDIO_URL = 'http://localhost:3000';

export const REMOTION_COMPOSITIONS: Record<string, { folder: string; id: string }> = {
  'findle-daily-quiz': { folder: 'findle', id: 'daily-quiz-narrated' },
};

export function hasRemotion(featureId: string): boolean {
  return featureId in REMOTION_COMPOSITIONS;
}

/** 해당 데모의 Studio 딥링크 (컴포지션 없으면 null) — 예: .../findle/daily-quiz-narrated */
export function studioUrlFor(featureId: string): string | null {
  const c = REMOTION_COMPOSITIONS[featureId];
  return c ? `${REMOTION_STUDIO_URL}/${c.folder}/${c.id}` : null;
}
