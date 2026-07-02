export type Lang = 'ko' | 'en';
/** 의역된 각 언어 원문 — 직역이 아니라 언어별로 자연스럽게 작성한다 */
export type LangText = Record<Lang, string>;

export type Tone = 'up' | 'down' | 'gold' | 'cyan' | 'neutral';

/** 게시용 본문 — 단일 문자열(언어 무관) 또는 언어별 본문(한/영 토글에 따라 전환) */
export type Caption = string | LangText;

export interface ContrastBox {
  label: LangText;
  text: LangText;
  tone: Tone;
}

export interface StatItem {
  label: LangText;
  /** 언어 중립 수치 문자열. 양 언어에서 동일 값 보장 */
  value: string;
  tone?: Tone;
}

export type ChartSpec =
  | {
      kind: 'divergenceBar';
      rows: { name: LangText; value: string; pct: number; tone: Tone }[];
    }
  | { kind: 'areaSpark'; points: number[]; tone: 'up' | 'down' }
  | { kind: 'donut'; segments: { label: LangText; weight: number; tone: Tone }[] }
  | { kind: 'statChips'; items: StatItem[] };

export type Slide =
  | { type: 'cover'; eyebrow: LangText; headline: LangText; tag: LangText; chart?: ChartSpec }
  | { type: 'thesis'; eyebrow: LangText; headline: LangText; body: LangText }
  | { type: 'contrast'; eyebrow: LangText; headline?: LangText; left: ContrastBox; right: ContrastBox }
  | { type: 'data'; eyebrow: LangText; headline: LangText; chart: ChartSpec; note?: LangText }
  | { type: 'context'; eyebrow: LangText; headline: LangText; stats: StatItem[]; note?: LangText }
  | { type: 'action'; eyebrow: LangText; headline: LangText; chart?: ChartSpec; note?: LangText }
  | { type: 'list'; eyebrow: LangText; headline?: LangText; items: LangText[]; note?: LangText }
  | { type: 'cta'; eyebrow: LangText; headline: LangText; body: LangText; url?: string };

/* ─────────────────────────── macro 테마 (AlphaLenz Macro · 영어 전용) ───────────────────────────
   .dc.html 핸드오프를 충실히 재현하는 전용 슬라이드 모델. research 테마와 별개 union. */
export type MacroTone = 'pos' | 'neg' | 'warn' | 'mint';
/** 인라인 강조용 리치 텍스트 — 문자열은 본문, 객체는 강조(색/볼드) */
export type RichSeg = string | { t: string; tone?: MacroTone | 'white' };
export type Rich = RichSeg[];

export type MacroViz =
  | { kind: 'bar'; pct: number; tone: MacroTone; marker?: 'center' | 'end'; from?: number }
  | { kind: 'bars'; heights: number[]; tone: MacroTone };

export interface MacroMetric {
  code: string; status: string; statusTone: MacroTone;
  value: string; caption: string; viz: MacroViz;
}

