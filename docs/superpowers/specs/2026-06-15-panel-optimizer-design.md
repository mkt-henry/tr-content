# 견적 비교 + AI 패널 최적화 데모 (panel-optimizer)

날짜: 2026-06-15
프로젝트: ARIA (재보험 중개 AI)
브랜치: feat/interaction-spotlight 위에 추가 (zoom 플래그 사용)

## 배경 / 목표

ARIA 데모 스튜디오에 14번째 데모를 추가한다. 기존 13개가 다루지 않는 "재보험 배치(placement) 의사결정" 영역 — 여러 재보험사 견적을 비교하고 최적 인수 패널을 구성하는 워크플로우 — 을 시연한다.

소재: **국내 재산 Cat XoL 트리티 한 레이어 배치**. 클라이맥스는 **AI가 제약을 지켜 100% 라인을 자동 최적 배분한 패널 + 근거** 제시.

## 비목표 (YAGNI)

- 실제 최적화 엔진 — 결과는 `data.ts`에 사전 계산해 둔다(모든 데모와 동일한 더미 방식).
- 사용자 입력으로 제약을 바꾸는 폼 — v2는 시나리오가 미리 정한 제약 변경만 시연.
- 패널 외 다른 배치 유형(QS·fac) — 이번 범위 아님.

## 소재 데이터 (`data.ts`)

배치 헤더:
- 트리티: "ABC손해보험 재산 Cat XoL — Layer 2"
- 커버: ₩300억 xs ₩200억, 필요 capacity 100%
- 만기 요율(expiring ROL): 18.0%

견적 6건 (재보험사 · 등급(S&P) · 제공 라인 · 견적 ROL · 핵심 조건):

| # | 재보험사 | 등급 | 제공 라인 | ROL | 조건 |
|---|---|---|---|---|---|
| 1 | Munich Re | AA− | 35% | 17.2% | 1 부활 @100%, 표준 |
| 2 | Swiss Re | AA− | 30% | 17.5% | 표준 |
| 3 | SCOR | A+ | 25% | 16.8% | 표준 |
| 4 | Hannover Re | AA− | 20% | 17.8% | 표준 |
| 5 | Korean Re | A | 25% | 16.5% | 표준 |
| 6 | Lloyd's Synd 2001 | A | 15% | 19.5% | **비동시(사이버 면책)** |

제약: 최소등급 A−, **1사 최대 25%**(분산), 100% 충족, 블렌디드 ROL 최소화.

### 최적 패널 (base, v1 결과 — 사전 계산)

최저 ROL부터 25% 한도로 채움:
- Korean Re 25% (16.5%), SCOR 25% (16.8%), Munich Re 25% (17.2%, 캡: 제공 35%→25%), Swiss Re 25% (17.5%) = **100%**
- **블렌디드 ROL = 17.0%** (= (16.5+16.8+17.2+17.5)/4)
- 가중평균등급 ≈ A+/AA−
- 총보험료 = 17.0% × ₩300억 = **₩51억** (만기 ₩54억 대비 **−₩3억, 5.6%↓**)
- 제외: Hannover Re(17.8%, 불필요), Lloyd's(19.5% 최고 + 비동시 조건 → 정합성 미달)

근거 불릿:
1. Lloyd's 제외 — ROL 최고(19.5%) + 비동시(사이버 면책) → 워딩 정합성 미달
2. Munich Re 35%→25% 캡 — 1사 집중 한도 적용해 분산
3. Korean Re·SCOR 우선 — 최저 ROL(16.5/16.8%) + 적격 등급
4. 결과 — 블렌디드 17.0%, 만기 −1.0pt, 보험료 5.6% 절감, 평균등급 A+/AA−

### 재최적화 패널 (tight, v2 결과 — 사전 계산)

제약 변경: **1사 최대 25% → 20%** (분산 강화).
- Korean 20%, SCOR 20%, Munich 20%, Swiss 20%, Hannover 20% = 100%
- **블렌디드 ROL = 17.16%** (= (16.5+16.8+17.2+17.5+17.8)/5)
- 트레이드오프: 더 분산(5사, 1사 20%)되나 ROL +0.16pt — "분산 vs 비용" 시연

