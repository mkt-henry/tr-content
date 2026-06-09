import type { L } from '../_shared/i18n';

/** 워커 그룹 — Orchestrator가 작업을 분배하는 도메인별 전문 팀 */
export interface WorkerGroup {
  id: string;
  label: L;
  /** 그룹 대표 색 (노드/엣지) */
  color: string;
  /** 그룹에 속한 서브 에이전트 라벨 */
  subs: L[];
  /** 노드 배치용 가로 위치 비율 (0~1, 그래프 영역 기준) */
  x: number;
}

/** 그래프 색 팔레트 — Orchestrator=퍼플, 그룹별 액센트 */
export const ORCHESTRATOR_COLOR = '#a855f7';

/**
 * 5개 워커 그룹. 합계 서브 에이전트 = 4+3+3+3+3 = 16개를 노드로 보여주고,
 * 실제 병렬 에이전트 수(48개)는 CountUp 카운터로 강조한다.
 */
export const GROUPS: WorkerGroup[] = [
  {
    id: 'fundamentals',
    label: { ko: '펀더멘털', en: 'Fundamentals' },
    color: '#8b5cf6', // violet
    x: 0.1,
    subs: [
      { ko: '재무제표', en: 'Financials' },
      { ko: '컨센서스', en: 'Consensus' },
      { ko: '리서치', en: 'Research' },
      { ko: '스크리너', en: 'Screener' },
    ],
  },
  {
    id: 'technical',
    label: { ko: '테크니컬', en: 'Technical' },
    color: '#22d3ee', // cyan
    x: 0.3,
    subs: [
      { ko: '추세·모멘텀', en: 'Trend / Momentum' },
      { ko: '거래량', en: 'Volume' },
      { ko: '변동성', en: 'Volatility' },
    ],
  },
  {
    id: 'market',
    label: { ko: '시장 흐름', en: 'Market' },
    color: '#f59e0b', // amber
    x: 0.5,
    subs: [
      { ko: '섹터 로테이션', en: 'Sector Rotation' },
      { ko: '수급', en: 'Flows' },
      { ko: '매크로', en: 'Macro' },
    ],
  },
  {
    id: 'strategy',
    label: { ko: '전략', en: 'Strategy' },
    color: '#34d399', // emerald
    x: 0.7,
    subs: [
      { ko: '밸류에이션', en: 'Valuation' },
      { ko: '리스크', en: 'Risk' },
      { ko: '타이밍', en: 'Timing' },
    ],
  },
  {
    id: 'intelligence',
    label: { ko: '인텔리전스', en: 'Intelligence' },
    color: '#e879f9', // fuchsia
    x: 0.9,
    subs: [
      { ko: '뉴스·공시', en: 'News / Filings' },
      { ko: '감성', en: 'Sentiment' },
      { ko: '대체데이터', en: 'Alt Data' },
    ],
  },
];

/** 병렬로 도는 전체 에이전트 수 — CountUp 타깃 */
export const AGENT_COUNT = 48;

/** 최종 신뢰도 (%) */
export const CONFIDENCE = 92;

/** 사용자 질문 */
export const QUESTION: L = {
  ko: '삼성전자, 지금 매수 타이밍이야?',
  en: 'Samsung Electronics — is now the time to buy?',
};

/** 단계별 로그 (오케스트레이터 협업 소구) */
export const LOGS_ORCHESTRATE: L<string>[] = [
  { ko: 'Orchestrator가 질문을 5개 도메인으로 분해했습니다.', en: 'Orchestrator decomposed the query into 5 domains.' },
  { ko: '16개 전문 에이전트에 작업을 라우팅합니다.', en: 'Routing tasks to 16 specialist agents.' },
  { ko: '펀더멘털 · 테크니컬 분석을 병렬 실행 중…', en: 'Running Fundamentals & Technical in parallel…' },
  { ko: '시장 흐름 · 전략 · 인텔리전스 분석 완료.', en: 'Market, Strategy & Intelligence analysis complete.' },
  { ko: '에이전트 간 결과를 교차 검증합니다.', en: 'Cross-verifying results across agents.' },
  { ko: '상충 신호 1건 발견 → 근거 재확인 후 해소.', en: 'Found 1 conflicting signal → resolved after re-grounding.' },
  { ko: 'Orchestrator가 최종 인사이트를 합성했습니다.', en: 'Orchestrator synthesized the final insight.' },
];

/** 단계별 로그 (48개 병렬 처리 규모 소구) */
export const LOGS_PARALLEL: L<string>[] = [
  { ko: '질문을 48개 분석 잡으로 팬아웃합니다.', en: 'Fanning the query out to 48 analysis jobs.' },
  { ko: '48개 에이전트가 동시에 가동되었습니다.', en: '48 agents spun up simultaneously.' },
  { ko: 'RAG + 구조화 데이터 하이브리드로 근거 수집 중…', en: 'Gathering evidence via RAG + structured data hybrid…' },
  { ko: '평균 응답 1.8초 — 16개 노드에서 결과 수렴.', en: 'Avg latency 1.8s — results converging across 16 nodes.' },
  { ko: '48개 결과를 교차 검증해 환각을 걸러냅니다.', en: 'Cross-verifying 48 results to filter hallucinations.' },
  { ko: '합의 임계치 통과 — 신뢰도 92%.', en: 'Consensus threshold passed — 92% confidence.' },
  { ko: '단일 인사이트로 합성 완료.', en: 'Synthesized into a single insight.' },
];

/** 최종 인사이트 카드 본문 */
export const INSIGHT: L = {
  ko: '단기 분할 매수 적합. 펀더멘털·수급은 우호적이나 테크니컬은 단기 과열 구간 — 1차 매수 후 조정 시 추가 분할을 권장합니다.',
  en: 'Suitable for staged accumulation. Fundamentals and flows are favorable, but technicals are near-term overbought — buy a first tranche and add on pullbacks.',
};

/** 인사이트 카드 헤드라인 (결론) */
export const INSIGHT_VERDICT: L = {
  ko: '분할 매수 권장',
  en: 'Staged Buy',
};

/** UI 문자열 */
export const STR = {
  search: { ko: '종목·전략·키워드 검색', en: 'Search tickers, strategies, keywords' } satisfies L,
  question: { ko: '사용자 질문', en: 'User question' } satisfies L,
  run: { ko: '분석 시작', en: 'Run analysis' } satisfies L,
  running: { ko: '분석 중…', en: 'Analyzing…' } satisfies L,
  orchestrator: { ko: 'Orchestrator', en: 'Orchestrator' } satisfies L,
  agentsActive: { ko: '병렬 에이전트', en: 'Parallel agents' } satisfies L,
  logTitle: { ko: '추론 진행', en: 'Reasoning trace' } satisfies L,
  verified: { ko: '교차검증 통과', en: 'Cross-verified' } satisfies L,
  confidence: { ko: '신뢰도', en: 'Confidence' } satisfies L,
  insightTitle: { ko: '최종 인사이트', en: 'Final insight' } satisfies L,
  tagline: {
    ko: '환각 최소화 · RAG + 구조화 데이터 하이브리드',
    en: 'Hallucination-minimized · RAG + structured-data hybrid',
  } satisfies L,
  working: { ko: '분석중', en: 'Working' } satisfies L,
  done: { ko: '완료', en: 'Done' } satisfies L,
};
