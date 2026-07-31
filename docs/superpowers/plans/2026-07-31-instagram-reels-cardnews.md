# 인스타그램 카드뉴스 2종 (이미지 캐러셀 + 릴스) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `stock-excessfear-2026-07-27` 덱에 인스타 이미지 캐러셀(1080×1350)과 릴스(1080×1920 자동 전환 영상) variant를 추가하고, 릴스를 앱에서 미리보고 mp4로 렌더할 수 있게 한다.

**Architecture:** 슬라이드 배열 하나를 링크드인·인스타·릴스 3개 variant가 공유한다(수치 불일치 원천 차단). 릴스는 기존 4:5 `MacroSlide`를 9:16 프레임(`ReelsFrame`)에 스케일 배치해 신규 레이아웃 없이 만들고, 타이밍은 순수 함수 `reels.ts` 하나를 뷰어 `<Player>`와 Remotion 컴포지션이 함께 import해 프리뷰와 mp4가 프레임 단위로 일치한다.

**Tech Stack:** TypeScript · React 18 · Vite 6(앱) · Remotion 4.0.485(webpack, 렌더) · `@remotion/player`(프리뷰, 기존 의존성) · Node 24 내장 `node:test`(테스트)

## Global Constraints

- **대상 덱은 `stock-excessfear-2026-07-27` 하나뿐.** 기존 덱 5개(07-25, 06-22 ×2, 06-17, 06-15, 06-13)는 파일을 열지도 수정하지도 않는다.
- **신규 npm 의존성 0개.** `@remotion/player`는 이미 `dependencies`에 있다. 테스트는 Node 24 내장 `node:test` + 타입 스트리핑으로 돌린다.
- **프레임 결정론:** 릴스 애니메이션은 `useCurrentFrame()`에서만 계산한다. `Date.now()`·`Math.random()`·CSS `transition`/`animation` 금지. (커밋 `4f95428` 관례)
- **Remotion 번들 금지 사항:** `src/cardnews/registry.ts`(Vite 전용 `import.meta.glob`)를 릴스 경로에서 절대 import하지 않는다. `remotion/*`은 덱을 직접 import한다.
- **폰트:** `remotion/styles.css`에 로컬 `/fonts` `@font-face`를 추가하지 않는다(webpack css-loader가 Vite public 경로를 못 읽어 번들이 깨진다 — 해당 파일 주석에 기록됨). `staticFile()` + `FontFace` API + `delayRender`로 로드한다.
- **`import type` 필수:** `src/cardnews/reels.ts`가 타입을 가져올 때는 반드시 `import type`을 쓴다. 확장자 없는 런타임 import(`from './types'`)는 Node 직접 실행 시 `ERR_MODULE_NOT_FOUND`로 죽는다.
- **데이터 정확성:** 인스타 캡션의 수치·티커·방향(Overweight NDX)·무효화(ICSA 25만 2주 연속)는 링크드인·X 캡션과 100% 동일해야 한다. 새 숫자를 만들지 않는다.
- **릴스 타이밍 기본값:** `m-cover` 3s · `m-call` 4s · `m-narrative` 5s · `m-data` 5s · `m-tensions` 5s · `m-plan` 4s · `m-cta` 3s. 7장 = 29초 = 870프레임 @ 30fps.
- **릴스는 macro 테마 전용.** research 테마 슬라이드는 지원 대상이 아니다(기본값 4초로 폴백 + 경고).
- **오디오 없음.** 음악은 인스타 앱에서 붙인다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/cardnews/types.ts` (수정) | `DeckVariant.kind`·`seconds` 필드 추가, `ResolvedVariant`로 통과 |
| `src/cardnews/reels.ts` (생성) | 슬라이드 → 프레임 타이밍. 순수 함수, React·Remotion 의존 0 |
| `tests/cardnews-reels.test.ts` (생성) | `reels.ts` 단위 테스트 (`node --test`) |
| `src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck.ts` (수정) | 슬라이드 배열 공유 + instagram·reels variant + 인스타 캡션 |
| `src/shell/cardnews/ReelsFrame.tsx` (생성) | 9:16 프레임. `frame` prop을 받는 순수 컴포넌트. Remotion API 미사용 |
| `src/shell/cardnews/CardNewsViewer.tsx` (수정) | `kind === 'reels'` 분기 — `<Player>` + 렌더 명령 복사 |
| `remotion/CardNewsReels.tsx` (생성) | Remotion 경계 — `useCurrentFrame()` + 폰트 로드 |
| `remotion/cardnewsReelsCompositions.ts` (생성) | 렌더 대상 덱 명시 목록 (webpack용) |
| `remotion/Root.tsx` (수정) | `cardnews` 폴더에 컴포지션 등록 |
| `package.json` (수정) | `render:reels` 스크립트 |
| `docs/cardnews/authoring-guide.md` (수정) | 인스타 캡션 규칙 |
| `.claude/skills/alphalenz-carousel/SKILL.md` (수정) | 4-variant 구조 + 인스타 절차 |

---

### Task 1: 타이밍 계약 (`reels.ts` + 타입 필드)

순수 함수와 타입만 다룬다. UI·Remotion 없음. 이 태스크만으로 타이밍 계산이 독립 검증된다.

**Files:**
- Create: `src/cardnews/reels.ts`
- Create: `tests/cardnews-reels.test.ts`
- Modify: `src/cardnews/types.ts` (`DeckVariant` 99-110행, `ResolvedVariant` 133-140행, `getVariants` 143-157행)

**Interfaces:**
- Consumes: `AnySlide` (기존 `src/cardnews/types.ts`)
- Produces:
  - `REELS_FPS: 30`, `TRANSITION_FRAMES: 12`
  - `interface ReelsTiming { frames: number[]; offsets: number[]; totalFrames: number }`
  - `reelsTiming(slides: AnySlide[], seconds?: number[]): ReelsTiming`
  - `slideAtFrame(t: ReelsTiming, frame: number): { index: number; local: number }`
  - `DeckVariant.kind?: 'cards' | 'reels'`, `DeckVariant.seconds?: number[]`
  - `ResolvedVariant.kind: 'cards' | 'reels'`, `ResolvedVariant.seconds?: number[]`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`tests/cardnews-reels.test.ts` 생성. `tests/`는 `tsconfig.json`의 `include: ["src"]` 밖이라 `tsc`가 검사하지 않는다 → `@types/node` 불필요. Node가 직접 실행하므로 import에 `.ts` 확장자를 **반드시** 붙인다.

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reelsTiming, slideAtFrame, REELS_FPS } from '../src/cardnews/reels.ts';
import type { AnySlide } from '../src/cardnews/types.ts';

/** 타이밍은 slide.type만 본다 — 최소 픽스처로 충분하다 */
const s = (type: string) => ({ type }) as unknown as AnySlide;
const DECK7 = [
  s('m-cover'), s('m-call'), s('m-narrative'), s('m-data'),
  s('m-tensions'), s('m-plan'), s('m-cta'),
];

test('7장 macro 덱은 29초(870프레임)이다', () => {
  const t = reelsTiming(DECK7);
  assert.equal(REELS_FPS, 30);
  assert.deepEqual(t.frames, [90, 120, 150, 150, 150, 120, 90]);
  assert.deepEqual(t.offsets, [0, 90, 210, 360, 510, 660, 780]);
  assert.equal(t.totalFrames, 870);
});

test('seconds로 슬라이드별 노출 시간을 덮어쓴다', () => {
  const t = reelsTiming(DECK7, [2, 2, 2, 2, 2, 2, 2]);
  assert.deepEqual(t.frames, [60, 60, 60, 60, 60, 60, 60]);
  assert.equal(t.totalFrames, 420);
});

test('seconds 길이가 짧으면 나머지는 타입별 기본값을 쓴다', () => {
  const t = reelsTiming(DECK7, [2]);
  assert.equal(t.frames[0], 60);
  assert.equal(t.frames[1], 120); // m-call 기본 4초
  assert.equal(t.totalFrames, 870 - 90 + 60);
});

test('미등록 슬라이드 타입은 4초로 폴백한다', () => {
  const t = reelsTiming([s('cover')]); // research 테마 타입
  assert.deepEqual(t.frames, [120]);
});

test('slideAtFrame은 경계 프레임에서 정확히 넘어간다', () => {
  const t = reelsTiming(DECK7);
  assert.deepEqual(slideAtFrame(t, 0), { index: 0, local: 0 });
  assert.deepEqual(slideAtFrame(t, 89), { index: 0, local: 89 });
  assert.deepEqual(slideAtFrame(t, 90), { index: 1, local: 0 });
  assert.deepEqual(slideAtFrame(t, 869), { index: 6, local: 89 });
});

test('slideAtFrame은 범위를 벗어난 프레임을 clamp한다', () => {
  const t = reelsTiming(DECK7);
  assert.deepEqual(slideAtFrame(t, -5), { index: 0, local: 0 });
  assert.deepEqual(slideAtFrame(t, 99999), { index: 6, local: 89 });
});

test('빈 슬라이드 배열은 totalFrames 0이고 index -1을 준다', () => {
  const t = reelsTiming([]);
  assert.equal(t.totalFrames, 0);
  assert.deepEqual(slideAtFrame(t, 0), { index: -1, local: 0 });
});
```

