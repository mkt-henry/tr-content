---
name: alphalenz-carousel
description: Use when the user gives an alpha-lenz.com angle-report link (or similar AlphaLenz report URL) and asks to make a 카드뉴스/carousel/캐러셀 deck. Covers extracting the report, mapping to the deck model, and registering it in this repo.
---

# AlphaLenz 캐러셀 제작 워크플로

링크 1개 → 카드뉴스 덱(`deck.ts`) 1개. 콘텐츠 규칙(슬라이드 타입·글자수 예산·의역 원칙·데이터 정확성)은 **`docs/cardnews/authoring-guide.md`가 단일 출처**다. 이 스킬은 그 규칙을 이 레포에서 실제로 실행하는 절차와 함정만 다룬다.

## 테마 선택 (먼저 정한다)

| 테마 | 비율·구성 | 슬라이드 카피 | 게시 본문(caption) | 쓸 때 |
|---|---|---|---|---|
| **`macro`** (기본·권장) | 세로 1080×1350 LinkedIn 7장 + X 16:9 1장 (`variants`) | **영어 전용** (`m-*` 슬라이드) | 한/영 `LangText` 분리 | **주식·매크로 앵글 리포트.** 세로 핀테크 레이아웃이 보고서다운 전문성을 준다 — 사용자 선호 |
| `research` | 정사각 1080×1080 8장 | 한/영 1:1 의역 | 한/영 `LangText` 분리 | BTC 등 단일 자산 간단 덱 |

## 게시 본문(caption) 규칙 — 플랫폼마다 다르게 쓴다

`caption`은 항상 `{ ko, en }`(`LangText`)로 분리한다(뷰어 KO/EN 토글이 해당 언어만 노출). **멀티 플랫폼이면 플랫폼별로 별도 caption을 쓴다 — 링크드인과 X 본문이 같으면 안 된다.** `DeckVariant.caption`에 변형별로 넣고, 미지정 시에만 `deck.caption`을 상속한다.

| | LinkedIn (세로) | X / 트위터 (16:9) |
|---|---|---|
| 길이·톤 | 길고 서술적, 전문 애널리스트 보이스 | 짧고 압축, 훅 우선·직설적 |
| 티커 | NDX, COPPER (텍스트) | **캐시태그** `$NDX` `$COPPER` `$VIX` |
| 구조 | 훅 → 한 줄 읽기 → 콜(확신·방향) → 근거 불릿 → 내러티브 1문단 → 무효화 → 링크 → 면책 → 해시태그(6~8) | 훅 → 한 줄 → 콜(↑/↓ + 캐시태그) → 근거 불릿(3~4) → 무효화 → 링크 → 짧은 면책 → 해시태그(3~4) |
| 빼는 것 | — | 긴 내러티브 문단·장황한 설명 |

두 본문 모두 **수치·티커·방향·무효화는 슬라이드와 100% 동일**(데이터 정확성 가드). 표기만 매체에 맞게(예: 캐시태그). 참고: `stock-softlanding-2026-06-22/deck.ts`(LinkedIn `deck.caption` + X `variants[x].caption` 분리 예시).

## 절차

1. **본문 추출 — WebFetch 쓰지 말 것.**
   alpha-lenz.com은 JS로 렌더링되는 SPA라 WebFetch는 헤더/내비게이션 껍데기만 반환한다(본문 0). 반드시 브라우저로 연다:
   - `chrome-devtools` MCP: `new_page(url)` → `evaluate_script(() => (document.querySelector('article')||document.querySelector('main')||document.body).innerText.slice(0, 8000))`
   - 8000자 넘으면 `.slice(8000, 16000)` 으로 이어서 가져온다. VERDICT·MARKET VIEW·ACTION·INVALIDATION·RISK FACTORS·MACRO PICTURE·HYPOTHESES 섹션과 **모든 수치/티커/날짜**를 빠짐없이 확보.

2. **기존 덱을 템플릿으로 읽는다.** 선택한 테마의 같은 자산 덱을 Read해 슬라이드 구성·톤·차트를 참고:
   - **macro(주식·매크로):** `stock-softlanding-2026-06-22/deck.ts`(최신 기준), `stock-fakerebound-2026-06-17/deck.ts`. `m-cover`→`m-call`→`m-narrative`→`m-data`→`m-tensions`→`m-plan`→`m-cta` 7장 + `m-twitter` 1장.
   - **research(BTC 등):** `btc-riskoff-2026-06-22/deck.ts`.
   - 데이터 모델 정의는 `src/cardnews/types.ts`(`MacroSlide`·`Slide`·`Caption`·`DeckVariant`).

