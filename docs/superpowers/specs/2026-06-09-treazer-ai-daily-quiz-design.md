# Treazer AI 데일리 퀴즈 데모 고도화 — 설계

- 날짜: 2026-06-09
- 대상: `src/demos/treazer/ai-daily-quiz/`
- 성격: 영업/마케팅용 자동재생 데모 스튜디오의 한 데모 고도화 (mobileOnly)

## 1. 배경 & 목적

현재 `ai-daily-quiz` 데모는 **단일 화면**이다: 오늘의 뉴스 기사 1개 → "AI 퀴즈 생성" 버튼 → 분석(shimmer) → 2지선다 퀴즈 카드 3개 순차 등장 + 언어 칩(EN/JA/VI/TH) 현지화. 퀴즈를 실제로 푸는 인터랙션이나 보상 적립 경험은 없다.

실제 제품 화면은 썸네일 + 제목 + "up to N G" 보상이 붙은 **뉴스 기사 피드 리스트**다. 데모는 이 피드 구조도, 핵심인 "풀이 → 보상" 경험도 담고 있지 않다.

**목표:** 데모를 실제 제품 여정에 맞춰 확장하고, Treazer의 핵심 가치인 **Learn & Earn 루프(문제 풀이 → 정답 피드백/해설 → 골드 적립)**를 데모의 주인공으로 만든다.

## 2. 확정된 방향 (브레인스토밍 결과)

- 주력 셀링포인트: **퀴즈 풀이 + 골드 적립 경험**
- 풀이 형식: **기사 상세 + 문제 묶음** (기사를 읽고 → 그 아래 관련 문제들을 푸는 맥락: 기사→학습→퀴즈)
- 흐름 범위: **피드 → 기사 → 풀이 → 결과** (전체 사용자 여정)
- variant 2종:
  - **v1 = 풀이+골드 적립 루프** (정직한 풀이 → 문제별 적립 → 결과 총합)
  - **v2 = 연속 출석/콤보 보상** (연속 정답 콤보 배수 + 결과의 스트릭 카드, 데일리 재방문 유도)

## 3. 화면 구성

3개 화면 + 결과 오버레이. `screen` 상태로 전환하며 framer-motion 슬라이드 전환.

### 3.1 Feed (피드)
- 헤더: Treazer 워드마크 + 골드 필(보유 골드).
- "Daily Quiz" 타이틀 + 서브타이틀.
- 기사 카드 리스트(5~6개): **추상 썸네일**(카테고리별 컬러 그라디언트 + 이모지/아이콘) + 제목 2줄 + "up to {N} G" 보상.
- 중간 광고 배너 1개(실제 화면 재현용, 비인터랙티브 장식).
- 하단 탭: Home active.
- 첫 번째(또는 지정된) 기사가 풀이 대상. 그 카드에 `data-demo-id`.

### 3.2 Article + Quiz (기사 상세 + 퀴즈)
- 상단: 뒤로가기 + 기사 헤더(썸네일/제목/출처/시간).
- 기사 요약 본문(2~3문단).
- 구분선 + "✨ AI가 만든 퀴즈" 섹션 헤더.
- 문제 카드 2~3개: 각 카드 = 질문 + **4지선다(2×2 그리드)**.
- 하단 탭 또는 진행 상태 표시.

### 3.3 풀이 인터랙션 (핵심 하이라이트)
- 보기 탭 → **정답: 녹색 체크 + "정답!"**, **오답: 빨강 + 정답 위치 표시**.
- 그 아래 **해설 1~2줄 슬라이드 다운**(Learn 강조).
- **"+{N} G" 플로팅 칩**이 떠올라 상단 골드 필로 흡수 → **헤더 골드 카운트업**.

### 3.4 Result (결과)
- 완료 시: 총 획득 골드, 정답 수(예: 3/3), "내일 또 풀기" CTA.
- v2: **콤보/스트릭** 강조 — "🔥 7일 연속 출석" 스트릭 카드 + 내일 보상 예고.

## 4. variant 차별화 (동일 화면, 다른 연출)

| | v1 (풀이+적립) | v2 (출석/콤보) |
|---|---|---|
| 풀이 | 문제별 골드 적립 | 연속 정답 시 콤보 배수("🔥 콤보 x2!") + 보너스 골드 |
| 결과 | 총 획득 골드 + 정답 수 | 위 + 스트릭 카드("7일 연속") + 내일 보상 예고 |
| 시나리오 | 전 문제 정답 흐름 | 콤보가 쌓이는 연출 강조 |

