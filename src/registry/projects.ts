/** 프로젝트 = 갤러리 탭 하나. 데모는 src/demos/<projectId>/ 아래에 위치 */
export interface ProjectDefinition {
  id: string;
  name: string;
  /** 헤더 타이틀 옆 서브타이틀 */
  tagline: string;
  /** 헤더 아래 한 줄 설명 */
  description: string;
}

export const projects: ProjectDefinition[] = [
  {
    id: 'aria',
    name: 'ARIA',
    tagline: 'Reinsurance Intelligence',
    description:
      '재보험 중개 AI 에이전트 ARIA의 데모 스튜디오 — 기능과 소구점을 고르고, 자동 재생을 켜고, 화면을 녹화하세요. 모든 데모는 더미 데이터로 실제처럼 동작합니다.',
  },
  {
    id: 'treasurer',
    name: 'Treasurer',
    tagline: '',
    description: '데모 준비 중입니다.',
  },
  {
    id: 'treazer',
    name: 'Treazer',
    tagline: 'Learn & Earn Gold',
    description:
      '경제 퀴즈를 풀면 실제 금에 연동된 골드가 쌓이는 리워드 앱 — 출석·미션·스토어로 이어지는 데일리 루프를 데모로 확인하세요. 모든 데모는 더미 데이터로 실제처럼 동작합니다.',
  },
  {
    id: 'findle',
    name: 'Findle',
    tagline: '',
    description: '데모 준비 중입니다.',
  },
  {
    id: 'alphalenz',
    name: 'AlphaLenz',
    tagline: '',
    description: '데모 준비 중입니다.',
  },
];

export function getProject(id: string): ProjectDefinition | undefined {
  return projects.find((p) => p.id === id);
}
