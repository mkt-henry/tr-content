import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../src/shell/Background';
import { Camera } from '../src/shell/Camera';
import { FakeCursor } from '../src/shell/FakeCursor';
import { SpotlightCaption } from '../src/shell/SpotlightCaption';
import { usePlaybackStore } from '../src/engine/playbackStore';
import { useShellStore } from '../src/store/shellStore';
import type { Lang } from '../src/demos/findle/_shared/i18n';
import { localCenter } from '../src/lib/cameraGeom';
import { buildTimeline, computeFrameState } from './timeline';
import { resolveFindle } from './findleCompositions';

/**
 * 프레임 기반 데모 비디오 — 시나리오 진행(스텝·store·커서 타깃·클릭 펄스)을 프레임 F의
 * 순수 함수로 계산해 매 프레임 store를 재구성한다. featureId/variantId로 어떤 findle 데모든 렌더한다.
 * 벽시계(setTimeout/Date.now) 의존 없음 → 1프레임 = 정확히 1/fps.
 */
export const DemoVideo: React.FC<{ featureId: string; variantId: string; lang?: Lang }> = ({
  featureId,
  variantId,
  lang,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const resolved = resolveFindle(featureId, variantId);
  if (!resolved) throw new Error(`Unknown findle composition: ${featureId}/${variantId}`);
  const { feature, variant } = resolved;
  const Comp = feature.Desktop;

  // 언어를 buildTimeline 전에 동기 반영 — stream/type 스텝의 full 문자열이 올바른 언어로
  // 캡처되도록(timeline은 build 시점 textOf로 full을 1회 고정). getLang()은 store를 동기 조회하므로
  // 여기서 먼저 써두면 아래 useMemo가 정확한 언어로 빌드한다. 값이 다를 때만 써서(가드) 첫 마운트 외
  // 불필요한 store 알림을 막는다. (setState/getState는 훅이 아니라 조건 호출 안전)
  if (lang && useShellStore.getState().projectLang.findle !== lang) {
    useShellStore.setState((s) => ({ projectLang: { ...s.projectLang, findle: lang } }));
  }

  // 셸 스토어 구성 — feature/variant/device 반영. lang은 위에서 이미 동기 반영했으나 재확인.
  useLayoutEffect(() => {
    useShellStore.setState({
      featureId: feature.id,
      variantId: variant.id,
      device: 'desktop',
      ...(lang ? { projectLang: { ...useShellStore.getState().projectLang, findle: lang } } : {}),
    });
    usePlaybackStore.getState().setSpotlight(null);
  }, [feature.id, variant.id, lang]);

  const timeline = useMemo(() => buildTimeline(variant.scenario, fps), [variant.scenario, fps, lang]);
  const state = useMemo(() => computeFrameState(frame, timeline), [frame, timeline]);

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
  const lastPos = useRef({ x: width / 2, y: height * 0.7 });
  useLayoutEffect(() => {
    // 1) 커서 타깃 측정 (store 적용 전, 현재 DOM 기준). offset 체인이라 카메라 줌에도 불변.
    let pos = lastPos.current;
    if (state.cursorTarget && rootRef.current) {
      const el = document.querySelector<HTMLElement>(`[data-demo-id="${state.cursorTarget}"]`);
      if (el) pos = localCenter(el, rootRef.current);
    }
    lastPos.current = pos;
    usePlaybackStore.getState().setCursor({ x: pos.x, y: pos.y, pressed: state.pressed, visible: true });

    // 2) 데모 store 스냅샷 재구성 (리셋 → 이 프레임까지 run/progressive 순서대로). 멱등.
    feature.resetState();
    state.runs.forEach((r) => r());
    state.progressive.forEach((p) => p.apply(p.text));
  }, [frame, state, feature]);

  return (
    <AbsoluteFill>
      <div ref={rootRef} className="relative h-full w-full overflow-hidden bg-ink-950">
        <Background bg={variant.background} />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div
            className="relative flex flex-col overflow-hidden rounded-2xl bg-[#131216] ring-1 ring-white/10 shadow-[0_50px_140px_-20px_rgba(0,0,0,0.85)]"
            style={{ width: 'min(88vw, 138vh)', aspectRatio: '16 / 9.8' }}
          >
            <div className="relative min-h-0 flex-1">
              <Camera disabled={feature.chromeless}>
                <Comp device="desktop" />
              </Camera>
            </div>
          </div>
        </div>
        <FakeCursor />
        <SpotlightCaption rootRef={rootRef} />
      </div>
    </AbsoluteFill>
  );
};
