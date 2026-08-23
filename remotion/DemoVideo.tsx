import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../src/shell/Background';
import { BrowserChrome } from '../src/shell/BrowserChrome';
import { Camera } from '../src/shell/Camera';
import { FakeCursor } from '../src/shell/FakeCursor';
import { SpotlightCaption } from '../src/shell/SpotlightCaption';
import { usePlaybackStore } from '../src/engine/playbackStore';
import { useShellStore } from '../src/store/shellStore';
import { CAMERA_LAYER_ATTR, localCenter } from '../src/lib/cameraGeom';
import { ENTRANCE_EASE, VideoClockContext } from '../src/engine/videoClock';
import { cn } from '../src/lib/cn';
import { buildTimeline, computeFrameState, PULSE_RING_MS, ZOOM_MS } from './timeline';
import { resolveFindle } from './findleCompositions';

/**
 * DemoVideo 입력 props 스키마 — Remotion Studio 우측 패널에 토글/드롭다운으로 노출된다.
 * featureId/variantId/lang은 구조(어떤 데모/언어), browserChrome/device/phoneFrame은 앱 ControlBar의
 * 프레임 옵션과 동일한 온오프 컨트롤. (Remotion 4.0.485의 AnyZodObject가 zod v4를 지원.)
 */
export const demoVideoSchema = z.object({
  featureId: z.string(),
  variantId: z.string(),
  lang: z.enum(['ko', 'en']).optional(),
  /** 브라우저 프레임(주소창) 표시 — 데스크탑에서만 의미 */
  browserChrome: z.boolean(),
  /** 데스크탑/모바일 프레임 */
  device: z.enum(['desktop', 'mobile']),
  /** 모바일일 때 폰 목업 프레임 표시 */
  phoneFrame: z.boolean(),
});

export type DemoVideoProps = z.infer<typeof demoVideoSchema>;

/** 강조 캡션 등장 길이(ms) — SpotlightCaption의 인앱 transition duration과 같아야 한다. */
const CAPTION_IN_MS = 300;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * 프레임 기반 데모 비디오 — 시나리오 진행(스텝·store·커서 타깃·클릭 펄스)을 프레임 F의
 * 순수 함수로 계산해 매 프레임 store를 재구성한다. featureId/variantId로 어떤 데모든 렌더한다.
 * 벽시계(setTimeout/Date.now) 의존 없음 → 1프레임 = 정확히 1/fps.
 * 프레임(브라우저 크롬/디바이스/폰 프레임)은 앱 Stage와 동일한 마크업으로 렌더한다.
 */
