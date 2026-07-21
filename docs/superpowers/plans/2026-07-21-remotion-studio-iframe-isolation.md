# Remotion Studio iframe realm 격리 — 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 인앱 Remotion Studio-lite(앱 realm의 `@remotion/player`)를 iframe으로 교체해, Studio와 기존 데모 재생(Stage)이 공유하던 전역 store 오염을 realm 분리로 제거한다.

**Architecture:** 오염원은 `StudioLite → DemoPlayer → DemoVideo` 한 경로뿐이다. StudioLite를 iframe(별도 JS realm의 Remotion Studio 번들: dev `:3000`, prod `/studio`)으로 바꾸면 Studio의 store 사본이 부모 앱과 물리적으로 분리된다. 이후 `shellStore`의 `studioReturn` 스냅샷/복원 해킹과 `DemoPlayer`는 불필요해져 삭제한다.

**Tech Stack:** React 18, Vite, zustand, Remotion 4, TypeScript. 이 저장소는 **테스트 러너가 없다** → 각 태스크의 검증 게이트는 `npx tsc --noEmit`(타입 체크)와 수동 확인이다. 테스트 프레임워크를 새로 도입하지 않는다(YAGNI).

## Global Constraints

- **불변 조건: 기존 데모 재생(Stage)은 절대 사라지거나 깨지지 않는다.** `src/shell/Stage.tsx`, `src/engine/*`, `src/demos/findle/*`(17개 파일), `remotion/DemoVideo.tsx`, `remotion/Root.tsx`는 **무수정**.
- 새 npm 의존성 추가 없음.
- 각 태스크 완료 시 `npx tsc --noEmit`가 **에러 0**으로 통과해야 한다.
- 커밋 메시지 말미에 반드시 추가: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- 작업 브랜치: `feat/studio-iframe-isolation` (이미 생성됨, 스펙 커밋 존재).

---

### Task 1: iframe src 헬퍼 추가 (`remotion/studio.ts`)

featureId + 언어로 Studio 딥링크 URL을 만드는 순수 함수를 추가한다. 추가만 하므로(기존 export 유지) 이 태스크 후에도 앱은 그대로 컴파일된다.

**Files:**
- Modify: `remotion/studio.ts`

**Interfaces:**
- Consumes: `REMOTION_STUDIO_URL`(기존 export), `FINDLE_COMPOSITIONS`(이미 import됨) — `{ name, featureId, variantId }` 필드 사용.
- Produces: `export function studioEmbedSrc(featureId: string | null, lang?: 'ko' | 'en'): string`
  - featureId가 컴포지션으로 resolve되면 `${base}/findle/${name}-${variantId}-${lang}`, 아니면 `${base}`.
  - `base = import.meta.env.DEV ? REMOTION_STUDIO_URL : '/studio'`.

- [ ] **Step 1: 헬퍼 함수 추가**

`remotion/studio.ts` 파일 맨 끝에 아래를 추가한다(기존 코드는 그대로 둔다):

```ts
/**
 * 인앱 iframe에 임베드할 Remotion Studio URL.
 * dev는 `npm run studio`(:3000), prod는 vercel.json이 서빙하는 정적 번들(/studio).
 * featureId가 있으면 해당 컴포지션으로 딥링크(경로 포맷은 remotion/Root.tsx의 Folder+id와 일치),
 * 없으면(갤러리 진입 등) Studio 루트 — 사용자가 사이드바에서 선택한다.
 */
const STUDIO_EMBED_BASE = import.meta.env.DEV ? REMOTION_STUDIO_URL : '/studio';

export function studioEmbedSrc(featureId: string | null, lang: 'ko' | 'en' = 'ko'): string {
  const c = featureId ? FINDLE_COMPOSITIONS.find((x) => x.featureId === featureId) : undefined;
  if (!c) return STUDIO_EMBED_BASE;
  return `${STUDIO_EMBED_BASE}/findle/${c.name}-${c.variantId}-${lang}`;
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 0 (통과). `studioEmbedSrc`는 아직 미사용이지만 export라 unused 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add remotion/studio.ts
git commit -m "$(cat <<'EOF'
feat(remotion): Studio iframe 임베드 URL 헬퍼(studioEmbedSrc) 추가

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: StudioLite를 iframe으로 교체 (`src/shell/StudioLite.tsx`)

인앱 `<DemoPlayer>` 대신 `<iframe>`을 렌더한다. 데모 목록·ko/en 전환·스크럽은 iframe 안 Studio가 담당하므로 커스텀 사이드바/토글을 제거한다. 이 태스크 후 StudioLite는 `DemoPlayer`도 `studioReturn`도 참조하지 않는다.

**Files:**
- Modify (전체 교체): `src/shell/StudioLite.tsx`

**Interfaces:**
- Consumes: `studioEmbedSrc`(Task 1), `useShellStore`의 `closeStudio`/`featureId`/`projectLang`.
- Produces: 변경 없음(기존 `export function StudioLite()` 시그니처 유지).

- [ ] **Step 1: 파일 전체를 아래로 교체**

`src/shell/StudioLite.tsx` 내용을 통째로 아래로 바꾼다:

```tsx
import { useShellStore } from '../store/shellStore';
import { studioEmbedSrc } from '../../remotion/studio';
import type { Lang } from '../demos/findle/_shared/i18n';

