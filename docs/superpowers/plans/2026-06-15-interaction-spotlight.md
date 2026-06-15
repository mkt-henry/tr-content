# 인터랙션 스포트라이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 자동 재생 중 현재 인터랙션하는 개별 컨트롤을 "주변 딤(0.45) + 포커스 링"으로 강조하고, 컨트롤바 토글(기본 켬)로 켜고 끌 수 있게 한다.

**Architecture:** 엔진(`run.ts`)은 매 `cursor`/`click`/`type` 스텝에서 활성 요소의 `data-demo-id`를 `playbackStore.spotlightId`에 기록하고 `stream`/`scroll`/종료 시 해제한다. 신규 오버레이 `shell/Spotlight.tsx`가 그 id로 요소를 찾아 rAF로 실시간 위치를 추적하며 딤+링을 렌더한다. 엔진은 "무엇이 활성인지"만, 시각화는 오버레이가 전담한다.

**Tech Stack:** React 18, zustand, framer-motion, Tailwind v4, Vite. (테스트 프레임워크 없음 → 검증은 dev 서버 수동 확인 + `tsc --noEmit`.)

---

## File Structure

- **Modify** `src/engine/playbackStore.ts` — `spotlightId`, `spotlightEnabled` 상태 + 액션 추가.
- **Modify** `src/engine/run.ts` — 스텝 실행 시 `setSpotlight` 호출.
- **Modify** `src/engine/usePlayback.ts` — `stop`/재생완료 시 spotlight 해제.
- **Create** `src/shell/Spotlight.tsx` — 딤+링 오버레이 (rAF 위치 추적).
- **Modify** `src/shell/Stage.tsx` — `<Spotlight />` 렌더.
- **Modify** `src/shell/ControlBar.tsx` — "인터랙션 강조" 토글 버튼.

검증 공통: `npm run dev`는 이미 백그라운드 실행 중(포트 5173). 각 태스크 후 `npx tsc --noEmit`로 타입 확인.

---

### Task 1: playbackStore에 spotlight 상태 추가

**Files:**
- Modify: `src/engine/playbackStore.ts`

- [ ] **Step 1: 상태와 액션 추가**

`PlaybackState` 인터페이스에 아래 3줄을 추가한다 (`setSpeed` 선언 다음 줄):

```ts
  setSpeed: (speed: number) => void;
  /** 현재 강조 중인 data-demo-id (없으면 null) */
  spotlightId: string | null;
  /** 인터랙션 강조 토글. 기본 켬 */
  spotlightEnabled: boolean;
  setSpotlight: (id: string | null) => void;
  toggleSpotlight: () => void;
```

store 본문(`create` 콜백 반환 객체)에 `setSpeed` 다음 줄로 추가한다:

```ts
  setSpeed: (speed) => set({ speed }),
  spotlightId: null,
  spotlightEnabled: true,
  setSpotlight: (spotlightId) => set({ spotlightId }),
  toggleSpotlight: () => set((s) => ({ spotlightEnabled: !s.spotlightEnabled })),
```

- [ ] **Step 2: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (exit 0).

- [ ] **Step 3: 커밋**

```bash
git add src/engine/playbackStore.ts
git commit -m "feat(engine): playbackStore에 인터랙션 스포트라이트 상태 추가"
```

---

### Task 2: run.ts에서 스텝별 spotlight 설정

**Files:**
- Modify: `src/engine/run.ts:53-65` (`moveCursorTo`), `:174-187` (`stream` case), `:188-189` (`scroll` case)

- [ ] **Step 1: moveCursorTo에서 강조 대상 설정**

`moveCursorTo`의 `setCursor` 호출 뒤에 `setSpotlight`를 추가한다. 기존:

```ts
  usePlaybackStore.getState().setCursor({
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    visible: true,
  });
  await delay(ms, signal);
```

변경 후:

```ts
  const ps = usePlaybackStore.getState();
  ps.setCursor({
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    visible: true,
  });
  ps.setSpotlight(target);
  await delay(ms, signal);
```

`cursor`/`click`/`type`(target 있음) 스텝은 모두 `moveCursorTo`를 거치므로 이 한 곳으로 충분하다.

- [ ] **Step 2: stream / scroll 시작 시 강조 해제**

`runScenario`의 `case 'stream'` 블록 첫 줄(`const text = resolveText(step.text);` 앞)에 추가:

```ts
      case 'stream': {
        usePlaybackStore.getState().setSpotlight(null);
        const text = resolveText(step.text);
```

`case 'scroll'`을 아래처럼 변경 (스크롤 검토는 전체를 봐야 하므로 해제):