export const DemoVideo: React.FC<DemoVideoProps> = ({
  featureId,
  variantId,
  lang,
  browserChrome,
  device,
  phoneFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const resolved = resolveFindle(featureId, variantId);
  if (!resolved) throw new Error(`Unknown composition: ${featureId}/${variantId}`);
  const { feature, variant, projectId } = resolved;
  const isMobile = device === 'mobile';
  const Comp = isMobile && feature.Mobile ? feature.Mobile : feature.Desktop;
  const url = variant.url ?? 'treasurer.co.kr/demo';
  const showChrome = browserChrome && !feature.chromeless;

  // 언어를 buildTimeline 전에 동기 반영 — stream/type 스텝의 full 문자열이 올바른 언어로
  // 캡처되도록(timeline은 build 시점 textOf로 full을 1회 고정). getLang()은 store를 동기 조회하므로
  // 여기서 먼저 써두면 아래 useMemo가 정확한 언어로 빌드한다. 값이 다를 때만 써서(가드) 첫 마운트 외
  // 불필요한 store 알림을 막는다. 언어 키는 데모 프로젝트별(projectLang[projectId])로 다르다.
  // (setState/getState는 훅이 아니라 조건 호출 안전)
  if (lang && useShellStore.getState().projectLang[projectId] !== lang) {
    useShellStore.setState((s) => ({ projectLang: { ...s.projectLang, [projectId]: lang } }));
  }

  // 셸 스토어 구성 — feature/variant/device 반영. lang은 위에서 이미 동기 반영했으나 재확인.
  useLayoutEffect(() => {
    useShellStore.setState({
      featureId: feature.id,
      variantId: variant.id,
      device,
      ...(lang ? { projectLang: { ...useShellStore.getState().projectLang, [projectId]: lang } } : {}),
    });
    usePlaybackStore.getState().setSpotlight(null);
  }, [feature.id, variant.id, lang, projectId, device]);

  const timeline = useMemo(() => buildTimeline(variant.scenario, fps), [variant.scenario, fps, lang]);
  const state = useMemo(() => computeFrameState(frame, timeline), [frame, timeline]);

  // videoStateKey를 제공하는 데모만 프레임 기반 등장 애니메이션을 쓴다.
  // 타임라인을 한 번 미리 재생해 "데모 상태가 바뀐 프레임" 목록을 뽑는다 — 이후 프레임마다
  // 그중 마지막 값을 기준점(sinceFrame)으로 주면 벽시계 없이 등장 진행도가 결정된다.
  // (store를 잠시 건드리지만 아래 레이아웃 이펙트가 매 프레임 올바른 상태로 다시 세우므로 무해)
  const changeFrames = useMemo(() => {
    const keyOf = feature.videoStateKey;
    if (!keyOf) return null;
    const frames: number[] = [];
    feature.resetState();
    let key = keyOf();
    for (const e of timeline.entries) {
      if (!e.run || e.actionFrame == null) continue;
      e.run();
      const next = keyOf();
      if (next !== key) {
        key = next;
        frames.push(e.actionFrame);
      }
    }
    feature.resetState();
    return frames;
  }, [timeline, feature]);

  const clock = useMemo(() => {
    if (!changeFrames) return null;
    let sinceFrame = 0;
    for (const cf of changeFrames) if (frame >= cf) sinceFrame = cf;
    return { frame, fps, sinceFrame };
  }, [changeFrames, frame, fps]);

  // Pretendard 폰트 로드 — CLI 렌더(폰트 없음)에선 완료까지 delayRender로 지연.
  // 앱 임베드(Player)에선 이미 로드돼 delayRender를 만들지 않는다(StrictMode 고아 핸들 방지).
  const [fontHandle] = useState(() =>
    typeof document !== 'undefined' && document.fonts?.check('16px "Pretendard Variable"')
      ? null
      : delayRender('Loading Pretendard'),
  );
  useEffect(() => {
    if (fontHandle == null) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      continueRender(fontHandle);
    };
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css';
    link.onload = () => document.fonts.ready.then(finish);
    link.onerror = finish;
    document.head.appendChild(link);
    const timer = setTimeout(finish, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);
  // 측정 전용 두 번째 패스. 아래 이펙트에서 데모 상태를 적용해도 그 결과가 DOM에 반영되는 건
  // 이 커밋이 끝난 뒤다 → 같은 패스에서 잰 위치는 프레임 F-1 기준이다. 순차 재생·통렌더에서는
  // F-1이 곧 직전 프레임이라 무해하지만, 타임라인을 임의 지점으로 점프하면(스크럽 검수) 커서와
  // 줌 원점이 엉뚱한 곳을 가리킨 채 멈춘다. 프레임마다 정확히 한 번 더 돌려 프레임 F의 DOM으로 다시 잰다.
  const [remeasure, setRemeasure] = useState(0);
  const measuredFor = useRef(-1);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const layer = root?.querySelector<HTMLElement>(`[${CAMERA_LAYER_ATTR}]`) ?? null;

    // 1) 데모 store 스냅샷 재구성 (리셋 → 이 프레임까지 run/progressive 순서대로). 멱등.
    feature.resetState();
    state.runs.forEach((r) => r());
    state.progressive.forEach((p) => p.apply(p.text));

    // 2) 스크롤 컨테이너 위치 재구성 — 모든 scroll 스텝을 순서대로 적용해 절대 위치를 확정한다.
    //    프레임마다 처음부터 다시 계산하므로 렌더 순서와 무관하게 결정론적이다.
    //    toId 목적지는 (현재 scrollTop + 자식과 컨테이너의 화면상 차이) = 자식의 콘텐츠 내 오프셋이라
    //    현재 스크롤 위치와 무관하다.
    const prevScroll = new Map<string, number>();
    for (const sc of state.scrolls) {
      const el = document.querySelector<HTMLElement>(`[data-demo-id="${sc.target}"]`);
      if (!el) continue;
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      let dest = sc.to === 'top' ? 0 : max;
      if (sc.toId) {
        const child = el.querySelector<HTMLElement>(`[data-demo-id="${sc.toId}"]`);
        // run.ts scrollContainer와 동일: 자식을 컨테이너 상단에서 12px 아래로 맞춘다.
        if (child) dest = el.scrollTop + (child.getBoundingClientRect().top - el.getBoundingClientRect().top) - 12;
      }
      dest = Math.max(0, Math.min(max, dest));
      const startAt = prevScroll.get(sc.target) ?? 0;
      const at = startAt + (dest - startAt) * sc.progress;
      el.scrollTop = at;
      prevScroll.set(sc.target, at);
    }

    // 3) 카메라·커서·캡션의 "이 프레임의 값"을 직접 계산한다.
    //    인앱은 framer-motion 스프링과 rAF로 벽시계에 맞춰 움직이지만, 영상은 프레임을 실시간과
    //    무관한 속도로 넘기므로 그 방식은 프레임 F의 그림을 결정하지 못한다(미리보기 ≠ 결과물의 원인).
    const centerIn = (host: HTMLElement | null, id: string | null | undefined) => {
      if (!host || !id) return null;
      const el = host.querySelector<HTMLElement>(`[data-demo-id="${id}"]`);
      return el ? localCenter(el, host) : null;
    };
    const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    });

    // 커서 — "이전 타깃 → 현재 타깃"을 이동 구간 진행도로 보간. 두 지점을 매 프레임 다시 재므로
    // 같은 프레임이면 항상 같은 위치가 나온다.
    const home = { x: width / 2, y: height * 0.7 }; // run.ts가 재생 시작 시 커서를 두는 지점
    const from = centerIn(root, state.cursorPrevTarget) ?? home;
    const to = centerIn(root, state.cursorTarget) ?? from;
    const moveFrames = state.cursorMoveEnd != null ? state.cursorMoveEnd - state.cursorSinceFrame : 0;
    const moveP = moveFrames > 0 ? clamp01((frame - state.cursorSinceFrame) / moveFrames) : 1;
    const pos = state.cursorTarget ? lerp(from, to, ENTRANCE_EASE(moveP)) : home;

    // 카메라 — 강조가 바뀐 프레임부터 ZOOM_MS 동안 배율·원점을 보간.
    // 원점은 첫 줌인이면 새 대상으로 스냅(인앱 Camera와 동일), 줌아웃 중에는 떠나온 지점을 유지한다.
    const zoomFrames = Math.max(1, Math.round((ZOOM_MS / 1000) * fps));
    const zoomP = ENTRANCE_EASE(clamp01((frame - state.spotlightSinceFrame) / zoomFrames));
    const targetScale = state.spotlightId ? state.spotlightScale : 1;
    const camScale = state.spotlightPrevScale + (targetScale - state.spotlightPrevScale) * zoomP;
    const oTo = centerIn(layer, state.spotlightId);
    const oFrom = centerIn(layer, state.spotlightPrevId);
    const camOrigin = oTo && oFrom ? lerp(oFrom, oTo, zoomP) : (oTo ?? oFrom);

    // 클릭 펄스 링 확산·강조 캡션 등장 진행도
    const ringFrames = Math.max(1, Math.round((PULSE_RING_MS / 1000) * fps));
    const pulse = state.pulseSinceFrame != null ? clamp01((frame - state.pulseSinceFrame) / ringFrames) : null;
    const capFrames = Math.max(1, Math.round((CAPTION_IN_MS / 1000) * fps));
    const caption = ENTRANCE_EASE(clamp01((frame - state.spotlightSinceFrame) / capFrames));

    const pb = usePlaybackStore.getState();
    pb.setFrameLock({ camScale, camOrigin, pulse, caption });
    pb.setCursor({ x: pos.x, y: pos.y, pressed: state.pressed, visible: true });
    pb.setSpotlight(state.spotlightId, state.spotlightCaption, state.spotlightScale);

    // 4) 이 프레임에 대해 딱 한 번, DOM이 갱신된 뒤 다시 재도록 한 패스를 더 돈다.
    if (measuredFor.current !== frame) {
      measuredFor.current = frame;
      setRemeasure((n) => n + 1);
    }
  }, [frame, state, feature, fps, width, height, remeasure]);

  // 컴포지션을 떠날 때 프레임 고정을 해제 — 같은 realm의 다른 컴포지션/플레이어에 남지 않게.
  useEffect(() => () => usePlaybackStore.getState().setFrameLock(null), []);

  return (
    <AbsoluteFill>
      <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-ink-950">
        <Background bg={variant.background} />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {!isMobile ? (
            // 데스크탑 프레임 — 앱 Stage와 동일. browserChrome이 켜지고 chromeless가 아니면 주소창 표시.
            <div
              className="relative flex flex-col overflow-hidden rounded-2xl bg-[#131216] ring-1 ring-white/10 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]"
              // vw/vh는 브라우저 창 기준이라 Studio 미리보기(창 크기)와 렌더(1920×1080)에서 다른 크기가 된다
              // → 미리보기와 결과물의 레이아웃이 어긋난다. 컴포지션 크기에서 직접 계산한다(앱 Stage의 min(88vw,138vh) 대응).
              style={{ width: Math.min(0.88 * width, 1.38 * height), aspectRatio: '16 / 9.8' }}
            >
              {showChrome && <BrowserChrome url={url} device="desktop" />}
              <div className="relative min-h-0 flex-1">
                <Camera disabled={feature.chromeless}>
                  <VideoClockContext.Provider value={clock}>
                    <Comp device="desktop" />
                  </VideoClockContext.Provider>
                </Camera>
              </div>
            </div>
          ) : (
            // 모바일 프레임 — 앱 Stage와 동일. phoneFrame이 켜지면 폰 목업(노치/홈바) 표시. 모바일엔 주소창 없음.
            <div
              className={cn(
                'relative',
                phoneFrame &&
                  'rounded-[3rem] bg-[#0c0b0e] p-[10px] ring-1 ring-white/15 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]',
              )}
            >
              {phoneFrame && (
                <div className="absolute left-1/2 top-[22px] z-30 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/[0.06]" />
              )}
              <div
                className={cn(
                  'relative flex flex-col overflow-hidden bg-[#131216]',
                  phoneFrame
                    ? 'rounded-[2.45rem]'
                    : 'rounded-2xl ring-1 ring-white/10 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]',
                )}
                // 위 데스크탑과 같은 이유로 vh를 쓰지 않는다 (앱 Stage의 min(90vh, 780px) 대응)
                style={{ height: Math.min(0.9 * height, 780), aspectRatio: '9 / 19.2' }}
              >
                <div className="relative min-h-0 flex-1">
                  <Camera>
                    <VideoClockContext.Provider value={clock}>
                      <Comp device="mobile" />
                    </VideoClockContext.Provider>
                  </Camera>
                </div>
                {phoneFrame && (
                  <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-white/30" />
                )}
              </div>
            </div>
          )}
        </div>
        <FakeCursor />
        <SpotlightCaption rootRef={rootRef} />
      </div>
    </AbsoluteFill>
  );
};
