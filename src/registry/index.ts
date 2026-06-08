import type { FeatureDefinition } from './types';

export { projects, getProject } from './projects';

/**
 * demos/<project>/<name>/index.ts 자동 수집.
 * 새 데모는 프로젝트 폴더 아래 폴더 추가 + FeatureDefinition default export만 하면 갤러리에 등장한다.
 */
const modules = import.meta.glob('../demos/*/*/index.ts', { eager: true }) as Record<
  string,
  { default: FeatureDefinition }
>;

/** '../demos/aria/ai-chat/index.ts' → 'aria' */
function projectIdFromPath(path: string): string {
  return path.split('/')[2];
}

const featuresByProject = new Map<string, FeatureDefinition[]>();

for (const [path, mod] of Object.entries(modules)) {
  if (!mod.default) continue;
  const projectId = projectIdFromPath(path);
  const list = featuresByProject.get(projectId) ?? [];
  list.push(mod.default);
  featuresByProject.set(projectId, list);
}

export const features: FeatureDefinition[] = [...featuresByProject.values()].flat();

export function getFeaturesByProject(projectId: string): FeatureDefinition[] {
  return featuresByProject.get(projectId) ?? [];
}

export function getFeature(id: string): FeatureDefinition | undefined {
  return features.find((f) => f.id === id);
}

/** 기능이 속한 프로젝트 id — 폴더 구조(demos/<project>/<name>)에서 유래 */
export function getProjectIdOfFeature(featureId: string): string | undefined {
  for (const [projectId, list] of featuresByProject) {
    if (list.some((f) => f.id === featureId)) return projectId;
  }
  return undefined;
}