```ts
      case 'scroll':
        usePlaybackStore.getState().setSpotlight(null);
        await scrollContainer(step.target, { to: step.to, toId: step.toId, ms: step.ms }, signal);
        break;
```

- [ ] **Step 3: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/engine/run.ts
git commit -m "feat(engine): 스텝 실행 시 활성 컨트롤 spotlightId 설정/해제"
```

---

### Task 3: usePlayback에서 정지/완료 시 해제

**Files:**
- Modify: `src/engine/usePlayback.ts:15-21` (`stop`), `:46-51` (재생 완료)

- [ ] **Step 1: stop에서 해제**

`stop` 콜백의 `s.setCursor(...)` 다음 줄에 추가:

```ts
    s.setStatus('idle');
    s.setCursor({ visible: false, pressed: false });
    s.setSpotlight(null);
```

- [ ] **Step 2: 재생 완료 시 해제**

`play` 콜백 끝, 완료 분기의 `st.setCursor({ visible: false });` 다음 줄에 추가:

```ts
        st.setStatus('done');
        st.setCursor({ visible: false });
        st.setSpotlight(null);
        abortRef.current = null;
```

- [ ] **Step 3: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/engine/usePlayback.ts
git commit -m "feat(engine): 정지/재생완료 시 spotlight 해제"
```

---

### Task 4: Spotlight 오버레이 컴포넌트 생성

**Files:**
- Create: `src/shell/Spotlight.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`src/shell/Spotlight.tsx` 전체 내용:

```tsx
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePlaybackStore } from '../engine/playbackStore';

/** 강조 대상 rect (뷰포트 좌표, 패딩 포함) */
interface FocusRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PAD = 8; // 대상 주변 여백
const DIM = 0.45; // 주변 딤 강도

/**
 * 인터랙션 스포트라이트 — 재생 중 활성 컨트롤(spotlightId)을 주변 딤+포커스 링으로 강조한다.
 * rAF로 대상 요소 위치를 실시간 추적해 스크롤/레이아웃 변화를 따라가고, 요소가 사라지면 숨긴다.
 */