## 5. 데이터 모델 (`data.ts`)

모든 사용자 표시 텍스트는 `L = {en, ja, vi, th}` (기존 i18n 유지).

- `FEED_ARTICLES: FeedArticle[]` — 피드 카드용. `{ id, title: L, reward: number, thumb: {color, emoji}, category: L }`. 5~6개.
- 풀이 대상 기사(기존 FRB 기사 확장 + 필요 시 1~2개): `{ headline: L, summary: L, source, time: L, quizzes: Quiz[] }`.
- `Quiz`: `{ question: L, options: L<string[]>(4개), correctIndex: number, explanation: L, reward: number }`.
- 콘텐츠는 4개 언어 실제 현지화(진짜 문자/성조) — 기존 데이터 톤 유지.

## 6. 상태 모델 (`state.ts`, zustand)

```
screen: 'feed' | 'article' | 'result'
gold: number                 // 헤더 보유 골드 (적립 시 카운트업)
earnedGold: number           // 이번 세션 획득 골드
answers: { [quizIdx]: { selected: number, correct: boolean } }
combo: number                // v2 연속 정답 수
streak: number               // v2 출석 일수 (결과 표시용 고정값)
// actions
openArticle(), selectAnswer(quizIdx, optIdx), finish(), reset()
```

- `selectAnswer`는 정답 여부 판정 → `earnedGold`/`gold` 증가, v2면 `combo` 갱신.
- `reset()`은 시나리오/언어 전환 시 초기화(기존 패턴 유지).

## 7. 시나리오 (`scenario.ts`)

- **v1**: 피드 카드 훑기 → 풀이 대상 기사 카드 클릭(`openArticle`) → 스크롤 → 문제 순차 풀이(`selectAnswer`, 정답/오답 섞어 현실감) → 골드 적립 연출 대기 → `finish` → 결과 화면.
- **v2**: 동일 흐름이되 연속 정답으로 콤보가 쌓이는 타이밍 강조 → 결과의 스트릭 카드 커서.
- 모든 상태 변화는 store action으로만(엔진 `run.ts` 규칙).

## 8. 파일 구조

`screens.tsx`가 커지므로 화면별 분리:
- `index.ts` — FeatureDefinition (id `tz-ai-daily-quiz` 유지), variant 2종.
- `state.ts` — 위 상태 모델.
- `data.ts` — 피드/기사/퀴즈 데이터(4개 언어).
- `screens.tsx` — `AppScreens` 래퍼 + 화면 라우팅.
- `FeedScreen.tsx`, `ArticleQuizScreen.tsx`, `ResultScreen.tsx` — 화면별 컴포넌트.
- `Mobile.tsx` / `Desktop.tsx` — 기존처럼 `AppScreens` 렌더(mobileOnly).
- `scenario.ts` — v1/v2 시나리오.

공용 `_shared/ui.tsx`(Coin, GoldPill, BottomNav, Wordmark, TZ_BACKGROUND)와 `_shared/i18n.ts` 재사용. 수정 불필요(필요 시 최소 추가만).

## 9. 디자인 토큰

- 브랜드 오렌지 `#f97316`(TZ_ORANGE), 라이트 배경 `#f4f4f6`, 카드 흰색.
- 정답 녹색(emerald), 오답 빨강(rose), 골드(amber).
- 폰트/모션: 기존 데모 톤(framer-motion, `shimmer`/`thinking-dot`/`demo-scroll` CSS 유틸).

## 10. 범위 밖 (YAGNI)

- 실제 사진 썸네일 에셋 도입(추상 썸네일로 대체).
- AI 생성 연출(이번 메인 흐름에서 제외 — 기존 기능과 중복, 필요 시 별도 데모).
- 백엔드/실데이터 연동(더미 유지).
- 회원/로그인, 정산 등 다른 탭 기능.

## 11. 성공 기준

- 피드 → 기사 → 풀이 → 결과 전체 흐름이 자동재생으로 끊김 없이 시연된다.
- 정답/오답 피드백 + 해설 + 골드 카운트업 연출이 명확히 보인다.
- v2에서 콤보/스트릭이 시각적으로 구분된다.
- 4개 언어 전환이 콘텐츠에 정상 반영된다.
- `npm run build`(tsc + vite) 통과, 런타임 콘솔 에러 0건.
