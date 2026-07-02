import type { CardNewsDeck, Lang, LangText, Slide } from './types';

/** 카피 글자수 예산 상한 (언어별) */
export const BUDGET = {
  eyebrow: { ko: 16, en: 28 },
  headline: { ko: 22, en: 42 },
  body: { ko: 95, en: 160 },
  contrast: { ko: 40, en: 72 },
  list: { ko: 30, en: 55 },
} as const;

const LANGS: Lang[] = ['ko', 'en'];

function over(field: LangText, max: { ko: number; en: number }): string[] {
  const out: string[] = [];
  for (const l of LANGS) {
    if (!field[l]) {
      out.push(`${l} 번역 누락`);
      continue;
    }
    const len = field[l].replace(/\n/g, '').length;
    if (len > max[l]) out.push(`${l} ${len}/${max[l]}자 초과: "${field[l]}"`);
  }
  return out;
}

/** dev 경고용 — 예산 초과 필드 메시지 목록 반환 */
export function lintDeck(deck: CardNewsDeck): string[] {
  // research 테마 전용 카피 예산 검사 — 다른 테마(macro 등)는 자체 레이아웃이라 건너뜀
  if ((deck.theme ?? 'research') !== 'research') return [];
  const w: string[] = [];
  const slides = (deck.slides ?? []) as Extract<Slide, { eyebrow: unknown }>[];
  slides.forEach((s, i) => {
    const p = `slide ${i + 1} (${s.type})`;
    over(s.eyebrow, BUDGET.eyebrow).forEach((m) => w.push(`${p} eyebrow — ${m}`));
    if (s.headline) over(s.headline, BUDGET.headline).forEach((m) => w.push(`${p} headline — ${m}`));
    if ('body' in s && s.body) over(s.body, BUDGET.body).forEach((m) => w.push(`${p} body — ${m}`));
    if ('note' in s && s.note) over(s.note, BUDGET.body).forEach((m) => w.push(`${p} note — ${m}`));
    if (s.type === 'contrast') {
      over(s.left.text, BUDGET.contrast).forEach((m) => w.push(`${p} left — ${m}`));
      over(s.right.text, BUDGET.contrast).forEach((m) => w.push(`${p} right — ${m}`));
    }
    if (s.type === 'list') s.items.forEach((it, j) => over(it, BUDGET.list).forEach((m) => w.push(`${p} item ${j + 1} — ${m}`)));
  });
  return w;
}