export type MacroSlide =
  | { type: 'm-cover'; kicker: string; title: string; subtitle: string;
      signals: { side: 'SHORT' | 'LONG'; ticker: string; tone: 'neg' | 'pos' }[];
      conviction: number; max: number; convLabel: string; regime: string }
  | { type: 'm-call'; idx: string; title: string; subtitle: string;
      cards: { tone: 'neg' | 'pos'; arrow: string; tag: string; headline: string; desc: string }[];
      conviction: number; max: number; convText: string }
  | { type: 'm-narrative'; idx: string; title: string;
      narrative: Rich; reality: Rich; verdict: Rich }
  | { type: 'm-data'; idx: string; title: string; source: string; metrics: MacroMetric[] }
  | { type: 'm-tensions'; idx: string; title: string;
      items: { n: string; text: Rich; tags: string[] }[] }
  | { type: 'm-plan'; idx: string; title: string;
      action: string; invalidation: string; risks: { tag: string; text: string }[] }
  | { type: 'm-cta'; idx: string; title: string; subtitle: string;
      score: string; breakdown: { label: string; value: string; tone?: MacroTone }[];
      ctaTitle: string; url: string; disclaimer: string }
  /* ── 에이전트 라이브러리 쇼케이스 전용 (앵글 리포트 아님) ── */
  /** 라이브러리 커버 — 히어로 타이틀 + 하단 스탯 스트립(에이전트 수·카테고리 수 등) */
  | { type: 'm-libcover'; kicker: string; title: string; subtitle: string;
      stats: { value: string; label: string }[] }
  /** 라이브러리 개요 그리드 — 카테고리별 에이전트를 한 화면에 (칩 = 이름만) */
  | { type: 'm-library'; idx: string; title: string; subtitle: string;
      groups: { name: string; agents: string[] }[] }
  /** 카테고리 카드 — 카테고리 1개 + 에이전트 다수(이름 + 한 줄 설명) */
  | { type: 'm-category'; idx: string; category: string; tagline: string;
      agents: { name: string; desc: string }[] }
  /** 라이브러리 마무리 CTA — 스탯 스트립 + 브랜드 CTA */
  | { type: 'm-libcta'; idx: string; title: string; subtitle: string;
      stats: { value: string; label: string }[];
      ctaTitle: string; url: string; disclaimer: string }
  /** 트위터/X용 가로 16:9 단일 카드 — 좌 히어로(콜) + 우 데이터 그리드 종합 */
  | { type: 'm-twitter'; kicker: string; title: string; subtitle: string;
      signals: { side: 'SHORT' | 'LONG'; ticker: string; tone: 'neg' | 'pos' }[];
      conviction: number; max: number; convLabel: string; regime: string;
      metrics: MacroMetric[]; verdict: Rich; url: string; disclaimer: string };

export type ThemeId = 'research' | 'macro';
export type AnySlide = Slide | MacroSlide;

/** 한 주제(덱)의 플랫폼별 버전 — 링크드인/트위터처럼 비율·슬라이드·캡션이 다른 산출물 */
export interface DeckVariant {
  /** 파일명·식별용 슬러그 (예: 'linkedin' | 'x') */
  id: string;
  /** 뷰어 토글에 표시할 라벨 (예: 'LinkedIn' | 'X') */
  label: string;
  /** 미지정 시 덱 기본값 사용 */
  width?: number;
  height?: number;
  /** 게시용 본문 — 미지정 시 덱 caption */
  caption?: Caption;
  slides: AnySlide[];
}

export interface CardNewsDeck {
  id: string;
  project: string;
  title: LangText;
  source?: string;
  date: string;
  accent?: string;
  /** 기본 'research'(정사각). 'macro'는 세로 1080×1350 핀테크 테마 */
  theme?: ThemeId;
  /** 슬라이드 픽셀 크기. 기본 1080×1080 */
  width?: number;
  height?: number;
  /** 게시용 본문(링크드인 캡션 등) — 뷰어에서 확인·복사. 언어별 본문은 LangText로 */
  caption?: Caption;
  /** 단일 플랫폼 덱. variants를 쓰면 생략 */
  slides?: AnySlide[];
  /** 멀티 플랫폼(링크드인+트위터 등). 있으면 뷰어가 플랫폼 토글을 노출 */
  variants?: DeckVariant[];
}

/** 정규화된 단일 플랫폼 단위 — 비율/캡션/슬라이드가 항상 채워짐 */
export interface ResolvedVariant {
  id: string;
  label: string;
  width: number;
  height: number;
  caption?: Caption;
  slides: AnySlide[];
}

/** 덱을 항상 variant 배열로 정규화. 단일 덱(slides)은 라벨 없는 단일 variant로 감싼다(하위호환) */
export function getVariants(deck: CardNewsDeck): ResolvedVariant[] {
  const w = deck.width ?? 1080;
  const h = deck.height ?? 1080;
  if (deck.variants?.length) {
    return deck.variants.map((v) => ({
      id: v.id,
      label: v.label,
      width: v.width ?? w,
      height: v.height ?? h,
      caption: v.caption ?? deck.caption,
      slides: v.slides,
    }));
  }
  return [{ id: 'default', label: '', width: w, height: h, caption: deck.caption, slides: deck.slides ?? [] }];
}
