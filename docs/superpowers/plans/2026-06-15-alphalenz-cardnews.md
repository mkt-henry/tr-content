# AlphaLenz 카드뉴스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AlphaLenz 갤러리에 `영상 / 카드뉴스` 토글을 추가하고, 링크 기반으로 제작한 한/영 1:1 슬라이드 덱을 보고 PNG·PDF로 내보내는 카드뉴스 영역을 구축한다.

**Architecture:** 카드뉴스는 데이터 중심 모듈(`src/cardnews/<project>/<slug>/deck.ts`)을 glob 자동 수집한다. 뷰어 UI(`src/shell/cardnews/`)는 영상 녹화 엔진과 독립적으로, 슬라이드를 1080px 고정으로 렌더하고 화면에선 CSS 스케일로 축소 표시한다. 내보내기는 1080px 원본 노드를 `html-to-image`로 캡처한다.

**Tech Stack:** React 18 + TypeScript + Vite, Zustand, Tailwind v4, 신규 의존성 `html-to-image`·`jspdf`. 차트는 고정 크기·고해상도 PNG 추출 안정성을 위해 경량 SVG/div로 구현(프로젝트의 Recharts는 그대로 유지).

**테스트 접근:** 이 저장소는 테스트 러너가 없고 기존 데모도 무테스트다. 각 태스크 검증은 `npm run build`(= `tsc --noEmit && vite build`)와 `npm run dev` 브라우저 확인으로 한다. 카피 글자수 예산은 dev 콘솔 경고(`lintDeck`)로 가드한다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/store/shellStore.ts` (수정) | `galleryMode`(프로젝트별), `cardnewsId` 라우팅 상태 |
| `src/cardnews/types.ts` (생성) | `CardNewsDeck`/`Slide`/`ChartSpec`/`LangText` 타입 |
| `src/cardnews/registry.ts` (생성) | `deck.ts` glob 수집, `getDecksByProject`/`getDeck`/`hasCardnews` |
| `src/cardnews/budget.ts` (생성) | 글자수 예산 표 + `lintDeck` dev 경고 |
| `src/shell/cardnews/charts.tsx` (생성) | `DivergenceBar`/`AreaSpark`/`Donut`/`StatChips` SVG 차트 |
| `src/shell/cardnews/Slide.tsx` (생성) | 슬라이드 타입별 1080px 렌더 + `ScaledSlide` 래퍼 |
| `src/shell/cardnews/CardNewsGallery.tsx` (생성) | 토글 ON일 때 덱 카드 그리드 |
| `src/shell/cardnews/CardNewsViewer.tsx` (생성) | 1:1 뷰어(이전/다음·언어 토글·내보내기) |
| `src/shell/cardnews/export.ts` (생성) | PNG(단건/일괄)·PDF 내보내기 |
| `src/shell/Gallery.tsx` (수정) | 세그먼트 토글 + 모드 분기 |
| `src/App.tsx` (수정) | `cardnewsId` 라우팅 |
| `src/cardnews/alphalenz/btc-riskoff-2026-06-13/deck.ts` (생성) | 비트코인 덱(ko/en) |
| `docs/cardnews/authoring-guide.md` (생성) | 제작 지침 정본 |

---

## Task 1: shellStore 라우팅 상태

**Files:**
- Modify: `src/store/shellStore.ts`

- [ ] **Step 1: galleryMode·cardnews 상태 추가**

`ShellState` 인터페이스에 추가:

```ts
  /** 프로젝트별 갤러리 모드 — 'video'(기본) | 'cardnews' */
  galleryMode: Record<string, 'video' | 'cardnews'>;
  setGalleryMode: (projectId: string, mode: 'video' | 'cardnews') => void;
  /** null이 아니면 카드뉴스 뷰어 화면 */
  cardnewsId: string | null;
  openCardnews: (deckId: string) => void;
```

`create<ShellState>` 초기값/액션에 추가:

```ts
  galleryMode: {},
  cardnewsId: null,
  setGalleryMode: (projectId, mode) =>
    set((s) => ({ galleryMode: { ...s.galleryMode, [projectId]: mode } })),
  openCardnews: (deckId) => set({ cardnewsId: deckId }),
```

그리고 기존 `backToGallery`가 카드뉴스도 닫도록 수정:

```ts
  backToGallery: () => set({ featureId: null, variantId: null, cardnewsId: null }),
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 타입 에러 없이 빌드 성공.

- [ ] **Step 3: Commit**

```bash
git add src/store/shellStore.ts
git commit -m "feat(cardnews): shellStore에 galleryMode·cardnews 라우팅 상태 추가"
```

---

## Task 2: 카드뉴스 타입 정의

**Files:**
- Create: `src/cardnews/types.ts`

- [ ] **Step 1: 타입 작성**

```ts
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
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add src/cardnews/types.ts
git commit -m "feat(cardnews): CardNewsDeck·Slide·ChartSpec 타입 정의"
```

---

## Task 3: 레지스트리 (자동 수집)

**Files:**
- Create: `src/cardnews/registry.ts`

- [ ] **Step 1: 작성**

