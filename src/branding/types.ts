import type { ComponentType } from 'react';

/** 프로젝트별 영상 브랜딩 — 데모 앞뒤에 붙는 인트로/아웃트로 시퀀스 */
export interface ProjectBranding {
  /** 인트로 풀스테이지 컴포넌트 (portrait=true면 세로 9:16 구성) */
  Intro: ComponentType<{ portrait?: boolean }>;
  /** 아웃트로 풀스테이지 컴포넌트 (portrait=true면 세로 9:16 구성) */
  Outro: ComponentType<{ portrait?: boolean }>;
  /** 인트로 재생 시간(ms) — BrandOverlay 타이머 */
  introMs: number;
  /** 아웃트로 재생 시간(ms) */
  outroMs: number;
}
