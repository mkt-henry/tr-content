import { useShellStore } from '../../../store/shellStore';

/**
 * Treazer 데모 공용 i18n.
 * 언어는 데모 내부가 아니라 상위(갤러리 헤더/스테이지 컨트롤 바)에서 프로젝트 단위로 전환되고,
 * 모든 Treazer 데모가 useLang()으로 같은 값을 구독한다.
 */
export type Lang = 'en' | 'ja' | 'vi' | 'th';

export const DEFAULT_LANG: Lang = 'en';

/** 언어별 문자열/값 묶음 */
export type L<T = string> = Record<Lang, T>;

/** 현재 Treazer 언어 — 컴포넌트에서 구독 */
export function useLang(): Lang {
  return useShellStore((s) => (s.projectLang['treazer'] as Lang | undefined) ?? DEFAULT_LANG);
}

/** 비리액티브 조회 — 시나리오/스토어 등 훅 밖에서 사용 */
export function getLang(): Lang {
  return (useShellStore.getState().projectLang['treazer'] as Lang | undefined) ?? DEFAULT_LANG;
}

/** L<T>에서 현재 언어 값 선택 */
export function pick<T>(l: L<T>, lang: Lang): T {
  return l[lang];
}

/** '{n}' 플레이스홀더 치환 — 언어별 어순 차이를 흡수한다 */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}
