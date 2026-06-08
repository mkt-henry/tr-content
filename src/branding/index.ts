import type { ProjectBranding } from './types';
import { treazerBranding } from '../demos/treazer/_shared/branding';

/** projectId → 브랜딩. 새 서비스는 여기에 한 줄 추가 + 자기 branding 컴포넌트만 만들면 된다. */
const BRANDING: Record<string, ProjectBranding> = {
  treazer: treazerBranding,
};

/** 프로젝트의 인트로/아웃트로 브랜딩 (없으면 undefined → 토글 미노출) */
export function getBranding(projectId: string | undefined): ProjectBranding | undefined {
  return projectId ? BRANDING[projectId] : undefined;
}

export type { ProjectBranding };
