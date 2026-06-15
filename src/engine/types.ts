/** 스텝 텍스트 — 함수면 실행 시점에 평가된다 (프로젝트 언어 등 런타임 상태 반영용) */
export type StepText = string | (() => string);

/** 자동 재생 시나리오의 한 스텝. 시나리오 파일이 데모 store를 직접 클로저로 잡아 type-safe하게 정의한다. */
export type Step =
  /** 지정 시간 대기 */
  | { kind: 'wait'; ms: number }
  /** data-demo-id 요소로 가짜 커서 이동. zoom:true면 카메라가 이 대상으로 줌인(핵심 강조용) */
  | { kind: 'cursor'; target: string; ms?: number; zoom?: boolean }
  /** 커서 이동 + 클릭 펄스 + store action 실행. zoom:true면 줌인 */
  | { kind: 'click'; target: string; run?: () => void; zoom?: boolean }
  /** 한 글자씩 타이핑 시뮬레이션 (store setter 호출). zoom:true면 줌인 */
  | { kind: 'type'; target?: string; text: StepText; cps?: number; set: (value: string) => void; zoom?: boolean }
  /** LLM 응답처럼 청크 단위 스트리밍 (store append 호출) */
  | { kind: 'stream'; text: StepText; cps?: number; append: (chunk: string) => void }
  /** 스크롤 컨테이너(data-demo-id)를 위/아래 또는 특정 자식(toId)으로 부드럽게 스크롤. 검토 플로우용. */
  | { kind: 'scroll'; target: string; to?: 'top' | 'bottom'; toId?: string; ms?: number }
  /** 임의 store 조작 */
  | { kind: 'do'; run: () => void };

export interface Scenario {
  id: string;
  steps: Step[];
}
