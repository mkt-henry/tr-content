# 인터랙션 스포트라이트 (Interaction Spotlight)

날짜: 2026-06-15

## 배경 / 문제

자동 재생 데모를 SNS 영상으로 올렸을 때, 화면이 작게 재생되면 **지금 어디를 클릭·입력하는지** 한눈에 들어오지 않는다. 시청자가 "실제로 작동하고 인터랙션하는 부분"에 시선을 고정하도록, 활성 요소를 강조하는 효과가 필요하다.

참고 이미지: 활성 영역만 또렷하고 주변은 어둡게 처리된 컨트롤 타워 UI.

## 목표

- 재생 중 현재 인터랙션하는 **개별 컨트롤**(버튼·입력창·추천질문·행 등)을 강조한다.
- **주변을 어둡게(딤) + 포커스 링**으로 강조한다.
- 시나리오 작성자가 스텝마다 따로 지정하지 않아도 **자동으로** 작동한다.
- 컨트롤바 토글로 켜고 끌 수 있고, **기본 켬**. 녹화에 그대로 포함된다.

## 비목표 (YAGNI)

- A/B/C 같은 정적 라벨/콜아웃 주석 (참고 이미지의 라벨은 강조 방식 예시일 뿐, 구현 대상 아님).
- 패널/섹션 단위 강조, 다크 스포트라이트 원형 컷아웃 — 개별 컨트롤 + 딤+링으로 확정.
- 스텝별 강조 커스터마이징 API.

## 설계

엔진은 "지금 무엇이 활성인지"(`data-demo-id`)만 알리고, 시각화는 전적으로 오버레이 컴포넌트가 담당한다. 효과 스타일을 바꿔도 엔진/시나리오에 영향이 없다.

### 1. 상태 (`engine/playbackStore`)

- `spotlightId: string | null` — 현재 강조 중인 `data-demo-id` (없으면 null).
- `spotlightEnabled: boolean` — 토글 상태. 기본 `true`.
- 액션: `setSpotlight(id: string | null)`, `toggleSpotlight()`.

### 2. 엔진 연동 (`engine/run.ts`)

스텝 실행 시 자동으로 `spotlightId`를 설정한다 (작성자 부담 없음):

| 스텝 | 동작 |
|---|---|
| `cursor` / `click` / `type` (target 있음) | `setSpotlight(target)` |
| `stream` / `scroll` | `setSpotlight(null)` (답변·검토는 전체를 봐야 함) |
| `wait` / `do` | 변경 없음 (직전 강조 유지 → 다음 대상으로 부드럽게 이동) |
| 시나리오 종료 (`play` 완료) / `stop` / 리셋 | `setSpotlight(null)` |

`moveCursorTo`가 이미 target rect를 계산하므로, 같은 지점에서 `setSpotlight`만 추가한다.

### 3. 오버레이 (`shell/Spotlight.tsx`, 신규)

- `spotlightEnabled && spotlightId`일 때만 렌더. 아니면 `null`.
- `[data-demo-id="${spotlightId}"]`를 찾아 **requestAnimationFrame 루프로 실시간 위치(getBoundingClientRect) 추적** — 스크롤/레이아웃 변화를 따라가고, 요소가 사라지면 rect를 비워 페이드아웃.
- 시각 효과:
  - 대상 rect에 패딩 ~8px, 둥근 사각형(radius ~12px).
  - **투명 구멍 + `box-shadow: 0 0 0 9999px rgba(0,0,0,0.45)`** 로 주변 딤.
  - 글로우 링: 밝은 테두리(`ring`/`border` + 약한 box-shadow glow).
- `position: fixed`(가짜 커서와 동일한 뷰포트 좌표계), `pointer-events: none`.
- z-index: 커서(z-100) 아래, 데모 위 → **z-90**.
- framer-motion으로 rect 변화를 스프링 트랜지션 → 대상 간 글라이드, 끊김 없는 "액션 추적" 느낌.

딤 강도 0.45는 상수로 두고, 추후 필요 시 조정.

### 4. 토글 (`shell/ControlBar`)

- 기존 "인트로 삽입 / 아웃트로 삽입" 버튼 옆에 **"인터랙션 강조"** 버튼 추가.
- `spotlightEnabled`를 바인딩, 기본 켬.

## 데이터 흐름

```
runScenario(step)
  └─ cursor/click/type → setSpotlight(target)   ┐
     stream/scroll      → setSpotlight(null)     ├─ playbackStore.spotlightId
     end/stop/reset     → setSpotlight(null)     ┘
                                                  │
ControlBar 토글 ── spotlightEnabled ──────────────┤
                                                  ▼
                                          Spotlight.tsx
                                  (rAF로 rect 추적 → 딤+링 렌더)
```

## 엣지 케이스

- `spotlightId`가 가리키는 요소가 없음/언마운트 → rect null → 딤 페이드아웃, 오버레이 숨김.
- 토글 OFF → 즉시 `null` 렌더 (재생과 무관).
- 일시정지 → `spotlightId` 그대로 유지(시나리오가 멈추므로 자연스러움).
- 수동 개입(클릭) → 딤이 `pointer-events-none`라 하위 요소 클릭 통과.

## 테스트 / 검증

- dev 서버에서 ARIA `source-chat`·`ai-chat` 재생:
  - 추천 질문 클릭 시 해당 버튼만 강조, 답변 스트리밍 시작 시 딤 해제 확인.
  - 입력 타이핑 시 입력창 강조 확인.
  - 데스크탑/모바일 모두 확인.
- 토글 OFF 시 효과 사라지는지 확인.
- 녹화 시 딤+링이 영상에 포함되는지 확인.
