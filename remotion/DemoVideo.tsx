import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import dailyQuiz from '../src/demos/findle/daily-quiz';
import { Background } from '../src/shell/Background';
import { Camera } from '../src/shell/Camera';
import { FakeCursor } from '../src/shell/FakeCursor';
import { SpotlightCaption } from '../src/shell/SpotlightCaption';
import { usePlaybackStore } from '../src/engine/playbackStore';
import { useShellStore } from '../src/store/shellStore';
import type { Lang } from '../src/demos/findle/_shared/i18n';
import { localCenter } from '../src/lib/cameraGeom';
import { buildTimeline, computeFrameState } from './timeline';

const feature = dailyQuiz;
const variant = feature.variants.find((v) => v.id === 'narrated') ?? feature.variants[0];

/**
 * 프레임 기반 데모 비디오 — 시나리오 진행(스텝·store·커서 타깃·클릭 펄스)을 프레임 F의
 * 순수 함수로 계산해 매 프레임 store를 재구성한다. 커서의 부드러운 이동과 컴포넌트 전환은
 * framer-motion 스프링이 담당(순차 렌더에서 결정론적). 벽시계(setTimeout/Date.now) 의존 없음
 * → 페이싱 보정 불필요, 1프레임 = 정확히 1/fps.
 */
export const DemoVideo: React.FC<{ lang?: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const Comp = feature.Desktop;

  // 셸 스토어 구성 — 마운트 시 1회 (렌더 밖 effect라 렌더 중 외부 컴포넌트 갱신 경고 없음)
  // lang이 주어지면(Studio/CLI 컴포지션) 프로젝트 언어를 고정한다. 미지정(앱 내 미리보기)이면
  // 건드리지 않아 앱의 현재 언어 토글을 그대로 따른다.
  useLayoutEffect(() => {
    useShellStore.setState({
      featureId: feature.id,
      variantId: variant.id,
      device: 'desktop',
      ...(lang
        ? { projectLang: { ...useShellStore.getState().projectLang, findle: lang } }
        : {}),
    });
    usePlaybackStore.getState().setSpotlight(null);
  }, [lang]);

  const timeline = useMemo(() => buildTimeline(variant.scenario, fps), [fps]);
  const state = useMemo(() => computeFrameState(frame, timeline), [frame, timeline]);

  // Pretendard 폰트 로드 — CLI 렌더(폰트 없음)에선 완료까지 delayRender로 지연한다.
  // 단, 앱 임베드(Player)에선 폰트가 이미 로드돼 있으므로 delayRender를 아예 만들지 않는다.
  // StrictMode가 useState 초기화를 2회 호출 → delayRender면 고아 핸들이 생겨 Player가 영구
  // 버퍼링되기 때문. (이미 로드 시 handle=null → 지연 없음)
  const [fontHandle] = useState(() =>
    typeof document !== 'undefined' && document.fonts?.check('16px "Pretendard Variable"')
      ? null
      : delayRender('Loading Pretendard'),
  );
  useEffect(() => {
    if (fontHandle == null) return; // 이미 로드됨 → 지연 불필요
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
    link.onerror = finish; // 실패해도 폴백 폰트로 진행 (렌더 멈춤 방지)
    document.head.appendChild(link);
    const timer = setTimeout(finish, 3000); // 안전 폴백 (onload 미발화 대비)
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 프레임 상태 적용 — 렌더 밖(useLayoutEffect)에서 store를 재구성한다. 렌더 중 전역 store를
  // 쓰면 외부 구독 컴포넌트를 렌더 중 갱신하게 되어 React 18이 렌더를 폐기·재시도(Player 정지)한다.
  // 커서 타깃은 현재 DOM(직전 프레임 화면)에서 측정 — 화면은 여러 프레임 안정적이라 1프레임 지연은 무시 가능.
  // 좌표 이동/펄스 애니메이션은 FakeCursor의 스프링이 담당한다.
  // 컴포지션 루트(AbsoluteFill 직속 div) — 커서/캡션 좌표의 기준 프레임.
  // FakeCursor·SpotlightCaption은 position:fixed라 Remotion 프리뷰의 축소 래퍼를 기준으로 배치된다.
  // 이 루트를 offset 기준으로 삼으면(=래퍼 원본 좌표계) 프리뷰 배율과 무관하게 정렬이 맞는다.
  // getBoundingClientRect(화면 픽셀)를 쓰면 Studio/Player의 scale만큼 커서가 어긋난다.
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
  }, [frame, state]);

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
