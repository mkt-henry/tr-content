---
name: alphalenz-carousel
description: Use when the user gives an alpha-lenz.com angle-report link (or similar AlphaLenz report URL) and asks to make a 카드뉴스/carousel/캐러셀 deck. Covers extracting the report, mapping to the deck model, and registering it in this repo.
---

# AlphaLenz 캐러셀 제작 워크플로

링크 1개 → 한/영 카드뉴스 덱(`deck.ts`) 1개. 콘텐츠 규칙(슬라이드 타입·글자수 예산·의역 원칙·데이터 정확성)은 **`docs/cardnews/authoring-guide.md`가 단일 출처**다. 이 스킬은 그 규칙을 이 레포에서 실제로 실행하는 절차와 함정만 다룬다.

## 절차

1. **본문 추출 — WebFetch 쓰지 말 것.**
   alpha-lenz.com은 JS로 렌더링되는 SPA라 WebFetch는 헤더/내비게이션 껍데기만 반환한다(본문 0). 반드시 브라우저로 연다:
   - `chrome-devtools` MCP: `new_page(url)` → `evaluate_script(() => (document.querySelector('article')||document.querySelector('main')||document.body).innerText.slice(0, 8000))`
   - 8000자 넘으면 `.slice(8000, 16000)` 으로 이어서 가져온다. VERDICT·MARKET VIEW·ACTION·INVALIDATION·RISK FACTORS·MACRO PICTURE·HYPOTHESES 섹션과 **모든 수치/티커/날짜**를 빠짐없이 확보.

2. **기존 덱을 템플릿으로 읽는다.** `src/cardnews/alphalenz/*/deck.ts` 중 같은 자산(예: BTC는 `btc-riskoff-*`)을 Read해 슬라이드 구성·톤·차트 종류를 참고. 데이터 모델 정의는 `src/cardnews/types.ts`.

3. **authoring-guide.md를 따라 작성한다.** 한국어 먼저 → 영어 의역. 8장 골격, 글자수 예산 준수. 수치는 원문 자릿수까지 일치(추정·창작 금지), 권고 방향(LONG/SHORT)을 왜곡하지 말 것.

4. **파일 생성.** `src/cardnews/alphalenz/<slug>/deck.ts`. 슬러그는 `<자산>-<레짐>-<YYYY-MM-DD>`(예: `btc-riskoff-2026-06-22`). `id`도 동일. 폴더 추가만으로 갤러리에 자동 등록(`registry.ts`가 glob 수집).

5. **검증.** 두 가지 모두:
   - **예산 lint:** `budget.ts`의 `lintDeck`가 DEV에서 `console.warn('[cardnews:<id>] ...')`로 초과 필드를 알린다 — **브라우저 콘솔**(`list_console_messages`)에서 0건 확인. Vite 터미널이 아니다.
   - **시각 확인:** `http://localhost:5173/` → AlphaLenz 탭 → 카드뉴스 → 새 덱 → cover와 data(차트) 슬라이드 스크린샷.

## 함정

| 증상 | 원인·해결 |
|---|---|
| 리포트 본문이 비어있다 / "헤더만 보인다" | SPA. WebFetch 금지, 브라우저 `evaluate_script`로 innerText 추출. |
| 한국어 헤드라인이 예산 초과 | ko ≤22자(줄바꿈 제외). `$64,000`(7자)→`$64K`처럼 수치 표기를 줄인다. |
| 갤러리에 덱이 안 보인다 | 경로/파일명 확인: `src/cardnews/alphalenz/<slug>/deck.ts`, `export default deck`. |
| 콘솔에 `[cardnews:...]` 경고 | 해당 필드 카피를 줄인다(폰트 오토핏은 보조 수단). |
| 원문에 없는 배분 % 단정 | 도넛은 방향성(↑/↓ + 대략 비중)만. 정확한 %를 지어내지 말 것. |

멀티 플랫폼(링크드인 4:5 + X 16:9 등)이 필요하면 `types.ts`의 `variants` 모델을 쓰고 `stock-fakerebound-2026-06-17/deck.ts`를 참고한다.
