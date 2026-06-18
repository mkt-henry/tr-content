# 갱신 결과 보고서 데모 — 줌인 + 액션 캡션(spotlight caption) 설계

작성일: 2026-06-18
대상: `src/demos/aria/renewal-report` 데모 영상

## 배경 / 목적

`갱신 결과 보고서 + 전달 이메일` 데모는 자동 재생되며, 핵심 순간에 카메라가
대상 요소로 줌인(1.6배)한다. 그러나 **줌만으로는 "지금 어떤 AI 액션이 일어났는지"가
설명되지 않아** 영상을 처음 보는 잠재 고객이 가치를 즉시 파악하기 어렵다.

이 데모의 4개 핵심 소구점에 **줌인과 동기화된 한 줄 액션 캡션**을 띄워, 무슨 일이
벌어졌는지 명시적으로 전달한다.

## 4개 소구점 (확정)

| # | 줌인 대상(`data-demo-id`) | 시나리오 위치 | 캡션 (ko) | (en) |
|---|---|---|---|---|
| 1 | `generate-btn` | 보고서 생성 클릭 직후 | 흩어진 근거 자료 5건 → 단일 보고서 초안 자동 생성 | 5 scattered sources → one report draft, auto-generated |
| 2 | `section-structure` | 구조 섹션 스크롤 후 | 손해율·프로그램 구조·패널 등급까지 자동 구조화 | Loss ratios, program structure, panel ratings — auto-structured |
| 3 | `analysis-card` | 수신자 선택 후 의도 분석 | 수신자별 목적·맥락·톤 — AI가 전달 의도 분석 | Per-recipient purpose, context & tone — AI infers the intent |
| 4 | `attachment-chip` | 맞춤 이메일 스트리밍 후 | 맥락 맞춤 이메일 초안 + 보고서 첨부 자동 구성 | Context-fit email draft + report attached, automatically |

## 설계

기존 spotlight(카메라 줌) 인프라를 **의미 레이어(캡션)** 까지 확장한다. 줌과 캡션은
같은 트리거(`zoom: true` + `caption`)로 묶여 항상 동기화된다.

### 1. Step API 확장 — `src/engine/types.ts`

`cursor`/`click` step에 옵셔널 `caption?: StepText` 추가. `zoom: true`와 함께일 때만
표시된다. `StepText`(`string | () => string`)이므로 캡션도 `() => pick(copy, getLang())`로
정의해 **언어 토글(ko/en)에 자동 반응**한다.

```ts
| { kind: 'cursor'; target: string; ms?: number; zoom?: boolean; caption?: StepText }
| { kind: 'click'; target: string; run?: () => void; zoom?: boolean; caption?: StepText }
```

`type` step에는 추가하지 않는다(이 데모/요청 범위 밖, YAGNI).

### 2. 재생 스토어 — `src/engine/playbackStore.ts`

캡션 텍스트를 보관할 상태를 추가하고 `setSpotlight` 시그니처를 확장한다.

```ts
spotlightCaption: string | null;        // 현재 표시할 액션 캡션 (없으면 null)
setSpotlight: (id: string | null, caption?: string | null) => void;
```

`setSpotlight(id, caption = null)` 형태로, 호출부가 캡션을 함께 갱신한다.
`spotlightEnabled` 토글은 캡션에도 동일 적용(끄면 줌·캡션 모두 비표시).

### 3. 러너 — `src/engine/run.ts`

`moveCursorTo`에 `caption` 인자 추가:

```ts
async function moveCursorTo(target, signal, ms = 650, zoom = false, caption?: StepText) {
  ...
  setSpotlight(zoom ? target : null, zoom ? (caption ? resolveText(caption) : null) : null);
  ...
}
```

`cursor`/`click` 케이스에서 `step.caption`을 넘긴다. 기존에 spotlight를 푸는 지점
(`stream`, `scroll` 케이스의 `setSpotlight(null)`)은 그대로 두면 캡션도 함께 사라진다
(시그니처상 caption 기본값 `null`).

### 4. 캡션 오버레이 — `src/shell/SpotlightCaption.tsx` (신규)

- **렌더 위치:** Stage 레벨에서 `FakeCursor`와 동일하게 **카메라 변환 밖**에 둔다.
  → 줌 배율(1.6)과 무관하게 항상 같은 크기로 또렷하게 보인다.