```ts
import type { CardNewsDeck } from './types';
import { lintDeck } from './budget';

/** src/cardnews/<project>/<slug>/deck.ts 자동 수집 */
const modules = import.meta.glob('./*/*/deck.ts', { eager: true }) as Record<
  string,
  { default: CardNewsDeck }
>;

const decksByProject = new Map<string, CardNewsDeck[]>();
const allDecks: CardNewsDeck[] = [];

for (const mod of Object.values(modules)) {
  const deck = mod.default;
  if (!deck) continue;
  allDecks.push(deck);
  const list = decksByProject.get(deck.project) ?? [];
  list.push(deck);
  decksByProject.set(deck.project, list);
  if (import.meta.env.DEV) {
    for (const w of lintDeck(deck)) console.warn(`[cardnews:${deck.id}] ${w}`);
  }
}

export function getDecksByProject(projectId: string): CardNewsDeck[] {
  return decksByProject.get(projectId) ?? [];
}
export function getDeck(id: string): CardNewsDeck | undefined {
  return allDecks.find((d) => d.id === id);
}
export function hasCardnews(projectId: string): boolean {
  return (decksByProject.get(projectId)?.length ?? 0) > 0;
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 성공 (아직 deck이 없어 glob 결과가 비어도 정상).

- [ ] **Step 3: Commit**

```bash
git add src/cardnews/registry.ts
git commit -m "feat(cardnews): deck.ts glob 자동 수집 레지스트리"
```

---

## Task 4: 글자수 예산 가드

**Files:**
- Create: `src/cardnews/budget.ts`

- [ ] **Step 1: 작성**

```ts
import type { CardNewsDeck, Lang, LangText } from './types';

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
    const len = field[l]?.length ?? 0;
    if (len > max[l]) out.push(`${l} ${len}/${max[l]}자 초과: "${field[l]}"`);
  }
  return out;
}