export function Spotlight() {
  const spotlightId = usePlaybackStore((s) => s.spotlightId);
  const enabled = usePlaybackStore((s) => s.spotlightEnabled);
  const [rect, setRect] = useState<FocusRect | null>(null);

  const active = enabled && !!spotlightId;

  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    let raf = 0;
    const track = () => {
      raf = requestAnimationFrame(track);
      const el = document.querySelector(`[data-demo-id="${spotlightId}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        return;
      }
      setRect({ x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 });
    };
    raf = requestAnimationFrame(track);
    return () => cancelAnimationFrame(raf);
  }, [active, spotlightId]);

  return (
    <AnimatePresence>
      {rect && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[90] rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: rect.x, y: rect.y, width: rect.w, height: rect.h }}
          exit={{ opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 28,
            mass: 0.6,
            opacity: { duration: 0.25 },
          }}
          style={{
            boxShadow: `0 0 0 9999px rgba(0,0,0,${DIM})`,
            outline: '1.5px solid rgba(255,255,255,0.85)',
            outlineOffset: '-1.5px',
          }}
        >
          {/* 글로우 링 */}
          <span
            className="absolute -inset-px rounded-xl"
            style={{ boxShadow: '0 0 16px 2px rgba(255,255,255,0.35)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

설계 메모:
- `box-shadow: 0 0 0 9999px rgba(0,0,0,0.45)` → 둥근 사각형 바깥 전체를 딤(클래식 스포트라이트 기법).
- `outline` + glow `span` → 포커스 링.
- `pointer-events-none` → 하위 요소 클릭 통과(수동 개입 가능).
- framer-motion `x/y/width/height` 스프링 → 대상 간 부드러운 글라이드. 요소 언마운트 시 `rect=null` → `exit` 페이드아웃.

- [ ] **Step 2: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/shell/Spotlight.tsx
git commit -m "feat(shell): 인터랙션 스포트라이트 오버레이 컴포넌트"
```

---

### Task 5: Stage에 Spotlight 렌더

**Files:**
- Modify: `src/shell/Stage.tsx:10` (import), `:276` (`<FakeCursor />` 위)

- [ ] **Step 1: import 추가**

`import { FakeCursor } from './FakeCursor';` 다음 줄에 추가:

```ts
import { FakeCursor } from './FakeCursor';
import { Spotlight } from './Spotlight';
```

- [ ] **Step 2: 렌더 추가**

`<FakeCursor />` 바로 앞에 `<Spotlight />`를 추가 (커서가 z-100으로 위에 오도록 순서 무관하나 가독성상 앞):

```tsx
      <Spotlight />
      <FakeCursor />
    </div>
```

- [ ] **Step 3: 타입 확인 + 수동 검증**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

수동 검증 (http://localhost:5173):
1. ARIA → "출처 지정 Q&A" 데모 열기 → 재생(스페이스바).
2. 추천 질문 클릭 시점에 **해당 버튼만 밝고 주변이 어두워지는지** 확인.
3. 답변 스트리밍 시작 시 **딤이 사라지는지** 확인.
4. `/` 또는 `+`로 출처 메뉴가 뜰 때 메뉴 항목 클릭이 강조되는지 확인.
5. 데스크탑/모바일(`D`) 둘 다 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/shell/Stage.tsx
git commit -m "feat(shell): Stage에 스포트라이트 오버레이 연결"
```

---

### Task 6: ControlBar에 "인터랙션 강조" 토글

**Files:**
- Modify: `src/shell/ControlBar.tsx:1-14` (import), `:46-47` (store 바인딩), `:139-148` (토글 버튼)

- [ ] **Step 1: 아이콘 import 추가**

`lucide-react` import 목록에 `Sparkles`를 추가 (알파벳 순서 무관, 예: `Smartphone` 다음):

```ts
  Smartphone,
  Sparkles,
  PanelTop,
```

- [ ] **Step 2: store 바인딩 추가**

`const setSpeed = usePlaybackStore((s) => s.setSpeed);` 다음 줄에 추가:

```ts
  const setSpeed = usePlaybackStore((s) => s.setSpeed);
  const spotlightEnabled = usePlaybackStore((s) => s.spotlightEnabled);
  const toggleSpotlight = usePlaybackStore((s) => s.toggleSpotlight);
```

- [ ] **Step 3: 토글 버튼 추가**

속도 `<select>` 블록과 `{hasBranding && (` 사이(현재 `:138` 빈 줄 위치)에 추가. spotlight는 브랜딩과 무관하므로 `hasBranding` 밖에 둔다:

```tsx
        </select>

        <BarButton onClick={toggleSpotlight} label="인터랙션 강조" active={spotlightEnabled}>
          <Sparkles className="h-4 w-4" />
        </BarButton>

        {hasBranding && (
```

- [ ] **Step 4: 타입 확인 + 수동 검증**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

수동 검증 (http://localhost:5173):
1. 하단 컨트롤바에 "인터랙션 강조"(✨) 버튼이 보이고 **기본 활성(켬)** 상태인지 확인.
2. 버튼 클릭으로 OFF → 재생 시 딤/링이 **나타나지 않는지** 확인.
3. 다시 ON → 강조가 돌아오는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/shell/ControlBar.tsx
git commit -m "feat(shell): 인터랙션 강조 토글 버튼 추가 (기본 켬)"
```

---

### Task 7: 최종 통합 검증

**Files:** 없음 (검증만).

- [ ] **Step 1: 전체 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 2: 두 채팅 데모 + 비채팅 데모 회귀 확인**

http://localhost:5173 에서:
1. ARIA "출처 지정 Q&A", "계약·클레임 Q&A" — 강조가 클릭/타이핑을 따라가고 스트리밍 시 해제.
2. ARIA `slip-check` 등 `scroll` 스텝이 있는 검토형 데모 — 스크롤 구간에서 딤이 해제되는지.
3. 재생 중 일시정지(스페이스) → 강조 유지, 리셋(`R`) → 강조 즉시 사라짐.
4. 토글 OFF 상태로 녹화(`Video`) → 영상에 딤 없음 / ON → 딤+링 포함 확인.

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 타입체크 + Vite 빌드 성공.

---

## Self-Review

**Spec coverage:**
- 개별 컨트롤 강조 → Task 2(`moveCursorTo`) + Task 4.
- 주변 딤(0.45) + 포커스 링 → Task 4 (`DIM=0.45`, outline+glow).
- 자동 작동(작성자 부담 없음) → Task 2 (스텝 공통 경로 1곳).
- stream/scroll 해제 → Task 2. 종료/정지/리셋 해제 → Task 3.
- 토글 기본 켬 → Task 1(`spotlightEnabled: true`) + Task 6.
- 실시간 위치 추적 + 언마운트 페이드 → Task 4(rAF + AnimatePresence).
- z-index 커서 아래 → Task 4(`z-[90]` vs 커서 `z-[100]`).
- 녹화 포함 → fixed 오버레이라 getDisplayMedia 캡처에 포함(Task 7 검증).

**Placeholder scan:** 모든 코드 스텝에 실제 코드/명령/기대결과 포함. 플레이스홀더 없음.

**Type consistency:** `setSpotlight(id)`, `toggleSpotlight()`, `spotlightId`, `spotlightEnabled` — Task 1 정의와 Task 2/3/4/6 사용처 명칭 일치 확인.
