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

export interface CardNewsDeck {
  id: string;
  project: string;
  title: LangText;
  source?: string;
  date: string;
  accent?: string;
  slides: Slide[];
}
