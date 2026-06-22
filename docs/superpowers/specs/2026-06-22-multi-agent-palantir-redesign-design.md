# 멀티 에이전트 그래프 — Palantir그레이드 DAG 재설계 설계

- 날짜: 2026-06-22
- 대상: `src/demos/alphalenz/multi-agent/`
- 선행: `2026-06-22-multi-agent-focus-panel-design.md`(포커스 패널) 위에 얹는 시각 재설계.

## 문제 정의

현재 그래프(`AgentGraph.tsx`)는 협업 흐름을 보여주려 **곡선 트리 + 무지개 5색 발광 알약 노드 + 곡선 위 빛나는 점**으로 구성된다. 이 구조 자체가 인포그래픽/애니메이션처럼 읽혀 전문성이 떨어진다. 실제 오케스트레이션 시각화 서비스(LangGraph·Temporal·Palantir Foundry)는 정반대로 **사각 노드 카드 + 직교 커넥터 + 절제된 단색 팔레트 + 데이터 밀도**를 쓴다.

## 설계 방향 — Palantir그레이드 DAG

곡선 트리를 **톱다운 DAG**로 교체하고, Palantir Foundry/Gotham의 시각 언어를 차용한다: near-black 블루그레이 배경, 헤어라인 보더, 샤프한 사각 카드, 대문자 마이크로 라벨 + 모노스페이스 데이터, 글로우 없는 절제된 모션, 단일 냉색(몽환 인디고) 액센트. 포커스 패널도 동일 팔레트로 통일한다.

## 디자인 토큰 (콘솔 팔레트)

`_shared/theme.ts`에 `CONSOLE` 토큰 묶음을 추가하고 멀티에이전트 데모 전역에서 사용한다.

```ts
export const CONSOLE = {
  bg: '#0a0c12',          // near-black 블루그레이 (앱 배경)
  panel: '#11141c',       // 패널/스테이지 표면
  card: 'rgba(255,255,255,0.022)',   // 카드 표면
  cardHover: 'rgba(255,255,255,0.04)',
  hair: 'rgba(255,255,255,0.07)',    // 헤어라인 보더
  hairStrong: 'rgba(255,255,255,0.12)',
  line: 'rgba(255,255,255,0.10)',    // 커넥터 기본
  accent: '#6366f1',                  // 몽환 인디고 (단일 액센트)
  accentFill: 'rgba(99,102,241,0.12)',
  accentBorder: 'rgba(99,102,241,0.55)',
  done: '#5e9c83',        // 저채도 그린 (완료)
  text: '#e4e4e7',
  textDim: '#a1a1aa',
  textMicro: '#71717a',   // 대문자 마이크로 라벨
} as const;
```

- **그룹 색은 폐기하지 않되 탈채도**: `data.ts`에 `mutedTick(color: string): string` 헬퍼 — 그룹 원색을 알파 0.5 정도의 탈채도 톤으로 변환해 카드 좌측 2px 틱에만 사용. 도메인 식별은 되되 네온처럼 튀지 않는다.
- 글로우(box-shadow blur)·호흡 펄스는 전면 금지. 액센트는 보더/얇은 채움/1px 라인에만.

## 섹션 1 — 레이아웃 & 커넥터 (`AgentGraph.tsx`)

**구조 (톱다운 DAG):**
- Orchestrator 카드: 상단 중앙.
- 그룹 카드 5개: 그 아래 가로 한 줄(균등 분포).
- 서브 에이전트 카드: 각 그룹 카드 아래 세로 스택.

**커넥터 (1px div 라인 — SVG 왜곡 회피):**
- Orchestrator 하단에서 수직 드롭 → 가로 **버스 라인** → 각 그룹 카드 상단으로 수직 드롭(엘보).
- 각 그룹 카드 하단에서 **세로 스파인** → 서브 카드마다 짧은 가로 분기 틱.
- 기본색 `CONSOLE.line`. 활성(데이터 흐름) 구간만 `CONSOLE.accent`로 밝아짐.
- 절대배치 div로 그린다(수평/수직 1px 라인은 div로 크리스프). 곡선 베지어·SVG 입자 경로 전부 제거.

**렌더 구현:** 컨테이너는 기존처럼 상대배치. 노드는 절대배치 카드 div. 커넥터는 절대배치 1px div(top/left/width|height 계산). 좌표는 픽셀이 아닌 % 기반 유지하되, 라인 두께만 px(1px)로 고정.

## 섹션 2 — 노드 카드 (데이터 밀도)

세 종류 카드, 공통 언어(샤프 사각 radius 2–3px, 1px 헤어라인 보더, 좌측 2px 그룹 틱):

**Orchestrator 카드:**
- 1행: ⚙ 글리프 + `ORCHESTRATOR`(대문자 마이크로 라벨).
- 2행: 모노 서브라벨 — 단계에 따라 `ROUTING` / `RUNNING 16 agents` / `CROSS-VERIFY` / `SYNTHESIZE`.

**그룹 카드:**
- 1행: 그룹명(11px) + 우측 상태(집계 `n/n` 모노).
- 좌측 탈채도 그룹 틱.

