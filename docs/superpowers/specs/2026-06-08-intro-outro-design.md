# 데모 인트로/아웃트로 — 설계 (Phase 1)

날짜: 2026-06-08
프로젝트: Treasurer Content Inbox 데모 스튜디오 (`src/`)
상태: 승인됨

## 목적

데모 영상을 만들 때 **서비스별 브랜드 인트로/아웃트로**를 데모 앞뒤에 붙일 수 있게 한다.
이번 Phase 1은 **Treazer 인트로/아웃트로**를 제작하고, 재생 시퀀스에 통합하는 것까지다.
(Phase 2 = `getDisplayMedia` + `MediaRecorder` 기반 앱 내 녹화·다운로드. 이 spec 범위 밖.
 Phase 1의 `includeBranding` 토글과 시퀀스를 Phase 2가 그대로 재사용한다.)

전달 메시지: 인트로/아웃트로가 "금 시세 라인 → 로고" 테마로, 방금 추가한 Gold Price 기능 및
Treazer 브랜드("골드는 포인트가 아니라 자산")와 일관된 톤을 갖는다.

## 재생 흐름

```
[인트로/아웃트로 토글 = ON] ──Play──▶
  인트로(~2.5s) → 데모 시나리오(기존 자동재생) → 아웃트로(~3s)   (끊김없이 자동 연결)

[토글 = OFF] ──Play──▶ 데모 시나리오만 (현재와 동일)
```

- **토글**: ControlBar에 "인트로/아웃트로" 버튼. **브랜딩이 정의된 프로젝트에서만 노출**(현재 Treazer만).
- **기본값 OFF**: 평소 미리보기는 데모만. 녹화 시 켜서 완성본 생성.
- **풀스테이지 오버레이**: 인트로/아웃트로는 디바이스 프레임·배경 위를 덮는 전체 화면 연출(모바일/데스크탑 무관 동일). 인트로 페이드아웃 → 데모 노출, 데모 종료 → 아웃트로 페이드인.
- **스킵/중단**: 오버레이 재생 중 클릭으로 즉시 스킵(다음 단계로). Stop(정지)은 시퀀스 전체 취소 후 idle.

## 모션 (Treazer)

확정 방향: 인트로 C(금 시세 라인 → 로고), 아웃트로 O-A(브랜드 엔드카드).

- **인트로 (~2.5s)**: 다크 웜 배경(`TZ_BACKGROUND` 톤) → 금 시세 라인이 우상향으로 그려짐(stroke-dashoffset)
  → 끝점이 골드 코인으로 → `Treazer.`(오렌지 닷) 워드마크 페이드업 → `LEARN & EARN GOLD` 태그라인.
- **아웃트로 (~3s)**: 배경에 시세 라인 은은히 → 코인 + `Treazer.` 로고 + 태그라인 + `treazer.app` CTA 필 등장 → 홀드.
- **자산**: 기존 `src/demos/treazer/_shared/ui.tsx`의 `Wordmark`, `Coin`, `TZ_BACKGROUND`, `TZ_ORANGE` 재사용.
- **로컬라이즈 없음**: 태그라인·CTA는 브랜드 영문 고정(언어 무관).

## 아키텍처 & 파일

브랜딩은 "프로젝트별 자산"이므로 데모 로직·`projects.ts`(순수 데이터)와 분리된 레지스트리로 등록한다.

### 신규

- `src/branding/types.ts`
  ```ts
  export interface ProjectBranding {
    Intro: React.ComponentType;
    Outro: React.ComponentType;
    introMs: number;
    outroMs: number;
  }
  ```
- `src/branding/index.ts` — `{ treazer: treazerBranding }` 매핑 + `getBranding(projectId): ProjectBranding | undefined`.
- `src/demos/treazer/_shared/branding.tsx` — `TreazerIntro` / `TreazerOutro`(framer-motion) + `treazerBranding`(컴포넌트 + introMs 2500 / outroMs 3000).
- `src/shell/BrandOverlay.tsx` — 풀스테이지 absolute 오버레이. 주어진 phase 컴포넌트를 렌더하고, `durationMs` 타이머 만료 또는 클릭 스킵 시 `onDone` 호출. `AnimatePresence`로 페이드 in/out.

### 수정

- `src/store/shellStore.ts` — `includeBranding: boolean`(기본 false), `toggleBranding()` 추가.
- `src/shell/ControlBar.tsx` — `getBranding(projectId)`가 있으면 "인트로/아웃트로" 토글 버튼 노출(active=includeBranding). lucide 아이콘(예: `Clapperboard`/`Film`).
- `src/shell/Stage.tsx` — 시퀀스 오케스트레이션 + `seqPhase` 상태에 따라 `BrandOverlay` 렌더.

### 오케스트레이션 (Stage)

```
seqPhase: 'intro' | 'outro' | null   // 로컬 상태
phase(p): Promise  // seqPhase=p 설정, BrandOverlay onDone(타이머 또는 스킵)에서 resolve (ref에 resolver 저장)

handlePlay():
  branding = getBranding(projectId);
  if (includeBranding && branding) await phase('intro');
  await play(scenario, reset);            // 기존 데모; await로 종료 감지
  if (includeBranding && branding && !중단됨) await phase('outro');
  seqPhase = null;

handleStop()/리셋/변형·언어·디바이스 전환:
  진행 중 시퀀스 취소(pending phase resolver 정리) + seqPhase=null + 기존 stop/reset.
```

- `play()`는 abort 시 status를 바꾸지 않으므로, 중단 판정은 stop 호출 여부(플래그/ref)로 처리.
- 인트로 단계에서 `play`가 `reset()`을 호출하므로, 인트로가 떠 있는 동안 데모는 초기 상태로 준비됨(오버레이가 가림).

## 검증

- 토글 ON에서 Play → 인트로 → 데모 → 아웃트로 자동 연결, 토글 OFF에서 데모만.
- 토글은 Treazer에서만 노출, 다른 프로젝트에선 미노출.
- 오버레이 클릭 시 스킵, Stop 시 전체 취소.
- 모바일/데스크탑 양쪽에서 풀스테이지로 표시.
- `npm run build`(tsc --noEmit) 통과.

## 비목표 (Phase 1)

- 앱 내 녹화/파일 다운로드 (Phase 2).
- ARIA 등 다른 서비스의 인트로/아웃트로 (구조만 확장 가능하게, 콘텐츠는 별도).
- 인트로/아웃트로 길이·텍스트의 사용자 편집 UI.
