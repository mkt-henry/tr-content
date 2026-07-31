# 인스타그램 카드뉴스 2종 (이미지 캐러셀 + 릴스) — 설계

- 작성일: 2026-07-31
- 대상 덱: `stock-excessfear-2026-07-27` **1개만**. 기존 macro 덱(07-25, 06-22, 06-17, 06-15) 소급 적용은 별건.
- 배경: 현재 카드뉴스는 링크드인(4:5) + X(16:9) 2개 계정용으로만 산출된다. 인스타그램 계정이 추가되면서 (1) 이미지 캐러셀, (2) 릴스(자동 전환 영상) 2종이 필요하다.

## 목표

1. 인스타 이미지 캐러셀 — 1080×1350, 링크드인과 동일한 7장, 인스타 전용 캡션.
2. 인스타 릴스 — 1080×1920 9:16 영상. 슬라이드가 시간에 따라 자동 전환. 앱에서 미리보고 mp4로 렌더.
3. 기존 링크드인·X 산출물과 수치·티커·방향·무효화가 **구조적으로** 동일해야 한다(사람이 맞추는 게 아니라 같은 배열을 참조).
4. 기존 덱 6개는 아무 변화 없이 동작한다.

## 비목표

- 9:16 전용 풀블리드 레이아웃 신규 작성(4:5 카드 재활용으로 대체).
- 릴스 오디오/음악 트랙(인스타 앱에서 붙인다).
- 인스타 전용 카피 재작성(링크드인 슬라이드 그대로 재사용).
- 기존 덱 소급 적용.

## 결정 사항과 근거

| 결정 | 선택 | 근거 |
|---|---|---|
| 릴스 레이아웃 | 4:5 카드 재활용 + 9:16 프레임 | 신규 레이아웃 0개. `MacroSlide.tsx`는 비율별 레이아웃을 손으로 짜는 구조라 9:16 7종 추가는 작업량이 과하다. |
| 릴스 산출 | Remotion 재생 + mp4 렌더 | 레포에 Remotion이 이미 있고, 인스타 업로드에는 실제 mp4가 필요하다. 화면녹화는 프레임·품질 보장 불가. |
| 인스타 캐러셀 내용 | 링크드인 7장 그대로 | 인스타 최적 규격(1080×1350)이 링크드인 variant와 동일. 덱당 작업량 최소, 수치 불일치 원천 차단. |
| 릴스 타이밍 | 슬라이드별 가중, 약 29초 | 릴스 완주율이 좋은 15~30초 구간. 지표 6개가 들어가는 `m-data`는 3초로 못 읽는다. |
| 오디오 | 없음 | 인스타 앱에서 트렌딩 음원을 붙이는 것이 도달률상 정석. |

## 아키텍처

### 유닛 경계

```
src/cardnews/types.ts          DeckVariant.kind 필드 추가 (데이터 모델)
src/cardnews/reels.ts          타이밍 산출 — 순수 함수, 의존 없음 (단일 출처)
src/shell/cardnews/ReelsFrame.tsx   9:16 프레임 — frame을 받아 렌더하는 순수 컴포넌트
remotion/CardNewsReels.tsx     Remotion 래퍼 — useCurrentFrame + 폰트 로드
remotion/cardnewsReelsCompositions.ts   렌더 대상 덱 명시 목록
remotion/Root.tsx              컴포지션 등록 (기존 파일 수정)
src/shell/cardnews/CardNewsViewer.tsx   플랫폼 토글 + Reels 분기 (기존 파일 수정)
src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck.ts   variant 2개 추가
```

각 유닛의 책임:

- **`reels.ts`** — 슬라이드 배열 → 프레임 타이밍. 뷰어와 Remotion이 **함께 import**하므로 미리보기와 mp4가 프레임 단위로 일치한다. 순수 함수라 단독 테스트 가능.
- **`ReelsFrame.tsx`** — `{ slides, frame, meta }`를 받아 9:16 화면 1프레임을 렌더한다. Remotion API를 import하지 않는다 → 앱/렌더 어디서든 쓸 수 있고, 프레임을 주면 결과가 결정된다.
- **`CardNewsReels.tsx`** — Remotion 경계. `useCurrentFrame()`을 `ReelsFrame`에 넘기고 폰트 로드를 책임진다.

