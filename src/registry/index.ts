import type { FeatureDefinition } from './types';

/**
 * demos/<name>/index.ts 자동 수집.
 * 새 데모는 폴더 추가 + FeatureDefinition default export만 하면 갤러리에 등장한다.
 */
const modules = import.meta.glob('../demos/*/index.ts', { eager: true }) as Record<
  string,
  { default: FeatureDefinition }
>;

export const features: FeatureDefinition[] = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean);

export function getFeature(id: string): FeatureDefinition | undefined {
  return features.find((f) => f.id === id);
}