/** dev 경고용 — 예산 초과 필드 메시지 목록 반환 */
export function lintDeck(deck: CardNewsDeck): string[] {
  const w: string[] = [];
  deck.slides.forEach((s, i) => {
    const p = `slide ${i + 1} (${s.type})`;
    if ('eyebrow' in s && s.eyebrow) over(s.eyebrow, BUDGET.eyebrow).forEach((m) => w.push(`${p} eyebrow — ${m}`));
    if ('headline' in s && s.headline) over(s.headline, BUDGET.headline).forEach((m) => w.push(`${p} headline — ${m}`));
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
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add src/cardnews/budget.ts
git commit -m "feat(cardnews): 글자수 예산 표 + lintDeck dev 경고"
```

---

## Task 5: SVG 차트 컴포넌트

**Files:**
- Create: `src/shell/cardnews/charts.tsx`

차트는 1080px 슬라이드 내부에서 px 단위로 그린다. 색 토큰은 슬라이드와 공유.

- [ ] **Step 1: 작성**

```tsx
import type { ChartSpec, Lang, Tone } from '../../cardnews/types';

export const TONE: Record<Tone, string> = {
  up: '#34d399',
  down: '#f43f5e',
  gold: '#e3b341',
  cyan: '#22d3ee',
  neutral: '#a78bfa',
};

export function Chart({ spec, lang }: { spec: ChartSpec; lang: Lang }) {
  if (spec.kind === 'divergenceBar') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginTop: 40 }}>
        {spec.rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 36, fontSize: 44 }}>
            <span style={{ width: 220, opacity: 0.72, flexShrink: 0 }}>{r.name[lang]}</span>
            <div style={{ flex: 1, height: 66, background: 'rgba(255,255,255,.05)', borderRadius: 22, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r.pct}%`, background: TONE[r.tone], borderRadius: 22 }} />
            </div>
            <span style={{ width: 240, textAlign: 'right', fontWeight: 800, color: TONE[r.tone], fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{r.value}</span>
          </div>
        ))}
      </div>
    );
  }
  if (spec.kind === 'areaSpark') {
    const w = 920, h = 320;
    const max = Math.max(...spec.points), min = Math.min(...spec.points);
    const pts = spec.points.map((v, i) => {
      const x = (i / (spec.points.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const color = spec.tone === 'up' ? TONE.up : TONE.down;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200, marginTop: 24 }} preserveAspectRatio="none">
        <polyline points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill={color} fillOpacity="0.15" />
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="8" />
      </svg>
    );
  }
  if (spec.kind === 'donut') {
    const total = spec.segments.reduce((a, s) => a + s.weight, 0);
    const C = 2 * Math.PI * 110;
    let offset = 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 48 }}>
        <svg viewBox="0 0 280 280" style={{ width: 280, height: 280 }}>
          {spec.segments.map((s, i) => {
            const len = (s.weight / total) * C;
            const el = (
              <circle key={i} cx="140" cy="140" r="110" fill="none" stroke={TONE[s.tone]} strokeWidth="42"
                strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset} transform="rotate(-90 140 140)" />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 44 }}>
          {spec.segments.map((s, i) => (
            <div key={i}><span style={{ color: TONE[s.tone] }}>●</span> {s.label[lang]}</div>
          ))}
        </div>
      </div>
    );
  }
  // statChips
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 40 }}>
      {spec.items.map((it, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,.05)', borderRadius: 28, padding: '28px 44px' }}>
          <span style={{ fontSize: 42, opacity: 0.72 }}>{it.label[lang]}</span>
          <span style={{ fontSize: 56, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: it.tone ? TONE[it.tone] : '#e8e9f2' }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add src/shell/cardnews/charts.tsx
git commit -m "feat(cardnews): SVG 차트(divergenceBar·areaSpark·donut·statChips)"
```

---

## Task 6: 슬라이드 렌더러 + 스케일 래퍼

**Files:**
- Create: `src/shell/cardnews/Slide.tsx`

슬라이드는 항상 1080×1080 px로 렌더한다. 화면 표시는 `ScaledSlide`가 CSS transform으로 축소한다(내보내기는 1080 원본 캡처).

- [ ] **Step 1: 작성**

```tsx
import { forwardRef } from 'react';
import type { CardNewsDeck, Lang, Slide as SlideT } from '../../cardnews/types';
import { Chart, TONE } from './charts';

const SIZE = 1080;
const text: React.CSSProperties = { wordBreak: 'keep-all', overflowWrap: 'break-word' };

function Frame({ children, accent, bg }: { children: React.ReactNode; accent: string; bg?: string }) {
  return (
    <div style={{
      width: SIZE, height: SIZE, padding: 80, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden', borderRadius: 0,
      background: bg ?? 'linear-gradient(160deg,#11132a,#0a0b14)',
      border: `1px solid ${accent}38`, color: '#e8e9f2', fontFamily: 'system-ui, sans-serif',
    }}>{children}</div>
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 38, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#a78bfa', fontWeight: 700 }}>{children}</div>
);
const Foot = ({ n, total }: { n: number; total: number }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 30, opacity: 0.55 }}>
    <div style={{ display: 'flex', gap: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i === n ? '#7c5cff' : 'rgba(255,255,255,.22)' }} />
      ))}
    </div>
    <span>{n + 1}/{total}</span>
  </div>
);

/** 1080px 고정 슬라이드 */
export const Slide = forwardRef<HTMLDivElement, {
  slide: SlideT; lang: Lang; index: number; total: number; accent: string;
}>(({ slide: s, lang, index, total, accent }, ref) => {
  const headlineGlow = 'radial-gradient(ellipse 90% 60% at 70% -10%,rgba(124,92,255,.28),transparent 60%),linear-gradient(160deg,#11132a,#0a0b14)';
  let body: React.ReactNode;

  switch (s.type) {
    case 'cover':
      body = (<>
        <div style={{ position: 'relative' }}><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h1 style={{ ...text, fontSize: 88, fontWeight: 800, lineHeight: 1.2, margin: '24px 0 0' }}>{s.headline[lang]}</h1></div>
        <div style={{ position: 'relative' }}>
          <span style={{ display: 'inline-block', fontSize: 34, fontWeight: 700, background: 'rgba(124,92,255,.16)', color: '#c4b5fd', padding: '16px 36px', borderRadius: 999 }}>{s.tag[lang]}</span>
          <div style={{ marginTop: 40 }}><Foot n={index} total={total} /></div>
        </div></>);
      break;
    case 'thesis':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 78, fontWeight: 800, lineHeight: 1.26, margin: '24px 0 0' }}>{s.headline[lang]}</h2>
          <p style={{ ...text, fontSize: 48, lineHeight: 1.5, opacity: 0.78, marginTop: 36 }}>{s.body[lang]}</p></div>
        <Foot n={index} total={total} /></>);
      break;
    case 'contrast':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          {s.headline && <h2 style={{ ...text, fontSize: 66, fontWeight: 800, margin: '20px 0 0' }}>{s.headline[lang]}</h2>}
          {[s.left, s.right].map((b, i) => (
            <div key={i} style={{ ...text, marginTop: 32, borderRadius: 36, padding: '40px 44px', fontSize: 44, lineHeight: 1.4,
              background: `${TONE[b.tone]}1a`, border: `2px solid ${TONE[b.tone]}44` }}>
              <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.9, marginBottom: 14, color: TONE[b.tone] }}>{b.label[lang]}</div>
              {b.text[lang]}
            </div>
          ))}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'data':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 66, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          <Chart spec={s.chart} lang={lang} />
          {s.note && <p style={{ ...text, fontSize: 44, lineHeight: 1.5, opacity: 0.78, marginTop: 36 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'context':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 66, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          <Chart spec={{ kind: 'statChips', items: s.stats }} lang={lang} />
          {s.note && <p style={{ ...text, fontSize: 44, lineHeight: 1.5, opacity: 0.78, marginTop: 32 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'action':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 72, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          {s.chart && <Chart spec={s.chart} lang={lang} />}
          {s.note && <p style={{ ...text, fontSize: 44, lineHeight: 1.5, opacity: 0.78, marginTop: 40 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'list':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          {s.headline && <h2 style={{ ...text, fontSize: 60, fontWeight: 800, margin: '20px 0 0' }}>{s.headline[lang]}</h2>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 32 }}>
            {s.items.map((it, i) => (
              <div key={i} style={{ ...text, fontSize: 44, lineHeight: 1.35, background: 'rgba(255,255,255,.06)', borderRadius: 32, padding: '28px 40px' }}>{it[lang]}</div>
            ))}
          </div>
          {s.note && <p style={{ ...text, fontSize: 42, lineHeight: 1.5, opacity: 0.78, marginTop: 32 }}>{s.note[lang]}</p>}</div>
        <Foot n={index} total={total} /></>);
      break;
    case 'cta':
      body = (<>
        <div><Eyebrow>{s.eyebrow[lang]}</Eyebrow>
          <h2 style={{ ...text, fontSize: 72, fontWeight: 800, lineHeight: 1.26, margin: '20px 0 0' }}>{s.headline[lang]}</h2>
          <p style={{ ...text, fontSize: 48, lineHeight: 1.5, opacity: 0.78, marginTop: 36 }}>{s.body[lang]}</p></div>
        <div>{s.url && <span style={{ display: 'inline-block', fontSize: 40, background: 'rgba(255,255,255,.06)', borderRadius: 28, padding: '24px 36px', color: '#a78bfa' }}>{s.url}</span>}
          <div style={{ marginTop: 36 }}><Foot n={index} total={total} /></div></div></>);
      break;
  }

  const bg = s.type === 'cover' || s.type === 'cta' ? headlineGlow : undefined;
  return <div ref={ref}><Frame accent={accent} bg={bg}>{body}</Frame></div>;
});
Slide.displayName = 'Slide';

/** 화면 표시용 — 1080px 슬라이드를 display px로 축소 */
export function ScaledSlide(props: { slide: SlideT; lang: Lang; index: number; total: number; accent: string; display: number }) {
  const { display, ...rest } = props;
  const scale = display / SIZE;
  return (
    <div style={{ width: display, height: display, overflow: 'hidden', borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: SIZE, height: SIZE }}>
        <Slide {...rest} />
      </div>
    </div>
  );
}

export { SIZE as SLIDE_SIZE };
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add src/shell/cardnews/Slide.tsx
git commit -m "feat(cardnews): 슬라이드 타입별 1080px 렌더러 + ScaledSlide"
```

---

## Task 7: 비트코인 덱 데이터 (ko/en)

**Files:**
- Create: `src/cardnews/alphalenz/btc-riskoff-2026-06-13/deck.ts`

제작 지침(§의역·글자수 예산) 적용. 수치는 언어 중립.

- [ ] **Step 1: 작성**

```ts
import type { CardNewsDeck } from '../../types';

const deck: CardNewsDeck = {
  id: 'btc-riskoff-2026-06-13',
  project: 'alphalenz',
  title: { ko: '비트코인 위험회피 리포트', en: 'Bitcoin Risk-off Report' },
  source: 'https://alpha-lenz.com/ko/angle-reports/2026-06-13-alpha-lenz-bitcoin-report',
  date: '2026-06-13',
  slides: [
    { type: 'cover',
      eyebrow: { ko: 'AlphaLenz · 앵글 리포트', en: 'AlphaLenz · Angle Report' },
      headline: { ko: '모두가 저점을 외칠 때,\nAI는 다르게 봤다', en: "Everyone said 'buy the dip.'\nAI disagreed." },
      tag: { ko: '비트코인 · 위험회피 · 2026.06.13', en: 'Bitcoin · Risk-off · 2026.06.13' } },
    { type: 'thesis',
      eyebrow: { ko: '핵심 결론', en: 'The verdict' },
      headline: { ko: "지금의 하락은\n'과잉 반응'이 아니다", en: "This selloff isn't\nan overreaction" },
      body: { ko: '시장은 과민반응이라 말하지만 데이터는 정반대다. 유동성 경색이 부른 구조적 하락 — 비트코인이 제 가격을 찾는 과정이다.',
              en: 'Markets call it panic; the data says otherwise. A structural decline driven by tightening liquidity — Bitcoin simply finding fair value.' } },
    { type: 'contrast',
      eyebrow: { ko: '시장의 해석 vs 실제', en: 'Narrative vs reality' },
      headline: { ko: '같은 하락, 정반대의 해석', en: 'Same drop, opposite reads' },
      left: { label: { ko: '시장의 시선', en: "The market's view" }, tone: 'down',
              text: { ko: "금리 인하 기대 후퇴와 AI 쏠림發 '캐리 청산' 우려", en: 'Fading rate-cut hopes and AI crowding spark carry-unwind fears' } },
      right: { label: { ko: '실제', en: 'The reality' }, tone: 'up',
               text: { ko: '소비심리 위축, 인플레이션 고착, 유동성 제약', en: 'Weak sentiment, sticky inflation, constrained liquidity' } } },
    { type: 'data',
      eyebrow: { ko: '데이터가 가리키는 것', en: 'What the data shows' },
      headline: { ko: '지난 한 달, 비트코인만\n홀로 무너졌다', en: 'In one month, only\nBitcoin collapsed' },
      chart: { kind: 'divergenceBar', rows: [
        { name: { ko: '비트코인', en: 'Bitcoin' }, value: '-17.06%', pct: 92, tone: 'down' },
        { name: { ko: '나스닥100', en: 'Nasdaq 100' }, value: '+0.19%', pct: 7, tone: 'up' },
      ] },
      note: { ko: "'디지털 금'도 'AI 자산'도 아니다. BTC–금 상관계수 0.044.", en: "Not 'digital gold,' not an 'AI asset.' BTC–gold correlation: 0.044." } },
    { type: 'context',
      eyebrow: { ko: '배경 · 거시 환경', en: 'Macro backdrop' },
      headline: { ko: '고금리 장기화가\n현실이 됐다', en: 'Higher-for-longer\nis now reality' },
      stats: [
        { label: { ko: '소비자심리 (UMCSENT)', en: 'Sentiment (UMCSENT)' }, value: '49.8', tone: 'down' },
        { label: { ko: '소비자물가 (CPI)', en: 'CPI' }, value: '334', tone: 'gold' },
        { label: { ko: '산업생산 (INDPRO)', en: 'Output (INDPRO)' }, value: '102.5', tone: 'neutral' },
      ],
      note: { ko: '위축된 소비 + 고착된 물가 = 스태그플레이션 신호.', en: 'Weak demand plus sticky prices — a stagflation signal.' } },
    { type: 'action',
      eyebrow: { ko: '권고 조치', en: 'Recommendation' },
      headline: { ko: '비트코인 축소,\n금으로 전환', en: 'Trim Bitcoin,\nrotate into gold' },
      chart: { kind: 'donut', segments: [
        { label: { ko: '비트코인 비중 ↓', en: 'Bitcoin ↓' }, weight: 30, tone: 'down' },
        { label: { ko: '금·안전자산 ↑', en: 'Gold & havens ↑' }, weight: 70, tone: 'gold' },
      ] },
      note: { ko: '구조적 약세 국면, 포트폴리오 방어가 우선이다.', en: 'In a structural downturn, defense comes first.' } },
    { type: 'list',
      eyebrow: { ko: '대안 자산 · 무효화 조건', en: 'Alternatives · Invalidation' },
      items: [
        { ko: '금 (XAU) — 스태그플레이션의 유일한 헤지', en: 'Gold (XAU) — the only stagflation hedge' },
        { ko: '달러 (USD) — 위험회피 심리의 수혜', en: 'US dollar — a risk-off beneficiary' },
        { ko: "단기국채 — '현금의 왕', 무위험 수익", en: "T-bills — 'cash is king,' risk-free yield" },
      ],
      note: { ko: '무효화 — T10Y2Y 마이너스 1주 이상 지속 시 시나리오 폐기.', en: 'Invalidation: if T10Y2Y inverts below zero for a week or more.' } },
    { type: 'cta',
      eyebrow: { ko: 'AlphaLenz', en: 'AlphaLenz' },
      headline: { ko: '남들보다 하루 먼저,\n시장의 진짜 신호를', en: 'The real market signal,\na day ahead' },
      body: { ko: '매일 축적되는 AI 앵글 리포트 — 결론부터 근거까지.', en: 'Daily AI angle reports — from verdict to evidence.' },
      url: 'alpha-lenz.com' },
  ],
};

export default deck;
```

- [ ] **Step 2: 빌드 + dev 경고 확인**

Run: `npm run build` → 성공.
Run: `npm run dev` 후 브라우저 콘솔에서 `[cardnews:btc-riskoff-2026-06-13]` 예산 경고가 없는지 확인. 경고가 있으면 해당 카피를 예산 내로 줄인다.

- [ ] **Step 3: Commit**

```bash
git add src/cardnews/alphalenz/btc-riskoff-2026-06-13/deck.ts
git commit -m "feat(cardnews): 비트코인 위험회피 덱(ko/en)"
```

---

## Task 8: 내보내기 (PNG·PDF)

**Files:**
- Create: `src/shell/cardnews/export.ts`
- Modify: `package.json` (의존성 추가)

- [ ] **Step 1: 의존성 설치**

Run: `npm i html-to-image jspdf`
Expected: `dependencies`에 `html-to-image`, `jspdf` 추가.

- [ ] **Step 2: export.ts 작성**

`nodes`는 1080px 슬라이드 원본 DOM 노드 배열(뷰어가 ref로 제공).

```ts
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const OPT = { pixelRatio: 1, cacheBust: true, width: 1080, height: 1080 } as const;

async function nodeToPng(node: HTMLElement): Promise<string> {
  return toPng(node, OPT);
}

function download(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** 슬라이드 한 장 PNG */
export async function exportSlidePng(node: HTMLElement, deckId: string, lang: string, index: number) {
  download(await nodeToPng(node), `${deckId}-${lang}-${String(index + 1).padStart(2, '0')}.png`);
}

/** 모든 슬라이드 PNG 순차 다운로드 */
export async function exportAllPng(nodes: HTMLElement[], deckId: string, lang: string) {
  for (let i = 0; i < nodes.length; i++) {
    download(await nodeToPng(nodes[i]), `${deckId}-${lang}-${String(i + 1).padStart(2, '0')}.png`);
  }
}

/** 덱 전체 PDF (1:1 페이지) */
export async function exportPdf(nodes: HTMLElement[], deckId: string, lang: string) {
  const pdf = new jsPDF({ unit: 'px', format: [1080, 1080] });
  for (let i = 0; i < nodes.length; i++) {
    const img = await nodeToPng(nodes[i]);
    if (i > 0) pdf.addPage([1080, 1080], 'portrait');
    pdf.addImage(img, 'PNG', 0, 0, 1080, 1080);
  }
  pdf.save(`${deckId}-${lang}.pdf`);
}
```

- [ ] **Step 3: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/shell/cardnews/export.ts
git commit -m "feat(cardnews): PNG·PDF 내보내기 (html-to-image, jspdf)"
```

---

## Task 9: 카드뉴스 뷰어

**Files:**
- Create: `src/shell/cardnews/CardNewsViewer.tsx`

- [ ] **Step 1: 작성**

```tsx
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Download, FileDown, Images } from 'lucide-react';
import type { CardNewsDeck, Lang } from '../../cardnews/types';
import { useShellStore } from '../../store/shellStore';
import { getProject } from '../../registry';
import { Slide, ScaledSlide } from './Slide';
import { exportSlidePng, exportAllPng, exportPdf } from './export';

export function CardNewsViewer({ deck }: { deck: CardNewsDeck }) {
  const back = useShellStore((s) => s.backToGallery);
  const projectLang = useShellStore((s) => s.projectLang);
  const setProjectLang = useShellStore((s) => s.setProjectLang);
  const project = getProject(deck.project);
  const langs = project?.languages ?? [{ id: 'ko', label: '한국어', flag: '🇰🇷' }, { id: 'en', label: 'English', flag: '🇺🇸' }];
  const lang = ((projectLang[deck.project] as Lang) ?? 'ko');
  const accent = deck.accent ?? '#7c5cff';
  const total = deck.slides.length;

  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  /** 내보내기용 1080px 원본 노드 refs */
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const prev = () => setI((v) => (v - 1 + total) % total);
  const next = () => setI((v) => (v + 1) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };
  const nodes = () => exportRefs.current.filter(Boolean) as HTMLElement[];

  return (
    <div className="grain relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,92,255,0.14), transparent 60%), linear-gradient(180deg,#0c0a12,#08070b)' }}>

      {/* 상단 바 */}
      <div className="flex w-full items-center justify-between px-6 py-4">
        <button onClick={back} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25">
          <ArrowLeft className="h-4 w-4" /> 갤러리
        </button>
        <span className="text-sm font-medium text-zinc-300">{deck.title[lang]}</span>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {langs.map((l) => (
            <button key={l.id} onClick={() => setProjectLang(deck.project, l.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[12px] font-medium ${l.id === lang ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {l.flag} {l.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 슬라이드 + 좌우 네비 */}
      <div className="flex flex-1 items-center justify-center gap-5">
        <button onClick={prev} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronLeft className="h-7 w-7" /></button>
        <ScaledSlide slide={deck.slides[i]} lang={lang} index={i} total={total} accent={accent} display={Math.min(560, 0.62 * 860)} />
        <button onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-200 hover:bg-white/[0.14]"><ChevronRight className="h-7 w-7" /></button>
      </div>

      {/* 하단 컨트롤 */}
      <div className="flex w-full items-center justify-center gap-3 px-6 py-5">
        <span className="font-mono text-[12px] tabular-nums text-zinc-500">{i + 1} / {total}</span>
        <button disabled={busy} onClick={() => run(() => exportSlidePng(nodes()[i], deck.id, lang, i))}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
          <Download className="h-4 w-4" /> 이 슬라이드 PNG
        </button>
        <button disabled={busy} onClick={() => run(() => exportAllPng(nodes(), deck.id, lang))}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-white/25 disabled:opacity-50">
          <Images className="h-4 w-4" /> 전체 PNG
        </button>
        <button disabled={busy} onClick={() => run(() => exportPdf(nodes(), deck.id, lang))}
          className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200 hover:bg-violet-500/20 disabled:opacity-50">
          <FileDown className="h-4 w-4" /> PDF
        </button>
      </div>

      {/* 내보내기용 1080px 원본(화면 밖) */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        {deck.slides.map((s, idx) => (
          <Slide key={idx} ref={(el) => { exportRefs.current[idx] = el; }} slide={s} lang={lang} index={idx} total={total} accent={accent} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: Commit**

```bash
git add src/shell/cardnews/CardNewsViewer.tsx
git commit -m "feat(cardnews): 1:1 뷰어(이전/다음·언어 토글·PNG/PDF 내보내기)"
```

---

## Task 10: 카드뉴스 갤러리 그리드 + 세그먼트 토글

**Files:**
- Create: `src/shell/cardnews/CardNewsGallery.tsx`
- Modify: `src/shell/Gallery.tsx`

- [ ] **Step 1: CardNewsGallery 작성**

```tsx
import { motion } from 'framer-motion';
import { Layers, Hourglass } from 'lucide-react';
import type { CardNewsDeck, Lang } from '../../cardnews/types';
import { useShellStore } from '../../store/shellStore';

export function CardNewsGallery({ decks, lang }: { decks: CardNewsDeck[]; lang: Lang }) {
  const openCardnews = useShellStore((s) => s.openCardnews);

  if (decks.length === 0) {
    return (
      <div className="mt-12 flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] text-zinc-500">
        <Hourglass className="h-7 w-7" />
        <span className="text-sm font-medium">카드뉴스 준비 중</span>
        <span className="text-xs text-zinc-600">등록된 덱이 없습니다</span>
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck, i) => (
        <motion.button key={deck.id} type="button" onClick={() => openCardnews(deck.id)}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left transition-colors hover:border-violet-500/30">
          <div className="relative flex h-44 items-center justify-center overflow-hidden"
            style={{ background: 'radial-gradient(ellipse 90% 60% at 70% -10%,rgba(124,92,255,.28),transparent 60%),linear-gradient(160deg,#11132a,#0a0b14)' }}>
            <Layers className="h-9 w-9 text-violet-300/80 transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute bottom-3 right-3 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-mono text-zinc-300">{deck.slides.length} cards · 1:1</span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <span className="text-[11px] font-medium text-violet-300">앵글 리포트 · {deck.date}</span>
            <h3 className="mt-1.5 text-[16px] font-semibold text-zinc-100">{deck.title[lang]}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">슬라이드 카드뉴스 — 넘겨보고 PNG·PDF로 내보내기</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Gallery.tsx 수정 — import 추가**

`src/shell/Gallery.tsx` 상단 import 구역에 추가:

```tsx
import { Film, Layers } from 'lucide-react';
import { getDecksByProject, hasCardnews } from '../cardnews/registry';
import { CardNewsGallery } from './cardnews/CardNewsGallery';
import type { Lang } from '../cardnews/types';
```

- [ ] **Step 3: Gallery.tsx 수정 — 모드 상태/데이터**

`const lang = projectLang[project.id] ?? project.languages?.[0]?.id;` 다음 줄에 추가:

```tsx
  const galleryMode = useShellStore((s) => s.galleryMode);
  const setGalleryMode = useShellStore((s) => s.setGalleryMode);
  const showCardnews = hasCardnews(project.id);
  const mode = (showCardnews && galleryMode[project.id]) || 'video';
  const decks = getDecksByProject(project.id);
```

- [ ] **Step 4: Gallery.tsx 수정 — 세그먼트 토글 UI 삽입**

설명 문단(`<p>{project.description}</p>`을 감싼 헤더)과 카드 그리드(`<div className="mt-12 grid ...">`) 사이, 즉 `</motion.header>` 바로 다음에 토글을 삽입:

```tsx
        {showCardnews && (
          <div className="mt-7 inline-flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button type="button" onClick={() => setGalleryMode(project.id, 'video')}
              className={cn('flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                mode === 'video' ? 'bg-brass-500/20 text-brass-200' : 'text-zinc-500 hover:text-zinc-300')}>
              <Film className="h-4 w-4" /> 영상
            </button>
            <button type="button" onClick={() => setGalleryMode(project.id, 'cardnews')}
              className={cn('flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                mode === 'cardnews' ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-500 hover:text-zinc-300')}>
              <Layers className="h-4 w-4" /> 카드뉴스
            </button>
          </div>
        )}
```

- [ ] **Step 5: Gallery.tsx 수정 — 카드뉴스 모드 분기**

기존 카드 그리드 `<div className="mt-12 grid ...">...</div>` 전체를 다음으로 감싸 분기한다(영상 모드면 기존 그리드, 카드뉴스 모드면 CardNewsGallery):

```tsx
        {mode === 'cardnews' ? (
          <CardNewsGallery decks={decks} lang={(lang as Lang) ?? 'ko'} />
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* ...기존 cards.map / features.length===0 / 새 데모 추가 버튼 그대로... */}
          </div>
        )}
```

- [ ] **Step 6: 빌드 검증**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 7: Commit**

```bash
git add src/shell/cardnews/CardNewsGallery.tsx src/shell/Gallery.tsx
git commit -m "feat(cardnews): 갤러리 영상/카드뉴스 세그먼트 토글 + 덱 그리드"
```

---

## Task 11: App 라우팅 연결

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 카드뉴스 뷰어 분기 추가**

```tsx
import { useShellStore } from './store/shellStore';
import { getFeature } from './registry';
import { getDeck } from './cardnews/registry';
import { Gallery } from './shell/Gallery';
import { Stage } from './shell/Stage';
import { CardNewsViewer } from './shell/cardnews/CardNewsViewer';

export default function App() {
  const featureId = useShellStore((s) => s.featureId);
  const variantId = useShellStore((s) => s.variantId);
  const cardnewsId = useShellStore((s) => s.cardnewsId);

  const feature = featureId ? getFeature(featureId) : undefined;
  const variant = feature ? (feature.variants.find((v) => v.id === variantId) ?? feature.variants[0]) : undefined;
  const deck = cardnewsId ? getDeck(cardnewsId) : undefined;

  return (
    <div className="h-full w-full">
      {deck ? (
        <CardNewsViewer deck={deck} />
      ) : feature && variant ? (
        <Stage feature={feature} variant={variant} />
      ) : (
        <Gallery />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 + 전체 흐름 브라우저 검증**

Run: `npm run build` → 성공.
Run: `npm run dev`. 브라우저에서:
1. AlphaLenz 탭 → 헤더 아래 `영상 / 카드뉴스` 토글 노출 확인
2. `카드뉴스` 클릭 → 비트코인 덱 카드 표시 → 클릭 → 뷰어 진입
3. ←/→ 로 8장 넘김, 텍스트가 카드 밖으로 넘치지 않는지 확인
4. ko/en 토글 시 모든 슬라이드 언어 전환 확인
5. `이 슬라이드 PNG` / `전체 PNG` / `PDF` 다운로드 동작 및 1080px 해상도·레이아웃 확인
6. `갤러리`로 복귀, 다른 프로젝트(ARIA 등)엔 토글이 없는지 확인

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(cardnews): App에 카드뉴스 뷰어 라우팅 연결"
```

---

## Task 12: 제작 지침 정본 문서

**Files:**
- Create: `docs/cardnews/authoring-guide.md`

- [ ] **Step 1: 작성** (설계 문서 §6을 정본으로 옮김)

```markdown
# 카드뉴스 제작 지침 (Authoring Guide)

사용자가 링크(앵글 리포트 등)를 전달하면, 이 지침에 따라 **한국어·영어 2개 버전**의 1:1 카드뉴스 덱을 제작한다. 목표는 매 요청마다 **일관된 품질**의 산출물이다.

## 1. 입력 → 산출 흐름
1. 링크 본문을 WebFetch로 가져온다. 제목·발행일·핵심 주장·섹션별 요지·**모든 수치/티커/날짜**·결론/권고를 구조적으로 추출한다.
2. 덱 골격(아래 슬라이드 타입)에 매핑한다. 기본 8장, 내용에 따라 6~10장 가감.
3. **한국어 버전을 먼저 완성** → 영어를 **의역(transcreation)** 으로 작성한다(직역 금지).
4. `src/cardnews/alphalenz/<slug>/deck.ts`를 생성한다. 폴더 추가만으로 갤러리에 등록된다.
5. `npm run dev` 콘솔에서 글자수 예산 경고(`[cardnews:<id>]`)가 없는지 확인한다.

## 2. 슬라이드 타입 (덱 골격)
1. cover — 후킹 헤드라인 + 태그(주제·레짐·날짜) + 브랜드 (+ 무드 차트)
2. thesis — 핵심 결론 한 줄 + 보강 1문장
3. contrast(선택) — 시장의 해석 vs 실제 (2박스)
4. data — 히어로 차트 + 1줄 해설
5. context — 거시·배경 스탯 칩
6. action — 권고 + 배분 도넛(선택)
7. list(선택) — 대안 자산/체크리스트 + 무효화 조건
8. cta — 브랜드 마무리 + URL

## 3. 의역(Transcreation) 원칙
- 각 언어를 그 언어 화자에게 자연스럽게 새로 쓴다. 한국어를 영어로 옮기지 말고, **같은 메시지·같은 후킹을 영어 카피로 다시 만든다**.
- 길이·줄 수가 언어별로 달라도 좋다. 슬라이드 영역에 맞는 게 우선이다.
- 관용 표현·뉘앙스는 현지화한다.
- **숫자·티커·지표·날짜는 양 언어에서 100% 동일**(데이터 모델상 언어 중립 필드라 자동 보장). 단위·소수점 표기는 각 언어 관례를 따른다.

## 4. 톤 & 카피
- 신뢰감 있는 애널리스트 보이스. 한국어 어미는 단정형 `-다`. 영어는 confident declarative.
- 구어 슬랭·과한 감탄 금지. 후킹은 헤드라인 프레이밍과 대비 구조로.
- 슬라이드 1장 = 메시지 1개. 결론을 앞에, 근거를 뒤에.

## 5. 카피 글자수 예산 (상한)
| 필드 | 한국어 | 영어 |
|---|---|---|
| eyebrow | ≤ 16자 | ≤ 28 chars |
| headline | ≤ 22자(≤2줄) | ≤ 42 chars(≤2 lines) |
| body / note | ≤ 95자 | ≤ 160 chars |
| contrast 박스 | ≤ 40자 | ≤ 72 chars |
| list 항목 | ≤ 30자 | ≤ 55 chars |

초과 시 카피를 줄이는 게 우선. 폰트 오토핏은 보조 수단이다. (헤드라인의 의도적 줄바꿈은 `\n` 사용)

## 6. 데이터 정확성 가드
- 추출 수치는 원문과 자릿수까지 일치시킨다. 추정·창작 금지.
- 권고/무효화/리스크는 원문 의도를 왜곡하지 않는다(특히 매수/매도 방향).
- 도넛 등 비율 시각화에 원문에 없는 정확한 %를 단정해 표기하지 않는다(방향성 표기 권장).
- 출처 URL을 `deck.source`에 보존한다.

## 7. 차트
- 덱당 최대 3개, 인사이트를 더하는 곳에만(단순 장식 금지).
- 종류: `divergenceBar`(대비) · `areaSpark`(추세) · `donut`(배분) · `statChips`(지표 나열).
```

- [ ] **Step 2: Commit**

```bash
git add docs/cardnews/authoring-guide.md
git commit -m "docs(cardnews): 제작 지침 정본(의역·톤·글자수 예산·데이터 가드)"
```

---

## Self-Review (작성자 체크 결과)

- **스펙 커버리지**: 토글(T10), 1:1·슬라이드 타입(T6), PNG+PDF(T8), 한/영·의역(T7·T12), 톤(T7·T12), 차트 절제(T5·T12), 넘침 방지(T4·T6), 비트코인 덱(T7), 제작 지침(T12), 라우팅(T1·T11), 레지스트리 자동등록(T3) — 모두 태스크에 매핑됨.
- **타입 일관성**: `LangText`/`Tone`/`ChartSpec`(donut은 `weight`, divergenceBar는 `pct`)·`getDeck`/`getDecksByProject`/`hasCardnews`·`galleryMode`/`openCardnews`/`cardnewsId`가 정의 태스크와 사용 태스크에서 동일.
- **플레이스홀더**: 없음(Gallery 수정의 "기존 그대로" 표기는 기존 코드 보존 지시로 의도적).
- **주의**: Task 8에서 `package-lock.json`이 없으면 `git add` 시 무시(npm이 생성하면 포함). 차트는 Recharts 대신 SVG 구현(스펙 대비 의도적 변경 — 고정 크기·PNG 추출 안정성).
