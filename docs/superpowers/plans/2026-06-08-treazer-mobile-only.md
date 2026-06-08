# Treazer 모바일 전용 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Treazer 데모를 항상 모바일(세로 폰) UI로만 진입·재생되게 하고 데스크탑 전환을 막는다(다른 프로젝트는 불변).

**Architecture:** `ProjectDefinition`에 `mobileOnly` 플래그를 추가하고, Stage/ControlBar가 `mobileOnly ? 'mobile' : storeDevice`로 **effective device를 파생**한다(스토어 device 미오염). ControlBar는 mobileOnly면 데스크탑 토글을 숨긴다.

**Tech Stack:** React 18 + TS, zustand. 테스트 러너 없음 → 검증은 `npm run build`(tsc --noEmit) + 시각 확인.

**검증 방식:** 각 태스크 `npx tsc --noEmit` 통과 후 커밋. 마지막에 dev 서버로 Treazer/ARIA 동작 확인.

---

### Task 1: projects.ts — mobileOnly 플래그

**Files:**
- Modify: `src/registry/projects.ts`

- [ ] **Step 1: ProjectDefinition에 mobileOnly 추가**

`ProjectDefinition` 인터페이스의 `languages?: ProjectLanguage[];` 다음 줄에 추가:

```ts
  /** true면 모바일 UI만 제공 — 데스크탑 전환 불가 (모바일 서비스용) */
  mobileOnly?: boolean;
```

- [ ] **Step 2: treazer에 mobileOnly: true**

`projects` 배열의 `treazer` 항목(`id: 'treazer'`)에서 `languages: [...]` 배열 **다음**에 `mobileOnly: true,`를 추가. 즉:

```ts
  {
    id: 'treazer',
    name: 'Treazer',
    tagline: 'Learn & Earn Gold',
    description:
      '경제 퀴즈를 풀면 실제 금에 연동된 골드가 쌓이는 리워드 앱 — 출석·미션·스토어로 이어지는 데일리 루프를 데모로 확인하세요. 모든 데모는 더미 데이터로 실제처럼 동작합니다.',
    languages: [
      { id: 'en', label: 'English', flag: '🇸🇬' },
      { id: 'ja', label: '日本語', flag: '🇯🇵' },
      { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
      { id: 'th', label: 'ไทย', flag: '🇹🇭' },
    ],
    mobileOnly: true,
  },
```

(다른 프로젝트는 미설정 → 기존 동작.)

- [ ] **Step 3: 타입 통과 확인**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

- [ ] **Step 4: Commit**

```bash
git add src/registry/projects.ts
git commit -m "feat(shell): ProjectDefinition.mobileOnly + treazer 지정"
```

---

### Task 2: Stage + ControlBar — effective device 파생 & 토글 숨김

**Files:**
- Modify: `src/shell/Stage.tsx`
- Modify: `src/shell/ControlBar.tsx`

- [ ] **Step 1: Stage import에 getProject 추가**

`src/shell/Stage.tsx`의 `import { getProjectIdOfFeature } from '../registry';`를 교체:

```tsx
import { getProjectIdOfFeature, getProject } from '../registry';
```

- [ ] **Step 2: Stage에서 effective device 파생**

기존 구조분해 라인:
```tsx
  const { device, phoneFrame, browserChrome } = useShellStore();
```
을 아래로 교체(`device` → `rawDevice`):
```tsx
  const { device: rawDevice, phoneFrame, browserChrome } = useShellStore();
```

그리고 `const branding = getBranding(projectId);` 다음 줄에 추가:
```tsx
  const mobileOnly = !!(projectId && getProject(projectId)?.mobileOnly);
  const device = mobileOnly ? 'mobile' : rawDevice;
```

(이후 Stage의 모든 `device` 사용처 — `Comp` 선택, `device === 'desktop' ? ... : ...` 렌더 분기, `portrait={device === 'mobile'}`, 리셋 effect deps `[variant.id, device, langKey, ...]` — 는 이 파생 `device`를 그대로 사용한다. 추가 수정 불필요.)

- [ ] **Step 3: 키보드 단축키 — mobileOnly 반영**

키보드 핸들러의 `'d'`/`'D'`와 `'p'`/`'P'` case를 아래로 교체(데스크탑 토글은 mobileOnly면 무시, 폰프레임은 effective mobile이면 허용):