- **표시 조건:** `spotlightEnabled && spotlightId && spotlightCaption`.
- **위치 계산 (다른 주요 영역을 가리지 않는 적응형 앵커):**
  - rAF 루프로 대상의 **현재 화면 박스**(`el.getBoundingClientRect()`, 줌 반영됨)를 읽는다.
  - 프레임 경계 = 카메라 레이어의 부모(`[data-camera-layer]`의 parent) rect.
  - 가로: 대상 중심에 맞추고 `[frame.left+pad, frame.right-pad]`로 클램프.
  - 세로: **아래 우선** — `rect.bottom + gap`. 캡션이 프레임 하단을 넘으면 **위로 플립**
    (`rect.top - gap - captionH`). 둘 다 안 되면(대상이 프레임을 가득 채움) 프레임 하단에 핀.
  - 결과적으로 캡션은 강조 요소 자신도, 프레임 밖도, 위/아래 인접 콘텐츠도 최소한으로만
    침범한다.
- **스타일:** brass 글래스 pill — 반투명 배경 + `ring-brass-500/30` + 백드롭 블러,
  `Sparkles`(✦) 아이콘 + 한 줄 카피. framer-motion 페이드+슬라이드 인/아웃.
  ARIA 톤(brass/ink) 유지. `pointer-events-none`.
- **추종:** rAF로 위치를 갱신해 줌 글라이드·스크롤 중에도 대상에 붙어 따라간다
  (Camera의 origin 추종과 동일한 패턴).

### 5. 카피 상수 — `src/demos/aria/renewal-report/data.ts`

4개 캡션을 한 곳에서 관리:

```ts
export const SPOTLIGHT = {
  generate: { ko: '흩어진 근거 자료 5건 → 단일 보고서 초안 자동 생성', en: '5 scattered sources → one report draft, auto-generated' },
  structure: { ko: '손해율·프로그램 구조·패널 등급까지 자동 구조화', en: 'Loss ratios, program structure, panel ratings — auto-structured' },
  intent: { ko: '수신자별 목적·맥락·톤 — AI가 전달 의도 분석', en: 'Per-recipient purpose, context & tone — AI infers the intent' },
  email: { ko: '맥락 맞춤 이메일 초안 + 보고서 첨부 자동 구성', en: 'Context-fit email draft + report attached, automatically' },
} satisfies Record<string, L>;
```

### 6. 시나리오 — `src/demos/aria/renewal-report/scenario.ts`

`getLang`/`pick`/`SPOTLIGHT`를 import 하고 4개 비트에 `zoom`+`caption` 부여.

1. `click generate-btn` → `zoom: true, caption: () => pick(SPOTLIGHT.generate, getLang())`
2. 구조 섹션 스크롤(`scroll ... toId: 'section-structure'`) **직후** `cursor section-structure`
   step을 추가: `zoom: true, caption: () => pick(SPOTLIGHT.structure, getLang())`
3. 기존 `cursor analysis-card` → `zoom: true, caption: () => pick(SPOTLIGHT.intent, getLang())`
4. 이메일 스트리밍 대기 후 기존 `cursor attachment-chip` step에
   `zoom: true, caption: () => pick(SPOTLIGHT.email, getLang())` 부여
   (`attachment-chip`은 "첨부"를 시각적으로 대표하고 박스가 작아 적응형 배치에 유리)

각 캡션은 다음 `scroll`/`stream`/줌 해제 step에서 자연히 사라진다. 비트 사이 `wait`을
캡션이 읽히기에 충분한 길이(현행 1.2~1.6s 수준)로 유지/소폭 조정한다.

## 영향 범위 / 비고

- 기존 줌 동작은 변경 없음(캡션 없는 `zoom: true`도 그대로 동작 — caption 옵셔널).
- 다른 데모 시나리오는 영향 없음(추가 필드 옵셔널).
- 녹화(`useRecorder`)는 Stage DOM을 캡처하므로 캡션이 자동 포함된다.
- `spotlightEnabled` 토글로 줌·캡션 동시 on/off 유지.

## 검증

- `npx tsc --noEmit`로 타입 통과.
- dev 서버에서 데모 자동 재생 → 4개 비트에서 줌+캡션이 동기화되어 뜨고, 캡션이
  강조 요소/프레임/인접 콘텐츠를 가리지 않는지 육안 확인.
- ko/en 토글 시 캡션 언어 전환 확인.
- spotlight 토글 OFF 시 캡션도 사라지는지 확인.
