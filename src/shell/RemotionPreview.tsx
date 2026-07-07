import { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { DemoVideo } from '../../remotion/DemoVideo';
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from '../../remotion/meta';

/**
 * 앱 내 Remotion 미리보기 모달 — 프레임 기반 드라이버로 렌더되는 daily-quiz 영상을
 * 재생/스크럽한다. 렌더/다운로드 없이 tr-content 안에서 최종 결과와 동일한 구도를 확인.
 * 데모 컴포넌트를 그대로 재사용하며, 전역 store를 프레임 함수로 구동한다.
 */
export function RemotionPreview({ onClose }: { onClose: () => void }) {
  const playerRef = useRef<PlayerRef>(null);
  useEffect(() => {
    // 견고한 자동재생 — Player는 프레임 0에서 초기 버퍼링으로 정지하는 경우가 있어,
    // seek(1)로 한 번 unstick한 뒤 재생한다. 프레임이 실제 전진할 때까지 재시도, 3초 후 포기(수동 재생 가능).
    const iv = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      if (p.getCurrentFrame() > 1) {
        clearInterval(iv);
        return;
      }
      p.seekTo(1);
      p.play();
    }, 200);
    const stop = setTimeout(() => clearInterval(iv), 3000);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full max-w-[1120px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-wide text-white/70">
            Remotion 미리보기 · daily-quiz (프레임 기반)
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-3 py-1 text-[13px] font-medium text-white transition-colors hover:bg-white/20"
          >
            닫기 ✕
          </button>
        </div>
        <div className="overflow-hidden rounded-xl ring-1 ring-white/15 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]">
          <Player
            ref={playerRef}
            component={DemoVideo}
            durationInFrames={DURATION_IN_FRAMES}
            fps={FPS}
            compositionWidth={WIDTH}
            compositionHeight={HEIGHT}
            style={{ width: '100%' }}
            controls
            autoPlay
            loop
            acknowledgeRemotionLicense
          />
        </div>
        <p className="mt-2 text-center text-[11.5px] text-white/40">
          브라우저 실시간 재생 — 최종 mp4와 동일한 프레임 기반 타이밍. 스페이스바 재생/일시정지, 타임라인 드래그로 스크럽.
        </p>
      </div>
    </div>
  );
}