- [ ] **Step 2: 테스트가 실패하는 것을 확인한다**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module` (`src/cardnews/reels.ts`가 아직 없음)

- [ ] **Step 3: `reels.ts`를 구현한다**

`src/cardnews/reels.ts` 생성. `SECONDS`를 `Record<string, number | undefined>`로 선언하는 게 중요하다 — `Record<string, number>`면 `sec === undefined` 비교가 TS2367(겹치지 않는 타입 비교)로 막힌다.

```ts
import type { AnySlide } from './types';

/** 릴스 프레임레이트 — 뷰어 <Player>와 Remotion 컴포지션이 함께 쓰는 단일 출처.
    remotion/meta.ts의 FPS(데모 영상용)와는 별개다(src → remotion 역방향 import 회피). */
export const REELS_FPS = 30;
/** 슬라이드 등장 전환 길이(프레임) */
export const TRANSITION_FRAMES = 12;

/** 슬라이드 타입별 기본 노출 시간(초) — 읽는 부하에 비례시킨다 */
const SECONDS: Record<string, number | undefined> = {
  'm-cover': 3,
  'm-call': 4,
  'm-narrative': 5,
  'm-data': 5,
  'm-tensions': 5,
  'm-plan': 4,
  'm-cta': 3,
  'm-twitter': 4,
};
const FALLBACK_SECONDS = 4;

export interface ReelsTiming {
  /** 슬라이드별 노출 프레임 수 */
  frames: number[];
  /** 슬라이드별 시작 프레임(누적) */
  offsets: number[];
  totalFrames: number;
}

/** 슬라이드 배열 → 프레임 타이밍. seconds로 슬라이드별 노출 시간을 덮어쓸 수 있다. */
export function reelsTiming(slides: AnySlide[], seconds?: number[]): ReelsTiming {
  if (seconds && seconds.length !== slides.length) {
    console.warn(`[cardnews:reels] seconds 길이(${seconds.length}) ≠ 슬라이드 수(${slides.length}) — 부족분은 타입별 기본값`);
  }
  const frames = slides.map((slide, i) => {
    const override = seconds?.[i];
    if (typeof override === 'number' && override > 0) return Math.round(override * REELS_FPS);
    const sec = SECONDS[slide.type];
    if (sec === undefined) {
      console.warn(`[cardnews:reels] 노출 시간 미등록 슬라이드 타입: ${slide.type} — ${FALLBACK_SECONDS}초 적용`);
      return FALLBACK_SECONDS * REELS_FPS;
    }
    return sec * REELS_FPS;
  });

  const offsets: number[] = [];
  let acc = 0;
  for (const f of frames) {
    offsets.push(acc);
    acc += f;
  }
  return { frames, offsets, totalFrames: acc };
}

/** 절대 프레임 → 현재 슬라이드 인덱스 + 그 슬라이드 내 경과 프레임. 범위 밖은 clamp. */
export function slideAtFrame(t: ReelsTiming, frame: number): { index: number; local: number } {
  if (t.frames.length === 0) return { index: -1, local: 0 };
  const clamped = Math.max(0, Math.min(frame, t.totalFrames - 1));
  let index = 0;
  for (let i = t.offsets.length - 1; i >= 0; i--) {
    if (clamped >= t.offsets[i]) {
      index = i;
      break;
    }
  }
  return { index, local: clamped - t.offsets[index] };
}
```

- [ ] **Step 4: 테스트가 통과하는 것을 확인한다**

Run: `node --test tests/`
Expected: PASS — 7 tests. 콘솔에 `[cardnews:reels]` 경고가 2건 보이는 건 정상이다(길이 불일치·미등록 타입 테스트가 의도적으로 유발).

- [ ] **Step 5: `types.ts`에 variant 필드를 추가한다**

`DeckVariant` 인터페이스에 두 필드를 넣는다(`slides: AnySlide[]` 바로 위).

```ts
  /** 'cards'(기본) = 정적 카드 · 'reels' = 9:16 자동 전환 영상 */
  kind?: 'cards' | 'reels';
  /** 릴스 슬라이드별 노출 시간(초). 미지정 시 reels.ts의 타입별 기본값 */
  seconds?: number[];