### 1. 데이터 모델 (`src/cardnews/types.ts`)

`DeckVariant`에 필드 1개만 추가한다.

```ts
export interface DeckVariant {
  // …기존 필드
  /** 'cards'(기본) = 정적 카드 · 'reels' = 9:16 자동 전환 영상 */
  kind?: 'cards' | 'reels';
  /** 릴스 슬라이드별 노출 시간(초). 미지정 시 reels.ts의 타입별 기본값 */
  seconds?: number[];
}
```

기본값이 `'cards'`라 기존 덱 6개와 `getVariants()`는 무영향이다. `ResolvedVariant`에도 `kind`를 통과시킨다.

### 2. 덱 구조 (`deck.ts`)

슬라이드 배열을 상수로 뽑아 3개 variant가 **같은 배열을 참조**한다.

```ts
const slides: AnySlide[] = [ /* m-cover … m-cta 7장 */ ];
const twitterSlides: AnySlide[] = [ /* m-twitter 1장 */ ];

variants: [
  { id: 'linkedin',  label: 'LinkedIn',  width: 1080, height: 1350, slides },
  { id: 'x',         label: 'X',         width: 1920, height: 1080, slides: twitterSlides, caption: { ko: xCaptionKo, en: xCaptionEn } },
  { id: 'instagram', label: 'Instagram', width: 1080, height: 1350, slides, caption: { ko: igCaptionKo, en: igCaptionEn } },
  { id: 'reels',     label: 'Reels',     width: 1080, height: 1920, slides, caption: { ko: igCaptionKo, en: igCaptionEn }, kind: 'reels' },
]
```

수치를 두 번 쓰지 않으므로 링크드인·인스타·릴스 사이의 데이터 불일치가 발생할 수 없다.

### 3. 타이밍 (`src/cardnews/reels.ts`)

```ts
/** 릴스 프레임레이트. remotion/meta.ts의 FPS(데모 영상용)와 별개로 둔다 —
    src → remotion 방향 import는 의존 방향이 반대라 순환 위험이 있다. */
export const REELS_FPS = 30;

const SECONDS: Record<string, number> = {
  'm-cover': 3, 'm-call': 4, 'm-narrative': 5, 'm-data': 5,
  'm-tensions': 5, 'm-plan': 4, 'm-cta': 3,
};
const FALLBACK_SECONDS = 4;
/** 전환 애니메이션 길이(프레임) */
export const TRANSITION_FRAMES = 12;

export interface ReelsTiming {
  /** 슬라이드별 노출 프레임 수 */
  frames: number[];
  /** 슬라이드별 시작 프레임 (누적) */
  offsets: number[];
  totalFrames: number;
}
export function reelsTiming(slides: AnySlide[], seconds?: number[]): ReelsTiming;
/** frame → 슬라이드 인덱스 + 해당 슬라이드 내 경과 프레임 */
export function slideAtFrame(t: ReelsTiming, frame: number): { index: number; local: number };
```

7장 기준 총 29초(3+4+5+5+5+4+3) = 870프레임. `seconds`가 주어지면 그것을 쓰고, 슬라이드 수와 길이가 다르면 앞에서부터 채우고 나머지는 타입별 기본값을 쓴다.

`Root.tsx`와 뷰어 `<Player>` 모두 `REELS_FPS`를 넘기므로, 프리뷰와 mp4의 프레임레이트가 어긋날 여지가 없다.

### 4. 9:16 프레임 (`src/shell/cardnews/ReelsFrame.tsx`)

```
1080×1920 · 배경 #0A0D11 + 우상단 민트 radial (카드와 동일 계열 → 레터박스가 아니라 프레임으로 읽힌다)
┌─────────────────────────┐
│ 상단 176px                │  AlphaLenz Macro · 2026·07·27
│                          │  진행 바 (▓▓▓░░░ · 3 / 7)
│ ┌─────────────────────┐  │
│ │ MacroSlide 972×1215  │  │  scale(0.9) · transformOrigin top left
│ │ (링크드인 카드 그대로)  │  │  좌우 여백 54px · borderRadius 20
│ └─────────────────────┘  │
│ 하단                      │  alpha-lenz.com
└─────────────────────────┘
```

