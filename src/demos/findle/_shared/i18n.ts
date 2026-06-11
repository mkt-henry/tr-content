import { useShellStore } from '../../../store/shellStore';

/**
 * Findle 데모 공용 i18n. 언어는 갤러리/스테이지에서 프로젝트 단위로 전환되고,
 * 모든 Findle 데모가 useLang()으로 같은 값을 구독한다. 기본값은 한국어.
 */
export type Lang = 'ko' | 'en';

export const DEFAULT_LANG: Lang = 'ko';

/** 언어별 문자열/값 묶음 */
export type L<T = string> = Record<Lang, T>;

export function useLang(): Lang {
  return useShellStore((s) => (s.projectLang['findle'] as Lang | undefined) ?? DEFAULT_LANG);
}

/** 비리액티브 조회 — 시나리오/스토어 등 훅 밖에서 사용 */
export function getLang(): Lang {
  return (useShellStore.getState().projectLang['findle'] as Lang | undefined) ?? DEFAULT_LANG;
}

export function pick<T>(l: L<T>, lang: Lang): T {
  return l[lang];
}

/** '{n}' 플레이스홀더 치환 */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
