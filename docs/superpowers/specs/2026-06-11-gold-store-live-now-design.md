# 골드 스토어 "진짜 금" 데모 개선 — Now 라이브 캔들 + 보유액 상향

날짜: 2026-06-11 · 대상: `src/demos/treazer/gold-store/` (variant `real-gold`)

## 개선 목적

1. **Now 라이브 캔들**: "Now" 기간에서 캔들이 위아래로 소폭 형성·갱신되고, 시세 변동에 따라 내 자산 평가액·수익률이 실시간으로 흔들리는 게 보이게.
2. **보유액 상향**: 현재 8,077 GOLD ≈ S$0.30로 너무 작음 → 1,284,000 GOLD (≈ S$48)로 상향.

## 현재 한계

- `tickPrice()`는 `goldPrice`·`tick`만 갱신 → 평가 카드만 애니메이션. 차트는 `makeSeries(period)`로 **정적**(period에만 의존).

## 설계

### 보유액 (data.ts)
- `INITIAL_GOLD` 8,077 → **1,284,000**. (표시 평가액 ≈ GOLD × perGold × ratio ≈ S$48)
- `GOLD_GRAMS_PER_UNIT`(1 GOLD당 g) 상수는 유지(보유량과 독립). 주석만 갱신.
- 영향 점검: 교환 시나리오(v2) 상품가(≈4,000 G)는 그대로 → 보유 충분, 정상.

### Now 라이브 (state.ts)
- 상태 추가: `nowSeries: Candle[]` (초기 = `makeSeries('now')`), `liveTick()`.
- `liveTick()`:
  - `goldPrice` 미세 양방향 변동(약한 우상향 바이어스) → 평가액/수익률 실시간 변동, `tick++`.
  - `nowSeries`: 마지막(형성 중) 캔들의 `c/h/l`를 소폭 랜덤워크로 갱신. 3틱마다 커밋(새 캔들 push + 가장 오래된 캔들 drop) → 차트가 좌로 스크롤되며 "라이브 형성".
  - 길이(24) 유지. 상승봉 emerald / 하락봉 red 가 위아래로 섞여 표시.
- `reset()`/초기 상태에 `nowSeries` 포함, `gold`는 새 `INITIAL_GOLD`.

### 차트 (GoldPriceScreen.tsx)
- `series = period === 'now' ? nowSeries(store) : useMemo(makeSeries(period))`.
- `useEffect`: `view==='price' && period==='now'`일 때 `setInterval(liveTick, ~750ms)` 시작, deps 변경/언마운트 시 정리. (녹화 중에도 동작)
- 평가 카드는 기존 `tick` key 애니메이션으로 값 변동 강조(그대로 활용).

### 시나리오 (scenario.ts · v1 realGoldScenario)
- Now 중심으로 재구성: 스토어 골드 카드 → 시세 화면 → 평가 카드 강조 → **period 'now' 선택**(라이브 시작) → 차트에서 캔들이 위아래로 움직이는 것 + 평가액·수익률 실시간 변동을 클로즈업.
- 기존 수동 `tickPrice()` do-step 제거(인터벌이 구동). v2(exchange)는 변경 없음.

## 검증

- `tsc --noEmit` 통과
- dev: Now 기간에서 캔들이 위아래로 움직이고 평가액·수익률이 실시간 변동, 보유 GOLD/평가액 상향 확인(스크린샷·시간차 캡처로 변동 확인)

## 범위 밖 (YAGNI)

- 실데이터 시세 연동, 다른 기간(1M/5M/1Y/ALL) 라이브화(정적 유지), 차트 보조지표(MA/BOLL/EMA) 실제 계산
