import { useShellStore } from '../../../store/shellStore';

/**
 * AlphaLenz 데모 공용 i18n.
 * 언어는 상위(갤러리 헤더/스테이지 컨트롤 바)에서 프로젝트 단위로 전환되고,
 * 모든 AlphaLenz 데모가 useLang()으로 같은 값을 구독한다. 기본값은 한국어.
 */
export type Lang = 'ko' | 'en';

export const DEFAULT_LANG: Lang = 'ko';

/** 언어별 문자열/값 묶음 */
export type L<T = string> = Record<Lang, T>;

/** 현재 AlphaLenz 언어 — 컴포넌트에서 구독 */
export function useLang(): Lang {
  return useShellStore((s) => (s.projectLang['alphalenz'] as Lang | undefined) ?? DEFAULT_LANG);
}

/** 비리액티브 조회 — 시나리오/스토어 등 훅 밖에서 사용 */
export function getLang(): Lang {
  return (useShellStore.getState().projectLang['alphalenz'] as Lang | undefined) ?? DEFAULT_LANG;
}

/** L<T>에서 현재 언어 값 선택 */
export function pick<T>(l: L<T>, lang: Lang): T {
  return l[lang];
}

/** '{n}' 플레이스홀더 치환 */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