- props: `{ slides, timing, frame, meta }`. Remotion API를 import하지 않는다.
- 전환: `slideAtFrame()`으로 현재 슬라이드를 고르고, `local < TRANSITION_FRAMES` 구간에서 `opacity 0→1`, `translateY 28px→0`(ease-out). **`useCurrentFrame()` 값에서만 계산**한다.
- `Date.now()`, `Math.random()`, CSS `transition`/`animation`은 쓰지 않는다 — 커밋 `4f95428`("영상 등장 애니메이션을 프레임 기반으로 — 렌더 결정론 확보")이 세운 관례.
- 카드는 항상 1장만 마운트한다(교차 페이드 아님) — `MacroSlide` 7장을 동시에 두면 렌더 프레임마다 비용이 7배가 된다.

### 5. Remotion 컴포지션

**`remotion/CardNewsReels.tsx`**

```tsx
const schema = z.object({ deckId: z.string() });
// deckId → cardnewsReelsCompositions의 명시 목록에서 덱을 찾는다
// useCurrentFrame() → ReelsFrame
```

폰트: `remotion/styles.css`가 로컬 `/fonts/*.woff2` `@font-face`를 **의도적으로 제거**해뒀다(webpack css-loader가 Vite public 경로를 못 읽어 번들이 깨진다 — 해당 파일 주석에 기록됨). 따라서 Space Grotesk 4종 + IBM Plex Mono 3종을 `staticFile()` + `FontFace` API로 로드하고, CLI 렌더에서는 완료까지 `delayRender`로 지연한다. 앱 임베드(Player)에서는 `index.css`가 이미 폰트를 로드했으므로 `document.fonts.check()`로 확인해 **delayRender 핸들을 만들지 않는다** — `DemoVideo.tsx:114-127`과 동일한 가드(StrictMode 고아 핸들 방지).

**`remotion/cardnewsReelsCompositions.ts`**

```ts
import deck from '../src/cardnews/alphalenz/stock-excessfear-2026-07-27/deck';
/** webpack은 Vite 전용 import.meta.glob(cardnews/registry)을 못 쓴다 → 덱을 직접 import.
    릴스 렌더 대상을 추가하려면 이 배열에 한 줄. (findleCompositions.ts와 동일 관례) */
export const REELS_DECKS = [deck];
```

**`remotion/Root.tsx`** — 기존 Findle 폴더 아래에 `cardnews` 폴더를 추가하고, `REELS_DECKS`에서 `kind:'reels'` variant를 가진 덱마다 컴포지션 1개를 등록한다.

- 컴포지션 id: `reels-<deckId>` (예: `reels-stock-excessfear-2026-07-27`)
- `durationInFrames`: `reelsTiming(variant.slides, variant.seconds).totalFrames`
- `width/height`: variant의 1080×1920, `fps`: `REELS_FPS`
- macro 슬라이드는 영어 고정이라 언어별 컴포지션 분리는 하지 않는다(Findle과 다른 점).

**`package.json`** — 덱 id를 하드코딩한 스크립트 1개. 셸 변수 보간(`$npm_config_*`)은 PowerShell에서 동작하지 않으므로 쓰지 않는다.

```json
"render:reels": "remotion render remotion/index.ts reels-stock-excessfear-2026-07-27 out/stock-excessfear-2026-07-27-reels.mp4 --concurrency=4"
```

덱이 늘면 스크립트를 한 줄 추가한다(`render:reels:<slug>`). `remotion.config.ts`의 `setConcurrency(1)`은 시나리오 엔진 때문인데 릴스는 무관하므로 위처럼 CLI 플래그로 덮는다 — 설정 파일은 건드리지 않는다.

### 6. 뷰어 (`CardNewsViewer.tsx`)

플랫폼 토글은 variant 목록에서 자동 생성되므로 `LinkedIn · X · Instagram · Reels` 4개가 그대로 나온다. 추가되는 분기는 `variant.kind === 'reels'`일 때뿐이다.

| | cards (기존) | reels |
|---|---|---|
| 본체 | `MacroSlide` 1장 + 좌우 네비 | `@remotion/player`의 `<Player>` (자동재생·루프·컨트롤) |
| 하단 | 이 슬라이드 PNG · 전체 ZIP · PDF | `mp4 렌더 명령 복사` |
| 공통 | 게시 본문, 언어 토글, 확대 | 게시 본문, 언어 토글 |

