/**
 * src/assets/<projectId>/ 아래 이미지 자동 수집.
 * 파일을 넣기만 하면 갤러리의 '참고 에셋' 뷰어에 등장하고,
 * 데모에서는 직접 import해서 배경/소재로 사용한다.
 */
export interface ProjectAsset {
  /** 파일명 (확장자 포함) */
  name: string;
  /** 번들된 이미지 URL */
  url: string;
}

const modules = import.meta.glob('../assets/*/*.{png,jpg,jpeg,webp,gif,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const assetsByProject = new Map<string, ProjectAsset[]>();

for (const [path, url] of Object.entries(modules)) {
  // '../assets/aria/foo.png' → ['..', 'assets', 'aria', 'foo.png']
  const parts = path.split('/');
  const projectId = parts[2];
  const name = parts[3];
  const list = assetsByProject.get(projectId) ?? [];
  list.push({ name, url });
  assetsByProject.set(projectId, list);
}

export function getAssetsByProject(projectId: string): ProjectAsset[] {
  return assetsByProject.get(projectId) ?? [];
}
