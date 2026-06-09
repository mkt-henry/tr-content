import type { L, Lang } from '../_shared/i18n';

/** 상단 KPI 카드 — finance-dashboard Kpi 구조 차용 */
export interface Kpi {
  id: string;
  label: L;
  value: number;
  unit: L;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta: L;
  positive: boolean;
}

export const KPIS: Kpi[] = [
  {
    id: 'coverage',
    label: { ko: '커버리지', en: 'Coverage' },
    value: 3000,
    unit: { ko: '+ 상장기업', en: '+ listed cos.' },
    delta: { ko: 'KRX·US·JP', en: 'KRX·US·JP' },
    positive: true,
  },
  {
    id: 'exchanges',
    label: { ko: '연동 거래소', en: 'Exchanges' },
    value: 4,
    unit: { ko: '곳', en: '' },
    delta: { ko: 'KRX·NYSE·NASDAQ·JPX', en: 'KRX·NYSE·NASDAQ·JPX' },
    positive: true,
  },
  {
    id: 'daily',
    label: { ko: '일일 수집 건수', en: 'Daily ingested' },
    value: 23450,
    unit: { ko: '건/일', en: '/day' },
    delta: { ko: '+8.4% WoW', en: '+8.4% WoW' },
    positive: true,
  },
  {
    id: 'accuracy',
    label: { ko: '검증 정확도', en: 'Validation accuracy' },
    value: 99.4,
    unit: { ko: '%', en: '%' },
    decimals: 1,
    delta: { ko: '교차검증 통과', en: 'cross-checked' },
    positive: true,
  },
];

/** 소스별 실시간 수집 패널 한 행 */
export interface Source {
  id: string;
  name: L;
  type: L;
  /** 일일 볼륨/규모 (CountUp 대상) */
  volume: number;
  unit: L;
  decimals?: number;
  /** 패널 진행 바 채움 비율 (0..100) */
  fill: number;
  color: string;
}

export const SOURCES: Source[] = [
  {
    id: 'dart',
    name: { ko: 'DART 공시', en: 'DART filings' },
    type: { ko: '국내 공시', en: 'KR disclosures' },
    volume: 2847,
    unit: { ko: '건/일', en: '/day' },
    fill: 92,
    color: '#7c5cff',
  },
  {
    id: 'sec',
    name: { ko: 'SEC EDGAR', en: 'SEC EDGAR' },
    type: { ko: '미국 공시', en: 'US filings' },
    volume: 1203,
    unit: { ko: '건/일', en: '/day' },
    fill: 78,
    color: '#a78bfa',
  },
  {
    id: 'reports',
    name: { ko: '증권사 리포트', en: 'Broker reports' },
    type: { ko: '임베딩', en: 'Embeddings' },
    volume: 15000,
    unit: { ko: '+ 임베딩', en: '+ embedded' },
    fill: 88,
    color: '#22d3ee',
  },
  {
    id: 'news',
    name: { ko: '뉴스', en: 'News feed' },
    type: { ko: '실시간 스트림', en: 'Live stream' },
    volume: 4200,
    unit: { ko: '건/일', en: '/day' },
    fill: 71,
    color: '#38bdf8',
  },
  {
    id: 'fred',
    name: { ko: 'FRED 매크로', en: 'FRED macro' },
    type: { ko: '경제지표', en: 'Indicators' },
    volume: 98,
    unit: { ko: '지표', en: 'series' },
    fill: 64,
    color: '#818cf8',
  },
];

/** 검증 파이프라인 단계 */
export interface PipelineStage {
  id: string;
  label: L;
  count: number;
  color: string;
}

/** 추출 → 정규화 → 교차검증 → 임베딩 (누적 비율 바 + 단계별 건수) */
export const PIPELINE: PipelineStage[] = [
  { id: 'extract', label: { ko: '추출', en: 'Extract' }, count: 23450, color: '#38bdf8' },
  { id: 'normalize', label: { ko: '정규화', en: 'Normalize' }, count: 22980, color: '#22d3ee' },
  { id: 'crosscheck', label: { ko: '교차검증', en: 'Cross-check' }, count: 22310, color: '#a78bfa' },
  { id: 'embed', label: { ko: '임베딩', en: 'Embed' }, count: 21870, color: '#7c5cff' },
];

/** Fin-RATE 벤치마크 항목 */
export interface BenchMetric {
  id: string;
  label: L;
}

export const BENCH_METRICS: BenchMetric[] = [
  { id: 'freshness', label: { ko: '신선도', en: 'Freshness' } },
  { id: 'precision', label: { ko: '정밀도', en: 'Precision' } },
  { id: 'crosscheck', label: { ko: '교차검증', en: 'Cross-check' } },
];

/** 벤치마크 모델 — A7Z가 퍼플(강조), 경쟁사는 회색 */
export interface BenchModel {
  id: string;
  name: string;
  /** BENCH_METRICS 순서대로의 점수 (0..100) */
  scores: number[];
  color: string;
  /** AlphaLenz 자사 모델 여부 */
  primary: boolean;
}

export const BENCH_MODELS: BenchModel[] = [
  { id: 'a7z', name: 'Treasurer A7Z', scores: [97, 96, 98], color: '#7c5cff', primary: true },
  { id: 'gpt', name: 'GPT', scores: [78, 81, 74], color: '#52525b', primary: false },
  { id: 'gemini', name: 'Gemini 3.1 Pro', scores: [82, 79, 77], color: '#71717a', primary: false },
];

/** UI 문자열 */
export const STR = {
  search: { ko: '소스·종목·지표를 검색…', en: 'Search sources, tickers, indicators…' },
  pageTitle: { ko: '데이터 정확성 파이프라인', en: 'Data accuracy pipeline' },
  pageSubtitle: {
    ko: '공시·리포트·뉴스를 실시간 수집하고 다단계로 교차 검증합니다',
    en: 'Real-time ingestion of filings, reports, and news with multi-stage cross-validation',
  },
  mobileSubtitle: { ko: 'AlphaLenz · 실시간 검증', en: 'AlphaLenz · live validation' },
  loadData: { ko: '데이터 수집 시작', en: 'Start data ingestion' },
  // 소스 패널
  sourcesTitle: { ko: '소스별 실시간 수집', en: 'Live ingestion by source' },
  liveBadge: { ko: '실시간', en: 'Live' },
  // 파이프라인
  pipelineTitle: { ko: '검증 파이프라인', en: 'Validation pipeline' },
  pipelineNote: { ko: '추출 → 정규화 → 교차검증 → 임베딩', en: 'Extract → Normalize → Cross-check → Embed' },
  // 벤치마크
  benchTitle: { ko: 'Fin-RATE 벤치마크', en: 'Fin-RATE benchmark' },
  benchNote: { ko: '재무 데이터 정확도 · 100점 만점', en: 'Financial data accuracy · out of 100' },
  benchCaption: {
    ko: 'Treasurer A7Z가 신선도·정밀도·교차검증 전 항목에서 우위',
    en: 'Treasurer A7Z leads on freshness, precision, and cross-check',
  },
} satisfies Record<string, L>;

/** '총 {n}건' 표기 */
export function totalLabel(n: number, lang: Lang): string {
  return lang === 'ko' ? `총 ${n.toLocaleString()}건/일` : `${n.toLocaleString()}/day`;
}