**서브 에이전트 카드:**
- 1행: 상태 글리프(idle=zinc 점 / running=인디고 점 / done=그린 체크) + 에이전트명(10.5px).
- 2행: 모노 메타(`textMicro`) — running이면 `··· running`, done이면 `lat 0.9s`(데이터의 고정 지연값).

**데이터:** `data.ts`의 각 서브에 라벨만 있으므로, 서브별 지연시간을 위해 경량 메타를 추가한다. `GROUPS`의 `subs`는 현재 `L[]`. 이를 깨지 않기 위해 **별도 맵** `SUB_META: Record<string, { latencyMs: number }>`(키 `"groupId:subIndex"`)를 추가한다. 값은 고정(예: 620~1400ms 범위 수치). done 시 `lat {Xs}` 표기.

## 섹션 3 — 모션 (절제)

- **제거**: `FlowParticles`(베지어 입자), 노드 점등 리플, 호흡 글로우, 과한 확대(scale 1.16).
- **커넥터 활성**: 흐름 구간에서 라인이 `CONSOLE.line`→`CONSOLE.accent`로 페이드(0.3s). 선택적으로 가는 **트레이서**(짧은 밝은 세그먼트가 라인을 1회 훑음, opacity 절제) — div 그라디언트 마스크 또는 짧은 액센트 div가 top/left를 따라 1회 이동.
- **노드 상태 전이**: idle→running = 보더 `hair`→`accentBorder` + 카드 상단 1px 프로그레스 바가 0→100% 채워짐(dwell 시간). running→done = 프로그레스 완료 → 글리프 체크 전환 + 지연시간 텍스트 페이드인. 글로우 없이 보더/텍스트 변화로만.
- **포커스(피사계 심도)**: 활성 카드 = `accentBorder` 링 + scale 1.04(미세). 나머지 카드 opacity 0.45(블러 없음). 카메라 링크는 유지하되 절제.

## 섹션 4 — 교차검증·합성

- **무지개 점선 가로줄 제거.**
- `verifying`: 인접 그룹 세로 스파인 사이를 잇는 **헤어라인 가로 링크**가 잠깐 `accent`로 점멸(1px, 글로우 없음). Orchestrator 서브라벨 `CROSS-VERIFY`.
- `done`: 커넥터가 Orchestrator 방향으로 미세 펄스(라인 밝기 1회) + Orchestrator 카드 보더가 `done` 톤으로. 입자 수렴 제거.

## 섹션 5 — 포커스 패널 동일 팔레트 (`FocusPanel.tsx`)

기능(4요소)·로직은 유지하고 **시각만** 콘솔 팔레트로 교체:
- 카드: `CONSOLE.card` + 1px `hair`, 샤프 radius. 그룹 풀컬러 헤더 점/배경 → `mutedTick` 틱 + 인디고 액센트.
- 마이크로 라벨(`데이터 호출`/`근거` 등) 대문자 + `textMicro`. tool call·메트릭은 이미 모노 → 유지·강화.
- 스파크라인 색: `CONSOLE.accent`(또는 탈채도 그룹 틱).
- 상태칩(`분석중`): 인디고 저채도.
- thinking 타이핑·tool 점등·근거칩 구조 유지.

## 섹션 6 — 셸 배경 (`Desktop.tsx` / `Mobile.tsx`)

- 데모 배경을 `AL.appBg`→`CONSOLE.bg`, 패널 `CONSOLE.panel`로. 카운터·인사이트 카드도 헤어라인/샤프 카드 언어에 맞춰 보더·radius 조정(글로우 박스섀도 축소). 레이아웃 그리드(`[1fr_440px]`)는 유지.

## 컴포넌트 경계

- `_shared/theme.ts` — `CONSOLE` 토큰 추가(기존 `AL` 유지).
- `data.ts` — `mutedTick()` 헬퍼 + `SUB_META` 맵 추가. 기존 export 유지.
- `AgentGraph.tsx` — DAG 레이아웃 + 카드 + div 커넥터 + 절제 모션으로 대폭 재작성. `export function AgentGraph({ compact })` 시그니처 유지. `FlowParticles`/곡선 `Edge`/리플/글로우 제거.
- `FocusPanel.tsx` — 콘솔 팔레트 리스타일(구조·로직 유지).
- `Desktop.tsx`/`Mobile.tsx` — 배경/카드 토큰 조정.
- `state.ts` — 변경 최소(필요 시 없음). 기존 `phase`/`focus`/시퀀스 유지.

## 테스트 / 검증

- `npm run build`(tsc --noEmit + vite build) 통과.
- dev 서버 두 variant 재생: DAG 카드가 단계별로 idle→running(프로그레스)→done(지연시간) 전이, 직교 커넥터 활성, 포커스 카드 링+디밍, verifying 헤어라인 링크, done Orchestrator 상태.
- 무지개·글로우·곡선·입자가 화면에서 사라졌는지(전문성 회귀 확인).
- 포커스 패널이 동일 팔레트로 일관되는지. 모바일 세로 스택 정상.

## 비범위 (YAGNI)

- 실데이터/실측 지연시간(고정 더미 사용).
- 노드 드래그·줌·팬 등 인터랙티브 그래프 편집(데모는 자동 재생).
- 그래프 자동 레이아웃 엔진(고정 좌표 유지).
- `state.ts` 시퀀스/타이밍 변경(포커스 패널 설계의 타이밍 유지).