/**
 * 인앱 Remotion Studio — iframe realm 격리.
 * 별도 JS realm(dev :3000 / prod /studio 번들)의 Studio를 임베드하므로, 프레임 결정론 DemoVideo가
 * 부모 앱의 전역 store(shell/playback/데모 상태)를 절대 오염시키지 않는다. 진입 시 현재 보던
 * 데모/언어로 딥링크한다. 데모 목록·언어 전환·스크럽은 iframe 안 Studio가 제공한다.
 */
export function StudioLite() {
  const closeStudio = useShellStore((s) => s.closeStudio);
  const featureId = useShellStore((s) => s.featureId);
  const lang = (useShellStore((s) => s.projectLang.findle) ?? 'ko') as Lang;

  const src = studioEmbedSrc(featureId, lang);

  return (
    <div className="flex h-full w-full flex-col bg-ink-950">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-ink-900 px-4 py-2.5">
        <button
          onClick={closeStudio}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
        >
          ← 목록으로
        </button>
        <span className="text-[13px] font-medium text-white/60">Remotion Studio</span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[12px] font-medium text-white/40 transition-colors hover:text-white/70"
          title="새 탭에서 열기"
        >
          새 탭 ↗
        </a>
      </div>
      <iframe title="Remotion Studio" src={src} className="min-h-0 flex-1 border-0" allow="fullscreen" />
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 0. (StudioLite가 더 이상 `DemoPlayer`/`FINDLE_COMPOSITIONS`/`studioReturn`을 참조하지 않음. shellStore의 `studioReturn`은 아직 남아있지만 미사용이라 에러 없음.)

- [ ] **Step 3: dev 수동 확인**

터미널 2개로 `npm run dev`(앱)와 `npm run studio`(:3000)를 함께 실행한 뒤, 브라우저에서 findle 데모를 열고 우상단 `🎞 Remotion Studio` 클릭.
Expected: iframe에 해당 데모의 Studio가 열리고(딥링크), `← 목록으로`로 이전 데모 화면에 그대로 복귀. **복귀 후 데모가 정상 재생되는지**(불변 조건) 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/shell/StudioLite.tsx
git commit -m "$(cat <<'EOF'
feat(remotion): StudioLite를 iframe realm으로 교체 — 전역 store 오염 제거

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: shellStore에서 studioReturn 해킹 제거 (`src/store/shellStore.ts`)

iframe realm의 DemoVideo는 부모 store를 안 건드리므로 스냅샷/복원이 불필요하다. `studioReturn`을 완전히 제거하고 `openStudio`/`closeStudio`를 토글만 남긴다.

**Files:**
- Modify: `src/store/shellStore.ts`

**Interfaces:**
- Produces: `openStudio: () => void`, `closeStudio: () => void` (시그니처 유지, 구현만 단순화). `studioReturn` 필드/타입 삭제.

- [ ] **Step 1: 인터페이스에서 studioReturn 블록 삭제**

`ShellState` 인터페이스에서 아래 주석+필드(현재 파일의 studioOpen 주석 하단, `studioReturn: {...} | null;` 전체)를 삭제한다. 남길 것은 `studioOpen: boolean;`과 `openStudio`/`closeStudio` 선언. 교체 후 해당 구간은 다음과 같아야 한다:

```ts
  /** true면 인앱 Remotion Studio(iframe realm)를 오버레이로 띄운다 */
  studioOpen: boolean;
  openStudio: () => void;
  closeStudio: () => void;
```

- [ ] **Step 2: 구현에서 studioReturn 로직 삭제**

store 구현부의 `studioOpen: false,` 아래 `studioReturn: null,`을 삭제하고, `openStudio`/`closeStudio`를 아래로 교체한다:

```ts
  studioOpen: false,
  openStudio: () => set({ studioOpen: true }),
  closeStudio: () => set({ studioOpen: false }),
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 0. (`studioReturn` 참조처는 Task 2에서 이미 제거됨.)

- [ ] **Step 4: 커밋**

```bash
git add src/store/shellStore.ts
git commit -m "$(cat <<'EOF'
refactor(store): studioReturn 스냅샷/복원 해킹 제거 — iframe 격리로 불필요

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: DemoPlayer 삭제 (`src/shell/DemoPlayer.tsx`)

앱 realm에서 `DemoVideo`를 마운트하던 유일한 진입점. 사용처(StudioLite)가 제거됐으므로 삭제한다.

**Files:**
- Delete: `src/shell/DemoPlayer.tsx`

- [ ] **Step 1: 사용처 재확인**

Run: `grep -rn "DemoPlayer" src`
Expected: 결과 없음(정의 파일 자신 외 참조 0).

- [ ] **Step 2: 파일 삭제**

```bash
git rm src/shell/DemoPlayer.tsx
```

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 0.

- [ ] **Step 4: 커밋**

```bash
git commit -m "$(cat <<'EOF'
chore(remotion): 미사용 DemoPlayer 삭제 — 인앱 Player 진입점 제거

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 전체 검증 (빌드 · dev 왕복 · prod 딥링크)

성공 기준을 실제로 확인한다.

**Files:** 없음(검증 전용).

- [ ] **Step 1: 전체 빌드**

Run: `npm run build`
Expected: `tsc --noEmit` → `vite build` → `remotion bundle`(`dist/studio`) 모두 성공.

- [ ] **Step 2: dev 격리 왕복 확인**

`npm run dev` + `npm run studio` 동시 실행. 데모 A를 재생 → `🎞 Remotion Studio` 열기 → iframe 안에서 다른 데모/언어로 스크럽 → `← 목록으로` → **데모 A가 오염 없이 이전과 동일하게 재생**되는지 확인.
Expected: Stage 재생·커서·스포트라이트·녹화 모두 변경 전과 동일. Studio 조작이 Stage에 전혀 영향 없음.

- [ ] **Step 3: prod 딥링크 검증 및 폴백 판단**

Vercel preview 배포(또는 `/studio` 서빙 환경)에서 iframe이 데모별 컴포지션으로 열리는지 확인.
- 딥링크가 잡히면 그대로 둔다.
- 만약 `/studio/findle/<comp>`가 컴포지션을 못 잡고 기본 컴포지션/루트로 떨어지면(번들이 `/studio` base-path를 안 벗기는 경우), 이는 **격리·기능상 문제 없음**(Studio는 정상, 첫 컴포지션 선택 상태). UX만 1클릭 손해이므로 그대로 수용하거나, 원하면 후속으로 base-path 처리를 별도 검토한다. 스펙 리스크 #1의 폴백과 일치.

- [ ] **Step 4: 성공 기준 체크리스트 확인**

스펙(`docs/superpowers/specs/2026-07-21-remotion-studio-iframe-isolation-design.md`)의 "성공 기준" 5개 항목을 모두 만족하는지 확인하고, 미충족 시 원인을 기록한다.

---

## Self-Review (작성자 점검 결과)

- **Spec 커버리지:** 변경 대상 3개(StudioLite=Task2, shellStore=Task3, DemoPlayer=Task4) + 헬퍼(Task1) + 검증(Task5) 모두 태스크로 존재. 불변 조건(무수정 파일)은 Global Constraints에 명시.
- **Placeholder:** 없음. 모든 코드 스텝에 실제 코드/명령/기대결과 기재.
- **타입 일관성:** `studioEmbedSrc(featureId, lang)` 시그니처가 Task1 정의와 Task2 호출에서 일치. `openStudio`/`closeStudio` 시그니처 유지.
- **테스트 러너 부재:** TDD의 "failing test" 대신 `npx tsc --noEmit` + 수동 확인으로 대체(YAGNI, 스펙 성공 기준과 일치).