## 흐름 (state phases)

`raw` → `normalizing` → `normalized` → `optimizing` → `optimized`

- **normalize()**: raw→normalizing. 견적을 순차 스캔(scannedQuotes 카운터 증가)하며 조건 정규화, 비적격 플래그(Lloyd's 비동시). 완료 시 normalized.
- **optimize()**: normalized→optimizing→optimized. 현재 제약(base/tight)에 맞는 사전계산 패널 표시.
- **tighten()** (v2): 제약을 tight로 바꾸고 다시 optimizing→optimized로 재최적화.
- **seedNormalized()** (v2 시작용): normalized 상태로 시드.
- **reset()**: raw로 초기화.

## 컴포넌트 / 파일 (`src/demos/aria/panel-optimizer/`)

- `data.ts` — 헤더 메타, QUOTES[], 제약, BASE_PANEL/TIGHT_PANEL(라인·블렌디드 ROL·평균등급·보험료·절감·근거). ko/en 이중언어 문자열.
- `state.ts` — zustand: phase, scannedQuotes, constraint('base'|'tight'), 위 액션 + reset. (claim-bordereaux/state.ts 패턴 따름: runId로 비동기 취소.)
- `scenario.ts` — v1(normalizeOptimizeScenario), v2(reoptimizeScenario). 단계: wait → click `normalize-run` → (정규화 진행) → cursor `quote-lloyds`(zoom, 플래그 강조) → click `optimize-run` → cursor `panel-result`(zoom, 결과 강조). v2는 이어서 click `constraint-tighten`(zoom) → 재최적화 → cursor `panel-result`(zoom).
- `widgets.tsx` — QuoteTable(등급 칩·라인·ROL·조건, 제외/캡 하이라이트), PanelAllocation(100% 스택 바 + 재보험사별 서명 라인 리스트), SummaryMetrics(블렌디드 ROL·가중평균등급·보험료·절감), RationaleList(근거 불릿).
- `Desktop.tsx` — 좌: 배치 헤더 + 견적표, 우: 액션 버튼 + 최적 패널/메트릭/근거. `data-demo-id`: `normalize-run`, `quote-lloyds`, `optimize-run`, `constraint-tighten`, `panel-result`, `summary-metrics`.
- `Mobile.tsx` — 세로 압축: 헤더 → 견적 카드 → 액션 → 패널 결과/메트릭.
- `index.ts` — FeatureDefinition default export. id `panel-optimizer`, title "견적 비교 + AI 패널 최적화", icon `SlidersHorizontal`, accent(신규, 예 `#14b8a6` 계열 아님 — 기존과 구분되는 색, 예 `#0ea5e9`), variants v1/v2, 각 background gradient + url, scenario 연결.

## 데이터 흐름

```
scenario step → state action(normalize/optimize/tighten) → useStore phase/constraint
                                                          → Desktop/Mobile/widgets 렌더
data-demo-id → 가짜 커서 이동 + zoom:true 핵심 강조 (정규화 플래그, 최적 패널 등장)
```

## i18n

ARIA는 ko/en 전환 지원. 데이터 문자열은 `{ ko, en }`, 컴포넌트는 `_shared/i18n`의 `pick`/`useLang` 사용(기존 데모와 동일).

## 검증

- dev 서버에서 갤러리에 "견적 비교 + AI 패널 최적화" 카드 등장 확인(자동 등록).
- v1 재생: 견적표 → 정규화(Lloyd's 플래그) → 최적 패널(라인 합 100%, 블렌디드 17.0%, 절감 5.6%) → 근거 표시.
- v2 재생: 제약 강화 → 5사 20% 재배분(17.16%) 확인.
- ko/en 전환, 데스크탑/모바일 모두 확인.
- `npx tsc --noEmit`, `npm run build` 통과.
