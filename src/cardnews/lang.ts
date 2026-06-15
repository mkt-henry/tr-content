import type { Lang } from './types';

/** 프로젝트 언어를 카드뉴스가 지원하는 Lang(ko/en)으로 정규화. en이 아니면 ko로 폴백. */
export function toLang(v: string | undefined): Lang {
  return v === 'en' ? 'en' : 'ko';
}