3. **authoring-guide.md를 따라 작성한다.** macro는 영어 슬라이드(+한/영 caption), research는 한국어 먼저→영어 의역. 수치는 원문 자릿수까지 일치(추정·창작 금지), 권고 방향(LONG/SHORT)을 왜곡하지 말 것. `m-cta`의 divergence score/breakdown은 리포트 수치가 아닌 덱 자체 편집 등급이다(템플릿 관례).

4. **파일 생성.** `src/cardnews/alphalenz/<slug>/deck.ts`. 슬러그는 `<자산>-<레짐/논지>-<YYYY-MM-DD>`(예: `stock-softlanding-2026-06-22`, `btc-riskoff-2026-06-22`). `id`도 동일. 폴더 추가만으로 갤러리에 자동 등록(`registry.ts`가 glob 수집).

5. **검증.** 두 가지 모두:
   - **예산 lint:** `budget.ts`의 `lintDeck`는 **research 테마에만** 적용된다(macro는 자체 레이아웃이라 건너뜀). research면 **브라우저 콘솔**(`list_console_messages`)에서 `[cardnews:<id>]` 0건 확인.
   - **시각 확인:** `http://localhost:5173/` → AlphaLenz 탭 → 카드뉴스 → 새 덱. macro는 cover + m-data(지표 그리드) 스크린샷, 멀티 플랫폼이면 LinkedIn/X 토글 둘 다 확인.

## 함정

| 증상 | 원인·해결 |
|---|---|
| 리포트 본문이 비어있다 / "헤더만 보인다" | SPA. WebFetch 금지, 브라우저 `evaluate_script`로 innerText 추출. |
| 한국어 헤드라인이 예산 초과 | ko ≤22자(줄바꿈 제외). `$64,000`(7자)→`$64K`처럼 수치 표기를 줄인다. |
| 갤러리에 덱이 안 보인다 | 경로/파일명 확인: `src/cardnews/alphalenz/<slug>/deck.ts`, `export default deck`. |
| 콘솔에 `[cardnews:...]` 경고 (research) | 해당 필드 카피를 줄인다(폰트 오토핏은 보조 수단). |
| 원문에 없는 배분 % 단정 | 도넛은 방향성(↑/↓ + 대략 비중)만. 정확한 %를 지어내지 말 것. |
| 게시 본문이 한·영 섞여 나온다 | `caption`을 단일 문자열로 두지 말고 `{ ko, en }`(`LangText`)로 분리. 뷰어가 토글 언어로 골라준다. |
| macro 슬라이드 텍스트가 가운데로 쏠려 삐뚤어 보인다 | 뷰어 래퍼의 `text-align: center`가 상속된 것. `MacroSlide.tsx`의 `base`·`tw`에 `textAlign: 'left'`가 있어야 한다(제거 금지). |
| 슬라이드 인덱스로 바로 이동이 안 됨 (검증) | 뷰어는 zustand 상태로만 동작. 검증 중엔 `shellStore`에 `if (DEV) window.__shell = useShellStore` 훅을 임시로 넣어 `setProject/openCardnews/setProjectLang`를 호출하고, **끝나면 반드시 제거**한다. |
| `chrome-devtools` MCP "browser is already running … --isolated" | MCP가 띄운 좀비 Chrome이 프로필을 잠근 것. `chrome-devtools-mcp` 프로필을 쓰는 chrome 프로세스(사용자 일반 Chrome 아님)를 모두 종료 후 `new_page` 재시도. HMR 리로드가 페이지 타깃을 무효화해 호출 2~3회마다 끊기니, 검증은 **호출당 한 동작**으로 묶는다(예: open+슬라이드 이동을 한 `evaluate_script`에). |

**기본은 macro 세로 포맷이다.** 주식·매크로 앵글 리포트는 세로 1080×1350 LinkedIn 캐러셀 + X 16:9를 `variants`로 만든다(`stock-softlanding-2026-06-22/deck.ts` 참고). 핀테크 세로 레이아웃이 보고서다운 전문성을 준다. BTC 등 단일 자산 간단 덱만 정사각 research 테마(`btc-riskoff-2026-06-22/deck.ts`)를 쓴다.