기존:
```tsx
        case 'd':
        case 'D':
          shell.toggleDevice();
          break;
```
↓
```tsx
        case 'd':
        case 'D':
          if (!mobileOnly) shell.toggleDevice();
          break;
```

기존:
```tsx
        case 'p':
        case 'P':
          if (shell.device === 'mobile') shell.togglePhoneFrame();
          break;
```
↓
```tsx
        case 'p':
        case 'P':
          if (mobileOnly || shell.device === 'mobile') shell.togglePhoneFrame();
          break;
```

그리고 이 키보드 `useEffect`의 deps 배열에 `mobileOnly`를 추가(최신 값 캡처): 기존 `[handlePlay, handleReset, handleStop]` → `[handlePlay, handleReset, handleStop, mobileOnly]`.

- [ ] **Step 4: ControlBar — mobileOnly 파생 + 데스크탑 토글 숨김**

`src/shell/ControlBar.tsx`에서, 기존 `const lang = ...` 블록 다음(또는 `projectId` 계산 다음)에 추가:

```tsx
  const mobileOnly = !!(projectId && getProject(projectId)?.mobileOnly);
  const effDevice = mobileOnly ? 'mobile' : device;
```

(`getProject`/`projectId`/`device`는 ControlBar에 이미 존재한다.)

그리고 디바이스 관련 3개 버튼 블록을 아래로 교체 — 데스크탑/모바일 토글은 `mobileOnly`면 숨기고, 폰/브라우저 프레임 조건은 `effDevice` 기준으로:

기존:
```tsx
        <BarButton onClick={toggleDevice} label={device === 'desktop' ? '모바일로 (D)' : '데스크탑으로 (D)'}>
          {device === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </BarButton>
        {device === 'mobile' && (
          <BarButton onClick={togglePhoneFrame} label="폰 프레임 (P)" active={phoneFrame}>
            <Frame className="h-4 w-4" />
          </BarButton>
        )}
        {device === 'desktop' && (
          <BarButton onClick={toggleBrowserChrome} label="브라우저 프레임 (B)" active={browserChrome}>
            <PanelTop className="h-4 w-4" />
          </BarButton>
        )}
```
↓
```tsx
        {!mobileOnly && (
          <BarButton onClick={toggleDevice} label={effDevice === 'desktop' ? '모바일로 (D)' : '데스크탑으로 (D)'}>
            {effDevice === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </BarButton>
        )}
        {effDevice === 'mobile' && (
          <BarButton onClick={togglePhoneFrame} label="폰 프레임 (P)" active={phoneFrame}>
            <Frame className="h-4 w-4" />
          </BarButton>
        )}
        {effDevice === 'desktop' && (
          <BarButton onClick={toggleBrowserChrome} label="브라우저 프레임 (B)" active={browserChrome}>
            <PanelTop className="h-4 w-4" />
          </BarButton>
        )}
```

- [ ] **Step 5: 타입 통과 + 전체 빌드**

Run: `npx tsc --noEmit`
Expected: 출력 없음(에러 0).

Run: `npm run build`
Expected: vite 빌드 성공(`✓ built`).

- [ ] **Step 6: 시각 확인 (dev 서버)**

`npm run dev` 후:
- **Treazer** → 아무 데모 진입: 폰(세로) UI로 렌더. 컨트롤 바에 데스크탑/모바일 토글 **없음**. `D` 키 무반응. 폰프레임 토글은 보임. 인트로/아웃트로 토글 ON 시 세로 9:16.
- **ARIA** → 데모 진입: 기존대로 데스크탑 기본 + 데스크탑/모바일 토글 동작. Treazer 본 뒤 ARIA로 가도 데스크탑 유지.

- [ ] **Step 7: Commit**

```bash
git add src/shell/Stage.tsx src/shell/ControlBar.tsx
git commit -m "feat(shell): mobileOnly 프로젝트 — effective device 파생 + 데스크탑 토글 숨김"
```

---

## 변경 파일 요약

| 파일 | 역할 |
|------|------|
| `registry/projects.ts` (수정) | `ProjectDefinition.mobileOnly` + treazer 지정 |
| `shell/Stage.tsx` (수정) | effective device 파생, 키보드 D 무시/P 보정 |
| `shell/ControlBar.tsx` (수정) | mobileOnly면 데스크탑 토글 숨김, 조건부 effective device 기준 |
