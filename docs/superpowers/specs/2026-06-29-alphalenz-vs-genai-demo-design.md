# AlphaLenz vs 범용 GenAI — 분할 화면 라이브 대결 데모 설계

- 날짜: 2026-06-29
- 대상: `src/demos/alphalenz/vs-genai/` (신규)
- 참고 소스: AlphaSense vs Rogo 비교 페이지(https://www.alpha-sense.com/compare/alphasense-vs-rogo/)의 경쟁 포지셔닝 골격
- 산출물: 데모 영상 (기존 레코더 16:9 크롭 + 인트로/아웃트로 파이프라인 사용)

## 문제 정의 / 목적

AlphaSense의 비교 페이지는 "✅/❌ 비교표"로 자사를 경쟁사 위에 세운다. 핵심 축은 **독점 콘텐츠 · 검증된 AI(환각 회피) · 출처/인용 · 실시간 데이터**다. AlphaLenz는 이미 `alpha-chat`(근거 카드·인용)과 `multi-agent`(교차검증)로 이 축들을 제품으로 갖고 있다.

이 데모는 그 차별점을 "말"이 아니라 **눈앞의 결과 차이**로 보여준다: 같은 질문을 범용 AI와 AlphaLenz에 동시에 던지고, 좌측(범용)은 얕고 출처 없는 답으로, 우측(AlphaLenz)은 실시간 수치·차트·인용이 붙은 근거 답으로 끝나는 **분할 화면 라이브 대결**을 스크립트로 재생해 영상화한다.

## 확정된 결정 (브레인스토밍)

- **✅ 주체**: AlphaLenz (매크로/리서치 AI)
- **❌ 대상**: 범용 GenAI — 실명(ChatGPT/OpenAI) 미사용, "범용 AI 어시스턴트"로 표기(공정/안전 가드)
- **연출**: 좌우 분할 라이브 대결(접근 A)
- **히어로 질문**: `삼성전자 실적 어때?`
- **아용 비율**: 16:9 가로(1920×1080), 좌우 분할
- **근거**: 우측 답변·수치는 `alpha-chat`의 검증된 데이터 재사용(창작 0). 좌측 범용 카피는 신규 작성 후 발행 전 직접 검수.

## 화면 레이아웃 (`Desktop.tsx`, 16:9 좌우 분할)

- **상단 공용 헤더/프롬프트 바**: 질문 1회 입력 → 양쪽 패널이 동시에 받는다(대결 연출의 핵심). 좌우 패널 위에 걸친 단일 입력 바.
- **좌측 패널 — "범용 AI 어시스턴트"**: 중립 톤(브랜드 비실명). 답변은 *빠르지만 얕음* — 줄글 텍스트만, 근거 카드/차트/출처 **없음**. 말미에 캐비엇 칩 `⚠ 2023년까지 지식 기준 · 실시간 데이터·출처 없음`.
- **우측 패널 — "AlphaLenz"**: AlphaLenz 팔레트(`AL` 토큰, 퍼플 액센트). 같은 질문에 *근거 답변* — 5년 실적 차트 + KPI 근거카드 4건 + 출처 라인(`DART 사업보고서 2021–2025 · 컨센서스`) + "근거 4건 · 교차검증 ✓" 뱃지.
- 좌측이 sparse + 경고로, 우측이 rich + 인용으로 끝나는 **시각적 대비**가 메시지의 전부다. 두 패널 사이 1px 디바이더.

## 대비 축 (AlphaSense 비교표 → 데모 언어)

| 축 | 범용 AI (좌) | AlphaLenz (우) |
|---|---|---|
| 실시간/최신 데이터 | ❌ 지식 컷오프 | ✅ 최신 주가·2025 실적 |
| 출처·인용 | ❌ 없음 | ✅ DART + 컨센서스 |
| 환각 위험 | ⚠ 수치 불확실 | ✅ 데이터 근거 |
| 구조화 산출 | 줄글만 | 차트 + KPI + (표) |

이 축들은 별도 UI 표가 아니라 **줌 스텝의 `caption` 오버레이**로 강조한다(예: 우측 줌 시 "실시간 데이터 · 출처 인용", 좌측 줌 시 "지식 컷오프 · 출처 없음").

## 구성 파일 & 컴포넌트 경계

- `index.ts` — `FeatureDefinition`. 단일 variant(삼성전자 질문 · 16:9). title `AlphaLenz vs 범용 AI`, accent 퍼플. (YAGNI: 질문 추가 variant는 나중.)
- `data.ts` — **좌측 범용 답변**(한/영 의역 신규 작성, `L<Answer>` 형태이되 evidence/chart/table/source 없음 + caveat 필드). 우측은 `alpha-chat/data.ts`의 삼성전자 `Answer`를 import해 재사용.
- `state.ts` — zustand 스토어 `useVs`. `left`/`right` 각각 `{ messages, thinking }` + 공용 `question`/`input`. `start()`가 두 비동기 플로우를 **독립 타이밍**으로 구동(좌측 먼저·짧게, 우측 한 박자 늦게·근거 포함). `reset()`. alpha-chat `state.ts`의 스트리밍 패턴을 모방하되 독립 스토어.
- `Desktop.tsx` — 좌우 분할 셸 + 공용 프롬프트 바.
- `Mobile.tsx` — 상하 스택(녹화는 데스크톱 16:9 사용). 최소 구현.
- `scenario.ts` — 스크립트 재생(아래).

**재사용 리팩터 (alpha-chat 표현 컴포넌트 분리):**
현재 `alpha-chat/Messages.tsx`의 `MessageBubble`/`EvidenceCard`/`Avatar`는 `useChat`에 직접 묶여 있다. 양쪽 패널이 공유하도록 **표현 전용 모듈** `alpha-chat/Thread.tsx`로 추출한다:
- `export function ChatThread({ messages, thinking, accent, send?, suggested?, compact? })` — store 비의존, props로만 구동.
- `MessageBubble`/`EvidenceCard`/`Avatar`/empty-state/thinking 인디케이터를 이 모듈로 이동하고 `accent`를 파라미터화(우측=퍼플, 좌측=중립 그레이).
- `alpha-chat/Messages.tsx`는 `useChat()`을 읽어 `ChatThread`에 props로 위임하도록 축소(동작·외관 동일 유지 — 회귀 0이 목표).
- `vs-genai`의 좌/우 패널은 각각 `useVs`의 `left`/`right`를 `ChatThread`에 전달. 좌측 메시지는 `answer` 미지정 → `EvidenceCard` 미렌더(텍스트만). 캐비엇 칩은 좌측 패널 전용으로 `ChatThread` 외부에 렌더.
- **안전 폴백**: 추출이 alpha-chat 회귀를 일으키면, alpha-chat은 원복하고 vs-genai는 `EvidenceCard`만 export 받아 자체 경량 thread로 구성한다.

## 시나리오 비트 (`scenario.ts`, ~20초)

1. `wait` → `cursor` 프롬프트 바.
2. `type` `삼성전자 실적 어때?` (cps ≈ 14) → `click` 전송 → `useVs.start()` (양쪽 thinking 시작).
3. **좌측 먼저**: 짧은 thinking 후 얕은 답 스트리밍 → 캐비엇 칩으로 종료.
4. **우측**: 한 박자 더 "근거 수집 중" → 근거 답변 스트리밍 → KPI 카드 팝 + 차트 드로우 + 출처.
5. `cursor`/zoom → 우측 근거카드·출처 (`caption`: "실시간 데이터 · 출처 인용").
6. `cursor`/zoom → 좌측 캐비엇 (`caption`: "지식 컷오프 · 출처 없음").
7. `wait` 홀드.

타이밍은 alpha-chat 시나리오(thinking 1.1s + 스트리밍)를 기준으로 좌/우 오프셋을 잡는다. `data-demo-id`: `vs-input`, `vs-send`, `vs-left-caveat`, `vs-right-evidence`.

## 다국어 & 가드

- 모든 카피는 `_shared/i18n`의 `L<>` 언어 객체. 질문은 `getLang()` 평가. 한/영 토글 자동 지원, 영어는 의역(transcreation).
- 좌측은 범용 LLM의 **실제 한계**(지식 컷오프·실시간 데이터 부재·무인용)만 묘사. 실명 비방·허위 없음.
- 우측 수치는 검증된 기존 데이터 재사용. 좌측 신규 카피만 검수 대상.

## 테스트 / 검증

- `npm run build`(tsc --noEmit + vite build) 통과.
- dev 서버에서 vs-genai variant 재생: 질문 입력 → 좌측 얕은 답+캐비엇, 우측 근거답+차트+출처가 의도한 타이밍으로 전개되는지.
- 한/영 토글 양쪽 정상, 글자수 오버플로우 없는지.
- **회귀**: 기존 `alpha-chat` 데모(evidence/multiturn 시나리오) 외관·동작 변화 없음(Thread 추출 후).
- 16:9 레코딩 크롭에서 좌우 패널이 잘리지 않고 균형 있게 들어오는지.

## 비범위 (YAGNI)

- 질문 추가 variant(네이버 vs 카카오 등) — 1개 확정 후 필요 시.
- 세로(상하 스택) 레코딩 variant — 16:9 우선, 나중에.
- 실제 LLM 호출/실데이터 — 스크립트 더미(기존 데모와 동일 원칙).
- 좌측 범용 패널의 차트/표 — 의도적으로 없음(그게 대비점).
