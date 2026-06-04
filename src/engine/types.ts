/** 자동 재생 시나리오의 한 스텝. 시나리오 파일이 데모 store를 직접 클로저로 잡아 type-safe하게 정의한다. */
export type Step =
  /** 지정 시간 대기 */
  | { kind: 'wait'; ms: number }
  /** data-demo-id 요소로 가짜 커서 이동 */
  | { kind: 'cursor'; target: string; ms?: number }
  /** 커서 이동 + 클릭 펄스 + store action 실행 */
  | { kind: 'click'; target: string; run?: () => void }
  /** 한 글자씩 타이핑 시뮬레이션 (store setter 호출) */
  | { kind: 'type'; target?: string; text: string; cps?: number; set: (value: string) => void }
  /** LLM 응답처럼 청크 단위 스트리밍 (store append 호출) */
  | { kind: 'stream'; text: string; cps?: number; append: (chunk: string) => void }
  /** 임의 store 조작 */
  | { kind: 'do'; run: () => void };

export interface Scenario {
  id: string;
  steps: Step[];
}
