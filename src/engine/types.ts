/** 스텝 텍스트 — 함수면 실행 시점에 평가된다 (프로젝트 언어 등 런타임 상태 반영용) */
export type StepText = string | (() => string);

/** 자동 재생 시나리오의 한 스텝. 시나리오 파일이 데모 store를 직접 클로저로 잡아 type-safe하게 정의한다. */
export type Step =
  /** 지정 시간 대기 */
  | { kind: 'wait'; ms: number }
  /** check()가 true가 될 때까지(또는 timeoutMs까지) 대기. 비동기 store 상태(로딩 등)에 동기화할 때. */
  | { kind: 'waitFor'; check: () => boolean; timeoutMs?: number }
  /** data-demo-id 요소로 가짜 커서 이동. zoom:true면 카메라가 이 대상으로 줌인(핵심 강조). zoomScale로 배율 오버라이드(기본 CAMERA_ZOOM). caption은 zoom 시 함께 표시할 액션 라벨. spotlight를 주면 줌 원점을 그 요소에 고정(화면 정지)하고 커서만 target으로 이동. */
  | { kind: 'cursor'; target: string; ms?: number; zoom?: boolean; zoomScale?: number; caption?: StepText; spotlight?: string }
  /** 커서 이동 + 클릭 펄스 + store action 실행. zoom:true면 줌인. zoomScale로 배율 오버라이드(기본 CAMERA_ZOOM). caption은 zoom 시 함께 표시할 액션 라벨. spotlight를 주면 줌 원점을 그 요소에 고정하고 커서만 target으로 이동. */
  | { kind: 'click'; target: string; run?: () => void; zoom?: boolean; zoomScale?: number; caption?: StepText; spotlight?: string }
  /** 한 글자씩 타이핑 시뮬레이션 (store setter 호출). zoom:true면 줌인. zoomScale로 배율 오버라이드(기본 CAMERA_ZOOM). */
  | { kind: 'type'; target?: string; text: StepText; cps?: number; set: (value: string) => void; zoom?: boolean; zoomScale?: number }
  /** LLM 응답처럼 청크 단위 스트리밍 (store append 호출) */
  | { kind: 'stream'; text: StepText; cps?: number; append: (chunk: string) => void }
  /** 스크롤 컨테이너(data-demo-id)를 위/아래 또는 특정 자식(toId)으로 부드럽게 스크롤. 검토 플로우용.
   *  keepZoom:true면 현재 줌(spotlight)을 유지 — 확대 상태에서 리스트만 스크롤할 때. (기본은 줌 해제) */
  | { kind: 'scroll'; target: string; to?: 'top' | 'bottom'; toId?: string; ms?: number; keepZoom?: boolean }
  /** 임의 store 조작 */
  | { kind: 'do'; run: () => void };

export interface Scenario {
  id: string;
  steps: Step[];
}