```

`ResolvedVariant`에도 통과시킨다(`slides: AnySlide[]` 바로 위).

```ts
  kind: 'cards' | 'reels';
  seconds?: number[];
```

`getVariants`의 두 반환 경로를 모두 채운다.

```ts
    return deck.variants.map((v) => ({
      id: v.id,
      label: v.label,
      width: v.width ?? w,
      height: v.height ?? h,
      caption: v.caption ?? deck.caption,
      kind: v.kind ?? 'cards',
      seconds: v.seconds,
      slides: v.slides,
    }));
  }
  return [{ id: 'default', label: '', width: w, height: h, caption: deck.caption, kind: 'cards', slides: deck.slides ?? [] }];
```

- [ ] **Step 6: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 출력 없음(통과). `ResolvedVariant.kind`를 필수로 만들었으므로 `getVariants`의 두 경로를 모두 채웠는지 여기서 걸러진다.

- [ ] **Step 7: 커밋**

```bash
git add src/cardnews/reels.ts src/cardnews/types.ts tests/cardnews-reels.test.ts
git commit -m "feat(cardnews): 릴스 타이밍 모듈 + variant kind/seconds 필드"
```

---

### Task 2: 인스타 이미지 캐러셀 (덱 variant + 캡션)

이 태스크만으로 **요구사항 1(이미지 캐러셀)이 완결**된다. 릴스 없이도 인스타에 올릴 PNG가 나온다.

**Files:**
- Modify: `src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck.ts`

**Interfaces:**
- Consumes: `CardNewsDeck`·`AnySlide` (Task 1에서 확장된 `types.ts`)
- Produces: `variants`에 `id: 'instagram'` (1080×1350, `kind` 미지정 → `'cards'`)

- [ ] **Step 1: 슬라이드 배열을 상수로 추출한다**

현재 `deck.ts`는 슬라이드를 `variants[0].slides`에 인라인으로 넣고 있다. 이를 `deck` 선언 **위**의 상수로 뽑는다. 배열 내용은 한 글자도 바꾸지 않는다 — 위치만 옮긴다.

```ts
import type { AnySlide, CardNewsDeck } from '../../types';

/* …기존 캡션 상수들… */

/** 링크드인·인스타·릴스가 공유하는 7장. 배열을 공유하므로 수치 불일치가 발생할 수 없다. */
const slides: AnySlide[] = [
  { type: 'm-cover', /* …기존 그대로… */ },
  // … m-call, m-narrative, m-data, m-tensions, m-plan, m-cta
];

/** X(16:9) 전용 단일 카드 */
const twitterSlides: AnySlide[] = [
  { type: 'm-twitter', /* …기존 그대로… */ },
];
```

`import type { CardNewsDeck }`를 `import type { AnySlide, CardNewsDeck }`로 바꾼다.

- [ ] **Step 2: 인스타 캡션을 쓴다**

`deck` 선언 위에 추가한다. 링크가 클릭되지 않는 매체이므로 URL 대신 프로필 링크로 안내하고, 첫 2줄에 결론까지 담는다(더보기 컷 이전). 해시태그 15~20개.

**수치·티커·방향·무효화는 링크드인 캡션과 완전히 동일해야 한다** — ICSA 18.7만(7/18), INDPRO 102.64(6월), T10Y2Y 0.36%, UMCSENT 44.8(5월), WTI 1M +24.18%, WTI–VIX 베타 0.0734, Overweight NDX, 무효화 ICSA 25만 2주 연속.

```ts
const igCaptionKo = `유가가 뛰었고 나스닥은 2% 넘게 빠졌다.
그런데 실물 지표는 흔들리지 않았다 — 침체가 아니라 과도한 공포다.

콜 (확신 HIGH)
↑ 나스닥100(NDX) 비중확대

침체가 아니라고 보는 이유
• 신규 실업수당 18.7만 건(7/18) — 시장이 두려워하는 25만 임계선 한참 아래
• 산업생산 102.64(6월) — 실물 바닥은 무너지지 않았다
• WTI–VIX 1개월 베타 0.0734 — 유가 충격이 시장 패닉으로 번지지 않고 선택적으로 흡수되고 있다
• 10Y-2Y 금리차 0.36% — 침체 신호가 아니라 연준의 인하 지연에 대한 일시적 혼란
• 소비심리 44.8(5월) — 실제 소비 급감이 아닌 유가 급등에 대한 공포 반응

시장은 WTI 1개월 +24.18%를 스태그플레이션의 전조로 읽었다. 그러나 핵심 질문 — 노동시장 경직성이 깨지는가 — 에 대한 증거는 18.7만 건이다. 연준이 인플레이션보다 성장 둔화를 우선해 인하를 재개하면 시장은 급반등한다.

무효화 조건: 신규 실업수당이 2주 연속 25만 건을 넘으면 논지를 뒤집는다. 모든 AlphaLenz 앵글은 점수화되고 반증 가능하다.

전체 리포트는 프로필 링크에서 👆

투자 자문이 아닙니다. 리서치·정보 제공 목적입니다.

#매크로 #증시 #나스닥 #주식투자 #해외주식 #미국주식 #유가 #과매도 #소프트랜딩 #연준 #금리 #경제지표 #투자공부 #재테크 #AI투자 #퀀트 #AlphaLenz #알파렌즈 #InvestingKR #StockMarket`;

