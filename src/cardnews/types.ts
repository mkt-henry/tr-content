export type Lang = 'ko' | 'en';
/** 의역된 각 언어 원문 — 직역이 아니라 언어별로 자연스럽게 작성한다 */
export type LangText = Record<Lang, string>;

export type Tone = 'up' | 'down' | 'gold' | 'cyan' | 'neutral';

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
      ctaTitle: string; url: string; disclaimer: string };

export type ThemeId = 'research' | 'macro';
export type AnySlide = Slide | MacroSlide;

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
  /** 게시용 본문(링크드인 캡션 등) — 뷰어에서 확인·복사 */
  caption?: string;
  slides: AnySlide[];
}