- `@remotion/player`는 이미 `dependencies`에 있다(신규 의존성 없음).
- Reels variant에서는 화면 밖 export 노드(`exportRefs`)를 렌더하지 않는다 — PNG/PDF 대상이 아니고, 7장 상시 마운트 비용을 피한다.
- 슬라이드 인덱스 표시(`i + 1 / total`)와 키보드 좌우 네비는 reels에서 숨긴다(Player가 타임라인을 관리).

### 7. 인스타 캡션 규칙

인스타는 캡션의 링크가 클릭되지 않고 첫 2줄만 펼침 전에 보인다. 링크드인·X와 구조가 다르다.

| | LinkedIn | X | **Instagram (릴스 공유)** |
|---|---|---|---|
| 훅 | 첫 문장 | 첫 문장 | **첫 2줄에 결론까지** (더보기 컷 이전) |
| 링크 | 본문에 URL | 본문에 URL | **"전체 리포트는 프로필 링크"** — URL 미표기 |
| 티커 | 텍스트 | 캐시태그 `$NDX` | 텍스트 |
| 해시태그 | 6~8개 | 3~4개 | **15~20개** (한/영 혼합, 매크로·투자·주식) |
| 길이 | 길고 서술적 | 짧고 압축 | 중간 — 근거 불릿은 유지, 긴 내러티브 문단은 1~2문장으로 |

수치·티커·방향·무효화는 다른 플랫폼과 100% 동일하다(데이터 정확성 가드). 릴스는 같은 계정·같은 리포트라 인스타 캡션을 공유한다.

`docs/cardnews/authoring-guide.md`와 `.claude/skills/alphalenz-carousel/SKILL.md`에 위 표와 4-variant 구조를 반영해 다음 덱부터 자동 적용된다.

## 에러 처리

| 상황 | 처리 |
|---|---|
| `kind:'reels'`인데 슬라이드에 타이밍 테이블 미등록 타입이 있다 | `FALLBACK_SECONDS`(4초) 적용. 콘솔에 `[cardnews:reels]` 경고 1건. |
| `seconds` 길이가 슬라이드 수와 불일치 | 앞에서부터 채우고 나머지는 타입별 기본값. 경고 1건. |
| CLI 렌더에서 폰트 로드 실패 | `delayRender` 타임아웃으로 렌더가 실패한다(조용히 폴백 폰트로 렌더되면 산출물이 망가진 채 나오므로, 실패시키는 게 맞다). |
| Player가 없는/구버전 환경 | 해당 없음 — 번들 의존성. |
| variant가 `reels`인데 슬라이드 0장 | `totalFrames` 0 → Remotion 컴포지션 등록에서 제외하고 경고. |

## 검증

1. `npx tsc --noEmit` 통과.
2. 뷰어: AlphaLenz → 카드뉴스 → 07-27 덱 → 토글 4개(LinkedIn·X·Instagram·Reels) 확인. Instagram PNG/PDF 버튼 정상, Reels에서 Player 자동재생.
3. Reels 프리뷰를 여러 시점에서 캡처해 슬라이드가 실제로 전환되는지 확인(예: frame 0 / 200 / 500).
4. 콘솔 `error`·`warn` 0건.
5. mp4 실렌더 1건: 1080×1920 / 30fps / 총 프레임 = `reelsTiming` 결과와 일치.
6. 회귀: 기존 덱 6개(특히 variants 없는 `btc-riskoff-2026-06-13`, `stock-fakerebound-2026-06-15`)를 열어 정상 동작 확인.
7. `npm run build`(= `tsc && vite build && remotion bundle`) 통과 — Remotion 번들에 폰트/glob 문제가 없음을 확인하는 최종 관문.

## 위험

- **Remotion 번들에서 `src/cardnews/registry.ts`가 끌려오면 빌드가 깨진다**(`import.meta.glob`). `ReelsFrame`·`reels.ts`·`deck.ts` 어느 것도 registry를 import하지 않도록 유지해야 한다. 7번 검증(`npm run build`)이 이걸 잡는다.
- `MacroSlide`를 `scale(0.9)`로 축소하면 1px 선(`SectionHead`의 구분선, `Viz`의 7px 바)이 흐려질 수 있다. 실렌더 결과를 보고 필요하면 스케일을 0.9 → 1.0으로 올리고 좌우 여백을 0으로 줄이는 쪽으로 조정한다.