const igCaptionEn = `Crude ripped and the Nasdaq shed more than 2%.
The hard data didn't move — this is excess fear, not recession.

THE CALL (conviction HIGH)
↑ Overweight NDX

WHY THIS ISN'T A RECESSION
• Jobless claims 187K on July 18 — far below the 250K line the market fears
• Industrial production 102.64 in June — the real-economy floor is intact
• WTI–VIX 1M beta of 0.0734 — the oil shock is absorbed selectively, not spreading into panic
• 10Y–2Y at 0.36% — confusion over delayed Fed cuts, not a recession signal
• Consumer sentiment 44.8 in May — a fear response to crude, not collapsing spending

The market read WTI's +24.18% one-month move as the prelude to stagflation. But the evidence on the key question — does labor-market rigidity break? — reads 187K. If the Fed prioritizes the growth slowdown over inflation and resumes cutting, the rebound is sharp.

Invalidation: jobless claims above 250K for two straight weeks flips the thesis. Every AlphaLenz angle is scored and falsifiable.

Full report via the link in bio 👆

Not investment advice. For research & informational purposes.

#macro #markets #investing #nasdaq #stocks #stockmarket #oil #oversold #softlanding #fed #interestrates #economy #quant #aiinfinance #fintech #tradingview #investor #marketanalysis #AlphaLenz`;
```

- [ ] **Step 3: variants를 재구성한다**

기존 `linkedin`·`x` variant의 인라인 슬라이드를 상수 참조로 바꾸고 `instagram`을 추가한다.

```ts
  variants: [
    { id: 'linkedin', label: 'LinkedIn', width: 1080, height: 1350, slides },
    { id: 'x', label: 'X', width: 1920, height: 1080, caption: { ko: xCaptionKo, en: xCaptionEn }, slides: twitterSlides },
    { id: 'instagram', label: 'Instagram', width: 1080, height: 1350, caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
  ],
```

- [ ] **Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 출력 없음

- [ ] **Step 5: 브라우저로 확인한다**

`npm run dev`가 돌고 있지 않으면 띄운다. `http://localhost:5173/` → AlphaLenz → 카드뉴스 → `공포는 과했다, 바닥은 버틴다`.

확인 항목:
1. 플랫폼 토글이 `LinkedIn · X · Instagram` 3개
2. Instagram 탭에서 7장이 링크드인과 동일하게 보인다(좌우 네비 정상)
3. `게시 본문` 패널에 인스타 캡션이 나오고 KO/EN 토글이 각 언어를 보여준다
4. `이 슬라이드 PNG` 다운로드가 되고 파일명이 `stock-excessfear-2026-07-27-instagram-en-01.png`
5. 콘솔 `error`·`warn` 0건

- [ ] **Step 6: 커밋**

```bash
git add src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck.ts
git commit -m "feat(cardnews): 인스타 이미지 캐러셀 variant + 전용 캡션"
```

---

### Task 3: 9:16 릴스 프레임 + 뷰어 프리뷰

**Files:**
- Create: `src/shell/cardnews/ReelsFrame.tsx`
- Modify: `src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck.ts` (variants에 `reels` 추가)
- Modify: `src/shell/cardnews/CardNewsViewer.tsx`

**Interfaces:**
- Consumes: `reelsTiming`·`slideAtFrame`·`TRANSITION_FRAMES`·`REELS_FPS` (Task 1), `MacroSlide` (기존), `ResolvedVariant.kind` (Task 1)
- Produces:
  - `ReelsFrame({ slides, timing, frame, meta }: ReelsFrameProps)` — `export interface ReelsFrameProps { slides: AnySlide[]; timing: ReelsTiming; frame: number; meta?: string }`
  - `REELS_W = 1080`, `REELS_H = 1920`
  - 덱 variant `id: 'reels'`, `kind: 'reels'`

- [ ] **Step 1: `ReelsFrame.tsx`를 만든다**

`MacroSlide`(1080×1350)를 0.9로 축소해 972×1215로 얹는다. 세로 배치는 상단 96 패딩 + 헤더 + 카드 + CTA로, 하단에 인스타 릴스 UI(캡션·액션 버튼)가 덮는 ~320px를 비워둔다.

전환은 `frame`에서만 계산한다. 카드는 항상 1장만 마운트한다(7장 상시 마운트하면 렌더 프레임당 비용이 7배).

```tsx
import type { AnySlide, MacroSlide as MacroSlideT } from '../../cardnews/types';
import { slideAtFrame, TRANSITION_FRAMES, type ReelsTiming } from '../../cardnews/reels';
import { MacroSlide } from './MacroSlide';

export const REELS_W = 1080;
export const REELS_H = 1920;

/** 카드 스케일 — 1080×1350 → 972×1215 */
const CARD_SCALE = 0.9;
const CARD_W = Math.round(1080 * CARD_SCALE);
const CARD_H = Math.round(1350 * CARD_SCALE);

const SANS = "'Space Grotesk', -apple-system, 'Segoe UI', sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace";
const MINT = '#4FD1A5';

export interface ReelsFrameProps {
  slides: AnySlide[];
  timing: ReelsTiming;
  /** 절대 프레임 — Remotion은 useCurrentFrame(), 뷰어는 Player가 넘긴다 */
  frame: number;
  /** 우상단 날짜 (예: '2026·07·27') */
  meta?: string;
}

/** 9:16 릴스 프레임 — 4:5 MacroSlide를 그대로 재활용하고 브랜드/진행바/CTA를 두른다.
    frame만으로 출력이 결정된다(렌더 결정론). Remotion API를 import하지 않는다. */
export function ReelsFrame({ slides, timing, frame, meta }: ReelsFrameProps) {
  const { index, local } = slideAtFrame(timing, frame);
  const slide = index >= 0 ? slides[index] : undefined;

  // 등장 전환 — ease-out cubic. CSS transition을 쓰지 않는다(프레임 결정론)
  const p = Math.min(1, Math.max(0, local / TRANSITION_FRAMES));
  const e = 1 - Math.pow(1 - p, 3);

  return (
    <div style={{
      width: REELS_W, height: REELS_H, background: '#0A0D11', color: '#ECEEF1',
      fontFamily: SANS, padding: '96px 54px 0', boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      textAlign: 'left',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(120% 60% at 100% 0%, rgba(79,209,165,0.10), transparent 55%)',
      }} />

      {/* 브랜드 + 날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '0.04em' }}>
          AlphaLenz<span style={{ color: '#6A727C', fontWeight: 400 }}> Macro</span>
        </div>
        {meta && <div style={{ fontFamily: MONO, fontSize: 24, color: '#6A727C', letterSpacing: '0.1em' }}>{meta}</div>}
      </div>

      {/* 진행 바 — 슬라이드 수만큼 세그먼트 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 34, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 7, flex: 1 }}>
          {slides.map((_, i) => (
            <span key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i <= index ? MINT : '#242A32',
            }} />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 24, color: '#6A727C', letterSpacing: '0.08em' }}>
          {index + 1} / {slides.length}
        </span>
      </div>

      {/* 카드 — 1장만 마운트. translateY + opacity로 등장 */}
      <div style={{
        marginTop: 60, width: CARD_W, height: CARD_H, borderRadius: 20, overflow: 'hidden',
        position: 'relative', opacity: e, transform: `translateY(${(1 - e) * 28}px)`,
      }}>
        {slide && (
          <div style={{ transform: `scale(${CARD_SCALE})`, transformOrigin: 'top left', width: 1080, height: 1350 }}>
            <MacroSlide slide={slide as MacroSlideT} meta={meta} />
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 44, fontFamily: MONO, fontSize: 26, color: MINT, letterSpacing: '0.1em', position: 'relative' }}>
        alpha-lenz.com →
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 덱에 reels variant를 추가한다**

`deck.ts`의 `variants` 배열 끝에 넣는다. 인스타 캡션을 공유한다(같은 계정·같은 리포트).

```ts
    { id: 'reels', label: 'Reels', width: 1080, height: 1920, kind: 'reels', caption: { ko: igCaptionKo, en: igCaptionEn }, slides },
```

- [ ] **Step 3: 뷰어에 Reels 분기를 넣는다**

`CardNewsViewer.tsx` 수정. 4곳이다.

(a) import 추가. Remotion `<Player>`는 Task 4에서 붙인다 — 이 태스크에서는 자체 프레임 클럭으로 자동 전환을 먼저 성립시킨다(릴스 프레임이 맞는지를 Remotion 문제와 분리해 검증하기 위해).

```tsx
import { reelsTiming, REELS_FPS } from '../../cardnews/reels';
import { ReelsFrame } from './ReelsFrame';
```

기존 react import를 `useMemo` 포함으로 바꾼다: `import { useEffect, useMemo, useRef, useState } from 'react';`

(b) `variant` 계산 아래에 릴스 상태를 둔다:

```tsx
  const isReels = variant.kind === 'reels';
  const timing = useMemo(() => (isReels ? reelsTiming(variant.slides, variant.seconds) : null), [isReels, variant]);

  // 릴스 임시 프리뷰 클럭 — Task 4에서 <Player>로 교체된다
  const [rf, setRf] = useState(0);
  useEffect(() => {
    if (!isReels || !timing || timing.totalFrames === 0) return;
    const id = window.setInterval(() => setRf((v) => (v + 1) % timing.totalFrames), 1000 / REELS_FPS);
    return () => window.clearInterval(id);
  }, [isReels, timing]);
```

(c) 슬라이드 본체를 릴스일 때 갈아낀다. **현재 143-156행**의 `<div className="flex flex-1 items-center justify-center gap-5">` 블록에서, 그 안의 자식 3개(prev 버튼 / 카드 `<button>` / next 버튼)를 삼항 연산자의 `:` 쪽으로 **그대로 옮기고**(내용 수정 없음, `<>…</>`로 감싼다), `?` 쪽에 릴스 프레임을 넣는다.

```tsx
      <div className="flex flex-1 items-center justify-center gap-5">
        {isReels && timing ? (
          <div style={{ width: dispW, height: dispH, overflow: 'hidden', borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,.55)' }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: W, height: H }}>
              <ReelsFrame slides={variant.slides} timing={timing} frame={rf} meta={macroMeta} />
            </div>
          </div>
        ) : (
          <>{/* ← 기존 자식 3개(prev · 카드 button · next)를 여기로 이동 */}</>
        )}
      </div>
```

(d) 하단 컨트롤(**현재 159-179행**)에서 릴스일 때 인덱스 표시와 PNG/ZIP/PDF 버튼 3개를 감춘다. `게시 본문` 버튼 블록(173-178행)은 **건드리지 않는다** — 릴스에서도 그대로 보여야 한다.

구체적으로: `<span>{i + 1} / {total}</span>`부터 PDF 버튼까지(160-172행) 4개 요소를 `{!isReels && (<>…</>)}`로 감싸고, 그 **직후**에 릴스 정보 표시를 추가한다.

```tsx
        {isReels && timing && (
          <span className="font-mono text-[12px] tabular-nums text-zinc-500">
            {(timing.totalFrames / REELS_FPS).toFixed(1)}s · {W}×{H} · {REELS_FPS}fps
          </span>
        )}
```

(e) 화면 밖 export 노드(**현재 215-219행**)를 릴스에서 렌더하지 않는다 — PNG/PDF 대상이 아니고, `MacroSlide` 7장 상시 마운트 비용을 피한다. 기존 `<div style={{ position: 'fixed', left: -99999, … }}>` 블록 전체를 `{!isReels && ( … )}`로 감싸기만 한다(내부는 수정 없음).

(f) 키보드 좌우 네비를 릴스에서 끈다(80-88행 `useEffect`). `Escape`는 유지한다.

```tsx
      if (e.key === 'ArrowLeft') { if (!isReels) setI((v) => (v - 1 + total) % total); }
      else if (e.key === 'ArrowRight') { if (!isReels) setI((v) => (v + 1) % total); }
```

의존성 배열을 `[total, zoomed, isReels]`로 바꾼다.

- [ ] **Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 출력 없음

- [ ] **Step 5: 브라우저로 확인한다**

`http://localhost:5173/` → AlphaLenz → 카드뉴스 → 07-27 덱 → `Reels` 탭.

확인 항목:
1. 토글이 `LinkedIn · X · Instagram · Reels` 4개
2. 9:16 세로 프레임에 카드가 얹혀 있고, 상단 브랜드+진행 바, 하단 `alpha-lenz.com →`
3. **시간이 지나면 슬라이드가 자동으로 넘어간다.** 진행 바가 채워지고 `n / 7`이 증가한다
4. 하단에 `29.0s · 1080×1920 · 30fps` 표시, PNG/PDF 버튼은 안 보임
5. `게시 본문`에 인스타 캡션
6. 다른 탭(LinkedIn/X/Instagram)으로 돌아가면 기존 동작 그대로
7. 콘솔 `error`·`warn` 0건

- [ ] **Step 6: 커밋**

```bash
git add src/shell/cardnews/ReelsFrame.tsx src/shell/cardnews/CardNewsViewer.tsx src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck.ts
git commit -m "feat(cardnews): 9:16 릴스 프레임 + 뷰어 자동 전환 프리뷰"
```

---

### Task 4: Remotion 컴포지션 + mp4 렌더

**Files:**
- Create: `remotion/CardNewsReels.tsx`
- Create: `remotion/cardnewsReelsCompositions.ts`
- Modify: `remotion/Root.tsx`
- Modify: `src/shell/cardnews/CardNewsViewer.tsx` (임시 클럭 → `<Player>`, 렌더 명령 복사 버튼)
- Modify: `package.json`

**Interfaces:**
- Consumes: `ReelsFrame` (Task 3), `reelsTiming`·`REELS_FPS` (Task 1), `getVariants` (기존). 캔버스 크기는 `REELS_W`/`REELS_H` 상수가 아니라 variant의 `width`/`height`(1080×1920)에서 읽는다 — 컴포지션 등록과 뷰어가 같은 출처를 쓰게.
- Produces:
  - `CardNewsReels` (Remotion 컴포넌트), `cardNewsReelsSchema` (zod)
  - `REELS_DECKS: CardNewsDeck[]`, `getReelsDeck(id: string): CardNewsDeck`
  - 컴포지션 id `reels-<deckId>`
  - npm script `render:reels`

- [ ] **Step 1: 렌더 대상 덱 목록을 만든다**

`remotion/cardnewsReelsCompositions.ts`. webpack은 Vite 전용 `import.meta.glob`(`src/cardnews/registry.ts`)을 못 쓰므로 덱을 직접 import한다 — `findleCompositions.ts`와 동일 관례.

```ts
import type { CardNewsDeck } from '../src/cardnews/types';
import excessFear from '../src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck';

/**
 * 릴스 렌더 대상 덱 단일 출처.
 * webpack 번들러는 Vite 전용 import.meta.glob(cardnews/registry)을 못 쓰므로 덱을 직접 import한다.
 * 릴스를 추가하려면 이 배열에 한 줄.
 */
export const REELS_DECKS: CardNewsDeck[] = [excessFear];

export function getReelsDeck(id: string): CardNewsDeck {
  const deck = REELS_DECKS.find((d) => d.id === id);
  if (!deck) throw new Error(`[cardnews:reels] 등록되지 않은 덱: ${id}`);
  return deck;
}
```

- [ ] **Step 2: Remotion 컴포지션 컴포넌트를 만든다**

`remotion/CardNewsReels.tsx`. 폰트는 `staticFile()` + `FontFace`로 로드한다 — `remotion/styles.css`에 `@font-face`를 넣으면 webpack css-loader가 Vite public 경로를 못 읽어 번들이 깨진다(해당 파일 주석 참조).

앱 임베드(`<Player>`)에서는 `index.css`가 이미 폰트를 로드했으므로 `document.fonts.check()`로 확인해 `delayRender` 핸들을 만들지 않는다 — `DemoVideo.tsx:114-127`과 동일한 가드(StrictMode 고아 핸들 방지).

로드 실패 시 `continueRender`를 부르지 않아 렌더가 타임아웃으로 **실패**한다. 폴백 폰트로 조용히 렌더되면 산출물이 망가진 채 나오므로 실패시키는 게 맞다.

```tsx
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { ReelsFrame } from '../src/shell/cardnews/ReelsFrame';
import { reelsTiming } from '../src/cardnews/reels';
import { getVariants } from '../src/cardnews/types';
import { getReelsDeck } from './cardnewsReelsCompositions';

export const cardNewsReelsSchema = z.object({ deckId: z.string() });

/** 카드뉴스 자체 호스팅 폰트 — public/fonts. remotion/styles.css는 이 @font-face를 담지 못한다. */
const FACES = [
  { family: 'Space Grotesk', weight: '400', file: 'fonts/space-grotesk-latin-400-normal.woff2' },
  { family: 'Space Grotesk', weight: '500', file: 'fonts/space-grotesk-latin-500-normal.woff2' },
  { family: 'Space Grotesk', weight: '600', file: 'fonts/space-grotesk-latin-600-normal.woff2' },
  { family: 'Space Grotesk', weight: '700', file: 'fonts/space-grotesk-latin-700-normal.woff2' },
  { family: 'IBM Plex Mono', weight: '400', file: 'fonts/ibm-plex-mono-latin-400-normal.woff2' },
  { family: 'IBM Plex Mono', weight: '500', file: 'fonts/ibm-plex-mono-latin-500-normal.woff2' },
  { family: 'IBM Plex Mono', weight: '600', file: 'fonts/ibm-plex-mono-latin-600-normal.woff2' },
];

function useCardnewsFonts() {
  // 앱 임베드(Player)에선 index.css가 이미 로드 → 핸들을 만들지 않는다(StrictMode 고아 핸들 방지)
  const [handle] = useState<number | null>(() =>
    typeof document !== 'undefined'
      && FACES.every((f) => document.fonts?.check(`16px "${f.family}"`))
      ? null
      : delayRender('Loading cardnews fonts'),
  );

  useEffect(() => {
    if (handle === null) return;
    let cancelled = false;
    Promise.all(
      FACES.map(async (f) => {
        const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {
          weight: f.weight, style: 'normal',
        });
        await face.load();
        document.fonts.add(face);
      }),
    )
      .then(() => { if (!cancelled) continueRender(handle); })
      // 실패 시 continueRender를 부르지 않는다 → 렌더 타임아웃으로 실패. 폴백 폰트로 조용히 나가면 안 된다.
      .catch((err) => { console.error('[cardnews:reels] 폰트 로드 실패', err); });
    return () => { cancelled = true; };
  }, [handle]);
}

export const CardNewsReels: React.FC<z.infer<typeof cardNewsReelsSchema>> = ({ deckId }) => {
  useCardnewsFonts();
  const frame = useCurrentFrame();

  const deck = getReelsDeck(deckId);
  const variant = getVariants(deck).find((v) => v.kind === 'reels');
  if (!variant) throw new Error(`[cardnews:reels] ${deckId}에 kind:'reels' variant가 없다`);

  const timing = reelsTiming(variant.slides, variant.seconds);
  const meta = deck.date.replace(/-/g, '·');

  return (
    <AbsoluteFill style={{ background: '#0A0D11' }}>
      <ReelsFrame slides={variant.slides} timing={timing} frame={frame} meta={meta} />
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: `Root.tsx`에 컴포지션을 등록한다**

import를 추가한다.

```tsx
import { CardNewsReels, cardNewsReelsSchema } from './CardNewsReels';
import { REELS_DECKS } from './cardnewsReelsCompositions';
import { REELS_FPS, reelsTiming } from '../src/cardnews/reels';
import { getVariants } from '../src/cardnews/types';
```

기존 Findle `Folder` 목록 **뒤**에 `cardnews` 폴더를 추가한다. macro 슬라이드는 영어 고정이라 언어별 분리를 하지 않는다(Findle과 다른 점).

```tsx
      <Folder name="cardnews">
        {REELS_DECKS.flatMap((deck) => {
          const v = getVariants(deck).find((x) => x.kind === 'reels');
          if (!v || v.slides.length === 0) {
            console.warn(`[cardnews:reels] ${deck.id} — reels variant 없음 또는 슬라이드 0장, 컴포지션 등록 생략`);
            return [];
          }
          const timing = reelsTiming(v.slides, v.seconds);
          return [
            <Composition
              key={deck.id}
              id={`reels-${deck.id}`}
              component={CardNewsReels}
              schema={cardNewsReelsSchema}
              durationInFrames={timing.totalFrames}
              fps={REELS_FPS}
              width={v.width}
              height={v.height}
              defaultProps={{ deckId: deck.id }}
            />,
          ];
        })}
      </Folder>
```

- [ ] **Step 4: 뷰어의 임시 클럭을 `<Player>`로 교체한다**

Task 3 Step 3(b)에서 넣은 `rf` state와 `setInterval` `useEffect`를 **삭제**하고, import를 추가한다.

```tsx
import { Player } from '@remotion/player';
import { CardNewsReels } from '../../../remotion/CardNewsReels';
```

Task 3 Step 3(c)의 릴스 본체를 `<Player>`로 바꾼다. Player가 자체 스케일링을 하므로 수동 `transform: scale()` 래퍼가 필요 없다.

```tsx
        {isReels && timing ? (
          <div style={{ width: dispW, height: dispH, overflow: 'hidden', borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,.55)' }}>
            <Player
              component={CardNewsReels}
              inputProps={{ deckId: deck.id }}
              durationInFrames={timing.totalFrames}
              fps={REELS_FPS}
              compositionWidth={W}
              compositionHeight={H}
              style={{ width: dispW, height: dispH }}
              autoPlay
              loop
              controls
            />
          </div>
        ) : (
```

하단 컨트롤에 렌더 명령 복사 버튼을 추가한다(Task 3 Step 3(d)의 `isReels` 블록 안). 덱 id를 넣은 명령을 클립보드에 넣으므로 덱이 늘어도 수정이 필요 없다.

```tsx
        {isReels && timing && (
          <>
            <span className="font-mono text-[12px] tabular-nums text-zinc-500">
              {(timing.totalFrames / REELS_FPS).toFixed(1)}s · {W}×{H} · {REELS_FPS}fps
            </span>
            <button onClick={copyRenderCmd}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${cmdCopied ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20'}`}>
              {cmdCopied ? <><Check className="h-4 w-4" /> 복사됨</> : <><FileDown className="h-4 w-4" /> mp4 렌더 명령 복사</>}
            </button>
          </>
        )}
```

`copyCaption` 옆에 핸들러를 추가한다.

```tsx
  const [cmdCopied, setCmdCopied] = useState(false);
  const renderCmd = `npx remotion render remotion/index.ts reels-${deck.id} out/${deck.id}-reels.mp4 --concurrency=4`;
  const copyRenderCmd = async () => {
    try {
      await navigator.clipboard.writeText(renderCmd);
      setCmdCopied(true);
      setTimeout(() => setCmdCopied(false), 1600);
    } catch (err) { console.error('[cardnews:copy]', err); }
  };
```

- [ ] **Step 5: `package.json`에 렌더 스크립트를 추가한다**

셸 변수 보간(`$npm_config_*`)은 PowerShell에서 동작하지 않으므로 덱 id를 하드코딩한다.

```json
    "render:reels": "remotion render remotion/index.ts reels-stock-excessfear-2026-07-27 out/stock-excessfear-2026-07-27-reels.mp4 --concurrency=4",
```

`remotion.config.ts`의 `setConcurrency(1)`은 시나리오 엔진 때문인데 릴스는 무관하므로 위처럼 CLI 플래그로 덮는다. **설정 파일은 수정하지 않는다.**

- [ ] **Step 6: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 출력 없음. `tsconfig.json`의 `include`가 `["src"]`라 `remotion/`은 여기서 검사되지 않는다 — Step 8의 `npm run build`가 관문이다.

- [ ] **Step 7: 뷰어에서 Player 프리뷰를 확인한다**

`http://localhost:5173/` → 07-27 덱 → `Reels` 탭.

1. Player 컨트롤(재생/일시정지·타임라인)이 보이고 자동재생·루프한다
2. 타임라인을 0 / 중간 / 끝으로 끌면 슬라이드가 그 위치에 맞게 바뀐다
3. 폰트가 폴백(고딕)이 아니라 Space Grotesk·IBM Plex Mono로 보인다
4. `mp4 렌더 명령 복사` 클릭 → `복사됨`으로 바뀌고 클립보드에 `npx remotion render remotion/index.ts reels-stock-excessfear-2026-07-27 …`
5. 콘솔 `error`·`warn` 0건 (특히 delayRender 관련 경고 없음)

- [ ] **Step 8: Remotion 번들이 깨지지 않는지 확인한다**

Run: `npm run build`
Expected: 통과. `tsc --noEmit && vite build && remotion bundle`을 모두 돈다. **이 단계가 `import.meta.glob` 유입과 폰트 경로 문제를 잡는 관문이다.** 실패하면 `src/cardnews/registry.ts`가 릴스 경로로 끌려왔는지부터 확인한다.

- [ ] **Step 9: mp4를 실제로 렌더한다**

Run: `npm run render:reels`
Expected: `out/stock-excessfear-2026-07-27-reels.mp4` 생성. 로그에 `870` 프레임, 1080×1920.

파일을 열어 확인한다:
1. 해상도 1080×1920, 길이 약 29초
2. 슬라이드 7장이 순서대로 전환되고, 각 등장에 페이드+상향 이동이 보인다
3. **폰트가 Space Grotesk·IBM Plex Mono다**(폴백이면 폰트 로드가 실패한 것 — 렌더가 통과했더라도 산출물 불량)
4. 1px 구분선(`SectionHead`)과 7px 지표 바(`Viz`)가 흐려지지 않았다. 흐리면 `ReelsFrame`의 `CARD_SCALE`을 1.0으로 올리고 좌우 패딩을 `54px → 0`으로 줄인다(설계 문서 위험 항목)

- [ ] **Step 10: 기존 덱 회귀를 확인한다**

뷰어에서 다음 3개를 열어 정상 동작을 확인한다.
- `btc-riskoff-2026-06-13` — variants 없는 research 덱(단일 variant 폴백 경로)
- `stock-fakerebound-2026-06-15` — variants 없는 macro 덱
- `stock-softlanding-2026-06-22` — LinkedIn/X 2-variant 덱

각각 슬라이드 렌더·좌우 네비·PNG 버튼·게시 본문이 이전과 같아야 하고 콘솔이 깨끗해야 한다.

- [ ] **Step 11: 커밋**

```bash
git add remotion/CardNewsReels.tsx remotion/cardnewsReelsCompositions.ts remotion/Root.tsx src/shell/cardnews/CardNewsViewer.tsx package.json
git commit -m "feat(cardnews): Remotion 릴스 컴포지션 + mp4 렌더 파이프라인"
```

`out/`이 git에 추적되면 `.gitignore`에 `out/`을 추가하고 함께 커밋한다.

---

### Task 5: 문서 갱신

다음 덱부터 인스타 2종이 자동으로 포함되게 만든다.

**Files:**
- Modify: `docs/cardnews/authoring-guide.md`
- Modify: `.claude/skills/alphalenz-carousel/SKILL.md`

**Interfaces:**
- Consumes: Task 1~4의 결과(variant 4종 구조, `kind`/`seconds`, 렌더 명령)
- Produces: 없음(문서)

- [ ] **Step 1: `authoring-guide.md`에 인스타 캡션 규칙을 추가한다**

`## 6. 데이터 정확성 가드` **앞**에 새 섹션을 넣는다.

```markdown
## 5-1. 플랫폼별 게시 본문(caption)

`caption`은 항상 `{ ko, en }`(`LangText`)로 분리한다. 플랫폼마다 본문을 따로 쓴다 — 링크드인·X·인스타 본문이 같으면 안 된다.

| | LinkedIn | X | Instagram (릴스 공유) |
|---|---|---|---|
| 훅 | 첫 문장 | 첫 문장 | **첫 2줄에 결론까지** (더보기 컷 이전) |
| 링크 | 본문에 URL | 본문에 URL | **"전체 리포트는 프로필 링크"** — URL 미표기 |
| 티커 | 텍스트 (NDX) | 캐시태그 ($NDX) | 텍스트 |
| 해시태그 | 6~8개 | 3~4개 | **15~20개** (한/영 혼합) |
| 길이·톤 | 길고 서술적 | 짧고 압축 | 중간 — 근거 불릿 유지, 내러티브는 1~2문장 |

수치·티커·방향·무효화는 세 플랫폼에서 100% 동일하다(§6 데이터 정확성 가드). 표기만 매체에 맞게 바꾼다.
```

- [ ] **Step 2: `SKILL.md`의 테마 표와 절차를 갱신한다**

`## 테마 선택` 표의 `macro` 행 `비율·구성` 칸을 바꾼다.

```
세로 1080×1350 LinkedIn 7장 + X 16:9 1장 + Instagram 4:5 7장 + Reels 9:16 영상 (`variants`)
```

`## 게시 본문(caption) 규칙` 표에 Instagram 열을 추가한다(Step 1의 표와 동일한 내용).

`## 절차` 4번(파일 생성) 뒤에 릴스 항목을 넣는다.

```markdown
5. **variant 4종을 채운다.** 슬라이드 배열을 `const slides`로 뽑아 linkedin·instagram·reels가 **같은 배열을 참조**하게 한다(수치 불일치 원천 차단). reels는 `kind: 'reels'` + 인스타 캡션 공유. 타이밍은 `src/cardnews/reels.ts`의 타입별 기본값이 자동 적용된다(7장 = 29초).
6. **릴스 mp4가 필요하면** `remotion/cardnewsReelsCompositions.ts`의 `REELS_DECKS`에 덱을 한 줄 추가하고(webpack은 `import.meta.glob`을 못 쓴다), 뷰어 Reels 탭의 `mp4 렌더 명령 복사`로 나온 명령을 실행한다.
```

기존 5번(검증)은 7번으로 밀고, 검증 항목에 릴스를 추가한다.

```markdown
   - **릴스:** Reels 탭에서 Player 자동재생 확인. mp4를 렌더했으면 폰트가 폴백(고딕)이 아닌지 확인 — 폴백이면 폰트 로드가 실패한 것이다.
```

`## 함정` 표에 3행을 추가한다.

```markdown
| Remotion 번들(`npm run build`)이 깨진다 | 릴스 경로가 `src/cardnews/registry.ts`를 import했다. webpack은 Vite 전용 `import.meta.glob`을 못 쓴다 — 덱을 직접 import할 것. |
| 렌더된 mp4의 폰트가 고딕으로 나온다 | `remotion/styles.css`에는 로컬 `/fonts` @font-face를 넣을 수 없다(webpack css-loader가 Vite public 경로를 못 읽음). `CardNewsReels.tsx`의 `staticFile()` + `FontFace` 경로를 확인한다. |
| 릴스 슬라이드가 안 넘어간다 / 렌더마다 다르다 | `Date.now()`·CSS transition을 썼다. `useCurrentFrame()` 값에서만 계산해야 한다(커밋 `4f95428` 관례). |
```

- [ ] **Step 3: 문서가 실제 코드와 일치하는지 확인한다**

`docs/cardnews/authoring-guide.md`와 `.claude/skills/alphalenz-carousel/SKILL.md`를 다시 읽고 다음을 확인한다.
1. 표에 적은 variant id(`linkedin`·`x`·`instagram`·`reels`)가 `deck.ts`의 실제 id와 같다
2. 타이밍 총합(29초)이 `reels.ts`의 `SECONDS` 합과 같다
3. 언급한 파일 경로가 모두 존재한다

- [ ] **Step 4: 커밋**

```bash
git add docs/cardnews/authoring-guide.md .claude/skills/alphalenz-carousel/SKILL.md
git commit -m "docs(cardnews): 인스타 캐러셀·릴스 제작 규칙 반영"
```

---

## 완료 기준

1. `node --test tests/` — 7 tests PASS
2. `npx tsc --noEmit` — 통과
3. `npm run build` — 통과 (Remotion 번들 포함)
4. 뷰어에서 07-27 덱의 토글 4개(`LinkedIn · X · Instagram · Reels`)가 모두 정상
5. `out/stock-excessfear-2026-07-27-reels.mp4` — 1080×1920 · 약 29초 · 폰트 정상
6. 기존 덱 3개(06-13 research, 06-15 macro 단일, 06-22 2-variant) 회귀 없음
7. 콘솔 `error`·`warn` 0건
